import { ApplicationStatus, Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

const authenticatedUserId = (req: Request) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  return req.user.id;
};

const teamInclude = {
  owner: { select: { id: true, name: true, avatar: true } },
  members: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { joinedAt: "asc" as const } },
  roles: {
    where: { isOpen: true },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  _count: { select: { members: true, roles: true } },
} satisfies Prisma.TeamInclude;

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["SCHOOL_STARTUP", "COMPETITION", "BUSINESS_FAIR", "PERSONAL_PROJECT"]).optional(),
});

const addRoleSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  skillsNeeded: z.array(z.string()).optional(),
});

const applySchema = z.object({
  message: z.string().max(500).optional(),
});

export const listTeams = async (req: Request, res: Response) => {
  const { category, stage, search } = req.query;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

  const where: Prisma.TeamWhereInput = { isPublic: true };
  if (category && category !== "ALL") where.category = category as any;
  if (stage && stage !== "ALL") where.stage = stage as any;
  if (search) where.name = { contains: search as string, mode: "insensitive" };

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } }, take: 4 },
        _count: { select: { members: true, roles: true } },
        roles: { where: { isOpen: true }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.team.count({ where }),
  ]);

  const data = teams.map((t) => ({
    ...t,
    openRolesCount: t.roles.length,
  }));

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};

export const createTeam = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const input = createTeamSchema.parse(req.body);

  const team = await prisma.team.create({
    data: {
      name: input.name,
      description: input.description,
      category: input.category ?? "PERSONAL_PROJECT",
      ownerId: userId,
      members: { create: { userId, role: "OWNER" } },
    },
    include: teamInclude,
  });

  res.status(201).json({ success: true, data: team });
};

export const getTeam = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { teamId } = req.params;
  
  const teamCheck = await prisma.team.findUnique({
    where: { id: teamId },
    select: { ownerId: true },
  });
  if (!teamCheck) throw new AppError(404, "Team not found");

  const isOwner = teamCheck.ownerId === userId;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { joinedAt: "asc" as const } },
      roles: {
        where: { isOpen: true },
        include: {
          _count: { select: { applications: true } },
          applications: isOwner
            ? {
                include: {
                  applicant: { select: { id: true, name: true, avatar: true } },
                },
                orderBy: { createdAt: "desc" },
              }
            : {
                where: { applicantId: userId, status: "PENDING" },
              },
        },
        orderBy: { createdAt: "asc" as const },
      },
      _count: { select: { members: true, roles: true } },
    },
  });

  res.json({ success: true, data: team });
};

export const updateTeam = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { teamId } = req.params;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError(404, "Team not found");
  if (team.ownerId !== userId) throw new AppError(403, "Only the owner can update");

  const schema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    category: z.enum(["SCHOOL_STARTUP", "COMPETITION", "BUSINESS_FAIR", "PERSONAL_PROJECT"]).optional(),
    stage: z.enum(["FORMING", "ACTIVE", "COMPLETED"]).optional(),
    isPublic: z.boolean().optional(),
  });
  const input = schema.parse(req.body);

  const updated = await prisma.team.update({
    where: { id: teamId },
    data: input,
    include: teamInclude,
  });
  res.json({ success: true, data: updated });
};

export const addRole = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { teamId } = req.params;

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new AppError(404, "Team not found");
  if (team.ownerId !== userId) throw new AppError(403, "Only the owner can add roles");

  const input = addRoleSchema.parse(req.body);
  const role = await prisma.teamRole.create({
    data: { teamId, title: input.title, description: input.description, skillsNeeded: input.skillsNeeded ?? [] },
    include: { _count: { select: { applications: true } } },
  });
  res.status(201).json({ success: true, data: role });
};

export const updateRole = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { roleId } = req.params;

  const role = await prisma.teamRole.findUnique({ where: { id: roleId }, include: { team: true } });
  if (!role) throw new AppError(404, "Role not found");
  if (role.team.ownerId !== userId) throw new AppError(403, "Only the team owner can update roles");

  const schema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    skillsNeeded: z.array(z.string()).optional(),
    isOpen: z.boolean().optional(),
  });
  const input = schema.parse(req.body);

  const updated = await prisma.teamRole.update({
    where: { id: roleId },
    data: input,
    include: { _count: { select: { applications: true } } },
  });
  res.json({ success: true, data: updated });
};

export const applyToRole = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { roleId } = req.params;

  const role = await prisma.teamRole.findUnique({
    where: { id: roleId },
    include: { team: { include: { members: true } } },
  });
  if (!role) throw new AppError(404, "Role not found");
  if (!role.isOpen) throw new AppError(400, "This role is no longer open");

  const isOwner = role.team.ownerId === userId;
  const isMember = role.team.members.some((m) => m.userId === userId);
  if (isOwner || isMember) throw new AppError(400, "You are already part of this team");

  const existing = await prisma.teamApplication.findFirst({
    where: { teamRoleId: roleId, applicantId: userId, status: "PENDING" },
  });
  if (existing) throw new AppError(409, "You have already applied to this role");

  const input = applySchema.parse(req.body);
  const application = await prisma.teamApplication.create({
    data: { teamRoleId: roleId, applicantId: userId, message: input.message },
    include: { applicant: { select: { id: true, name: true, avatar: true } }, teamRole: true },
  });

  const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await prisma.notification.create({
    data: {
      userId: role.team.ownerId,
      type: "TEAM_APPLICATION",
      message: `${me?.name ?? "Someone"} applied for "${role.title}" in ${role.team.name}`,
      link: `/team/${role.teamId}`,
      relatedId: application.id,
    },
  });

  res.status(201).json({ success: true, data: application });
};

export const listApplications = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { teamId } = req.params;

  const team = await prisma.team.findUnique({ where: { id: teamId }, select: { ownerId: true } });
  if (!team) throw new AppError(404, "Team not found");
  if (team.ownerId !== userId) throw new AppError(403, "Only the owner can view applications");

  const roles = await prisma.teamRole.findMany({
    where: { teamId },
    include: {
      applications: {
        include: {
          applicant: { select: { id: true, name: true, avatar: true, businessProfile: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json({ success: true, data: roles });
};

export const acceptApplication = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { appId } = req.params;

  const application = await prisma.teamApplication.findUnique({
    where: { id: appId },
    include: { teamRole: { include: { team: true } }, applicant: { select: { name: true } } },
  });
  if (!application) throw new AppError(404, "Application not found");
  if (application.teamRole.team.ownerId !== userId) throw new AppError(403, "Only the team owner can accept");
  if (application.status !== "PENDING") throw new AppError(400, "Application is no longer pending");

  await prisma.$transaction([
    prisma.teamApplication.update({ where: { id: appId }, data: { status: "ACCEPTED" } }),
    prisma.teamMember.create({ data: { teamId: application.teamRole.teamId, userId: application.applicantId } }),
    prisma.teamRole.update({ where: { id: application.teamRoleId }, data: { isOpen: false } }),
    prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: "APPLICATION_UPDATE",
        message: `Your application for "${application.teamRole.title}" in ${application.teamRole.team.name} was accepted!`,
        link: `/team/${application.teamRole.teamId}`,
        relatedId: appId,
      },
    }),
  ]);

  res.json({ success: true, message: "Application accepted" });
};

export const rejectApplication = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { appId } = req.params;

  const application = await prisma.teamApplication.findUnique({
    where: { id: appId },
    include: { teamRole: { include: { team: true } }, applicant: { select: { name: true } } },
  });
  if (!application) throw new AppError(404, "Application not found");
  if (application.teamRole.team.ownerId !== userId) throw new AppError(403, "Only the team owner can reject");
  if (application.status !== "PENDING") throw new AppError(400, "Application is no longer pending");

  await prisma.$transaction([
    prisma.teamApplication.update({ where: { id: appId }, data: { status: "REJECTED" } }),
    prisma.notification.create({
      data: {
        userId: application.applicantId,
        type: "APPLICATION_UPDATE",
        message: `Your application for "${application.teamRole.title}" in ${application.teamRole.team.name} was not accepted`,
        link: `/team/${application.teamRole.teamId}`,
        relatedId: appId,
      },
    }),
  ]);

  res.json({ success: true, message: "Application rejected" });
};

export const myTeams = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);

  const [ownedTeams, memberTeams, myApplications] = await Promise.all([
    prisma.team.findMany({
      where: { ownerId: userId },
      include: {
        _count: { select: { members: true, roles: true } },
        roles: { where: { isOpen: true }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.team.findMany({
      where: { members: { some: { userId, role: "MEMBER" } } },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.teamApplication.findMany({
      where: { applicantId: userId },
      include: {
        teamRole: { include: { team: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  res.json({
    success: true,
    data: {
      owned: ownedTeams.map((t) => ({ ...t, openRolesCount: t.roles.length })),
      member: memberTeams,
      applications: myApplications,
    },
  });
};

export const leaveTeam = async (req: Request, res: Response) => {
  const userId = authenticatedUserId(req);
  const { teamId } = req.params;

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    include: { team: { select: { ownerId: true } } },
  });
  if (!membership) throw new AppError(404, "You are not a member of this team");
  if (membership.role === "OWNER") throw new AppError(400, "Owner cannot leave; transfer ownership first");

  await prisma.teamMember.delete({ where: { id: membership.id } });
  res.json({ success: true, message: "Left the team" });
};
