import { NextResponse } from "next/server";
import { ai, getSafeModel } from "@/lib/ai";
// Redundant dotenv config removed as Next.js handles .env.local automatically

export async function POST(req: Request) {
  console.log("--- REQUIREMENTS ANALYSIS START ---");
  try {
    const { goal } = await req.json();
    console.log("Analyzing goal:", goal);

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const completion = await ai.chat.completions.create({
      model: getSafeModel(),
      messages: [
        {
          role: "system",
          content: `
You are a High-Fidelity Execution Architect. Your mission is to perform a deep analysis of user goals and capture critical preferences to ensure the execution graph is perfectly tailored.

CRITICAL PROTOCOLS:
1. DOMAIN DETECTION: Identify the domain (e.g., Software, Cooking, Business, Art).
2. THOROUGHNESS: Even if a goal is "clear" (like "make butter chicken"), you MUST trigger a clarification phase if key preferences are missing.
   - For COOKING: You MUST ask about **Spice Level**, **Serving Size**, and **Dietary Restrictions**.
   - For COMPARISON: You MUST ask about **Selection Criteria**, **Number of Options**, and **Key Metrics**.
   - For SOFTWARE: You MUST ask about **Primary Language/Framework**, **Target Platform**, and **Complexity**.
   - For CREATIVE: You MUST ask about **Style/Tone**, **Format**, and **Target Audience**.
3. TRIGGER LOGIC: Set 'needsMoreInfo' to true if any of these "High-Fidelity dimensions" are unknown.

CONSTRAINTS:
- Use ONLY 'select' fields. NO 'text' or 'textarea'.
- Provide 4-6 realistic, domain-specific options per field.
- Ensure labels are highly descriptive (e.g., "Desired Heat Intensity" instead of "Spice level").

RESPONSE FORMAT (JSON ONLY):
{
  "needsMoreInfo": boolean,
  "reason": "Technical/Domain-specific rationale for requiring these preferences",
  "fields": [
    {
      "id": "dimension_id",
      "label": "Descriptive Label",
      "required": true,
      "type": "select",
      "options": ["Option A", "Option B", "Option C", "Other"]
    }
  ]
        `,
        },
        { role: "user", content: goal },
      ],
    });

    const content = completion.choices[0].message.content;
    console.log("AI Analysis:", content);

    if (!content) throw new Error("Empty response from AI");

    const cleanJson = content.match(/\{[\s\S]*\}/)?.[0] || content.replace(/```json\n?|```/g, "").trim();
    const analysis = JSON.parse(cleanJson);

    console.log("--- REQUIREMENTS ANALYSIS SUCCESS ---");
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("--- REQUIREMENTS ANALYSIS FAILED ---", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
