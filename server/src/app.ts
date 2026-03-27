import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { kycRouter } from "./routes/kyc.routes";
import { walletRouter } from "./routes/wallet.routes";
import { transferRouter } from "./routes/transfer.routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json());

// Logging (skip in test)
if (env.NODE_ENV !== "test") {
  app.use(morgan("short"));
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/kyc", kycRouter);
app.use("/wallet", walletRouter);
app.use("/api", transferRouter);

// Error handler (must be last)
app.use(errorHandler);

export { app };
