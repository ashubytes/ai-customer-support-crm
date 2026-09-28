# NexusCRM - AI-Powered Customer Support & CRM Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL 8](https://img.shields.io/badge/MySQL_8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)

A portfolio-grade, full-stack AI-Powered Customer Support & CRM Platform built for real-world enterprise workflows. It features automated AI ticket triage, sentiment analysis, smart reply generation via Google Gemini API, 360-degree Customer CRM interaction timelines, multi-role RBAC, and analytics visualizations.

---

## Key Features

1. AI Ticket Triage & Analysis:
   - Automated category classification across 10 categories (Payment, Technical Issue, Billing, etc.).
   - Severity and priority detection (Low, Medium, High, Urgent).
   - Real-time customer sentiment analysis (Positive, Neutral, Negative).
   - 1-2 sentence executive issue summary.

2. AI-Assisted Reply Composer:
   - Context-aware draft reply generator powered by Gemini 1.5 Flash.
   - One-click insertion into the agent response composer.
   - Regeneration button and safety guard (AI never sends messages without agent review).

3. 360° Customer CRM:
   - Comprehensive customer profile views with contact info, company details, and notes.
   - Chronological interaction timeline tracking ticket submissions, agent replies, and lifecycle changes.
   - Key customer KPI metrics (total tickets, active tickets, resolved count).

4. Multi-Role Role-Based Access Control (RBAC):
   - Customer: Submit tickets, view own ticket status, chat with support agents, update profile.
   - Support Agent: Filter ticket queue, manage ticket status/priority, assign agents, use AI assistance panel, search CRM directory, inspect customer timelines, view support analytics.
   - Administrator: Manage system users/agents, toggle active status, change roles, oversee global ticket feed, and view executive KPI reports.

5. Support & CRM Analytics:
   - Interactive charts powered by Recharts (Category breakdown, Priority distribution, Sentiment analysis, Lifecycle status funnel).
   - Real-time support agent performance table with individual resolution speeds.

---

## Architecture

```text
               +---------------------------------------------------+
               |          React + TypeScript + Vite + Tailwind      |
               |          (Port 5173 - Customer / Agent / Admin)   |
               +---------------------------------------------------+
                                         |
                                         | REST API (Axios + JWT)
                                         v
               +---------------------------------------------------+
               |        Node.js + Express + TypeScript Backend     |
               |           (Port 5000 - REST API & Auth RBAC)      |
               +---------------------------------------------------+
                         /                               \
                        / (mysql2 connection pool)        \ (HTTP requests)
                       v                                   v
        +-----------------------------+     +-------------------------------+
        |     MySQL 8 Relational DB   |     |      FastAPI AI Microservice  |
        |   `customer_support_crm`    |     |   (Port 8000 - Pydantic validation)
        |  (users, customers, tickets,|     +-------------------------------+
        |   messages, ticket_history) |                     |
        +-----------------------------+                     v
                                            +-------------------------------+
                                            |       Google Gemini API       |
                                            | (Ticket Triage & Smart Reply) |
                                            +-------------------------------+
```

---

## Demo Accounts (Seed Data)

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@crm.local` | `Admin@123` | Full system control, user management, global analytics |
| **Support Agent** | `agent.sarah@crm.local` | `Agent@123` | Ticket queue, AI assistance panel, CRM directory, metrics |
| **Support Agent** | `agent.alex@crm.local` | `Agent@123` | Ticket queue, assignments, CRM profile view |
| **Customer** | `john.doe@example.com` | `Customer@123` | Submit requests, track ticket status, chat with agents |
| **Customer** | `emily.smith@techcorp.io` | `Customer@123` | Enterprise customer with technical support inquiries |

> Tip: The Login page includes 1-click **Quick Fill Demo Account** buttons for instant access during presentations and placement interviews!

---

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MySQL 8.x (running on localhost:3306)

---

### Step 1: Database Initialization & Seeding

```bash
cd server

# 1. Create the database and schema tables
npm run db:init

# 2. Seed demo accounts, realistic tickets, messages, and audit history
npm run db:seed
```

---

### Step 2: Start the FastAPI AI Microservice

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server (Port 8000)
python -m uvicorn app.main:app --reload --port 8000
```
> Note: If `GEMINI_API_KEY` is not set, the AI service automatically uses intelligent rule-based NLP fallback so all triage features work offline!

---

### Step 3: Start the Express Backend Server

```bash
cd server

# Run backend development server (Port 5000)
npm run dev
```

---

### Step 4: Start the React Frontend

```bash
cd client

# Run Vite development server (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Testing

### Backend API Integration Tests
```bash
cd server
npm test
```
*Validates health checks, login, JWT verification, ticket creation, automated AI triage, customer CRM 360 profile, and RBAC security rules (13/13 passing).*

### AI Microservice Tests
```bash
cd ai-service
pytest
```
*Validates `/health`, `/api/ai/analyze-ticket`, and `/api/ai/suggest-response` with Pydantic schemas (3/3 passing).*

### Frontend Type-Checking & Build
```bash
cd client
npm run build
```

---


## 📄 Documentation Links
- [System Architecture](docs/architecture.md)
- [Database Schema & ERD](docs/database.md)
- [REST API Reference](docs/api.md)
