import { Router, type IRouter } from "express";
import healthRouter from "./health";
import firecrawlRouter from "./firecrawl";
import elevenlabsRouter from "./elevenlabs";
import synthesizeRouter from "./synthesize";

const router: IRouter = Router();

router.use(healthRouter);
router.use(firecrawlRouter);
router.use(elevenlabsRouter);
router.use(synthesizeRouter);

export default router;
