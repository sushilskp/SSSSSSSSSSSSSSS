
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { MessageAttachment } from "../types";

/**
 * Optimized AI service for Growth.ai using Gemini 3 and Search Grounding.
 * Supports text and multimodal attachments.
 */
export const sendMessageToAI = async (
  message: string, 
  history: { role: 'user' | 'model', parts: any[] }[],
  attachments: MessageAttachment[] = []
) => {
  // Always use process.env.API_KEY directly for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const currentParts: any[] = [{ text: message }];
    
    // Add multimodal parts if attachments are present
    attachments.forEach(att => {
      currentParts.push({
        inlineData: {
          data: att.data,
          mimeType: att.mimeType
        }
      });
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: currentParts }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.95,
        tools: [{ googleSearch: {} }] // Added Search Grounding for real-time market data
      },
    });

    // Access .text property directly (do not call as method)
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    if (!text) {
      throw new Error("The AI returned an empty response.");
    }

    return {
      text,
      sources: groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title,
        uri: chunk.web?.uri
      })).filter((s: any) => s.title && s.uri) || []
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error("Authentication Error: API Key invalid.");
    }
    
    if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error("Usage Limit: Quota exceeded. Please wait.");
    }
    
    throw new Error(error.message || "An unexpected error occurred.");
  }
};
