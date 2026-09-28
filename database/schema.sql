-- ==========================================================
-- AI-Powered Customer Support & CRM Platform
-- Relational Database Schema (MySQL 8.x)
-- Database: customer_support_crm
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `customer_support_crm`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `customer_support_crm`;

-- Drop existing tables in reverse dependency order for clean recreation
DROP TABLE IF EXISTS `webhook_deliveries`;
DROP TABLE IF EXISTS `webhook_configs`;
DROP TABLE IF EXISTS `deals`;
DROP TABLE IF EXISTS `ticket_history`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------
-- Table: users
-- Purpose: Authentication and Role-Based Access Control
-- ----------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'agent', 'admin') NOT NULL DEFAULT 'customer',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: customers
-- Purpose: CRM Customer entity and relationship tracking
-- ----------------------------------------------------------
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `company` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customers_email` (`email`),
  INDEX `idx_customers_company` (`company`),
  INDEX `idx_customers_user_id` (`user_id`),
  CONSTRAINT `fk_customers_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ----------------------------------------------------------
-- Table: deals
-- Purpose: Sales deals synchronized through outbound webhooks
-- ----------------------------------------------------------
CREATE TABLE `deals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `value` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `stage` VARCHAR(50) NOT NULL DEFAULT 'Prospecting',
  `probability` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `expected_close_date` DATE NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_deals_customer_id` (`customer_id`),
  INDEX `idx_deals_stage` (`stage`),
  CONSTRAINT `fk_deals_customer` FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: webhook_configs
-- Purpose: Admin-managed outbound webhook endpoints
-- ----------------------------------------------------------
CREATE TABLE `webhook_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `endpoint_url` VARCHAR(500) NOT NULL,
  `api_key` VARCHAR(500) NULL,
  `deal_created` BOOLEAN NOT NULL DEFAULT TRUE,
  `deal_updated` BOOLEAN NOT NULL DEFAULT TRUE,
  `max_retries` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_webhook_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: webhook_deliveries
-- Purpose: Audit trail for every webhook delivery attempt
-- ----------------------------------------------------------
CREATE TABLE `webhook_deliveries` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `webhook_id` INT NOT NULL,
  `deal_id` INT NOT NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `request_payload` JSON NOT NULL,
  `response_status` INT NULL,
  `response_body` TEXT NULL,
  `attempt_number` INT NOT NULL DEFAULT 1,
  `status` ENUM('success', 'failed', 'retrying') NOT NULL DEFAULT 'retrying',
  `error_message` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_delivery_webhook` (`webhook_id`),
  INDEX `idx_delivery_deal` (`deal_id`),
  INDEX `idx_delivery_created_at` (`created_at`),
  CONSTRAINT `fk_delivery_webhook` FOREIGN KEY (`webhook_id`)
    REFERENCES `webhook_configs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_delivery_deal` FOREIGN KEY (`deal_id`)
    REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: tickets
-- Purpose: Support tickets with AI metadata and triage
-- ----------------------------------------------------------
CREATE TABLE `tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(30) NOT NULL UNIQUE,
  `customer_id` INT NOT NULL,
  `assigned_agent_id` INT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM(
    'Account',
    'Payment',
    'Billing',
    'Refund',
    'Technical Issue',
    'Login',
    'Order',
    'Product',
    'Delivery',
    'Other'
  ) NOT NULL DEFAULT 'Other',
  `priority` ENUM('Low', 'Medium', 'High', 'Urgent') NOT NULL DEFAULT 'Medium',
  `sentiment` ENUM('Positive', 'Neutral', 'Negative') NOT NULL DEFAULT 'Neutral',
  `status` ENUM('Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
  `ai_summary` TEXT NULL,
  `ai_suggested_reply` TEXT NULL,
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tickets_customer_id` (`customer_id`),
  INDEX `idx_tickets_assigned_agent` (`assigned_agent_id`),
  INDEX `idx_tickets_status` (`status`),
  INDEX `idx_tickets_priority` (`priority`),
  INDEX `idx_tickets_category` (`category`),
  INDEX `idx_tickets_ticket_number` (`ticket_number`),
  CONSTRAINT `fk_tickets_customer` FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tickets_agent` FOREIGN KEY (`assigned_agent_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: messages
-- Purpose: Threaded conversation messages for support tickets
-- ----------------------------------------------------------
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `sender_type` ENUM('customer', 'agent', 'admin', 'system') NOT NULL,
  `is_internal` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_messages_ticket_id` (`ticket_id`),
  INDEX `idx_messages_sender_id` (`sender_id`),
  INDEX `idx_messages_created_at` (`created_at`),
  CONSTRAINT `fk_messages_ticket` FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`)
    REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Table: ticket_history
-- Purpose: Audit trail logging for ticket state and lifecycle changes
-- ----------------------------------------------------------
CREATE TABLE `ticket_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `actor_id` INT NULL,
  `action` VARCHAR(50) NOT NULL,
  `old_value` VARCHAR(255) NULL,
  `new_value` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_history_ticket_id` (`ticket_id`),
  INDEX `idx_history_actor_id` (`actor_id`),
  INDEX `idx_history_created_at` (`created_at`),
  CONSTRAINT `fk_history_ticket` FOREIGN KEY (`ticket_id`)
    REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_history_actor` FOREIGN KEY (`actor_id`)
    REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
