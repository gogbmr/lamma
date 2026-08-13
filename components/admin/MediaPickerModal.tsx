"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Loader2, FileImage, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia } from "@/lib/storage";

interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
  createdAt: string;
}

interface MediaPickerModalProps {
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({ onClose, onSelect }: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the media library from the database
  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setMedia(data);
      } else {
        console.error("API Error:", data);
        setMedia([]);
      }
    } catch (error) {
      console.error("Failed to load media", error);
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Upload to Supabase directly from the browser
      const url = await uploadMedia(file, "library");

      // 2. Tell the Next.js API to save this new URL to the database
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          fileName: file.name,
          fileType: file.type,
          size: file.size
        }),
      });

      if (!res.ok) throw new Error("Failed to save to database");
      
      // Instantly switch to library tab to see the new image
      setActiveTab("library");
      fetchMedia();
    } catch (error) {
      console.error(error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to format the date nicely
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-xl bg-background shadow-lg flex flex-col max-h-[85vh] overflow-hidden border">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">Media Library</h2>
          {/* 🔥 Fix: Added type="button" */}
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b px-4">
          {/* 🔥 Fix: Added type="button" */}
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "library"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("library")}
          >
            Library
          </button>
          {/* 🔥 Fix: Added type="button" */}
          <button
            type="button"
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "upload"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            Upload New
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
          
          {/* LIBRARY TAB */}
          {activeTab === "library" && (
            <>
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileImage className="h-12 w-12 mb-4 opacity-20" />
                  <p>No media found. Upload something to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map((file) => (
                    <div
                      key={file.id}
                      className="group relative flex flex-col rounded-lg border bg-background overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                      onClick={() => onSelect(file.url)}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={file.url}
                          alt={file.fileName}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      
                      {/* File Metadata Details */}
                      <div className="p-3 space-y-1.5 border-t bg-card text-xs">
                        <p className="font-semibold text-foreground truncate" title={file.fileName}>
                          {file.fileName}
                        </p>
                        
                        <div className="flex items-center text-muted-foreground">
                          <span className="truncate bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                            {file.fileType}
                          </span>
                          <span className="ml-auto text-[10px]">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        <div className="flex items-center text-muted-foreground pt-1 text-[10px]">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(file.createdAt)}
                        </div>
                      </div>
                      
                      {/* Select Overlay (Appears on Hover) */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium text-sm shadow-sm">
                          Select Image
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-card">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground font-medium">Uploading to Supabase...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Select an image from your computer</p>
                  
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                    accept="image/*"
                  />
                  
                  {/* 🔥 Fix: Added type="button" */}
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}