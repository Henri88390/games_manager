import { Router } from "express";
import gamesRootRouter from "./games";

const router = Router();

// Mount composed games router from folder (user space + public)
router.use("/", gamesRootRouter);

export default router;
