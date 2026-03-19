const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const { YoutubeTranscript } = require('youtube-transcript');
const pLimit = require('p-limit');
const { writeFile, unlink, readFile } = require('node:fs/promises');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('crypto');
require('dotenv').config();

const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const execAsync = promisify(exec);

// Initialize AI Clients
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Remi Engine' });
});

/**
 * Robust Page Content Extraction
 */
async function fetchPageContent(url) {
    let currentUrl = url;
    let isInstagram = /instagram\.com\//i.test(url);
    
    try {
        let response = await fetch(currentUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
            redirect: "follow",
        });

        let html = await response.text();
        
        // Check if we hit a login wall or empty page
        if (isInstagram && (html.length < 50000 || !html.includes('og:description'))) {
            console.log("Instagram block detected or empty metadata. Trying embed fallback...");
            const embedUrl = url.endsWith('/') ? `${url}embed/captioned/` : `${url}/embed/captioned/`;
            const embedResponse = await fetch(embedUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" }
            });
            if (embedResponse.ok) {
                html = await embedResponse.text();
                console.log("Embed fallback successful, length:", html.length);
            }
        }

        const extractedContent = [];
        let imageUrl = null;
        let videoUrl = null;
        let avatarUrl = null;

        // 1. Extract metadata (og:image, og:video, og:description)
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        if (ogImageMatch) imageUrl = decodeHtmlEntities(ogImageMatch[1]);

        const ogVideoMatch = html.match(/<meta[^>]*property=["']og:video["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:video["']/i) ||
                             html.match(/<meta[^>]*property=["']og:video:url["'][^>]*content=["']([^"']+)["']/i);
        if (ogVideoMatch) videoUrl = decodeHtmlEntities(ogVideoMatch[1]);

        const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
        if (ogDescMatch) extractedContent.push(`Post Content: ${decodeHtmlEntities(ogDescMatch[1])}`);

        // 2. Search for JSON patterns in script tags
        const jsonPatterns = [
            /"video_url"\s*:\s*"([^"]+)"/,
            /"display_url"\s*:\s*"([^"]+)"/,
            /"profile_pic_url"\s*:\s*"([^"]+)"/,
            /"profile_pic_url_hd"\s*:\s*"([^"]+)"/,
            /"profile_image_url"\s*:\s*"([^"]+)"/,
            /"caption"\s*:\s*"(.*?)"/,
            /"contentUrl"\s*:\s*"([^"]+)"/
        ];

        for (const pattern of jsonPatterns) {
            try {
              const regex = new RegExp(pattern, 'gi');
              const matches = [...html.matchAll(regex)];
              for (const match of matches) {
                if (match && match[1]) {
                    const val = match[1].replace(/\\u0026/g, '&').replace(/\\/g, '');
                    if (pattern.toString().includes('video_url')) videoUrl = val;
                    if (pattern.toString().includes('contentUrl') && !videoUrl) videoUrl = val;
                    if (pattern.toString().includes('display_url') && !imageUrl) imageUrl = val;
                    if (pattern.toString().includes('profile_pic_url')) avatarUrl = val;
                    if (pattern.toString().includes('caption')) extractedContent.push(`Alt Caption: ${val}`);
                }
              }
            } catch(e) {}
        }

        // 3. Robust JSON-LD parsing
        const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi);
        for (const match of jsonLdMatches) {
          try {
            const jsonData = JSON.parse(match[1]);
            const items = Array.isArray(jsonData) ? jsonData : [jsonData];
            for (const item of items) {
              if (item.description) extractedContent.push(`Structured Desc: ${item.description}`);
              if (item.caption) extractedContent.push(`Caption: ${item.caption}`);
              if (item.name && !item['@type']?.includes('Person')) extractedContent.push(`Title: ${item.name}`);
              if (item.thumbnailUrl && !imageUrl) imageUrl = item.thumbnailUrl;
              if (item.contentUrl && !videoUrl) videoUrl = item.contentUrl;
            }
          } catch(e) {}
        }

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        let finalTitle = titleMatch ? decodeHtmlEntities(titleMatch[1]) : "";
        
        // If title is generic, try to get it from the caption
        if (isInstagram && (!finalTitle || /Instagram/i.test(finalTitle))) {
          const captionMatch = html.match(/"caption"\s*:\s*"(.*?)"/) || html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (captionMatch && captionMatch[1]) {
            let captionText = decodeHtmlEntities(captionMatch[1]);
            
            // For Reels, strip "likes, comments - handle on date: "
            if (captionText.includes(': "')) {
              captionText = captionText.split(': "')[1];
            } else if (captionText.includes(': ')) {
              const parts = captionText.split(': ');
              if (parts[0].includes('likes')) {
                captionText = parts.slice(1).join(': ');
              }
            }

            const firstLine = captionText.split('\n')[0].split('.')[0].trim();
            if (firstLine.length > 3) {
              finalTitle = firstLine.replace(/^["']|["']$/g, '');
            }
          }
        }
        
        extractedContent.push(`Title: ${finalTitle}`);
        extractedContent.push(`Page Title: ${titleMatch ? titleMatch[1] : ""}`);

        return {
            text: extractedContent.join('\n\n'),
            imageUrl,
            videoUrl,
            avatarUrl,
        };
    } catch (error) {
        console.error("Error fetching page content:", error);
        return { text: null, imageUrl: null, videoUrl: null, avatarUrl: null };
    }
}

/**
 * AI Video Transcription
 */
async function transcribeVideoFromUrl(videoUrl) {
    const tempId = randomUUID();
    const tempDir = os.tmpdir();
    const videoPath = path.join(tempDir, `video_${tempId}.mp4`);
    const audioPath = path.join(tempDir, `audio_${tempId}.mp3`);

    try {
        console.log(`Downloading video for transcription: ${videoUrl.substring(0, 100)}...`);
        const response = await axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            headers: { 
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
                "Accept": "*/*"
            },
            timeout: 30000 // 30s timeout
        });

        await writeFile(videoPath, Buffer.from(response.data));
        console.log(`Extracting audio...`);
        // Use -q:a 9 for smaller file size, Whisper has 25MB limit
        await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame -q:a 9 -y "${audioPath}" 2>/dev/null`);

        const audioBuffer = await readFile(audioPath);
        console.log(`Audio size: ${Math.round(audioBuffer.length / 1024)} KB`);
        
        const audioFile = new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" });

        console.log(`Transcribing with Whisper...`);
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: "en"
        });

        await unlink(videoPath).catch(() => {});
        await unlink(audioPath).catch(() => {});
        return transcription.text;
    } catch (error) {
        console.error("Transcription error:", error.message);
        await unlink(videoPath).catch(() => {});
        await unlink(audioPath).catch(() => {});
        return null;
    }
}

/**
 * Normalization Helpers
 */
function normalizeHandle(handle) {
  if (!handle) return '';
  return handle.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9]/g, '');
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '').toLowerCase();
  } catch { return ''; }
}

function checkDomainMatchesCreator(domain, creatorHandle) {
  if (!domain || !creatorHandle) return false;
  const h = normalizeHandle(creatorHandle);
  const d = domain.replace(/\.[a-z]+$/, '').replace(/[^a-z0-9]/g, '');
  return d.includes(h) || h.includes(d);
}

/**
 * Web Search Fallback (DDG Scraping)
 */
async function performWebSearch(query) {
    console.log(`Search Query: ${query}`);
    try {
        const encodedQuery = encodeURIComponent(query);
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;
        // Brief delay to be polite
        await new Promise(r => setTimeout(r, 1000));
        
        const { data: html } = await axios.get(searchUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        const $ = cheerio.load(html);
        const results = [];
        $('.result__body').each((i, el) => {
            if (i < 5) {
                let url = $(el).find('.result__a').attr('href');
                
                // Decode DuckDuckGo redirect URLs
                if (url && url.includes('uddg=')) {
                  try {
                    const match = url.match(/uddg=([^&]+)/);
                    if (match) {
                      url = decodeURIComponent(match[1]);
                    }
                  } catch (e) {}
                }

                results.push({
                    url: url,
                    title: $(el).find('.result__a').text().trim(),
                    snippet: $(el).find('.result__snippet').text().trim()
                });
            }
        });
        console.log(`Found ${results.length} search results`);
        return results;
    } catch (e) {
        console.error("Web Search Error:", e.message);
        return [];
    }
}

async function searchForCreatorRecipe(recipeName, creatorHandle) {
  if (!recipeName || recipeName.length < 5) return null;
  
  let cleanName = recipeName;
  if (cleanName.length > 60) {
    cleanName = cleanName.substring(0, 60).split(' ').slice(0, -1).join(' ');
  }

  const creator = creatorHandle ? creatorHandle.replace('@', '') : '';
  const query = `${cleanName} recipe ${creator}`;
  const results = await performWebSearch(query);
  
  if (creator) {
    for (const res of results) {
      const domain = extractDomain(res.url);
      if (checkDomainMatchesCreator(domain, creator)) {
        console.log(`Found creator-domain match: ${domain}`);
        return res;
      }
    }
  }
  
  return results[0] || null;
}

async function fetchRecipeFromWebsite(url) {
  if (!url) return null;
  try {
    console.log(`Fetching recipe from website: ${url}`);
    const { data: html } = await axios.get(url, { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 15000
    });
    const $ = cheerio.load(html);
    
    // 1. Try JSON-LD
    const jsonLdScripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < jsonLdScripts.length; i++) {
        try {
            const json = JSON.parse($(jsonLdScripts[i]).html());
            const items = Array.isArray(json) ? json : [json];
            const recipe = items.find(item => 
                item['@type'] === 'Recipe' || 
                (item['@graph'] && item['@graph'].find(g => g['@type'] === 'Recipe'))
            );
            if (recipe) {
                console.log("Found structured recipe data on website");
                return JSON.stringify(recipe);
            }
        } catch(e) {}
    }

    // 2. Fallback to extracting text from common recipe containers
    const containers = $('.recipe-ingredients, .ingredients, .recipe-instructions, .instructions, [class*="recipe-card"], article');
    if (containers.length > 0) {
        return containers.text().substring(0, 10000).replace(/\s+/g, ' ').trim();
    }

    return $('body').text().substring(0, 5000).replace(/\s+/g, ' ').trim();
  } catch (e) { 
    console.error(`Website fetch error: ${e.message}`);
    return null; 
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            if (error.message.includes('429') && i < retries - 1) {
                // Exponential backoff with jitter: 2s, 4s, 8s, 16s...
                const wait = Math.pow(2, i + 1) * 1000 + Math.random() * 2000;
                console.warn(`[AI] Quota hit (429). Retrying in ${Math.round(wait)}ms (Attempt ${i + 1}/${retries})...`);
                await sleep(wait);
                continue;
            }
            throw error;
        }
    }
}

app.post('/api/scrape', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Incoming scrape request for URL: ${req.body.source_url}`);
    const { source_url, user_id, is_pro_user } = req.body;

    if (!source_url || !user_id) {
        return res.status(400).json({ error: 'Missing source URL or User ID' });
    }

    try {
        const instagramPattern = /instagram\.com\//i;
        const tiktokPattern = /tiktok\.com/i;
        const youtubePattern = /youtube\.com|youtu\.be/i;
        
        let platform = "Social Media";
        if (instagramPattern.test(source_url)) platform = "Instagram";
        else if (tiktokPattern.test(source_url)) platform = "TikTok";
        else if (youtubePattern.test(source_url)) platform = "YouTube";

        // 1. Content Extraction
        const pageData = await fetchPageContent(source_url);
        
        let creatorHandle = null;
        const igUserMatch = source_url.match(/instagram\.com\/([^\/]+)\//i);
        if (igUserMatch && !['reel', 'p', 'reels', 'stories'].includes(igUserMatch[1].toLowerCase())) {
          creatorHandle = `@${igUserMatch[1]}`;
        }
        if (!creatorHandle) {
          const atMatch = source_url.match(/@([\w.]+)/);
          if (atMatch) creatorHandle = `@${atMatch[1]}`;
        }

        // 2. Transcription
        let videoTranscript = null;
        if (platform === 'YouTube') {
            try {
                const transcriptItems = await YoutubeTranscript.fetchTranscript(source_url);
                if (transcriptItems) videoTranscript = transcriptItems.map(item => item.text).join(' ');
            } catch (e) {
                console.log("YouTube transcript failed:", e.message);
            }
        }
        
        if (!videoTranscript && pageData.videoUrl) {
            console.log("Attempting transcription from video URL...");
            videoTranscript = await transcribeVideoFromUrl(pageData.videoUrl);
        }

        // 3. Completeness Check & Search Fallback
        const combinedSocialContent = `${pageData.text || ""}\n\n${videoTranscript || ""}`;
        let webRecipeContent = null;
        let foundUrl = null;
        let isContentSufficient = false;

        console.log("Checking if social content is sufficient...");
        try {
            const checkModel = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
            const sufficiencyPrompt = `Analyze if the following text contains a complete recipe (Ingredients AND Instructions).
            Return exactly "COMPLETE" if it has both, or "INCOMPLETE" if something is missing.
            
            TEXT: ${combinedSocialContent.substring(0, 2000)}`;
            const sufficiencyResult = await generateWithRetry(checkModel, sufficiencyPrompt);
            const status = sufficiencyResult.response.text().trim().toUpperCase();
            isContentSufficient = status.includes("COMPLETE");
            console.log(`AI completeness check: ${status}`);
        } catch (aiError) {
            console.warn(`AI check failed: ${aiError.message} defaulting to length-based heuristic.`);
            const hasIngredients = /ingredient|tbsp|tsp|cup|grams|ml|quantities/gi.test(combinedSocialContent);
            const hasMethod = /method|instruction|step|directions|procedure|cook/gi.test(combinedSocialContent);
            isContentSufficient = (combinedSocialContent.length > 500 && hasIngredients && hasMethod);
        }

        if (!isContentSufficient) {
            console.log("Content insufficient. Triggering search fallback...");
            const postTitleMatch = pageData.text?.match(/^Title: (.*)/m) || pageData.text?.match(/^Page Title: (.*)/m);
            const postTitle = postTitleMatch ? postTitleMatch[1] : "";
            let cleanTitle = decodeHtmlEntities(postTitle).replace(/Instagram|Reel|Video|Post/gi, '').trim();
            
            if (cleanTitle.length > 60) {
                cleanTitle = cleanTitle.substring(0, 60).split(' ').slice(0, -1).join(' ');
            }

            if (cleanTitle && cleanTitle.length > 5) {
               console.log(`Searching for full recipe for: "${cleanTitle}" by ${creatorHandle}`);
               const searchResult = await searchForCreatorRecipe(cleanTitle, creatorHandle);
               if (searchResult) {
                 foundUrl = searchResult.url;
                 webRecipeContent = await fetchRecipeFromWebsite(searchResult.url);
               }
            }
        } else {
            console.log("Skipping search fallback: Social content is sufficient.");
        }

        // 4. AI Structured Extraction
        const extractionModel = ai.getGenerativeModel({ model: "gemini-2.5-flash" }); 
        const systemPrompt = `You are an expert recipe extractor. 
        Extract a structured recipe from the provided content sources.
        
        PRIORITY HIERARCHY:
        1. WEB_CONTENT: If provided, this is the most accurate source for measurements.
        2. SOCIAL_CONTENT: Use this for the "vibe" and if WEB_CONTENT is missing.
        
        OUTPUT FORMAT (JSON ONLY):
        {
          "title": "Short Recipe Name",
          "category": "Breakfast/Lunch/Drinks/Desserts",
          "prepTime": 10,
          "cookTime": 20,
          "servings": 2,
          "ingredients": [
            { "name": "item", "amount": "1", "unit": "cup", "aisle_category": "Produce" }
          ],
          "instructions": [
            { "step_number": 1, "text": "Instruction text" }
          ],
          "vibe_tags": ["tag1"],
          "confidence": "high/medium/low",
          "isEstimated": false,
          "creator": {
            "name": "Creator Name",
            "platform": "Instagram",
            "handle": "@handle"
          }
        }`;

        const userPrompt = `
        SOCIAL_CONTENT: ${combinedSocialContent.substring(0, 4000)}
        WEB_CONTENT: ${webRecipeContent ? webRecipeContent.substring(0, 5000) : "None"}
        CREATOR: ${creatorHandle || "Unknown"}
        URL: ${foundUrl || source_url}
        `.trim();

        console.log("Sending extraction request to AI...");
        const result = await generateWithRetry(extractionModel, [systemPrompt, userPrompt]);
        const resultText = result.response.text().replace(/```json|```/g, '').trim();
        const responseJson = JSON.parse(resultText);

        const recipe_id = randomUUID();
        const recipePayload = {
            recipe_id,
            original_url: source_url,
            imageUrl: pageData.imageUrl || null,
            creatorAvatar: pageData.avatarUrl || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...responseJson,
        };

        // Save to Firestore
        await db.collection('recipes').doc(recipe_id).set(recipePayload);
        console.log(`Saved recipe ${recipe_id} to Firestore`);
        
        // Register scrape in user doc if free user
        if (!is_pro_user) {
            await db.collection('users').doc(user_id).set({ 
                free_scrapes: admin.firestore.FieldValue.increment(1) 
            }, { merge: true });
        }

        res.json({ data: recipePayload });
    } catch (error) {
        console.error("Scrape error:", error);
        res.status(500).json({ error: `Extraction failed: ${error.message}` });
    }
});

/**
 * Remi AI Persona & System Prompt
 */
const REMI_SYSTEM_PROMPT = `You are Remi, a warm, encouraging, and slightly cheeky British sous-chef. 
Your goal is to help the user master their kitchen. You have access to their recipe library, pantry, and Dietary DNA.

Voice/Persona:
- Use British English (e.g., "brilliant", "spot of tea", "mate", "proper good").
- Be encouraging but professional about culinary techniques.
- If asked a question about a recipe, check the context provided.
- If asked "What can I cook?", look at their pantry items and suggest recipes from their library.

Capabilities:
- Recipe extraction (already handled by /api/scrape).
- Culinary advice.
- Meal planning based on pantry and Dietary DNA (e.g., Vegetarian, Gluten-Free).
- Ingredient substitution.

Formatting: Use markdown for structure. Keep responses concise but helpful.`;

app.post('/api/remy/chat', async (req, res) => {
    const { message, user_id, history, context_recipes, pantry_items, dietary_dna } = req.body;
    if (!message || !user_id) return res.status(400).json({ error: 'Missing message or user_id' });

    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chatContext = `
        USER DIETARY DNA: ${JSON.stringify(dietary_dna || {})}
        USER PANTRY: ${JSON.stringify(pantry_items || [])}
        USER RECIPES: ${JSON.stringify((context_recipes || []).map(r => r.title))}
        HISTORY: ${JSON.stringify(history || [])}
        `.trim();

        const result = await model.generateContent(`${REMI_SYSTEM_PROMPT}\n\nCONTEXT:\n${chatContext}\n\nUSER: ${message}`);
        res.json({ text: result.response.text() });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ error: 'Remi skipped out of the kitchen. Try again.' });
    }
});

app.post('/api/recipes/search', async (req, res) => {
    const { query: searchQuery, user_id } = req.body;
    try {
        const snapshot = await db.collection('recipes').get(); // In a real app, use indexed search
        const allRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`Filter these recipes for: "${searchQuery}". 
        RECIPES: ${JSON.stringify(allRecipes.map(r => ({ id: r.id, title: r.title, vibes: r.vibe_tags })))}
        Return ONLY a JSON array of matching IDs: ["id1", "id2"]`);
        
        const matchingIds = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
        const filtered = allRecipes.filter(r => matchingIds.includes(r.id));
        res.json({ data: filtered });
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.post('/api/pantry/categorize', async (req, res) => {
    const { name } = req.body;
    try {
        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`Categorize this ingredient: "${name}". 
        Options: Produce, Protein, Dairy, Pantry, Bakery, Frozen, Other.
        Return ONLY the category name.`);
        res.json({ category: result.response.text().trim() });
    } catch (error) {
        res.json({ category: 'Pantry' });
    }
});

app.post('/api/recipes/pantry-match', async (req, res) => {
    const { user_id, pantry_items } = req.body;
    try {
        const snapshot = await db.collection('recipes').get();
        const allRecipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(`Based on these pantry items: ${JSON.stringify(pantry_items)}, 
        which of these recipes can the user cook now or with minimal extra ingredients?
        RECIPES: ${JSON.stringify(allRecipes.map(r => ({ id: r.id, title: r.title, ingredients: r.ingredients.map(i => i.name) })))}
        Return ONLY a JSON array of matching IDs: ["id1", "id2"]`);

        const matchingIds = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
        const filtered = allRecipes.filter(r => matchingIds.includes(r.id));
        res.json({ data: filtered });
    } catch (error) {
        res.status(500).json({ error: 'Pantry matching failed' });
    }
});

/**
 * The Ghost Rule - Pantry Sync Checker
 */
app.post('/api/pantry/sync', async (req, res) => {
  const { user_id, ingredients } = req.body;
  if (!user_id || !ingredients) return res.status(400).json({ error: 'Invalid payload' });

  try {
    const pantrySnapshot = await db.collection('users').doc(user_id).collection('pantry').get();
    const pantryItems = pantrySnapshot.docs.map(doc => doc.data().name.toLowerCase());

    const syncedIngredients = ingredients.map(ing => ({
      ...ing,
      in_pantry: pantryItems.includes(ing.name.toLowerCase())
    }));

    res.json({ data: syncedIngredients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ghost Sync failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Remi Engine listening on port ${port} (0.0.0.0)`);
});

module.exports = {
    fetchPageContent,
    transcribeVideoFromUrl,
    performWebSearch,
    searchForCreatorRecipe,
    fetchRecipeFromWebsite
};
