import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import { openai } from "@workspace/integrations-openai-ai-server";
import { FirecrawlSearchBody } from "@workspace/api-zod";

const router: IRouter = Router();

interface FirecrawlItem {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

const SYSTEM_PROMPT = `You are a legal research assistant. Given raw scraped data about a judge, produce a structured JSON object with exactly these three keys:

1. "spoken_script": A compelling 40-second executive summary (roughly 100-120 words) about the judge, written to be read aloud. Include their full name, court, notable rulings, and judicial philosophy. Write in a professional broadcast style.

2. "tendencies": An array of exactly 3 short strings (each under 15 words) describing the judge's courtroom tendencies, procedural preferences, or case management style.

3. "biases": An array of exactly 2 short strings (each under 15 words) describing the judge's known legal biases, philosophical leanings, or ideological inclinations.

Return ONLY valid JSON. No markdown fences, no explanation.`;

router.post("/research", async (req, res) => {
  try {
    const { query } = FirecrawlSearchBody.parse(req.body);

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) {
      res.status(500).json({ error: "FIRECRAWL_API_KEY not configured" });
      return;
    }

    const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });
    const searchQuery = `${query} site:justia.com OR site:courtlistener.com OR site:ballotpedia.org`;

    req.log.info({ searchQuery }, "Research: executing Firecrawl search");

    const searchResult = await firecrawl.search(searchQuery, {
      limit: 5,
      scrapeOptions: { formats: ["markdown"] },
    });

    const rawResults: FirecrawlItem[] =
      (searchResult as Record<string, FirecrawlItem[]>)["data"] ??
      (searchResult as Record<string, FirecrawlItem[]>)["web"] ??
      [];

    const results = rawResults.map((item) => ({
      url: item.url ?? "",
      title: item.title ?? "",
      description: item.description ?? "",
      markdown: item.markdown ?? "",
    }));

    req.log.info({ resultCount: results.length }, "Research: Firecrawl complete");

    const combinedMarkdown = results
      .map((r, i) => `--- Source ${i + 1}: ${r.title} (${r.url}) ---\n${r.markdown}`)
      .join("\n\n");

    const truncated = combinedMarkdown.slice(0, 12000);

    req.log.info({ charCount: truncated.length }, "Research: sending to OpenAI for synthesis");

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
      req.log.error({ rawContent: rawContent.slice(0, 200) }, "Research: failed to parse OpenAI JSON");
      synthesized = {
        spoken_script: `I found information about ${query} but could not synthesize it properly. Please try again.`,
        tendencies: ["Data synthesis error"],
        biases: ["Unable to determine"],
      };
    }

    const spoken_script = synthesized.spoken_script || `No summary available for ${query}.`;

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

    req.log.info({ scriptLength: spoken_script.length, tendencies: tendencies.length, biases: biases.length }, "Research: synthesis complete");

    res.json({
      success: true,
      query,
      spoken_script,
      tendencies,
      biases,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error & { issues?: unknown; name?: string };
    if (err.name === "ZodError" || err.issues) {
      req.log.warn({ error: err.message }, "Invalid request body");
      res.status(400).json({ error: "Invalid request body", details: err.issues ?? err.message });
      return;
    }
    req.log.error({ error: err.message }, "Research endpoint error");
    res.status(500).json({ error: err.message || "Research failed" });
  }
});

export default router;
