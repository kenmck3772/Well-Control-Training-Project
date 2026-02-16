
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { TUTOR_SYSTEM_INSTRUCTION } from '../constants';
import { QuizQuestion } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat Tutor Service
export const createTutorChat = (): Chat => {
  // Fix: Use gemini-3-pro-preview for advanced reasoning in technical well control tutoring
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

// Fix: Use chat.sendMessage for active chat sessions to maintain context
export const sendMessageToTutor = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response. Please check the well parameters and try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection lost. Ensure your API key is valid and try again.";
  }
};

// Quiz Generation Service
export const generateQuizQuestion = async (topic: string): Promise<QuizQuestion | null> => {
  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning required for technical assessment generation
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a difficult multiple-choice question for an IWCF Level 3/4 exam about: ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" },
            explanation: { type: Type.STRING, description: "Why the answer is correct" }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: crypto.randomUUID(),
        ...data
      };
    }
    return null;
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return null;
  }
};