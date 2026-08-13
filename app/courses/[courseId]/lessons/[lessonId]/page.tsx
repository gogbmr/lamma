'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, CheckCircle2, Trophy,
  Star, Zap, Lock, Play, HelpCircle, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ============================================================
// LOADER
// ============================================================
function LessonLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute w-20 h-20 rounded-full bg-primary/30 animate-ping [animation-delay:150ms]" />
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 relative z-10">
          <Zap className="h-8 w-8 text-white fill-white" />
        </div>
      </div>
      <p className="text-foreground font-black text-base">Loading lesson...</p>
    </div>
  );
}

// ============================================================
// STATS BAR
// ============================================================
function LessonStatsBar({ xpReward }: { xpReward: number }) {
  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="font-bold text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Path</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
          <Trophy className="h-4 w-4 text-primary fill-primary/60" />
          <span className="text-xs font-black text-primary">
            +{xpReward} XP
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUCCESS CELEBRATION OVERLAY
// ============================================================
function SuccessCelebration({ xpEarned, onContinue }: { xpEarned: number; onContinue: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-background rounded-3xl p-8 max-w-md w-full shadow-2xl border-2 border-primary/20 text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-12 w-12 text-primary fill-primary animate-bounce" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-foreground">Awesome! 🎉</h2>
          <p className="text-muted-foreground font-medium">
            You've completed this lesson
          </p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <span className="text-2xl font-black text-primary">+{xpEarned} XP</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-bold">
            Experience Points Earned
          </p>
        </div>

        <Button
          onClick={onContinue}
          className="w-full bg-primary text-primary-foreground font-black text-base py-6 rounded-2xl shadow-[0_6px_0_0_hsl(var(--primary)/0.5)] hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.5)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all duration-100"
        >
          Continue
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// NATIVE VIDEO PLAYER
// ============================================================
function NativeVideoPlayer({
  videoUrl,
  onVideoComplete,
}: {
  videoUrl: string;
  onVideoComplete: () => void;
}) {
  if (!videoUrl) {
    return (
      <div className="aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 text-muted-foreground">
        <Play className="w-12 h-12 mb-2 opacity-50" />
        <p className="font-bold">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-border relative flex items-center justify-center">
      <video
        src={videoUrl}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain outline-none"
        onEnded={onVideoComplete}
      />
    </div>
  );
}

// ============================================================
// QUIZ INTERFACE
// ============================================================
function QuizInterface({ 
  quizzes, 
  countToShow, 
  onFinish 
}: { 
  quizzes: any[]; 
  countToShow: number; 
  onFinish: (score: number) => void;
}) {
  // Shuffle and slice quizzes on initial load
  const [questions] = useState(() => {
    const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, countToShow || 5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = questions[currentIndex];

  const handleConfirm = () => {
    if (!selectedAnswer) return;
    if (selectedAnswer === currentQ.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
    setIsAnswerRevealed(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      onFinish(correctCount);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-muted-foreground flex items-center gap-2">
          <HelpCircle className="w-5 h-5" /> Knowledge Check
        </h2>
        <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="bg-card border-2 border-border rounded-3xl p-6 md:p-10 shadow-lg">
        <h3 className="text-2xl font-black leading-snug mb-8">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option: string, idx: number) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQ.correctAnswer;
            
            let buttonStyle = "border-border bg-background hover:bg-muted text-foreground";
            
            if (isAnswerRevealed) {
              if (isCorrect) buttonStyle = "border-success bg-success/10 text-success ring-2 ring-success/20";
              else if (isSelected && !isCorrect) buttonStyle = "border-destructive bg-destructive/10 text-destructive";
              else buttonStyle = "border-border bg-background opacity-50";
            } else if (isSelected) {
              buttonStyle = "border-primary bg-primary/10 text-primary ring-2 ring-primary/20";
            }

            return (
              <button
                key={idx}
                disabled={isAnswerRevealed}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-bold transition-all duration-200 ${buttonStyle}`}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  {isAnswerRevealed && isCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border flex justify-end">
          {!isAnswerRevealed ? (
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedAnswer}
              className="font-bold px-8"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              className="font-bold px-8 bg-primary text-primary-foreground"
            >
              {currentIndex + 1 < questions.length ? "Next Question" : "Finish Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN LESSON PAGE
// ============================================================
export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isCompleting, setIsCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  // 🔥 Quiz States
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      setJustCompleted(false);
      setVideoWatched(false);
      setIsQuizActive(false);
      
      try {
        const res = await fetch(
          `/api/courses/${params.courseId}/lessons/${params.lessonId}`
        );
        if (res.ok) {
          const json = await res.json();
          setData(json);
          
          if (json.isCompleted) {
            setVideoWatched(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [params.courseId, params.lessonId]);

  const handleComplete = async (quizScore: number = 0) => {
    setIsCompleting(true);
    try {
      // You could optionally send the quizScore to the backend here if you want to track it
      const res = await fetch(
        `/api/courses/${params.courseId}/lessons/${params.lessonId}/complete`,
        { method: "POST" }
      );
      const result = await res.json();

      if (res.ok && result.success) {
        // Calculate total XP for the celebration
        const totalXp = (data?.lesson?.xpReward || 0) + (quizScore > 0 ? data?.lesson?.quizXpReward || 0 : 0);
        setEarnedXp(totalXp);
        
        setJustCompleted(true);
        setShowCelebration(true);
        setIsQuizActive(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    if (data.nextLessonId) {
      router.push(`/courses/${params.courseId}/lessons/${data.nextLessonId}`);
    } else {
      router.push("/");
    }
  };

  if (isLoading) return <LessonLoader />;
  if (!data?.lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-bold">Lesson not found.</p>
      </div>
    );
  }

  const { lesson, prevLessonId, nextLessonId, isCompleted } = data;
  const canComplete = videoWatched || isCompleted;
  const hasQuizzes = lesson.quizGroup?.quizzes && lesson.quizGroup.quizzes.length > 0;

  const triggerCompletion = () => {
    if (hasQuizzes && !isCompleted) {
      setIsQuizActive(true); // Start the quiz!
    } else {
      // If no quizzes, or already completed once, just complete/proceed
      handleComplete(0);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <LessonStatsBar xpReward={lesson.xpReward + (hasQuizzes ? lesson.quizXpReward : 0)} />

        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
          
          {/* If Quiz is Active, hide the lesson content and show the Quiz */}
          {isQuizActive ? (
            <QuizInterface 
              quizzes={lesson.quizGroup.quizzes} 
              countToShow={lesson.quizCountToShow}
              onFinish={(score) => handleComplete(score)}
            />
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
                  {lesson.title}
                </h1>
                {lesson.description && (
                  <p className="text-base md:text-lg text-muted-foreground font-medium">
                    {lesson.description}
                  </p>
                )}
              </div>

              {lesson.videoUrl ? (
                <NativeVideoPlayer
                  videoUrl={lesson.videoUrl}
                  onVideoComplete={() => setVideoWatched(true)}
                />
              ) : (
                <div className="aspect-video bg-muted/30 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 text-muted-foreground">
                  <Play className="w-12 h-12 mb-2 opacity-50" />
                  <p className="font-bold">No video provided for this lesson</p>
                </div>
              )}

              {lesson.videoUrl && !videoWatched && !isCompleted && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-2xl p-4 flex items-start gap-3">
                  <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Watch the full video to unlock {hasQuizzes ? "the quiz" : "completion"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      The button below will activate once you finish watching
                    </p>
                  </div>
                </div>
              )}

              {lesson.content && (
                <div className="bg-card rounded-2xl border border-border p-6 md:p-8 prose prose-sm md:prose-base dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {lesson.content}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom action bar */}
        {!isQuizActive && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border z-40 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={!prevLessonId || isCompleting}
                onClick={() =>
                  router.push(`/courses/${params.courseId}/lessons/${prevLessonId}`)
                }
                className="font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              {isCompleted || justCompleted ? (
                <Button
                  className="flex-1 md:flex-initial bg-primary text-primary-foreground font-black py-6 px-8 rounded-2xl shadow-[0_6px_0_0_hsl(var(--primary)/0.5)] hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.5)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all duration-100"
                  onClick={() =>
                    nextLessonId
                      ? router.push(`/courses/${params.courseId}/lessons/${nextLessonId}`)
                      : router.push("/")
                  }
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {nextLessonId ? "Next Lesson" : "Finish Course"}
                </Button>
              ) : (
                <Button
                  className="flex-1 md:flex-initial bg-primary text-primary-foreground font-black py-6 px-8 rounded-2xl shadow-[0_6px_0_0_hsl(var(--primary)/0.5)] hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.5)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_0_0_hsl(var(--primary)/0.5)]"
                  onClick={triggerCompletion}
                  disabled={!canComplete || isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {hasQuizzes ? (
                        <>
                          <HelpCircle className="w-5 h-5 mr-2" />
                          Take Quiz (+{lesson.quizXpReward} XP)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Complete (+{lesson.xpReward} XP)
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {showCelebration && (
        <SuccessCelebration
          xpEarned={earnedXp}
          onContinue={handleCelebrationContinue}
        />
      )}
    </>
  );
}