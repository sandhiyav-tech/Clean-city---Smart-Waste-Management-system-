# 🌿 CleanCity – Smart Waste Management System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsandhiyav-tech%2FClean-city---Smart-Waste-Management-system-)

A production-ready full-stack web application for municipal waste monitoring, citizen garbage reporting, and fleet route optimization. Built as a unified monorepo deploying seamlessly as **one single Vercel project**.

---

## 🚀 Live Demo Credentials

Seed data creates three pre-configured accounts (or click any one-click demo button on the login screen):

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@cleancity.com` | `Admin@123` | KPI analytics, Recharts charts, driver assignment, broadcast alerts, user role promotion |
| **Eco Driver** | `driver@cleancity.com` | `Driver@123` | Assigned pickups, 2-Opt TSP route planner, polyline map, one-click collection status |
| **Citizen** | `citizen@cleancity.com` | `Citizen@123` | Hotspot reporting with Leaflet map pin, photo upload, personal history & audit timeline |

---

## 🏗️ Architecture & Monorepo Structure

```
clean-city/
├── api/
│   └── index.js             # Vercel Serverless Function entry (exports Express app)
├── vercel.json              # Builds client (client/dist) and rewrites /api/* to Express
├── package.json             # Root monorepo scripts (dev, build, start, seed)
├── .env.example             # Template for environment variables
├── server/                  # Node.js + Express + MongoDB (Layered architecture)
│   └── src/
│       ├── config/          # Cached serverless Mongoose connection & Cloudinary
│       ├── models/          # User, Report (with geospatial & audit trail), Notification
│       ├── middleware/      # JWT auth (httpOnly cookie + Bearer), RBAC, Zod validation
│       ├── services/        # 2-Opt TSP Route Optimizer, Notification poller, Stats
│       ├── controllers/     # Auth, Reports, Routes, Stats, Users, Upload
│       ├── routes/          # Express route definitions
│       └── seed/            # Demo accounts & ~20 Chennai geolocated reports
└── client/                  # React + Vite + TypeScript + Tailwind CSS
    └── src/
        ├── api/             # Axios instance (/api baseURL, credentials)
        ├── context/         # Auth, Theme (dark mode), Notifications (15s polling)
        ├── components/      # Leaflet maps, custom markers, Recharts, tables, forms
        └── pages/           # Landing, Citizen, Admin, Driver, and Public Map portals
```

---

## ⚡ Quickstart (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v24)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/cleancity`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/cleancity.git
cd cleancity

# Install root, server, and client dependencies
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder and in `server/.env`:
```bash
cp .env.example .env
cp .env.example server/.env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cleancity?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary for cloud image storage (defaults to base64 Data URLs if omitted)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Seed the Database
Populates the demo accounts and ~20 realistic Chennai waste reports:
```bash
npm run seed
```

### 5. Launch Full Stack
Runs both the backend API (port 5000) and frontend client (port 5173 with proxy) concurrently:
```bash
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🍃 MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a new **M0 (Free Tier)** Cluster in your preferred region (e.g., `AWS / Mumbai`).
3. Under **Security → Database Access**, add a new database user (e.g., `cleancity_user`) with password authentication.
4. Under **Security → Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so Vercel serverless functions can connect.
5. In your cluster dashboard, click **Connect → Drivers → Node.js** and copy the connection string.
6. Replace `<password>` with your database user password and set it as `MONGODB_URI` in `.env`.

---

## ☁️ Cloudinary Setup (Optional)

CleanCity features an intelligent image handler:
- **With Cloudinary**: Uploaded garbage photos are securely stored in the cloud with automated web optimization and thumbnail generation.
- **Without Cloudinary**: Uploads automatically fall back to standard base64 Data URLs, allowing complete local development and testing with zero configuration.

To enable Cloudinary:
1. Sign up for a free account at [cloudinary.com](https://cloudinary.com).
2. In the Cloudinary Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into `.env` under `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

---

## 📡 REST API Reference

| Method | Endpoint | Auth | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | No | Public | Register citizen account |
| `POST` | `/api/auth/login` | No | Public | Sign in with email/password; sets httpOnly cookie |
| `POST` | `/api/auth/logout` | Yes | All | Clears session cookie |
| `GET` | `/api/auth/me` | Yes | All | Returns currently authenticated user profile |
| `GET` | `/api/reports` | Yes | Scoped | Fetch reports (citizen sees own, driver sees assigned, admin sees all) |
| `POST` | `/api/reports` | Yes | CITIZEN | Submit new waste report with geotagged coordinates |
| `GET` | `/api/reports/:id` | Yes | Scoped | Get single report details & status audit history |
| `PATCH`| `/api/reports/:id/assign` | Yes | ADMIN | Assign municipal driver to report |
| `PATCH`| `/api/reports/:id/status` | Yes | ADMIN, DRIVER | Update report status (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `COLLECTED`) |
| `DELETE`| `/api/reports/:id` | Yes | Creator / ADMIN | Delete a report |
| `POST` | `/api/routes/optimize` | Yes | ADMIN, DRIVER | Run 2-Opt TSP route optimizer; returns ordered stops & polyline |
| `GET` | `/api/notifications` | Yes | All | Get user notifications & broadcasts with unread count |
| `PATCH`| `/api/notifications/:id/read` | Yes | All | Mark notification as read |
| `PATCH`| `/api/notifications/read-all` | Yes | All | Mark all notifications as read |
| `POST` | `/api/notifications` | Yes | ADMIN | Broadcast notification to all or target role |
| `GET` | `/api/stats` | No | Public | System analytics (breakdowns, daily trends, collection hours) |
| `GET` | `/api/users` | Yes | ADMIN | List all registered users |
| `GET` | `/api/users/drivers` | Yes | ADMIN | Quick list of active drivers for dispatch |
| `PATCH`| `/api/users/:id/role` | Yes | ADMIN | Update user role (`CITIZEN`, `DRIVER`, `ADMIN`) |
| `POST` | `/api/upload` | Yes | All | Upload evidence image (Cloudinary / base64 fallback) |
| `GET` | `/api/health` | No | Public | System status and service timestamp |

---

## 🧠 2-Opt TSP Route Optimization Algorithm

CleanCity optimizes driver trajectories using a two-stage heuristic:
1. **Haversine Distance Matrix**: Accurately computes great-circle geographic distance over Earth's spherical surface between all `(latitude, longitude)` pairs in kilometers.
2. **Nearest-Neighbor (Greedy Tour)**: Begins at the municipal dispatch depot (e.g., Chennai Central) and iteratively links the closest unvisited waste location.
3. **2-Opt Edge Exchange**: Iteratively tests edge pairs `(i, i+1)` and `(j, j+1)`. If swapping and reversing the tour segment `[i+1 ... j]` decreases total tour distance, the exchange is applied. This eliminates crossings until the tour reaches local optimality.
4. **Interactive Leaflet Polyline**: The resulting optimal permutation is rendered on the driver's map as an eco-green path with sequential turn-by-turn stop checkpoints.

---

## 🚀 Step-by-Step Vercel Deployment

Deploy CleanCity as **ONE unified project** on Vercel:

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: initial commit for CleanCity Smart Waste System"
git branch -M main
git remote add origin https://github.com/<your-username>/cleancity.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New... → Project**.
3. Connect your GitHub account and select the **`cleancity`** repository.
4. Vercel automatically detects the root configuration (`vercel.json`). Keep **Root Directory** as `./` (default).

### Step 3: Configure Environment Variables in Vercel
In the project settings during import (or under **Settings → Environment Variables**), add:

| Key | Example Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.xyz.mongodb.net/cleancity?retryWrites=true&w=majority` |
| `JWT_SECRET` | `a_long_random_secure_secret_string_32_chars` |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | *(Optional) Your Cloudinary Cloud Name* |
| `CLOUDINARY_API_KEY` | *(Optional) Your Cloudinary API Key* |
| `CLOUDINARY_API_SECRET` | *(Optional) Your Cloudinary API Secret* |

### Step 4: Deploy & Verify
1. Click **Deploy**. Vercel will:
   - Run `npm run build` (compiling the TypeScript React frontend into `client/dist`).
   - Package `/api/index.js` into an ultra-fast Node.js serverless function.
   - Configure rewrites: `/api/*` goes to the Express backend, all other routes serve the React SPA with client-side routing.
2. Once deployed, open your live URL (e.g. `https://cleancity.vercel.app`).
3. Run `npm run seed` pointing to your Atlas `MONGODB_URI` once to populate initial demo data.

---

## 🛡️ Security & Reliability Features

- **httpOnly Secure Cookies**: Protection against Cross-Site Scripting (XSS) credential theft.
- **Centralized Error Envelope**: Consistent `{ success: boolean, message: string, errors: array }` responses.
- **Serverless Mongoose Caching**: Prevents connection exhaustion by caching the Mongoose connection promise across serverless function invocations.
- **Brute-Force Rate Limiting**: Exponential window limiting on `/api/auth/login` and `/api/auth/signup`.
- **Zod Strict Validation**: Type-safe payload schemas on all incoming client requests.
- **15-Second Polling & Unread Badges**: Real-time notifications for citizens when reports are collected and drivers when pickups are dispatched.

---

## 📄 License
MIT © CleanCity Initiative. Keeping our cities green, smart, and sustainable.

