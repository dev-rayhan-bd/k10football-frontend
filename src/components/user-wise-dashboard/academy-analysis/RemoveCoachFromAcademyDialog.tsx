"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconLoader2, IconUserMinus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRemoveCoachFromAcademyMutation } from "@/redux/features/academy/academyApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";

const EVALUATION_REQUESTS_URL = "/dashboard/academy/management/evaluation-requests";

interface RemoveCoachFromAcademyDialogProps {
  /** CoachProfile _id or AcademyCoach affiliation _id. null → closed. */
  coach: { id: string; name: string } | null;
  onClose: () => void;
  /** Called after a successful removal (e.g. to refetch a roster that isn't tag-driven). */
  onRemoved?: () => void;
}

/** Release a coach from the academy: confirm → DELETE /academies/coaches/:id → report side effects. */
const RemoveCoachFromAcademyDialog = ({ coach, onClose, onRemoved }: RemoveCoachFromAcademyDialogProps) => {
  const router = useRouter();
  const [removeCoach, { isLoading }] = useRemoveCoachFromAcademyMutation();

  const handleRemove = async () => {
    if (!coach || isLoading) return;
    try {
      const res = await removeCoach({ affiliationId: coach.id }).unwrap();
      toast.success(res?.message || "Coach removed from academy successfully");

      const cancelled = res?.data?.cancelledEvaluationRequests ?? 0;
      if (cancelled > 0) {
        toast.warning(
          `${cancelled} evaluation request${cancelled === 1 ? " was" : "s were"} cancelled — request ${cancelled === 1 ? "it" : "them"} again with another coach`,
          {
            duration: 10000,
            action: { label: "Evaluation requests", onClick: () => router.push(EVALUATION_REQUESTS_URL) },
          }
        );
      }
      onRemoved?.();
      onClose();
    } catch (err) {
      const { status, message } = getApiError(err, "Failed to remove coach from academy");
      if (status === 401) return; // apiSlice handles session expiry
      toast.error(message);
    }
  };

  return (
    <Dialog open={Boolean(coach)} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-orbitron uppercase tracking-tight">
            <IconUserMinus className="size-5 text-destructive" /> Remove from academy
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Remove <span className="font-bold text-white">{coach?.name || "this coach"}</span>? They will be taken off all
            teams, open evaluation requests assigned to them will be cancelled, and players waiting on their CV validation
            will be asked to pick another coach.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Past evaluations, validated CVs and commissions are kept. The coach can request to join an academy again later.
        </p>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleRemove} disabled={isLoading} className="gap-2">
            {isLoading && <IconLoader2 className="size-4 animate-spin" />}
            Remove coach
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCoachFromAcademyDialog;
