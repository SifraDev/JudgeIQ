import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import { FirecrawlSearchBody } from "@workspace/api-zod";

const router: IRouter = Router();

interface FirecrawlItem {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
}

router.post("/firecrawl/search", async (req, res) => {
  try {
    const { query } = FirecrawlSearchBody.parse(req.body);

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "FIRECRAWL_API_KEY not configured" });
      return;
    }

    const firecrawl = new FirecrawlApp({ apiKey });

    const searchQuery = `${query} site:justia.com OR site:courtlistener.com OR site:ballotpedia.org`;

    req.log.info({ searchQuery }, "Executing Firecrawl search");

    const searchResult = await firecrawl.search(searchQuery, {
      limit: 5,
      scrapeOptions: {
        formats: ["markdown"],
      },
    });

    const rawResults: FirecrawlItem[] =
      (searchResult as Record<string, FirecrawlItem[]>)["data"] ??
      (searchResult as Record<string, FirecrawlItem[]>)["web"] ??
      [];

    if (!rawResults.length) {
      req.log.warn(
        { searchResult: JSON.stringify(searchResult).slice(0, 500) },
        "No results from Firecrawl"
      );
    }

    const results = rawResults.map((item) => ({
      url: item.url ?? "",
      title: item.title ?? "",
      description: item.description ?? "",
      markdown: item.markdown ?? "",
    }));

    req.log.info({ resultCount: results.length }, "Firecrawl search completed");

    res.json({
      success: true,
      query,
      results,
    });
  } catch (error: unknown) {
    const err = error as Error & { issues?: unknown; name?: string };
    if (err.name === "ZodError" || err.issues) {
      req.log.warn({ error: err.message }, "Invalid request body");
      res
        .status(400)
        .json({ error: "Invalid request body", details: err.issues ?? err.message });
      return;
    }
    req.log.error({ error: err.message }, "Firecrawl search error");
    res.status(500).json({ error: err.message || "Search failed" });
  }
});

export default router;
