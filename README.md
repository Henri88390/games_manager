# Privio Local Development Setup

---

## Backend Setup

### 1. Start the Local Database

Make sure you have [Docker](https://www.docker.com/) installed.

```bash
docker-compose up -d
```

This will start a PostgreSQL database with demo data.

### 2. Configure the Backend

Create a `.env` file in `/backend`:

```
DATABASE_URL=postgresql://privio:privio@localhost:5432/privio
```

### 3. Run the Backend

```bash
cd backend
npm install
npm run dev
```

---

## Frontend Setup

### 1. Configure the Frontend

Create or edit a `.env` file in `/frontend`:

```
VITE_PAGINATION_LIMIT=10
```

You can change this value to set the default number of items per page in paginated views.

> **Note:** Restart the frontend dev server after changing this value for it to take effect.

### 2. Run the Frontend

```bash
cd frontend
npm install
npm start
```

---

## Stopping the Database

```bash
docker-compose down
```

---

**Demo login:**  
Email: `demo@privio.com`  
Password: _(set up in your auth system or use signup)_

---

Now anyone can set up your project and see demo games with just a few
