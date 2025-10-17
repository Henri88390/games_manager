import cors from "cors";
import express from "express";
import { pool } from "./db";
import { SearchField } from "./types/game";

const app = express();
const PORT = process.env.PORT || 3000;

const users: { [email: string]: { password: string } } = {};

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.post("/api/auth/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });
  if (users[email])
    return res.status(409).json({ error: "User already exists" });
  users[email] = { password };
  res.json({ success: true });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });
  if (!users[email] || users[email].password !== password)
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true });
});

// --- GAME ENDPOINTS ---

// Get user's games (with optional search)
app.get("/api/games", async (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const searchField = req.query.searchField as string;
  const searchValue = req.query.searchValue as string;

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

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/games", async (req, res) => {
  const { email, title, rating, timeSpent } = req.body;
  if (!email || !title || rating == null || timeSpent == null)
    return res.status(400).json({ error: "Missing fields" });
  if (typeof rating !== "number" || rating < 1 || rating > 5)
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  if (typeof timeSpent !== "number" || timeSpent < 0)
    return res.status(400).json({ error: "Time spent must be >= 0" });

  try {
    const result = await pool.query(
      `INSERT INTO games (email, title, rating, timeSpent, dateAdded)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [email, title, rating, timeSpent]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/games/:id", async (req, res) => {
  const { email, title, rating, timeSpent } = req.body;
  const { id } = req.params;
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });

  try {
    const result = await pool.query(
      `UPDATE games SET
        title = COALESCE($2, title),
        rating = COALESCE($3, rating),
        timeSpent = COALESCE($4, timeSpent)
       WHERE id = $1 AND email = $5
       RETURNING *`,
      [id, title, rating, timeSpent, email]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Game not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
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
    res.status(500).json({ error: "Database error" });
  }
});

// --- PUBLIC ENDPOINTS ---
app.get("/api/games/public/popular", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, rating, timeSpent, dateAdded
       FROM games
       ORDER BY rating DESC, timeSpent DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/games/public/recent", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, rating, timeSpent, dateAdded
       FROM games
       ORDER BY dateAdded DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/games/public/search", async (req, res) => {
  const title = ((req.query.title as string) || "").toLowerCase();
  try {
    const result = await pool.query(
      `SELECT id, title, rating, timeSpent, dateAdded
       FROM games
       WHERE LOWER(title) LIKE $1
       LIMIT 20`,
      [`%${title}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
