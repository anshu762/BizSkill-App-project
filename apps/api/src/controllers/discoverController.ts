import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

export const discover = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const minScore = Math.max(0, parseInt(req.query.minScore as string) || 1);
  const industry = req.query.industry as string | undefined;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      skills: { where: { isActive: true } },
      businessProfile: true,
    },
  });
  if (!me) throw new AppError(404, "User not found");

  const myOfferedCategories = new Set(me.skills.filter((s) => s.isOffering).map((s) => s.category));
  const myNeededCategories = new Set(me.skills.filter((s) => !s.isOffering).map((s) => s.category));

  if (myOfferedCategories.size === 0 && myNeededCategories.size === 0) {
    return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
  }

  const allUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      hasOnboarded: true,
      businessProfile: industry ? { industry: industry as any } : undefined,
    },
    include: {
      skills: { where: { isActive: true } },
      businessProfile: true,
    },
  });

  const scored = allUsers.map((user) => {
    const theirOfferedCategories = new Set(user.skills.filter((s) => s.isOffering).map((s) => s.category));
    const theirNeededCategories = new Set(user.skills.filter((s) => !s.isOffering).map((s) => s.category));

    let score = 0;
    theirOfferedCategories.forEach((cat) => { if (myNeededCategories.has(cat)) score++; });
    theirNeededCategories.forEach((cat) => { if (myOfferedCategories.has(cat)) score++; });

    return { user, score };
  });

  const filtered = scored.filter((s) => s.score >= minScore);
  filtered.sort((a, b) => b.score - a.score);

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const data = paginated.map(({ user: u, score }) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    bio: u.bio,
    bizCoins: u.bizCoins,
    businessProfile: u.businessProfile,
    offeredSkills: u.skills.filter((s) => s.isOffering),
    neededSkills: u.skills.filter((s) => !s.isOffering),
    matchScore: score,
  }));

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages },
  });
};
