import { Router } from "express";
import { completeOnboarding, getPublicProfile, updateProfile } from "../controllers/profileController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const profileRouter = Router();

profileRouter.post("/onboarding", authMiddleware, asyncHandler(completeOnboarding));
profileRouter.get("/:userId", asyncHandler(getPublicProfile));
profileRouter.put("/", authMiddleware, asyncHandler(updateProfile));
