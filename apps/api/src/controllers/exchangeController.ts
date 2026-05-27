import { ExchangeStatus, Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const createExchangeSchema = z.object({
  toUserId: z.string().uuid(),
  offeredSkillId: z.string().uuid(),
  requestedSkillId: z.string().uuid(),
  message: z.string().max(500).optional(),
});

const exchangeInclude = {
  fromUser: { select: { id: true, name: true, avatar: true, businessProfile: true } },
  toUser: { select: { id: true, name: true, avatar: true, businessProfile: true } },
  skillOffered: true,
  skillRequested: true,
} satisfies Prisma.ExchangeRequestInclude;

export const createExchange = async (req: Request, res: Response) => {
  const input = createExchangeSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  if (input.toUserId === userId) throw new AppError(400, "Cannot exchange with yourself");

  const [offeredSkill, requestedSkill] = await Promise.all([
    prisma.skill.findUnique({ where: { id: input.offeredSkillId } }),
    prisma.skill.findUnique({ where: { id: input.requestedSkillId } }),
  ]);

  if (!offeredSkill || !requestedSkill) throw new AppError(404, "Skill not found");
  if (offeredSkill.userId !== userId) throw new AppError(403, "You don't own the offered skill");
  if (requestedSkill.userId !== input.toUserId) throw new AppError(400, "Requested skill belongs to wrong user");
  if (!offeredSkill.isActive || !requestedSkill.isActive) throw new AppError(400, "Skill is no longer active");

  const existing = await prisma.exchangeRequest.findFirst({
    where: {
      fromUserId: userId,
      toUserId: input.toUserId,
      status: "PENDING",
    },
  });
  if (existing) throw new AppError(409, "You already have a pending exchange with this user");

  const exchange = await prisma.exchangeRequest.create({
    data: {
      fromUserId: userId,
      toUserId: input.toUserId,
      skillOfferedId: input.offeredSkillId,
      skillRequestedId: input.requestedSkillId,
      message: input.message,
      coinsOffered: offeredSkill.coinValue,
    },
    include: exchangeInclude,
  });

  res.status(201).json({ success: true, data: exchange });
};

export const listExchanges = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const direction = req.query.direction as string | undefined;
  const status = req.query.status as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const where: Prisma.ExchangeRequestWhereInput = {
    ...(direction === "incoming" ? { toUserId: userId } :
        direction === "outgoing" ? { fromUserId: userId } :
        { OR: [{ fromUserId: userId }, { toUserId: userId }] }),
    ...(status && { status: status as ExchangeStatus }),
  };

  const [exchanges, total] = await Promise.all([
    prisma.exchangeRequest.findMany({
      where,
      include: exchangeInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.exchangeRequest.count({ where }),
  ]);

  res.json({
    success: true,
    data: exchanges,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const getExchange = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { id } = req.params;

  const exchange = await prisma.exchangeRequest.findUnique({
    where: { id },
    include: exchangeInclude,
  });

  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.fromUserId !== userId && exchange.toUserId !== userId) {
    throw new AppError(403, "Not a participant in this exchange");
  }

  res.json({ success: true, data: exchange });
};

export const acceptExchange = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { id } = req.params;

  const exchange = await prisma.exchangeRequest.findUnique({ where: { id } });
  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.toUserId !== userId) throw new AppError(403, "Only the recipient can accept");
  if (exchange.status !== "PENDING") throw new AppError(400, "Exchange is not pending");

  const updated = await prisma.exchangeRequest.update({
    where: { id },
    data: { status: "ACCEPTED" },
    include: exchangeInclude,
  });

  res.json({ success: true, data: updated });
};

export const rejectExchange = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { id } = req.params;

  const exchange = await prisma.exchangeRequest.findUnique({ where: { id } });
  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.toUserId !== userId) throw new AppError(403, "Only the recipient can reject");
  if (exchange.status !== "PENDING") throw new AppError(400, "Exchange is not pending");

  const updated = await prisma.exchangeRequest.update({
    where: { id },
    data: { status: "REJECTED" },
    include: exchangeInclude,
  });

  res.json({ success: true, data: updated });
};

export const completeExchange = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { id } = req.params;

  const exchange = await prisma.exchangeRequest.findUnique({
    where: { id },
    include: { skillOffered: true, skillRequested: true },
  });
  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.fromUserId !== userId && exchange.toUserId !== userId) {
    throw new AppError(403, "Not a participant");
  }
  if (exchange.status !== "ACCEPTED") throw new AppError(400, "Exchange is not in accepted state");

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.exchangeRequest.update({
      where: { id },
      data: { status: "COMPLETED" },
      include: exchangeInclude,
    });

    const bonusAmount = 10;

    await tx.transaction.createMany({
      data: [
        { fromUserId: exchange.fromUserId, toUserId: exchange.toUserId, amount: bonusAmount, type: "EXCHANGE_REWARD", description: "Skill exchange completed", relatedExchangeId: id },
        { fromUserId: exchange.toUserId, toUserId: exchange.fromUserId, amount: bonusAmount, type: "EXCHANGE_REWARD", description: "Skill exchange completed", relatedExchangeId: id },
      ],
    });

    await tx.user.update({ where: { id: exchange.fromUserId }, data: { bizCoins: { increment: bonusAmount } } });
    await tx.user.update({ where: { id: exchange.toUserId }, data: { bizCoins: { increment: bonusAmount } } });

    return updated;
  });

  res.json({ success: true, data: result });
};

export const cancelExchange = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { id } = req.params;

  const exchange = await prisma.exchangeRequest.findUnique({ where: { id } });
  if (!exchange) throw new AppError(404, "Exchange not found");
  if (exchange.fromUserId !== userId) throw new AppError(403, "Only the requester can cancel");
  if (exchange.status !== "PENDING") throw new AppError(400, "Only pending exchanges can be cancelled");

  const updated = await prisma.exchangeRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: exchangeInclude,
  });

  res.json({ success: true, data: updated });
};
