"use client";

import { useState } from "react";
import { IconAlertCircle, IconBell, IconLoader2, IconSend } from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetMyPlayersForTransferQuery,
  useGetTrainingSessionCoachesQuery,
} from "@/redux/features/academy/academyApi";
import {
  getEvaluationApiError,
  useRemindEvaluationMutation,
  useRequestEvaluationMutation,
} from "@/redux/features/evaluation/evaluationApi";
import type { IAcademyEvaluationRequestItem } from "@/types/evaluation.type";
import { refId } from "@/components/evaluations/evaluationFormat";

export interface RequestEvaluationPrefill {
  playerId?: string | null;
  playerName?: string | null;
  coachId?: string | null;
  coachName?: string | null;
}

interface RequestEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Request again" pre-fills player/coach. Remount (key) the modal to reset. */
  prefill?: RequestEvaluationPrefill;
  /** Open requests from GET /academies/evaluations/dashboard — used to resolve a 409 into a reminder. */
  dueItems: IAcademyEvaluationRequestItem[];
  /** Refetch the dashboard (after a 409 the open request may not be in `dueItems` yet). */
  onConflict?: () => void;
  /** True while the dashboard list is refetching. */
  isRefreshing?: boolean;
}

export const RequestEvaluationModal = ({
  open,
  onOpenChange,
  prefill,
  dueItems,
  onConflict,
  isRefreshing,
}: RequestEvaluationModalProps) => {
  const [playerId, setPlayerId] = useState(prefill?.playerId || "");
  const [coachId, setCoachId] = useState(prefill?.coachId || "");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  /** Set on 409: an open request already exists for this player + coach. */
  const [conflict, setConflict] = useState<{ playerId: string; coachId: string; message: string } | null>(null);

  const { data: playersRes, isLoading: loadingPlayers } = useGetMyPlayersForTransferQuery(undefined, { skip: !open });
  const { data: coachesRes, isLoading: loadingCoaches } = useGetTrainingSessionCoachesQuery(undefined, { skip: !open });
  const [requestEvaluation, { isLoading: isRequesting }] = useRequestEvaluationMutation();
  const [remindEvaluation, { isLoading: isReminding }] = useRemindEvaluationMutation();

  const players = playersRes?.data ?? [];
  const coaches = coachesRes?.data ?? [];

  const prefillPlayerMissing =
    Boolean(prefill?.playerId) && !players.some((p) => (p._id || p.id) === prefill?.playerId);
  const prefillCoachMissing =
    Boolean(prefill?.coachId) && !coaches.some((c) => (c.coachId || c._id) === prefill?.coachId);

  // Derived (not stored) so it follows the refetched dashboard list.
  const openRequest = conflict
    ? dueItems.find(
        (item) => refId(item.playerId) === conflict.playerId && refId(item.coachId) === conflict.coachId
      )
    : undefined;

  const resetConflict = () => {
    setConflict(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!playerId || !coachId) {
      setFormError("Select a player and a coach.");
      return;
    }
    try {
      await requestEvaluation({ playerId, coachId, notes: notes.trim() || undefined }).unwrap();
      onOpenChange(false);
    } catch (err) {
      const { status, message } = getEvaluationApiError(err, "Failed to request evaluation");
      if (status === 409) {
        setConflict({ playerId, coachId, message });
        onConflict?.();
      } else if (status !== 401) {
        // Already toasted by the API layer; keep it visible in the form too (e.g. 400 coach not approved).
        setFormError(message);
      }
    }
  };

  const handleRemind = async () => {
    if (!openRequest) return;
    try {
      await remindEvaluation(openRequest._id).unwrap();
      onOpenChange(false);
    } catch {
      // toasted by the API layer
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#0E0E0E] border-white/20">
        <DialogHeader>
          <DialogTitle className="font-orbitron uppercase tracking-tight text-xl text-white">Request evaluation</DialogTitle>
          <DialogDescription>
            Ask one of your approved coaches to evaluate a player from your academy.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="eval-player">Player</Label>
            <Select
              value={playerId}
              onValueChange={(v) => {
                setPlayerId(v);
                resetConflict();
              }}
            >
              <SelectTrigger id="eval-player" className="w-full">
                <SelectValue placeholder={loadingPlayers ? "Loading players..." : "Select a player"} />
              </SelectTrigger>
              <SelectContent>
                {prefillPlayerMissing && prefill?.playerId && (
                  <SelectItem value={prefill.playerId}>{prefill.playerName || prefill.playerId}</SelectItem>
                )}
                {players.map((p) => {
                  const id = p._id || p.id || "";
                  if (!id) return null;
                  return (
                    <SelectItem key={id} value={id}>
                      {p.name}
                      {p.position ? ` · ${p.position}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {!loadingPlayers && players.length === 0 && (
              <p className="text-xs text-muted-foreground">No players found in your academy.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="eval-coach">Coach</Label>
            <Select
              value={coachId}
              onValueChange={(v) => {
                setCoachId(v);
                resetConflict();
              }}
            >
              <SelectTrigger id="eval-coach" className="w-full">
                <SelectValue placeholder={loadingCoaches ? "Loading coaches..." : "Select a coach"} />
              </SelectTrigger>
              <SelectContent>
                {prefillCoachMissing && prefill?.coachId && (
                  <SelectItem value={prefill.coachId}>{prefill.coachName || prefill.coachId}</SelectItem>
                )}
                {coaches.map((c) => {
                  const id = c.coachId || c._id;
                  if (!id) return null;
                  return (
                    <SelectItem key={id} value={id}>
                      {c.displayName || c.fullName}
                      {!c.displayName && c.title ? ` · ${c.title}` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {!loadingCoaches && coaches.length === 0 && (
              <p className="text-xs text-muted-foreground">No approved coaches found in your academy.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="eval-notes">Notes (optional)</Label>
            <Textarea
              id="eval-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the coach should focus on"
              rows={3}
            />
          </div>

          {formError && (
            <p className="text-sm text-destructive font-bold flex items-center gap-2">
              <IconAlertCircle className="size-4 shrink-0" />
              {formError}
            </p>
          )}

          {conflict && (
            <div className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col gap-2">
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <IconAlertCircle className="size-4 shrink-0 text-destructive" />
                {conflict.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {openRequest
                  ? `An evaluation request is already open for this player and coach${
                      openRequest.reminderCount ? ` (${openRequest.reminderCount} reminder(s) sent)` : ""
                    }. You can send the coach a reminder instead.`
                  : isRefreshing
                    ? "Looking up the open request..."
                    : "The open request isn't in your Due list. Check the Due tab to remind the coach."}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {conflict ? (
            <Button onClick={handleRemind} disabled={!openRequest || isReminding}>
              {isReminding ? <IconLoader2 className="animate-spin" /> : <IconBell />}
              Send reminder
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isRequesting}>
              {isRequesting ? <IconLoader2 className="animate-spin" /> : <IconSend />}
              Request evaluation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
