import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

export const handleChat = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ reply: "Missing query!" });
  }

  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(query);
    console.log("Full Gemini Result:", JSON.stringify(result, null, 2));

    const reply = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    // If reply exists, send it; otherwise fallback message
    res.json({ reply: reply || "⚠️ Something went wrong. Try again." });

  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ reply: "⚠️ Something went wrong. Try again." });
  }
};
