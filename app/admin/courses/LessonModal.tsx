"use client";

import { useState, useEffect } from "react";
import { X, Video, FileJson, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 🔥 Import the MediaPickerModal
import MediaPickerModal from "@/components/admin/MediaPickerModal";

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

interface LessonModalProps {
  isOpen: boolean;
  mode: "add" | "edit" | "view";
  initialData: LessonForm;
  quizGroups: QuizGroup[];
  onClose: () => void;
  onSave: (lesson: LessonForm) => void;
}

export default function LessonModal({
  isOpen,
  mode,
  initialData,
  quizGroups,
  onClose,
  onSave,
}: LessonModalProps) {
  const [lesson, setLesson] = useState<LessonForm>(initialData);
  
  // 🔥 State for the Media Picker Modal
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const isReadOnly = mode === "view";

  // 🔥 THIS FIXES THE EMPTY EDIT BUG!
  // It forces the modal to update its internal state whenever the initialData changes.
  useEffect(() => {
    setLesson(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof LessonForm, value: any) => {
    setLesson((prev) => ({ ...prev, [field]: value }));
  };

  const handleContextFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      handleChange("videoContext", json);
      toast.success("Transcript JSON loaded");
    } catch {
      toast.error("Invalid JSON file");
    }
  };

  const handleSave = () => {
    if (!lesson.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    onSave(lesson);
  };

  return (
    <>
      {/* Main Lesson Modal overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-3xl rounded-xl bg-background shadow-lg flex flex-col max-h-[90vh] overflow-hidden border">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-bold capitalize">
              {mode} Lesson
            </h2>
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input
                  disabled={isReadOnly}
                  value={lesson.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lesson Number</Label>
                <Input
                  type="number"
                  disabled={isReadOnly}
                  value={lesson.lessonNumber}
                  onChange={(e) => handleChange("lessonNumber", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Module</Label>
                <Input
                  disabled={isReadOnly}
                  value={lesson.module}
                  onChange={(e) => handleChange("module", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  disabled={isReadOnly}
                  value={lesson.topic}
                  onChange={(e) => handleChange("topic", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lesson Icon (e.g., play-circle)</Label>
              <Input
                disabled={isReadOnly}
                value={lesson.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                disabled={isReadOnly}
                value={lesson.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Reading Content</Label>
              <Textarea
                rows={6}
                disabled={isReadOnly}
                value={lesson.content}
                onChange={(e) => handleChange("content", e.target.value)}
              />
            </div>

            {/* 🔥 UPDATED: Video Upload Section using MediaPickerModal */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <span className="font-medium">Lesson Video</span>
              </div>

              {lesson.videoUrl ? (
                <div className="space-y-2">
                  <video controls className="w-full rounded-lg border bg-black max-h-64" src={lesson.videoUrl} />
                  {!isReadOnly && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleChange("videoUrl", "")}
                    >
                      Remove Video
                    </Button>
                  )}
                </div>
              ) : (
                !isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition"
                    onClick={() => setIsMediaModalOpen(true)}
                  >
                    <Video className="h-8 w-8 mb-2 opacity-50" />
                    <span>Browse Media Library or Upload Video</span>
                  </Button>
                )
              )}
            </div>

            {/* JSON Context Section */}
            <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
              <div className="flex items-center gap-2">
                <FileJson className="h-4 w-4 text-primary" />
                <span className="font-medium">Transcript JSON</span>
              </div>
              {!isReadOnly && <Input type="file" accept=".json" onChange={handleContextFile} />}
              {lesson.videoContext && (
                <div className="rounded-lg border bg-background p-3 text-sm">
                  Loaded {Array.isArray(lesson.videoContext) ? lesson.videoContext.length : 1} transcript segments
                </div>
              )}
            </div>

            {/* Stats & Quizzes */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Lesson Order</Label>
                <Input type="number" disabled={isReadOnly} value={lesson.order} onChange={(e) => handleChange("order", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" disabled={isReadOnly} value={lesson.xpReward} onChange={(e) => handleChange("xpReward", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Quiz XP Reward</Label>
                <Input type="number" disabled={isReadOnly} value={lesson.quizXpReward} onChange={(e) => handleChange("quizXpReward", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Quiz Count To Show</Label>
                <Input type="number" disabled={isReadOnly} value={lesson.quizCountToShow} onChange={(e) => handleChange("quizCountToShow", Number(e.target.value))} />
              </div>
            </div>

            {/* 🔥 FIXED: Explicitly display the Name instead of the ID */}
            <div className="space-y-2 relative">
              <Label>Quiz Group</Label>
              <Select
                disabled={isReadOnly}
                value={lesson.quizGroupId ? String(lesson.quizGroupId) : "none"}
                onValueChange={(v) => handleChange("quizGroupId", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  {/* We force it to find the matching name from your array */}
                  <SelectValue placeholder="Select Quiz Group">
                    {lesson.quizGroupId && lesson.quizGroupId !== "none" 
                      ? quizGroups.find(g => String(g.id) === String(lesson.quizGroupId))?.name || "Select Quiz Group"
                      : "Select Quiz Group"}
                  </SelectValue>
                </SelectTrigger>
                
                <SelectContent className="z-[100] max-h-64">
                  <SelectItem value="none">No Quiz Group</SelectItem>
                  {Array.isArray(quizGroups) && quizGroups.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/10">
              <div>
                <div className="font-medium">Locked Lesson</div>
                <p className="text-sm text-muted-foreground">Students cannot access this lesson.</p>
              </div>
              <input
                type="checkbox"
                disabled={isReadOnly}
                className="h-5 w-5"
                checked={lesson.isLocked}
                onChange={(e) => handleChange("isLocked", e.target.checked)}
              />
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="border-t p-4 flex justify-end gap-3 bg-muted/30">
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="button" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" /> Save Lesson
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* 🔥 Render MediaPickerModal OVER the LessonModal */}
      {isMediaModalOpen && (
        <div className="relative z-50">
          <MediaPickerModal
            onClose={() => setIsMediaModalOpen(false)}
            onSelect={(url) => {
              handleChange("videoUrl", url);
              setIsMediaModalOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}