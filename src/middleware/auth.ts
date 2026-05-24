import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        role: "contributor" | "maintainer";
      };
    }
  }
}
const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access!",
        });
        return;
      }

      const decoded = jwt.verify(
        token as string,
        config.jwt_secret as string,
      ) as JwtPayload & {
        id: number;
        name: string;
        email: string;
        role: "contributor" | "maintainer";
      };

      const userData = await pool.query(
        `
    SELECT * FROM users WHERE id=$1
    `,
        [decoded.id],
      );

      // const user = userData.rows[0];
      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "user not found!",
        });
        return;
      }

      req.user = decoded;

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }
  };
};

export default auth;
