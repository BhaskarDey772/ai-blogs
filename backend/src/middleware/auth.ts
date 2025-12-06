import { Request, Response, NextFunction } from "express";
import { AuthService, AuthPayload } from "../services/AuthService";

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ error: "No access token provided" });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (err) {
    next();
  }
};
