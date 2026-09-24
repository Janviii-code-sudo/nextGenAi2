import Resume from "../models/resume.model.js";

export const createResume = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const resume = await Resume.create({
      userId,
      ...req.body
    });

    return res.status(201).json({
      message: "Resume created successfully",
      resume
    });

  } catch (error) {
    console.error("Create resume error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create resume"
    });
  }
};

export const getResume = async (req, res) => {
  try {
    const userId = req.userId;

    const resume = await Resume.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      message: "Resume fetched successfully",
      resume
    });

  } catch (error) {
    console.error("Get resume error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to fetch resume"
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOneAndUpdate(
      {
        _id: resumeId,
        userId
      },
      {
        $set: req.body
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      message: "Resume updated successfully",
      resume
    });

  } catch (error) {
    console.error("Update resume error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update resume"
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const userId = req.userId;
    const { resumeId } = req.params;

    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      userId
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found"
      });
    }

    return res.status(200).json({
      message: "Resume deleted successfully"
    });

  } catch (error) {
    console.error("Delete resume error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to delete resume"
    });
  }
};