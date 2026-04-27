# 🍿 PopcornScore

A full-stack web platform to discover, rate, and review movies and TV shows.

**CL219 Database Systems Lab · Spring 2026 · FAST-NU Lahore**  
Group: Danish Shayan · Usman Ur Rehman · Zeeshan Ahmed · Mustafa Abid

---

## Tech Stack
| Layer    | Technology |
|----------|-----------|
| Frontend | React.js + Tailwind CSS (Vite) |
| Backend  | Node.js + Express.js |
| Database | Microsoft SQL Server (MSSQL) |

---

## Setup Instructions

### 1. Database — run in SSMS
Open `database.sql` in SSMS and execute it. This creates `PopcornScoreDB` with all tables and views.

Enable **SQL Server Authentication** in SSMS:
1. Right-click server → Properties → Security → "SQL Server and Windows Authentication mode"
2. Restart SQL Server service
3. Enable the `sa` account (or create a dedicated login)

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your DB credentials and JWT secret
npm install
npm run seed                # seeds genres, 30 titles, 25 people, cast, sample reviews
npm run dev                 # starts API on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

---

## Features
- **Browse** — search, filter by genre/type, sort by rating/popularity/date
- **User Auth** — register, login, JWT sessions
- **Rate & Review** — 1–10 star ratings with written reviews (create, update, delete)
- **Watchlist** — save titles to watch later
- **Trending** — most-rated content in the last 60 days
- **Top Rated** — highest average-rated titles
- **Recommendations** — based on your highest-rated genres
- **Actor Profiles** — full filmography per cast member
- **Rating History** — view and manage all your past ratings

---

## Sample Accounts (after seeding)
| Email | Password |
|-------|----------|
| cinephile99@example.com  | Test1234! |
| moviebuff42@example.com  | Test1234! |
| screenaddict@example.com | Test1234! |
