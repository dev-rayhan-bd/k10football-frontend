/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";

export const EditableImage = ({
  src,
  alt,
  className,
  field,
  width,
  height,
  layout,
  editable = true,
  canEditEvaluation = false,
  onUpdate,
}: {
  src: any;
  alt: string;
  className?: string;
  field: string;
  width?: number;
  height?: number;
  layout?: "fill" | "responsive" | "intrinsic" | "fixed";
  editable?: boolean;
  canEditEvaluation?: boolean;
  onUpdate: (field: string, value: any, file?: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState<string>("player");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    const currentRole = localStorage.getItem("userRole") || role || "player";
    setRole(currentRole);
  }, [role]);

  const canUpload =
    editable &&
    (field === "playerImage" || field === "birthCountryFlag" || field === "dualNationalityFlag"
      ? role === "player" || role === "parent" || role === "coach"
      : canEditEvaluation);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(field, reader.result, file);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canUpload || isUploading) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const validSrc = (typeof src === "string" && src.trim()) ? src : src || "/profile_placeholder.jpg";

  return (
    <div
      className={`relative group w-full ${canUpload && !isUploading ? "cursor-pointer" : ""}`}
      onClick={() => canUpload && !isUploading && fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src={validSrc}
        alt={alt}
        className={className}
        width={width || 500}
        height={height || 500}
        layout={layout}
        draggable={false}
        unoptimized={typeof validSrc === "string" && (validSrc.startsWith("http") || validSrc.startsWith("/") || validSrc.startsWith("data:"))}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.srcset = "";
          target.src = "/profile_placeholder.jpg";
        }}
      />
      {isUploading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 z-20 rounded">
          <IconLoader2 className="size-8 animate-spin text-[#00FF62]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-orbitron">
            Processing image...
          </span>
        </div>
      )}
      {canUpload && !isUploading && (
        <>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
            <span className="text-[10px] text-white font-black uppercase tracking-widest font-orbitron">Drop or Click to Change Photo</span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </>
      )}
    </div>
  );
};
