import { Router, type IRouter } from "express";
import healthRouter from "./health";
import skillgraphRouter from "./skillgraph";
import extractRouter from "./skillgraph/extract";

const router: IRouter = Router();

router.use(healthRouter);
router.use(skillgraphRouter);
router.use(extractRouter);

export default router;
