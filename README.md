# Privio Local Development Setup

---

## Backend Setup

### 1. Start the Local Database

Make sure you have [Docker](https://www.docker.com/) installed.

```bash
docker-compose up -d
```

This will start a PostgreSQL database with demo data.

---

## Frontend Setup

### 1. Configure the Frontend (optional)

If you want to test the pagination with different values, create a `.env` file in `/frontend`:

```
VITE_PAGINATION_LIMIT=10
```

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Stopping the Database

```bash
docker-compose down
```

---

**Demo login:**  
Sign up in the login page using any email and a chosen password.
