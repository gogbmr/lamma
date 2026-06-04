"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Pin,
  PinOff,
  ExternalLink,
} from "lucide-react";

import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ─────────────────────────────────────────────────────

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

interface NewsRow {
  id: string;
  title: string;
  summary: string;
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

interface ApiResponse {
  data: NewsRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Status Badge ───────────────────────────────────────────────

function getStatusBadge(status: NewsStatus) {
  switch (status) {
    case "PUBLISHED":
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          PUBLISHED
        </Badge>
      );
    case "ARCHIVED":
      return <Badge variant="secondary">ARCHIVED</Badge>;
    default:
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          DRAFT
        </Badge>
      );
  }
}

// ─── Category Badge ─────────────────────────────────────────────

function getCategoryBadge(category: NewsCategory) {
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
    <Badge className={cn("border", config.className)}>
      {config.label}
    </Badge>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState("ALL");
  const [category, setCategory] = useState("ALL");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    "desc"
  );

  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchNews = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status,
        category,
        sortBy,
        sortOrder,
      });

      const res = await fetch(
        `/api/admin/news?${params.toString()}`
      );

      if (!res.ok) throw new Error();

      const data: ApiResponse = await res.json();

      setNews(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Failed to load news feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, pageSize, search, status, category, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this news article?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("News article deleted");
      fetchNews();
    } catch {
      toast.error("Failed to delete news article");
    }
  };

  const handleTogglePin = async (
    id: string,
    currentPinned: boolean
  ) => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPinned: !currentPinned,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success(
        currentPinned
          ? "Article unpinned"
          : "Article pinned to top"
      );

      fetchNews();
    } catch {
      toast.error("Failed to update pin status");
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* ── HEADER ─────────────────────────────── */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">News Feed</h1>

          <p className="text-muted-foreground">
            Manage financial news and market updates.
          </p>
        </div>

        <Link
          href="/admin/news/create"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Article
        </Link>
      </div>

      {/* ── FILTERS ────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>Filters & Sorting</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Status */}
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Category */}
            <Select
              value={category}
              onValueChange={(value) => {
                setPage(1);
                setCategory(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
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

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="createdAt">
                  Created Date
                </SelectItem>
                <SelectItem value="publishedAt">
                  Published Date
                </SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="isPinned">Pinned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Row */}
          <div className="mt-4 flex justify-end">
            <Select
              value={sortOrder}
              onValueChange={(value) =>
                setSortOrder(value as "asc" | "desc")
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── TABLE ──────────────────────────────── */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>News Directory</CardTitle>

          <Badge variant="outline">{total} Total Articles</Badge>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : news.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <Newspaper className="h-10 w-10 text-muted-foreground mb-3" />

              <h3 className="font-semibold">No Articles Found</h3>

              <p className="text-sm text-muted-foreground">
                Try changing filters or create a new article.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {news.map((article) => (
                    <TableRow key={article.id}>
                      {/* Image */}
                      <TableCell>
                        {article.image ? (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg border flex items-center justify-center text-xs text-muted-foreground bg-muted">
                            N/A
                          </div>
                        )}
                      </TableCell>

                      {/* Article Info */}
                      <TableCell>
                        <div className="space-y-1 max-w-sm">
                          <div className="font-medium flex items-center gap-2">
                            {article.isPinned && (
                              <Pin className="h-3 w-3 text-orange-500 shrink-0" />
                            )}
                            <span className="line-clamp-1">
                              {article.title}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.summary}
                          </p>

                          {article.source && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {article.sourceUrl ? (
                                <a
                                  href={article.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-primary transition-colors"
                                >
                                  {article.source}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span>{article.source}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        {getCategoryBadge(article.category)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusBadge(article.status)}
                      </TableCell>

                      {/* Tags */}
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {article.tags.length > 0 ? (
                            <>
                              {article.tags
                                .slice(0, 2)
                                .map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}

                              {article.tags.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  +{article.tags.length - 2}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No tags
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Author */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">
                            {article.author.user.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {article.author.user.email}
                          </div>
                        </div>
                      </TableCell>

                      {/* Published At */}
                      <TableCell>
                        {article.publishedAt ? (
                          <span className="text-sm">
                            {new Date(
                              article.publishedAt
                            ).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not published
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {/* Pin / Unpin */}
                          <Button
                            size="icon"
                            variant="outline"
                            title={
                              article.isPinned
                                ? "Unpin article"
                                : "Pin article"
                            }
                            onClick={() =>
                              handleTogglePin(
                                article.id,
                                article.isPinned
                              )
                            }
                          >
                            {article.isPinned ? (
                              <PinOff className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Pin className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Edit */}
                          <Link
                            href={`/admin/news/${article.id}/edit`}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              })
                            )}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          {/* Delete */}
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() =>
                              handleDelete(article.id)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* ── PAGINATION ─────────────────────── */}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPage(1);
                      setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="10">10 Rows</SelectItem>
                      <SelectItem value="25">25 Rows</SelectItem>
                      <SelectItem value="50">50 Rows</SelectItem>
                      <SelectItem value="100">
                        100 Rows
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm font-medium">
                    {page}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}