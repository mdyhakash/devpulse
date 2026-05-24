import type { NextFunction, Request, Response } from "express";

const requireRole = (...roles: Array<"contributor" | "maintainer">) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Insufficient Permission.",
      });
      return;
    }
    next();
  };
};

export default requireRole;
