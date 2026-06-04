"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  BookOpen,
  TrendingUp,
  Bell,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface UserData {
  id: string;
  displayUsername: string | null;
  role: "user" | "admin";
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

// ─── Component ─────────────────────────────────────────────────

export default function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `/api/admin/users/${params.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data: UserData = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user details");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="h-96 flex items-center justify-center">
          <div className="space-y-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading user...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="h-96 flex items-center justify-center">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                User not found
              </h3>
              <p className="text-sm text-muted-foreground">
                The user you're looking for doesn't exist
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* ── Back Button ────────────────────────── */}

      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      {/* ── Header ─────────────────────────────── */}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {user.user.image ? (
            <img
              src={user.user.image}
              alt={user.user.name}
              className="w-20 h-20 rounded-lg object-cover border-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg border-2 flex items-center justify-center text-xl font-semibold bg-muted">
              {user.user.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold">
              {user.user.name}
            </h1>
            <p className="text-muted-foreground">
              {user.displayUsername && `@${user.displayUsername}`}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={
                  user.role === "admin"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-blue-500/10 text-blue-600"
                }
              >
                {user.role === "admin" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </>
                ) : (
                  "User"
                )}
              </Badge>
              {user.user.emailVerified && (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20"
                >
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/admin/users/${params.id}/edit`}
          className={cn(buttonVariants({ variant: "default" }))}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit User
        </Link>
      </div>

      {/* ── Stats Grid ─────────────────────────── */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Email */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${user.user.email}`}
                className="text-sm hover:underline break-all"
              >
                {user.user.email}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-semibold">
                {user._count.authoredCourses}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Trades */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-semibold">
                {user._count.trades}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-semibold">
                {user._count.notifications}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Account Details ────────────────────── */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              User account details and metadata
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                User ID
              </p>
              <p className="font-mono text-sm bg-muted p-2 rounded">
                {user.id}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Account Created
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(user.user.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Last Updated
              </p>
              <span className="text-sm">
                {new Date(user.updatedAt).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        {user.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Admin permissions assigned to this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      className="bg-purple-500/10 text-purple-600 border-purple-500/20"
                    >
                      {permission.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No permissions assigned
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Activity Summary ───────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>
            Overview of user activity on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Courses Created
                </TableCell>
                <TableCell className="text-right font-medium">
                  {user._count.authoredCourses}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Total Trades
                </TableCell>
                <TableCell className="text-right font-medium">
                  {user._count.trades}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-yellow-500" />
                  Notifications Sent
                </TableCell>
                <TableCell className="text-right font-medium">
                  {user._count.notifications}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}