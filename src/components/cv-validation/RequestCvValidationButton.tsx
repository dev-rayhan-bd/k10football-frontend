"use client";

import { useMemo, useState } from "react";
import { IconCheck, IconClock, IconLoader2, IconSearch, IconShieldCheck, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";
import { getApiError, useRequestCvValidationMutation } from "@/redux/features/cvValidation/cvValidationApi";
import { ICoachListItem } from "@/types/coach.type";
import ChatAvatar from "@/components/chat/ChatAvatar";
import { cn } from "@/lib/utils";

const getCoachName = (coach: ICoachListItem) =>
  coach.fullName || (typeof coach.userId === "object" ? coach.userId?.name : "") || "Coach";

const getCoachAvatar = (coach: ICoachListItem) =>
  coach.profileImage ||
  coach.cardStats?.cardImage ||
  (typeof coach.userId === "object" ? coach.userId?.avatar : "") ||
  "";

const getCoachClub = (coach: ICoachListItem) =>
  coach.currentClub ||
  (Array.isArray(coach.clubHistory) ? coach.clubHistory.find((c: { isCurrent?: boolean }) => c.isCurrent)?.clubName : "") ||
  "";

interface RequestCvValidationButtonProps {
  /** Parent flow: the linked child's player id. Omit for the logged-in player. */
  playerId?: string;
  className?: string;
}

/**
 * "Request CV validation": pick an academy-approved coach, then pay the fixed $24 fee on Stripe.
 * The price is set by the server — it is never sent from here.
 */
const RequestCvValidationButton = ({ playerId, className }: RequestCvValidationButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  // 409 → a paid request is already waiting for its coach (tracked per player).
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const playerKey = playerId || "me";
  const isWaiting = waitingFor === playerKey;

  const { data: coachesResponse, isLoading: isCoachesLoading, isError: isCoachesError } = useGetAllCoachesQuery(
    { isVerifiedByAcademy: true, limit: 100 },
    { skip: !isOpen }
  );
  const [requestCvValidation, { isLoading: isRequesting }] = useRequestCvValidationMutation();

  const coaches = useMemo(() => {
    const list = coachesResponse?.data || [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter((coach) =>
      [getCoachName(coach), getCoachClub(coach)].some((v) => v.toLowerCase().includes(term))
    );
  }, [coachesResponse, search]);

  const closeModal = () => {
    if (isRequesting) return;
    setIsOpen(false);
    setSearch("");
    setSelectedCoachId("");
  };

  const handleRequest = async () => {
    if (!selectedCoachId) return;
    try {
      const res = await requestCvValidation(
        playerId ? { coachId: selectedCoachId, playerId } : { coachId: selectedCoachId }
      ).unwrap();
      const checkoutUrl = res?.data?.checkoutUrl;
      if (!checkoutUrl) {
        toast.error(res?.message || "Could not start the payment. Please try again.");
        return;
      }
      toast.loading("Redirecting to secure payment...", { id: "cv-validation-checkout" });
      window.location.href = checkoutUrl;
    } catch (err) {
      const { status, message } = getApiError(err, "Failed to request CV validation");
      if (status === 401) return; // apiSlice handles session expiry
      if (status === 409) {
        setWaitingFor(playerKey);
        setIsOpen(false);
        toast.info(message || "A paid validation request is already waiting for the coach.");
        return;
      }
      toast.error(message);
    }
  };

  if (isWaiting) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground",
          className
        )}
      >
        <IconClock className="size-4" /> Waiting for coach
      </div>
    );
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 rounded-xl font-black uppercase tracking-widest text-[10px]",
          className
        )}
      >
        <IconShieldCheck className="size-4" /> Request CV validation
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : closeModal())}>
        <DialogContent className="sm:max-w-lg bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron uppercase tracking-tight">Request CV validation</DialogTitle>
            <DialogDescription>
              Choose an academy-approved coach. You&apos;ll pay a one-time $24 fee, then the coach is notified.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coach or club..."
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {isCoachesLoading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)
            ) : isCoachesError ? (
              <p className="py-8 text-center text-sm text-destructive">Failed to load coaches.</p>
            ) : coaches.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <IconUsers className="size-6" />
                <p className="text-sm">
                  {search ? "No coaches match your search." : "No academy-approved coaches available yet."}
                </p>
              </div>
            ) : (
              coaches.map((coach) => {
                const isSelected = coach._id === selectedCoachId;
                const name = getCoachName(coach);
                const club = getCoachClub(coach);
                return (
                  <button
                    key={coach._id}
                    type="button"
                    onClick={() => setSelectedCoachId(coach._id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                      isSelected ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <ChatAvatar src={getCoachAvatar(coach)} name={name} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[club, coach.licenseStatus].filter(Boolean).join(" • ") || "Coach"}
                      </p>
                    </div>
                    {isSelected && <IconCheck className="size-5 shrink-0 text-primary" />}
                  </button>
                );
              })
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isRequesting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRequest} disabled={!selectedCoachId || isRequesting} className="gap-2">
              {isRequesting && <IconLoader2 className="size-4 animate-spin" />}
              Continue to payment ($24)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestCvValidationButton;
