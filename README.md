# 🪔 Roam-e-o — AI India Travel Planner

A full-stack AI-powered India travel planner that generates personalised itineraries, budget breakdowns, day-by-day plans and curated place reels using the Groq LLM API.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 (via CDN), CSS3, Chart.js  |
| Backend    | Node.js, Express.js                 |
| Database   | MySQL + Sequelize ORM               |
| AI         | Groq API (llama-3.3-70b) — FREE     |
| Auth       | JWT + bcrypt                        |
| PDF Export | PDFKit                              |

---

## Features

- 🗺️ Visual destination picker — 80+ India destinations across 8 regions
- 🤖 AI-generated itineraries via Groq LLM (under 3 seconds)
- 📅 Day-by-day itinerary with timed activities, tips and costs
- 💰 Budget breakdown in ₹ INR across 6 categories
- 🌤️ Season advisor — IDEAL / GOOD / AVOID ratings
- 📱 Place reels with YouTube, Instagram & TikTok links
- 🗣️ Regional language phrases per destination
- 🧠 Insider tips specific to each destination
- 💾 Save, edit and delete trips
- 📄 Export itinerary as PDF
- 🔐 JWT authentication with bcrypt password hashing
- 🔍 Filter trips by destination and region
- 📊 REST API with 12 endpoints

---

## Project Structure

```
Roam-e-o/
├── frontend/
│   └── index.html          # Complete React app — all pages in one file
│
├── backend/
│   ├── server.js           # Express entry point + MySQL sync
│   ├── package.json
│   ├── .env.example        # Environment variable template
│   ├── config/
│   │   └── database.js     # Sequelize MySQL connection
│   ├── middleware/
│   │   └── auth.js         # JWT verify middleware
│   ├── models/
│   │   ├── User.js         # Sequelize User model (bcrypt hooks)
│   │   └── Trip.js         # Sequelize Trip model (JSON columns + indexes)
│   └── routes/
│       ├── auth.js         # POST /signup /login GET /me
│       ├── generate.js     # POST /generate → Groq AI → auto-save to MySQL
│       ├── trips.js        # GET/PATCH/DELETE with filtering & pagination
│       └── export.js       # GET /export/:id → PDF download
│
└── README.md
```

---

## MySQL Schema

Tables are created automatically by Sequelize on server start — no manual SQL needed.

```sql
-- users
id | name | email | password | created_at | updated_at

-- trips
id | user_id | destination | region | days_count | budget |
travellers | travel_style | stay_pref | season (JSON) |
quick_facts (JSON) | budget_breakdown (JSON) | days (JSON) |
reels (JSON) | insider_tips (JSON) | local_phrases (JSON) |
is_edited | created_at | updated_at
```

---

## API Endpoints

| Method | Route              | Auth | Description                    |
|--------|--------------------|------|--------------------------------|
| POST   | /api/auth/signup   | No   | Create account                 |
| POST   | /api/auth/login    | No   | Login → JWT token              |
| GET    | /api/auth/me       | Yes  | Get current user               |
| POST   | /api/generate      | Yes  | Generate + auto-save itinerary |
| GET    | /api/trips         | Yes  | All trips (filter + paginate)  |
| GET    | /api/trips/:id     | Yes  | Single trip                    |
| PATCH  | /api/trips/:id     | Yes  | Edit trip                      |
| DELETE | /api/trips/:id     | Yes  | Delete trip                    |
| GET    | /api/export/:id    | Yes  | Download trip as PDF           |
| GET    | /api/health        | No   | Health check                   |

---

## Setup & Run

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Free Groq API key from [console.groq.com](https://console.groq.com)

### Step 1 — Create MySQL database
```bash
mysql -u root -p
CREATE DATABASE roameo;
EXIT;
```

### Step 2 — Configure environment
Create `backend/.env` (use `.env.example` as template):
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=roameo
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=any_long_random_string
GROQ_API_KEY=gsk_your_key_here
```

### Step 3 — Install and start backend
```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MySQL tables synced
🚀 Server running at http://localhost:5000
```

### Step 4 — Open frontend
Open `frontend/index.html` directly in your browser.

---

## Environment Variables

| Variable    | Description                         | Where to get           |
|-------------|-------------------------------------|------------------------|
| DB_HOST     | MySQL host (usually localhost)      | Your machine           |
| DB_NAME     | Database name (roameo)              | You create it          |
| DB_USER     | MySQL username                      | Your MySQL setup       |
| DB_PASS     | MySQL password                      | Your MySQL setup       |
| JWT_SECRET  | Any long random string              | Make one up            |
| GROQ_API_KEY| Free LLM API key                   | console.groq.com       |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.

---

## Deployment

| Part     | Platform              | Cost |
|----------|-----------------------|------|
| Frontend | Netlify / GitHub Pages| Free |
| Backend  | Render.com            | Free |
| Database | Railway / PlanetScale | Free |

---

## Resume Description

> Built a full-stack AI travel itinerary planner using React, Node.js/Express and MySQL with Sequelize ORM, integrating the Groq LLM API to generate personalised India trip plans in under 3 seconds. Implemented JWT authentication with bcrypt, REST API with 10 endpoints, JSON column storage for nested itinerary data with compound indexes, and one-click PDF export via PDFKit. Frontend built in React 18 with 4 pages — Plan, My Trips, Login and Signup.