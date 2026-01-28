import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. 導入路徑與服務 (New Structure)
import chatRoutes from "./routes/chat.js";
import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import eventRoutes from "./routes/event.js";
import socialRoutes from "./routes/social.js";
import followRoutes from "./routes/followRoutes.js";
import matchRoutes from "./routes/match.js";
import { chatService } from "./services/chatService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();

// 配置
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const corsOptions = {
  origin: [FRONTEND_URL, "https://japanpetpetni.zeabur.app/", "https://petpetni.site."],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

// 2. 註冊路由
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/match", matchRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PetPetNi API Server is ALIVE!" });
});

// 3. 啟動伺服器
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
