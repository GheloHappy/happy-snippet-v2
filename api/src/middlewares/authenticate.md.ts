import type { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JWT_SECRET, COOKIE_NAME } from "src/config/constants";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );

    (req as any).user = {
      id: (payload as any).id,
      username: (payload as any).username,
      name: (payload as any).name,
      department: (payload as any).department,
      role: (payload as any).role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
