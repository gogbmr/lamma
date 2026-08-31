import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Course cover image upload
  courseImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("[UploadThing] Course image uploaded:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Lesson video upload
  lessonVideo: f({
    video: { maxFileSize: "512MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("[UploadThing] Lesson video uploaded:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // Video context JSON file upload
  videoContextJson: f({
    "application/json": { maxFileSize: "2MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("[UploadThing] Video context JSON uploaded:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),

  // 🔥 ADDED: Tutor Avatar upload
  tutorAvatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("[UploadThing] Tutor avatar uploaded:", file.ufsUrl);
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;