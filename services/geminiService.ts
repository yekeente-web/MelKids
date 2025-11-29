import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants';

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getShoppingAdvice = async (userMessage: string): Promise<string> => {
  if (!ai) return "Desculpe, a IA não está configurada corretamente (API Key ausente).";

  try {
    const productCatalog = PRODUCTS.map(p => `${p.name} (${p.category}) - ${p.soldOut ? '[ESGOTADO]' : ''} Kz ${p.price.toLocaleString('pt-AO')}`).join('\n');
    
    const systemInstruction = `Você é o assistente virtual amigável da loja MelKids em Angola. 
    Seu objetivo é ajudar pais e tios a escolherem presentes ou roupas para crianças.
    Seja breve, divertido e use emojis.
    Os preços estão em Kwanzas (Kz).
    
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