import { Router, type Request, type Response } from "express";
import { pool } from "../db";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
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

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
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

export default router;
