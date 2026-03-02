const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listAvailableModels() {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ No API Key found in .env");
        return;
    }

    console.log("Using API Key:", apiKey.substring(0, 10) + "...");

    try {
        // We will use raw fetch to call the list models endpoint to be absolutely sure
        // The endpoint is: https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log("Fetching models from:", url.replace(apiKey, 'HIDDEN_KEY'));

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(model => {
                console.log(`- ${model.name.replace('models/', '')}`);
                console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
            });
        } else {
            console.log("❌ Failed to list models. Response:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

listAvailableModels();
