const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // ← paste your free key here

app.post("/api/ai-advisor", async (req, res) => {
  try {
    const userMessage = req.body.messages[0].content;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a cryptography expert advisor. The user is working on a project comparing RSA and ECC algorithms. Given a use case, recommend either RSA or ECC and explain in 3-4 short paragraphs: 1) Your recommendation and why, 2) Security properties that matter for this use case, 3) Key practical implementation steps. Be specific, educational, and simple enough for a student to understand.\n\nUser's use case: ${userMessage}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

    // Return in same format the frontend expects
    res.json({ content: [{ type: "text", text }] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("✅ Proxy server running on https://crypto-z0td.onrender.com");
});