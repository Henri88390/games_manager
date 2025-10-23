import { Router, type Request, type Response } from "express";
import { pool } from "../../db";

const router = Router();

// Popular games
router.get("/popular", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         ORDER BY rating DESC, timeSpent DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM games`),
    ]);
    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// Recent games
router.get("/recent", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         ORDER BY dateAdded DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM games`),
    ]);
    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// Search by title (substring, case-insensitive)
router.get("/search", async (req: Request, res: Response) => {
  const title = ((req.query.title as string) || "").toLowerCase();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  try {
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path
         FROM games
         WHERE LOWER(title) LIKE $1
         ORDER BY id
         LIMIT $2 OFFSET $3`,
        [`%${title}%`, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM games WHERE LOWER(title) LIKE $1`, [
        `%${title}%`,
      ]),
    ]);
    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// Search by user email (substring, case-insensitive)
router.get("/by-user", async (req: Request, res: Response) => {
  const email = (req.query.email as string) || "";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const like = `%${email.toLowerCase()}%`;
    const [result, countResult] = await Promise.all([
      pool.query(
        `SELECT id, title, rating, timeSpent, dateAdded, image_path, email
         FROM games
         WHERE LOWER(email) LIKE $1
         ORDER BY dateAdded DESC
         LIMIT $2 OFFSET $3`,
        [like, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM games WHERE LOWER(email) LIKE $1`, [
        like,
      ]),
    ]);

    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// Global stats (across all users)
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(*) AS total_games,
        COALESCE(SUM(timespent), 0) AS total_time,
        COALESCE(AVG(rating), 0) AS avg_rating,
        COALESCE(AVG(timespent), 0) AS avg_time
      FROM games;`
    );
    res.json({
      totalGames: Number(stats.rows[0].total_games),
      totalTime: Number(stats.rows[0].total_time),
      avgRating: Number(stats.rows[0].avg_rating),
      avgTime: Number(stats.rows[0].avg_time),
    });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

export default router;
