import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import documentsRouter from "./documents";
import deadlinesRouter from "./deadlines";
import tasksRouter from "./tasks";
import interactionsRouter from "./interactions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/cases", casesRouter);
router.use("/documents", documentsRouter);
router.use("/deadlines", deadlinesRouter);
router.use("/tasks", tasksRouter);
router.use("/interactions", interactionsRouter);
router.use("/dashboard", dashboardRouter);

export default router;
