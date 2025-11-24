import {GoogleGenerativeAI} from "@google/generative-ai";
import {RestaurantCommand} from "../types";

// made sure the model loads the.env first
let model: any;

function getModel() {
  if (!model) {
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

const systemprompt = `You are a restaurant search query parser. Your job is to convert natural language requests into structured JSON commands.

Convert user requests into JSON format (valid output would be json, no other):

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
2. "query" should be the cuisine type (e.g., "sushi", "italian", "pizza")
3. "near" should be the location (e.g., "downtown Los Angeles", "New York, NY")
4. "price" would be 1=cheap, 2=moderate, 3=expensive, 4=very expensive
5. "open_now" should be true if user mentions "open now" or "currently open"
6. If user mentions rating (e.g., "4-star"), ignore it in JSON (we'll filter after API call)
7. Only include optional fields if explicitly mentioned by user

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
        
        // json parser 
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