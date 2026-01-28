import { NextResponse } from "next/server";
import { ai, getSafeModel } from "@/lib/ai";
// Redundant dotenv config removed as Next.js handles .env.local automatically

export async function POST(req: Request) {
  console.log("--- ARTIFACT GENERATION START ---");
  try {
    const { goal, step } = await req.json();
    console.log("Goal:", goal);
    console.log("Step Title:", step.title);
    console.log("Step ID:", step.id);

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("CRITICAL: API Key missing");
      return NextResponse.json({ error: "API Key not found in environment." }, { status: 500 });
    }

    const model = getSafeModel();
    console.log("Using Model:", model);

    const completion = await ai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `
You are a Multi-Domain technical Execution Agent. Your task is to generate high-fidelity artifacts for any given goal (Culinary, Code, Business, etc.).

FORMATTING SPECIFICATIONS:
- "text": Use high-quality Markdown. Headers, bold text, and lists are essential for readability.
- "code": Output raw source code ONLY. No markdown wrappers.
- "schema": Output raw valid JSON or structured configuration.
- "checklist": Output a Markdown checklist: "- [ ] task".
- "comparison": Output raw JSON in this structure: { "title": "Comparison Title", "featureLabel": "Dimension", "options": [{ "name": "Option 1", "features": { "Feature A": "Value", "Feature B": true } }] }. Boolean values render as icons.

OPERATIONAL RULES:
- SPEED OPTIMIZATION: Start generating the artifact content IMMEDIATELY. NO internal monologue, NO introductory text.
- NO MARKDOWN WRAPPING: For "comparison", "code", and "schema" types, output RAW text only. NEVER wrap in markdown code blocks.
- MATCH THE DOMAIN: If it's a recipe, use culinary terms. If it's code, use professional syntax.
- ZERO conversational filler.
- MATCH SOPHISTICATION: If the goal is high- level, the artifact should be comprehensive.
        `,
        },
        {
          role: "user",
          content: `
Goal: ${goal}
Step title: ${step.title}
Instruction: ${step.instruction}
Artifact type: ${step.artifactType}
          `,
        },
      ],
    });

    const artifact = completion.choices[0].message.content;
    console.log("Generated Artifact length:", artifact?.length || 0);

    if (!artifact) {
      console.warn("AI returned empty artifact content");
    }

    console.log("--- ARTIFACT GENERATION SUCCESS ---");
    return NextResponse.json({
      artifact: artifact,
    });
  } catch (error: any) {
    console.error("--- ARTIFACT GENERATION FAILED ---");
    console.error("Error Detail:", error);
    return NextResponse.json({ error: error.message || "Failed to generate artifact" }, { status: 500 });
  }
}
