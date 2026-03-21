import { Router, type IRouter } from "express";
import FirecrawlApp from "@mendable/firecrawl-js";
import { FirecrawlSearchBody } from "@workspace/api-zod";

const router: IRouter = Router();

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

    const searchResult: any = await firecrawl.search(searchQuery, {
      limit: 10,
    });

    const rawResults = searchResult.data || searchResult.web || [];

    if (!rawResults.length) {
      req.log.warn({ searchResult: JSON.stringify(searchResult).slice(0, 500) }, "No results from Firecrawl");
    }

    const results = rawResults.map((item: any) => ({
      url: item.url || "",
      title: item.title || "",
      description: item.description || "",
      markdown: item.markdown || "",
    }));

    req.log.info({ resultCount: results.length }, "Firecrawl search completed");

    res.json({
      success: true,
      query,
      results,
    });
  } catch (error: any) {
    if (error?.name === "ZodError" || error?.issues) {
      req.log.warn({ error: error.message }, "Invalid request body");
      res.status(400).json({ error: "Invalid request body", details: error.issues || error.message });
      return;
    }
    req.log.error({ error: error.message }, "Firecrawl search error");
    res.status(500).json({ error: error.message || "Search failed" });
  }
});

export default router;
