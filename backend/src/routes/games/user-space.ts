import { Router } from "express";
import multer from "multer";
import path from "path";
import { userGameController } from "../../controllers/UserGameController";
import { strictRateLimit, userRateLimit } from "../../middleware/rateLimit";
import {
  validateEmail,
  validateGameData,
  validateIdParam,
  validatePagination,
} from "../../middleware/validation";

const router = Router();

// Apply user-specific rate limiting to all user routes
router.use(userRateLimit);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, "uploads/"),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

// Image upload (used on Home / user area)
router.post(
  "/upload-image",
  strictRateLimit,
  upload.single("image"),
  userGameController.uploadImage
);

// Private stats for a specific user (must come before /:id route)
router.get("/stats", validateEmail, userGameController.getUserStats);

// Private user games (CRUD)
router.get(
  "/",
  validateEmail,
  validatePagination,
  userGameController.getUserGames
);
router.post(
  "/",
  validateEmail,
  validateGameData,
  userGameController.createGame
);
router.put(
  "/:id",
  validateIdParam,
  validateEmail,
  validateGameData,
  userGameController.updateGame
);
router.delete(
  "/:id",
  validateIdParam,
  validateEmail,
  userGameController.deleteGame
);

// Get specific game by ID
router.get(
  "/:id",
  validateIdParam,
  validateEmail,
  userGameController.getGameById
);

export default router;
