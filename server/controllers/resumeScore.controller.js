import fs from "fs";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import askAi from "../services/openRouter.services.js";
import deductCredits from "../services/credit.service.js";

export const analyzeResume = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume PDF is required"
      });
    }

    filePath = req.file.path;

    const data = new Uint8Array(
      fs.readFileSync(filePath)
    );

    const pdf = await pdfjsLib.getDocument({
      data
    }).promise;

    let resumeText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => item.str)
        .join(" ");

      resumeText += pageText + "\n";
    }

    if (!resumeText.trim()) {
      return res.status(400).json({
        message: "Could not extract text from resume"
      });
    }

    const prompt = `
You are an expert resume reviewer.

Analyze the following resume and return ONLY valid JSON.

Resume:
${resumeText}

Return exactly this structure:

{
  "score": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "skills": [],
  "suggestions": [],
  "atsFeedback": ""
}

Rules:
- score must be a number from 0 to 100.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- skills must be an array of strings.
- suggestions must be an array of strings.
- Keep the analysis practical and specific.
- Do not use markdown.
`;
try {
  await deductCredits(req.userId, 10);
} catch (error) {
  return res.status(400).json({
    message: error.message
  });
}

    const aiResponse = await askAi(prompt);

    let result;

    try {
      result = JSON.parse(aiResponse);
    } catch (error) {
      return res.status(500).json({
        message: "AI returned an invalid resume analysis"
      });
    }

    return res.status(200).json({
      message: "Resume analyzed successfully",
      result
    });

  } catch (error) {
    console.error(
      "Resume analysis error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Failed to analyze resume"
    });

  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
