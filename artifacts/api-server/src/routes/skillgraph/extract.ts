import { Router, type IRouter } from "express";
import { createRequire } from "module";
import multer from "multer";
import { openai } from "@workspace/integrations-openai-ai-server";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;
// @ts-ignore — mammoth has no @types package
const mammoth = require("mammoth") as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> };

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter(_req, file, cb) {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use PDF, DOCX, DOC, or an image.`));
    }
  },
});

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
          },
          {
            type: "text",
            text: "Extract all text from this resume/CV image. Return only the raw text content with no commentary, formatting it naturally with line breaks where appropriate.",
          },
        ],
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

router.post("/skillgraph/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "NO_FILE", message: "No file uploaded" });
      return;
    }

    const { buffer, mimetype, originalname } = req.file;
    let extractedText = "";

    req.log.info({ filename: originalname, mimetype }, "Extracting text from uploaded file");

    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPdf(buffer);
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword"
    ) {
      extractedText = await extractTextFromDocx(buffer);
    } else if (mimetype.startsWith("image/")) {
      extractedText = await extractTextFromImage(buffer, mimetype);
    } else {
      res.status(400).json({ error: "UNSUPPORTED_TYPE", message: "Unsupported file type" });
      return;
    }

    if (!extractedText || extractedText.trim().length < 20) {
      res.status(422).json({
        error: "EXTRACTION_FAILED",
        message: "Could not extract meaningful text from the file. Please try pasting your resume as text instead.",
      });
      return;
    }

    res.json({ text: extractedText.trim() });
  } catch (err) {
    req.log.error({ err }, "Error extracting text from file");
    res.status(500).json({ error: "EXTRACTION_ERROR", message: "Failed to extract text from file" });
  }
});

export default router;
