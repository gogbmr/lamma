"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Types ─────────────────────────────────────────────────────

type UserRole = "user" | "admin";

const PERMISSIONS = [
  "MANAGE_USERS",
  "MANAGE_COURSES",
  "APPROVE_COURSES",
  "MANAGE_FINANCES",
  "VIEW_ANALYTICS",
  "MANAGE_SETTINGS",
];

const PERMISSION_DESCRIPTIONS: Record<string, string> = {
  MANAGE_USERS: "Can manage user accounts and profiles",
  MANAGE_COURSES: "Can create and manage courses",
  APPROVE_COURSES: "Can review and approve courses",
  MANAGE_FINANCES: "Can manage payments and finances",
  VIEW_ANALYTICS: "Can view platform analytics and reports",
  MANAGE_SETTINGS: "Can manage platform settings",
};

interface UserFormProps {
  initialData?: any;
  userId?: string;
}

// ─── Component ─────────────────────────────────────────────────

export default function UserForm({
  initialData,
  userId,
}: UserFormProps) {
  const [displayUsername, setDisplayUsername] = useState(
    initialData?.displayUsername || ""
  );
  const [role, setRole] = useState<UserRole>(
    initialData?.role || "user"
  );
  const [permissions, setPermissions] = useState<string[]>(
    initialData?.permissions || []
  );
  const [avatar, setAvatar] = useState(
    initialData?.avatar || "default.png"
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar || null
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();

  // ─── Validation ────────────────────────────────────────────

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayUsername.trim()) {
      newErrors.displayUsername = "Display username is required";
    } else if (displayUsername.trim().length < 3) {
      newErrors.displayUsername =
        "Display username must be at least 3 characters";
    } else if (displayUsername.trim().length > 20) {
      newErrors.displayUsername =
        "Display username must be less than 20 characters";
    }

    if (!role) {
      newErrors.role = "Role is required";
    }

    if (role === "admin" && permissions.length === 0) {
      newErrors.permissions =
        "Please select at least one permission for admin users";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Permissions ───────────────────────────────────────────

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleAllPermissions = () => {
    if (permissions.length === PERMISSIONS.length) {
      setPermissions([]);
    } else {
      setPermissions([...PERMISSIONS]);
    }
  };

  // ─── Avatar ────────────────────────────────────────────────

  const handleAvatarChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setAvatar(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Submit ────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        displayUsername: displayUsername.trim(),
        role,
        permissions: role === "admin" ? permissions : [],
        avatar,
      };

      const method = userId ? "PUT" : "POST";
      const url = userId
        ? `/api/admin/users/${userId}`
        : "/api/admin/users";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      toast.success(
        userId
          ? "User updated successfully"
          : "User created successfully"
      );

      // Navigate back to users list
      router.push("/admin/users");
      router.refresh();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save user"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userId ? "Edit User Details" : "Create New User"}
          </CardTitle>
          <CardDescription>
            {userId
              ? "Update user information and permissions"
              : "Add a new user account to the system"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Avatar ────────────────────────── */}

            <div className="space-y-3">
              <Label>Avatar</Label>

              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground text-center px-2">
                      No image
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="avatar-upload"
                    className="block"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Avatar
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* ── Display Username ──────────────── */}

            <div className="space-y-2">
              <Label htmlFor="displayUsername">
                Display Username
              </Label>
              <Input
                id="displayUsername"
                value={displayUsername}
                onChange={(e) => {
                  setDisplayUsername(e.target.value);
                  if (errors.displayUsername) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.displayUsername;
                      return newErrors;
                    });
                  }
                }}
                placeholder="Enter display username (3-20 characters)"
                disabled={loading}
                className={
                  errors.displayUsername
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.displayUsername && (
                <p className="text-sm text-red-500">
                  {errors.displayUsername}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This is the public name visible to other users
              </p>
            </div>

            {/* ── Role ──────────────────────────── */}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value as UserRole);
                  if (errors.role) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.role;
                      return newErrors;
                    });
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <span>User - Standard platform access</span>
                  </SelectItem>
                  <SelectItem value="admin">
                    <span>Admin - Full platform control</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">
                  {errors.role}
                </p>
              )}
            </div>

            {/* ── Permissions ───────────────────── */}

            {role === "admin" && (
              <div className="space-y-4 p-4 bg-muted rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">
                      Admin Permissions
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select which features this admin can manage
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={toggleAllPermissions}
                    disabled={loading}
                    className="text-xs"
                  >
                    {permissions.length === PERMISSIONS.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>

                {errors.permissions && (
                  <p className="text-sm text-red-500">
                    {errors.permissions}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PERMISSIONS.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => !loading && togglePermission(permission)}
                    >
                      <Checkbox
                        id={permission}
                        checked={permissions.includes(
                          permission
                        )}
                        onCheckedChange={() => {
                          if (!loading) {
                            togglePermission(permission);
                          }
                        }}
                        disabled={loading}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-0.5">
                        <Label
                          htmlFor={permission}
                          className="font-medium cursor-pointer text-sm"
                        >
                          {permission.replace(/_/g, " ")}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {
                            PERMISSION_DESCRIPTIONS[
                              permission
                            ]
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Buttons ───────────────────────── */}

            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {userId ? "Updating..." : "Creating..."}
                  </>
                ) : userId ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/users")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card - Only show on edit */}
      {userId && initialData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-mono text-xs">{userId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Created:
              </span>
              <span>
                {new Date(
                  initialData.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Updated:
              </span>
              <span>
                {new Date(
                  initialData.updatedAt
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Email:
              </span>
              <span className="text-xs">
                {initialData.user.email}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}