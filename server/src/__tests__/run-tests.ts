import axios from 'axios';
import http from 'http';
import app from '../app';
import { testDbConnection } from '../config/db';

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING BACKEND API & INTEGRATION TEST SUITE     ');
  console.log('====================================================\n');

  // Verify database connectivity
  const dbConnected = await testDbConnection();
  if (!dbConnected) {
    console.error('FATAL: Database connection failed. Aborting tests.');
    process.exit(1);
  }

  // Start test server instance
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`[TEST-RUNNER] Test server listening on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      process.stdout.write(`TEST: ${name} ... `);
      await fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err: any) {
      console.log('✗ FAILED');
      console.error(`  Error: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.errors) {
        console.error('  Validation details:', err.response.data.errors);
      }
      failed++;
    }
  }

  try {
    let customerToken = '';
    let agentToken = '';
    let adminToken = '';
    let testCustomerId: number;
    let createdTicketId: number;

    // 1. Health check
    await test('GET /health returns healthy status', async () => {
      const res = await axios.get(`${BASE_URL}/health`);
      if (res.status !== 200 || res.data.status !== 'healthy') {
        throw new Error(`Unexpected status: ${res.data.status}`);
      }
    });

    // 2. Authentication: Login as Admin
    await test('POST /auth/login with valid Admin credentials', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@crm.local',
        password: 'Admin@123',
      });
      if (!res.data.data.token || res.data.data.user.role !== 'admin') {
        throw new Error('Failed to login as admin');
      }
      adminToken = res.data.data.token;
    });

    // 3. Authentication: Login as Agent
    await test('POST /auth/login with valid Agent credentials', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'agent.sarah@crm.local',
        password: 'Agent@123',
      });
      if (!res.data.data.token || res.data.data.user.role !== 'agent') {
        throw new Error('Failed to login as agent');
      }
      agentToken = res.data.data.token;
    });

    // 4. Authentication: Login as Customer
    await test('POST /auth/login with valid Customer credentials', async () => {
      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'john.doe@example.com',
        password: 'Customer@123',
      });
      if (!res.data.data.token || res.data.data.user.role !== 'customer') {
        throw new Error('Failed to login as customer');
      }
      customerToken = res.data.data.token;
      testCustomerId = res.data.data.user.customerId;
    });

    // 5. Authentication: Reject invalid password
    await test('POST /auth/login rejects wrong password with 401', async () => {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'admin@crm.local',
          password: 'WrongPassword999',
        });
        throw new Error('Expected 401 Unauthorized');
      } catch (err: any) {
        if (err.response?.status !== 401) {
          throw err;
        }
      }
    });

    // 6. Current User Profile
    await test('GET /auth/me returns current user identity', async () => {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (res.data.data.user.email !== 'john.doe@example.com') {
        throw new Error('Mismatch in authenticated user');
      }
    });

    // 7. Customer creates a ticket
    await test('POST /tickets creates ticket with automated AI triage', async () => {
      const res = await axios.post(
        `${BASE_URL}/tickets`,
        {
          subject: 'Payment charged twice on credit card checkout',
          description: 'My Visa card was charged two times for order #9921.',
        },
        {
          headers: { Authorization: `Bearer ${customerToken}` },
        }
      );
      if (!res.data.data.id || !res.data.data.ticket_number) {
        throw new Error('Ticket creation response missing ID');
      }
      createdTicketId = res.data.data.id;
      if (!res.data.data.category || !res.data.data.priority) {
        throw new Error('AI Triage fields missing on created ticket');
      }
    });

    // 8. Retrieve ticket details
    await test('GET /tickets/:id returns ticket with history and messages', async () => {
      const res = await axios.get(`${BASE_URL}/tickets/${createdTicketId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      if (res.data.data.id !== createdTicketId || !Array.isArray(res.data.data.history)) {
        throw new Error('Failed to retrieve ticket details and history');
      }
    });

    // 9. Agent posts reply to customer
    await test('POST /tickets/:id/messages adds agent message', async () => {
      const res = await axios.post(
        `${BASE_URL}/tickets/${createdTicketId}/messages`,
        {
          message: 'Hello, I have initiated a refund for the duplicate charge.',
          isInternal: false,
        },
        {
          headers: { Authorization: `Bearer ${agentToken}` },
        }
      );
      if (!res.data.data.id || res.data.data.sender_type !== 'agent') {
        throw new Error('Failed to post agent message');
      }
    });

    // 10. Agent changes ticket status
    await test('PUT /tickets/:id/status updates status to In Progress', async () => {
      const res = await axios.put(
        `${BASE_URL}/tickets/${createdTicketId}/status`,
        {
          status: 'In Progress',
          notes: 'Agent investigating payment logs',
        },
        {
          headers: { Authorization: `Bearer ${agentToken}` },
        }
      );
      if (res.data.data.status !== 'In Progress') {
        throw new Error('Status was not updated to In Progress');
      }
    });

    // 11. Customer 360-degree CRM profile
    await test('GET /customers/:id returns 360 CRM stats and timeline', async () => {
      const res = await axios.get(`${BASE_URL}/customers/${testCustomerId}`, {
        headers: { Authorization: `Bearer ${agentToken}` },
      });
      const data = res.data.data;
      if (!data.stats || !Array.isArray(data.interactionTimeline)) {
        throw new Error('CRM profile missing stats or interaction timeline');
      }
    });

    // 12. Support & CRM Analytics
    await test('GET /analytics/overview returns KPI and charts data', async () => {
      const res = await axios.get(`${BASE_URL}/analytics/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = res.data.data;
      if (!data.kpi || !Array.isArray(data.byCategory) || !Array.isArray(data.agentPerformance)) {
        throw new Error('Analytics overview structure invalid');
      }
    });

    // 13. RBAC Enforcement: Customer cannot access Admin users route
    await test('GET /users blocks Customer role with 403 Forbidden', async () => {
      try {
        await axios.get(`${BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
        throw new Error('Expected 403 Forbidden for customer accessing admin route');
      } catch (err: any) {
        if (err.response?.status !== 403) {
          throw err;
        }
      }
    });

    console.log('\n====================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests();
