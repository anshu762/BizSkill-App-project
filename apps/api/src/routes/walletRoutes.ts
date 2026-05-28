import { Router } from "express";
import { getWallet } from "../controllers/walletController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const walletRouter = Router();

walletRouter.get("/", authMiddleware, asyncHandler(getWallet));
