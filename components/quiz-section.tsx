"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight } from "lucide-react";

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizSectionProps {
  quizzes: QuizItem[];
  xpReward: number;
  onComplete: (score: number, total: number) => void;
}

export default function QuizSection({ quizzes, xpReward, onComplete }: QuizSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuiz = quizzes[currentIndex];

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQuiz.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const finalScore = score + (selectedOption === currentQuiz.correctAnswer ? 0 : 0); // score already updated
      setIsComplete(true);
      onComplete(score, quizzes.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsComplete(false);
  };

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No quizzes available for this lesson.
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / quizzes.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="text-center py-8 space-y-4">
        <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
          passed ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"
        }`}>
          <Trophy className={`h-9 w-9 ${passed ? "text-emerald-500" : "text-amber-500"}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {passed ? "Well Done! 🎉" : "Keep Practicing!"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            You scored <span className="font-bold text-foreground">{score}/{quizzes.length}</span> ({percentage}%)
          </p>
          {passed && (
            <p className="text-xs text-emerald-500 font-bold mt-2">+{xpReward} XP Earned!</p>
          )}
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted border border-border rounded-xl text-xs font-bold text-foreground hover:bg-muted/70 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Retry Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
          Question {currentIndex + 1} of {quizzes.length}
        </span>
        <span className="text-[10px] font-bold text-primary">
          Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}
        </span>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / quizzes.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <h4 className="text-sm font-bold text-foreground leading-relaxed">
        {currentQuiz.question}
      </h4>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQuiz.options.map((option, i) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuiz.correctAnswer;

          let optionStyle = "bg-muted/30 border-border hover:bg-muted/50 hover:border-primary/30 cursor-pointer";
          if (isAnswered) {
            if (isCorrect) {
              optionStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600";
            } else if (isSelected && !isCorrect) {
              optionStyle = "bg-rose-500/10 border-rose-500/30 text-rose-600";
            } else {
              optionStyle = "bg-muted/20 border-border opacity-50";
            }
          } else if (isSelected) {
            optionStyle = "bg-primary/10 border-primary/40";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${optionStyle}`}
            >
              <span className="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              {isAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full h-10 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
        >
          {currentIndex < quizzes.length - 1 ? (
            <>Next Question <ChevronRight className="h-4 w-4" /></>
          ) : (
            <>View Results <Trophy className="h-4 w-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
