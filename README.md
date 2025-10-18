# Game Manager Local Development Setup

---

### 1. Clone the Repository

```bash
git clone https://github.com/Henri88390/games_manager.git
cd games_manager
```

## 2. Backend Setup

### 2.1 Start the Application with Docker

Make sure you have [Docker](https://www.docker.com/) installed.

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database with demo data and default game images
- Backend API server with image upload functionality

The setup is fully automated and includes:

- Database initialization with sample games
- Real game cover images for demo games
- Image upload API endpoint
- Static file serving for uploaded images

---

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Configure the Frontend (optional)

If you want to test the pagination with different values, create a `.env` file in `/frontend`:

```
VITE_PAGINATION_LIMIT=10
```

---

## Features

- **Game Management**: Add, edit, delete games with ratings and time spent
- **Image Upload**: Upload images for each game (max 5MB, JPG/PNG/GIF/SVG)
- **Public Space**: View popular and recent games from all users
- **Search**: Search games by title, rating, time spent, or date
- **Demo Data**: Includes 5 demo games with real game cover images

---

## Stopping the Database

```bash
docker-compose down
```

## Deleting the database volumes

```bash
docker-compose down -v
```

---
