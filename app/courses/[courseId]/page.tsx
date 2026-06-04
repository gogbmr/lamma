"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Award, ChevronRight, Sparkles } from "lucide-react";

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

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Learning Paths
        </h1>
        <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
          Master financial markets with structured courses, interactive video lessons, and AI-powered guidance.
        </p>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-bold text-muted-foreground">No courses available yet</p>
          <p className="text-xs text-muted-foreground mt-1">Check back soon for new learning content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="group block">
              <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {/* Image */}
                {course.image ? (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-primary/20" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        {course._count.lessons} Lessons
                      </span>
                      <span className="text-[10px] font-bold text-warning flex items-center gap-0.5">
                        <Award className="h-3 w-3" /> {course.xpReward} XP
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
