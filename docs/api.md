# REST API Reference & Endpoint Documentation

Base API URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new customer account and creates a linked CRM customer record.
- **Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password@123",
  "phone": "+1-555-0199",
  "company": "Smith Logistics"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 8,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "customer",
      "customerId": 5
    }
  }
}
```

### `POST /api/auth/login`
- **Access**: Public
- **Description**: Authenticates a user (Customer, Agent, Admin) and returns a signed JWT.
- **Request Body**:
```json
{
  "email": "agent.sarah@crm.local",
  "password": "Agent@123"
}
```

### `GET /api/auth/me`
- **Access**: Authenticated
- **Description**: Returns the authenticated user's profile and linked CRM ID.

---

## 2. Support Ticket Endpoints (`/api/tickets`)

### `POST /api/tickets`
- **Access**: Authenticated (Customer, Agent, Admin)
- **Description**: Creates a new ticket and automatically triggers Gemini AI triage.
- **Request Body**:
```json
{
  "subject": "Charged twice on invoice #9921",
  "description": "Our corporate credit card was billed twice for renewal.",
  "category": "Billing",
  "priority": "High"
}
```

### `GET /api/tickets`
- **Access**: Authenticated (Customers only see their own tickets; Agents and Admins see all).
- **Query Parameters**:
  - `status`: `Open | Assigned | In Progress | Pending | Resolved | Closed`
  - `priority`: `Low | Medium | High | Urgent`
  - `category`: Ticket category string
  - `search`: Keyword search in subject, description, customer name
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `20`)

### `GET /api/tickets/:id`
- **Access**: Authenticated (Customer must own the ticket; Agents/Admins have full access).
- **Response**: Ticket details, customer contact info, assigned agent, and audit history.

### `PUT /api/tickets/:id/status`
- **Access**: Agent, Admin
- **Request Body**:
```json
{
  "status": "In Progress",
  "notes": "Agent investigating gateway logs."
}
```

### `PUT /api/tickets/:id/assign`
- **Access**: Agent, Admin
- **Request Body**:
```json
{
  "agentId": 2
}
```

### `POST /api/tickets/:id/ai-suggest`
- **Access**: Agent, Admin
- **Description**: Generates an updated smart response suggestion based on ticket description and previous conversation history.

---

## 3. Ticket Messages (`/api/tickets/:id/messages`)

### `GET /api/tickets/:id/messages`
- **Access**: Authenticated (Internal notes are automatically hidden from Customers).

### `POST /api/tickets/:id/messages`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "message": "We have processed the full refund for invoice #9921.",
  "isInternal": false
}
```

---

## 4. CRM Customer Management (`/api/customers`)

### `GET /api/customers`
- **Access**: Agent, Admin
- **Description**: Search and list customer profiles with aggregated active/total ticket counts.

### `GET /api/customers/:id`
- **Access**: Agent, Admin
- **Description**: Returns 360-degree customer profile, including KPI stats, recent tickets, and the chronological interaction timeline.

---

## 5. Analytics (`/api/analytics/overview`)
- **Access**: Agent, Admin
- **Description**: Aggregates ticket volume, category distribution, priority distribution, sentiment analysis, and agent resolution metrics.

---

## 6. User Management (`/api/users`)
- **Access**: Admin only
- **Endpoints**:
  - `GET /api/users`: List users with role filter
  - `GET /api/users/agents`: List active agents for assignment
  - `POST /api/users`: Create agent or admin
  - `PUT /api/users/:id/status`: Toggle active status
  - `PUT /api/users/:id/role`: Change user role
