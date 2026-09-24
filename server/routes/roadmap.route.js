import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  createRoadmap,
  getRoadmap,
  updateRoadmap,
  deleteRoadmap,
  updateRoadmapProgress
} from "../controllers/roadmap.controller.js";

const roadmapRouter = express.Router();

roadmapRouter.post(
  "/",
  isAuth,
  createRoadmap
);

roadmapRouter.get(
  "/",
  isAuth,
  getRoadmap
);

roadmapRouter.put(
  "/:roadmapId",
  isAuth,
  updateRoadmap
);

roadmapRouter.delete(
  "/:roadmapId",
  isAuth,
  deleteRoadmap
);

roadmapRouter.patch(
  "/:roadmapId/progress/:itemId",
  isAuth,
  updateRoadmapProgress
);

export default roadmapRouter;
