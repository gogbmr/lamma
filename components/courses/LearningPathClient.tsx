'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Flame, Gem, Trophy, Star, Lock,
  CheckCircle, BookOpen, Crown, Heart
} from 'lucide-react';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================
interface Lesson {
  id: string;
  title: string | null;
  description: string | null;
  order: number | null;
  isLocked: boolean;
  xpReward: number;
}

interface UserProgress {
  id: string;
  lessonId: string;
  completed: boolean;
}

interface UserProfile {
  id: string;
  streak: number;
  xp: number;
  llamacoinBalance: number;
  level: number;
  currentLessonId: string | null;
}

interface Course {
  id: string;
  title: string;
}

interface LearningPathClientProps {
  course: Course;
  lessons: Lesson[];
  progress: UserProgress[];
  profile: UserProfile;
  activeLessonId: string | null;
}

// ============================================================
// HELPER: Path position (sinusoidal)
// ============================================================
const PATH_POSITIONS = [
  "mr-12 ml-auto",   // right
  "mx-auto",          // center
  "ml-12 mr-auto",   // left
  "mx-auto",          // center
] as const;

function getPathPosition(index: number) {
  return PATH_POSITIONS[index % PATH_POSITIONS.length];
}

// ============================================================
// STATS BAR
// ============================================================
function StatsBar({ profile }: { profile: UserProfile }) {
  const hearts = 5; // You can make this dynamic based on your logic

  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <Flame className="h-5 w-5 text-orange-500 fill-orange-500 flex-shrink-0" />
          <span className="font-black text-sm text-foreground">
            {profile.streak}
          </span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
          <span className="font-black text-sm text-foreground">
            {profile.xp}
          </span>
          <span className="text-muted-foreground text-xs font-bold">XP</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1.5">
          <Gem className="h-5 w-5 text-blue-500 fill-blue-400 flex-shrink-0" />
          <span className="font-black text-sm text-foreground">
            {profile.llamacoinBalance}
          </span>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className={`h-4 w-4 transition-all duration-300 ${
                i < hearts
                  ? "text-red-500 fill-red-500"
                  : "text-muted-foreground/25 fill-muted-foreground/10"
              }`}
            />
          ))}
        </div>

        {/* Level */}
        <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          <Crown className="h-3.5 w-3.5 text-primary fill-primary/60" />
          <span className="font-black text-xs text-primary">
            Lvl {profile.level}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COURSE HEADER BANNER
// ============================================================
function CourseHeader({ course, progress, totalLessons }: {
  course: Course;
  progress: UserProgress[];
  totalLessons: number;
}) {
  const completed = progress.filter(p => p.completed).length;
  const pct = Math.min(Math.round((completed / totalLessons) * 100), 100);

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-5 pb-3">
      <div className="bg-primary rounded-3xl p-5 shadow-lg shadow-primary/25 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-3 right-14 w-4 h-4 rounded-full bg-white/20 pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">
                Current Course
              </p>
              <h2 className="text-white font-black text-lg leading-tight">
                {course.title}
              </h2>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-300 fill-yellow-200" />
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-xs font-bold">
                {completed} of {totalLessons} lessons done
              </span>
              <span className="text-white font-black text-sm">{pct}%</span>
            </div>
            <div className="h-3.5 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full"
                  style={{
                    animation: 'shimmer 2.5s ease-in-out infinite',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONNECTOR DOTS
// ============================================================
function ConnectorDots({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-10 gap-1 my-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-500 ${
            isCompleted ? "bg-primary/50" : "bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

// ============================================================
// LESSON NODE
// ============================================================
interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isLocked: boolean;
  isActive: boolean;
  courseId: string;
  nodeRef?: React.RefObject<HTMLDivElement>;
}

function LessonNode({
  lesson,
  index,
  isCompleted,
  isLocked,
  isActive,
  courseId,
  nodeRef,
}: LessonNodeProps) {
  const posClass = getPathPosition(index);

  // Variant logic
  const variant = isCompleted
    ? "completed"
    : isActive
    ? "active"
    : isLocked
    ? "locked"
    : "available";

  const nodeStyles = {
    completed: "bg-primary shadow-[0_5px_0_0_hsl(var(--primary)/0.55)] hover:shadow-[0_3px_0_0_hsl(var(--primary)/0.55)] hover:translate-y-[2px]",
    active: "bg-primary shadow-[0_5px_0_0_hsl(var(--primary)/0.55)] hover:shadow-[0_3px_0_0_hsl(var(--primary)/0.55)] hover:translate-y-[2px] ring-[5px] ring-primary/20 ring-offset-2 ring-offset-background",
    available: "bg-card border-2 border-primary/40 shadow-[0_5px_0_0_hsl(var(--primary)/0.2)] hover:shadow-[0_3px_0_0_hsl(var(--primary)/0.2)] hover:translate-y-[2px]",
    locked: "bg-muted shadow-[0_5px_0_0_hsl(var(--muted-foreground)/0.15)] cursor-not-allowed",
  };

  const iconEl = {
    completed: <CheckCircle className="h-9 w-9 text-white fill-white drop-shadow-sm" />,
    active: <Star className="h-9 w-9 text-white fill-white drop-shadow-sm" />,
    available: <BookOpen className="h-8 w-8 text-primary" />,
    locked: <Lock className="h-7 w-7 text-muted-foreground/40" />,
  };

  const labelColor = {
    completed: "text-foreground",
    active: "text-foreground",
    available: "text-foreground",
    locked: "text-muted-foreground/40",
  };

  const clickable = !isLocked;
  const NodeWrapper = clickable ? Link : "div";
  const wrapperProps = clickable
    ? { href: `/courses/${courseId}/lessons/${lesson.id}` }
    : {};

  return (
    <div ref={nodeRef} className={`relative flex flex-col items-center gap-2.5 ${posClass}`}>
      {/* Active indicator */}
      {isActive && (
        <div className="flex flex-col items-center gap-1 animate-bounce absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-full shadow-md whitespace-nowrap tracking-wide">
            YOU ARE HERE
          </div>
          <div className="w-px h-3 bg-primary/50" />
        </div>
      )}

      {/* Node button */}
      {/* @ts-ignore */}
      <NodeWrapper
        {...wrapperProps}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-150
          ${clickable ? "active:translate-y-[5px] active:shadow-none" : ""}
          select-none
          ${nodeStyles[variant]}
        `}
      >
        {iconEl[variant]}
      </NodeWrapper>

      {/* Label */}
      <div className="text-center w-28">
        <p className={`text-xs font-bold leading-snug ${labelColor[variant]}`}>
          {lesson.title}
        </p>

        {/* XP badge */}
        {!isCompleted && !isLocked && (
          <div className="mt-1 inline-flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 text-primary fill-primary/60" />
            <span className="text-[10px] font-black text-primary">
              +{lesson.xpReward} XP
            </span>
          </div>
        )}

        {variant === "completed" && (
          <p className="text-[10px] font-black text-primary mt-0.5">Done ✓</p>
        )}
        {variant === "active" && (
          <p className="text-[10px] font-black text-primary animate-pulse mt-0.5">
            Continue →
          </p>
        )}
        {variant === "available" && (
          <p className="text-[10px] font-bold text-primary/60 mt-0.5">Start</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SECTION CHECKPOINT
// ============================================================
function SectionCheckpoint({ sectionNum }: { sectionNum: number }) {
  return (
    <div className="max-w-lg mx-auto w-full px-4 my-3">
      <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/40 rounded-2xl px-4 py-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
          <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">
            Section {sectionNum}
          </p>
          <p className="text-sm font-black text-foreground">Checkpoint</p>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-300" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function LearningPathClient({
  course,
  lessons,
  progress,
  profile,
  activeLessonId,
}: LearningPathClientProps) {
  const [mounted, setMounted] = useState(false);
  const activeNodeRef = useRef<HTMLDivElement>(null);

  // Identify the active lesson (fallback to first lesson if none set)
  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  useEffect(() => {
    setMounted(true);
    // Auto-scroll to active lesson
    const timer = setTimeout(() => {
      if (activeNodeRef.current) {
        activeNodeRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [activeLessonId]);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Stats bar */}
      <StatsBar profile={profile} />

      {/* Course header */}
      <CourseHeader course={course} progress={progress} totalLessons={lessons.length} />

      {/* Section label */}
      <div className="max-w-lg mx-auto w-full px-4 mb-2 mt-4">
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest text-center">
          Your Learning Path
        </p>
      </div>

      {/* Path nodes */}
      <div className="max-w-lg mx-auto w-full px-4 pb-36 flex flex-col">
        {lessons.map((lesson, index) => {
          // Your original logic
          const isCompleted = progress.some(
            (p) => p.lessonId === lesson.id && p.completed
          );
          const isLocked =
            index === 0
              ? false
              : !progress.some(
                  (p) => p.lessonId === lessons[index - 1].id && p.completed
                );
          const isActive = lesson.id === activeLesson?.id;

          const showCheckpoint = index > 0 && index % 5 === 0;
          const prevCompleted =
            index > 0 &&
            progress.some((p) => p.lessonId === lessons[index - 1].id && p.completed);

          return (
            <div
              key={lesson.id}
              className="flex flex-col"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 400ms ease, transform 400ms ease`,
                transitionDelay: `${Math.min(index * 55, 600)}ms`,
              }}
            >
              {/* Checkpoint banner */}
              {showCheckpoint && <SectionCheckpoint sectionNum={Math.floor(index / 5)} />}

              {/* Connector dots */}
              {index > 0 && (
                <div className="flex justify-center">
                  <ConnectorDots isCompleted={prevCompleted} />
                </div>
              )}

              {/* Lesson node */}
              <LessonNode
                lesson={lesson}
                index={index}
                isCompleted={isCompleted}
                isLocked={isLocked}
                isActive={isActive}
                courseId={course.id}
                nodeRef={isActive ? activeNodeRef : undefined}
              />
            </div>
          );
        })}

        {/* End marker */}
        <div className="flex flex-col items-center gap-3 mt-16 opacity-50">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-bold text-center">
            More lessons coming soon!
          </p>
        </div>
      </div>

      {/* Add shimmer keyframes to global CSS if not already present */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}