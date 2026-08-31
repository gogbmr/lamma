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
  Users,
  Shield,
  Eye,
  User as UserIcon,
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

type UserRole = "user" | "admin";

interface UserRow {
  id: string;
  displayUsername: string | null;
  role: UserRole;
  permissions: string[];
  avatar: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
  };
  _count: {
    authoredCourses: number;
    trades: number;
    notifications: number;
  };
}

interface ApiResponse {
  data: UserRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ─── Role Badge ─────────────────────────────────────────────────

function getRoleBadge(role: UserRole) {
  switch (role) {
    case "admin":
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 flex items-center gap-1 w-fit">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    default:
      return (
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 flex items-center gap-1 w-fit">
          <UserIcon className="h-3 w-3" />
          User
        </Badge>
      );
  }
}

// ─── Page ───────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [role, setRole] = useState("ALL");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        role,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`);

      if (!res.ok) throw new Error();

      const data: ApiResponse = await res.json();

      setUsers(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, role, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* ── HEADER ─────────────────────────────── */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>

          <p className="text-muted-foreground">
            Manage user accounts, roles and permissions.
          </p>
        </div>

        <Link
          href="/admin/users/create"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Link>
      </div>

      {/* ── FILTERS ────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>Filters & Sorting</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by name, email, or username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Role */}
            <Select
              value={role}
              onValueChange={(value) => {
                setPage(1);
                setRole(value || "ALL"); // 🔥 FIXED
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select 
              value={sortBy} 
              onValueChange={(value) => setSortBy(value || "createdAt")} // 🔥 FIXED
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="displayUsername">Username</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Row */}
          <div className="mt-4 flex justify-end">
            <Select
              value={sortOrder}
              onValueChange={(value) =>
                setSortOrder((value as "asc" | "desc") || "desc") // 🔥 FIXED
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
          <CardTitle>Users Directory</CardTitle>

          <Badge variant="outline">{total} Total Users</Badge>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="h-60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />

              <h3 className="font-semibold">No Users Found</h3>

              <p className="text-sm text-muted-foreground">
                Try changing filters or add a new user.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      {/* User Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.user.image ? (
                            <img
                              src={user.user.image}
                              alt={user.user.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-medium bg-muted">
                              {user.user.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="space-y-0.5">
                            <div className="font-medium">
                              {user.user.name}
                            </div>
                            {user.user.emailVerified && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell>
                        <span className="text-sm">{user.user.email}</span>
                      </TableCell>

                      {/* Username */}
                      <TableCell>
                        {user.displayUsername ? (
                          <span className="text-sm font-medium">
                            @{user.displayUsername}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not set
                          </span>
                        )}
                      </TableCell>

                      {/* Role */}
                      <TableCell>{getRoleBadge(user.role)}</TableCell>

                      {/* Courses */}
                      <TableCell>
                        <span className="font-medium">
                          {user._count.authoredCourses}
                        </span>
                      </TableCell>

                      {/* Trades */}
                      <TableCell>
                        <span className="font-medium">
                          {user._count.trades}
                        </span>
                      </TableCell>

                      {/* Joined */}
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.user.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex justify-end gap-2">
                        {/* View */}
                          <Link
                            href={`/admin/users/${user.id}`}
                            className={cn(
                              buttonVariants({  
                              variant: "outline",
                              size: "icon",
                            }))
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* Edit */}
                          <Link
                            href={`/admin/users/${user.id}/edit`}
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
                            onClick={() => handleDelete(user.id)}
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
                      setPageSize(Number(value || 10)); // 🔥 FIXED
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