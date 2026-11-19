"use client";
import React, { useState, useRef } from "react";
import {
  IconFileCertificate,
  IconFileTypePdf,
  IconUpload,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUploadPlayerDocumentMutation } from "@/redux/features/player/playerApi";
import { useUploadCoachDocumentMutation } from "@/redux/features/coach/coachApi";
import { usePlayerStats } from "./FullEditablePage";
import { ErrorToast } from "@/helpers/ValidationHelper";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCoach?: boolean;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  isCoach: isCoachProp,
}) => {
  const { role } = usePlayerStats();
  const isCoach = isCoachProp ?? (role === "coach");

  const [uploadPlayerDocument, { isLoading: isPlayerUploading }] = useUploadPlayerDocumentMutation();
  const [uploadCoachDocument, { isLoading: isCoachUploading }] = useUploadCoachDocumentMutation();

  const isUploading = isCoach ? isCoachUploading : isPlayerUploading;

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle("");
    setSelectedFile(null);
    setIsDragging(false);
  };

  const handleClose = (open: boolean) => {
    if (!open && !isUploading) {
      resetForm();
      onClose();
    }
  };

  const handleFile = (file: File | null) => {
    if (!file) return;

    // Check if file is PDF
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      ErrorToast("Only PDF files are allowed.");
      return;
    }

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      ErrorToast("File size too large. Maximum size is 15MB.");
      return;
    }

    setSelectedFile(file);

    // If title is currently empty, pre-populate with file name without extension
    if (!title.trim()) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0] || null;
    handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      ErrorToast("Please select a PDF document to upload.");
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      ErrorToast("Only PDF files are allowed.");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      ErrorToast("Please enter a document title.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", trimmedTitle);

      if (isCoach) {
        await uploadCoachDocument(formData).unwrap();
      } else {
        await uploadPlayerDocument(formData).unwrap();
      }
      resetForm();
      onClose();
    } catch (err) {
      console.error("Document upload failed:", err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const getFileIcon = (file: File) => {
    return <IconFileTypePdf className="size-8 text-[#E31B23]" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#161616] border-2 border-white/30 text-white rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
        <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/15">
          <DialogTitle className="text-xl sm:text-2xl font-black uppercase italic tracking-tight font-orbitron text-white">
            Upload <span className="text-[#E31B23]">{isCoach ? "Document" : "Certificate"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            {isCoach
              ? "Upload your coach diplomas, licenses, certificates, or documents in PDF format."
              : "Upload your diplomas, licenses, scouting reports, or verification documents in PDF format."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          {/* Document Title Field */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="document-title"
              className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
            >
              Document Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="document-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UEFA B License, Scouting Report, Medical Certificate"
              disabled={isUploading}
              className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
            />
          </div>

          {/* Document File Upload Area */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
              Select PDF File <span className="text-red-500">*</span>
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="border border-white/15 bg-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="size-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                    {getFileIcon(selectedFile)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400 font-orbitron uppercase tracking-wider mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-white/20 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl text-xs h-9 px-3"
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="rounded-xl size-9 p-0 flex items-center justify-center"
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#E31B23] bg-[#E31B23]/10"
                    : "border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                  <IconFileCertificate className="size-7 text-[#E31B23]" />
                </div>
                <div className="flex flex-col text-center">
                  <p className="text-xs sm:text-sm font-semibold text-gray-200">
                    Click to browse or drag & drop certificate
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-orbitron mt-1">
                    PDF ONLY (MAX 15MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                  className="border-white/15 bg-white/5 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider font-orbitron h-8 px-4 mt-1"
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isUploading}
              className="border-white/10 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !title.trim() || !selectedFile}
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-6 h-10 flex items-center justify-center gap-2 cursor-pointer font-orbitron disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <IconUpload className="size-4" /> Upload {isCoach ? "Document" : "Certificate"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
