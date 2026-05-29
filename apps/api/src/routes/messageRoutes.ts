import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getConversations, getMessages, markAsRead, sendMessage } from "../controllers/messageController";

export const messageRouter = Router();

messageRouter.get("/conversations", authMiddleware, getConversations);
messageRouter.put("/:userId/read", authMiddleware, markAsRead);
messageRouter.get("/:userId", authMiddleware, getMessages);
messageRouter.post("/:userId", authMiddleware, sendMessage);
