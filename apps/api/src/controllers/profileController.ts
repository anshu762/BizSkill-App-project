import { BusinessStage, Prisma, SkillCategory, SkillLevel } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const publicUserSelect = {
  id: true, name: true, email: true, avatar: true, bio: true, age: true,
  location: true, bizCoins: true, hasOnboarded: true, createdAt: true, updatedAt: true,
  businessProfile: true, skills: true,
} satisfies Prisma.UserSelect;

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const skillSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: z.nativeEnum(SkillCategory),
  description: z.string().trim().min(1).max(500).optional(),
  level: z.nativeEnum(SkillLevel),
  coinValue: z.number().int().min(0).max(9999),
});

const onboardingSchema = z.object({
  bio: z.string().trim().min(1).max(240).optional(),
  age: z.coerce.number().int().min(13).max(120).optional(),
  location: z.string().trim().min(1).max(80).optional(),
  businessName: z.string().trim().min(1).max(100),
  industry: z.nativeEnum(SkillCategory),
  description: z.string().trim().min(1).max(500),
  stage: z.nativeEnum(BusinessStage),
  website: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().trim().max(50).optional(),
  offeredSkills: z.array(skillSchema).max(5).default([]),
  neededSkills: z.array(skillSchema).max(5).default([]),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(240).optional(),
  age: z.coerce.number().int().min(13).max(120).optional(),
  location: z.string().trim().max(80).optional(),
  businessName: z.string().trim().min(1).max(100).optional(),
  industry: z.nativeEnum(SkillCategory).optional(),
  description: z.string().trim().max(500).optional(),
  stage: z.nativeEnum(BusinessStage).optional(),
  website: z.string().url().optional().or(z.literal("")),
  instagramHandle: z.string().trim().max(50).optional(),
});

export const completeOnboarding = async (req: Request, res: Response) => {
  const input = onboardingSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        bio: input.bio,
        age: input.age,
        location: input.location,
        hasOnboarded: true,
        businessProfile: {
          upsert: {
            create: {
              businessName: input.businessName, industry: input.industry,
              description: input.description, stage: input.stage,
              website: input.website || null, instagramHandle: input.instagramHandle || null,
            },
            update: {
              businessName: input.businessName, industry: input.industry,
              description: input.description, stage: input.stage,
              website: input.website || null, instagramHandle: input.instagramHandle || null,
            },
          },
        },
      },
      select: publicUserSelect,
    });

    if (input.offeredSkills.length > 0) {
      await tx.skill.createMany({
        data: input.offeredSkills.map((s) => ({
          userId, title: s.title, category: s.category,
          description: s.description, level: s.level, coinValue: s.coinValue, isOffering: true,
        })),
      });
    }

    if (input.neededSkills.length > 0) {
      await tx.skill.createMany({
        data: input.neededSkills.map((s) => ({
          userId, title: s.title, category: s.category,
          description: s.description, level: s.level, coinValue: s.coinValue, isOffering: false,
        })),
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: publicUserSelect,
    });
  });

  res.json({ success: true, data: result });
};

export const getPublicProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, avatar: true, bio: true, age: true,
      location: true, bizCoins: true, hasOnboarded: true, createdAt: true, updatedAt: true,
      businessProfile: true,
      skills: { where: { isActive: true } },
    },
  });

  if (!user) throw new AppError(404, "User not found");

  const exchangeCount = await prisma.exchangeRequest.count({
    where: { OR: [{ fromUserId: userId }, { toUserId: userId }], status: "COMPLETED" },
  });

  res.json({
    success: true,
    data: { ...user, exchangeCount, avgRating: 0, reviewCount: 0, followerCount: 0 },
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const { businessName, industry, description, stage, website, instagramHandle, ...userFields } = input;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...userFields,
      ...(businessName || industry || description || stage || website !== undefined || instagramHandle !== undefined
        ? {
            businessProfile: {
              upsert: {
                create: {
                  businessName: businessName ?? "",
                  industry: industry ?? "OTHER",
                  description: description ?? "",
                  stage: stage ?? "IDEA",
                  website: website ?? null,
                  instagramHandle: instagramHandle ?? null,
                },
                update: {
                  ...(businessName && { businessName }),
                  ...(industry && { industry }),
                  ...(description && { description }),
                  ...(stage && { stage }),
                  ...(website !== undefined && { website: website || null }),
                  ...(instagramHandle !== undefined && { instagramHandle: instagramHandle || null }),
                },
              },
            },
          }
        : {}),
    },
    select: publicUserSelect,
  });

  res.json({ success: true, data: user });
};
