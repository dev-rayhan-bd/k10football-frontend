import React from "react";

export type UploadMediaType = "image" | "video";

export interface MediaItem {
  id: string;
  title: string;
  date: string;
  views: number;
  likes: number;
  img: string;
  videoUrl?: string;
  mediaType: "IMAGE" | "VIDEO";
  hasThumbnail?: boolean;
}

export interface MediaStat {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; stroke?: number; className?: string }>;
}

export interface PreviewMedia {
  type: "image" | "video";
  url: string;
  title: string;
}

export interface UploadTask {
  title: string;
  fileName: string;
  type: UploadMediaType;
  progress: number;
  status: "uploading" | "processing" | "success" | "error";
  thumbnailPreview?: string | null;
  errorMessage?: string;
}

export interface UploadStartPayload {
  formData: FormData;
  title: string;
  fileName: string;
  type: UploadMediaType;
  thumbnailPreview?: string | null;
  endpoint?: string;
  tagsToInvalidate?: string[];
}
