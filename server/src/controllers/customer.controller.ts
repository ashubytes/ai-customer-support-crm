import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { AppError } from '../middleware/error.middleware';

export class CustomerController {
  /**
   * List customers with search (Agent / Admin)
   */
  public static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, limit } = req.query;

      const result = await CustomerService.listCustomers(
        search ? String(search) : undefined,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
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
   * Get 360-degree CRM customer profile (Agent / Admin)
   */
  public static async getCustomerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = Number(req.params.id);

      if (isNaN(customerId)) {
        throw new AppError('Invalid customer ID format.', 400);
      }

      const profile = await CustomerService.getCustomerProfile(customerId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new customer record
   */
  public static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, company, notes } = req.body;

      const customer = await CustomerService.createCustomer({
        name,
        email,
        phone,
        company,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Customer record created successfully.',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update existing customer record
   */
  public static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = Number(req.params.id);
      const { name, phone, company, notes } = req.body;

      const customer = await CustomerService.updateCustomer(customerId, {
        name,
        phone,
        company,
        notes,
      });

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully.',
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }
}
