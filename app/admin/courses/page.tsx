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
  BookOpen,
  Award,
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

interface CourseRow {
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

  createdAt: string;

  _count: {
    lessons: number;
  };
}

interface ApiResponse {
  data: CourseRow[];

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState("ALL");

  const [sortBy, setSortBy] = useState("createdAt");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [totalPages, setTotalPages] = useState(1);

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/courses?${params.toString()}`);

      if (!res.ok) {
        throw new Error();
      }

      const data: ApiResponse = await res.json();

      setCourses(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, pageSize, search, status, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Course deleted");

      fetchCourses();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const getStatusBadge = (status: CourseRow["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            APPROVED
          </Badge>
        );

      case "PENDING_REVIEW":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            PENDING REVIEW
          </Badge>
        );

      case "REJECTED":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            REJECTED
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
  };

  return (
    <main className="p-6 space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>

          <p className="text-muted-foreground">
            Manage all courses in your learning platform.
          </p>
        </div>

        <Link
          href="/admin/courses/create"
          className={cn(
            buttonVariants({
              variant: "default",
            })
          )}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Link>
      </div>

      {/* FILTERS */}

      <Card>
        <CardHeader>
          <CardTitle>Filters & Sorting</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search courses..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                // 🔥 FIX: Added fallback to "ALL" to prevent string | null error
                setStatus(value || "ALL");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value || "createdAt")} // 🔥 FIX added here too just in case
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="order">Display Order</SelectItem>
                <SelectItem value="xpReward">XP Reward</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOrder}
              onValueChange={(value) =>
                setSortOrder((value as "asc" | "desc") || "desc") // 🔥 FIX added here too
              }
            >
              <SelectTrigger>
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

      {/* TABLE */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Course Directory</CardTitle>

          <Badge variant="outline">{total} Total Courses</Badge>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />

              <h3 className="font-semibold">No Courses Found</h3>

              <p className="text-sm text-muted-foreground">
                Try changing filters or create a new course.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>

                    <TableHead>Course</TableHead>

                    <TableHead>Lessons</TableHead>

                    <TableHead>XP Reward</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead>Created</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg border flex items-center justify-center text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{course.title}</div>

                          <div className="text-xs text-muted-foreground">
                            Order #{course.order}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                            {course.description}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {course._count?.lessons} Lessons
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Award className="h-4 w-4" />
                          {course.xpReward}
                        </span>
                      </TableCell>

                      <TableCell>{getStatusBadge(course.status)}</TableCell>

                      <TableCell>
                        {new Date(course.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "icon",
                              })
                            )}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleDelete(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PAGINATION */}

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) => {
                      setPage(1);
                      // 🔥 FIX: Added fallback to 10 here as well
                      setPageSize(Number(value || 10));
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="10">10 Rows</SelectItem>

                      <SelectItem value="25">25 Rows</SelectItem>

                      <SelectItem value="50">50 Rows</SelectItem>

                      <SelectItem value="100">100 Rows</SelectItem>
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

                  <span className="text-sm font-medium">{page}</span>

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