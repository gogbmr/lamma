"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import UserForm from "../../user-form";

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

export default function EditUserPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${userId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("User not found");
          } else {
            toast.error("Failed to load user details");
          }
          router.push("/admin/users");
          return;
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
  }, [userId, router]);

  if (loading) {
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
              <h3 className="font-semibold text-lg">User not found</h3>
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
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Users
      </Button>

      <div>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-muted-foreground mt-2">
          {user.user.name} ({user.user.email})
        </p>
      </div>

      <UserForm initialData={user} userId={userId} />
    </main>
  );
}