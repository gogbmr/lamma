// app/dashboard/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/navigation/navbar";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileEditSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters long"),
  username: z.string().min(3, "Username must be at least 3 characters long").regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric letters and underscores only"),
});

type ProfileEditFormValues = z.infer<typeof profileEditSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { name: "", username: "" },
  });

  useEffect(() => {
    if (!isAuthLoading && session?.user) {
      form.reset({ name: session.user.name || "", username: session.user.username || "" });
    } else if (!isAuthLoading && !session) {
      router.push("/login");
    }
  }, [session, isAuthLoading, form, router]);

  const onSubmit = async (values: ProfileEditFormValues) => {
    setIsSaving(true);
    try {
      // Updated endpoint location target path context
      const response = await fetch("/api/dashboard/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed execution query parameters");
      }

      toast.success("Profile updated successfully!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border border-border bg-card rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pt-6 px-6">
            <button onClick={() => router.push("/dashboard")} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary mb-3 cursor-pointer"><ArrowLeft className="h-3.5 w-3.5" /> Return to Desk</button>
            <CardTitle className="text-xl font-extrabold tracking-tight">Identity Settings</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Modify your public handle fields.</CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">Full Name / Handle</FormLabel>
                    <FormControl><Input className="h-11 text-xs rounded-xl focus-visible:ring-primary" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground">Unique Username</FormLabel>
                    <FormControl><Input className="h-11 text-xs rounded-xl focus-visible:ring-primary" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-11 font-bold rounded-xl mt-6 cursor-pointer" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Commit Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}