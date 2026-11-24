"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocraticResponse = getSocraticResponse;
const openai_1 = __importDefault(require("openai"));
// 1. APNI GROQ API KEY YAHAN DAALEIN (Starts with gsk_)
const GROQ_API_KEY = "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";
const client = new openai_1.default({
    apiKey: GROQ_API_KEY.trim(),
    baseURL: "https://api.groq.com/openai/v1" // Ye line Groq ke liye zaroori hai
});
async function getSocraticResponse(userInput, errorContext, chatHistory) {
    if (GROQ_API_KEY.includes("YOUR_ACTUAL_GROQ_KEY")) {
        return "Bhai, socraticEngine.ts mein apni 'gsk_...' wali key toh daalo! 😅";
    }
    const systemPrompt = `
    You are DevGuide, a Socratic programming tutor. 
    Your goal is to help the user learn by asking questions.
    
    STRICT RULES:
    1. NEVER provide the full code solution.
    2. Ask leading questions to help them find the error.
    3. Use analogies if they are stuck.
    4. Be friendly and conversational.

    CONTEXT:
    - Error: ${errorContext?.message || "No error"}
    - Line: ${errorContext?.line || "N/A"}
    - Code: "${errorContext?.code || "N/A"}"
    `;
    try {
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Groq ka latest powerful model
            messages: [
                { role: "system", content: systemPrompt },
                ...chatHistory,
                { role: "user", content: userInput === "INITIAL_TRIGGER" ? "I have an error, guide me." : userInput }
            ],
        });
        return response.choices[0].message.content || "I'm thinking...";
    }
    catch (err) {
        console.error("GROQ ERROR:", err);
        if (err.status === 401)
            return "🚨 Invalid Groq API Key! Check your key again.";
        return `🚨 Groq Error: ${err.message}`;
    }
}
