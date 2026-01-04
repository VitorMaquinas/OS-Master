
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async optimizeServiceDescription(description: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Como um consultor técnico profissional, melhore a seguinte descrição de serviço para uma Ordem de Serviço, tornando-a mais técnica e clara: "${description}". Responda apenas com o texto melhorado.`,
      });
      return response.text || description;
    } catch (error) {
      console.error('Error with Gemini:', error);
      return description;
    }
  }
};
