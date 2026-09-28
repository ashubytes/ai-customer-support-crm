import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { config } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { CustomerService } from '../services/customer.service';

export class AuthController {
  /**
   * Register a new Customer user
   */
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, phone, company } = req.body;

      // 1. Check if email already registered
      const [existing]: any = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (existing && existing.length > 0) {
        throw new AppError('An account with this email address already exists.', 409);
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // 3. Create user in users table
      const [userResult]: any = await pool.query(
        'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?, ?, ?, "customer", 1)',
        [name.trim(), email.toLowerCase().trim(), passwordHash]
      );

      const userId = userResult.insertId;

      // 4. Create linked CRM customer record
      const customer = await CustomerService.createCustomer({
        user_id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone || null,
        company: company || null,
      });

      // 5. Generate JWT token
      const token = jwt.sign(
        { id: userId, email: email.toLowerCase().trim(), role: 'customer', name: name.trim() },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
          token,
          user: {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role: 'customer',
            customerId: customer.id,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User Login (Customer, Agent, Admin)
   */
  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const [rows]: any = await pool.query(
        'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (!rows || rows.length === 0) {
        throw new AppError('Invalid email or password.', 401);
      }

      const user = rows[0];

      if (!user.is_active) {
        throw new AppError('Your account has been deactivated. Please contact support.', 403);
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password.', 401);
      }

      // 3. Find customer ID if customer
      let customerId: number | undefined;
      if (user.role === 'customer') {
        const [customerRows]: any = await pool.query(
          'SELECT id FROM customers WHERE user_id = ?',
          [user.id]
        );
        if (customerRows.length > 0) {
          customerId = customerRows[0].id;
        }
      }

      // 4. Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            customerId,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get currently authenticated user profile
   */
  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const [rows]: any = await pool.query(
        'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!rows || rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      let customer = null;
      if (req.user.role === 'customer') {
        const [customerRows]: any = await pool.query(
          'SELECT id, phone, company, notes FROM customers WHERE user_id = ?',
          [req.user.id]
        );
        if (customerRows.length > 0) {
          customer = customerRows[0];
        }
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            ...rows[0],
            customerId: customer?.id || req.user.customerId,
            phone: customer?.phone,
            company: customer?.company,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update authenticated user profile
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { name, phone, company, password } = req.body;

      if (name) {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user.id]);
      }

      if (password && password.length >= 6) {
        const passwordHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);
      }

      if (req.user.role === 'customer') {
        await pool.query(
          'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), company = COALESCE(?, company) WHERE user_id = ?',
          [name ? name.trim() : null, phone || null, company || null, req.user.id]
        );
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}
