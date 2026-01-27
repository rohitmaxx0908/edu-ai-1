
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Opportunity } from "../types";
import { withRetry, robustJsonParse } from "./geminiService";

export const fetchTailoredOpportunities = async (profile: UserProfile): Promise<Opportunity[]> => {
  return withRetry(async () => {
    // Initializing with API key directly from process.env as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find 6 active internships or competitive events for a ${profile.careerTarget.desiredRole} in ${profile.careerTarget.targetIndustry}. 
      Include a calculated "matchScore" (0-100) based on their skills. 
      CRITICAL: Return ONLY a valid JSON array. No citations like [1]. No markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        maxOutputTokens: 2500,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              type: { type: Type.STRING, description: "INTERNSHIP|COMPETITION|EVENT|PLACEMENT" },
              deadline: { type: Type.STRING },
              url: { type: Type.STRING },
              relevanceReason: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              location: { type: Type.STRING },
              stipend: { type: Type.STRING },
              matchScore: { type: Type.NUMBER }
            },
            required: ["id", "title", "company", "url", "type", "matchScore"]
          }
        }
      }
    });

    const parsed = robustJsonParse(response.text || "[]");
    return Array.isArray(parsed) ? parsed : [];
  }, 4, 4000); 
};
