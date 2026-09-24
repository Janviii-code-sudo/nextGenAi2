import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

import {
  analyzeResume
} from "../controllers/resumeScore.controller.js";

const resumeScoreRouter = express.Router();

resumeScoreRouter.post(
  "/analyze",
  isAuth,
  upload.single("resume"),
  analyzeResume
);

export default resumeScoreRouter;