import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/elevenlabs/signed-url", async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID || process.env.VITE_ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      res.status(404).json({ error: "WebSocket mode not configured", available: false });
      return;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error({ status: response.status, errorText }, "ElevenLabs signed URL request failed");
      res.status(502).json({ error: "Failed to get signed URL from ElevenLabs" });
      return;
    }

    const data = await response.json();
    req.log.info("Generated ElevenLabs signed URL");
    res.json({ signedUrl: (data as Record<string, string>).signed_url });
  } catch (error: unknown) {
    const err = error as Error;
    req.log.error({ error: err.message }, "ElevenLabs signed URL error");
    res.status(500).json({ error: err.message || "Failed to get signed URL" });
  }
});

export default router;
