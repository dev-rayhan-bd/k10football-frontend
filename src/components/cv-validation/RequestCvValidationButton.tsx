"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconLoader2, IconSearch, IconShieldCheck, IconUsers } from "@tabler/icons-react";
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
import {
  getApiError,
  useGetCoachDropdownQuery,
  useRequestCvValidationMutation,
} from "@/redux/features/cvValidation/cvValidationApi";
import type { ICoachDropdownItem } from "@/types/cvValidation.type";
import ChatAvatar from "@/components/chat/ChatAvatar";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;

/** "" / null → "—" (unknown, never invented). */
const show = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : String(value));

const coachSubtitle = (coach: ICoachDropdownItem) =>
  [
    coach.title || null,
    coach.academyName || null,
    coach.licenseStatus || null,
    coach.yearsExperience !== undefined && coach.yearsExperience !== "" ? `${coach.yearsExperience} yrs` : null,
  ]
    .filter(Boolean)
    .join(" • ") || "—";

interface RequestCvValidationButtonProps {
  /** Parent flow: the linked child's player id. Omit for the logged-in player. */
  playerId?: string;
  /**
   * "reassign": a PAID request lost its coach (coach left the academy). Picking a new coach
   * moves the request — the server returns checkoutUrl: null and no payment is taken.
   */
  mode?: "request" | "reassign";
  /** Button text (defaults depend on mode). */
  label?: string;
  /** Open the picker immediately (e.g. after a payment that needs a new coach). */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Coach picker (GET /coaches/dropdown — academy-verified coaches only) → POST
 * /players/me/request-cv-validation. Normal requests redirect to Stripe ($24, price set by the
 * server); a reassignment (checkoutUrl null) just moves the paid request.
 */
const RequestCvValidationButton = ({
  playerId,
  mode = "request",
  label,
  defaultOpen = false,
  className,
}: RequestCvValidationButtonProps) => {
  const isReassign = mode === "reassign";
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const {
    data: coachesResponse,
    isFetching: isCoachesLoading,
    isError: isCoachesError,
    error: coachesError,
  } = useGetCoachDropdownQuery(search ? { search } : undefined, { skip: !isOpen });
  const [requestCvValidation, { isLoading: isRequesting }] = useRequestCvValidationMutation();
  const coaches = coachesResponse?.data ?? [];

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value.trim()), SEARCH_DEBOUNCE_MS);
  };

  const closeModal = () => {
    if (isRequesting) return;
    setIsOpen(false);
    setSearchInput("");
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
        // Paid request moved to the new coach — no Stripe. The CV refetches via tag invalidation.
        toast.success(res?.message || "Your request was moved to the new coach. No extra payment needed.");
        setIsOpen(false);
        setSelectedCoachId("");
        return;
      }
      toast.loading("Redirecting to secure payment...", { id: "cv-validation-checkout" });
      window.location.href = checkoutUrl;
    } catch (err) {
      const { status, message } = getApiError(err, "Failed to request CV validation");
      if (status === 401) return; // apiSlice handles session expiry
      if (status === 409) {
        setIsOpen(false);
        toast.info(message || "A paid validation request is already waiting for the coach.");
        return;
      }
      toast.error(message);
    }
  };

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
        <IconShieldCheck className="size-4" /> {label || (isReassign ? "Choose new coach" : "Request Validation ($24)")}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : closeModal())}>
        <DialogContent className="sm:max-w-lg bg-[#111111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron uppercase tracking-tight">
              {isReassign ? "Choose a new coach" : "Request CV validation"}
            </DialogTitle>
            <DialogDescription>
              {isReassign
                ? "Your payment is kept. Pick an academy-verified coach and your request moves to them. No extra payment."
                : "Choose an academy-verified coach. You'll pay a one-time $24 fee, then the coach is notified. The validation is valid for 1 year."}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search coach or academy..."
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {isCoachesLoading && coaches.length === 0 ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)
            ) : isCoachesError ? (
              <p className="py-8 text-center text-sm text-destructive">
                {getApiError(coachesError, "Failed to load coaches.").message}
              </p>
            ) : coaches.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                <IconUsers className="size-6" />
                <p className="text-sm">{search ? "No coaches match your search." : "No academy-verified coaches available yet."}</p>
              </div>
            ) : (
              coaches.map((coach) => {
                const isSelected = coach._id === selectedCoachId;
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
                    <ChatAvatar src={coach.avatar} name={coach.name} className="size-10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{show(coach.name)}</p>
                      <p className="truncate text-xs text-muted-foreground">{coachSubtitle(coach)}</p>
                    </div>
                    {coach.overallRatingScore !== undefined && coach.overallRatingScore !== "" && (
                      <span className="shrink-0 font-orbitron text-sm font-black text-white/80">{coach.overallRatingScore}</span>
                    )}
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
              {isReassign ? "Move my request" : "Continue to payment ($24)"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestCvValidationButton;
