import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ override: process.env.NODE_ENV !== "production" });

const secretMinimumLength = process.env.NODE_ENV === "production" ? 32 : 16;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(secretMinimumLength),
  JWT_REFRESH_SECRET: z.string().min(secretMinimumLength),
  PORT: z.coerce.number().int().positive().default(3000),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
