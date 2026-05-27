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

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`BizSkills API listening on port ${env.PORT}`);
});

