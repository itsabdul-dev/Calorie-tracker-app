const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ No API Key found in .env");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 10) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // List models to see what is actually available
        // Note: The SDK doesn't have a direct 'listModels' on the instance, 
        // but we can try to access the model via a simple prompt to check connectivity
        // OR we can use the model manager if exposed, but for now let's try to hit the API directly if SDK fails.

        // Actually, asking the model to identify itself or just trying a known working one.
        // The google-generative-ai SDK doesn't expose listModels easily in the simplified client.

        // Let's try known variants:
        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-8b",
            "gemini-pro-vision",
            "gemini-1.0-pro-vision-latest"
        ];

        console.log("\nTesting specific models...");

        for (const modelName of candidates) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                // minimal prompt
                const result = await model.generateContent("Hello?");
                const response = await result.response;
                console.log("✅ OK");
            } catch (e) {
                console.log("❌ Failed: " + (e.message ? e.message.split('[')[0] : e));
                if (e.message.includes('404')) {
                    // This is what we expect for invalid models
                }
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listModels();
