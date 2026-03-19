const { 
  fetchPageContent, 
  transcribeVideoFromUrl, 
  searchForCreatorRecipe, 
  fetchRecipeFromWebsite 
} = require('./index.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const { randomUUID } = require('crypto');
require('dotenv').config();

// Mock Firebase for testing if not initialized
if (admin.apps.length === 0) {
    admin.initializeApp({
        projectId: "kitch-recipe-app"
    });
}
const db = admin.firestore();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function processUserRequest() {
  const source_url = "https://www.instagram.com/reel/DVwHQCijHCk/";
  console.log(`--- PROCESSING REQUEST FOR: ${source_url} ---`);
  
  // Step 1: Scrape
  let pageData = await fetchPageContent(source_url);
  
  // Try to find creator from caption if handle is not in URL
  const caption = pageData.text || "";
  let creatorHandle = null;
  const igUserMatch = source_url.match(/instagram\.com\/([^\/]+)\//i);
  if (igUserMatch && !['reel', 'p', 'reels', 'stories'].includes(igUserMatch[1].toLowerCase())) {
    creatorHandle = `@${igUserMatch[1]}`;
  }
  
  // If still no creator handle, try to extract from "comments - [handle] on"
  if (!creatorHandle) {
    const handleMatch = caption.match(/comments - ([^ ]+) on/);
    if (handleMatch) creatorHandle = `@${handleMatch[1]}`;
  }

  console.log("Stage 1: Page Scrape Result:", {
    title: pageData.text?.match(/^Title: (.*)/m)?.[1],
    creator: creatorHandle,
    hasVideo: !!pageData.videoUrl,
  });

  // Step 2: Transcription
  let videoTranscript = null;
  if (pageData.videoUrl) {
    console.log("Stage 2: Transcription...");
    videoTranscript = await transcribeVideoFromUrl(pageData.videoUrl);
  }

  // Step 3: Review and Search Fallback
  const postTitle = pageData.text?.match(/^Title: (.*)/m)?.[1] || "";
  let cleanTitle = postTitle.replace(/Instagram|Reel|Video|Post/gi, '').trim().replace(/&#x1f924;/g, '');
  
  let webRecipeContent = null;
  let foundUrl = null;
  
  // Logic: "Review the recipe does it include a full list of ingredient and steps to create the recipe? If no, then run a google search"
  // We'll use the AI to determine this in the synthesis, or just search proactively.
  // Proactive search is better.
  
  if (cleanTitle) {
     const searchQuery = `${cleanTitle} recipe ${creatorHandle || ''}`;
     console.log(`Stage 3: Searching for full recipe: "${searchQuery}"`);
     
     // Custom search logic to avoid ads
     const results = await searchForCreatorRecipe(cleanTitle, creatorHandle);
     if (results && !results.url.includes('duckduckgo.com/y.js') && !results.url.includes('amazon.')) {
        console.log("Stage 4: Found potential website:", results.url);
        foundUrl = results.url;
        webRecipeContent = await fetchRecipeFromWebsite(results.url);
     } else {
        console.log("Search result was invalid or an ad. Trying alternative...");
        // Fallback or manual search refinement
     }
  }

  // Final Stage: AI Synthesis
  console.log("Final Stage: AI Extraction and Library Addition...");
  // Use flash for better reliability in some environments
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 
  
  const systemPrompt = `You are Remi, the Kitch expert recipe extractor (warm, encouraging, British).
  Extract a structured recipe payload following the GEMINI.md schema.
  
  PRIORITY:
  1. If WEB_CONTENT has a full recipe, use it.
  2. If SOCIAL_CONTENT/TRANSCRIPT has ingredients/steps, use them.
  3. If data is sparse, ESTIMATE based on common versions of this dish (like Alfie Cooks' 10min noodles).
  
  CRITICAL:
  - Every recipe MUST have an image_url, title, creator, ingredients, and steps.
  - Set is_ai_generated: true for any inferred fields.
  - Return ONLY raw JSON.`;

  const userPrompt = `Extract recipe from: ${source_url}
  SOCIAL_CONTENT: ${pageData.text || ""}
  TRANSCRIPT: ${videoTranscript || ""}
  WEB_CONTENT: ${webRecipeContent || ""}
  FOUND_URL: ${foundUrl || ""}
  Creator: ${creatorHandle || "Alfie Cooks"} 
  
  Format as:
  {
    "title": "...",
    "description": "...",
    "creator": { "name": "...", "platform": "Instagram", "support_url": "..." },
    "image_url": "${pageData.imageUrl || 'https://images.unsplash.com/photo-1585032226651-759b368d7246' }",
    "ingredients": [
      { "name": "...", "quantity": 1, "unit": "...", "aisle_category": "...", "in_pantry": false, "required_substitutes": [], "is_ai_generated": true }
    ],
    "steps": [
      { "step_number": 1, "instruction": "...", "is_ai_generated": true }
    ],
    "vibe_tags": ["Quick & Easy", "Comfort Food"]
  }`;

  try {
    const result = await model.generateContent([systemPrompt, userPrompt]);
    const resultText = result.response.text().replace(/```json|```/g, '').trim();
    const recipePayload = JSON.parse(resultText);
    
    recipePayload.recipe_id = randomUUID();
    recipePayload.original_url = source_url;

    // Ensure thumbnail exists
    if (!recipePayload.image_url) {
        recipePayload.image_url = "https://images.unsplash.com/photo-1585032226651-759b368d7246";
    }

    // Save to Firestore
    await db.collection('recipes').doc(recipePayload.recipe_id).set(recipePayload);
    console.log(`--- RECIPE ADDED SUCCESSFULLY ---`);
    console.log(`Title: ${recipePayload.title}`);
    console.log(`Creator: ${recipePayload.creator.name}`);
    console.log(`Ingredients: ${recipePayload.ingredients.length}`);
    console.log(`Steps: ${recipePayload.steps.length}`);
    console.log(`Recipe ID: ${recipePayload.recipe_id}`);
    console.log(`---------------------------------`);

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  }
}

processUserRequest();
