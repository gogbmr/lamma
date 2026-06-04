"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Loader2, Save, Edit2, X, Video, FileJson,
  BookOpen, Sparkles, Award, Lock, Unlock, Eye, ChevronDown, ChevronUp,
  GripVertical, Upload
} from "lucide-react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import VideoContextUploader from "@/components/video-context-uploader";

interface QuizGroupOption {
  id: string;
  name: string;
  _count?: { quizzes: number };
}

interface LessonRow {
  id: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  videoUrl: string | null;
  videoContext: Array<{ startTime: number; endTime?: number; topic: string; text: string }> | null;
  content: string | null;
  order: number | null;
  topic: string | null;
  module: string | null;
  lessonNumber: number | null;
  isLocked: boolean;
  xpReward: number;
  quizXpReward: number;
  quizGroupId: string | null;
  quizGroup: { id: string; name: string } | null;
  quizCountToShow: number;
  _count?: { quizzes: number; progresses: number };
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  image: string | null;
  order: number;
  xpReward: number;
  icon: string | null;
  status: string;
  lessons: LessonRow[];
  _count?: { lessons: number };
}

export default function AdminCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [quizGroups, setQuizGroups] = useState<QuizGroupOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lesson Form State
  const [showForm, setShowForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [topic, setTopic] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [lessonNumber, setLessonNumber] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [xpReward, setXpReward] = useState(10);
  const [quizXpReward, setQuizXpReward] = useState(20);
  const [quizGroupId, setQuizGroupId] = useState("");
  const [quizCountToShow, setQuizCountToShow] = useState(5);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/courses/${courseId}`);
      if (res.ok) {
        setCourse(await res.json());
      } else {
        toast.error("Course not found.");
        router.push("/admin/courses");
      }
    } catch {
      toast.error("Failed to load course.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizGroups = async () => {
    try {
      const res = await fetch("/api/admin/quiz-groups");
      if (res.ok) setQuizGroups(await res.json());
    } catch {
      // Silently fail — quiz groups are optional
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchQuizGroups();
  }, [courseId]);

  const resetForm = () => {
    setEditingLessonId(null);
    setShowForm(false);
    setTitle("");
    setDescription("");
    setIcon("");
    setVideoUrl("");
    setContent("");
    setOrder(0);
    setTopic("");
    setModuleName("");
    setLessonNumber(null);
    setIsLocked(false);
    setXpReward(10);
    setQuizXpReward(20);
    setQuizGroupId("");
    setQuizCountToShow(5);
  };

  const handleEditLesson = (lesson: LessonRow) => {
    setEditingLessonId(lesson.id);
    setShowForm(true);
    setTitle(lesson.title || "");
    setDescription(lesson.description || "");
    setIcon(lesson.icon || "");
    setVideoUrl(lesson.videoUrl || "");
    setContent(lesson.content || "");
    setOrder(lesson.order ?? 0);
    setTopic(lesson.topic || "");
    setModuleName(lesson.module || "");
    setLessonNumber(lesson.lessonNumber);
    setIsLocked(lesson.isLocked);
    setXpReward(lesson.xpReward);
    setQuizXpReward(lesson.quizXpReward);
    setQuizGroupId(lesson.quizGroupId || "");
    setQuizCountToShow(lesson.quizCountToShow);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lesson title is required.");
      return;
    }

    setIsSubmitting(true);
    const isEditing = !!editingLessonId;
    const url = isEditing
      ? `/api/admin/courses/${courseId}/lessons/${editingLessonId}`
      : `/api/admin/courses/${courseId}/lessons`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          icon: icon.trim() || null,
          videoUrl: videoUrl.trim() || null,
          content: content.trim() || null,
          order,
          topic: topic.trim() || null,
          module: moduleName.trim() || null,
          lessonNumber,
          isLocked,
          xpReward,
          quizXpReward,
          quizGroupId: quizGroupId || null,
          quizCountToShow,
        }),
      });

      if (res.ok) {
        toast.success(isEditing ? "Lesson updated." : "Lesson created.");
        resetForm();
        fetchCourse();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save lesson.");
      }
    } catch {
      toast.error("Failed to save lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Lesson deleted.");
        if (editingLessonId === lessonId) resetForm();
        fetchCourse();
      }
    } catch {
      toast.error("Failed to delete lesson.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!course) return null;

  return (
    <main className="p-4 md:p-6 space-y-6 w-full max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Courses
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{course.title}</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">{course.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-black bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-full">
            {course._count?.lessons ?? course.lessons.length} Lessons
          </span>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> Add Lesson
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LESSON FORM */}
        {showForm && (
          <form
            onSubmit={handleSaveLesson}
            className="lg:col-span-5 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                {editingLessonId ? "Edit Lesson" : "New Lesson"}
              </h3>
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title + Order */}
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1 col-span-3">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Lesson Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., What are Call Options?"
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-primary font-bold text-foreground"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl text-center outline-none font-black text-foreground"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief overview of what this lesson covers..."
                className="w-full text-xs p-3 bg-background border border-border rounded-xl h-16 outline-none focus:ring-1 focus:ring-primary font-medium text-foreground resize-none"
              />
            </div>

            {/* Topic + Module */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Options Basics"
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-medium text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Module</label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g., Module 1"
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-medium text-foreground"
                />
              </div>
            </div>

            {/* Icon + Lesson Number */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Icon Code</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g., play-circle"
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-medium text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Lesson #</label>
                <input
                  type="number"
                  value={lessonNumber ?? ""}
                  onChange={(e) => setLessonNumber(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-medium text-foreground"
                />
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                <Video className="h-3 w-3 text-primary" /> Lesson Video
              </label>
              {videoUrl ? (
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5">
                  <Video className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-foreground font-medium truncate flex-1">{videoUrl.split("/").pop()}</p>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="text-muted-foreground hover:text-destructive p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <UploadButton
                  endpoint="lessonVideo"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setVideoUrl(res[0].ufsUrl);
                      toast.success("Video uploaded!");
                    }
                  }}
                  onUploadError={(error) => {
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                  appearance={{
                    button: "bg-muted/50 hover:bg-muted border border-dashed border-border text-muted-foreground text-xs font-bold w-full h-10 rounded-xl",
                    allowedContent: "text-[10px] text-muted-foreground",
                  }}
                />
              )}
            </div>

            {/* XP Rewards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-warning" /> Lesson XP
                </label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-bold text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                  <Award className="h-3 w-3 text-warning" /> Quiz XP
                </label>
                <input
                  type="number"
                  value={quizXpReward}
                  onChange={(e) => setQuizXpReward(parseInt(e.target.value) || 0)}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-3 outline-none font-bold text-foreground"
                />
              </div>
            </div>

            {/* Quiz Group + Count */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Quiz Group</label>
                <select
                  value={quizGroupId}
                  onChange={(e) => setQuizGroupId(e.target.value)}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl px-2.5 outline-none font-bold text-foreground"
                >
                  <option value="">None (No quiz)</option>
                  {quizGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g._count?.quizzes ?? 0} Q&apos;s)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground"># Show</label>
                <input
                  type="number"
                  value={quizCountToShow}
                  onChange={(e) => setQuizCountToShow(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full text-xs h-10 bg-background border border-border rounded-xl text-center outline-none font-black text-foreground"
                />
              </div>
            </div>

            {/* Locked Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl">
              <button
                type="button"
                onClick={() => setIsLocked(!isLocked)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                  isLocked ? "bg-amber-500" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isLocked ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  {isLocked ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5 text-emerald-500" />}
                  {isLocked ? "Locked" : "Unlocked"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isLocked ? "Users must complete previous lessons first." : "This lesson is freely accessible."}
                </p>
              </div>
            </div>

            {/* Video Context Upload (only when editing) */}
            {editingLessonId && (
              <VideoContextUploader
                courseId={courseId}
                lessonId={editingLessonId}
                existingContext={
                  course.lessons.find((l) => l.id === editingLessonId)?.videoContext ?? null
                }
                onUpdated={() => fetchCourse()}
              />
            )}

            {/* Submit */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 h-10 bg-muted border border-border text-foreground text-xs font-black uppercase rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="flex-1 h-10 bg-primary text-primary-foreground text-xs font-black uppercase rounded-xl tracking-wider hover:opacity-95 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingLessonId ? "Update" : "Create"}
              </button>
            </div>

            {/* Hint for video context */}
            {!editingLessonId && (
              <p className="text-[10px] text-muted-foreground text-center font-medium">
                💡 Save the lesson first, then edit it to upload video context JSON.
              </p>
            )}
          </form>
        )}

        {/* LESSONS LIST */}
        <div className={`${showForm ? "lg:col-span-7" : "lg:col-span-12"} bg-card border border-border rounded-2xl shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Lessons Directory
            </h3>
            {!showForm && (
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Lesson
              </button>
            )}
          </div>

          {course.lessons.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-bold text-muted-foreground">No lessons yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first lesson to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {course.lessons.map((lesson) => {
                const hasVideo = !!lesson.videoUrl;
                const hasContext = lesson.videoContext && Array.isArray(lesson.videoContext) && lesson.videoContext.length > 0;
                const isExpanded = expandedLessonId === lesson.id;

                return (
                  <div key={lesson.id} className="group">
                    {/* Lesson Row */}
                    <div className="flex items-center gap-3 p-4 hover:bg-muted/10 transition-colors">
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">#{lesson.order ?? 0}</span>
                          <p className="text-xs font-bold text-foreground truncate">{lesson.title || "Untitled"}</p>
                          {lesson.isLocked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {hasVideo && (
                            <span className="text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded">
                              VIDEO
                            </span>
                          )}
                          {hasContext && (
                            <span className="text-[9px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Sparkles className="h-2.5 w-2.5" /> AI READY
                            </span>
                          )}
                          {lesson.quizGroup && (
                            <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              QUIZ: {lesson.quizGroup.name}
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {lesson.xpReward}+{lesson.quizXpReward} XP
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                          title="Toggle details"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEditLesson(lesson)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Edit lesson"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete lesson"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pl-11 space-y-3 bg-muted/5 border-t border-border/30">
                        {lesson.description && (
                          <p className="text-[11px] text-muted-foreground">{lesson.description}</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          <div className="bg-background border border-border rounded-lg p-2">
                            <span className="text-muted-foreground font-bold">Topic:</span>
                            <p className="font-bold text-foreground mt-0.5">{lesson.topic || "—"}</p>
                          </div>
                          <div className="bg-background border border-border rounded-lg p-2">
                            <span className="text-muted-foreground font-bold">Module:</span>
                            <p className="font-bold text-foreground mt-0.5">{lesson.module || "—"}</p>
                          </div>
                          <div className="bg-background border border-border rounded-lg p-2">
                            <span className="text-muted-foreground font-bold">Quiz Count:</span>
                            <p className="font-bold text-foreground mt-0.5">{lesson.quizCountToShow}</p>
                          </div>
                          <div className="bg-background border border-border rounded-lg p-2">
                            <span className="text-muted-foreground font-bold">Progress:</span>
                            <p className="font-bold text-foreground mt-0.5">{lesson._count?.progresses ?? 0} users</p>
                          </div>
                        </div>

                        {/* Quick Video Context Management */}
                        {lesson.videoUrl && (
                          <VideoContextUploader
                            courseId={courseId}
                            lessonId={lesson.id}
                            existingContext={lesson.videoContext}
                            onUpdated={() => fetchCourse()}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
