import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

import {
  startInterview,
  submitAnswer,
  generateInterviewReport
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

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

export default interviewRouter;
