"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetPolicyByTypeQuery } from "@/redux/features/content/contentApi";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, FileText, Loader2, RefreshCw } from "lucide-react";

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  isAccepted: boolean;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  isAccepted,
}) => {
  const { data: response, isLoading, isError, refetch } =
    useGetPolicyByTypeQuery("TERMS_AND_CONDITIONS", {
      skip: !isOpen,
    });

  const policy = response?.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-[#0d1210] border-white/15 text-white shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="size-4" /> Legal & Compliance Document
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-white leading-tight">
            {policy?.title || "Terms & Conditions, Data Protection & Media Consent"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-2">
            <span>Please carefully read and review the policy agreement before proceeding.</span>
            {policy?.version && (
              <Badge variant="outline" className="border-primary/40 text-primary text-[10px] px-2 py-0">
                v{policy.version}
              </Badge>
            )}
            {policy?.effectiveDate && (
              <span className="text-[11px] text-zinc-400">
                Effective: {formatDate(policy.effectiveDate)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-[300px] max-h-[58vh] overflow-y-auto p-5 sm:p-6 custom-scrollbar text-zinc-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs text-zinc-400">Loading Terms & Conditions document...</p>
            </div>
          ) : isError || !policy?.content ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-center p-4">
              <p className="text-sm text-zinc-400">
                Unable to load the policy document at this moment.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2 text-xs"
              >
                <RefreshCw className="size-3.5" /> Try Again
              </Button>
            </div>
          ) : (
            <div
              className="policy-html-content space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-300
                [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:uppercase [&_h2]:tracking-wider
                [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-primary [&_h3]:mt-4 [&_h3]:mb-1.5
                [&_h4]:text-xs sm:[&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-zinc-100 [&_h4]:mt-4 [&_h4]:mb-1
                [&_h5]:text-xs sm:[&_h5]:text-xs [&_h5]:font-semibold [&_h5]:text-zinc-200 [&_h5]:mt-3 [&_h5]:mb-1
                [&_p]:mb-2.5 [&_p]:text-zinc-300 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1.5
                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1.5
                [&_li]:text-zinc-300 [&_li]:leading-normal
                [&_strong]:text-white [&_strong]:font-semibold
                [&_a]:text-primary [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: policy.content }}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 sm:p-5 border-t border-white/10 shrink-0 bg-[#0a0f0d] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            {isAccepted ? (
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <CheckCircle2 className="size-4 text-primary" /> You have accepted these terms
              </span>
            ) : (
              <span>Acknowledgment is required to complete registration.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-xs border-white/15 hover:bg-white/5"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-black shadow-[0_0_15px_-3px_rgba(0,255,98,0.5)] cursor-pointer"
            >
              {isAccepted ? "Accepted" : "I Acknowledge & Accept"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsModal;

