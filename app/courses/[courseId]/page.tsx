"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";
import { 
  BookOpen, 
  Award, 
  User, 
  ArrowLeft, 
  Lock, 
  PlayCircle,
  Loader2,
  Gamepad2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Brought toast back!

interface Lesson {
  id: string;
  title: string;
  topic: string;
  module: string;
  lessonNumber: number;
  xpReward: number;
  isLocked: boolean;
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  image: string | null;
  xpReward: number;
  icon: string | null;
  isEnrolled?: boolean; // NEW: Tracking if the user is already here
  tutor: {
    name: string;
    avatar: string | null;
    bio: string | null;
  } | null;
  lessons: Lesson[];
  _count: {
    lessons: number;
  };
}

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default function CourseDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;

  const router = useRouter();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Failed to load course details");
        const data = await res.json();
        setCourse(data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchCourseDetails();
  }, [courseId]);

  const handleAction = async () => {
    // If already enrolled, skip the API call and just redirect to home with courseId
    if (course?.isEnrolled) {
      router.push(`/?courseId=${courseId}`);
      return;
    }
    
    
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      
      if (res.status === 401) {
        toast.error("Authentication required! Please log in to accept this quest.");
        router.push("/login"); 
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Enrollment transaction failed");
      }
      
      // Success! Fire the toast and redirect with the course ID
      toast.success(`Successfully enrolled! Welcome to the module. ${courseId}`);
      router.push(`/?courseId=${courseId}`);
      
    } catch (err: any) {
      toast.error(err.message || "Could not complete enrollment");
      setEnrolling(false); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading World Data...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-black">Syllabus Node Offline</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{error || "The requested course could not be located."}</p>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase">
          <ArrowLeft className="h-4 w-4" /> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-16 md:pb-0 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Knowledge Map
          </Link>
        </div>

        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          {course.image ? (
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full md:w-48 h-48 md:h-36 object-cover rounded-xl bg-muted border border-border" 
            />
          ) : (
            <div className="w-full md:w-48 h-48 md:h-36 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-border">
              <BookOpen className="h-12 w-12" />
            </div>
          )}

          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold">
              <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {course._count.lessons} Lessons
              </span>
              <span className="bg-warning/10 text-warning border border-warning/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="h-3 w-3 fill-current" /> +{course.xpReward} XP Complete Reward
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight">{course.title}</h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{course.description}</p>

            <div className="pt-2">
              <button
                onClick={handleAction}
                disabled={enrolling}
                className={`w-full md:w-auto font-black text-sm px-8 py-3.5 rounded-xl shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 ${
                  course.isEnrolled 
                    ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing Profile...
                  </>
                ) : course.isEnrolled ? (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Start Learning
                  </>
                ) : (
                  <>
                    <Gamepad2 className="h-4 w-4" />
                    Accept Quest & Enroll
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Course Syllabus Structure Mapping */}
        <section className="space-y-4">
          <h3 className="text-sm font-black tracking-wider uppercase text-muted-foreground">Syllabus Sequence Details</h3>
          
          <div className="space-y-3">
            {course.lessons.length === 0 ? (
              <p className="text-xs text-muted-foreground font-medium p-4 border border-dashed border-border rounded-xl text-center">
                Lessons for this course tracking node are currently compiling. Check back soon!
              </p>
            ) : (
              course.lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-border/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-black text-muted-foreground/60 w-5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    
                    <div className="space-y-0.5">
                      {lesson.module && (
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary">
                          {lesson.module}
                        </span>
                      )}
                      <h4 className="text-sm font-bold tracking-tight text-foreground">
                        {lesson.title || `Lesson ${lesson.lessonNumber || index + 1}`}
                      </h4>
                      {lesson.topic && <p className="text-xs text-muted-foreground">{lesson.topic}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/10">
                      +{lesson.xpReward} XP
                    </span>
                    {lesson.isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground/40" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mentor Profile / Instructor Section */}
        {course.tutor && (
          <section className="bg-muted/40 border border-border rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Course Instructor Node
            </h4>
            <div className="flex items-start gap-4">
              {course.tutor.avatar ? (
                <img src={course.tutor.avatar} alt={course.tutor.name} className="h-12 w-12 rounded-xl object-cover border border-border bg-card" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="space-y-0.5">
                <h5 className="text-sm font-bold">{course.tutor.name}</h5>
                {course.tutor.bio && <p className="text-xs text-muted-foreground leading-relaxed font-medium">{course.tutor.bio}</p>}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}