import cors from "cors";
import express from "express";
import { Game } from "./types/game";

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
  res.status(201).json({ message: "User created" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });
  if (!users[email] || users[email].password !== password)
    return res.status(401).json({ error: "Invalid credentials" });
  res.json({ message: "Login successful" });
});

const userGames: { [email: string]: Game[] } = {};

app.get("/api/games", (req, res) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: "Missing email" });
  res.json(userGames[email] || []);
});

app.post("/api/games", (req, res) => {
  const { email, title, rating, timeSpent } = req.body;
  if (!email || !title || rating == null || timeSpent == null)
    return res.status(400).json({ error: "Missing fields" });
  if (typeof rating !== "number" || rating < 1 || rating > 5)
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  if (typeof timeSpent !== "number" || timeSpent < 0)
    return res.status(400).json({ error: "Time spent must be >= 0" });

  const game = {
    id: Date.now().toString(),
    title,
    rating,
    timeSpent,
    dateAdded: new Date().toISOString(),
  };
  userGames[email] = userGames[email] || [];
  userGames[email].push(game);
  return res.status(201).json(game);
});

app.put("/api/games/:id", (req, res) => {
  const { email, title, rating, timeSpent } = req.body;
  const { id } = req.params;
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });
  const games = userGames[email] || [];
  const game = games.find((g) => g.id === id);
  if (!game) return res.status(404).json({ error: "Game not found" });
  if (title) game.title = title;
  if (rating != null) game.rating = rating;
  if (timeSpent != null) game.timeSpent = timeSpent;
  res.json(game);
});

app.delete("/api/games/:id", (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  if (!email || !id) return res.status(400).json({ error: "Missing fields" });
  userGames[email] = (userGames[email] || []).filter((g) => g.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
