import type { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { AppError } from "../utils/appError";
import { prisma } from "../lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError(400, "Only image files are allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("avatar");

export const uploadAvatar = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(400, "No file uploaded");

  const userId = req.user?.id;
  if (!userId) throw new AppError(401, "Authentication required");

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "bizskills/avatars",
    transformation: { width: 400, height: 400, crop: "fill", gravity: "face" },
  });

  await prisma.user.update({ where: { id: userId }, data: { avatar: result.secure_url } });

  res.json({ success: true, data: { url: result.secure_url } });
};
