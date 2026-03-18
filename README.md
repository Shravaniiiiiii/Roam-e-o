# 🪔 Roam-e-o — Full Stack AI India Travel Planner

**Resume-grade full stack project.**
React · Node.js/Express · MongoDB · Groq LLM · JWT Auth · Chart.js · PDF Export · REST API

---

## Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18, Chart.js, CSS3    |
| Backend    | Node.js, Express.js         |
| Database   | MongoDB + Mongoose          |
| AI         | Groq API (llama-3.3-70b)    |
| Auth       | JWT + bcrypt                |
| Analytics  | MongoDB Aggregation Pipelines|
| Export     | PDFKit                      |

---

## Features

- ✅ User signup/login with JWT authentication
- ✅ AI-generated India travel itineraries via Groq LLM
- ✅ Auto-save every generated trip to MongoDB
- ✅ Save, edit, delete trips
- ✅ Destination + region based filtering
- ✅ **Analytics dashboard** — trips/month, top destinations, budget breakdown, travel style distribution
- ✅ **MongoDB aggregation pipelines** for all analytics queries
- ✅ **Export itinerary as PDF** — full formatted download
- ✅ Budget estimator with animated bar visualizations
- ✅ Chart.js charts — Bar, Doughnut, Horizontal Bar, Pie
- ✅ Collapsible day-by-day itinerary with activities, tips, costs
- ✅ Place reels with YouTube/Instagram/TikTok/Google links
- ✅ Local language phrases per destination
- ✅ REST API with 12 endpoints

---

## Project Structure

```
roameo/
├── frontend/
│   └── index.html            # React app (all pages)
│
├── backend/
│   ├── server.js             # Express app entry point
│   ├── .env                  # Secrets (never commit!)
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Trip.js           # Trip schema (with indexes)
│   └── routes/
│       ├── auth.js           # /api/auth/signup, login, me
│       ├── generate.js       # /api/generate (Groq AI)
│       ├── trips.js          # /api/trips CRUD + filter
│       ├── analytics.js      # /api/analytics (aggregation)
│       └── export.js         # /api/export/:id (PDF)
│
└── README.md
```

---

## Quick Start

### 1. Get free API keys

**Groq API** (free, no credit card)
1. Go to console.groq.com
2. Sign up → API Keys → Create Key
3. Copy the key (starts with `gsk_...`)

**MongoDB** (free local or Atlas)
- Local: install from mongodb.com
- Cloud: free at mongodb.com/atlas

### 2. Setup backend

```bash
cd backend
npm install
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/roameo
JWT_SECRET=change_this_to_random_string
GROQ_API_KEY=gsk_your_key_here
```

### 3. Start MongoDB (if local)
```bash
mongod
```

### 4. Start backend
```bash
npm run dev
# Server: http://localhost:5000
# API docs auto at http://localhost:5000/api/health
```

### 5. Open frontend
Open `frontend/index.html` in browser.

---

## API Endpoints

| Method | Route                    | Auth | Description               |
|--------|--------------------------|------|---------------------------|
| POST   | /api/auth/signup         | No   | Create account            |
| POST   | /api/auth/login          | No   | Login → JWT token         |
| GET    | /api/auth/me             | Yes  | Current user              |
| POST   | /api/generate            | Yes  | Generate + save itinerary |
| GET    | /api/trips               | Yes  | All trips (filter/page)   |
| GET    | /api/trips/:id           | Yes  | Single trip               |
| PATCH  | /api/trips/:id           | Yes  | Edit trip                 |
| DELETE | /api/trips/:id           | Yes  | Delete trip               |
| GET    | /api/analytics/dashboard | Yes  | User analytics            |
| GET    | /api/analytics/global    | Yes  | Global stats              |
| GET    | /api/export/:id          | Yes  | Download PDF              |
| GET    | /api/health              | No   | Health check              |

---

## MongoDB Aggregation Pipelines Used

```js
// Trips per month
{ $group: { _id: { year, month }, count: { $sum: 1 } } }

// Top destinations
{ $group: { _id: '$destination', count: { $sum: 1 } } }

// Average budget breakdown
{ $group: { avg_accommodation: { $avg: '...' }, ... } }

// By region / style / traveller type
{ $group: { _id: '$region', count: { $sum: 1 } } }

// Summary stats (unique regions, total spent)
{ $group: { unique_regions: { $addToSet: '$region' } } }
```

---

## Resume Description

> Built a full-stack AI travel itinerary planner using React, Node.js/Express, and MongoDB, integrating the Groq LLM API to generate personalised India trip plans in under 3 seconds. Implemented JWT authentication, MongoDB aggregation pipelines for user analytics (trips/month, top destinations, budget breakdowns), an interactive Chart.js dashboard, and one-click PDF export. REST API with 12 endpoints, Mongoose schemas with compound indexes, and a React frontend with 4 pages — Plan, My Trips, Analytics, and Auth.

---

## Deployment (all free)

| Part     | Platform       |
|----------|----------------|
| Frontend | Netlify / GitHub Pages |
| Backend  | Render.com     |
| Database | MongoDB Atlas  |
