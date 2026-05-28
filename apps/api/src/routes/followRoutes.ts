import { Router } from "express";
import { followUser, getFollowStats, unfollowUser } from "../controllers/followController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const followRouter = Router();

followRouter.use(authMiddleware);
followRouter.post("/:targetUserId", asyncHandler(followUser));
followRouter.delete("/:targetUserId", asyncHandler(unfollowUser));
followRouter.get("/:userId/stats", authMiddleware, asyncHandler(getFollowStats));
