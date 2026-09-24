import User from "../models/user.model.js";

export const getCredits = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const user = await User.findById(userId).select("credits");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      credits: user.credits
    });

  } catch (error) {
    console.error("Get credits error:", error);

    return res.status(500).json({
      message: "Failed to fetch credits"
    });
  }
};

export const deductCredits = async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const creditsToDeduct = Number(amount);

    if (
      !Number.isInteger(creditsToDeduct) ||
      creditsToDeduct <= 0
    ) {
      return res.status(400).json({
        message: "Credit amount must be a positive integer"
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        credits: { $gte: creditsToDeduct }
      },
      {
        $inc: {
          credits: -creditsToDeduct
        }
      },
      {
        new: true
      }
    ).select("credits");

    if (!user) {
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      return res.status(400).json({
        message: "Insufficient credits"
      });
    }

    return res.status(200).json({
      message: "Credits deducted successfully",
      credits: user.credits
    });

  } catch (error) {
    console.error("Deduct credits error:", error);

    return res.status(500).json({
      message: "Failed to deduct credits"
    });
  }
};
