import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface SynthesizeInput {
  query: string;
  results: Array<{ url: string; title: string; description: string; markdown: string }>;
}

const SYSTEM_PROMPT = `You are a legal research assistant. Given raw scraped data about a judge, produce a structured JSON object with exactly these three keys:

1. "spoken_script": A very short, highly conversational assistant response (max 2 sentences). Format it EXACTLY like this: "I have compiled the research on Judge [Full Name]. [One punchy, interesting key insight about them]. What specific area of their record would you like to explore?"

2. "tendencies": An array of exactly 3 short strings (each under 15 words) describing the judge's courtroom tendencies, procedural preferences, or case management style.

3. "biases": An array of exactly 2 short strings (each under 15 words) describing the judge's known legal biases, philosophical leanings, or ideological inclinations.

Return ONLY valid JSON. No markdown fences, no explanation.`;

router.post("/synthesize", async (req, res) => {
  try {
    const body = req.body as SynthesizeInput;
    const query = body?.query;
    const results = Array.isArray(body?.results) ? body.results : [];

    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "Missing or invalid 'query' field" });
      return;
    }

    const combinedMarkdown = results
      .map((r, i) => `--- Source ${i + 1}: ${r.title} (${r.url}) ---\n${r.markdown}`)
      .join("\n\n");

    const truncated = combinedMarkdown.slice(0, 12000);

    req.log.info({ charCount: truncated.length }, "Synthesize: sending to OpenAI");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Here is the raw scraped data about the judge "${query}":\n\n${truncated}` },
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    let synthesized: { spoken_script?: string; tendencies?: string[]; biases?: string[] };

    try {
      synthesized = JSON.parse(rawContent);
    } catch {
      req.log.error({ rawContent: rawContent.slice(0, 200) }, "Synthesize: failed to parse OpenAI JSON");
      synthesized = {
        spoken_script: `I have compiled the research on Judge ${query}, but encountered an issue synthesizing the details. What specific area would you like to explore?`,
        tendencies: ["Data synthesis error"],
        biases: ["Unable to determine"],
      };
    }

    const spoken_script = synthesized.spoken_script || `I have compiled the research on Judge ${query}, but details were limited. What specific area would you like to explore?`;

    const rawTendencies = Array.isArray(synthesized.tendencies) ? synthesized.tendencies : [];
    const tendencies = [
      rawTendencies[0] || `Analyzing procedural patterns for ${query}.`,
      rawTendencies[1] || "Evaluating courtroom management style.",
      rawTendencies[2] || "Cross-referencing historical case outcomes.",
    ];

    const rawBiases = Array.isArray(synthesized.biases) ? synthesized.biases : [];
    const biases = [
      rawBiases[0] || "Insufficient data for bias determination.",
      rawBiases[1] || "Further analysis recommended.",
    ];

    req.log.info({ scriptLength: spoken_script.length, tendencies: tendencies.length, biases: biases.length }, "Synthesize: complete");

    res.json({
      success: true,
      spoken_script,
      tendencies,
      biases,
    });
  } catch (error: unknown) {
    const err = error as Error;
    req.log.error({ error: err.message }, "Synthesize endpoint error");
    res.status(500).json({ error: err.message || "Synthesis failed" });
  }
});

export default router;
