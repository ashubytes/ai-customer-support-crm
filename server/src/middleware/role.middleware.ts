import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { UserRole } from '../types';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden. Requires one of [${allowedRoles.join(', ')}] role(s). Your role: ${req.user.role}`,
          403
        )
      );
    }

    next();
  };
};
