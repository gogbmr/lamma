"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, X, Plus, Trash2, BookOpen, ImageIcon, Eye, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import MediaPickerModal from "@/components/admin/MediaPickerModal";
import LessonModal from "./LessonModal";

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
    status: "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED";
    isLocked: boolean;
    lessons?: LessonForm[];
  };
}

export default function CourseForm({ mode, initialData }: CourseFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [quizGroups, setQuizGroups] = useState<QuizGroup[]>([]);
  
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const [lessonModalConfig, setLessonModalConfig] = useState<{
    isOpen: boolean;
    mode: "add" | "edit" | "view";
    lessonIndex: number | null;
  }>({ isOpen: false, mode: "add", lessonIndex: null });

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [order, setOrder] = useState(initialData?.order || 0);
  const [xpReward, setXpReward] = useState(initialData?.xpReward || 100);
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [status, setStatus] = useState<"DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED">(
    initialData?.status || "DRAFT"
  );
  const [isLocked, setIsLocked] = useState(initialData?.isLocked || false);
  const [lessons, setLessons] = useState<LessonForm[]>(initialData?.lessons || []);

  // 🔥 THIS IS THE FIXED FETCH LOGIC
  useEffect(() => {
    const fetchQuizGroups = async () => {
      try {
        const res = await fetch("/api/admin/quiz-groups");
        
        // We get the raw text first to prevent JSON crash errors if a 404 HTML page is returned
        const text = await res.text(); 
        
        if (!res.ok) {
          console.error("Quiz Fetch Error Raw Data:", text);
          toast.error(`API blocked Quiz Groups: Status ${res.status}`);
          return;
        }

        const data = JSON.parse(text);
        
        // Ensure it always sets an array, even if the API structure varies slightly
        if (Array.isArray(data)) {
          setQuizGroups(data);
        } else if (data && Array.isArray(data.data)) {
          setQuizGroups(data.data);
        } else {
          toast.error("Quiz Groups API returned invalid format");
        }
      } catch (error: any) {
        console.error("Failed to parse Quiz Groups:", error);
        toast.error("Failed to connect to Quiz Groups API");
      }
    };
    
    fetchQuizGroups();
  }, []);

  const openAddLessonModal = () => {
    setLessonModalConfig({ isOpen: true, mode: "add", lessonIndex: null });
  };

  const openEditLessonModal = (index: number) => {
    setLessonModalConfig({ isOpen: true, mode: "edit", lessonIndex: index });
  };

  const openViewLessonModal = (index: number) => {
    setLessonModalConfig({ isOpen: true, mode: "view", lessonIndex: index });
  };

  const closeLessonModal = () => {
    setLessonModalConfig({ isOpen: false, mode: "add", lessonIndex: null });
  };

  const removeLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index));
  };

  const saveLessonFromModal = (lessonData: LessonForm) => {
    if (lessonModalConfig.mode === "add") {
      setLessons((prev) => [...prev, lessonData]);
    } else if (lessonModalConfig.lessonIndex !== null) {
      setLessons((prev) =>
        prev.map((l, i) => (i === lessonModalConfig.lessonIndex ? lessonData : l))
      );
    }
    closeLessonModal();
  };

  const getEmptyLesson = (): LessonForm => ({
    title: "",
    module: "",
    topic: "",
    lessonNumber: lessons.length + 1,
    description: "",
    icon: "",
    videoUrl: "",
    videoContext: null,
    content: "",
    order: lessons.length + 1,
    xpReward: 10,
    quizXpReward: 20,
    quizGroupId: null,
    quizCountToShow: 5,
    isLocked: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!title.trim()) {
        toast.error("Course title is required");
        return;
      }

      setLoading(true);

      const payload = {
        title,
        description,
        image: image || null,
        order,
        xpReward,
        icon: icon || null,
        status,
        isLocked,
        lessons,
      };

      const url = mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save course");

      toast.success(mode === "create" ? "Course created successfully" : "Course updated successfully");
      router.push("/admin/courses");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Course Cover Image</Label>
              {image ? (
                <div className="relative max-w-md">
                  <img src={image} alt="Course" className="rounded-xl border w-full h-52 object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setImage("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition"
                  onClick={() => setIsMediaModalOpen(true)}
                >
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span>Browse Media Library or Upload</span>
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Icon (e.g. book-open)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="book-open" />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <div className="font-medium">Locked Course</div>
                <p className="text-sm text-muted-foreground">Prevent users from accessing this course.</p>
              </div>
              <input type="checkbox" className="h-5 w-5" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} />
            </div>

            <div className="border-t pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Lessons
                </h3>
                <p className="text-sm text-muted-foreground">Build your course curriculum.</p>
              </div>
              <Button type="button" onClick={openAddLessonModal}>
                <Plus className="h-4 w-4 mr-2" /> Add Lesson
              </Button>
            </div>

            <div className="space-y-3">
              {lessons.length === 0 && (
                <div className="border rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
                  No lessons added yet. Click "Add Lesson" to start.
                </div>
              )}

              {lessons.map((lesson, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                        Lesson {lesson.lessonNumber}
                      </span>
                      {lesson.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {lesson.module} {lesson.topic ? `• ${lesson.topic}` : ""}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => openViewLessonModal(index)}>
                      <Eye className="h-4 w-4 mr-1.5" /> View
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => openEditLessonModal(index)}>
                      <Edit2 className="h-4 w-4 mr-1.5" /> Edit
                    </Button>
                    <Button type="button" variant="destructive" size="icon" className="h-9 w-9" onClick={() => removeLesson(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/courses")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> {mode === "create" ? "Create Course" : "Update Course"}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {isMediaModalOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(url) => {
            setImage(url);
            setIsMediaModalOpen(false);
          }}
        />
      )}

      <LessonModal
        isOpen={lessonModalConfig.isOpen}
        mode={lessonModalConfig.mode}
        quizGroups={quizGroups}
        initialData={
          lessonModalConfig.lessonIndex !== null
            ? lessons[lessonModalConfig.lessonIndex]
            : getEmptyLesson()
        }
        onClose={closeLessonModal}
        onSave={saveLessonFromModal}
      />
    </>
  );
}