import { Router } from "express";
import publicRouter from "./public";
import userSpaceRouter from "./user-space";

const router = Router();

// Private/user routes: CRUD, image upload, user stats
router.use("/", userSpaceRouter);

// Public routes: popular, recent, title search, by-user search, global stats
router.use("/public", publicRouter);

export default router;
