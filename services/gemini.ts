
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCaseForAdmin = async (caseDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza este relato de presunta violencia basada en género para el municipio de San Pedro de los Milagros. 
      Relato: "${caseDescription}"
      
      Proporciona un resumen ejecutivo, una clasificación de riesgo sugerida (Baja, Media, Alta, Crítica) y 3 pasos inmediatos que el funcionario debe seguir según la ruta de atención colombiana.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "riskLevel", "steps"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
