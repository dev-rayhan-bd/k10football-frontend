"use client";
import React, { useState } from "react";
import { Dock, Plus, Trash2, ExternalLink, Pencil } from "lucide-react";
import {
  IconFileTypePdf,
  IconFileTypeDoc,
  IconPhoto,
  IconLoader2,
} from "@tabler/icons-react";
import CMSField from "@/components/shared/CMSField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetMyPlayerProfileQuery,
  useDeletePlayerDocumentMutation,
  useUpdatePlayerDocumentMutation,
} from "@/redux/features/player/playerApi";
import { usePlayer } from "@/hooks/usePlayer";
import { IPlayerDocument } from "@/types/player.type";
import { UploadDocumentModal } from "./UploadDocumentModal";
import { ErrorToast } from "@/helpers/ValidationHelper";
import { useCoach } from "@/hooks/useCoach";
import { usePlayerStats } from "./FullEditablePage";
import {
  useDeleteCoachDocumentMutation,
  useUpdateCoachDocumentMutation,
} from "@/redux/features/coach/coachApi";

const DocSection = ({ editable = false }: { editable?: boolean }) => {
  const { role } = usePlayerStats() || { role: "player" };
  const { coachData, cvData: coachCvData } = useCoach();
  const isCoach = role === "coach";

  const { data: profileResponse, isLoading: isProfileLoading } = useGetMyPlayerProfileQuery(undefined, {
    skip: isCoach,
  });
  const { cvData, playerData } = usePlayer();

  const [deletePlayerDocument, { isLoading: isPlayerDeleting }] = useDeletePlayerDocumentMutation();
  const [updatePlayerDocument, { isLoading: isPlayerUpdatingTitle }] = useUpdatePlayerDocumentMutation();
  const [deleteCoachDocument, { isLoading: isCoachDeleting }] = useDeleteCoachDocumentMutation();
  const [updateCoachDocument, { isLoading: isCoachUpdatingTitle }] = useUpdateCoachDocumentMutation();

  const isDeleting = isCoach ? isCoachDeleting : isPlayerDeleting;
  const isUpdatingTitle = isCoach ? isCoachUpdatingTitle : isPlayerUpdatingTitle;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<IPlayerDocument | null>(null);

  // States for updating document title
  const [docToEdit, setDocToEdit] = useState<IPlayerDocument | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Support coach documents if role is coach, else fallback to player documents
  const coachDocs = (coachCvData?.documents || coachData?.documents || []);
  const rawCertificates: IPlayerDocument[] = isCoach
    ? coachDocs.map((d: any) => ({
        id: d._id || d.id,
        _id: d._id,
        title: d.title,
        url: d.fileUrl || d.url,
        fileUrl: d.fileUrl || d.url,
        fileType: d.fileType || "application/pdf",
        uploadedAt: d.uploadedAt,
      }))
    : (profileResponse?.data?.certificates ||
       profileResponse?.data?.documents ||
       cvData?.certificates ||
       cvData?.documents ||
       (playerData as any)?.certificates ||
       (playerData as any)?.documents ||
       []).map((d: any) => ({
        ...d,
        id: d._id || d.id,
        _id: d._id || d.id,
        url: d.fileUrl || d.url,
        fileUrl: d.fileUrl || d.url,
      }));

  // Inline title update (via CMSField)
  const handleTitleUpdate = async (docId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    try {
      if (isCoach) {
        await updateCoachDocument({ documentId: docId, title: trimmed }).unwrap();
      } else {
        await updatePlayerDocument({ documentId: docId, title: trimmed }).unwrap();
      }
    } catch (error) {
      console.error("Failed to update document title:", error);
    }
  };

  // Open edit modal for title
  const handleOpenEditModal = (doc: IPlayerDocument) => {
    setDocToEdit(doc);
    setEditTitle(doc.title || "");
  };

  // Submit title update from modal
  const handleSaveEditTitle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const docId = docToEdit?._id || docToEdit?.id;
    if (!docId) return;

    const trimmed = editTitle.trim();
    if (!trimmed) {
      ErrorToast("Please enter a document title.");
      return;
    }

    try {
      if (isCoach) {
        await updateCoachDocument({ documentId: docId, title: trimmed }).unwrap();
      } else {
        await updatePlayerDocument({ documentId: docId, title: trimmed }).unwrap();
      }
      setDocToEdit(null);
    } catch (error) {
      console.error("Failed to update document title:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    const docId = docToDelete?._id || docToDelete?.id;
    if (!docId) return;
    try {
      if (isCoach) {
        await deleteCoachDocument(docId).unwrap();
      } else {
        await deletePlayerDocument(docId).unwrap();
      }
      setDocToDelete(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const getDocIcon = (fileType?: string, url?: string) => {
    const type = (fileType || url || "").toLowerCase();
    if (type.includes("pdf")) {
      return <IconFileTypePdf className="size-6 text-[#E31B23] shrink-0" />;
    }
    if (type.includes("doc")) {
      return <IconFileTypeDoc className="size-6 text-blue-400 shrink-0" />;
    }
    if (type.includes("jpg") || type.includes("jpeg") || type.includes("png") || type.includes("webp")) {
      return <IconPhoto className="size-6 text-emerald-400 shrink-0" />;
    }
    return <Dock className="size-6 text-white/70 shrink-0" />;
  };

  const handleOpenDoc = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="py-10 sm:py-16 w-full min-w-0 overflow-hidden">
      <div className="container w-full min-w-0">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-10">
          <div className="text-center sm:text-left w-full sm:w-auto">
            <h3 className="font-heading text-wrap text-2xl sm:text-4xl text-white">
              Docs / Certificate
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Official {isCoach ? "coach" : "player"} certifications, licenses, and documents
            </p>
          </div>

          {editable && (
            <Button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-[#222222] hover:bg-[#333333] text-white border border-white/10 gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs h-11 shrink-0 transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center font-orbitron"
            >
              <Plus className="size-4 text-[#E31B23]" /> Upload Certificate
            </Button>
          )}
        </div>

        {/* Loading Skeleton */}
        {isProfileLoading && rawCertificates.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-white/10 p-5 rounded-2xl flex bg-[#111111] items-center gap-3 w-full animate-pulse min-h-20"
              >
                <div className="size-10 rounded-xl bg-white/5" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : rawCertificates.length === 0 ? (
          /* Empty State */
          <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-white/10 rounded-3xl p-6 bg-white/[0.01]">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
              <Dock className="size-7 text-[#E31B23]" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h4 className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
                No {isCoach ? "Documents" : "Certificates"} Found
              </h4>
              <p className="text-xs text-gray-400">
                You haven&apos;t uploaded any {isCoach ? "coach" : "player"} documents or certificates yet.
              </p>
            </div>
            {editable && (
              <Button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-2 bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 h-10 flex items-center gap-2 font-orbitron cursor-pointer"
              >
                <Plus className="size-4" /> Upload Certificate
              </Button>
            )}
          </div>
        ) : (
          /* Certificates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
            {rawCertificates.map((doc, idx) => {
              const docId = doc._id || (doc as any).id || String(idx);
              const fileUrl = doc.url || (doc as any).fileUrl;
              const fileSizeFormatted = formatFileSize(doc.size);

              return (
                <div
                  key={docId}
                  className="border border-white/10 p-4 sm:p-5 rounded-2xl flex bg-[#111111] hover:bg-[#151515] items-center justify-between gap-3 w-full min-w-0 transition-all hover:border-white/25 group"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => handleOpenDoc(fileUrl)}
                    title={doc.title || "View document"}
                  >
                    <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getDocIcon(doc.fileType, fileUrl)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editable ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <CMSField
                            value={doc.title || "Untitled Document"}
                            onUpdate={(val) => handleTitleUpdate(docId, String(val))}
                            canEdit={editable}
                            className="text-xs sm:text-sm font-bold text-white truncate max-w-full"
                            inputClassName="truncate max-w-full"
                          />
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {doc.title || "Untitled Document"}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400 font-orbitron">
                        {doc.fileType && (
                          <span className="uppercase text-[#E31B23] font-bold">
                            {doc.fileType}
                          </span>
                        )}
                        {doc.fileType && fileSizeFormatted && <span>•</span>}
                        {fileSizeFormatted && <span>{fileSizeFormatted}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {fileUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDoc(fileUrl)}
                        title="Open Document"
                        className="size-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                      >
                        <ExternalLink className="size-4" />
                      </Button>
                    )}

                    {editable && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(doc)}
                          title="Edit Document Title"
                          className="size-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDocToDelete(doc)}
                          title="Delete Document"
                          className="size-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {editable && (
        <UploadDocumentModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          isCoach={isCoach}
        />
      )}

      {/* Edit Document Title Dialog */}
      <Dialog open={!!docToEdit} onOpenChange={(open) => !open && setDocToEdit(null)}>
        <DialogContent className="bg-[#161616] border-2 border-white/20 text-white rounded-3xl p-6 sm:p-8 max-w-md backdrop-blur-2xl">
          <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/10">
            <DialogTitle className="text-lg sm:text-xl font-bold font-orbitron uppercase text-white">
              Edit <span className="text-[#E31B23]">Document Title</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Update the title of your certificate or document.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEditTitle} className="flex flex-col gap-4 mt-3">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="edit-doc-title"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-doc-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. CHAMPIONSHIP-CERTIFICATE-2024"
                disabled={isUpdatingTitle}
                autoFocus
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDocToEdit(null)}
                disabled={isUpdatingTitle}
                className="border-white/15 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingTitle || !editTitle.trim()}
                className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-5 h-10 flex items-center gap-2 cursor-pointer font-orbitron disabled:opacity-50"
              >
                {isUpdatingTitle ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <DialogContent className="bg-[#161616] border-2 border-white/20 text-white rounded-3xl p-6 sm:p-8 max-w-md backdrop-blur-2xl">
          <DialogHeader className="text-left flex flex-col gap-1 pb-2 border-b border-white/10">
            <DialogTitle className="text-lg sm:text-xl font-bold font-orbitron uppercase text-white">
              Delete {isCoach ? "Document" : "Certificate"}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Are you sure you want to delete &quot;{docToDelete?.title || "this document"}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDocToDelete(null)}
              disabled={isDeleting}
              className="border-white/15 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-5 h-10 flex items-center gap-2 cursor-pointer font-orbitron"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocSection;
