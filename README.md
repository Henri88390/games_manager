# Setup

---

## 1. Clone the Repository

```bash
git clone https://github.com/Henri88390/games_manager.git
cd games_manager
```

---

## 2. Backend Setup

Make sure you have [Docker](https://www.docker.com/) installed.

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database with demo data and default game images
- Backend API server

---

## 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 4. Configure the Frontend (optional)

If you want to test the pagination with different values, create a `.env` file in `/frontend`:

```
VITE_PAGINATION_LIMIT=5
```

---

## Features

- **Game Management**: Add, edit, delete games with ratings and time spent
- **Image Upload**: Upload images for each game (max 5MB, JPG/PNG/GIF/SVG)
- **Public Space**: View popular and recent games from all users
- **Public Space Search**: Search games by title or user
- **Search**: Search games by title, rating, time spent, or date
- **Demo Data**: Includes 5 demo games with real game cover images

---

## Testing

The project includes comprehensive backend API tests. See [`backend/TESTING.md`](backend/TESTING.md) for testing documentation.

```bash
# Run backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage
```

---

## CI/CD

This project uses GitHub Actions for continuous integration. See [`CI_CD.md`](CI_CD.md) for detailed CI/CD documentation.

**Automated testing runs on:**

- Push to `main` branch
- Pull requests to `main` branch

---

## Stopping the Database

```bash
docker-compose down
```

---
