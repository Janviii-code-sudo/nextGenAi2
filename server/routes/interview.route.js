import express from "express";

import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";

import {
    analyzeResume,
    generateQuestion,
    submitAnswer,
    finishInterview
} from "../models/controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);

interviewRouter.post("/generate-questions", isAuth, generateQuestion);

interviewRouter.post("/:interviewId/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

export default interviewRouter;