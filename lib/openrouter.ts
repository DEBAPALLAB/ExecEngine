import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

console.log("OpenRouter Client Initialized with Key Prefix:", process.env.OPENROUTER_API_KEY?.substring(0, 10) + "...");
