import { Router } from "express";
import { addComment, createPost, deleteComment, deletePost, getComments, getFeed, getPost, toggleLike, updatePost } from "../controllers/postController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const postRouter = Router();

postRouter.use(authMiddleware);
postRouter.get("/feed", asyncHandler(getFeed));
postRouter.post("/", asyncHandler(createPost));
postRouter.get("/:postId", asyncHandler(getPost));
postRouter.put("/:postId", asyncHandler(updatePost));
postRouter.delete("/:postId", asyncHandler(deletePost));
postRouter.post("/:postId/like", asyncHandler(toggleLike));
postRouter.get("/:postId/comments", asyncHandler(getComments));
postRouter.post("/:postId/comments", asyncHandler(addComment));
