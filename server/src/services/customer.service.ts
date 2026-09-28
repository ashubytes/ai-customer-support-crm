import { pool } from '../config/db';
import { Customer } from '../types';
import { AppError } from '../middleware/error.middleware';

export interface CustomerCRMProfile extends Customer {
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    pendingTickets: number;
    avgSentiment: string;
  };
  recentTickets: any[];
  interactionTimeline: any[];
}

export class CustomerService {
  /**
   * List all customers with optional search and pagination
   */
  public static async listCustomers(
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR phone LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.join(' AND ');

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM customers WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows]: any = await pool.query(
      `SELECT 
        c.*,
        COUNT(t.id) as total_tickets,
        SUM(CASE WHEN t.status IN ('Open', 'Assigned', 'In Progress') THEN 1 ELSE 0 END) as active_tickets
       FROM customers c
       LEFT JOIN tickets t ON c.id = t.customer_id
       WHERE ${whereClause}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      customers: rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Get 360-degree CRM customer profile with ticket statistics, recent tickets, and timeline
   */
  public static async getCustomerProfile(customerId: number): Promise<CustomerCRMProfile> {
    const [customerRows]: any = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [customerId]
    );

    if (!customerRows || customerRows.length === 0) {
      throw new AppError('Customer profile not found.', 404);
    }

    const customer = customerRows[0];

    // Aggregated stats
    const [statsRows]: any = await pool.query(
      `SELECT 
        COUNT(*) as totalTickets,
        SUM(CASE WHEN status IN ('Open', 'Assigned', 'In Progress') THEN 1 ELSE 0 END) as openTickets,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolvedTickets,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pendingTickets
       FROM tickets 
       WHERE customer_id = ?`,
      [customerId]
    );

    const stats = {
      totalTickets: Number(statsRows[0].totalTickets) || 0,
      openTickets: Number(statsRows[0].openTickets) || 0,
      resolvedTickets: Number(statsRows[0].resolvedTickets) || 0,
      pendingTickets: Number(statsRows[0].pendingTickets) || 0,
      avgSentiment: 'Neutral',
    };

    // Recent tickets
    const [recentTickets]: any = await pool.query(
      `SELECT t.*, u.name as agent_name 
       FROM tickets t
       LEFT JOIN users u ON t.assigned_agent_id = u.id
       WHERE t.customer_id = ?
       ORDER BY t.created_at DESC
       LIMIT 5`,
      [customerId]
    );

    // Interaction Timeline (Ticket creations, status updates, messages)
    const [timelineRows]: any = await pool.query(
      `(
        SELECT 
          'TICKET_CREATED' as event_type,
          t.id as ticket_id,
          t.ticket_number,
          t.subject as description,
          t.created_at as timestamp,
          c.name as actor_name,
          'customer' as actor_type
        FROM tickets t
        JOIN customers c ON t.customer_id = c.id
        WHERE t.customer_id = ?
      )
      UNION ALL
      (
        SELECT 
          'MESSAGE_SENT' as event_type,
          m.ticket_id,
          t.ticket_number,
          m.message as description,
          m.created_at as timestamp,
          u.name as actor_name,
          m.sender_type as actor_type
        FROM messages m
        JOIN tickets t ON m.ticket_id = t.id
        JOIN users u ON m.sender_id = u.id
        WHERE t.customer_id = ?
      )
      UNION ALL
      (
        SELECT 
          h.action as event_type,
          h.ticket_id,
          t.ticket_number,
          CONCAT('Change: ', COALESCE(h.old_value, 'None'), ' -> ', COALESCE(h.new_value, 'None'), ' (', COALESCE(h.notes, ''), ')') as description,
          h.created_at as timestamp,
          COALESCE(u.name, 'System') as actor_name,
          COALESCE(u.role, 'system') as actor_type
        FROM ticket_history h
        JOIN tickets t ON h.ticket_id = t.id
        LEFT JOIN users u ON h.actor_id = u.id
        WHERE t.customer_id = ?
      )
      ORDER BY timestamp DESC
      LIMIT 20`,
      [customerId, customerId, customerId]
    );

    return {
      ...customer,
      stats,
      recentTickets,
      interactionTimeline: timelineRows,
    };
  }

  /**
   * Create or update customer details
   */
  public static async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const [result]: any = await pool.query(
      'INSERT INTO customers (user_id, name, email, phone, company, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.user_id || null,
        data.name,
        data.email,
        data.phone || null,
        data.company || null,
        data.notes || null,
      ]
    );
    const [rows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  public static async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    await pool.query(
      'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), company = COALESCE(?, company), notes = COALESCE(?, notes) WHERE id = ?',
      [data.name, data.phone, data.company, data.notes, id]
    );
    const [rows]: any = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      throw new AppError('Customer not found.', 404);
    }
    return rows[0];
  }
}
