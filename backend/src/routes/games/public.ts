import { Router } from "express";
import { publicGameController } from "../../controllers/PublicGameController";
import { generalRateLimit } from "../../middleware/rateLimit";
import { validatePagination } from "../../middleware/validation";

const router = Router();

// Apply general rate limiting to all public routes
router.use(generalRateLimit);

// Popular games
router.get(
  "/popular",
  validatePagination,
  publicGameController.getPopularGames
);

// Recent games
router.get("/recent", validatePagination, publicGameController.getRecentGames);

// Search by title (substring, case-insensitive)
router.get(
  "/search",
  validatePagination,
  publicGameController.searchGamesByTitle
);

// Search by user email (substring, case-insensitive)
router.get(
  "/by-user",
  validatePagination,
  publicGameController.searchGamesByUser
);

// Global stats (across all users)
router.get("/stats", publicGameController.getGlobalStats);

export default router;
