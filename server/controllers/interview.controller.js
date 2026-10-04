import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import { deductCredits } from "./user.controller.js";
import Interview from "../models/interview.model.js";
import askAi from "../services/openRouter.services.js";

/* =========================
   RESUME TEXT EXTRACTION
========================= */

const extractPdfText = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);

    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(data),
    }).promise;

    let text = "";

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => item.str)
        .join(" ");

      text += pageText + "\n";
    }

    return text;
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    throw new Error("Failed to read resume PDF");
  }
};

const extractDocxText = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value || "";
  } catch (error) {
    console.error("DOCX extraction error:", error.message);
    throw new Error("Failed to read resume DOCX");
  }
};

const extractResumeText = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".pdf") {
    return extractPdfText(filePath);
  }

  if (extension === ".docx") {
    return extractDocxText(filePath);
  }

  if (extension === ".doc") {
    throw new Error(
      "Old .doc files are not supported. Please upload a PDF or DOCX resume."
    );
  }

  throw new Error(
    "Unsupported resume format. Please upload a PDF or DOCX file."
  );
};

/* =========================
   ANALYZE RESUME
========================= */

export const analyzeResume = async (req, res) => {
  let uploadedFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    uploadedFilePath = req.file.path;

    const resumeText = await extractResumeText(req.file.path);

    console.log(
      "Resume received:",
      req.file.originalname
    );

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",

      role: "Software Engineer",

      // Keep this as a STRING because the teammate frontend
      // uses experience.replace(...)
      experience: "0",

      projects: [],
      skills: [],
      resumeText,
    });
  } catch (error) {
    console.error("Resume analysis error:", error);

    return res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);

        console.log("Temporary resume deleted");
      } catch (error) {
        console.log(
          "Could not delete uploaded resume:",
          error.message
        );
      }
    }
  }
};

/* =========================
   GENERATE QUESTIONS
========================= */

export const generateQuestions = async (req, res) => {
  try {
    const {
      jobRole,
      experience,
      interviewType,
    } = req.body;

    if (
      !jobRole ||
      experience === undefined ||
      !interviewType
    ) {
      return res.status(400).json({
        message:
          "jobRole, experience and interviewType are required",
      });
    }

    const questions = [
      {
        question:
          `Tell me about yourself and your experience related to ${jobRole}.`,
        difficulty: "Easy",
        timeLimit: 120,
      },
      {
        question:
          `What are the most important skills you have for a ${jobRole} position?`,
        difficulty: "Easy",
        timeLimit: 120,
      },
      {
        question:
          "Describe a challenging project you worked on and how you solved the problem.",
        difficulty: "Medium",
        timeLimit: 150,
      },
      {
        question:
          `How would you approach solving a difficult problem in a ${interviewType} interview?`,
        difficulty: "Medium",
        timeLimit: 150,
      },
      {
        question:
          `Why do you think you are a good fit for this ${jobRole} role?`,
        difficulty: "Medium",
        timeLimit: 120,
      },
    ];

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(
      "Generate questions error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to generate interview questions",
      error: error.message,
    });
  }
};

/* =========================
   START INTERVIEW
========================= */

export const startInterview = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const {
      jobRole,
      experience,
      interviewType,
    } = req.body;

    const userId = req.userId;

    console.log(
      "START INTERVIEW REQUEST:",
      {
        jobRole,
        experience,
        interviewType,
        hasResume: !!req.file,
        userId,
      }
    );

    if (!userId) {
      return res.status(401).json({
        message: "User is not authenticated",
      });
    }

    if (
      !jobRole ||
      experience === undefined ||
      experience === "" ||
      !interviewType
    ) {
      return res.status(400).json({
        message:
          "Job role, experience and interview type are required",
      });
    }

    let resumeText = "";
    let resumeFileName = "";

    if (req.file) {
      uploadedFilePath = req.file.path;

      resumeFileName = path.basename(
        req.file.path
      );

      try {
        resumeText =
          await extractResumeText(req.file.path);
      } catch (error) {
        console.error(
          "Resume extraction failed:",
          error.message
        );

        resumeText = "";
      }
    }

    const prompt = `
You are an expert interview question generator.

Create interview questions for a candidate.

Job Role:
${jobRole}

Experience:
${experience} years

Interview Type:
${interviewType}

Resume:
${resumeText || "No resume was provided."}

Generate exactly 5 interview questions.

The questions should be relevant to:
- the job role
- the candidate's experience
- the interview type
- the resume, if provided

Return ONLY valid JSON.

Required format:

{
  "questions": [
    {
      "question": "",
      "difficulty": "Easy",
      "timeLimit": 120
    }
  ]
}

Rules:
- Exactly 5 questions
- difficulty must be Easy, Medium, or Hard
- timeLimit must be a number in seconds
- Do not include markdown
- Return only JSON
`;

    let aiResponse;

    try {
      aiResponse = await askAi(prompt);
    } catch (error) {
      console.error(
        "AI question generation error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Failed to generate interview questions",
        error: error.message,
      });
    }

    let aiData;

    try {
      const cleanedResponse = String(aiResponse)
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      aiData = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "AI JSON parsing error:",
        error.message
      );

      console.error(
        "AI RESPONSE:",
        aiResponse
      );

      return res.status(500).json({
        message:
          "AI returned an invalid question format",
      });
    }

    const questions =
      (aiData.questions || [])
        .map((question) => ({
          question:
            typeof question === "string"
              ? question
              : question.question || "",

          difficulty:
            typeof question === "object"
              ? question.difficulty || "Medium"
              : "Medium",

          timeLimit:
            typeof question === "object"
              ? Number(question.timeLimit) || 120
              : 120,

          answer: "",
          feedback: "",
          score: 0,
          confidence: 0,
          communication: 0,
          correctness: 0,
        }))
        .filter(
          (question) =>
            question.question &&
            question.question.trim() !== ""
        )
        .slice(0, 5);

    if (questions.length === 0) {
      return res.status(500).json({
        message:
          "AI could not generate interview questions",
      });
    }

    const interview = await Interview.create({
      userId,
      jobRole,
      experience: Number(experience),
      mode: interviewType,
      resume: resumeFileName,
      resumeText,
      questions,
      score: 0,
      report: "",
    });

    let creditsLeft = null;

    try {
      const creditResult = await deductCredits(
        userId,
        10
      );

      if (
        creditResult &&
        typeof creditResult.credits === "number"
      ) {
        creditsLeft = creditResult.credits;
      }
    } catch (error) {
      await Interview.findByIdAndDelete(
        interview._id
      );

      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,

      message:
        "Interview created successfully",

      interviewId: interview._id,

      creditsLeft,

      interview: {
        id: interview._id,
        jobRole: interview.jobRole,
        experience: String(experience),
        interviewType,
        questions: interview.questions,
      },
    });
  } catch (error) {
    console.error(
      "Start interview error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to start interview",
    });
  } finally {
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);

        console.log(
          "Temporary resume deleted"
        );
      } catch (error) {
        console.log(
          "Could not delete uploaded resume:",
          error.message
        );
      }
    }
  }
};

/* =========================
   SUBMIT ANSWER
========================= */

export const submitAnswer = async (
  req,
  res
) => {
  try {
    const {
      interviewId,
      questionId,
      answer,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "User is not authenticated",
      });
    }

    if (
      !interviewId ||
      !questionId ||
      answer === undefined
    ) {
      return res.status(400).json({
        message:
          "Interview ID, question ID and answer are required",
      });
    }

    const interview =
      await Interview.findOne({
        _id: interviewId,
        userId,
      });

    if (!interview) {
      return res.status(404).json({
        message:
          "Interview not found",
      });
    }

    const question =
      interview.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        message:
          "Question not found",
      });
    }

    question.answer = answer;

    const prompt = `
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Question:
${question.question}

Candidate Answer:
${answer}

Return ONLY valid JSON in exactly this format:

{
  "feedback": "",
  "score": 0
}

Rules:
- score must be a number from 0 to 10
- feedback should briefly explain what was good,
  what was missing, and how the answer could be improved
- do not include markdown
`;

    const aiResponse = await askAi(prompt);

    let evaluation;

    try {
      const cleanedResponse =
        aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      evaluation =
        JSON.parse(cleanedResponse);
    } catch (error) {
      console.error(
        "Answer evaluation JSON parsing error:",
        error.message
      );

      evaluation = {
        feedback: aiResponse,
        score: 0,
      };
    }

    question.feedback =
      evaluation.feedback || "";

    await interview.save();

    return res.status(200).json({
      message:
        "Answer evaluated successfully",
      questionId,
      feedback:
        question.feedback,
      score:
        Number(evaluation.score) || 0,
    });
  } catch (error) {
    console.error(
      "Submit answer error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to submit answer",
    });
  }
};

/* =========================
   GENERATE INTERVIEW REPORT
========================= */

export const generateInterviewReport =
  async (req, res) => {
    try {
      const {
        interviewId,
      } = req.body;

      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          message:
            "User is not authenticated",
        });
      }

      if (!interviewId) {
        return res.status(400).json({
          message:
            "Interview ID is required",
        });
      }

      const interview =
        await Interview.findOne({
          _id: interviewId,
          userId,
        });

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      if (
        !interview.questions ||
        interview.questions.length === 0
      ) {
        return res.status(400).json({
          message:
            "No interview questions found",
        });
      }

      const unansweredQuestions =
        interview.questions.filter(
          (question) =>
            !question.answer ||
            question.answer.trim() === ""
        );

      if (
        unansweredQuestions.length > 0
      ) {
        return res.status(400).json({
          message:
            "Please answer all interview questions before generating the report",
        });
      }

      const questionsText =
        interview.questions
          .map(
            (question, index) => `
Question ${index + 1}:
${question.question}

Candidate Answer:
${question.answer}

AI Feedback:
${question.feedback}
`
          )
          .join("\n");

      const prompt = `
You are an expert interview evaluator.

Analyze the following completed interview.

Job Role:
${interview.jobRole}

Experience:
${interview.experience} years

Interview Type:
${interview.mode}

Questions and Answers:
${questionsText}

Return ONLY valid JSON in exactly this format:

{
  "score": 0,
  "report": "",
  "strengths": [],
  "weaknesses": [],
  "recommendation": ""
}

Rules:
- score must be from 0 to 100
- report should summarize the overall performance
- strengths should contain important strengths
- weaknesses should contain important weaknesses
- recommendation should give a final hiring/interview recommendation
- return only valid JSON
`;

      const aiResponse =
        await askAi(prompt);

      let result;

      try {
        const cleanedResponse =
          aiResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        result =
          JSON.parse(cleanedResponse);
      } catch (error) {
        console.error(
          "Report JSON parsing error:",
          error.message
        );

        result = {
          score: 0,
          report: aiResponse,
          strengths: [],
          weaknesses: [],
          recommendation: "",
        };
      }

      const finalScore =
        Math.max(
          0,
          Math.min(
            100,
            Number(result.score) || 0
          )
        );

      interview.score = finalScore;
      interview.report = result.report || "";

      await interview.save();

      return res.status(200).json({
        message:
          "Interview report generated successfully",

        interviewId:
          interview._id,

        score: finalScore,

        report:
          result.report || "",

        strengths:
          result.strengths || [],

        weaknesses:
          result.weaknesses || [],

        recommendation:
          result.recommendation || "",
      });
    } catch (error) {
      console.error(
        "Generate interview report error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to generate interview report",
      });
    }
  };

/* =========================
   GET INTERVIEW REPORT
========================= */

export const getInterviewReport =
  async (req, res) => {
    try {
      const userId = req.userId;

      const { interviewId } = req.params;

      if (!userId) {
        return res.status(401).json({
          message:
            "User is not authenticated",
        });
      }

      if (!interviewId) {
        return res.status(400).json({
          message:
            "Interview ID is required",
        });
      }

      const interview =
        await Interview.findOne({
          _id: interviewId,
          userId,
        });

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      return res.status(200).json({
        message:
          "Interview report fetched successfully",
        interview,
      });
    } catch (error) {
      console.error(
        "Get interview report error:",
        error
      );

      return res.status(500).json({
        message:
          error.message ||
          "Failed to fetch interview report",
      });
    }
  };