"use client";

import { useState, useRef } from "react";
import { Upload, FileJson, Check, AlertCircle, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VideoContextSegment {
  startTime: number;
  endTime?: number;
  topic: string;
  text: string;
}

interface VideoContextUploaderProps {
  courseId: string;
  lessonId: string;
  existingContext: VideoContextSegment[] | null;
  onUpdated: (context: VideoContextSegment[] | null) => void;
}

export default function VideoContextUploader({
  courseId,
  lessonId,
  existingContext,
  onUpdated,
}: VideoContextUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please upload a .json file.");
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      let parsed: unknown;
      
      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file. Please check the format.");
        return;
      }

      if (!Array.isArray(parsed)) {
        toast.error("JSON must be an array of segments.");
        return;
      }

      // Validate each segment
      for (let i = 0; i < parsed.length; i++) {
        const seg = parsed[i];
        if (typeof seg.startTime !== "number") {
          toast.error(`Segment ${i}: "startTime" must be a number (seconds).`);
          return;
        }
        if (!seg.topic || typeof seg.topic !== "string") {
          toast.error(`Segment ${i}: "topic" is required and must be a string.`);
          return;
        }
        if (!seg.text || typeof seg.text !== "string") {
          toast.error(`Segment ${i}: "text" is required and must be a string.`);
          return;
        }
      }

      // Send to API
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}/video-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoContext: parsed }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Video context saved — ${data.segmentCount} segments loaded.`);
        onUpdated(parsed as VideoContextSegment[]);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save video context.");
      }
    } catch (error) {
      console.error("Video context upload error:", error);
      toast.error("Failed to process file.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = async () => {
    if (!confirm("Are you sure you want to remove the video context? The AI assistant will be disabled for this lesson.")) return;
    
    setIsClearing(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}/video-context`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Video context cleared.");
        onUpdated(null);
      }
    } catch {
      toast.error("Failed to clear video context.");
    } finally {
      setIsClearing(false);
    }
  };

  const hasContext = existingContext && existingContext.length > 0;

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5">
        <FileJson className="h-3.5 w-3.5 text-primary" />
        Video Context (AI Assistant Data)
      </label>

      {/* Status Badge */}
      {hasContext ? (
        <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-emerald-600">
              {existingContext!.length} segments loaded
            </p>
            <p className="text-[10px] text-muted-foreground">
              AI assistant is active for this lesson.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Remove context"
            >
              {isClearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-600">No context loaded</p>
            <p className="text-[10px] text-muted-foreground">
              Upload a JSON file to enable the AI assistant.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && hasContext && (
        <div className="bg-muted/30 border border-border rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
          {existingContext!.map((seg, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <span className="font-mono text-primary font-bold shrink-0 w-20">
                {formatTime(seg.startTime)}
                {seg.endTime ? ` → ${formatTime(seg.endTime)}` : ""}
              </span>
              <div>
                <span className="font-bold text-foreground">{seg.topic}</span>
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{seg.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full h-10 bg-muted/50 hover:bg-muted border border-dashed border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> {hasContext ? "Replace JSON File" : "Upload JSON File"}
          </>
        )}
      </button>

      {/* Format Hint */}
      <div className="bg-muted/20 border border-border rounded-lg p-2.5">
        <p className="text-[10px] text-muted-foreground font-medium">
          <span className="font-bold text-foreground">Expected format:</span> Array of objects with{" "}
          <code className="bg-muted px-1 rounded text-[9px] font-mono">startTime</code> (seconds),{" "}
          <code className="bg-muted px-1 rounded text-[9px] font-mono">topic</code>,{" "}
          <code className="bg-muted px-1 rounded text-[9px] font-mono">text</code>, and optional{" "}
          <code className="bg-muted px-1 rounded text-[9px] font-mono">endTime</code>.
        </p>
      </div>
    </div>
  );
}
