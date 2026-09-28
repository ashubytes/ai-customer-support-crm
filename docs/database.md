# Database Architecture & Entity Relationship Guide

## 1. Database Overview
- **Engine**: MySQL 8.x
- **Database Name**: `customer_support_crm`
- **Driver**: `mysql2/promise` with Connection Pooling (10 concurrent pool connections)
- **Character Set**: `utf8mb4` with `utf8mb4_unicode_ci`

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o| customers : "linked to"
    users ||--o{ tickets : "assigned agent"
    customers ||--o{ tickets : "creates"
    tickets ||--o{ messages : "has"
    users ||--o{ messages : "sends"
    tickets ||--o{ ticket_history : "tracks"
    users ||--o{ ticket_history : "actor"

    users {
        int id PK
        string name
        string email UK
        string password_hash
        enum role "customer, agent, admin"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    customers {
        int id PK
        int user_id FK
        string name
        string email UK
        string phone
        string company
        text notes
        timestamp created_at
        timestamp updated_at
    }

    tickets {
        int id PK
        string ticket_number UK
        int customer_id FK
        int assigned_agent_id FK
        string subject
        text description
        enum category "Account, Payment, Billing, Refund, Technical Issue, Login, Order, Product, Delivery, Other"
        enum priority "Low, Medium, High, Urgent"
        enum sentiment "Positive, Neutral, Negative"
        enum status "Open, Assigned, In Progress, Pending, Resolved, Closed"
        text ai_summary
        text ai_suggested_reply
        timestamp resolved_at
        timestamp created_at
        timestamp updated_at
    }

    messages {
        int id PK
        int ticket_id FK
        int sender_id FK
        text message
        enum sender_type "customer, agent, admin, system"
        boolean is_internal
        timestamp created_at
    }

    ticket_history {
        int id PK
        int ticket_id FK
        int actor_id FK
        string action
        string old_value
        string new_value
        text notes
        timestamp created_at
    }
```

---

## 3. Database Indexes & Performance Optimization
- `users`: Indexes on `email` (Unique) and `role`.
- `customers`: Indexes on `email` (Unique), `company`, and `user_id`.
- `tickets`: Indexes on `customer_id`, `assigned_agent_id`, `status`, `priority`, `category`, and `ticket_number` (Unique).
- `messages`: Indexes on `ticket_id`, `sender_id`, and `created_at`.
- `ticket_history`: Indexes on `ticket_id`, `actor_id`, and `created_at`.
