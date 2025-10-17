# Privio Local Development Setup

---

### 1. Clone the Repository

```bash
git clone https://github.com/Henri88390/privio_test.git
cd privio_test
```

## 2. Backend Setup

### 2.1 Start the Local Database

Make sure you have [Docker](https://www.docker.com/) installed.

```bash
docker-compose up -d
```

This will start a PostgreSQL database with demo data.

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

## Stopping the Database

```bash
docker-compose down
```

## Deleting the database volumes

```bash
docker-compose down -v
```

---
