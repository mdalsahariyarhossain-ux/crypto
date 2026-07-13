import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity expert.

Recommend RSA or ECC.

Explain:
- Which algorithm is better
- Why
- Advantages
- Key size
- Performance
- Real-world applications
- Simple implementation steps

Reply in simple English.`,
          },
          ...messages,
        ],
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    res.json({
      content: [
        {
          text: data.choices[0].message.content,
        },
      ],
    });
  } catch (err) {
    console.error("AI Advisor backend error:", err);

    res.status(500).json({
      content: [
        {
          text: "AI service is unavailable: " + err.message,
        },
      ],
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);