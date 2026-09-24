import Razorpay from "razorpay";
import crypto from "crypto";

import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";

const getRazorpay = () => {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export const createPaymentOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();

    if (!razorpay) {
      return res.status(500).json({
        message: "Razorpay is not configured on the server"
      });
    }

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const { amount, coins } = req.body;

    const paymentAmount = Number(amount);
    const paymentCoins = Number(coins);

    if (
      !Number.isInteger(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        message: "Valid payment amount is required"
      });
    }

    if (
      !Number.isInteger(paymentCoins) ||
      paymentCoins <= 0
    ) {
      return res.status(400).json({
        message: "Valid coin amount is required"
      });
    }

    const options = {
      amount: paymentAmount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId,
      orderId: order.id,
      amount: paymentAmount,
      coins: paymentCoins,
      status: "created"
    });

    return res.status(201).json({
      message: "Payment order created successfully",
      order
    });

  } catch (error) {
    console.error(
      "Create payment order error:",
      error
    );

    return res.status(500).json({
      message:
        error?.error?.description ||
        error.message ||
        "Failed to create payment order"
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay is not configured on the server"
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification data is incomplete"
      });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      userId
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment order not found"
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        message: "Payment has already been processed"
      });
    }

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      payment.status = "failed";

      await payment.save();

      return res.status(400).json({
        message: "Invalid payment signature"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.credits += payment.coins;

    await user.save();

    payment.paymentId = razorpay_payment_id;
    payment.status = "paid";

    await payment.save();

    return res.status(200).json({
      message:
        "Payment verified and credits added successfully",
      credits: user.credits
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to verify payment"
    });
  }
};
