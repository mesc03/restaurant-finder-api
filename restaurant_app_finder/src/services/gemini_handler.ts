import { GoogleGenerativeAI } from "@google/generative-ai";
import { RestaurantCommand } from "../types";

let model: any;

function getModel() {
  if (!model) {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

const systemprompt = `You are a restaurant search query parser. Your job is to convert natural language requests into structured JSON commands.

{
  "action": "restaurant_search",
  "parameters": {
    "query": "cuisine type or restaurant name",
    "near": "location string",
    "price": "1, 2, 3, or 4",
    "open_now": true or false
  }
}

RULES:
1. Output ONLY valid JSON, no markdown, no explanations, no code blocks

examples:
- "find me a sushi place in tokyo" → {"action":"restaurant_search","parameters":{"query":"sushi","near":"Tokyo"}}
- "cheap pizza places near me that is open" → {"action":"restaurant_search","parameters":{"query":"pizza","near":"near me","price":"1","open_now":true}}`;

export async function parseWithGemini(message: string): Promise<RestaurantCommand> {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not in .env or api is not set');
    }

    try {
        const modelInstance = getModel();
        const result = await modelInstance.generateContent(`${systemprompt}User request: "${message}"JSON output:`);
        const text = result.response.text();
        
        // remove markdown code blocks if any
        const cleanedText = text.replace(/```json|```/g, '').trim();
        
        const parsed: RestaurantCommand = JSON.parse(cleanedText);
        
        // validate structure
        if (parsed.action !== 'restaurant_search' || !parsed.parameters || !parsed.parameters.query || !parsed.parameters.near) {
            throw new Error('Parsed JSON does not match RestaurantCommand structure');
        }

        return parsed;

    } catch (error) { 
        console.error('Error parsing with Gemini:', error);
        throw new Error('Failed to parse message with Gemini');
    }
}