// prisma/seed.ts
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";

// Setup database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function main() {
  console.log("🌱 Starting Finlamma Enterprise database seeding...");

  // 1. Clear old data to prevent unique constraint errors
  await prisma.user.deleteMany();
  await prisma.course.deleteMany();

  console.log("Seeding Admin User...");
  // 2. Create the Master Admin (with full permissions and split wallets)
  const masterAdmin = await prisma.user.create({
    data: {
      name: "Admin Lammo",
      email: "admin@finlamma.com",
      emailVerified: true,
      username: "admin_master",
      profile: {
        create: {
          role: "admin",
          permissions: ["MANAGE_USERS", "MANAGE_COURSES", "APPROVE_COURSES", "MANAGE_FINANCES"],
          virtualFiatBalance: 1000000,
          llamacoinBalance: 50000,
          xp: 10000,
          level: 99,
        },
      },
    },
    include: {
      profile: true, // We need to fetch the generated profile to get its ID for authoring
    },
  });

  if (!masterAdmin.profile) {
    throw new Error("Failed to create admin profile.");
  }

  console.log("Seeding Standard User...");
  // 3. Create a standard student
  await prisma.user.create({
    data: {
      name: "Chirag Sharma",
      email: "chirag@example.com",
      emailVerified: true,
      username: "chirag_trades",
      profile: {
        create: {
          role: "user",
          virtualFiatBalance: 500000, // Based on your UI designs!
          llamacoinBalance: 2450,
          xp: 12680,
          level: 7,
          streak: 15,
        },
      },
    },
  });

  console.log("Seeding Course & Lessons...");
  // 4. Create Educational Content (Authored by the Admin)
  await prisma.course.create({
    data: {
      title: "Money World",
      description: "Start your journey with the basics of money, value, income and more.",
      order: 1,
      xpReward: 1250,
      icon: "money-world-icon",
      status: "APPROVED", // Using the new enterprise workflow status
      authorId: masterAdmin.profile.id, // Linking course to our Admin
      lessons: {
        create: [
          {
            topic: "Market Fundamentals",
            module: "1.1 Characteristics of Money",
            lessonNumber: 1,
            title: "What is Money?",
            content: "Money is anything that is generally accepted as a medium of exchange, store of value, and unit of account.",
            xpReward: 25,
            order: 1,
            quizzes: {
              create: [
                {
                  question: "Which of the following is NOT a characteristic of money?",
                  options: [
                    "Durability",
                    "Portability",
                    "Scarcity",
                    "Recognizability"
                  ],
                  // Intentionally using a trick question format based on your UI mockup
                  correctAnswer: "Scarcity", 
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("🎉 Enterprise database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });