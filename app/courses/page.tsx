"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";
import {
  BookOpen,
  Loader2,
  Award,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Flame,
  Lock,
  Play,
  Star,
  Zap,
  Trophy,
  Heart,
  Target,
} from "lucide-react";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  image: string | null;
  order: number;
  xpReward: number;
  icon: string | null;
  _count: { lessons: number };
}

function getDifficulty(order: number): { label: string; bg: string; text: string; border: string } {
  if (order <= 2) return { label: "Beginner", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-700" };
  if (order <= 4) return { label: "Intermediate", bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-700" };
  return { label: "Advanced", bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-700" };
}

const COURSE_THEMES = [
  { from: "#58CC02", to: "#46a302", shadow: "rgba(88,204,2,0.4)", light: "#e5f9cc" },
  { from: "#1CB0F6", to: "#0891cc", shadow: "rgba(28,176,246,0.4)", light: "#cceeff" },
  { from: "#FF4B4B", to: "#d93b3b", shadow: "rgba(255,75,75,0.4)", light: "#ffd5d5" },
  { from: "#CE82FF", to: "#a855f7", shadow: "rgba(206,130,255,0.4)", light: "#f3e8ff" },
  { from: "#FF9600", to: "#d97706", shadow: "rgba(255,150,0,0.4)", light: "#fff3cc" },
  { from: "#00CD9C", to: "#009c76", shadow: "rgba(0,205,156,0.4)", light: "#ccfbef" },
];

// Bounce animation keyframes injected once
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900;1000&display=swap');

  * { font-family: 'Nunito', sans-serif; }

  @keyframes duo-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    40%       { transform: translateY(-8px) scale(1.05); }
    60%       { transform: translateY(-4px) scale(1.02); }
  }
  @keyframes duo-pop {
    0%   { transform: scale(0.8); opacity: 0; }
    70%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); }
  }
  @keyframes duo-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes duo-wiggle {
    0%, 100% { transform: rotate(0deg); }
    25%  { transform: rotate(-6deg); }
    75%  { transform: rotate(6deg); }
  }
  @keyframes duo-float {
    0%, 100% { transform: translateY(0px); }
    50%  { transform: translateY(-6px); }
  }
  @keyframes xp-fill {
    from { width: 0%; }
    to   { width: var(--xp-target); }
  }
  @keyframes duo-slide-up {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes duo-pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(88,204,2,0.6); }
    70%  { box-shadow: 0 0 0 10px rgba(88,204,2,0); }
    100% { box-shadow: 0 0 0 0 rgba(88,204,2,0); }
  }
  @keyframes star-spin {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.3); }
    100% { transform: rotate(360deg) scale(1); }
  }

  .duo-card {
    transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease;
    animation: duo-slide-up 0.4s ease both;
  }
  .duo-card:hover {
    transform: translateY(-6px) scale(1.02);
  }
  .duo-card:active {
    transform: translateY(0) scale(0.98);
  }
  .duo-btn {
    transition: transform 0.12s cubic-bezier(.34,1.56,.64,1), filter 0.12s ease;
  }
  .duo-btn:hover  { transform: scale(1.08); filter: brightness(1.08); }
  .duo-btn:active { transform: scale(0.94); }
  .icon-bounce:hover { animation: duo-bounce 0.6s ease; }
  .icon-wiggle:hover { animation: duo-wiggle 0.5s ease; }
  .shimmer-text {
    background: linear-gradient(90deg, #58CC02 0%, #1CB0F6 30%, #CE82FF 60%, #FF9600 80%, #58CC02 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: duo-shimmer 3s linear infinite;
  }
  .xp-bar-fill {
    animation: xp-fill 1.2s cubic-bezier(.34,1.1,.64,1) both;
    animation-delay: 0.5s;
  }
  .streak-pulse { animation: duo-pulse-ring 2s infinite; }
  .star-anim:hover { animation: star-spin 0.7s ease; }
  .float-anim { animation: duo-float 3s ease-in-out infinite; }
  
  .progress-lives > span {
    display: inline-block;
    animation: duo-pop 0.4s cubic-bezier(.34,1.56,.64,1) both;
  }
  .progress-lives > span:nth-child(1) { animation-delay: 0.1s; }
  .progress-lives > span:nth-child(2) { animation-delay: 0.2s; }
  .progress-lives > span:nth-child(3) { animation-delay: 0.3s; }
  .progress-lives > span:nth-child(4) { animation-delay: 0.4s; }
  .progress-lives > span:nth-child(5) { animation-delay: 0.5s; }
`;

function StyleInjector() {
  return <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />;
}

// XP Orb that pops in
function XpBadge({ xp, theme }: { xp: number; theme: typeof COURSE_THEMES[0] }) {
  return (
    <div
      className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[11px] font-black shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        boxShadow: `0 3px 10px ${theme.shadow}`,
        animation: "duo-pop 0.4s cubic-bezier(.34,1.56,.64,1) 0.3s both",
      }}
    >
      <Zap className="h-3 w-3 fill-current" />
      {xp} XP
    </div>
  );
}

// Duolingo-style path node
function PathNode({ index, theme, locked = false }: {
  index: number;
  theme: typeof COURSE_THEMES[0];
  locked?: boolean;
}) {
  const offset = [0, 40, 70, 40, 0, -40, -70, -40][index % 8];
  return (
    <div className="flex justify-center" style={{ transform: `translateX(${offset}px)` }}>
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg duo-btn"
        style={{
          background: locked ? "#e5e5e5" : `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
          boxShadow: locked ? "0 4px 0 #ccc" : `0 4px 0 ${theme.to}`,
          color: locked ? "#aaa" : "white",
        }}
      >
        {locked ? <Lock className="h-6 w-6" /> : <Star className="h-6 w-6 fill-current star-anim" />}
      </div>
    </div>
  );
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [xpCount, setXpCount] = useState(0);
  const targetXP = 850;
  const maxXP = 1000;
  const streakDays = 3;
  const lives = 5;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) setCourses(await res.json());
      } catch {
        console.error("Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
    // animate XP counter
    const end = 850;
    let current = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, end);
      setXpCount(current);
      if (current >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center float-anim"
          style={{ background: "linear-gradient(135deg, #58CC02, #46a302)", boxShadow: "0 6px 0 #46a302" }}
        >
          <BookOpen className="h-9 w-9 text-white" />
        </div>
        <p className="text-base font-black text-muted-foreground tracking-widest animate-pulse" style={{ fontFamily: "Nunito, sans-serif" }}>
          Loading Paths…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <StyleInjector />
      <Navbar />

      {/* ── TOP STATUS BAR ── */}
      <div className="w-full max-w-3xl mx-auto px-4 pt-4 flex items-center justify-between gap-3">
        {/* Streak */}
        <div
          className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2 rounded-2xl duo-btn streak-pulse"
        >
          <Flame className="h-5 w-5 text-amber-500 fill-current icon-wiggle" />
          <span className="text-sm font-black text-amber-700 dark:text-amber-300">{streakDays}</span>
        </div>

        {/* XP bar */}
        <div className="flex-1 flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500 fill-current shrink-0" />
          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden border border-border relative">
            <div
              className="xp-bar-fill h-full rounded-full relative overflow-hidden"
              style={{
                "--xp-target": `${(targetXP / maxXP) * 100}%`,
                background: "linear-gradient(90deg, #CE82FF, #1CB0F6)",
              } as React.CSSProperties}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                  backgroundSize: "200% auto",
                  animation: "duo-shimmer 2s linear infinite",
                }}
              />
            </div>
          </div>
          <span className="text-xs font-black text-muted-foreground tabular-nums">{xpCount}</span>
        </div>

        {/* Lives */}
        <div className="progress-lives flex items-center gap-0.5">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i}>
              <Heart className="h-5 w-5 text-rose-500 fill-current" />
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="w-full max-w-3xl mx-auto px-4 pt-5 pb-3 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-black px-3 py-1.5 rounded-full mb-3"
          style={{ animation: "duo-pop 0.4s cubic-bezier(.34,1.56,.64,1) both" }}>
          <Trophy className="h-3.5 w-3.5 fill-current" />
          Daily Goal Active
        </div>
        <h1
          className="text-3xl md:text-4xl font-black tracking-tight mb-1 shimmer-text"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          Keep Learning! 🎉
        </h1>
        <p className="text-sm font-bold text-muted-foreground">
          {courses.length} paths · {courses.reduce((s, c) => s + c._count.lessons, 0)} lessons ·{" "}
          {courses.reduce((s, c) => s + c.xpReward, 0).toLocaleString()} XP to earn
        </p>
      </section>

      {/* ── MAIN LAYOUT ── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5 pb-4">

        {/* LEFT — course grid */}
        <div className="md:col-span-2 space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            Learning Paths
          </p>

          {courses.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-3xl p-16 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center float-anim">
                <BookOpen className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-black text-muted-foreground">No courses yet!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course, index) => {
                const theme = COURSE_THEMES[index % COURSE_THEMES.length];
                const { label: diffLabel, bg: diffBg, text: diffText, border: diffBorder } = getDifficulty(course.order);
                const isComplete = completedIds.has(course.id);
                const isLocked = index > 2; // first 3 unlocked as demo

                return (
                  <Link
                    key={course.id}
                    href={isLocked ? "#" : `/courses/${course.id}`}
                    className="block"
                    style={{ animationDelay: `${index * 0.07}s` }}
                  >
                    <div
                      className="duo-card bg-card rounded-3xl overflow-hidden border-2"
                      style={{
                        borderColor: isLocked ? "var(--border)" : theme.from + "55",
                        boxShadow: isLocked ? "none" : `0 4px 0 ${theme.to}55`,
                        animationDelay: `${index * 0.07}s`,
                        opacity: isLocked ? 0.55 : 1,
                      }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Icon orb */}
                        <div
                          className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md icon-bounce"
                          style={{
                            background: isLocked
                              ? "#f0f0f0"
                              : `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                            boxShadow: isLocked ? "0 3px 0 #ddd" : `0 4px 0 ${theme.to}`,
                          }}
                        >
                          {isLocked ? (
                            <Lock className="h-6 w-6 text-gray-400" />
                          ) : (
                            <span>{course.icon ?? "📈"}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-black tracking-tight text-foreground leading-tight">
                              {course.title}
                            </h4>
                            <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                          </div>
                          <p className="text-[11px] text-muted-foreground font-semibold line-clamp-1">
                            {course.description}
                          </p>

                          {/* Progress bar for first 3 */}
                          {!isLocked && (
                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="xp-bar-fill h-full rounded-full"
                                style={{
                                  "--xp-target": index === 0 ? "100%" : index === 1 ? "60%" : "20%",
                                  background: `linear-gradient(90deg, ${theme.from}, ${theme.to})`,
                                  animationDelay: `${0.6 + index * 0.1}s`,
                                } as React.CSSProperties}
                              />
                            </div>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${diffBg} ${diffText} ${diffBorder}`}>
                              {diffLabel}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                              {course._count.lessons} Lessons
                            </span>
                            {!isLocked && (
                              <span
                                className="text-[10px] font-black px-2 py-0.5 rounded-lg text-white"
                                style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})` }}
                              >
                                +{course.xpReward} XP
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Start button strip */}
                      {!isLocked && (
                        <div
                          className="px-4 py-2.5 flex items-center justify-between border-t"
                          style={{ borderColor: theme.from + "22", background: theme.light + "44" }}
                        >
                          <span className="text-[11px] font-black"
                            style={{ color: theme.from }}>
                            {index === 0 ? "✅ Completed" : index === 1 ? "🔥 In Progress" : "⭐ Start"}
                          </span>
                          <button
                            className="duo-btn flex items-center gap-1.5 text-white text-[11px] font-black px-4 py-1.5 rounded-xl shadow-md"
                            style={{
                              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                              boxShadow: `0 3px 0 ${theme.to}`,
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            <Play className="h-3 w-3 fill-current" />
                            {index === 0 ? "Review" : "Start"}
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — sidebar */}
        <div className="space-y-4">

          {/* Daily goal card */}
          <div
            className="rounded-3xl border-2 p-4 space-y-3"
            style={{
              borderColor: "#58CC02",
              boxShadow: "0 4px 0 #46a302",
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              animation: "duo-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.2s both",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center float-anim"
                style={{ background: "#58CC02", boxShadow: "0 3px 0 #46a302" }}
              >
                <Target className="h-5 w-5 text-white fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Daily Goal</p>
                <p className="text-sm font-black text-emerald-900">50 XP Today</p>
              </div>
            </div>
            <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-emerald-200">
              <div
                className="xp-bar-fill h-full rounded-full"
                style={{
                  "--xp-target": "74%",
                  background: "linear-gradient(90deg, #58CC02, #78e622)",
                  animationDelay: "0.8s",
                } as React.CSSProperties}
              />
            </div>
            <p className="text-[10px] font-black text-emerald-700">37 / 50 XP · Almost there! 🎯</p>
          </div>

          {/* Streak card */}
          <div
            className="rounded-3xl border-2 p-4 space-y-3"
            style={{
              borderColor: "#FF9600",
              boxShadow: "0 4px 0 #d97706",
              background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
              animation: "duo-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.3s both",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#FF9600", boxShadow: "0 3px 0 #d97706", animation: "duo-wiggle 2s ease infinite" }}
              >
                <Flame className="h-5 w-5 text-white fill-current" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Current Streak</p>
                <p className="text-sm font-black text-amber-900">{streakDays} Day Streak 🔥</p>
              </div>
            </div>
            {/* Week grid */}
            <div className="grid grid-cols-7 gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: i < streakDays ? "#FF9600" : "#f0f0f0",
                      boxShadow: i < streakDays ? "0 2px 0 #d97706" : "0 2px 0 #ddd",
                      animation: i < streakDays ? `duo-pop 0.4s cubic-bezier(.34,1.56,.64,1) ${i * 0.08}s both` : "none",
                    }}
                  >
                    {i < streakDays && <Flame className="h-3.5 w-3.5 text-white fill-current" />}
                  </div>
                  <span className="text-[9px] font-black" style={{ color: i < streakDays ? "#d97706" : "#aaa" }}>{day}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] font-bold text-amber-700">2.5× XP multiplier active!</p>
          </div>

          {/* Leaderboard podium */}
          <div
            className="rounded-3xl border-2 border-violet-200 dark:border-violet-700 p-4 space-y-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20"
            style={{
              boxShadow: "0 4px 0 #a855f722",
              animation: "duo-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.4s both",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #CE82FF, #a855f7)", boxShadow: "0 3px 0 #9333ea" }}
              >
                <Trophy className="h-5 w-5 text-white fill-current" />
              </div>
              <p className="text-sm font-black text-violet-900 dark:text-violet-200">Top Paths</p>
            </div>
            <div className="space-y-2">
              {(courses.length > 0 ? courses.slice(0, 3) : [
                { id: "1", title: "Value Investing Basics", xpReward: 500 },
                { id: "2", title: "Stock Fundamentals", xpReward: 750 },
                { id: "3", title: "Options & Derivatives", xpReward: 1200 },
              ] as Partial<CourseCard>[]).map((c, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-white/60 dark:bg-white/5 border border-violet-100 dark:border-violet-700 rounded-2xl px-3 py-2"
                    style={{ animation: `duo-slide-up 0.35s ease ${0.5 + i * 0.08}s both` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{medals[i]}</span>
                      <span className="text-[11px] font-black text-violet-800 dark:text-violet-300 line-clamp-1 max-w-[90px]">
                        {c.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 shrink-0">
                      {c.xpReward} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pro lock teaser */}
          <div
            className="rounded-3xl border-2 border-dashed border-border p-4 space-y-3"
            style={{ animation: "duo-pop 0.5s cubic-bezier(.34,1.56,.64,1) 0.5s both" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pro Paths</p>
                <p className="text-sm font-black">Coming Soon</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
              Algo-trading, live simulations & deep-dive derivatives — unlocking for Pro members.
            </p>
            <button
              className="duo-btn w-full text-[12px] font-black flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-violet-200 dark:border-violet-700 text-violet-600 dark:text-violet-300"
              style={{ background: "linear-gradient(135deg, #f3e8ff, #ede9fe)" }}
            >
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              Notify Me
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}