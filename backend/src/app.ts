import cors from "cors";
import express from "express";

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
