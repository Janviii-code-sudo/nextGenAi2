import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderId: {
      type: String,
      required: true,
      unique: true
    },

    paymentId: {
      type: String,
      default: ""
    },

    amount: {
      type: Number,
      required: true
    },

    coins: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created"
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;