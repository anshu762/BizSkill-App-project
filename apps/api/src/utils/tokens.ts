import jwt from "jsonwebtoken";
import { env } from "./env";

export interface TokenPayload {
  id: string;
  email: string;
}

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;

