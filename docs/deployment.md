# Production Deployment Guide

This guide walks you through deploying the **AI-Powered Customer Support & CRM Platform** online using free or low-cost cloud services suitable for a student portfolio.

---

## 1. What You Will Need Online

To run this platform online, you will need:

1. **MySQL Database Instance (Online)**:
   - A hosted relational MySQL database (e.g. Free on **Aiven**, **Railway**, **Render**, or **PlanetScale**).
2. **Google Gemini API Key**:
   - A free API key from [Google AI Studio](https://aistudio.google.com/).
3. **AI Microservice Hosting (Python FastAPI)**:
   - Web Service on **Render**, **Railway**, or a VPS.
4. **Main Backend Hosting (Node.js/Express)**:
   - Web Service on **Render**, **Railway**, or a VPS.
5. **Frontend Hosting (React/Vite)**:
   - Web App on **Vercel**, **Netlify**, or **Render**.

---

## 2. Step-by-Step Deployment (Recommended: Render + Vercel)

### Step 1: Provision a Free Online MySQL Database
1. Go to [Aiven.io](https://aiven.io/) or [Railway.app](https://railway.app/).
2. Create a free **MySQL 8** service.
3. Copy your connection credentials:
   - `DB_HOST` (e.g. `mysql-xxxx.aivencloud.com`)
   - `DB_PORT` (e.g. `12345`)
   - `DB_USER` (e.g. `avnadmin`)
   - `DB_PASSWORD` (e.g. `AVNS_...`)
   - `DB_NAME` (e.g. `customer_support_crm` or `defaultdb`)
4. Initialize and seed the remote database by running locally with the remote `.env` settings:
   ```bash
   cd server
   npm run db:init
   npm run db:seed
   ```

---

### Step 2: Deploy the FastAPI AI Microservice
1. Push your project code to GitHub.
2. Sign up on [Render.com](https://render.com/) and click **New + > Web Service**.
3. Select your GitHub repository.
4. Configure the service:
   - **Root Directory**: `ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: *(Your key from https://aistudio.google.com/)*
6. Click **Deploy Web Service** and copy your live URL (e.g. `https://ai-service-xxx.onrender.com`).

---

### Step 3: Deploy the Node.js Express Backend
1. On Render, click **New + > Web Service** and select the same repository.
2. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `DB_HOST`: *(From Step 1)*
   - `DB_PORT`: *(From Step 1)*
   - `DB_USER`: *(From Step 1)*
   - `DB_PASSWORD`: *(From Step 1)*
   - `DB_NAME`: *(From Step 1)*
   - `JWT_SECRET`: *(A random 64-character secure string)*
   - `JWT_EXPIRES_IN`: `7d`
   - `AI_SERVICE_URL`: *(Your live AI service URL from Step 2, e.g. `https://ai-service-xxx.onrender.com`)*
4. Click **Deploy Web Service** and copy your live backend URL (e.g. `https://crm-api-xxx.onrender.com`).

---

### Step 4: Deploy the React Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com/) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: *(Your live Express backend URL from Step 3, e.g. `https://crm-api-xxx.onrender.com`)*
5. Click **Deploy**!

---

## 3. Production Environment Variables Summary

| Service | Variable Name | Example / Purpose |
| :--- | :--- | :--- |
| **ai-service** | `GEMINI_API_KEY` | Google Gemini API Key |
| **server** | `DB_HOST` | Remote MySQL server host |
| **server** | `DB_PORT` | Remote MySQL port (e.g. `3306` or cloud port) |
| **server** | `DB_USER` | MySQL database username |
| **server** | `DB_PASSWORD` | MySQL database password |
| **server** | `DB_NAME` | MySQL database name |
| **server** | `JWT_SECRET` | Strong secret string for signing JWT tokens |
| **server** | `AI_SERVICE_URL` | Live URL of the FastAPI microservice |
| **client** | `VITE_API_URL` | Live URL of the Express backend |
