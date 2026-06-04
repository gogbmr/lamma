// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/theme-toggle"; // Imported toggle
import { z } from "zod";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsPending(true);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    setIsPending(false);

    if (error) {
      toast.error(error.message || "Invalid email or password");
      return;
    }

    toast.success("Welcome back to Finlamma!");
    router.push("/dashboard"); 
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });

    if (error) {
      toast.error("Failed to authenticate with Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative transition-colors duration-300">
      
      {/* Floating Theme Switcher Portal Shell */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl border border-border bg-card text-card-foreground rounded-2xl overflow-hidden">
        <div className="bg-primary/5 p-6 text-center border-b border-border/50">
          <span className="text-2xl font-black tracking-widest text-primary">FINLAMMA</span>
          <p className="text-xs text-muted-foreground mt-1 font-medium">Continue your streak and market dominance.</p>
        </div>

        <CardHeader className="space-y-1 text-center pt-2">
          <CardTitle className="text-xl font-extrabold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in to check open trades and continue your lessons.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" className="h-10 text-sm rounded-xl focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold">Password</FormLabel>
                      <a href="/forgot-password" className="text-[11px] font-bold text-primary hover:underline">Forgot?</a>
                    </div>
                    <FormControl>
                      <Input placeholder="********" type="password" className="h-10 text-sm rounded-xl focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 mt-4 font-bold rounded-xl shadow-sm cursor-pointer hover:opacity-90 transition-opacity" disabled={isPending || isGoogleLoading}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Sign In
              </Button>
            </form>
          </Form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-card px-2 text-muted-foreground">Or authenticate with</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full h-11 rounded-xl cursor-pointer hover:bg-muted font-medium border-border" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isPending}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Google Connection
          </Button>
          
          <div className="pt-2 text-center text-xs text-muted-foreground">
            New to the platform?{" "}
            <a href="/signup" className="underline font-bold text-primary hover:opacity-80 transition-opacity">Create an account</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}