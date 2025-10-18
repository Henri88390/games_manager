import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import { pool } from "../../db";
import { SearchField } from "../../types/game";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, "uploads/"),
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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
router.post("/upload-image", upload.single("image"), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    const imagePath = req.file.filename;
    res.json({ imagePath });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Private user games (CRUD)
router.get("/", async (req: any, res: any) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const searchField = req.query.searchField as string;
  const searchValue = req.query.searchValue as string;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM games WHERE email = $1";
  let params: any[] = [email];

  if (searchField && searchValue) {
    switch (searchField) {
      case SearchField.Title:
        query += " AND LOWER(title) LIKE $2";
        params.push(`%${searchValue.toLowerCase()}%`);
        break;
      case SearchField.Rating:
        query += " AND rating = $2";
        params.push(Number(searchValue));
        break;
      case SearchField.TimeSpent:
        query += " AND timeSpent = $2";
        params.push(Number(searchValue));
        break;
      case SearchField.DateAdded:
        query += " AND TO_CHAR(dateAdded, 'YYYY-MM-DD') = $2";
        params.push(searchValue);
        break;
      default:
        break;
    }
  }

  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  let countQuery = "SELECT COUNT(*) FROM games WHERE email = $1";
  let countParams: any[] = [email];
  if (searchField && searchValue) {
    switch (searchField) {
      case SearchField.Title:
        countQuery += " AND LOWER(title) LIKE $2";
        countParams.push(`%${searchValue.toLowerCase()}%`);
        break;
      case SearchField.Rating:
        countQuery += " AND rating = $2";
        countParams.push(Number(searchValue));
        break;
      case SearchField.TimeSpent:
        countQuery += " AND timeSpent = $2";
        countParams.push(Number(searchValue));
        break;
      case SearchField.DateAdded:
        countQuery += " AND TO_CHAR(dateAdded, 'YYYY-MM-DD') = $2";
        countParams.push(searchValue);
        break;
      default:
        break;
    }
  }

  try {
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);
    res.json({ results: result.rows, total: parseInt(countResult.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { email, title, rating, timeSpent, imagePath } = req.body as any;
  if (!email || !title || rating == null || timeSpent == null)
    return res.status(400).json({ error: "Missing fields" });
  if (typeof rating !== "number" || rating < 1 || rating > 5)
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  if (typeof timeSpent !== "number" || timeSpent < 0)
    return res.status(400).json({ error: "Time spent must be >= 0" });

  try {
    const result = await pool.query(
      `INSERT INTO games (email, title, rating, timeSpent, dateAdded, image_path)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING *`,
      [email, title, rating, timeSpent, imagePath || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { email, title, rating, timeSpent, imagePath } = req.body as any;
  const { id } = req.params as { id: string };
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });

  try {
    const result = await pool.query(
      `UPDATE games SET
        title = COALESCE($2, title),
        rating = COALESCE($3, rating),
        timeSpent = COALESCE($4, timeSpent),
        image_path = COALESCE($6, image_path)
       WHERE id = $1 AND email = $5
       RETURNING *`,
      [id, title, rating, timeSpent, email, imagePath]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Game not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  const { id } = req.params as { id: string };
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });

  try {
    await pool.query("DELETE FROM games WHERE id = $1 AND email = $2", [id, email]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// Private stats for a specific user
router.get("/stats", async (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) AS total_games,
        COALESCE(SUM(timespent), 0) AS total_time,
        COALESCE(AVG(rating), 0) AS avg_rating,
        COALESCE(AVG(timespent), 0) AS avg_time
      FROM games
      WHERE email = $1`,
      [email]
    );
    res.json({
      totalTime: Number(stats.rows[0].total_time),
      avgRating: Number(stats.rows[0].avg_rating),
      totalGames: stats.rows[0].total_games,
      avgTime: Number(stats.rows[0].avg_time),
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

export default router;
