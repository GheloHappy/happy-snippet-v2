import type { Request, Response, NextFunction } from "express";

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
