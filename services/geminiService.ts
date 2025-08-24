import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        console.error("API_KEY environment variable not set. AI features are disabled.");
        throw new Error("API key is not configured.");
    }
    ai = new GoogleGenAI({ apiKey: API_KEY });
    return ai;
};

export const getNotesSummary = async (notes: string): Promise<string> => {
  const prompt = `You are an expert study assistant for a student preparing for the highly competitive JEE exam. Your task is to summarize the following study notes. Focus on extracting the most critical information: key concepts, important formulas, and definitions. Present the summary in a clear, structured format using Markdown (headings, bold text, and bullet points) to make it easy to review.

The student's notes are:
---
${notes}
---

Provide a concise summary below:`;

  try {
    const genAI = getAiInstance();
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API call for summary failed:", error);
    throw error;
  }
};

export const getSubjectStrategy = async (subjectName: string, chapterNames: string[]): Promise<string> => {
    const prompt = `Create a high-level study strategy for a student preparing for the JEE exam in the subject "${subjectName}". The strategy should include:
    1. A suggested logical order to tackle the chapters for better understanding.
    2. Key focus areas and high-weightage topics within the subject.
    3. General tips for problem-solving specific to ${subjectName}.
    Format the output using clear Markdown headings, bullet points, and bold text.`;

    try {
        const genAI = getAiInstance();
        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call for subject strategy failed:", error);
        throw error;
    }
};