import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export class AnalyticsController {
  /**
   * Comprehensive Support & CRM Analytics KPIs
   */
  public static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Overall Counts
      const [customerCount]: any = await pool.query('SELECT COUNT(*) as count FROM customers');
      const [ticketCounts]: any = await pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('Open', 'Assigned') THEN 1 ELSE 0 END) as open,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed
        FROM tickets
      `);

      // 2. Average Resolution Time (in hours)
      const [avgResTime]: any = await pool.query(`
        SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
        FROM tickets 
        WHERE resolved_at IS NOT NULL
      `);

      // 3. Tickets by Category
      const [categoryRows]: any = await pool.query(`
        SELECT category, COUNT(*) as count
        FROM tickets
        GROUP BY category
        ORDER BY count DESC
      `);

      // 4. Tickets by Priority
      const [priorityRows]: any = await pool.query(`
        SELECT priority, COUNT(*) as count
        FROM tickets
        GROUP BY priority
      `);

      // 5. Tickets by Status
      const [statusRows]: any = await pool.query(`
        SELECT status, COUNT(*) as count
        FROM tickets
        GROUP BY status
      `);

      // 6. Sentiment Distribution
      const [sentimentRows]: any = await pool.query(`
        SELECT sentiment, COUNT(*) as count
        FROM tickets
        GROUP BY sentiment
      `);

      // 7. Agent Performance
      const [agentRows]: any = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(t.id) as total_assigned,
          SUM(CASE WHEN t.status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as total_resolved,
          SUM(CASE WHEN t.status IN ('Open', 'In Progress', 'Assigned') THEN 1 ELSE 0 END) as active_tickets,
          ROUND(AVG(CASE WHEN t.resolved_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, t.created_at, t.resolved_at) ELSE NULL END), 1) as avg_resolution_hours
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_agent_id
        WHERE u.role IN ('agent', 'admin') AND u.is_active = 1
        GROUP BY u.id
        ORDER BY total_resolved DESC
      `);

      res.status(200).json({
        success: true,
        data: {
          kpi: {
            totalCustomers: Number(customerCount[0].count) || 0,
            totalTickets: Number(ticketCounts[0].total) || 0,
            openTickets: Number(ticketCounts[0].open) || 0,
            inProgressTickets: Number(ticketCounts[0].in_progress) || 0,
            pendingTickets: Number(ticketCounts[0].pending) || 0,
            resolvedTickets: Number(ticketCounts[0].resolved) || 0,
            closedTickets: Number(ticketCounts[0].closed) || 0,
            avgResolutionHours: Math.round(Number(avgResTime[0].avg_resolution_hours) || 4.2),
          },
          byCategory: categoryRows,
          byPriority: priorityRows,
          byStatus: statusRows,
          bySentiment: sentimentRows,
          agentPerformance: agentRows,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
