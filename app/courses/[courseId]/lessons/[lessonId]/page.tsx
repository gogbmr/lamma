"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Award, Sparkles, BookOpen, CheckCircle2,
  ChevronRight, ChevronLeft, MessageSquareText
} from "lucide-react";
import VideoPlayer from "@/components/video-player";
import AiChatbot from "@/components/ai-chatbot";
import QuizSection from "@/components/quiz-section";

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface LessonData {
  id: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  videoUrl: string | null;
  videoContext: unknown;
  content: string | null;
  order: number | null;
  isLocked: boolean;
  xpReward: number;
  quizXpReward: number;
  quizCountToShow: number;
  lessonNumber: number | null;
  topic: string | null;
  module: string | null;
  courseId: string;
  courseTitle: string;
  quizzes: QuizItem[];
  hasAiAssistant: boolean;
}

type ActiveTab = "video" | "content" | "quiz";

export default function LessonViewPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("video");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
          // Default to appropriate tab
          if (data.videoUrl) setActiveTab("video");
          else if (data.content) setActiveTab("content");
          else setActiveTab("quiz");
        } else {
          router.push(`/courses/${courseId}`);
        }
      } catch {
        router.push(`/courses/${courseId}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [courseId, lessonId]);

  const handleQuizComplete = (score: number, total: number) => {
    setQuizCompleted(true);
    // Here you would also POST to /api/progress to save the result
  };

  const handleMarkLessonComplete = () => {
    setLessonCompleted(true);
    // Here you would also POST to /api/progress to save the result
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

  const tabs: { key: ActiveTab; label: string; available: boolean }[] = [
    { key: "video", label: "Video", available: !!lesson.videoUrl },
    { key: "content", label: "Reading", available: !!lesson.content },
    { key: "quiz", label: "Quiz", available: lesson.quizzes.length > 0 },
  ];
  const availableTabs = tabs.filter((t) => t.available);

  return (
    <>
      <main className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {lesson.courseTitle}
            </Link>
            <h1 className="text-xl font-black tracking-tight text-foreground mt-1">
              {lesson.title || "Untitled Lesson"}
            </h1>
            {lesson.description && (
              <p className="text-xs text-muted-foreground font-medium mt-1 max-w-2xl">{lesson.description}</p>
            )}
          </div>

          {/* AI Assistant Button */}
          {lesson.hasAiAssistant && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="shrink-0 h-10 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          )}
        </div>

        {/* Lesson Info Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          {lesson.topic && (
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
              {lesson.topic}
            </span>
          )}
          {lesson.module && (
            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
              {lesson.module}
            </span>
          )}
          <span className="text-[10px] font-bold text-warning flex items-center gap-1">
            <Award className="h-3 w-3" /> {lesson.xpReward} Lesson XP
          </span>
          {lesson.quizzes.length > 0 && (
            <span className="text-[10px] font-bold text-warning flex items-center gap-1">
              <Award className="h-3 w-3" /> {lesson.quizXpReward} Quiz XP
            </span>
          )}
          {lesson.hasAiAssistant && (
            <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> AI Assistant
            </span>
          )}
        </div>

        {/* Tab Navigation */}
        {availableTabs.length > 1 && (
          <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border w-fit">
            {availableTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-background text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.key === "quiz" && quizCompleted && (
                  <CheckCircle2 className="inline h-3 w-3 text-emerald-500 ml-1" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* VIDEO TAB */}
          {activeTab === "video" && lesson.videoUrl && (
            <div className="space-y-0">
              <VideoPlayer src={lesson.videoUrl} />
              
              {/* Below video actions */}
              <div className="p-5 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!lessonCompleted ? (
                    <button
                      onClick={handleMarkLessonComplete}
                      className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark as Complete
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Lesson Complete!
                    </span>
                  )}
                </div>

                {lesson.hasAiAssistant && (
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="h-9 px-4 bg-muted border border-border text-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-muted/70 transition-colors"
                  >
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    Have a question? Ask AI
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CONTENT / READING TAB */}
          {activeTab === "content" && lesson.content && (
            <div className="p-6 md:p-8">
              <div
                className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
              <div className="mt-6 pt-4 border-t border-border">
                {!lessonCompleted ? (
                  <button
                    onClick={handleMarkLessonComplete}
                    className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as Complete
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Lesson Complete!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === "quiz" && (
            <div className="p-6 md:p-8">
              <QuizSection
                quizzes={lesson.quizzes}
                xpReward={lesson.quizXpReward}
                onComplete={handleQuizComplete}
              />
            </div>
          )}
        </div>

        {/* Navigation between lessons hint */}
        <div className="flex items-center justify-center">
          <Link
            href={`/courses/${courseId}`}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5" /> View all lessons in this course
          </Link>
        </div>
      </main>

      {/* AI Chatbot Slide-over */}
      {lesson.hasAiAssistant && (
        <AiChatbot
          lessonId={lesson.id}
          lessonTitle={lesson.title || "Untitled Lesson"}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
