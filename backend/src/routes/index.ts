import { Router } from "express";
import authRouter from "./auth";
import gamesRouter from "./games/index";

const router = Router();

router.use("/auth", authRouter);
router.use("/games", gamesRouter);

export default router;
