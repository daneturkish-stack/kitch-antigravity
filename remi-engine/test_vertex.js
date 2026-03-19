const { VertexAI } = require('@google-cloud/vertexai');

async function testVertex() {
  try {
    const vertexAI = new VertexAI({ project: 'kitch-alpha-2026', location: 'us-central1' });
    const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log("Testing Vertex AI...");
    const result = await model.generateContent("Say hello");
    console.log("SUCCESS for Vertex AI:", JSON.stringify(result.response));
  } catch (error) {
    console.error("FAILED for Vertex AI:", error.message);
  }
}

testVertex();
