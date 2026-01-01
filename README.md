# Delivery Zone Pricing Platform (FastAPI + Next.js + PostgreSQL)

A full-stack **GeoService + Pricing Engine** you can showcase in your portfolio:  
define **delivery zones (polygons)**, calculate **distance-based delivery pricing**, keep **version history + audit trail** for every change, and visualize **quote analytics**—with a modern Next.js (App Router) UI.

---

## Table of Contents

- [What this project is](#what-this-project-is)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Repo structure](#repo-structure)
- [Prerequisites (Windows 11)](#prerequisites-windows-11)
- [Quick start (local dev)](#quick-start-local-dev)
- [Backend setup (FastAPI)](#backend-setup-fastapi)
- [Database setup (PostgreSQL)](#database-setup-postgresql)
- [Frontend setup (Next.js)](#frontend-setup-nextjs)
- [Run the full app](#run-the-full-app)
- [Default accounts / seed data](#default-accounts--seed-data)
- [Core pages walkthrough](#core-pages-walkthrough)
- [API overview](#api-overview)
- [GeoJSON import/export format](#geojson-importexport-format)
- [Versioning + audit trail](#versioning--audit-trail)
- [Analytics dashboard](#analytics-dashboard)
- [Caching & validation notes](#caching--validation-notes)
- [Map integration (free)](#map-integration-free)
- [VS Code setup (recommended)](#vs-code-setup-recommended)
- [Common issues & fixes (QA checklist)](#common-issues--fixes-qa-checklist)
- [Deployment (no Docker)](#deployment-no-docker)
- [Roadmap / enhancements](#roadmap--enhancements)
- [License](#license)

---

## What this project is

This is an **intermediate-to-advanced** portfolio project that looks like a real internal tool used by logistics / last-mile delivery teams.

It solves a practical problem:

1. **Warehouses** serve deliveries in defined geographic areas  
2. Each warehouse has one or more **delivery zones** (polygons)  
3. A user picks a destination point → the system:
   - checks if the point falls **inside a zone**
   - calculates **distance from pickup/warehouse**
   - applies **distance slab pricing** and returns the delivery fee
4. Admins can update zones and pricing with:
   - **Audit logging** (who changed what, when)
   - **Version history** (before/after snapshots)
   - **GeoJSON import/export** for easy polygon management
5. An analytics page shows **recent quotes trends**.

---

## Key features

### Backend (FastAPI)
- ✅ JWT Authentication (login, protected routes)
- ✅ Warehouses CRUD (basic)
- ✅ Delivery Zones (polygon storage + inside-zone validation)
- ✅ Distance Pricing Engine (slab rules)
- ✅ Quote API (serviceable? matched zone? km distance? price?)
- ✅ **Zone versioning** & **pricing versioning**
- ✅ **Audit trail** (actor + action + timestamps + snapshots/meta)
- ✅ Simple caching layer for repeated quote calls
- ✅ Strong validation (schema + geo checks)

### Frontend (Next.js App Router)
- ✅ Login + token storage
- ✅ Admin Zones page (view polygons, import/export GeoJSON)
- ✅ Admin Pricing page (slabs + version history)
- ✅ Audit logs page
- ✅ Simulation page (pick point on map → see quote)
- ✅ Analytics page (recent quote charts)
- ✅ Modern UI components + animations (preloader, transitions, hover effects)

---

## Tech stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Leaflet (map) + OpenStreetMap tiles (free)

**Backend**
- FastAPI
- SQLAlchemy ORM
- Pydantic
- JWT auth
- PostgreSQL

---

## Repo structure

> should keep **only one Next.js App Router source directory**.  
> This repo uses: `web/src/app`



Delivery-Zone-Pricing-Platform/
├─ api/ # FastAPI backend
│ ├─ app/
│ │ ├─ api/v1/ # REST routes
│ │ ├─ core/ # settings, security
│ │ ├─ db/ # SQLAlchemy base/session
│ │ ├─ models/ # ORM models
│ │ ├─ schemas/ # Pydantic schemas
│ │ ├─ services/ # geo/pricing/audit/cache logic
│ │ └─ main.py # FastAPI entrypoint
│ ├─ requirements.txt
│ ├─ .env.example
│ └─ (no sqlite db committed)
│
├─ web/ # Next.js frontend (App Router)
│ ├─ src/
│ │ ├─ app/ # routes (pages)
│ │ ├─ components/ # UI + maps + animations
│ │ └─ lib/ # api client, auth, types
│ ├─ public/
│ ├─ package.json
│ ├─ next.config.mjs
│ ├─ tsconfig.json
│ ├─ eslint.config.mjs
│ └─ .env.local.example
│
├─ README.md
├─ LICENSE
└─ .gitignore



---

## Prerequisites (Windows 11)

Install these first:

1. **Python** (recommended: 3.11 or 3.12)
   - ⚠️ Python 3.13 can work, but some crypto libs (bcrypt/passlib) may be annoying on Windows.
2. **Node.js** (LTS recommended)
3. **PostgreSQL** (local)
   - You can install via the official installer or use pgAdmin
4. **VS Code**
5. **Git**

> If you are already on Python 3.13: it’s okay—just follow the troubleshooting section if bcrypt issues appear.

---

## Quick start (local dev)

### 1) Clone repo
```powershell
git clone https://github.com/bilalhassankhan007/Delivery-Zone-Pricing-Platform.git
cd Delivery-Zone-Pricing-Platform
code .

2) Start backend
cd api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

Create .env from .env.example and set PostgreSQL DATABASE_UR

Run API:
uvicorn app.main:app --reload --port 8000

Open:
API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs


3) Start frontend
Open a new terminal:

cd web
npm install
copy .env.local.example .env.local
npm run dev


Open:
Frontend: http://localhost:3000


Backend setup (FastAPI)
Create + activate virtual environment

cd api
python -m venv .venv
.\.venv\Scripts\activate

Install dependencies
pip install -r requirements.txt



Configure environment
copy .env.example .env
Then edit .env (important keys are below).



Database setup (PostgreSQL)
Create database (recommended)

Use pgAdmin or run in psql:
CREATE DATABASE zonepilot;

Configure your DATABASE_URL
In api/.env (example):

DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/zonepilot
If your password has special characters, wrap it or URL-encode it.


** Table creation ** 
This project creates tables automatically on startup (via SQLAlchemy Base.metadata.create_all(...)).
So your first backend run will build tables.

FRONTEND SETUP (Next.js)
Install dependencies

cd web
npm install

Create .env.local
copy .env.local.example .env.local


Set your backend base URL:
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000


Run dev server
npm run dev


RUN THE FULL APP:
You should run two terminals in VS Code:


Terminal 1 — Backend
cd api
.\.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000


Terminal 2 — Frontend
cd web
npm run dev


Default accounts / seed data

On API startup, the app can seed:
- an admin user
- demo warehouse, zones and slabs (if enabled)

Check api/.env.example for:
- SEED_ADMIN_EMAIL
- SEED_ADMIN_PASSWORD
- SEED_DEMO=1 (enable demo data)

⚠️ bcrypt limit: keep SEED_ADMIN_PASSWORD under 72 bytes (see troubleshooting).



Core pages walkthrough: - 

Frontend routes (App Router):
- /login
Login and store JWT in localStorage.

- /admin/zones
Manage zones, import/export GeoJSON, see version history.

- /admin/pricing
Manage distance slabs, see pricing versions.

- /admin/audit
Read audit logs (filter/search).

- /simulation
Pick points on a map → call quote API → display serviceability + price.

- /analytics
Recent quotes chart + summary widgets.


API OVERVIEW: 
Exact endpoints may vary slightly—use Swagger docs at /docs for the source of truth.

Typical routes: - 
- POST /auth/login → JWT token
- GET /warehouses
- GET /warehouses/{id}/zones
- POST /zones (GeoJSON create)
- GET /zones/{id}/versions
- GET /pricing/slab-versions?page=1
- GET /audit/logs?limit=200
- POST /quote (compute quote)


GeoJSON import/export format:
Admin UI supports GeoJSON for zones.

Example Polygon GeoJSON - 
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Central Zone", "color": "#7C3AED" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [77.1025, 28.7041],
            [77.2800, 28.7041],
            [77.2800, 28.5200],
            [77.1025, 28.5200],
            [77.1025, 28.7041]
          ]
        ]
      }
    }
  ]
}

Note: GeoJSON uses [lng, lat] order in coordinates.


VERSIONING + AUDIT TRAIL

- Every admin change is designed to be reviewable:

- Zone versioning: stores snapshots of polygons per update

- Pricing versioning: stores snapshots of slab rules per update

- Audit log records:

- - actor (user/email)

- - action

- - entity + entity_id

- - timestamp

- - optional snapshot/meta

This is exactly the kind of “enterprise detail” interviewers love.

ANALYTICS DASHBOARD: - 
Analytics page shows:

- quotes in last 24 hours
- serviceable vs unserviceable
- average distance + average price
- recent quote chart (trend)
Data comes from quote logs saved on every quote call.

CACHING and VALIDATION NOTES:

Caching:
- quote responses can be cached (e.g., same lat/lng requests)

Validation:
- input validation with Pydantic
- geo validation (polygon must be closed / valid shape)
- pricing slab validation (min/max ranges)

MAP INTEGRATION (free): 
This project uses:
- Leaflet (frontend map)
- OpenStreetMap tiles (free)


VS Code setup (recommended): 
Recommended VS Code extensions

1) Python (Microsoft)
2) Pylance
3) ESLint
4) Prettier
5) Tailwind CSS IntelliSense
6) PostgreSQL client (optional)

Open two terminals:
- Terminal 1: backend (venv activated)
- Terminal 2: frontend (npm dev)

