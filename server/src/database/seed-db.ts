import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

async function seedDatabase() {
  console.log('[DB-SEED] Starting database seeding...');

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    multipleStatements: true,
  });

  try {
    console.log('[DB-SEED] Connected to database. Hashing passwords...');

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const agentPasswordHash = await bcrypt.hash('Agent@123', 10);
    const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

    // Disable foreign key checks for clean truncation
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE ticket_history;');
    await connection.query('TRUNCATE TABLE messages;');
    await connection.query('TRUNCATE TABLE tickets;');
    await connection.query('TRUNCATE TABLE customers;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('[DB-SEED] Seeding Users...');
    // 1 Admin, 2 Agents, 4 Customers
    const users = [
      ['System Administrator', 'admin@crm.local', adminPasswordHash, 'admin'],
      ['Sarah Jenkins', 'agent.sarah@crm.local', agentPasswordHash, 'agent'],
      ['Alex Rivera', 'agent.alex@crm.local', agentPasswordHash, 'agent'],
      ['John Doe', 'john.doe@example.com', customerPasswordHash, 'customer'],
      ['Emily Smith', 'emily.smith@techcorp.io', customerPasswordHash, 'customer'],
      ['Michael Brown', 'michael.brown@startup.co', customerPasswordHash, 'customer'],
      ['Priya Patel', 'priya.patel@global.com', customerPasswordHash, 'customer'],
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        user
      );
    }

    // Get user IDs
    const [userRows]: any = await connection.query('SELECT id, email, role FROM users');
    const userMap: Record<string, number> = {};
    userRows.forEach((u: any) => {
      userMap[u.email] = u.id;
    });

    console.log('[DB-SEED] Seeding Customers...');
    const customers = [
      [userMap['john.doe@example.com'], 'John Doe', 'john.doe@example.com', '+1-555-0101', 'Acme Corp', 'Enterprise tier client since 2023.'],
      [userMap['emily.smith@techcorp.io'], 'Emily Smith', 'emily.smith@techcorp.io', '+1-555-0102', 'TechCorp International', 'Key stakeholder for cloud integrations.'],
      [userMap['michael.brown@startup.co'], 'Michael Brown', 'michael.brown@startup.co', '+1-555-0103', 'Innovate Startup Lab', 'High-growth startup account.'],
      [userMap['priya.patel@global.com'], 'Priya Patel', 'priya.patel@global.com', '+1-555-0104', 'Global Logistics Ltd', 'Standard subscription tier.'],
    ];

    for (const c of customers) {
      await connection.query(
        'INSERT INTO customers (user_id, name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)',
        c
      );
    }

    const [customerRows]: any = await connection.query('SELECT id, email FROM customers');
    const customerMap: Record<string, number> = {};
    customerRows.forEach((c: any) => {
      customerMap[c.email] = c.id;
    });

    console.log('[DB-SEED] Seeding Tickets with AI Triage...');
    const tickets = [
      {
        ticket_number: 'TCK-2025-0001',
        customer_id: customerMap['john.doe@example.com'],
        assigned_agent_id: userMap['agent.sarah@crm.local'],
        subject: 'Double charged for annual SaaS renewal',
        description: 'Our corporate card was charged twice ($1,200 x 2) for the annual SaaS renewal on invoice #INV-9821. Please issue a refund for the duplicate transaction as soon as possible.',
        category: 'Billing',
        priority: 'High',
        sentiment: 'Negative',
        status: 'In Progress',
        ai_summary: 'Customer reports an accidental duplicate charge of $1,200 for annual renewal and requests an immediate refund.',
        ai_suggested_reply: 'Hello John, we sincerely apologize for the duplicate charge on invoice #INV-9821. I have verified the transaction logs and initiated a full refund of $1,200 back to your original payment method. You should see the credit reflected within 3-5 business days.',
      },
      {
        ticket_number: 'TCK-2025-0002',
        customer_id: customerMap['emily.smith@techcorp.io'],
        assigned_agent_id: userMap['agent.alex@crm.local'],
        subject: 'REST API returning 500 Internal Server Error on webhook delivery',
        description: 'Since 09:00 AM UTC today, our webhook receiver endpoint is failing when processing incoming event payload for user.created events. Error log mentions database connection timeout.',
        category: 'Technical Issue',
        priority: 'Urgent',
        sentiment: 'Negative',
        status: 'Open',
        ai_summary: 'TechCorp webhook ingestion is failing with HTTP 500 errors due to downstream connection timeouts during user.created events.',
        ai_suggested_reply: 'Hi Emily, thank you for reaching out. Our engineering team is currently investigating the webhook timeout issue. We have applied a hotfix to the dispatch queue and are monitoring latency. Could you please confirm if retries are now succeeding on your end?',
      },
      {
        ticket_number: 'TCK-2025-0003',
        customer_id: customerMap['michael.brown@startup.co'],
        assigned_agent_id: userMap['agent.sarah@crm.local'],
        subject: 'Request to increase API rate limit for upcoming product launch',
        description: 'We are launching our public beta next Tuesday and anticipate a 10x traffic spike. Could we upgrade our tier or temporarily increase our API rate limit from 1,000 req/min to 5,000 req/min?',
        category: 'Account',
        priority: 'Medium',
        sentiment: 'Positive',
        status: 'Resolved',
        ai_summary: 'Customer requesting a temporary or tier upgrade for API rate limit (5,000 req/min) ahead of a Tuesday product launch.',
        ai_suggested_reply: 'Hi Michael, congratulations on the upcoming launch! I have upgraded your API quota to 5,000 req/min effective immediately through the end of next month at no extra charge. Let us know if you need any additional capacity.',
      },
      {
        ticket_number: 'TCK-2025-0004',
        customer_id: customerMap['priya.patel@global.com'],
        assigned_agent_id: null,
        subject: 'Unable to login after password reset link expired',
        description: 'I requested a password reset yesterday, but when I clicked the link this morning it stated the token had expired. Now my account seems temporarily locked.',
        category: 'Login',
        priority: 'Medium',
        sentiment: 'Neutral',
        status: 'Open',
        ai_summary: 'Customer is locked out after password reset token expiration and needs an account unlock and fresh reset link.',
        ai_suggested_reply: 'Hello Priya, I have unlocked your account and triggered a fresh password reset email with a 24-hour validity window. Please check your inbox and spam folder.',
      },
      {
        ticket_number: 'TCK-2025-0005',
        customer_id: customerMap['john.doe@example.com'],
        assigned_agent_id: userMap['agent.alex@crm.local'],
        subject: 'Feature inquiry: Support for SAML 2.0 Single Sign-On (SSO)',
        description: 'Our security compliance team requires Okta SSO integration for all third-party enterprise tools. Is SAML 2.0 currently supported or on the product roadmap?',
        category: 'Product',
        priority: 'Low',
        sentiment: 'Neutral',
        status: 'Pending',
        ai_summary: 'Customer inquiring about Okta SAML 2.0 SSO compatibility and roadmap availability for compliance.',
        ai_suggested_reply: 'Hi John, yes, SAML 2.0 Okta SSO is fully supported on our Enterprise plan. I have attached the Okta setup guide and configuration metadata URL for your IT security team.',
      },
      {
        ticket_number: 'TCK-2025-0006',
        customer_id: customerMap['emily.smith@techcorp.io'],
        assigned_agent_id: userMap['agent.sarah@crm.local'],
        subject: 'Credit card payment failure during monthly checkout',
        description: 'Payment gateway rejected our Visa corporate card with error code 204. Our bank verified funds are available.',
        category: 'Payment',
        priority: 'High',
        sentiment: 'Negative',
        status: 'Resolved',
        ai_summary: 'Customer reported a payment gateway error 204 during monthly subscription payment with valid bank funds.',
        ai_suggested_reply: 'Hello Emily, gateway error 204 was caused by a transient 3D-Secure verification handshake timeout. We cleared the payment cache and successfully processed the invoice.',
      }
    ];

    for (const t of tickets) {
      await connection.query(
        `INSERT INTO tickets 
        (ticket_number, customer_id, assigned_agent_id, subject, description, category, priority, sentiment, status, ai_summary, ai_suggested_reply, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() - INTERVAL FLOOR(RAND() * 5) DAY)`,
        [
          t.ticket_number,
          t.customer_id,
          t.assigned_agent_id,
          t.subject,
          t.description,
          t.category,
          t.priority,
          t.sentiment,
          t.status,
          t.ai_summary,
          t.ai_suggested_reply,
        ]
      );
    }

    // Get ticket IDs
    const [ticketRows]: any = await connection.query('SELECT id, ticket_number, customer_id, assigned_agent_id FROM tickets');
    const ticketMap: Record<string, any> = {};
    ticketRows.forEach((t: any) => {
      ticketMap[t.ticket_number] = t;
    });

    console.log('[DB-SEED] Seeding Conversation Messages...');
    const messages = [
      // Messages for Ticket 1 (Billing)
      [
        ticketMap['TCK-2025-0001'].id,
        userMap['john.doe@example.com'],
        'Our corporate card was charged twice ($1,200 x 2) for the annual SaaS renewal on invoice #INV-9821. Please issue a refund for the duplicate transaction as soon as possible.',
        'customer',
        0
      ],
      [
        ticketMap['TCK-2025-0001'].id,
        userMap['agent.sarah@crm.local'],
        'Hello John, I am reviewing the billing gateway logs right now. I see the duplicate charge on invoice #INV-9821. Initiating the refund process with Stripe now.',
        'agent',
        0
      ],
      [
        ticketMap['TCK-2025-0001'].id,
        userMap['john.doe@example.com'],
        'Thank you Sarah! Please let me know once the transaction receipt is available.',
        'customer',
        0
      ],

      // Messages for Ticket 2 (Technical Issue)
      [
        ticketMap['TCK-2025-0002'].id,
        userMap['emily.smith@techcorp.io'],
        'Since 09:00 AM UTC today, our webhook receiver endpoint is failing when processing incoming event payload for user.created events. Error log mentions database connection timeout.',
        'customer',
        0
      ],

      // Messages for Ticket 3 (Resolved Rate Limit)
      [
        ticketMap['TCK-2025-0003'].id,
        userMap['michael.brown@startup.co'],
        'We are launching our public beta next Tuesday and anticipate a 10x traffic spike. Could we upgrade our tier or temporarily increase our API rate limit from 1,000 req/min to 5,000 req/min?',
        'customer',
        0
      ],
      [
        ticketMap['TCK-2025-0003'].id,
        userMap['agent.sarah@crm.local'],
        'Hi Michael, congrats on the launch! I have upgraded your API quota to 5,000 req/min effective immediately through next month.',
        'agent',
        0
      ],
      [
        ticketMap['TCK-2025-0003'].id,
        userMap['michael.brown@startup.co'],
        'Awesome support! Tested and rate limits are updated properly.',
        'customer',
        0
      ]
    ];

    for (const msg of messages) {
      await connection.query(
        'INSERT INTO messages (ticket_id, sender_id, message, sender_type, is_internal) VALUES (?, ?, ?, ?, ?)',
        msg
      );
    }

    console.log('[DB-SEED] Seeding Ticket History Audit Trail...');
    const historyEvents = [
      [ticketMap['TCK-2025-0001'].id, userMap['john.doe@example.com'], 'CREATED', null, 'Open', 'Ticket submitted by customer.'],
      [ticketMap['TCK-2025-0001'].id, userMap['admin@crm.local'], 'AI_TRIAGED', null, 'Billing / High / Negative', 'AI automatically categorized and analyzed ticket.'],
      [ticketMap['TCK-2025-0001'].id, userMap['admin@crm.local'], 'ASSIGNMENT', null, 'Sarah Jenkins', 'Assigned to Agent Sarah Jenkins.'],
      [ticketMap['TCK-2025-0001'].id, userMap['agent.sarah@crm.local'], 'STATUS_CHANGE', 'Open', 'In Progress', 'Agent started investigation.'],

      [ticketMap['TCK-2025-0002'].id, userMap['emily.smith@techcorp.io'], 'CREATED', null, 'Open', 'Webhook failure reported.'],
      [ticketMap['TCK-2025-0002'].id, userMap['admin@crm.local'], 'AI_TRIAGED', null, 'Technical Issue / Urgent', 'AI flagged high severity.'],
      [ticketMap['TCK-2025-0002'].id, userMap['admin@crm.local'], 'ASSIGNMENT', null, 'Alex Rivera', 'Assigned to Alex Rivera.'],

      [ticketMap['TCK-2025-0003'].id, userMap['michael.brown@startup.co'], 'CREATED', null, 'Open', 'Quota increase requested.'],
      [ticketMap['TCK-2025-0003'].id, userMap['agent.sarah@crm.local'], 'STATUS_CHANGE', 'In Progress', 'Resolved', 'Rate limit adjusted in API gateway.'],
    ];

    for (const h of historyEvents) {
      await connection.query(
        'INSERT INTO ticket_history (ticket_id, actor_id, action, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
        h
      );
    }

    console.log('[DB-SEED] Database successfully seeded with demo accounts, tickets, and CRM records!');
  } catch (error: any) {
    console.error('[DB-SEED] Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedDatabase();
