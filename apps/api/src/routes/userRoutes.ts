import { Router } from "express";
import { completeOnboarding, me } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const userRouter = Router();

userRouter.use(authMiddleware);
userRouter.get("/me", asyncHandler(me));
userRouter.put("/onboarding", asyncHandler(completeOnboarding));

