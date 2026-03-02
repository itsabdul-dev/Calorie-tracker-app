import { GoogleGenerativeAI } from "@google/generative-ai";
import * as ImageManipulator from 'expo-image-manipulator';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️ Gemini API key not configured!');
}

export interface AIAnalysisResult {
    foods: {
        name: string;
        portion_size: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
        weight_g?: number;
        confidence: "high" | "medium" | "low";
    }[];
    total_calories: number;
    notes?: string;
    error?: string;
    suggestion?: string;
}

export async function analyzeFoodImage(imageUri: string): Promise<AIAnalysisResult | null> {
    try {
        if (!API_KEY) {
            throw new Error('Gemini API key not configured');
        }

        // Compress and convert image to base64
        console.log('Compressing image at:', imageUri);
        const base64Image = await compressAndConvertImage(imageUri);
        console.log('Compression successful. Base64 length:', base64Image.length);

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);

        // Use gemini-flash-latest as an alias for 1.5-flash which is stable on free tier
        // gemini-2.0-flash has a 0 RPM limit on free tier currently
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this food image and provide nutrition information in STRICT JSON format.

Rules:
1. Identify all visible food items
2. Estimate the weight in grams for the visible portion
3. Calculate nutrition for that estimated weight
4. If multiple items, list each separately
5. Be realistic with estimates

Return ONLY valid JSON (no markdown, no explanation):
{
  "foods": [
    {
      "name": "Food name",
      "portion_size": "estimated amount (e.g., 1 medium, 200g, 1 cup)",
      "weight_g": 0,
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "confidence": "high"
    }
  ],
  "total_calories": 0,
  "notes": "any relevant observations"
}
`;

        console.log('Sending to Gemini API (2.0 Flash Exp)...');

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
            prompt,
        ]);

        const response = await result.response;
        let text = response.text();

        console.log('Raw response:', text.substring(0, 100) + '...');

        // Clean markdown code blocks
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // Parse JSON
        let data;
        try {
            data = JSON.parse(text) as AIAnalysisResult;
        } catch (e) {
            console.error("JSON Parse Error:", e, "Text:", text);
            // Sometimes the model returns text with the JSON inside, try to extract it
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Failed to parse AI response");
            }
        }

        // Validate
        if (!data.foods && !data.error) {
            if (data['error']) return { ...data, total_calories: 0, foods: [] } as any;
            throw new Error('Invalid response format');
        }

        return data;

    } catch (error: any) {
        console.error('Gemini API Error:', error);

        if (error.status === 404) {
            return {
                foods: [],
                total_calories: 0,
                error: "Model 'gemini-2.0-flash-exp' not found. Please check API availability.",
                suggestion: "The experimental model might be unavailable in your region."
            };
        }

        return {
            foods: [],
            total_calories: 0,
            error: "AI Analysis Failed: " + (error.message || "Unknown error"),
            suggestion: "Try retaking the photo or checking your internet."
        };
    }
}

async function compressAndConvertImage(uri: string): Promise<string> {
    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        const response = await fetch(manipResult.uri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (!result || !result.includes(',')) {
                    reject(new Error('Invalid base64 conversion result'));
                    return;
                }
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (e) => reject(new Error('FileReader failed: ' + e?.target?.error));
            reader.readAsDataURL(blob);
        });
    } catch (error: any) {
        console.error('Image compression error details:', error);
        throw new Error(`Failed to process image: ${error.message || error}`);
    }
}
