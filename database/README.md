# Database Architecture: MySQL 8.x (`customer_support_crm`)

This directory contains the database schema definition, seed scripts, and migration instructions.

## Schema Overview

The database is built on MySQL 8.0 with relational integrity, foreign key cascades, and performance indexes.

### Tables
1. **`users`**: User accounts and credentials for Customer, Agent, and Admin roles.
2. **`customers`**: CRM customer profiles, linked to user accounts where applicable.
3. **`tickets`**: Support tickets with category, priority, status, sentiment, and AI fields.
4. **`messages`**: Threaded conversation history between customers, agents, and system events.
5. **`ticket_history`**: Audit trail tracking status updates, priority changes, and agent assignments.

## Quick Setup

Run the automated provisioning script from the server directory:
```bash
cd server
npm run db:init   # Creates database and tables
npm run db:seed   # Seeds initial users, customers, tickets, and messages
```
