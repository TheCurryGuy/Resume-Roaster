const express = require("express");
const multer = require("multer");
const pdf = require("pdf-parse");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173',
}));

// Configure Multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Initialize Groq client
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Roast Prompt Template
const createRoastPrompt = (resumeText) => `
You are a savage, no-filter resume roaster. Your job is to tear apart the following resume in plain, raw, and brutally honest language. Don't hold back. 

Resume Text:
${resumeText}

Roast Guidelines:
- Your Roast should be contain roasts of each and every part of the resume starting from the name to everything you find
- Remember the response you will be giving should be a single paragraph only nothing else, One paragraph only which will be roasting the entire resume
- Rip apart every weak point, vague phrase, or generic line
- Make it darkly funny but straightforward, using basic, raw English
- Avoid sugarcoating anything—be blunt and ruthless
- Keep it under 300 words
- Drop sarcastic career advice that stings but makes sense
`;

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "Resume Roaster Backend is alive!" });
});

// Resume Roast Route
app.post("/roast", upload.single("resume"), async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    // Parse PDF
    const parseResult = await pdf(req.file.buffer);
    const resumeText = parseResult.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Unable to extract text from resume" });
    }

    // Create roast prompt
    const roastPrompt = createRoastPrompt(resumeText);

    // Generate roast using Groq's chat completion API
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: roastPrompt }],
      model: "llama-3.3-70b-versatile", // Use appropriate model for your needs
      temperature: 1.5,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const roastResponse = chatCompletion.choices[0]?.message?.content || "No roast generated.";

    res.json({
      roast: roastResponse,
      originalFileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Roast generation error:", error);
    res.status(500).json({
      error: "Failed to generate resume roast",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log("listening on port: " + port);
});
