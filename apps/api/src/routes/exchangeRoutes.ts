import { Router } from "express";
import {
  acceptExchange, cancelExchange, completeExchange, createExchange, getExchange, listExchanges, rejectExchange,
} from "../controllers/exchangeController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const exchangeRouter = Router();

exchangeRouter.use(authMiddleware);
exchangeRouter.post("/", asyncHandler(createExchange));
exchangeRouter.get("/", asyncHandler(listExchanges));
exchangeRouter.get("/:id", asyncHandler(getExchange));
exchangeRouter.put("/:id/accept", asyncHandler(acceptExchange));
exchangeRouter.put("/:id/reject", asyncHandler(rejectExchange));
exchangeRouter.put("/:id/complete", asyncHandler(completeExchange));
exchangeRouter.put("/:id/cancel", asyncHandler(cancelExchange));
