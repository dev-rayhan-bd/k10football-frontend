"use client";

import React from "react";

interface MediaCardSkeletonProps {
  isVideo?: boolean;
}

export const MediaCardSkeleton = ({ isVideo }: MediaCardSkeletonProps) => {
  return (
    <div className="bg-[#111111] rounded-3xl border border-white/5 p-4 flex flex-col gap-4 animate-pulse">
      <div className="relative aspect-video rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden">
        {isVideo && (
          <div className="size-12 rounded-full bg-white/10 flex items-center justify-center">
            <div className="size-5 rounded-full bg-white/15" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-5 w-3/4 rounded-md bg-white/10" />
        <div className="h-3 w-1/3 rounded-md bg-white/5" />
      </div>
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <div className="h-3 w-10 rounded bg-white/5" />
        <div className="h-3 w-10 rounded bg-white/5" />
      </div>
    </div>
  );
};

export default MediaCardSkeleton;
