"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  Award,
  Lock,
  ImageIcon,
  Video,
  FileJson,
} from "lucide-react";

import { toast } from "sonner";

import { UploadButton } from "@/lib/uploadthing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizGroup {
  id: string;
  name: string;
}

interface LessonForm {
  id?: string;

  title: string;

  module: string;

  topic: string;

  lessonNumber: number;

  description: string;

  icon: string;

  videoUrl: string;

  videoContext: any;

  content: string;

  order: number;

  xpReward: number;

  quizXpReward: number;

  quizGroupId: string | null;

  quizCountToShow: number;

  isLocked: boolean;
}

interface CourseFormProps {
  mode: "create" | "edit";

  initialData?: {
    id: string;

    title: string;

    description: string;

    image: string | null;

    order: number;

    xpReward: number;

    icon: string | null;

    status:
      | "DRAFT"
      | "PENDING_REVIEW"
      | "APPROVED"
      | "REJECTED"
      | "ARCHIVED";

    isLocked: boolean;

    lessons?: LessonForm[];
  };
}

export default function CourseForm({
  mode,
  initialData,
}: CourseFormProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [quizGroups, setQuizGroups] =
    useState<QuizGroup[]>([]);

  const [title, setTitle] = useState(
    initialData?.title || ""
  );

  const [description, setDescription] =
    useState(
      initialData?.description || ""
    );

  const [image, setImage] = useState(
    initialData?.image || ""
  );

  const [order, setOrder] = useState(
    initialData?.order || 0
  );

  const [xpReward, setXpReward] =
    useState(
      initialData?.xpReward || 100
    );

  const [icon, setIcon] = useState(
    initialData?.icon || ""
  );

  const [status, setStatus] = useState<
    | "DRAFT"
    | "PENDING_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "ARCHIVED"
  >(
    initialData?.status || "DRAFT"
  );

  const [isLocked, setIsLocked] =
    useState(
      initialData?.isLocked || false
    );

  const [lessons, setLessons] =
    useState<LessonForm[]>(
      initialData?.lessons || []
    );

  useEffect(() => {
    const fetchQuizGroups =
      async () => {
        try {
          const res = await fetch(
            "/api/admin/quiz-groups"
          );

          if (!res.ok) return;

          const data =
            await res.json();

          setQuizGroups(data);
        } catch (error) {
          console.error(error);
        }
      };

    fetchQuizGroups();
  }, []);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        title: "",

        module: "",

        topic: "",

        lessonNumber:
          prev.length + 1,

        description: "",

        icon: "",

        videoUrl: "",

        videoContext: null,

        content: "",

        order:
          prev.length + 1,

        xpReward: 10,

        quizXpReward: 20,

        quizGroupId: null,

        quizCountToShow: 5,

        isLocked: false,
      },
    ]);
  };

  const removeLesson = (
    index: number
  ) => {
    setLessons((prev) =>
      prev.filter(
        (_, i) => i !== index
      )
    );
  };

  const updateLesson = (
    index: number,
    field: keyof LessonForm,
    value: any
  ) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === index
          ? {
              ...lesson,
              [field]: value,
            }
          : lesson
      )
    );
  };

  const handleContextFile =
    async (
      file: File,
      lessonIndex: number
    ) => {
      try {
        const text =
          await file.text();

        const json =
          JSON.parse(text);

        updateLesson(
          lessonIndex,
          "videoContext",
          json
        );

        toast.success(
          "Transcript JSON loaded"
        );
      } catch {
        toast.error(
          "Invalid JSON file"
        );
      }
    };

  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Course Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="space-y-2">
            <Label>
              Course Title
            </Label>

            <Input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Description
            </Label>

            <Textarea
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Course Cover Image
            </Label>

            {image ? (
              <div className="relative max-w-md">
                <img
                  src={image}
                  alt="Course"
                  className="rounded-xl border w-full h-52 object-cover"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() =>
                    setImage("")
                  }
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <UploadButton
                endpoint="courseImage"
                onClientUploadComplete={(
                  res
                ) => {
                  if (res?.[0]) {
                    setImage(
                      res[0].ufsUrl
                    );
                  }
                }}
              />
            )}
          </div>
                    <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Display Order
              </Label>

              <Input
                type="number"
                value={order}
                onChange={(e) =>
                  setOrder(
                    Number(
                      e.target.value
                    )
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                XP Reward
              </Label>

              <Input
                type="number"
                value={xpReward}
                onChange={(e) =>
                  setXpReward(
                    Number(
                      e.target.value
                    )
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Course Icon
            </Label>

            <Input
              value={icon}
              onChange={(e) =>
                setIcon(
                  e.target.value
                )
              }
              placeholder="book-open"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Status
            </Label>

            <Select
              value={status}
              onValueChange={(v) =>
                setStatus(v as any)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="DRAFT">
                  Draft
                </SelectItem>

                <SelectItem value="PENDING_REVIEW">
                  Pending Review
                </SelectItem>

                <SelectItem value="APPROVED">
                  Approved
                </SelectItem>

                <SelectItem value="REJECTED">
                  Rejected
                </SelectItem>

                <SelectItem value="ARCHIVED">
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div>
              <div className="font-medium">
                Locked Course
              </div>

              <p className="text-sm text-muted-foreground">
                Prevent users from
                accessing this
                course.
              </p>
            </div>

            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) =>
                setIsLocked(
                  e.target.checked
                )
              }
            />
          </div>

          <div className="border-t pt-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Lessons
              </h3>

              <p className="text-sm text-muted-foreground">
                Build your course
                curriculum.
              </p>
            </div>

            <Button
              type="button"
              onClick={addLesson}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </div>

          <div className="space-y-6">
            {lessons.length === 0 && (
              <div className="border rounded-xl p-8 text-center text-muted-foreground">
                No lessons added yet.
              </div>
            )}

            {lessons.map(
              (lesson, index) => (
                <Card
                  key={index}
                >
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                      Lesson{" "}
                      {index + 1}
                    </CardTitle>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        removeLesson(
                          index
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-5">

                    <div className="grid md:grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label>
                          Lesson Title
                        </Label>

                        <Input
                          value={
                            lesson.title
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "title",
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Lesson Number
                        </Label>

                        <Input
                          type="number"
                          value={
                            lesson.lessonNumber
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "lessonNumber",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label>
                          Module
                        </Label>

                        <Input
                          value={
                            lesson.module
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "module",
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Topic
                        </Label>

                        <Input
                          value={
                            lesson.topic
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "topic",
                              e.target
                                .value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label>
                        Lesson Icon
                      </Label>

                      <Input
                        value={
                          lesson.icon
                        }
                        onChange={(
                          e
                        ) =>
                          updateLesson(
                            index,
                            "icon",
                            e.target
                              .value
                          )
                        }
                        placeholder="play-circle"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Description
                      </Label>

                      <Textarea
                        rows={3}
                        value={
                          lesson.description
                        }
                        onChange={(
                          e
                        ) =>
                          updateLesson(
                            index,
                            "description",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Reading Content
                      </Label>

                      <Textarea
                        rows={6}
                        value={
                          lesson.content
                        }
                        onChange={(
                          e
                        ) =>
                          updateLesson(
                            index,
                            "content",
                            e.target
                              .value
                          )
                        }
                      />
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">

                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span className="font-medium">
                          Lesson Video
                        </span>
                      </div>

                      {lesson.videoUrl ? (
                        <div className="space-y-2">
                          <video
                            controls
                            className="w-full rounded-lg border"
                            src={
                              lesson.videoUrl
                            }
                          />

                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                              updateLesson(
                                index,
                                "videoUrl",
                                ""
                              )
                            }
                          >
                            Remove Video
                          </Button>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="lessonVideo"
                          onClientUploadComplete={(
                            res
                          ) => {
                            if (
                              res?.[0]
                            ) {
                              updateLesson(
                                index,
                                "videoUrl",
                                res[0]
                                  .ufsUrl
                              );

                              toast.success(
                                "Video uploaded"
                              );
                            }
                          }}
                        />
                      )}
                    </div>

                    <div className="border rounded-lg p-4 space-y-4">

                      <div className="flex items-center gap-2">
                        <FileJson className="h-4 w-4" />
                        <span className="font-medium">
                          Transcript JSON
                        </span>
                      </div>

                      <input
                        type="file"
                        accept=".json"
                        onChange={(
                          e
                        ) => {
                          const file =
                            e.target
                              .files?.[0];

                          if (
                            file
                          ) {
                            handleContextFile(
                              file,
                              index
                            );
                          }
                        }}
                      />

                      {lesson.videoContext && (
                        <div className="rounded-lg border p-3 text-sm">
                          Loaded{" "}
                          {Array.isArray(
                            lesson.videoContext
                          )
                            ? lesson
                                .videoContext
                                .length
                            : 1}{" "}
                          transcript
                          segments
                        </div>
                      )}
                    </div>
                                        <div className="grid md:grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label>
                          Lesson Order
                        </Label>

                        <Input
                          type="number"
                          value={
                            lesson.order
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "order",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          XP Reward
                        </Label>

                        <Input
                          type="number"
                          value={
                            lesson.xpReward
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "xpReward",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="grid md:grid-cols-2 gap-4">

                      <div className="space-y-2">
                        <Label>
                          Quiz XP Reward
                        </Label>

                        <Input
                          type="number"
                          value={
                            lesson.quizXpReward
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "quizXpReward",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Quiz Count To Show
                        </Label>

                        <Input
                          type="number"
                          value={
                            lesson.quizCountToShow
                          }
                          onChange={(
                            e
                          ) =>
                            updateLesson(
                              index,
                              "quizCountToShow",
                              Number(
                                e
                                  .target
                                  .value
                              )
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <Label>
                        Quiz Group
                      </Label>

                      <Select
                        value={
                          lesson.quizGroupId ||
                          "none"
                        }
                        onValueChange={(
                          value
                        ) =>
                          updateLesson(
                            index,
                            "quizGroupId",
                            value ===
                              "none"
                              ? null
                              : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Quiz Group" />
                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="none">
                            No Quiz Group
                          </SelectItem>

                          {quizGroups.map(
                            (
                              group
                            ) => (
                              <SelectItem
                                key={
                                  group.id
                                }
                                value={
                                  group.id
                                }
                              >
                                {
                                  group.name
                                }
                              </SelectItem>
                            )
                          )}

                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between border rounded-lg p-4">

                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Locked Lesson
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Students cannot
                          access this lesson.
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          lesson.isLocked
                        }
                        onChange={(
                          e
                        ) =>
                          updateLesson(
                            index,
                            "isLocked",
                            e.target
                              .checked
                          )
                        }
                      />

                    </div>

                  </CardContent>
                </Card>
              )
            )}
          </div>

          <div className="border-t pt-6 flex justify-end gap-3">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  "/admin/courses"
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={async () => {
                try {
                  if (
                    !title.trim()
                  ) {
                    toast.error(
                      "Course title is required"
                    );
                    return;
                  }

                  const invalidLesson =
                    lessons.find(
                      (
                        lesson
                      ) =>
                        !lesson.title?.trim()
                    );

                  if (
                    invalidLesson
                  ) {
                    toast.error(
                      "Every lesson must have a title"
                    );
                    return;
                  }

                  setLoading(
                    true
                  );

                  const payload =
                    {
                      title,

                      description,

                      image:
                        image ||
                        null,

                      order,

                      xpReward,

                      icon:
                        icon ||
                        null,

                      status,

                      isLocked,

                      lessons:
                        lessons.map(
                          (
                            lesson
                          ) => ({
                            title:
                              lesson.title,

                            module:
                              lesson.module,

                            topic:
                              lesson.topic,

                            lessonNumber:
                              lesson.lessonNumber,

                            description:
                              lesson.description,

                            icon:
                              lesson.icon,

                            videoUrl:
                              lesson.videoUrl,

                            videoContext:
                              lesson.videoContext,

                            content:
                              lesson.content,

                            order:
                              lesson.order,

                            xpReward:
                              lesson.xpReward,

                            quizXpReward:
                              lesson.quizXpReward,

                            quizGroupId:
                              lesson.quizGroupId,

                            quizCountToShow:
                              lesson.quizCountToShow,

                            isLocked:
                              lesson.isLocked,
                          })
                        ),
                    };

                  const url =
                    mode ===
                    "create"
                      ? "/api/admin/courses"
                      : `/api/admin/courses/${initialData?.id}`;

                  const method =
                    mode ===
                    "create"
                      ? "POST"
                      : "PUT";

                  const res =
                    await fetch(
                      url,
                      {
                        method,

                        headers:
                          {
                            "Content-Type":
                              "application/json",
                          },

                        body:
                          JSON.stringify(
                            payload
                          ),
                      }
                    );

                  const data =
                    await res.json();

                  if (
                    !res.ok
                  ) {
                    throw new Error(
                      data.error ||
                        "Failed to save course"
                    );
                  }

                  toast.success(
                    mode ===
                      "create"
                      ? "Course created successfully"
                      : "Course updated successfully"
                  );

                  router.push(
                    "/admin/courses"
                  );

                  router.refresh();

                } catch (
                  error: any
                ) {
                  toast.error(
                    error.message ||
                      "Something went wrong"
                  );
                } finally {
                  setLoading(
                    false
                  );
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />

                  {mode ===
                  "create"
                    ? "Create Course"
                    : "Update Course"}
                </>
              )}
            </Button>

          </div>

        </CardContent>
      </Card>
    </form>
  );
}