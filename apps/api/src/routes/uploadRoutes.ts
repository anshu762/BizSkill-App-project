import { Router } from "express";
import { upload, uploadAvatar } from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";

export const uploadRouter = Router();

uploadRouter.post("/avatar", authMiddleware, upload, uploadAvatar);
