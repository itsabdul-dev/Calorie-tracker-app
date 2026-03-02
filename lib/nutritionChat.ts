import { GoogleGenerativeAI } from "@google/generative-ai";
import { DailyStats } from "../types";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function sendNutritionChatMessage(
    messages: ChatMessage[],
    userContext?: { stats?: DailyStats; goals?: { protein: number; carbs: number; fat: number } }
): Promise<string> {
    if (!API_KEY) {
        throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Build context about user's nutrition
    let contextPrompt = `You are a friendly and knowledgeable nutrition assistant. Help users with their diet and nutrition questions. Be concise but helpful. Use emojis sparingly to keep it friendly.

`;

    if (userContext?.stats) {
        contextPrompt += `Today's intake so far:
- Calories: ${userContext.stats.calories}/${userContext.stats.caloriesGoal} kcal
- Protein: ${userContext.stats.protein}g
- Carbs: ${userContext.stats.carbs}g
- Fat: ${userContext.stats.fat}g

`;
    }

    if (userContext?.goals) {
        contextPrompt += `User's daily macro goals:
- Protein: ${userContext.goals.protein}g
- Carbs: ${userContext.goals.carbs}g
- Fat: ${userContext.goals.fat}g

`;
    }

    // Build conversation history
    const conversationHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
    }));

    // Start chat with context
    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: contextPrompt + "Please acknowledge this context briefly and be ready to help." }],
            },
            {
                role: 'model',
                parts: [{ text: "Got it! I can see your nutrition data. How can I help you today? 🥗" }],
            },
            ...conversationHistory.slice(0, -1) // All messages except the last one
        ],
    });

    // Send the last message
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;

    return response.text();
}
