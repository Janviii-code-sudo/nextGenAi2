import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  createResume,
  getResume,
  updateResume,
  deleteResume
} from "../controllers/resume.controller.js";

const resumeRouter = express.Router();

resumeRouter.post(
  "/",
  isAuth,
  createResume
);

resumeRouter.get(
  "/",
  isAuth,
  getResume
);

resumeRouter.put(
  "/:resumeId",
  isAuth,
  updateResume
);

resumeRouter.delete(
  "/:resumeId",
  isAuth,
  deleteResume
);

export default resumeRouter;
