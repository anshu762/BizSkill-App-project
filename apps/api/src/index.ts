import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { prisma } from "./lib/prisma";
import { authRouter } from "./routes/authRoutes";
import { userRouter } from "./routes/userRoutes";
import { profileRouter } from "./routes/profileRoutes";
import { skillRouter } from "./routes/skillRoutes";
import { uploadRouter } from "./routes/uploadRoutes";
import { marketplaceRouter } from "./routes/marketplaceRoutes";
import { exchangeRouter } from "./routes/exchangeRoutes";
import { walletRouter } from "./routes/walletRoutes";
import { reviewRouter } from "./routes/reviewRoutes";
import { postRouter } from "./routes/postRoutes";
import { commentRouter } from "./routes/commentRoutes";
import { followRouter } from "./routes/followRoutes";
import { notificationRouter } from "./routes/notificationRoutes";
import { teamRouter } from "./routes/teamRoutes";
import { discoverRouter } from "./routes/discoverRoutes";
import { messageRouter } from "./routes/messageRoutes";
import { env } from "./utils/env";

const app = express();

// Trust proxy is required for express-rate-limit when deployed behind a reverse proxy (like Railway)
app.set("trust proxy", 1);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { skip: () => true }));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to BizSkills API! 🚀",
    status: "Running smoothly",
    healthCheck: "/api/health"
  });
});

app.get("/api", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BizSkills API Endpoint",
    version: "v1",
    docs: "Endpoints are available under /api/*"
  });
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected", timestamp: new Date().toISOString() });
  }
});

app.use("/api", limiter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/skills", skillRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/marketplace", marketplaceRouter);
app.use("/api/exchanges", exchangeRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/follow", followRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/teams", teamRouter);
app.use("/api/discover", discoverRouter);
app.use("/api/messages", messageRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`BizSkills API listening on port ${env.PORT}`);
});

export default app;
