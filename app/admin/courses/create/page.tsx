import CourseForm from "../course-form";

export default function CreateCoursePage() {
  return (
    <main className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Create Course
        </h1>

        <p className="text-muted-foreground">
          Create a new learning course.
        </p>
      </div>

      <CourseForm mode="create" />
    </main>
  );
}