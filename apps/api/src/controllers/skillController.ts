import { SkillCategory, SkillLevel } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const skillSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: z.nativeEnum(SkillCategory),
  description: z.string().trim().max(500).optional(),
  level: z.nativeEnum(SkillLevel),
  coinValue: z.number().int().min(0).max(9999),
  isOffering: z.boolean().default(true),
});

export const addSkill = async (req: Request, res: Response) => {
  const input = skillSchema.parse(req.body);
  const userId = authenticatedUserId(req);

  const skill = await prisma.skill.create({
    data: { userId, ...input, description: input.description ?? null },
  });

  res.status(201).json({ success: true, data: skill });
};

export const updateSkill = async (req: Request, res: Response) => {
  const input = skillSchema.partial().parse(req.body);
  const userId = authenticatedUserId(req);
  const { skillId } = req.params;

  const existing = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!existing || existing.userId !== userId) throw new AppError(404, "Skill not found");

  const skill = await prisma.skill.update({
    where: { id: skillId },
    data: { ...input, description: input.description ?? undefined },
  });

  res.json({ success: true, data: skill });
};

export const deleteSkill = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { skillId } = req.params;

  const existing = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!existing || existing.userId !== userId) throw new AppError(404, "Skill not found");

  const skill = await prisma.skill.update({
    where: { id: skillId },
    data: { isActive: false },
  });

  res.json({ success: true, data: skill });
};
