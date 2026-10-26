"use client";

import React, { useState } from "react";
import { IconUpload, IconPhoto, IconRefresh } from "@tabler/icons-react";
import { useGetMyMediaQuery } from "@/redux/features/media/mediaApi";
import { IMediaItem } from "@/types/media.type";
import AcademyMediaCard from "./AcademyMediaCard";
import MediaCardSkeleton from "./MediaCardSkeleton";
import UploadImageModal from "./UploadImageModal";
import MediaPreviewModal from "./MediaPreviewModal";
import EditMediaModal from "./EditMediaModal";
import DeleteMediaModal from "./DeleteMediaModal";
import { Button } from "@/components/ui/button";

export const AcademyImagesSection = () => {
  const { data, isLoading, isError, refetch } = useGetMyMediaQuery({
    mediaType: "IMAGE",
    limit: 20,
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<IMediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<IMediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<IMediaItem | null>(null);

  const imagesList = data?.data?.media || [];

  return (
    <div className="bg-[#111111] rounded-3xl border border-white/5 p-8 flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase text-white font-orbitron">
            Images
          </h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
            Match highlights & training
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-6 py-2.5 rounded-xl transition-all cursor-pointer hover:scale-102"
        >
          <IconUpload size={16} />
          Upload Image
        </button>
      </div>

      {/* Grid of Images / Skeletons / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <MediaCardSkeleton key={`img-skeleton-${i}`} />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/[0.02]">
          <p className="text-sm font-bold text-destructive">
            Failed to load images
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/10 text-white gap-2"
          >
            <IconRefresh size={14} /> Retry
          </Button>
        </div>
      ) : imagesList.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <IconPhoto size={24} />
          </div>
          <p className="text-sm font-bold text-white uppercase tracking-wider">
            No images uploaded yet
          </p>
          <p className="text-xs text-white/40 max-w-sm">
            Upload match photos and training highlights to showcase your academy.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer flex items-center gap-1.5"
          >
            <IconUpload size={14} />
            <span>Upload First Image</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {imagesList.map((item) => (
            <AcademyMediaCard
              key={item._id}
              item={item}
              type="IMAGE"
              onPreview={setPreviewItem}
              onEdit={setEditingItem}
              onDelete={setDeletingItem}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadImageModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* Preview Modal */}
      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

      {/* Edit Title Modal */}
      <EditMediaModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteMediaModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};

export default AcademyImagesSection;
