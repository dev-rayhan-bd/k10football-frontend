"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { IMediaItem } from "@/types/media.type";

/**
 * Video card preview: the uploaded thumbnail if it loads, otherwise the
 * video's own first frame. A video URL can't be used as an <img> source —
 * that is what left uploaded videos showing the grey placeholder.
 */
const VideoThumbnail = ({
  item,
  className,
}: {
  item: Pick<IMediaItem, "url" | "thumbnailUrl" | "title">;
  className?: string;
}) => {
  const [thumbFailed, setThumbFailed] = useState(false);
  const classes = cn("size-full object-cover", className);

  if (item.thumbnailUrl && !thumbFailed) {
    return (
      <Image
        width={600}
        height={400}
        src={item.thumbnailUrl}
        className={classes}
        alt={item.title || "Video thumbnail"}
        unoptimized
        onError={() => setThumbFailed(true)}
      />
    );
  }
  if (item.url) {
    return (
      <video
        // "#t=0.1" makes browsers paint the first frame instead of a black box.
        src={`${item.url}#t=0.1`}
        className={cn(classes, "pointer-events-none")}
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <Image
      width={600}
      height={400}
      src="/placeholder_img.jpg"
      className={classes}
      alt={item.title || "Video thumbnail"}
    />
  );
};

export default VideoThumbnail;
