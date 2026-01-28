import { NextResponse } from "next/server";
import { ai, getSafeModel } from "@/lib/ai";
// Redundant dotenv config removed as Next.js handles .env.local automatically

export async function POST(req: Request) {
  console.log("--- GRAPH COMPILATION START ---");
  try {
    const { goal } = await req.json();
    console.log("Compiling graph for:", goal);

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({
        error: "API Key not configured"
      }, { status: 500 });
    }

    const model = getSafeModel();
    console.log("Using Model:", model);

    const completion = await ai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: `
You are a Multi-Domain Execution Compiler. Your mission is to decompose any high-level objective into a sequential execution graph.

EXECUTION PRINCIPLES:
1. DOMAIN ADAPTATION: Identify the domain (Culinary, Technical, Creative, etc.) and tailor the steps.
2. LINEAR PROGRESSION: Steps must follow a natural workflow for that domain.
   - For COOKING: Preparation -> Marination -> Cooking -> Garnish -> Serve.
   - For SOFTWARE: Research -> Design -> Implementation -> Test -> Deploy.
3. ATOMIC RESPONSIBILITY: Each step handles ONE core concern.

ARTIFACT SELECTION MATRIX:
- "text": Use for general instructions, recipes, descriptions, summaries, or documentation.
- "code": Use for actual programming logic or scripts.
- "schema": Use for structured data like JSON, ingredient lists, or configuration files.
- "checklist": Use for safety checks, grocery lists, or verification steps.
- "comparison": Use for side-by-side evaluations, pros/cons lists, or feature matrices between multiple options.

CONSTRAINTS:
- EXACTLY 4-7 steps.
- JSON output ONLY.
- Ensure 'artifactType' is professional and context-appropriate.

REQUIRED JSON STRUCTURE:
{
  "goal": "Scientifically refined goal statement",
  "steps": [
    {
      "id": "1",
      "title": "Professional Step Title",
      "artifactType": "text|code|schema|checklist|comparison",
      "instruction": "Detailed technical instruction for artifact generation...",
      "completed": false
    }
  ],
  "terminalState": "DONE"
}
        `,
        },
        { role: "user", content: goal },
      ],
    });

    const content = completion.choices[0].message.content;
    console.log("AI Response Raw Content:", content);

    if (!content) {
      console.error("AI returned empty content");
      throw new Error("Empty response from AI");
    }

    // Extract JSON block
    let cleanJson = content;

    // Remove reasoning/thought tags if present
    cleanJson = cleanJson.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();

    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
      console.log("Extracted JSON block from response");
    } else {
      console.log("No JSON structure found, attempting legacy cleaning...");
      cleanJson = cleanJson.replace(/```json\n?|```/g, "").trim();
    }

    try {
      const graph = JSON.parse(cleanJson);

      // Validation
      if (!graph.steps || !Array.isArray(graph.steps)) {
        console.error("Validation Failed: 'steps' array is missing or invalid", graph);
        throw new Error("Compiler error: Graph missing 'steps' array");
      }

      if (graph.steps.length < 4 || graph.steps.length > 7) {
        console.error("Validation Failed: Step count out of range", graph.steps.length);
        throw new Error(`Compiler error: Graph must have 4-7 steps, got ${graph.steps.length}`);
      }

      if (graph.terminalState !== "DONE") {
        console.error("Validation Failed: terminalState is not DONE", graph.terminalState);
        throw new Error("Compiler error: terminalState must be DONE");
      }

      console.log("Graph compiled successfully:", graph.steps.length, "steps");
      console.log("--- GRAPH COMPILATION SUCCESS ---");
      return NextResponse.json(graph);
    } catch (parseError: any) {
      console.error("JSON Parse/Validation Error:", parseError.message);
      console.error("Raw content that failed:", cleanJson);
      throw new Error("Compiler returned invalid structure: " + parseError.message);
    }
  } catch (error: any) {
    console.error("--- GRAPH COMPILATION FAILED ---");
    console.error("Error Detail:", error);
    return NextResponse.json({ error: error.message || "Compilation failed" }, { status: 500 });
  }
}
