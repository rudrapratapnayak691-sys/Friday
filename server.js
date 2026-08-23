import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/ask", async (req, res) => {

    try {

        const question = req.body.question;

        if (!question) {
            return res.status(400).json({
                error: "No question provided"
            });
        }

        const response =
            await ai.models.generateContent({
                model: "gemini-3.7-flash",
                contents: question
            });

        res.json({
            answer: response.text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Gemini request failed"
        });
    }
});

app.listen(3000, () => {
    console.log("FRIDAY AI running on port 3000");
});
