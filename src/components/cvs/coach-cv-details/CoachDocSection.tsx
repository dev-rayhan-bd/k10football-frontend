/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Dock, Plus, Trash2, ExternalLink, Pencil, FileText } from "lucide-react";
import {
  IconFileTypePdf,
  IconFileTypeDoc,
  IconPhoto,
  IconLoader2,
} from "@tabler/icons-react";
import CMSField from "@/components/shared/CMSField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCoach } from "@/hooks/useCoach";
import {
  useUploadCoachDocumentMutation,
  useDeleteCoachDocumentMutation,
  useUpdateCoachDocumentMutation,
} from "@/redux/features/coach/coachApi";
import { toast } from "sonner";
import { UploadDocumentModal } from "@/components/cvs/player-cv-details/UploadDocumentModal";

interface CoachDocSectionProps {
  editable?: boolean;
  coachId?: string;
}

export const CoachDocSection = ({ editable = false, coachId }: CoachDocSectionProps) => {
  const { cvData, coachData, isViewingSpecificCoach, refetchCv } = useCoach(coachId);
  const [deleteCoachDocument, { isLoading: isDeleting }] = useDeleteCoachDocumentMutation();
  const [updateCoachDocument, { isLoading: isUpdatingTitle }] = useUpdateCoachDocumentMutation();
  const [docToDelete, setDocToDelete] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const rawDocs: any[] =
    (cvData?.documents && Array.isArray(cvData.documents) ? cvData.documents : null) ||
    (coachData.documents && Array.isArray(coachData.documents) ? coachData.documents : []) ||
    [];

  const canEdit = editable && !isViewingSpecificCoach;

  const getDocIcon = (type?: string, url?: string) => {
    const checkStr = (type || url || "").toLowerCase();
    if (checkStr.includes("pdf")) return <IconFileTypePdf size={28} className="text-red-500" />;
    if (checkStr.includes("doc") || checkStr.includes("word"))
      return <IconFileTypeDoc size={28} className="text-blue-500" />;
    if (checkStr.includes("png") || checkStr.includes("jpg") || checkStr.includes("jpeg"))
      return <IconPhoto size={28} className="text-emerald-500" />;
    return <FileText size={28} className="text-primary" />;
  };

  const handleUpdateTitle = async (docId: string, newTitle: string) => {
    if (!docId || !newTitle.trim()) return;
    try {
      await updateCoachDocument({ documentId: docId, title: newTitle.trim() }).unwrap();
      toast.success("Document title updated");
      refetchCv();
    } catch {
      toast.error("Failed to update title");
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete?._id && !docToDelete?.id) return;
    const docId = docToDelete._id || docToDelete.id;
    try {
      await deleteCoachDocument(docId).unwrap();
      toast.success("Document deleted");
      setDocToDelete(null);
      refetchCv();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16">
      <div className="bg-cardBg border border-white/5 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Dock className="size-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading uppercase tracking-wide">
                Certifications & Documents
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified UEFA licences, coaching certificates, and credentials
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              data-pdf-hide
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="gap-2 cursor-pointer shrink-0"
            >
              <Plus className="size-4" /> Upload Document
            </Button>
          )}
        </div>

        {rawDocs.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-10 opacity-30" />
            <p className="text-sm font-medium">No documents uploaded yet</p>
            <p className="text-xs max-w-sm">
              {canEdit
                ? "Upload your coaching licences and certificates (PDF, max 15MB)."
                : "Official coaching licences and documentation will appear here once verified."}
            </p>
            {canEdit && (
              <Button
                data-pdf-hide
                type="button"
                size="sm"
                onClick={() => setIsUploadOpen(true)}
                className="mt-3 gap-2 cursor-pointer"
              >
                <Plus className="size-4" /> Upload First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {rawDocs.map((doc: any, index: number) => {
              const docId = doc._id || doc.id || `doc-${index}`;
              const docUrl = doc.fileUrl || doc.url || "";
              const docTitle = doc.title || doc.name || `Document ${index + 1}`;

              return (
                <div
                  key={docId}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {getDocIcon(doc.fileType, docUrl)}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      {canEdit ? (
                        <CMSField
                          value={docTitle}
                          onUpdate={(val) => handleUpdateTitle(docId, String(val))}
                          canEdit={canEdit}
                          className="font-bold text-sm text-white truncate"
                        />
                      ) : (
                        <span className="font-bold text-sm text-white truncate" title={docTitle}>
                          {docTitle}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {doc.fileType || "Certificate"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {docUrl && (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary transition-colors"
                        title="View Document"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setDocToDelete(doc)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload (POST /coaches/me/documents) — the CV refetches via tag invalidation */}
      {canEdit && (
        <UploadDocumentModal
          isOpen={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            refetchCv();
          }}
          isCoach
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" /> Delete Document
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-gray-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              &quot;{docToDelete?.title || "this document"}&quot;
            </span>
            ? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDocToDelete(null)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? <IconLoader2 className="size-4 animate-spin mr-1" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachDocSection;
