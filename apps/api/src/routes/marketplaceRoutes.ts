import { Router } from "express";
import { listMarketplace } from "../controllers/marketplaceController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const marketplaceRouter = Router();

marketplaceRouter.get("/", authMiddleware, asyncHandler(listMarketplace));
