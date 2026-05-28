import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

export const followUser = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { targetUserId } = req.params;

  if (targetUserId === userId) throw new AppError(400, "Cannot follow yourself");

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw new AppError(404, "User not found");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
  });

  if (!existing) {
    await prisma.follow.create({ data: { followerId: userId, followingId: targetUserId } });

    const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: "FOLLOW",
        message: `${me?.name ?? "Someone"} started following you`,
        link: `/profile/${userId}`,
        relatedId: userId,
      },
    });
  }

  res.json({ success: true, data: { following: true } });
};

export const unfollowUser = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { targetUserId } = req.params;

  await prisma.follow.deleteMany({
    where: { followerId: userId, followingId: targetUserId },
  });

  res.json({ success: true, data: { following: false } });
};

export const getFollowStats = async (req: Request, res: Response) => {
  const currentUserId = req.user?.id;
  const { userId } = req.params;

  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  let isFollowedByMe = false;
  if (currentUserId && currentUserId !== userId) {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    });
    isFollowedByMe = !!existing;
  }

  res.json({ success: true, data: { followerCount, followingCount, isFollowedByMe } });
};
