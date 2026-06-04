"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Eye,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import NewsForm from "../../news-form";

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

interface NewsDetail {
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
  createdAt: string;
  author: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function AdminNewsEditPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id as string;

  const [news, setNews] = useState<NewsDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNews = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(
        `/api/admin/news/${newsId}`
      );

      if (res.ok) {
        setNews(await res.json());
      } else {
        toast.error("Article not found");
        router.push("/admin/news");
      }
    } catch {
      toast.error("Failed to load article");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [newsId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const res = await fetch(
        `/api/admin/news/${newsId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success(
          "Article deleted successfully"
        );

        router.push("/admin/news");

        router.refresh();
      } else {
        const data = await res.json();
        throw new Error(
          data.error || "Failed to delete"
        );
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          "Failed to delete article"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (
    status: NewsStatus
  ) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            PUBLISHED
          </Badge>
        );

      case "ARCHIVED":
        return (
          <Badge variant="secondary">
            ARCHIVED
          </Badge>
        );

      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            DRAFT
          </Badge>
        );
    }
  };

  const getCategoryBadge = (
    category: NewsCategory
  ) => {
    const map: Record<
      NewsCategory,
      { label: string; className: string }
    > = {
      MARKET: {
        label: "Market",
        className:
          "bg-blue-500/10 text-blue-600 border-blue-500/20",
      },
      ECONOMY: {
        label: "Economy",
        className:
          "bg-purple-500/10 text-purple-600 border-purple-500/20",
      },
      COMPANY: {
        label: "Company",
        className:
          "bg-orange-500/10 text-orange-600 border-orange-500/20",
      },
      CRYPTO: {
        label: "Crypto",
        className:
          "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      },
      COMMODITY: {
        label: "Commodity",
        className:
          "bg-amber-500/10 text-amber-600 border-amber-500/20",
      },
      FOREX: {
        label: "Forex",
        className:
          "bg-teal-500/10 text-teal-600 border-teal-500/20",
      },
      EDUCATION: {
        label: "Education",
        className:
          "bg-green-500/10 text-green-600 border-green-500/20",
      },
      GENERAL: {
        label: "General",
        className:
          "bg-gray-500/10 text-gray-600 border-gray-500/20",
      },
    };

    const config = map[category];

    return (
      <Badge className={`border ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!news) return null;

  return (
    <main className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link
            href="/admin/news"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to News
          </Link>

          <h1 className="text-2xl font-bold mb-2">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(news.status)}

            {getCategoryBadge(news.category)}

            {news.isPinned && (
              <Badge variant="outline">
                📌 PINNED
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="icon"
          variant="destructive"
          disabled={isDeleting}
          onClick={handleDelete}
          title="Delete article"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Metadata Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Author */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">
                Author
              </p>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    {news.author.user.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {news.author.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">
                Created
              </p>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />

                <p className="text-sm font-medium">
                  {new Date(
                    news.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Published At */}
            {news.publishedAt && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">
                  Published
                </p>

                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />

                  <p className="text-sm font-medium">
                    {new Date(
                      news.publishedAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Source */}
            {news.source && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">
                  Source
                </p>

                <div className="flex items-center gap-2">
                  {news.sourceUrl ? (
                    <a
                      href={news.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {news.source}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium">
                      {news.source}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags
              </p>

              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <NewsForm mode="edit" initialData={news} />
    </main>
  );
}