"use client";
import React from "react";
import Image from "next/image";
import {
  IconVideo,
  IconPhoto,
  IconCheck,
  IconX,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { UploadTask } from "./types";

interface MediaUploadProgressWidgetProps {
  task: UploadTask;
  onCancel: () => void;
  onDismiss: () => void;
}

export const MediaUploadProgressWidget: React.FC<MediaUploadProgressWidgetProps> = ({
  task,
  onCancel,
  onDismiss,
}) => {
  const isFinished = task.status === "success";
  const isError = task.status === "error";
  const isUploading = task.status === "uploading" || task.status === "processing";

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-[#E31B23]/30 bg-gradient-to-r from-[#171112] via-[#141414] to-[#121212] p-4 sm:p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(227,27,35,0.25)] relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-1/4 w-72 h-24 bg-[#E31B23]/10 blur-3xl pointer-events-none rounded-full" />

      <div className="flex flex-col gap-3 relative z-10">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Thumbnail or Media Icon */}
            <div className="relative shrink-0">
              {task.thumbnailPreview ? (
                <div className="relative size-11 sm:size-12 rounded-xl overflow-hidden border border-white/15">
                  <Image
                    src={task.thumbnailPreview}
                    alt={task.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-11 sm:size-12 rounded-xl bg-[#E31B23]/15 border border-[#E31B23]/30 flex items-center justify-center text-[#E31B23]">
                  {task.type === "video" ? (
                    <IconVideo className="size-6 animate-pulse" />
                  ) : (
                    <IconPhoto className="size-6 animate-pulse" />
                  )}
                </div>
              )}

              {/* Status Badge Icon */}
              {isUploading && (
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#E31B23] flex items-center justify-center text-white shadow-md">
                  <IconLoader2 className="size-3 animate-spin" />
                </div>
              )}
              {isFinished && (
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                  <IconCheck className="size-3 stroke-3" />
                </div>
              )}
              {isError && (
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-red-600 flex items-center justify-center text-white shadow-md">
                  <IconAlertCircle className="size-3 stroke-3" />
                </div>
              )}
            </div>

            {/* Media Information */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E31B23] font-orbitron">
                  {task.status === "uploading" && `Uploading ${task.type}`}
                  {task.status === "processing" && "Processing on Server"}
                  {task.status === "success" && "Upload Completed"}
                  {task.status === "error" && "Upload Failed"}
                </span>
                <span className="text-[10px] text-gray-500 hidden sm:inline">•</span>
                <span className="text-[10px] text-gray-400 truncate hidden sm:inline">
                  {task.fileName}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white truncate font-orbitron">
                {task.title || "Untitled Media"}
              </h4>
            </div>
          </div>

          {/* Right Side: Percentage & Cancel/Close Button */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xl sm:text-3xl font-black text-white font-orbitron tracking-tight">
                {task.progress}
                <span className="text-sm sm:text-base text-[#E31B23] ml-0.5">%</span>
              </span>
            </div>

            <button
              type="button"
              onClick={isUploading ? onCancel : onDismiss}
              className="size-8 sm:size-9 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              title={isUploading ? "Cancel upload" : "Dismiss notification"}
            >
              <IconX className="size-4 sm:size-5" />
            </button>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="w-full flex flex-col gap-1.5 pt-1">
          <div className="w-full h-2 sm:h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 relative">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                isError
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]"
                  : isFinished
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                  : "bg-gradient-to-r from-[#E31B23] via-[#ff4d55] to-[#E31B23] shadow-[0_0_12px_rgba(227,27,35,0.8)]"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, task.progress))}%` }}
            />
          </div>

          {/* Dynamic Helper Text */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-0.5">
            <span>
              {task.status === "uploading" && (
                <span className="flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-[#E31B23] animate-ping" />
                  Uploading file to server ({task.progress}%)... You can continue your other work.
                </span>
              )}
              {task.status === "processing" && (
                <span className="text-yellow-400 font-medium flex items-center gap-1.5">
                  <IconLoader2 className="size-3 animate-spin" />
                  Upload complete! Server is finalizing and saving media...
                </span>
              )}
              {task.status === "success" && (
                <span className="text-emerald-400 font-medium">
                  ✓ Successfully saved and added to your media gallery!
                </span>
              )}
              {task.status === "error" && (
                <span className="text-red-400 font-medium">
                  ✕ {task.errorMessage || "Failed to upload file. Please try again."}
                </span>
              )}
            </span>

            {isUploading && (
              <span className="text-[10px] text-gray-500 hidden sm:inline font-mono">
                Running in background
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
