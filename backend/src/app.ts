import cors from "cors";
import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "./db";
import { SearchField } from "./types/game";

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.post("/api/auth/signup", async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const existing = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "User already exists" });

    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      password,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to sign-up" });
  }
});

app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0 || result.rows[0].password !== password)
      return res.status(401).json({ error: "Invalid credentials" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// --- IMAGE UPLOAD ENDPOINT ---
app.post(
  "/api/games/upload-image",
  upload.single("image"),
  async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Return the file path
      const imagePath = req.file.filename;
      res.json({ imagePath });
    } catch (err) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  }
);

// --- GAME ENDPOINTS ---
app.get("/api/games", async (req: any, res: any) => {
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

  // Add pagination to the query
  query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  // Get total count for pagination
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
    res.json({
      results: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

app.post("/api/games", async (req, res) => {
  const { email, title, rating, timeSpent, imagePath } = req.body;
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

app.put("/api/games/:id", async (req, res) => {
  const { email, title, rating, timeSpent, imagePath } = req.body;
  const { id } = req.params;
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

app.delete("/api/games/:id", async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });

  try {
    await pool.query("DELETE FROM games WHERE id = $1 AND email = $2", [
      id,
      email,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "An error as occured" });
  }
});

// --- PUBLIC ENDPOINTS ---
app.get("/api/games/public/popular", async (req, res) => {
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

app.get("/api/games/public/recent", async (req, res) => {
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

app.get("/api/games/public/search", async (req, res) => {
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

// --- user statistics ---
app.get("/api/games/stats", async (req, res) => {
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

// --- global statistics ---
app.get("/api/games/public/stats", async (_req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
