import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { chatWithVideoContext } from "@/lib/gemini";

/**
 * POST /api/chat/lesson
 * 
 * AI Chatbot endpoint for lesson video Q&A.
 * 
 * Request body:
 * {
 *   "lessonId": "uuid",
 *   "message": "What are call options?",
 *   "history": [
 *     { "role": "user", "text": "previous question" },
 *     { "role": "model", "text": "previous answer" }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, message, history } = body;

    if (!lessonId || !message?.trim()) {
      return NextResponse.json(
        { error: "lessonId and message are required." },
        { status: 400 }
      );
    }

    // Fetch lesson with video context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        videoContext: true,
        description: true,
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    if (!lesson.videoContext || !Array.isArray(lesson.videoContext) || lesson.videoContext.length === 0) {
      return NextResponse.json(
        { error: "This lesson does not have video context data configured. AI assistant is unavailable." },
        { status: 400 }
      );
    }

    // Type-cast the videoContext from Prisma Json
    const videoContext = lesson.videoContext as Array<{
      startTime: number;
      endTime?: number;
      topic: string;
      text: string;
    }>;

    const conversationHistory = Array.isArray(history) ? history : [];

    const aiResponse = await chatWithVideoContext({
      lessonTitle: lesson.title || "Untitled Lesson",
      videoContext,
      conversationHistory,
      userMessage: message.trim(),
    });

    return NextResponse.json({
      response: aiResponse,
      lessonId: lesson.id,
    });
  } catch (error) {
    console.error("[POST /api/chat/lesson]", error);
    return NextResponse.json(
      { error: "AI service temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
