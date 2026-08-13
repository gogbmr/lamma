// app/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navigation/navbar";
import {
  Play, Sparkles, ArrowUpRight,
  Flame, Trophy, Zap, Heart, Crown,
  Star, Lock, CheckCircle, BookOpen
} from "lucide-react";
import Link from "next/link";
import LearningPathClient from "@/components/courses/LearningPathClient";

// ============================================================
// TYPES
// ============================================================
interface Progress {
  completedLessons?: number;
  totalLessons?: number;
  streakDays?: number;
  xp?: number;
  hearts?: number;
  level?: number;
}

interface Profile {
  name?: string;
  currentLessonId?: string;
  avatarUrl?: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
}

// ============================================================
// ANIMATED LOADER
// ============================================================
function DuolingoLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute w-20 h-20 rounded-full bg-primary/30 animate-ping [animation-delay:150ms]" />
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/40 relative z-10">
          <Zap className="h-8 w-8 text-white fill-white" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-foreground font-black text-base">Loading your path...</p>
        <p className="text-muted-foreground font-medium text-sm animate-pulse">
          Preparing your lessons
        </p>
      </div>
    </div>
  );
}


// ============================================================
// ENROLLED STATE — wraps YOUR existing LearningPathClient
// ============================================================
function EnrolledView({
  data,
}: {
  data: any;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
     

     

      {/* 
        YOUR original LearningPathClient — completely unchanged.
        All lesson click handlers, routing, scroll behaviour, 
        and lock/unlock logic stays exactly as you built it.
      */}
      <LearningPathClient
        course={data.currentCourse}
        lessons={data.lessons}
        progress={data.progress}
        profile={data.profile}
        activeLessonId={data.profile.currentLessonId}
      />
    </div>
  );
}

// ============================================================
// MARKETING PAGE — unenrolled / guest
// ============================================================
function MarketingPage({ profile }: { profile?: Profile }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const features = [
    {
      icon: <Flame className="h-6 w-6 text-orange-500 fill-orange-400" />,
      title: "Daily Streaks",
      desc: "Stay consistent. Earn streak rewards every day you learn.",
      bg: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50",
    },
    {
      icon: <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />,
      title: "Earn XP & Level Up",
      desc: "Complete lessons, ace quizzes, and climb the leaderboard.",
      bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Skill Worlds",
      desc: "Progressive paths from basics to advanced trading strategies.",
      bg: "bg-primary/5 border-primary/20",
    },
  ];

  return (
    <div
      className="flex-1 flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 500ms ease, transform 500ms ease",
      }}
    >
      {/* Hero */}
      <section className="max-w-lg mx-auto w-full px-6 pt-10 pb-6 text-center space-y-5">
        {/* Mascot */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/30"
              style={{ animation: "bounce 2.2s ease-in-out infinite" }}
            >
              <Zap className="h-12 w-12 text-white fill-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
              <Star className="h-4 w-4 text-white fill-white" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          <span>Gamified Finance Learning</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground">
          Master Finance
          <br />
          Like a{" "}
          <span className="text-primary relative inline-block">
            Game
            <svg
              className="absolute -bottom-1 left-0 w-full overflow-visible"
              height="6"
              viewBox="0 0 80 6"
              preserveAspectRatio="none"
            >
              <path
                d="M0,5 Q20,1 40,5 Q60,1 80,5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                className="text-primary/40"
              />
            </svg>
          </span>
          .
        </h1>

        <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto leading-relaxed">
          Clear skill worlds, earn XP, and deploy virtual cash — all while
          genuinely learning finance.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            href={profile ? "/courses" : "/signup"}
            className="w-full max-w-xs bg-primary text-primary-foreground font-black text-sm px-6 py-4 rounded-2xl shadow-[0_6px_0_0_hsl(var(--primary)/0.5)] hover:shadow-[0_4px_0_0_hsl(var(--primary)/0.5)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all duration-100 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            {profile ? "Browse Courses" : "Start Free Journey"}
          </Link>

          {!profile && (
            <Link
              href="/login"
              className="text-sm font-bold text-primary hover:text-primary/70 transition-colors"
            >
              Already have an account? Log in →
            </Link>
          )}
        </div>
      </section>

      {/* Market ticker */}
      <section className="w-full border-y border-border bg-card py-3 overflow-hidden">
        <div className="max-w-lg mx-auto px-6 flex items-center gap-6 overflow-x-auto scrollbar-none text-xs font-bold whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">NIFTY 50</span>
            <span className="text-green-500 flex items-center gap-0.5">
              23,450.15
              <ArrowUpRight className="h-3 w-3" />
              +0.84%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">SENSEX</span>
            <span className="text-green-500 flex items-center gap-0.5">
              77,209.90
              <ArrowUpRight className="h-3 w-3" />
              +0.72%
            </span>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-lg mx-auto w-full px-4 py-7 space-y-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`flex items-center gap-4 border rounded-2xl px-4 py-4 ${f.bg} transition-all duration-500`}
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              transitionDelay: `${150 + i * 100}ms`,
            }}
          >
            <div className="w-11 h-11 rounded-xl bg-background/60 flex items-center justify-center flex-shrink-0 shadow-sm">
              {f.icon}
            </div>
            <div>
              <p className="font-black text-sm text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

// ============================================================
// ROOT PAGE — data fetching identical to your original
// ============================================================
export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch("/api/user/home");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (isLoading) return <DuolingoLoader />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />

      {/* STATE A: enrolled — your LearningPathClient handles all routing */}
      {data?.currentCourse ? (
        <EnrolledView data={data} />
      ) : (
        /* STATE B: guest / unenrolled — marketing page */
        <MarketingPage profile={data?.profile} />
      )}
    </div>
  );
}