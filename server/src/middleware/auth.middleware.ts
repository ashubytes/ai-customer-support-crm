import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { pool } from '../config/db';
import { AppError } from './error.middleware';
import { AuthTokenPayload, UserRole } from '../types';

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
        customerId?: number; // Linked customer ID if role is customer
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required. Missing Bearer token.', 401));
    }

    const token = authHeader.split(' ')[1];
    let decoded: AuthTokenPayload;

    try {
      decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Verify user exists and is active in database
    const [rows]: any = await pool.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows || rows.length === 0) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    const user = rows[0];
    if (!user.is_active) {
      return next(new AppError('User account is deactivated. Contact administrator.', 403));
    }

    // If customer role, find corresponding customer_id
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

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId,
    };

    next();
  } catch (error) {
    next(error);
  }
};
