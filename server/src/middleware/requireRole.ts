import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@nr/auth-middleware';

export const requireRole =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }
    next();
  };
