import Roadmap from "../models/roadmap.model.js";
import askAi from "../services/openRouter.services.js";
import deductCredits from "../services/credit.service.js";

export const createRoadmap = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated"
      });
    }

    const { targetRole, currentLevel, skills } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        message: "Target role is required"
      });
    }

    const prompt = `
Create a practical career roadmap for the following user.

Target Role: ${targetRole}
Current Level: ${currentLevel || "Beginner"}
Current Skills: ${
      Array.isArray(skills)
        ? skills.join(", ")
        : skills || "None"
    }

Return ONLY valid JSON in exactly this format:

{
  "roadmap": [
    {
      "title": "",
      "description": "",
      "topics": [],
      "resources": []
    }
  ]
}

Rules:
- Create 5 to 8 roadmap stages.
- Make the stages progressive from beginner to job-ready.
- topics must be an array of strings.
- resources must be an array of useful resource names or URLs.
- Do not use markdown.
`;

    const aiResponse = await askAi(prompt);

    let aiResult;

    try {
      aiResult = JSON.parse(aiResponse);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned an invalid roadmap"
      });
    }

    if (
      !aiResult ||
      !Array.isArray(aiResult.roadmap)
    ) {
      return res.status(500).json({
        message: "Invalid roadmap format returned by AI"
      });
    }
    try {
  await deductCredits(userId, 10);
} catch (error) {
  return res.status(400).json({
    message: error.message
  });
}

    const roadmap = await Roadmap.create({
      userId,
      targetRole,
      currentLevel: currentLevel || "Beginner",
      skills: Array.isArray(skills) ? skills : [],
      roadmap: aiResult.roadmap.map((item) => ({
        title: item.title || "",
        description: item.description || "",
        topics: Array.isArray(item.topics)
          ? item.topics
          : [],
        resources: Array.isArray(item.resources)
          ? item.resources
          : [],
        completed: false
      }))
    });

    return res.status(201).json({
      message: "Roadmap created successfully",
      roadmap
    });

  } catch (error) {
    console.error("Create roadmap error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to create roadmap"
    });
  }
};

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.userId;

    const roadmap = await Roadmap.findOne({
      userId
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found"
      });
    }

    return res.status(200).json({
      message: "Roadmap fetched successfully",
      roadmap
    });

  } catch (error) {
    console.error("Get roadmap error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to fetch roadmap"
    });
  }
};

export const updateRoadmap = async (req, res) => {
  try {
    const userId = req.userId;
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findOneAndUpdate(
      {
        _id: roadmapId,
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

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found"
      });
    }

    return res.status(200).json({
      message: "Roadmap updated successfully",
      roadmap
    });

  } catch (error) {
    console.error("Update roadmap error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update roadmap"
    });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    const userId = req.userId;
    const { roadmapId } = req.params;

    const roadmap = await Roadmap.findOneAndDelete({
      _id: roadmapId,
      userId
    });

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found"
      });
    }

    return res.status(200).json({
      message: "Roadmap deleted successfully"
    });

  } catch (error) {
    console.error("Delete roadmap error:", error);

    return res.status(500).json({
      message:
        error.message ||
        "Failed to delete roadmap"
    });
  }
};

export const updateRoadmapProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const { roadmapId, itemId } = req.params;
    const { completed } = req.body;

    const roadmap = await Roadmap.findOne({
      _id: roadmapId,
      userId
    });

    if (!roadmap) {
      return res.status(404).json({
        message: "Roadmap not found"
      });
    }

    const item = roadmap.roadmap.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Roadmap item not found"
      });
    }

    item.completed = Boolean(completed);

    await roadmap.save();

    return res.status(200).json({
      message: "Roadmap progress updated successfully",
      roadmap
    });

  } catch (error) {
    console.error(
      "Update roadmap progress error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to update roadmap progress"
    });
  }
};