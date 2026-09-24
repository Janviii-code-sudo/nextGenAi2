import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  getInterviewHistory,
  getDashboardStats
} from "../controllers/dashboard.controller.js";

const dashboardRouter = express.Router();

dashboardRouter.get(
  "/interviews",
  isAuth,
  getInterviewHistory
);

dashboardRouter.get(
  "/stats",
  isAuth,
  getDashboardStats
);

export default dashboardRouter;