"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  Save,
  X,
  ImageIcon,
  Tag,
  Link as LinkIcon,
  Calendar,
} from "lucide-react";

import { toast } from "sonner";

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

// Import your new centralized Media Picker Modal!
import MediaPickerModal from "@/components/admin/MediaPickerModal";

type NewsStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

type NewsCategory =
  | "MARKET"
  | "ECONOMY"
  | "COMPANY"
  | "CRYPTO"
  | "COMMODITY"
  | "FOREX"
  | "EDUCATION"
  | "GENERAL";

interface NewsFormProps {
  mode: "create" | "edit";

  initialData?: {
    id: string;
    title: string;
    summary: string;
    content: string;
    image: string | null;
    source: string | null;
    sourceUrl: string | null;
    category: NewsCategory;
    status: NewsStatus;
    tags: string[];
    isPinned: boolean;
    publishedAt: string | null;
  };
}

export default function NewsForm({
  mode,
  initialData,
}: NewsFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false); // Modal control state

  const [title, setTitle] = useState(
    initialData?.title || ""
  );

  const [summary, setSummary] = useState(
    initialData?.summary || ""
  );

  const [content, setContent] = useState(
    initialData?.content || ""
  );

  const [image, setImage] = useState(
    initialData?.image || ""
  );

  const [source, setSource] = useState(
    initialData?.source || ""
  );

  const [sourceUrl, setSourceUrl] = useState(
    initialData?.sourceUrl || ""
  );

  const [category, setCategory] =
    useState<NewsCategory>(
      initialData?.category || "GENERAL"
    );

  const [status, setStatus] = useState<NewsStatus>(
    initialData?.status || "DRAFT"
  );

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(
    initialData?.tags || []
  );

  const [isPinned, setIsPinned] = useState(
    initialData?.isPinned || false
  );

  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt)
          .toISOString()
          .split("T")[0]
      : ""
  );

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();

    if (!trimmed) {
      toast.error("Tag cannot be empty");
      return;
    }

    if (tags.includes(trimmed)) {
      toast.error("Tag already exists");
      return;
    }

    if (tags.length >= 10) {
      toast.error("Maximum 10 tags allowed");
      return;
    }

    setTags((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) =>
      prev.filter((t) => t !== tag)
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Article title is required");
      return;
    }

    if (!summary.trim()) {
      toast.error("Article summary is required");
      return;
    }

    if (!content.trim()) {
      toast.error("Article content is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        image: image || null,
        source: source.trim() || null,
        sourceUrl: sourceUrl.trim() || null,
        category,
        status,
        tags,
        isPinned,
        publishedAt: publishedAt
          ? new Date(publishedAt).toISOString()
          : null,
      };

      const url =
        mode === "create"
          ? "/api/admin/news"
          : `/api/admin/news/${initialData?.id}`;

      const method =
        mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to save article"
        );
      }

      toast.success(
        mode === "create"
          ? "Article created successfully"
          : "Article updated successfully"
      );

      router.push("/admin/news");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Article Title *</Label>
            <Input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g., Fed Rate Hikes Expected in Q3"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label>Summary *</Label>
            <Textarea
              rows={3}
              value={summary}
              onChange={(e) =>
                setSummary(e.target.value)
              }
              placeholder="Brief overview of the article (will show in feed)"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Full Content *</Label>
            <Textarea
              rows={8}
              value={content}
              onChange={(e) =>
                setContent(e.target.value)
              }
              placeholder="Complete article text..."
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>

            {image ? (
              <div className="relative max-w-md">
                <img
                  src={image}
                  alt="Article"
                  className="rounded-xl border w-full h-52 object-cover"
                />

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
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition"
                  onClick={() => setIsMediaModalOpen(true)}
                >
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span>Browse Media Library or Upload</span>
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">
                News Source
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source Name</Label>
                  <Input
                    value={source}
                    onChange={(e) =>
                      setSource(e.target.value)
                    }
                    placeholder="e.g., Reuters, CNBC"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source URL</Label>
                  <Input
                    value={sourceUrl}
                    onChange={(e) =>
                      setSourceUrl(e.target.value)
                    }
                    placeholder="https://example.com/article"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>

              <Select
                value={category}
                onValueChange={(v) =>
                  setCategory(v as NewsCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="MARKET">Market</SelectItem>
                  <SelectItem value="ECONOMY">Economy</SelectItem>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="CRYPTO">Crypto</SelectItem>
                  <SelectItem value="COMMODITY">Commodity</SelectItem>
                  <SelectItem value="FOREX">Forex</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>

              <Select
                value={status}
                onValueChange={(v) =>
                  setStatus(v as NewsStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Published At */}
            <div className="space-y-2">
              <Label>Published At</Label>

              <Input
                type="date"
                value={publishedAt}
                onChange={(e) =>
                  setPublishedAt(e.target.value)
                }
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>

              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) =>
                    setTagInput(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag and press Enter"
                />

                <Button
                  type="button"
                  onClick={addTag}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-sm"
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() =>
                          removeTag(tag)
                        }
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pin Toggle */}
            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <div className="font-medium">
                  Pin to Top
                </div>

                <p className="text-sm text-muted-foreground">
                  Keep this article pinned at the top of the news feed.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) =>
                  setIsPinned(e.target.checked)
                }
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="border-t pt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/admin/news")
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create"
                    ? "Create Article"
                    : "Update Article"}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* 
        The Media Picker Modal is mounted here! 
        It only renders when isMediaModalOpen is true.
      */}
      {isMediaModalOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaModalOpen(false)}
          onSelect={(url) => {
            setImage(url); // Save the selected URL to the form state
            setIsMediaModalOpen(false); // Close the popup
          }}
        />
      )}
    </form>
  );
}