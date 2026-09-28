import { pool } from '../config/db';
import { AiService } from './ai.service';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, UserRole } from '../types';
import { AppError } from '../middleware/error.middleware';

export interface CreateTicketDTO {
  customerId: number;
  subject: string;
  description: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  actorUserId: number;
}

export interface TicketFilterOptions {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedAgentId?: number;
  customerId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class TicketService {
  /**
   * Helper to generate unique sequential ticket number: TCK-YYYY-NNNN
   */
  private static async generateTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const [rows]: any = await pool.query(
      'SELECT id FROM tickets ORDER BY id DESC LIMIT 1'
    );
    const nextId = (rows.length > 0 ? rows[0].id + 1 : 1).toString().padStart(4, '0');
    return `TCK-${year}-${nextId}`;
  }

  /**
   * Record entry in ticket_history audit trail
   */
  public static async logHistory(
    ticketId: number,
    actorId: number | null,
    action: string,
    oldValue: string | null,
    newValue: string | null,
    notes: string | null
  ): Promise<void> {
    await pool.query(
      `INSERT INTO ticket_history (ticket_id, actor_id, action, old_value, new_value, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [ticketId, actorId, action, oldValue, newValue, notes]
    );
  }

  /**
   * Create a new ticket and execute automated AI Triage
   */
  public static async createTicket(data: CreateTicketDTO): Promise<Ticket> {
    const ticketNumber = await this.generateTicketNumber();

    // 1. Perform automated AI Triage
    const aiResult = await AiService.analyzeTicket(data.subject, data.description);

    const category = data.category || aiResult.category || 'Other';
    const priority = data.priority || aiResult.priority || 'Medium';
    const sentiment = aiResult.sentiment || 'Neutral';
    const aiSummary = aiResult.summary || null;
    const aiSuggestedReply = aiResult.suggested_reply || null;

    // 2. Insert ticket into MySQL
    const [result]: any = await pool.query(
      `INSERT INTO tickets (
        ticket_number, customer_id, subject, description,
        category, priority, sentiment, status,
        ai_summary, ai_suggested_reply
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?)`,
      [
        ticketNumber,
        data.customerId,
        data.subject,
        data.description,
        category,
        priority,
        sentiment,
        aiSummary,
        aiSuggestedReply,
      ]
    );

    const ticketId = result.insertId;

    // 3. Create initial customer message in messages table
    await pool.query(
      `INSERT INTO messages (ticket_id, sender_id, message, sender_type, is_internal)
       VALUES (?, ?, ?, 'customer', 0)`,
      [ticketId, data.actorUserId, data.description]
    );

    // 4. Log audit history
    await this.logHistory(
      ticketId,
      data.actorUserId,
      'CREATED',
      null,
      'Open',
      'Ticket created by customer'
    );

    await this.logHistory(
      ticketId,
      null,
      'AI_TRIAGED',
      null,
      `${category} / ${priority} / ${sentiment}`,
      aiSummary
    );

    return this.getTicketById(ticketId);
  }

  /**
   * Get ticket details by ID with full customer and agent metadata
   */
  public static async getTicketById(ticketId: number): Promise<Ticket> {
    const [rows]: any = await pool.query(
      `SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company as customer_company,
        c.phone as customer_phone,
        u.name as agent_name,
        u.email as agent_email
      FROM tickets t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.assigned_agent_id = u.id
      WHERE t.id = ?`,
      [ticketId]
    );

    if (!rows || rows.length === 0) {
      throw new AppError('Ticket not found.', 404);
    }

    return rows[0];
  }

  /**
   * List tickets with filtering, search, pagination, and role-based access scoping
   */
  public static async listTickets(
    filters: TicketFilterOptions,
    userRole: UserRole,
    userCustomerId?: number
  ): Promise<{ tickets: Ticket[]; total: number; page: number; limit: number }> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    // Role-based scoping: Customer can only view their own tickets
    if (userRole === 'customer') {
      if (!userCustomerId) {
        return { tickets: [], total: 0, page, limit };
      }
      conditions.push('t.customer_id = ?');
      params.push(userCustomerId);
    } else if (filters.customerId) {
      conditions.push('t.customer_id = ?');
      params.push(filters.customerId);
    }

    if (filters.status) {
      conditions.push('t.status = ?');
      params.push(filters.status);
    }

    if (filters.priority) {
      conditions.push('t.priority = ?');
      params.push(filters.priority);
    }

    if (filters.category) {
      conditions.push('t.category = ?');
      params.push(filters.category);
    }

    if (filters.assignedAgentId) {
      conditions.push('t.assigned_agent_id = ?');
      params.push(filters.assignedAgentId);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        '(t.ticket_number LIKE ? OR t.subject LIKE ? OR t.description LIKE ? OR c.name LIKE ? OR c.email LIKE ?)'
      );
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM tickets t
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Get paginated tickets
    const [rows]: any = await pool.query(
      `SELECT 
        t.*,
        c.name as customer_name,
        c.email as customer_email,
        c.company as customer_company,
        u.name as agent_name,
        u.email as agent_email
       FROM tickets t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN users u ON t.assigned_agent_id = u.id
       WHERE ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      tickets: rows,
      total,
      page,
      limit,
    };
  }

  /**
   * Update ticket status
   */
  public static async updateStatus(
    ticketId: number,
    newStatus: TicketStatus,
    actorId: number,
    notes?: string
  ): Promise<Ticket> {
    const currentTicket = await this.getTicketById(ticketId);
    if (currentTicket.status === newStatus) {
      return currentTicket;
    }

    const resolvedAt = newStatus === 'Resolved' || newStatus === 'Closed' ? new Date() : null;

    await pool.query(
      'UPDATE tickets SET status = ?, resolved_at = ? WHERE id = ?',
      [newStatus, resolvedAt, ticketId]
    );

    await this.logHistory(
      ticketId,
      actorId,
      'STATUS_CHANGE',
      currentTicket.status,
      newStatus,
      notes || `Status changed to ${newStatus}`
    );

    return this.getTicketById(ticketId);
  }

  /**
   * Assign or reassign ticket to an agent
   */
  public static async assignAgent(
    ticketId: number,
    agentId: number | null,
    actorId: number
  ): Promise<Ticket> {
    const currentTicket = await this.getTicketById(ticketId);

    let newAgentName = 'Unassigned';
    if (agentId) {
      const [agentRows]: any = await pool.query(
        'SELECT name FROM users WHERE id = ? AND role IN ("agent", "admin")',
        [agentId]
      );
      if (agentRows.length === 0) {
        throw new AppError('Assigned user must be an active agent or admin.', 400);
      }
      newAgentName = agentRows[0].name;
    }

    await pool.query(
      'UPDATE tickets SET assigned_agent_id = ?, status = CASE WHEN status = "Open" THEN "Assigned" ELSE status END WHERE id = ?',
      [agentId, ticketId]
    );

    await this.logHistory(
      ticketId,
      actorId,
      'ASSIGNMENT',
      currentTicket.agent_name || 'Unassigned',
      newAgentName,
      agentId ? `Assigned to ${newAgentName}` : 'Unassigned from agent'
    );

    return this.getTicketById(ticketId);
  }

  /**
   * Update priority
   */
  public static async updatePriority(
    ticketId: number,
    priority: TicketPriority,
    actorId: number
  ): Promise<Ticket> {
    const currentTicket = await this.getTicketById(ticketId);
    if (currentTicket.priority === priority) {
      return currentTicket;
    }

    await pool.query('UPDATE tickets SET priority = ? WHERE id = ?', [priority, ticketId]);

    await this.logHistory(
      ticketId,
      actorId,
      'PRIORITY_CHANGE',
      currentTicket.priority,
      priority,
      `Priority updated to ${priority}`
    );

    return this.getTicketById(ticketId);
  }

  /**
   * Regenerate AI response suggestion for a ticket using conversation history
   */
  public static async regenerateAiSuggestion(ticketId: number): Promise<string> {
    const ticket = await this.getTicketById(ticketId);

    // Fetch conversation messages
    const [messages]: any = await pool.query(
      'SELECT sender_type, message FROM messages WHERE ticket_id = ? ORDER BY created_at ASC',
      [ticketId]
    );

    const result = await AiService.suggestResponse(
      ticket.subject,
      ticket.description,
      messages.map((m: any) => ({ sender_type: m.sender_type, message: m.message }))
    );

    await pool.query(
      'UPDATE tickets SET ai_suggested_reply = ? WHERE id = ?',
      [result.suggested_reply, ticketId]
    );

    return result.suggested_reply;
  }
}
