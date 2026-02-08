import OpenAI from "openai";
import config from "../config/index.js";

const openai = new OpenAI({
    apiKey: config.openai.apiKey,
});

export const getAIReply = async (messages) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 150,
        });

        const content = response.choices[0]?.message?.content?.trim();

        if (!content) {
            return "AI could not generate a response right now. Please try again.";
        }

        return content;
    } catch (error) {
        console.error("OpenAI error:", error.message);
        return "AI is temporarily unavailable. Please try again.";
    }
};
  