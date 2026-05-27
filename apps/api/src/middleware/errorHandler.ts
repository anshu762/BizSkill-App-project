import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "Endpoint not found"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues[0]?.message ?? "Invalid request";
  } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    statusCode = 409;
    message = "An account with this email already exists";
  } else {
    console.error(error);
  }

  res.status(statusCode).json({ success: false, message, statusCode });
};
