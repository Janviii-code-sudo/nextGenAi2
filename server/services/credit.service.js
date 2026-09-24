import User from "../models/user.model.js";

const deductCredits = async (userId, amount) => {
  const credits = Number(amount);

  if (!Number.isInteger(credits) || credits <= 0) {
    throw new Error("Invalid credit amount");
  }

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      credits: {
        $gte: credits
      }
    },
    {
      $inc: {
        credits: -credits
      }
    },
    {
      new: true
    }
  ).select("credits");

  if (!user) {
    throw new Error("Insufficient credits");
  }

  return user.credits;
};

export default deductCredits;
