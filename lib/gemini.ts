import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Builds a system instruction for the AI chatbot based on video context.
 * The videoContext is an array of timestamped segments describing what happens in the video.
 */
export function buildVideoContextPrompt(
  lessonTitle: string,
  videoContext: Array<{ startTime: number; endTime?: number; topic: string; text: string }>
): string {
  const contextBlock = videoContext
    .map((seg) => {
      const timeRange = seg.endTime
        ? `[${formatTime(seg.startTime)} - ${formatTime(seg.endTime)}]`
        : `[${formatTime(seg.startTime)}]`;
      return `${timeRange} ${seg.topic}\n${seg.text}`;
    })
    .join("\n\n");

  return `You are an expert financial education tutor for the Finlamma platform.
You are assisting a student who is watching a lesson video titled: "${lessonTitle}".

Below is the complete video content broken down by timestamps. Use ONLY this information to answer questions.
If the student asks something not covered in the video, politely say it's not covered in this lesson and suggest they explore other lessons.

Always be encouraging, clear, and concise. Use examples from the video when relevant.
When referencing specific parts, mention the approximate timestamp so the student can re-watch.

--- VIDEO CONTENT ---
${contextBlock}
--- END VIDEO CONTENT ---`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Send a chat message to Gemini with video context.
 */
export async function chatWithVideoContext(params: {
  lessonTitle: string;
  videoContext: Array<{ startTime: number; endTime?: number; topic: string; text: string }>;
  conversationHistory: Array<{ role: "user" | "model"; text: string }>;
  userMessage: string;
}): Promise<string> {
  const systemInstruction = buildVideoContextPrompt(params.lessonTitle, params.videoContext);

  // Build contents array for Gemini
  const contents = params.conversationHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  // Add the new user message
  contents.push({
    role: "user",
    parts: [{ text: params.userMessage }],
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents,
    config: {
      systemInstruction,
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
}
