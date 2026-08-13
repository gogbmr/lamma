import { notFound } from "next/navigation";
import prisma from "@/lib/prisma"; // (Or "@/lib/db" depending on your setup)

import CourseForm from "../../course-form";

interface EditCoursePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  // Await the params for Next.js 15+ compatibility
  const { id } = await params;
  console.log("EDIT PAGE ID:", id);

  // Fetch the course and its lessons, ordered by the lesson order
  const course = await prisma.course.findUnique({
    where: {
      id,
    },
    include: {
      lessons: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  // If someone visits an invalid ID, show the 404 page
  if (!course) {
    notFound();
  }

  // Map the database status to the exact union type expected by the form
  const validStatus = course.status as 
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "ARCHIVED";

  return (
    <main className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">
          Update course details, lessons, videos, transcripts and quiz settings.
        </p>
      </div>

      <CourseForm
        mode="edit"
        initialData={{
          id: course.id,
          title: course.title,
          description: course.description || "",
          image: course.image || null,
          order: course.order || 0,
          xpReward: course.xpReward || 100,
          icon: course.icon || "",
          status: validStatus,
          isLocked: course.isLocked,
          lessons: course.lessons?.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title || "",
            module: lesson.module || "",
            topic: lesson.topic || "",
            lessonNumber: lesson.lessonNumber || 0,
            description: lesson.description || "",
            icon: lesson.icon || "",
            videoUrl: lesson.videoUrl || "",
            videoContext: lesson.videoContext || null,
            content: lesson.content || "",
            order: lesson.order || 0,
            xpReward: lesson.xpReward || 10,
            quizXpReward: lesson.quizXpReward || 20,
            quizGroupId: lesson.quizGroupId || null,
            quizCountToShow: lesson.quizCountToShow || 5,
            isLocked: lesson.isLocked || false,
          })) || [],
        }}
      />
    </main>
  );
}