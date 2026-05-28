import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

export const getNotifications = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const markAllRead = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: "All marked as read" });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);

  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  res.json({ success: true, data: { count } });
};
