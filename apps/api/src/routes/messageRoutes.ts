import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { getConversations, getMessages, markAsRead, sendMessage } from "../controllers/messageController";

export const messageRouter = Router();

messageRouter.get("/conversations", authMiddleware, asyncHandler(getConversations));
messageRouter.put("/:userId/read", authMiddleware, asyncHandler(markAsRead));
messageRouter.get("/:userId", authMiddleware, asyncHandler(getMessages));
messageRouter.post("/:userId", authMiddleware, asyncHandler(sendMessage));
