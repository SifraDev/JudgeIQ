import { Router, type IRouter } from "express";
import healthRouter from "./health";
import firecrawlRouter from "./firecrawl";

const router: IRouter = Router();

router.use(healthRouter);
router.use(firecrawlRouter);

export default router;
