import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

import {
  startInterview,
  submitAnswer,
  generateInterviewReport,
  getInterviewReport,
  analyzeResume,
  generateQuestions,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post(
  "/resume",
  isAuth,
  upload.single("resume"),
  analyzeResume
);

interviewRouter.post(
  "/generate-questions",
  isAuth,
  generateQuestions
);

interviewRouter.post(
  "/start",
  isAuth,
  upload.single("resume"),
  startInterview
);

interviewRouter.post(
  "/answer",
  isAuth,
  submitAnswer
);

interviewRouter.post(
  "/report",
  isAuth,
  generateInterviewReport
);

interviewRouter.get(
  "/report/:interviewId",
  isAuth,
  getInterviewReport
);

export default interviewRouter;