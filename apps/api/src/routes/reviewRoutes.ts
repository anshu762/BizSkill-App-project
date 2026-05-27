import { Router } from "express";
import { createReview, getUserReviews } from "../controllers/reviewController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const reviewRouter = Router();

reviewRouter.post("/", authMiddleware, asyncHandler(createReview));
reviewRouter.get("/:userId", asyncHandler(getUserReviews));
