"use client";

import React, { useEffect } from "react";
import { IconLoader2, IconTrash, IconX } from "@tabler/icons-react";
import { ISponsorItem } from "@/types/academy.type";
import { useDeleteSponsorMutation } from "@/redux/features/academy/academyApi";

interface DeleteSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: ISponsorItem | null;
}

export const DeleteSponsorModal: React.FC<DeleteSponsorModalProps> = ({
  isOpen,
  onClose,
  sponsor,
}) => {
  const [deleteSponsor, { isLoading }] = useDeleteSponsorMutation();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !sponsor) return null;

  const handleDelete = async () => {
    if (!sponsor?._id) return;
    try {
      const res = await deleteSponsor(sponsor._id).unwrap();
      if (res?.success || !res?.error) {
        onClose();
      }
    } catch {
      // Handled in academyApi onQueryStarted with ErrorToast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 sm:p-7 flex flex-col gap-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 size-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <IconX size={16} />
        </button>

        {/* Header & Content */}
        <div className="flex items-start gap-4 pr-6">
          <div className="size-12 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/25 flex items-center justify-center text-[#E31B23] shrink-0">
            <IconTrash size={22} />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3 className="text-base sm:text-lg font-black uppercase text-white font-orbitron tracking-wide">
              Delete Sponsor
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="text-white font-bold">
                &ldquo;{sponsor.companyName}&rdquo;
              </span>
              {sponsor.contactPerson ? ` (${sponsor.contactPerson})` : ""}? All associated sponsorship data will be permanently removed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E31B23]/25 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <IconTrash size={15} />
                <span>Delete Sponsor</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSponsorModal;
