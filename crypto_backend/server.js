import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import certificateRoute from "./routes/certificate.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* ---------------- Gemini ---------------- */

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/* ---------------- AI Advisor ---------------- */

app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { messages } = req.body;

    const userPrompt =
      messages?.map((m) => m.content).join("\n") || "";

    const prompt = `
You are a Cybersecurity and Cryptography Expert.

Analyze the user's project.

Recommend either RSA or ECC.

Your answer must contain and shortest :

🔒 Recommended Algorithm & Key Size

📌 Why

✅ Advantages

⚡ Performance

🛠 Implementation Steps

🏆 Final Recommendation


User:

${userPrompt}
`;

    const result = await model.generateContent(prompt);

    res.json({
      content: [
        {
          text: result.response.text(),
        },
      ],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      content: [
        {
          text: err.message,
        },
      ],
    });
  }
});

/* ---------------- Website Analyzer ---------------- */

app.use("/api/certificate", certificateRoute);

/* ---------------- Start ---------------- */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});