import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { AppError } from '../middleware/error.middleware';

export class UserController {
  /**
   * List all users (Admin only)
   */
  public static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, search } = req.query;
      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      if (role) {
        conditions.push('role = ?');
        params.push(role);
      }

      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push('(name LIKE ? OR email LIKE ?)');
        params.push(searchTerm, searchTerm);
      }

      const whereClause = conditions.join(' AND ');

      const [rows]: any = await pool.query(
        `SELECT id, name, email, role, is_active, created_at, updated_at 
         FROM users 
         WHERE ${whereClause} 
         ORDER BY created_at DESC`,
        params
      );

      res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active support agents list for assignment dropdowns (Agent & Admin)
   */
  public static async getAgentsList(req: Request, res: Response, next: NextFunction) {
    try {
      const [rows]: any = await pool.query(
        `SELECT id, name, email, role 
         FROM users 
         WHERE role IN ('agent', 'admin') AND is_active = 1 
         ORDER BY name ASC`
      );

      res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new Agent or Admin account (Admin only)
   */
  public static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;

      if (!['agent', 'admin', 'customer'].includes(role)) {
        throw new AppError('Invalid role specified.', 400);
      }

      const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [
        email.toLowerCase().trim(),
      ]);

      if (existing && existing.length > 0) {
        throw new AppError('Email already registered.', 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
        [name.trim(), email.toLowerCase().trim(), passwordHash, role]
      );

      res.status(201).json({
        success: true,
        message: `User account created successfully with role ${role}.`,
        data: {
          id: result.insertId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          is_active: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status (Admin only)
   */
  public static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const { isActive } = req.body;

      if (req.user?.id === userId) {
        throw new AppError('You cannot deactivate your own admin account.', 400);
      }

      await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [
        isActive ? 1 : 0,
        userId,
      ]);

      res.status(200).json({
        success: true,
        message: `User account has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user role (Admin only)
   */
  public static async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      if (!['customer', 'agent', 'admin'].includes(role)) {
        throw new AppError('Invalid role specified.', 400);
      }

      if (req.user?.id === userId && role !== 'admin') {
        throw new AppError('You cannot demote your own admin account.', 400);
      }

      await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

      res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`,
      });
    } catch (error) {
      next(error);
    }
  }
}
