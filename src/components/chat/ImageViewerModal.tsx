/* eslint-disable @next/next/no-img-element */
"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { IconDownload, IconX } from "@tabler/icons-react";

interface ImageViewerModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageViewerModal = ({ imageUrl, onClose }: ImageViewerModalProps) => {
  if (!imageUrl) return null;

  return (
    <Dialog open={Boolean(imageUrl)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-4xl p-2 bg-black/90 border-white/10 overflow-hidden rounded-2xl flex flex-col items-center justify-center"
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Open/Download image"
          >
            <IconDownload size={18} />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="relative max-h-[85vh] max-w-full flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl select-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
