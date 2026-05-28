import { Router } from "express";
import { deleteComment } from "../controllers/postController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const commentRouter = Router();

commentRouter.use(authMiddleware);
commentRouter.delete("/:commentId", asyncHandler(deleteComment));
