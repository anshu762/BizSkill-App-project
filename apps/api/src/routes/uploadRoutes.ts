import { Router } from "express";
import { upload, uploadAvatar, uploadPost, uploadPostImage } from "../controllers/uploadController";
import { authMiddleware } from "../middleware/authMiddleware";

export const uploadRouter = Router();

uploadRouter.post("/avatar", authMiddleware, upload, uploadAvatar);
uploadRouter.post("/post-image", authMiddleware, uploadPost, uploadPostImage);
