import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { discover } from "../controllers/discoverController";

export const discoverRouter = Router();
discoverRouter.get("/", authMiddleware, discover);
