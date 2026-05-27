import { Router } from "express";
import { addSkill, deleteSkill, updateSkill } from "../controllers/skillController";
import { authMiddleware } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const skillRouter = Router();

skillRouter.use(authMiddleware);
skillRouter.post("/", asyncHandler(addSkill));
skillRouter.put("/:skillId", asyncHandler(updateSkill));
skillRouter.delete("/:skillId", asyncHandler(deleteSkill));
