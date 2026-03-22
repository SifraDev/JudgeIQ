import { Router, type IRouter } from "express";
import healthRouter from "./health";
import firecrawlRouter from "./firecrawl";
import elevenlabsRouter from "./elevenlabs";
import researchRouter from "./research";

const router: IRouter = Router();

router.use(healthRouter);
router.use(firecrawlRouter);
router.use(elevenlabsRouter);
router.use(researchRouter);

export default router;
