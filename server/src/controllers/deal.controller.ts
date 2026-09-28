import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { AppError } from '../middleware/error.middleware';
import { triggerDealWebhook } from '../services/webhook.service';

export class DealController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search ? String(req.query.search) : '';
      const [rows] = await pool.query(
        `SELECT d.*, c.name AS customer_name, c.company AS customer_company
         FROM deals d
         INNER JOIN customers c ON c.id = d.customer_id
         WHERE d.title LIKE ? OR c.name LIKE ?
         ORDER BY d.created_at DESC`,
        [`%${search}%`, `%${search}%`]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, title, value = 0, stage = 'Prospecting', probability = 0, expectedCloseDate } = req.body;
      if (!customerId || !title?.trim()) {
        throw new AppError('customerId and title are required.', 400);
      }

      const [customer] = await pool.query(`SELECT id FROM customers WHERE id = ?`, [customerId]);
      if (!(customer as any[]).length) throw new AppError('Customer not found.', 404);

      const [result]: any = await pool.query(
        `INSERT INTO deals
         (customer_id, title, value, stage, probability, expected_close_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [customerId, title.trim(), Number(value), stage, Number(probability), expectedCloseDate || null]
      );

      const [rows] = await pool.query(
        `SELECT d.*, c.name AS customer_name, c.company AS customer_company
         FROM deals d INNER JOIN customers c ON c.id = d.customer_id
         WHERE d.id = ?`,
        [result.insertId]
      );
      const deal = (rows as any[])[0];

      // Webhook delivery is best-effort; the deal itself remains successfully created.
      triggerDealWebhook('deal.created', deal).catch((error) =>
        console.error('[WEBHOOK] deal.created delivery failed:', error.message)
      );

      res.status(201).json({ success: true, message: 'Deal created successfully.', data: deal });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new AppError('Invalid deal ID.', 400);

      const { title, value, stage, probability, expectedCloseDate } = req.body;

      await pool.query(
        `UPDATE deals
         SET title = COALESCE(?, title),
             value = COALESCE(?, value),
             stage = COALESCE(?, stage),
             probability = COALESCE(?, probability),
             expected_close_date = COALESCE(?, expected_close_date)
         WHERE id = ?`,
        [
          title?.trim() || null,
          value !== undefined ? Number(value) : null,
          stage || null,
          probability !== undefined ? Number(probability) : null,
          expectedCloseDate || null,
          id,
        ]
      );

      const [rows] = await pool.query(
        `SELECT d.*, c.name AS customer_name, c.company AS customer_company
         FROM deals d INNER JOIN customers c ON c.id = d.customer_id
         WHERE d.id = ?`,
        [id]
      );
      const deal = (rows as any[])[0];
      if (!deal) throw new AppError('Deal not found.', 404);

      triggerDealWebhook('deal.updated', deal).catch((error) =>
        console.error('[WEBHOOK] deal.updated delivery failed:', error.message)
      );

      res.json({ success: true, message: 'Deal updated successfully.', data: deal });
    } catch (error) {
      next(error);
    }
  }
}
