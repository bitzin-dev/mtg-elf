
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = (): GoogleGenAI => {
  // Guidelines: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateMTGAdvice = async (prompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um especialista em Magic: The Gathering (MTG). Ajude o usuário com construção de decks, regras, sinergias e avaliação de cartas. Responda em Português do Brasil. Seja conciso e útil.",
      },
    });

    return response.text || "Desculpe, não consegui processar sua solicitação sobre Magic no momento.";
  } catch (error) {
    // Silent warn instead of error stack trace
    console.warn("Gemini API connection failed.");
    return "Ocorreu um erro ao consultar o oráculo.";
  }
};

export const identifyCardFromImage = async (base64Image: string): Promise<{ name: string, setCode: string } | null> => {
  try {
    const ai = getClient();
    
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash models support multimodal (image + text) input
      contents: {
        parts: [
          {
             inlineData: {
               mimeType: 'image/jpeg',
               data: cleanBase64
             }
          },
          {
            text: "Identify the Magic: The Gathering card in this image. Return a raw JSON object (no markdown) with properties: 'name' (English card name) and 'setCode' (3-character set code, e.g., 'ONE', 'WAR'). If you cannot identify it clearly, return null."
          }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return { name: data.name, setCode: data.setCode };
  } catch (error) {
    console.error("Card recognition failed:", error);
    return null;
  }
};
