import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './error.middleware';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return next(new AppError('Validation failed. Please check your inputs.', 400, extractedErrors));
  }
  next();
};
