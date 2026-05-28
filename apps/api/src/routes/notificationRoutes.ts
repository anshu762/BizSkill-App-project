import { Router } from "express";
import { getNotifications, getUnreadCount, markAllRead } from "../controllers/notificationController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);
notificationRouter.get("/", asyncHandler(getNotifications));
notificationRouter.put("/read-all", asyncHandler(markAllRead));
notificationRouter.get("/unread-count", asyncHandler(getUnreadCount));
