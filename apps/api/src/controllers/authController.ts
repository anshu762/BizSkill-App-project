import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Name is required").max(80),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  bio: true,
  age: true,
  location: true,
  bizCoins: true,
  hasOnboarded: true,
  createdAt: true,
  updatedAt: true,
  businessProfile: true,
} satisfies Prisma.UserSelect;

const issueSession = async (user: { id: string; email: string }) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: publicUserSelect,
  });
  const tokens = await issueSession(user);

  res.status(201).json({
    success: true,
    data: { ...tokens, user },
  });
};

export const login = async (req: Request, res: Response) => {
  const input = credentialsSchema.parse(req.body);
  const account = await prisma.user.findUnique({ where: { email: input.email } });

  if (!account || !(await bcrypt.compare(input.password, account.passwordHash))) {
    throw new AppError(401, "Invalid email or password");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: account.id },
    select: publicUserSelect,
  });
  const tokens = await issueSession(user);

  res.json({ success: true, data: { ...tokens, user } });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  let payload: { id: string; email: string };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

  if (!storedToken || storedToken.userId !== payload.id || storedToken.expiresAt <= new Date()) {
    throw new AppError(401, "Refresh token is no longer valid");
  }

  res.json({
    success: true,
    data: { accessToken: signAccessToken({ id: payload.id, email: payload.email }) },
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  res.json({ success: true, message: "Signed out successfully" });
};
