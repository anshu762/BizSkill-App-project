import { Prisma, SkillCategory, SkillLevel } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const marketplaceQuery = z.object({
  category: z.nativeEnum(SkillCategory).optional(),
  level: z.nativeEnum(SkillLevel).optional(),
  minCoins: z.coerce.number().int().min(0).optional(),
  maxCoins: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  sort: z.enum(["newest", "coins_asc", "coins_desc"]).default("newest"),
});

export const listMarketplace = async (req: Request, res: Response) => {
  const input = marketplaceQuery.parse(req.query);
  const userId = req.user?.id;

  const where: Prisma.SkillWhereInput = {
    isOffering: true,
    isActive: true,
    ...(userId && { userId: { not: userId } }),
    ...(input.category && { category: input.category }),
    ...(input.level && { level: input.level }),
    ...(input.minCoins !== undefined && { coinValue: { gte: input.minCoins } }),
    ...(input.maxCoins !== undefined && { coinValue: { lte: input.maxCoins } }),
    ...(input.search && {
      OR: [
        { title: { contains: input.search, mode: "insensitive" } },
        { description: { contains: input.search, mode: "insensitive" } },
        { user: { name: { contains: input.search, mode: "insensitive" } } },
      ],
    }),
  };

  const orderBy: Prisma.SkillOrderByWithRelationInput =
    input.sort === "coins_asc" ? { coinValue: "asc" } :
    input.sort === "coins_desc" ? { coinValue: "desc" } :
    { id: "desc" };

  const [skills, total] = await Promise.all([
    prisma.skill.findMany({
      where,
      orderBy,
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, bizCoins: true, businessProfile: true } },
      },
    }),
    prisma.skill.count({ where }),
  ]);

  res.json({
    success: true,
    data: skills,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  });
};
