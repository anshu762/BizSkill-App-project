import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyAccessToken } from "../utils/tokens";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.user = verifyAccessToken(authorization.slice(7));
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired access token"));
  }
};

