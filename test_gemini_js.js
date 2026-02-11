import { GoogleGenAI } from "@google/genai";

const API_KEY = "AIzaSyAbMBMhbMn4jyijq6JXBGHEHFI2KSaU_eU";
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function testModel(modelName) {
  console.log(`Testing ${modelName}...`);
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ text: "Hello, are you working?" }]
    });
    console.log(`SUCCESS ${modelName}:`, response.text ? response.text.substring(0, 50) : "No text");
    return true;
  } catch (error) {
    console.error(`FAILED ${modelName}:`, error.message);
    if (error.response) {
      console.error("Details:", JSON.stringify(error.response, null, 2));
    }
    return false;
  }
}

async function main() {
  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];

  for (const m of models) {
    await testModel(m);
  }
}

main();
