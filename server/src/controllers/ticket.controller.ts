import { Request, Response, NextFunction } from 'express';
import { TicketService } from '../services/ticket.service';
import { AppError } from '../middleware/error.middleware';
import { pool } from '../config/db';

export class TicketController {
  /**
   * Create a new ticket
   */
  public static async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      let customerId = user.customerId;

      // If agent or admin is creating ticket on behalf of a customer
      if (user.role !== 'customer') {
        if (!req.body.customerId) {
          throw new AppError('customerId is required when creating a ticket as agent or admin.', 400);
        }
        customerId = Number(req.body.customerId);
      }

      if (!customerId) {
        throw new AppError('No associated customer profile found for this user.', 400);
      }

      const { subject, description, category, priority } = req.body;

      const ticket = await TicketService.createTicket({
        customerId,
        subject,
        description,
        category,
        priority,
        actorUserId: user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully and analyzed by AI.',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List tickets with role-based filtering, search, and pagination
   */
  public static async listTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const {
        status,
        priority,
        category,
        assignedAgentId,
        customerId,
        search,
        page,
        limit,
      } = req.query;

      const result = await TicketService.listTickets(
        {
          status: status as any,
          priority: priority as any,
          category: category as any,
          assignedAgentId: assignedAgentId ? Number(assignedAgentId) : undefined,
          customerId: customerId ? Number(customerId) : undefined,
          search: search ? String(search) : undefined,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 20,
        },
        user.role,
        user.customerId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single ticket details
   */
  public static async getTicketById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);

      if (isNaN(ticketId)) {
        throw new AppError('Invalid ticket ID format.', 400);
      }

      const ticket = await TicketService.getTicketById(ticketId);

      // Verify customer access permission
      if (user.role === 'customer' && ticket.customer_id !== user.customerId) {
        throw new AppError('Access denied. You can only view your own tickets.', 403);
      }

      // Fetch ticket history
      const [history]: any = await pool.query(
        `SELECT h.*, u.name as actor_name 
         FROM ticket_history h
         LEFT JOIN users u ON h.actor_id = u.id
         WHERE h.ticket_id = ?
         ORDER BY h.created_at ASC`,
        [ticketId]
      );

      res.status(200).json({
        success: true,
        data: {
          ...ticket,
          history,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update ticket status (Agent & Admin only)
   */
  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);
      const { status, notes } = req.body;

      if (!status) {
        throw new AppError('New status is required.', 400);
      }

      const updated = await TicketService.updateStatus(ticketId, status, user.id, notes);

      res.status(200).json({
        success: true,
        message: `Ticket status updated to ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign agent (Agent & Admin only)
   */
  public static async assignAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);
      const { agentId } = req.body;

      const targetAgentId = agentId !== undefined ? (agentId === null ? null : Number(agentId)) : null;

      const updated = await TicketService.assignAgent(ticketId, targetAgentId, user.id);

      res.status(200).json({
        success: true,
        message: 'Ticket assignment updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update priority (Agent & Admin only)
   */
  public static async updatePriority(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);
      const { priority } = req.body;

      if (!priority) {
        throw new AppError('Priority value is required.', 400);
      }

      const updated = await TicketService.updatePriority(ticketId, priority, user.id);

      res.status(200).json({
        success: true,
        message: `Ticket priority updated to ${priority}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Regenerate AI suggested response
   */
  public static async regenerateAiSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      const ticketId = Number(req.params.id);
      const suggestedReply = await TicketService.regenerateAiSuggestion(ticketId);

      res.status(200).json({
        success: true,
        message: 'AI response suggestion regenerated successfully.',
        data: {
          suggested_reply: suggestedReply,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
