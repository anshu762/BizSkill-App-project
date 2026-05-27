import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const createReviewSchema = z.object({
  exchangeId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(200).optional(),
});

export const createReview = async (req: Request, res: Response) => {
  const input = createReviewSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const exchange = await prisma.exchangeRequest.findUnique({
    where: { id: input.exchangeId },
  });
  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.status !== "COMPLETED") throw new AppError(400, "Only completed exchanges can be reviewed");
  if (exchange.fromUserId !== userId && exchange.toUserId !== userId) {
    throw new AppError(403, "Not a participant");
  }

  const existing = await prisma.review.findUnique({
    where: { exchangeId_reviewerId: { exchangeId: input.exchangeId, reviewerId: userId } },
  });
  if (existing) throw new AppError(409, "You already reviewed this exchange");

  const revieweeId = exchange.fromUserId === userId ? exchange.toUserId : exchange.fromUserId;

  const review = await prisma.review.create({
    data: {
      reviewerId: userId,
      revieweeId,
      exchangeId: input.exchangeId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  res.status(201).json({ success: true, data: review });
};

export const getUserReviews = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  res.json({
    success: true,
    data: { reviews, avgRating: Math.round(avg * 10) / 10, total: reviews.length },
  });
};
