import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { AppError } from '../middleware/error.middleware';

export class WebhookController {
  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, endpoint_url, deal_created, deal_updated,
                max_retries, is_active, created_at, updated_at
         FROM webhook_configs
         ORDER BY created_at DESC`
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        endpoint_url,
        api_key,
        deal_created = true,
        deal_updated = true,
        max_retries = 3,
      } = req.body;

      if (!name?.trim() || !endpoint_url?.trim()) {
        throw new AppError('Webhook name and endpoint URL are required.', 400);
      }

      try {
        new URL(endpoint_url);
      } catch {
        throw new AppError('A valid webhook endpoint URL is required.', 400);
      }

      const retries = Number(max_retries);
      if (!Number.isInteger(retries) || retries < 0 || retries > 10) {
        throw new AppError('max_retries must be an integer between 0 and 10.', 400);
      }

      const [result]: any = await pool.query(
        `INSERT INTO webhook_configs
         (name, endpoint_url, api_key, deal_created, deal_updated, max_retries)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          endpoint_url.trim(),
          api_key || null,
          Boolean(deal_created),
          Boolean(deal_updated),
          retries,
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Webhook created successfully.',
        data: { id: result.insertId },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new AppError('Invalid webhook ID.', 400);

      const { name, endpoint_url, api_key, deal_created, deal_updated, max_retries } = req.body;
      const fields: string[] = [];
      const values: any[] = [];

      if (name !== undefined) {
        fields.push('name = ?');
        values.push(String(name).trim());
      }
      if (endpoint_url !== undefined) {
        try { new URL(endpoint_url); } catch { throw new AppError('Invalid endpoint URL.', 400); }
        fields.push('endpoint_url = ?');
        values.push(String(endpoint_url).trim());
      }
      if (api_key !== undefined) {
        fields.push('api_key = ?');
        values.push(api_key || null);
      }
      if (deal_created !== undefined) {
        fields.push('deal_created = ?');
        values.push(Boolean(deal_created));
      }
      if (deal_updated !== undefined) {
        fields.push('deal_updated = ?');
        values.push(Boolean(deal_updated));
      }
      if (max_retries !== undefined) {
        const retries = Number(max_retries);
        if (!Number.isInteger(retries) || retries < 0 || retries > 10) {
          throw new AppError('max_retries must be an integer between 0 and 10.', 400);
        }
        fields.push('max_retries = ?');
        values.push(retries);
      }

      if (!fields.length) throw new AppError('No fields supplied for update.', 400);

      values.push(id);
      await pool.query(`UPDATE webhook_configs SET ${fields.join(', ')} WHERE id = ?`, values);

      res.json({ success: true, message: 'Webhook updated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  public static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new AppError('Invalid webhook ID.', 400);

      await pool.query(
        `UPDATE webhook_configs SET is_active = NOT is_active WHERE id = ?`,
        [id]
      );

      res.json({ success: true, message: 'Webhook status updated.' });
    } catch (error) {
      next(error);
    }
  }

  public static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new AppError('Invalid webhook ID.', 400);

      await pool.query(`DELETE FROM webhook_configs WHERE id = ?`, [id]);
      res.json({ success: true, message: 'Webhook deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  public static async deliveries(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) throw new AppError('Invalid webhook ID.', 400);

      const [rows] = await pool.query(
        `SELECT id, webhook_id, deal_id, event_type, request_payload,
                response_status, response_body, attempt_number, status,
                error_message, created_at
         FROM webhook_deliveries
         WHERE webhook_id = ?
         ORDER BY created_at DESC
         LIMIT 200`,
        [id]
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      next(error);
    }
  }
}
