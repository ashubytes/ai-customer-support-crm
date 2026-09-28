-- ==========================================================
-- AI-Powered Customer Support & CRM Platform
-- Seed Data for MySQL 8.x
-- Database: customer_support_crm
-- Default Passwords:
-- Admin: Admin@123
-- Agents: Agent@123
-- Customers: Customer@123
-- ==========================================================

USE `customer_support_crm`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `ticket_history`;
TRUNCATE TABLE `messages`;
TRUNCATE TABLE `tickets`;
TRUNCATE TABLE `customers`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users
-- Hashed passwords using bcrypt ($2a$10$...)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`) VALUES
(1, 'System Administrator', 'admin@crm.local', '$2a$10$nU3Q50d32g8gJmsz0812quk3F1Qp5pM9gG94yW1/sXjU2Z13qg.c2', 'admin', 1),
(2, 'Sarah Jenkins', 'agent.sarah@crm.local', '$2a$10$c1G3U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'agent', 1),
(3, 'Alex Rivera', 'agent.alex@crm.local', '$2a$10$c1G3U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'agent', 1),
(4, 'John Doe', 'john.doe@example.com', '$2a$10$wQ94U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'customer', 1),
(5, 'Emily Smith', 'emily.smith@techcorp.io', '$2a$10$wQ94U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'customer', 1),
(6, 'Michael Brown', 'michael.brown@startup.co', '$2a$10$wQ94U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'customer', 1),
(7, 'Priya Patel', 'priya.patel@global.com', '$2a$10$wQ94U454z/kI4f53E5jDNuLw4mZ1W/z9sYk1XyW1/sXjU2Z13qg.c2', 'customer', 1);

-- 2. Customers
INSERT INTO `customers` (`id`, `user_id`, `name`, `email`, `phone`, `company`, `notes`) VALUES
(1, 4, 'John Doe', 'john.doe@example.com', '+1-555-0101', 'Acme Corp', 'Enterprise tier client since 2023.'),
(2, 5, 'Emily Smith', 'emily.smith@techcorp.io', '+1-555-0102', 'TechCorp International', 'Key stakeholder for cloud integrations.'),
(3, 6, 'Michael Brown', 'michael.brown@startup.co', '+1-555-0103', 'Innovate Startup Lab', 'High-growth startup account.'),
(4, 7, 'Priya Patel', 'priya.patel@global.com', '+1-555-0104', 'Global Logistics Ltd', 'Standard subscription tier.');

-- 3. Tickets
INSERT INTO `tickets` (`id`, `ticket_number`, `customer_id`, `assigned_agent_id`, `subject`, `description`, `category`, `priority`, `sentiment`, `status`, `ai_summary`, `ai_suggested_reply`, `created_at`) VALUES
(1, 'TCK-2025-0001', 1, 2, 'Double charged for annual SaaS renewal', 'Our corporate card was charged twice ($1,200 x 2) for the annual SaaS renewal on invoice #INV-9821. Please issue a refund for the duplicate transaction as soon as possible.', 'Billing', 'High', 'Negative', 'In Progress', 'Customer reports duplicate charge of $1,200 for annual renewal.', 'Hello John, we sincerely apologize for the duplicate charge on invoice #INV-9821. I have verified the transaction logs and initiated a full refund of $1,200 back to your original payment method.', NOW() - INTERVAL 3 DAY),
(2, 'TCK-2025-0002', 2, 3, 'REST API returning 500 Internal Server Error on webhook delivery', 'Since 09:00 AM UTC today, our webhook receiver endpoint is failing when processing incoming event payload for user.created events.', 'Technical Issue', 'Urgent', 'Negative', 'Open', 'TechCorp webhook ingestion failing with HTTP 500 errors.', 'Hi Emily, our engineering team is currently investigating the webhook timeout issue. We have applied a hotfix to the dispatch queue.', NOW() - INTERVAL 2 DAY),
(3, 'TCK-2025-0003', 3, 2, 'Request to increase API rate limit for upcoming product launch', 'We are launching our public beta next Tuesday and anticipate a 10x traffic spike. Could we upgrade our tier or temporarily increase our API rate limit?', 'Account', 'Medium', 'Positive', 'Resolved', 'Customer requesting a rate limit increase for beta launch.', 'Hi Michael, congratulations on the launch! I have upgraded your API quota to 5,000 req/min effective immediately.', NOW() - INTERVAL 5 DAY),
(4, 'TCK-2025-0004', 4, NULL, 'Unable to login after password reset link expired', 'I requested a password reset yesterday, but when I clicked the link this morning it stated the token had expired.', 'Login', 'Medium', 'Neutral', 'Open', 'Customer locked out after token expiration.', 'Hello Priya, I have unlocked your account and triggered a fresh password reset email.', NOW() - INTERVAL 1 DAY),
(5, 'TCK-2025-0005', 1, 3, 'Feature inquiry: Support for SAML 2.0 Single Sign-On (SSO)', 'Our security compliance team requires Okta SSO integration for all third-party enterprise tools.', 'Product', 'Low', 'Neutral', 'Pending', 'Inquiring about Okta SAML 2.0 SSO compatibility.', 'Hi John, yes, SAML 2.0 Okta SSO is fully supported on our Enterprise plan.', NOW() - INTERVAL 4 DAY),
(6, 'TCK-2025-0006', 2, 2, 'Credit card payment failure during monthly checkout', 'Payment gateway rejected our Visa corporate card with error code 204.', 'Payment', 'High', 'Negative', 'Resolved', 'Payment gateway error 204 during checkout.', 'Hello Emily, gateway error 204 was resolved. We cleared payment cache and charged successfully.', NOW() - INTERVAL 6 DAY);

-- 4. Messages
INSERT INTO `messages` (`ticket_id`, `sender_id`, `message`, `sender_type`, `is_internal`) VALUES
(1, 4, 'Our corporate card was charged twice ($1,200 x 2) for the annual SaaS renewal on invoice #INV-9821. Please issue a refund for the duplicate transaction as soon as possible.', 'customer', 0),
(1, 2, 'Hello John, I am reviewing the billing gateway logs right now. I see the duplicate charge on invoice #INV-9821. Initiating the refund process with Stripe now.', 'agent', 0),
(1, 4, 'Thank you Sarah! Please let me know once the transaction receipt is available.', 'customer', 0),
(2, 5, 'Since 09:00 AM UTC today, our webhook receiver endpoint is failing when processing incoming event payload for user.created events.', 'customer', 0),
(3, 6, 'We are launching our public beta next Tuesday and anticipate a 10x traffic spike. Could we upgrade our tier or temporarily increase our API rate limit?', 'customer', 0),
(3, 2, 'Hi Michael, congrats on the launch! I have upgraded your API quota to 5,000 req/min.', 'agent', 0),
(3, 6, 'Awesome support! Tested and rate limits are updated properly.', 'customer', 0);

-- 5. Ticket History
INSERT INTO `ticket_history` (`ticket_id`, `actor_id`, `action`, `old_value`, `new_value`, `notes`) VALUES
(1, 4, 'CREATED', NULL, 'Open', 'Ticket submitted by customer.'),
(1, 1, 'AI_TRIAGED', NULL, 'Billing / High / Negative', 'AI automatically categorized and analyzed ticket.'),
(1, 1, 'ASSIGNMENT', NULL, 'Sarah Jenkins', 'Assigned to Agent Sarah Jenkins.'),
(1, 2, 'STATUS_CHANGE', 'Open', 'In Progress', 'Agent started investigation.'),
(2, 5, 'CREATED', NULL, 'Open', 'Webhook failure reported.'),
(2, 1, 'AI_TRIAGED', NULL, 'Technical Issue / Urgent', 'AI flagged high severity.'),
(2, 1, 'ASSIGNMENT', NULL, 'Alex Rivera', 'Assigned to Alex Rivera.'),
(3, 6, 'CREATED', NULL, 'Open', 'Quota increase requested.'),
(3, 2, 'STATUS_CHANGE', 'In Progress', 'Resolved', 'Rate limit adjusted in API gateway.');
