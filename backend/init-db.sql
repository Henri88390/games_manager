CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  title TEXT NOT NULL,
  rating INTEGER NOT NULL,
  timeSpent INTEGER NOT NULL,
  dateAdded TIMESTAMP DEFAULT NOW()
);


INSERT INTO games (email, title, rating, timeSpent, dateAdded) VALUES
('demo@privio.com', 'The Legend of Zelda', 5, 120, NOW() - INTERVAL '10 days'),
('demo@privio.com', 'Super Mario Odyssey', 4, 60, NOW() - INTERVAL '5 days'),
('demo@privio.com', 'Minecraft', 5, 200, NOW() - INTERVAL '2 days'),
('demo@privio.com', 'Stardew Valley', 4, 80, NOW() - INTERVAL '1 days'),
('demo@privio.com', 'Celeste', 5, 30, NOW());

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL
);