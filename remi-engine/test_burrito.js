const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testBurritoExtraction() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fullMetadata = `76K likes, 369 comments - plantyou on February 15, 2026: "Do you meal prep? If so - this is one to save. The full recipe for these burritos can be found by googlin’ PlantYou chipotle burritos! #burritos #mealprep #plantbased". 
  SEARCH RESULTS:
  PlantYou's chipotle burritos ingredients:
  Sauce: ¾ cups cashews, ½ cup plant milk, salt, maple syrup, lime, 2 chipotle peppers in adobo.
  Filling: 1 block firm tofu, 1 onion, 3 garlic cloves, 1 bell pepper, soy sauce, taco seasoning, tomato paste, paprika, cumin.
  Steps: 1. Blend sauce. 2. Sauté veg and tofu with spices. 3. Assemble in tortillas.`;

  const prompt = `You are Remi, an expert culinary AI. Extract a structured recipe from this metadata. 
  IMPORTANT: If the metadata does NOT contain clear ingredients or cooking steps, DO NOT HALUCINATE. 
  Instead, return only: {"error": "INSUFFICIENT_DATA", "suggested_query": "search query"}.
  
  Metadata: ${fullMetadata}
  Original URL: https://www.instagram.com/reel/DUyv0xpEds6/

  If data is sufficient, return ONLY a JSON object:
  {
    "title": "string",
    "ingredients": [
      { "name": "string", "quantity": number, "unit": "string", "aisle_category": "string", "is_ai_generated": true }
    ],
    "steps": [
      { "step_number": integer, "instruction": "string", "is_ai_generated": true }
    ],
    "vibe_tags": ["string"],
    "image_url": "string",
    "creator": { "name": "string", "avatar_url": "string", "platform": "string" }
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Gemini Output:\n", response.text());
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testBurritoExtraction();
