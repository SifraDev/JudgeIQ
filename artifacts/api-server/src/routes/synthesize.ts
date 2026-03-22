import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Le agregamos tipos explícitos (any) a req y res para solucionar el error de TypeScript
router.post("/synthesize", async (req: any, res: any) => {
  try {
    const { query, results } = req.body;

    // Si Firecrawl falló o no trajo nada, devolvemos un JSON de contingencia elegante
    if (!query || !Array.isArray(results) || results.length === 0) {
      return res.json({
        success: true,
        spoken_script: `I searched for Judge ${query || 'the requested judge'}, but I couldn't find enough public records to build a profile.`,
        tendencies: ["No data extracted", "No data extracted", "No data extracted"],
        biases: ["No data extracted", "No data extracted"]
      });
    }

    const combinedMarkdown = results
      .map((r: any, i: number) => `--- Source ${i + 1}: ${r.title || 'Unknown'} (${r.url || 'Unknown'}) ---\n${r.markdown || r.content || ''}`)
      .join("\n\n");

    const truncated = combinedMarkdown.slice(0, 15000);

    if (req.log) req.log.info({ charCount: truncated.length }, "Synthesize: sending to OpenAI");

    const SYSTEM_PROMPT = `You are JudgeIQ, an elite legal research assistant. Analyze the scraped data and return a JSON object with exactly these keys:
1. "spoken_script": A short, highly conversational summary of maximum 2 sentences. Format: "I have compiled the research on Judge [Name]. [One punchy insight]. I've populated the dashboard. What specific area would you like to explore?"
2. "tendencies": An array of exactly 3 short strings (under 10 words) describing procedural preferences.
3. "biases": An array of exactly 2 short strings (under 10 words) describing legal or ideological inclinations.
Return ONLY valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Raw data for "${query}":\n\n${truncated}` },
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const synthesized = JSON.parse(rawContent);

    if (req.log) req.log.info("Synthesize: complete");

    return res.json({
      success: true,
      spoken_script: synthesized.spoken_script || `I have populated the dashboard with information about Judge ${query}. What would you like to know?`,
      tendencies: synthesized.tendencies || ["Information pending", "Information pending", "Information pending"],
      biases: synthesized.biases || ["Information pending", "Information pending"],
    });
  } catch (error: any) {
    if (req.log) req.log.error({ error: error.message }, "Synthesize endpoint error");
    return res.status(500).json({ error: error.message || "Synthesis failed" });
  }
});

export default router;
