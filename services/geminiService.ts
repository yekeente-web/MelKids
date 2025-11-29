import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants';

// Initialize Gemini directly using the environment variable as per guidelines.
// The API key must be obtained exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getShoppingAdvice = async (userMessage: string): Promise<string> => {
  try {
    const productCatalog = PRODUCTS.map(p => `${p.name} (${p.category}) - ${p.soldOut ? '[ESGOTADO]' : ''} ${p.price.toLocaleString('pt-AO')} Kz`).join('\n');
    
    const systemInstruction = `Você é o assistente virtual amigável da loja MelKids em Angola. 
    Seu objetivo é ajudar pais e tios a escolherem presentes ou roupas para crianças.
    Seja breve, divertido e use emojis.
    Os preços estão em Kwanzas (Kz), formato "8 500 Kz".
    
    Aqui está o nosso catálogo atual:
    ${productCatalog}
    
    Se o usuário perguntar sobre algo que temos, sugira o produto exato. Se estiver esgotado, avise.
    Se perguntar sobre tamanhos, dê dicas gerais para crianças (ex: roupas maiores para crescer).
    Nunca invente produtos que não estão na lista acima.`;

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não entendi. Pode repetir?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Tive um pequeno problema para pensar agora. Tente novamente em instantes!";
  }
};