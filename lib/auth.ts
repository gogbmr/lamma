// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins"; // Removed anonymous plugin entirely

// 1. Updated to your verified generated path to avoid ghost client errors
import { PrismaClient } from "../app/generated/prisma";

// 2. Postgres pool and native driver adapter configurations
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Initialize the Database Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Export the Better Auth instance
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    username(), // Keeps the custom username registration active
  ],
  // Enterprise profile creation lifecycle hook
  databaseHooks: {
    user: {
      create: {
        // Changed to AFTER hook to cleanly spin up the secondary UserProfile row
        after: async (user) => {
          try {
            await prisma.userProfile.create({
              data: {
                userId: user.id, // Links directly back to the core auth identity
                role: "user",
                virtualFiatBalance: 0, // Matches your UI spec (₹5,00,000 paper trading)
                llamacoinBalance: 0,
                xp: 0,
                streak: 0,
                level: 1,
                avatar: "default.png",
              },
            });
          } catch (error) {
            console.error("❌ CRITICAL: Failed to generate companion UserProfile record:", error);
            throw error; // Rethrowing safely halts process and dumps the stack trace to terminal
          }
        },
      },
    },
  },
});