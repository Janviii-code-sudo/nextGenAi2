import express from "express";
import isAuth from "../middlewares/isAuth.js";

import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post(
  "/create-order",
  isAuth,
  createPaymentOrder
);

paymentRouter.post(
  "/verify",
  isAuth,
  verifyPayment
);

export default paymentRouter;