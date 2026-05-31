import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { discover } from "../controllers/discoverController";

export const discoverRouter = Router();
discoverRouter.get("/", authMiddleware, asyncHandler(discover));
