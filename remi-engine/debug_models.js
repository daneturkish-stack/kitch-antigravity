const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the generative-ai SDK for web easily, 
    // but let's try a simple generation with "gemini-pro"
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello!");
    console.log("Gemini Pro says:", result.response.text());
  } catch (e) {
    console.error("Gemini Pro Test Failed:", e.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    console.log("Gemini 1.5 Flash says:", result.response.text());
  } catch (e) {
    console.error("Gemini 1.5 Flash Test Failed:", e.message);
  }
}

listModels();
