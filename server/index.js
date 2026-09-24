import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDb from "./config/connectDb.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import resumeRouter from "./routes/resume.route.js";
import roadmapRouter from "./routes/roadmap.route.js";
import creditRouter from "./routes/credit.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/credits", creditRouter);
app.use("/api/payment", paymentRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "InterviewIQ server is running"
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDb();
});
