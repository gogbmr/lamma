// lib/storage.ts
import { supabase } from "./supabase";

const BUCKET_NAME = 'media-uploads';

function getFilePathFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (url.includes(`/${BUCKET_NAME}/`)) {
      return url.split(`/${BUCKET_NAME}/`)[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function uploadMedia(file: File, folder: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 🚀 Browser-side upload (No Node.js Buffers needed!)
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    console.error("Storage upload failed:", error.message || error);
    throw new Error("Failed to upload media.");
  }
}

export async function deleteMedia(fileUrl: string): Promise<boolean> {
  try {
    const filePath = getFilePathFromUrl(fileUrl);
    if (!filePath) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Storage delete failed:", error.message);
    return false;
  }
}