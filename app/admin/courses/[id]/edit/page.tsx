import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

import CourseForm from "../../course-form";

interface EditCoursePageProps {
params: Promise<{
id: string;
}>;
}



export default async function EditCoursePage({
params,
}: EditCoursePageProps) {
  console.log(await params);
const { id } = await params;
console.log("EDIT PAGE ID:", id);
const course =
await prisma.course.findUnique({
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

if (!course) {
notFound();
}

return ( <main className="p-6 space-y-6"> <div> <h1 className="text-3xl font-bold">
Edit Course </h1>


    <p className="text-muted-foreground">
      Update course details,
      lessons, videos,
      transcripts and quiz
      settings.
    </p>
  </div>

  <CourseForm
    mode="edit"
    initialData={{
      id: course.id,

      title: course.title,

      description:
        course.description || "",

      image:
        course.image || null,

      order:
        course.order || 0,

      xpReward:
        course.xpReward || 100,

      icon:
        course.icon || "",

      status:
        course.status,

      isLocked:
        course.isLocked,

      lessons:
        course.lessons?.map(
          (lesson: any) => ({
            id: lesson.id,

            title:
              lesson.title || "",

            module:
              lesson.module || "",

            topic:
              lesson.topic || "",

            lessonNumber:
              lesson.lessonNumber || 0,

            description:
              lesson.description ||
              "",

            icon:
              lesson.icon || "",

            videoUrl:
              lesson.videoUrl || "",

            videoContext:
              lesson.videoContext ||
              null,

            content:
              lesson.content || "",

            order:
              lesson.order || 0,

            xpReward:
              lesson.xpReward || 10,

            quizXpReward:
              lesson.quizXpReward || 20,

            quizGroupId:
              lesson.quizGroupId ||
              null,

            quizCountToShow:
              lesson.quizCountToShow || 5,

            isLocked:
              lesson.isLocked,
          })
        ) || [],
    }}
  />
</main>


);
}
