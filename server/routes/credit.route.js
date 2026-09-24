import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  getCredits,
  deductCredits
} from "../controllers/credit.controller.js";

const creditRouter = express.Router();

creditRouter.get(
  "/",
  isAuth,
  getCredits
);

creditRouter.post(
  "/deduct",
  isAuth,
  deductCredits
);

export default creditRouter;
