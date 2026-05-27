import { BusinessStage, Prisma, SkillCategory } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

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

const onboardingSchema = z.object({
  bio: z.string().trim().min(10).max(240).optional(),
  location: z.string().trim().min(2).max(80).optional(),
  businessName: z.string().trim().min(2).max(100),
  industry: z.nativeEnum(SkillCategory),
  description: z.string().trim().min(10).max(500),
  stage: z.nativeEnum(BusinessStage),
  website: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().trim().max(50).optional(),
});

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

export const me = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: authenticatedUserId(req) },
    select: publicUserSelect,
  });

  if (!user) throw new AppError(404, "User not found");
  res.json({ success: true, data: user });
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const input = onboardingSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      bio: input.bio,
      location: input.location,
      hasOnboarded: true,
      businessProfile: {
        upsert: {
          create: {
            businessName: input.businessName,
            industry: input.industry,
            description: input.description,
            stage: input.stage,
            website: input.website || null,
            instagramHandle: input.instagramHandle || null,
          },
          update: {
            businessName: input.businessName,
            industry: input.industry,
            description: input.description,
            stage: input.stage,
            website: input.website || null,
            instagramHandle: input.instagramHandle || null,
          },
        },
      },
    },
    select: publicUserSelect,
  });

  res.json({ success: true, data: user });
};

