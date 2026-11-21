/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { IconLoader2 } from "@tabler/icons-react";
import { smartRemoveBackground } from "@/lib/utils/backgroundRemoval";

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
  const [uploadStatus, setUploadStatus] = useState<string>("Processing image...");

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
    if (isUploading) return;
    setIsUploading(true);
    setUploadStatus("Processing image...");
    const toastId = `img-upload-${field}`;
    try {
      let processedFile = file;
      if (field === "playerImage") {
        setUploadStatus("Removing background...");
        toast.loading("Removing background from player photo...", { id: toastId });
        processedFile = await smartRemoveBackground(file, false, (percent, stage) => {
          const msg = `${stage} ${percent}%`;
          setUploadStatus(msg);
          toast.loading(msg, { id: toastId });
        });
      }
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read processed image"));
        reader.readAsDataURL(processedFile);
      });
      onUpdate(field, dataUrl, processedFile);
      toast.success("Image updated successfully!", { id: toastId });
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Failed to remove background. Please try again.", { id: toastId });
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
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 px-3 text-center z-20 rounded">
          <IconLoader2 className="size-8 animate-spin text-[#00FF62]" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-orbitron">
            {uploadStatus}
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
              e.target.value = "";
              if (file) handleImageUpload(file);
            }}
          />
        </>
      )}
    </div>
  );
};
