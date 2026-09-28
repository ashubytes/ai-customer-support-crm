import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { AppError } from '../middleware/error.middleware';
import { TicketService } from '../services/ticket.service';

export class MessageController {
  /**
   * Get all messages for a ticket thread
   */
  public static async getTicketMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);

      if (isNaN(ticketId)) {
        throw new AppError('Invalid ticket ID format.', 400);
      }

      // Check ticket access
      const ticket = await TicketService.getTicketById(ticketId);
      if (user.role === 'customer' && ticket.customer_id !== user.customerId) {
        throw new AppError('Access denied.', 403);
      }

      // If customer, hide internal staff notes
      let query = `
        SELECT 
          m.*,
          u.name as sender_name,
          u.email as sender_email,
          u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.ticket_id = ?
      `;
      const params: any[] = [ticketId];

      if (user.role === 'customer') {
        query += ' AND m.is_internal = 0';
      }

      query += ' ORDER BY m.created_at ASC';

      const [messages]: any = await pool.query(query, params);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Post a new message or internal note to a ticket thread
   */
  public static async createTicketMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const ticketId = Number(req.params.id);
      const { message, isInternal } = req.body;

      if (isNaN(ticketId)) {
        throw new AppError('Invalid ticket ID format.', 400);
      }

      if (!message || message.trim().length === 0) {
        throw new AppError('Message content cannot be empty.', 400);
      }

      const ticket = await TicketService.getTicketById(ticketId);

      // Verify customer authorization
      if (user.role === 'customer' && ticket.customer_id !== user.customerId) {
        throw new AppError('Access denied. You can only message on your own tickets.', 403);
      }

      // Customers cannot post internal notes
      const isInternalFlag = user.role === 'customer' ? false : Boolean(isInternal);

      const [result]: any = await pool.query(
        'INSERT INTO messages (ticket_id, sender_id, message, sender_type, is_internal) VALUES (?, ?, ?, ?, ?)',
        [ticketId, user.id, message.trim(), user.role, isInternalFlag ? 1 : 0]
      );

      // Automatic status transitions
      if (!isInternalFlag) {
        if (user.role === 'agent' || user.role === 'admin') {
          if (ticket.status === 'Open' || ticket.status === 'Assigned') {
            await TicketService.updateStatus(ticketId, 'In Progress', user.id, 'Agent sent reply to customer.');
          }
        } else if (user.role === 'customer') {
          if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
            await TicketService.updateStatus(ticketId, 'In Progress', user.id, 'Customer reopened ticket with follow-up message.');
          }
        }
      }

      const [newMessage]: any = await pool.query(
        `SELECT 
          m.*,
          u.name as sender_name,
          u.email as sender_email,
          u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: isInternalFlag ? 'Internal note added.' : 'Message sent successfully.',
        data: newMessage[0],
      });
    } catch (error) {
      next(error);
    }
  }
}
