import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { acceptApplication, addRole, applyToRole, createTeam, getTeam, leaveTeam, listApplications, listTeams, myTeams, rejectApplication, updateRole, updateTeam } from "../controllers/teamController";

export const teamRouter = Router();

teamRouter.get("/", authMiddleware, asyncHandler(listTeams));
teamRouter.post("/", authMiddleware, asyncHandler(createTeam));
teamRouter.get("/my", authMiddleware, asyncHandler(myTeams));
teamRouter.put("/roles/:roleId", authMiddleware, asyncHandler(updateRole));
teamRouter.post("/roles/:roleId/apply", authMiddleware, asyncHandler(applyToRole));
teamRouter.put("/applications/:appId/accept", authMiddleware, asyncHandler(acceptApplication));
teamRouter.put("/applications/:appId/reject", authMiddleware, asyncHandler(rejectApplication));
teamRouter.delete("/:teamId/leave", authMiddleware, asyncHandler(leaveTeam));
teamRouter.get("/:teamId", authMiddleware, asyncHandler(getTeam));
teamRouter.put("/:teamId", authMiddleware, asyncHandler(updateTeam));
teamRouter.post("/:teamId/roles", authMiddleware, asyncHandler(addRole));
teamRouter.get("/:teamId/applications", authMiddleware, asyncHandler(listApplications));
