import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const sendSchema = z.object({
  content: z.string().min(1).max(500),
});

export const getConversations = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);

  const sentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    select: { receiverId: true, receiver: { select: { id: true, name: true, avatar: true, businessProfile: true } } },
  });

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: userId },
    orderBy: { createdAt: "desc" },
    select: { senderId: true, sender: { select: { id: true, name: true, avatar: true, businessProfile: true } } },
  });

  const userMap = new Map<string, { id: string; name: string; avatar: string | null; businessProfile: any }>();
  sentMessages.forEach((m) => userMap.set(m.receiverId, m.receiver));
  receivedMessages.forEach((m) => userMap.set(m.senderId, m.sender));

  const conversationUserIds = [...userMap.keys()];

  const conversations = await Promise.all(
    conversationUserIds.map(async (otherUserId) => {
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.message.count({
          where: { senderId: otherUserId, receiverId: userId, isRead: false },
        }),
      ]);

      return {
        user: userMap.get(otherUserId)!,
        lastMessage,
        unreadCount,
      };
    }),
  );

  conversations.sort((a, b) => {
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

  res.json({ success: true, data: conversations });
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { userId: otherUserId } = req.params;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  res.json({
    success: true,
    data: messages.reverse(),
    nextCursor: hasMore ? messages[0]?.id : null,
  });
};

export const sendMessage = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { userId: receiverId } = req.params;
  const input = sendSchema.parse(req.body);

  if (userId === receiverId) throw new AppError(400, "Cannot message yourself");

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new AppError(404, "User not found");

  const message = await prisma.message.create({
    data: { senderId: userId, receiverId, content: input.content },
  });

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      message: `${me?.name ?? "Someone"} sent you a message`,
      link: `/messages/${userId}`,
      relatedId: message.id,
    },
  });

  res.status(201).json({ success: true, data: message });
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { userId: otherUserId } = req.params;

  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, isRead: false },
    data: { isRead: true },
  });

  res.json({ success: true, message: "Messages marked as read" });
};
