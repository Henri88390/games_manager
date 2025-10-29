import { Router } from "express";
import publicRouter from "./public";
import userSpaceRouter from "./user-space";

const router = Router();

// Public routes: popular, recent, title search, by-user search, global stats
// Mount public routes FIRST to avoid userRateLimit middleware
router.use("/public", publicRouter);

// Private/user routes: CRUD, image upload, user stats
router.use("/", userSpaceRouter);

export default router;
