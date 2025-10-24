import { Router } from "express";
import { publicGameController } from "../../controllers/PublicGameController";

const router = Router();

// Popular games
router.get("/popular", publicGameController.getPopularGames);

// Recent games
router.get("/recent", publicGameController.getRecentGames);

// Search by title (substring, case-insensitive)
router.get("/search", publicGameController.searchGamesByTitle);

// Search by user email (substring, case-insensitive)
router.get("/by-user", publicGameController.searchGamesByUser);

// Global stats (across all users)
router.get("/stats", publicGameController.getGlobalStats);

export default router;
