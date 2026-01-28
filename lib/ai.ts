import OpenAI from "openai";

// Detect provider based on API key prefix or environment variable
const isOpenRouter = process.env.OPENROUTER_API_KEY?.startsWith("sk-or-v1-");
const isGroq = !!process.env.GROQ_API_KEY;

export const ai = new OpenAI({
    apiKey: (process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY)!,
    baseURL: isGroq
        ? "https://api.groq.com/openai/v1"
        : "https://openrouter.ai/api/v1",
    defaultHeaders: isOpenRouter ? {
        "HTTP-Referer": "https://localhost:3000",
        "X-Title": "Not A Prompt",
    } : undefined,
});

// Helper to get the best available model for the current provider
export const getSafeModel = () => {
    if (isGroq) return "llama-3.3-70b-versatile";
    return "arcee-ai/trinity-large-preview:free";
};

console.log(`AI Interface initialized using ${isGroq ? 'Groq' : 'OpenRouter'}`);
