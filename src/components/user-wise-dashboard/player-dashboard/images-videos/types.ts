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
