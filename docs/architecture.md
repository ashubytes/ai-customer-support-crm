# System Architecture & Technical Specifications

## 1. High-Level Architecture

The **AI-Powered Customer Support & CRM Platform** is structured as a production-grade, three-tier microservice architecture:

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

## 2. Key Architecture Decisions & Security Guardrails

### 1. Separation of Concerns
- **Client Tier**: Pure single-page application built with React 18, TypeScript, and Vite. Handles presentation, client-side routing, and session state. The frontend has **zero** direct access to the database or Gemini API keys.
- **Backend Tier**: Express.js REST API in TypeScript. Manages database transactions, JWT authentication, role-based authorization guards, input validation, and business logic.
- **AI Microservice**: Python FastAPI service running independently on Port 8000. Encapsulates all interactions with the Google Gemini API, enforces strict Pydantic payload models, and implements resilient local NLP fallbacks.

### 2. Secure AI Execution Flow
```text
React (Customer submits form)
  ↓
POST /api/tickets (Express Backend)
  ↓
Express calls FastAPI (POST /api/ai/analyze-ticket)
  ↓
FastAPI invokes Google Gemini 1.5 Flash (Structured JSON Prompt)
  ↓
Sanitized & Validated AI Result (Category, Priority, Sentiment, Summary, Suggested Reply)
  ↓
Express saves Ticket & History Audit Trail to MySQL
  ↓
Returns Clean Ticket Entity to React UI
```

### 3. Graceful AI Fallback Mechanism
If the Gemini API key is not configured, the network is unreachable, or Gemini rate limits are encountered, the AI microservice falls back to a deterministic rule-based NLP parser. This guarantees that:
- Ticket creation **never** crashes or fails due to AI downtime.
- Agents always receive an initial triage draft.
- The platform remains 100% demoable offline and in local development.

### 4. Role-Based Access Control (RBAC)
Three distinct actor roles are enforced at the backend middleware layer:
- **`customer`**: Can only query and message on tickets matching their `customer_id`.
- **`agent`**: Can query all tickets, assign agents, update lifecycle states, draft internal staff notes, utilize AI reply suggestions, and view CRM customer 360° timelines.
- **`admin`**: Full system visibility, including user administration (activating/deactivating agents and assigning roles).
