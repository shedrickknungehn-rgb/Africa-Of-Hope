import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schoolRouter from "./school";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/school", schoolRouter);
router.use((_req, res) => res.status(404).json({ error: "Not found" }));

export default router;
