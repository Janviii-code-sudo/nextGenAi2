import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  createPaymentOrder
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create-order",
  isAuth,
  createPaymentOrder
);

export default paymentRouter;
