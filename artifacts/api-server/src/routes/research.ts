import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import { FirecrawlSearchBody } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

interface FirecrawlItem {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

const SYSTEM_PROMPT = `You are a senior legal research analyst. Given raw scraped data about a judge, produce an exhaustive structured JSON object with exactly these three keys:

1. "spoken_script": A comprehensive, detailed executive summary about the judge — their background, appointment history, notable rulings, judicial philosophy, and courtroom reputation. Write 3 to 4 rich paragraphs with specific case names and outcomes where available. (This will be displayed on the UI dashboard).

2. "tendencies": An array of 6 to 8 strings (15 to 30 words each) describing detailed courtroom tendencies. Cover ALL of these categories where data exists:
   - Procedural patterns (scheduling, discovery, pre-trial management)
   - Sentencing tendencies (severity, departures from guidelines, alternative sentencing)
   - Motion rulings (summary judgment grants/denials, motions to dismiss patterns)
   - Evidentiary preferences (Daubert rulings, hearsay handling, expert witness treatment)
   - Trial management style (jury instructions, time limits, courtroom demeanor)
   - Settlement pressure (encouragement of ADR, mediation referrals)

3. "biases": An array of 4 to 6 strings (15 to 30 words each) describing known legal biases and inclinations. Cover ALL of these categories where data exists:
   - Ideological leanings (conservative/liberal judicial philosophy, originalism vs living constitution)
   - Party-specific patterns (pro-plaintiff or pro-defendant tendencies, government deference)
   - Industry attitudes (tech, pharma, financial sector, environmental cases)
   - Philosophical inclinations (textualism, judicial restraint, rights expansionism)
   - Notable dissents or concurrences that reveal personal judicial views

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

    const tendencies = Array.isArray(synthesized.tendencies) && synthesized.tendencies.length > 0
      ? synthesized.tendencies
      : [`Analyzing procedural patterns for ${query}.`];

    const biases = Array.isArray(synthesized.biases) && synthesized.biases.length > 0
      ? synthesized.biases
      : ["Insufficient data for bias determination."];

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