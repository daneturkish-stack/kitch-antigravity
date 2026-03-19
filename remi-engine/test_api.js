const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

async function testExtraction(ai, modelName, source_url) {
  try {
    console.log(`\nTesting extraction with model: ${modelName} and URL: ${source_url}...`);
    
    // 1. Platform Detection & Data Extraction (Copy from index.js)
    let extractedText = "";
    const { data: html } = await axios.get(source_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(html);
    extractedText = $('meta[property="og:description"]').attr('content') || "";
    
    if (!extractedText) {
       console.log("FAILED to extract metadata from Instagram.");
       return false;
    }
    console.log("Extracted Metadata:", extractedText);

    // 2. Gemini Integration
    const model = ai.getGenerativeModel({ model: modelName });
    const prompt = `You are Remi, an expert culinary AI. Extract a structured recipe from this social media metadata.
    Metadata: ${extractedText}
    Original URL: ${source_url}

    Return ONLY a JSON object:
    {
      "title": "string",
      "ingredients": [
        { "name": "string", "quantity": number, "unit": "string", "aisle_category": "string", "is_ai_generated": true }
      ],
      "steps": [
        { "step_number": integer, "instruction": "string", "is_ai_generated": true }
      ],
      "vibe_tags": ["string"]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log(`SUCCESS for ${modelName}:`, responseText);
    return true;
  } catch (error) {
    console.log(`FAILED for ${modelName}:`, error.message);
    return false;
  }
}

async function runTests() {
  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const url = "https://www.instagram.com/reel/DVKYpnHDPtP/?igsh=MWlodzVnMGQwd3ozbw==";
  await testExtraction(ai, "gemini-2.5-flash", url);
}

runTests();
