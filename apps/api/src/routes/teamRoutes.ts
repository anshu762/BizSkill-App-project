import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { acceptApplication, addRole, applyToRole, createTeam, getTeam, leaveTeam, listApplications, listTeams, myTeams, rejectApplication, updateRole, updateTeam } from "../controllers/teamController";

export const teamRouter = Router();

teamRouter.get("/", authMiddleware, listTeams);
teamRouter.post("/", authMiddleware, createTeam);
teamRouter.get("/my", authMiddleware, myTeams);
teamRouter.put("/roles/:roleId", authMiddleware, updateRole);
teamRouter.post("/roles/:roleId/apply", authMiddleware, applyToRole);
teamRouter.put("/applications/:appId/accept", authMiddleware, acceptApplication);
teamRouter.put("/applications/:appId/reject", authMiddleware, rejectApplication);
teamRouter.delete("/:teamId/leave", authMiddleware, leaveTeam);
teamRouter.get("/:teamId", authMiddleware, getTeam);
teamRouter.put("/:teamId", authMiddleware, updateTeam);
teamRouter.post("/:teamId/roles", authMiddleware, addRole);
teamRouter.get("/:teamId/applications", authMiddleware, listApplications);
