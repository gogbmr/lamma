// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// This single handler manages sign-in, sign-up, Google OAuth redirects, etc.
export const { GET, POST } = toNextJsHandler(auth);