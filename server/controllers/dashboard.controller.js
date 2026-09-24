import Interview from "../models/interview.model.js";

export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .select(
        "jobRole experience interviewType score questions createdAt"
      );

    const history = interviews.map((interview) => ({
      id: interview._id,
      jobRole: interview.jobRole,
      experience: interview.experience,
      interviewType: interview.interviewType,
      score: interview.score || 0,

      questionsCount: interview.questions
        ? interview.questions.length
        : 0,

      questionsSolved: interview.questions
        ? interview.questions.filter(
            (q) => q.answer && q.answer.trim() !== ""
          ).length
        : 0,

      createdAt: interview.createdAt
    }));

    return res.status(200).json({
      message: "Interview history fetched successfully",
      interviews: history
    });

  } catch (error) {
    console.error("Get interview history error:", error);

    return res.status(500).json({
      message: "Failed to fetch interview history"
    });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const interviews = await Interview.find({ userId });

    const totalInterviews = interviews.length;

    let questionsSolved = 0;
    let completedInterviews = 0;
    let totalScore = 0;

    interviews.forEach((interview) => {

      if (interview.questions) {
        questionsSolved += interview.questions.filter(
          (q) => q.answer && q.answer.trim() !== ""
        ).length;
      }

      if (
        interview.questions &&
        interview.questions.length > 0 &&
        interview.questions.every(
          (q) => q.answer && q.answer.trim() !== ""
        )
      ) {
        completedInterviews++;
      }

      totalScore += interview.score || 0;
    });

   const averagePerformance =
  totalInterviews > 0
    ? Math.round(totalScore / totalInterviews)
    : 0;

return res.status(200).json({
  totalInterviews,
  questionsSolved,
  completedInterviews,
  averagePerformance
});

} catch (error) {
  console.error("Get dashboard stats error:", error);

  return res.status(500).json({
    message: "Failed to fetch dashboard statistics"
  });
}
};
  