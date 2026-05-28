import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
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
import { env } from "./utils/env";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

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

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`BizSkills API listening on port ${env.PORT}`);
});

