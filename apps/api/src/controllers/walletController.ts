import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

export const getWallet = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { bizCoins: true },
  });
  if (!user) throw new AppError(404, "User not found");

  const where = { OR: [{ fromUserId: userId }, { toUserId: userId }] };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  res.json({
    success: true,
    data: { balance: user.bizCoins, transactions },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
