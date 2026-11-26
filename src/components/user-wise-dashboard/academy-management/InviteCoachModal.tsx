"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconLoader2, IconMail, IconSearch, IconSend, IconUsers } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatAvatar from "@/components/chat/ChatAvatar";
import { useInviteAcademyCoachMutation } from "@/redux/features/academy/academyApi";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";
import { ACADEMY_COACH_ROLES } from "@/types/academy.type";
import type { ICoachListItem } from "@/types/coach.type";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface InviteCoachTarget {
  coachId: string;
  name: string;
  avatar?: string;
}

interface InviteCoachModalProps {
  /** Row invite: the coach is already known. Omit for the top "Invite coach" button. */
  coach?: InviteCoachTarget | null;
  onClose: () => void;
}

const coachName = (coach: ICoachListItem) =>
  coach.fullName || (typeof coach.userId === "object" ? coach.userId?.name : "") || "Coach";

const coachAvatar = (coach: ICoachListItem) =>
  coach.profileImage || (typeof coach.userId === "object" ? coach.userId?.avatar : "") || "";

/** Mounted only while open, so every open starts from a clean form. */
const InviteCoachModal = ({ coach, onClose }: InviteCoachModalProps) => {
  const [mode, setMode] = useState<"search" | "email">("search");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InviteCoachTarget | null>(coach ?? null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("Assistant Coach");
  const [message, setMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const [inviteCoach, { isLoading }] = useInviteAcademyCoachMutation();
  const { data: coachesRes, isFetching: isSearching } = useGetAllCoachesQuery(
    { searchTerm: search, limit: 10 },
    { skip: Boolean(coach) || mode !== "search" || !search }
  );
  const results = coachesRes?.data ?? [];

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value.trim()), SEARCH_DEBOUNCE_MS);
  };

  const trimmedEmail = email.trim();
  const canSubmit = mode === "email" && !coach ? EMAIL_PATTERN.test(trimmedEmail) : Boolean(selected);

  const handleSubmit = async () => {
    if (!canSubmit || isLoading) return;
    const target = mode === "email" && !coach ? { coachEmail: trimmedEmail } : { coachId: selected!.coachId };
    try {
      const res = await inviteCoach({
        ...target,
        role,
        ...(message.trim() ? { message: message.trim() } : {}),
      }).unwrap();
      toast.success(res?.message || "Invitation sent");
      onClose();
    } catch (err) {
      const { status, message: errorMessage } = getApiError(err, "Failed to send the invitation");
      if (status === 401) return; // apiSlice handles session expiry
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-orbitron uppercase tracking-tight">
            <IconSend className="size-5 text-primary" /> Invite coach
          </DialogTitle>
          <DialogDescription>
            The coach gets an invitation. Once they accept, they become an approved (academy-verified) coach of your
            academy and can validate player CVs.
          </DialogDescription>
        </DialogHeader>

        {coach ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <ChatAvatar src={coach.avatar} name={coach.name} className="size-10" />
            <span className="truncate text-sm font-bold">{coach.name}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { key: "search", label: "Find a coach", icon: IconSearch },
                  { key: "email", label: "By email", icon: IconMail },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  type="button"
                  variant={mode === key ? "default" : "outline"}
                  onClick={() => setMode(key)}
                  className="gap-2"
                >
                  <Icon className="size-4" /> {label}
                </Button>
              ))}
            </div>

            {mode === "email" ? (
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@example.com"
                className="border-white/10 bg-white/5"
              />
            ) : (
              <>
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search coach by name..."
                    className="border-white/10 bg-white/5 pl-9"
                  />
                </div>
                <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {!search ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">Type a name to find a coach.</p>
                  ) : isSearching && results.length === 0 ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />)
                  ) : results.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
                      <IconUsers className="size-5" />
                      <p className="text-xs">No coaches found. Try inviting by email.</p>
                    </div>
                  ) : (
                    results.map((item) => {
                      const isSelected = selected?.coachId === item._id;
                      const name = coachName(item);
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => setSelected({ coachId: item._id, name, avatar: coachAvatar(item) })}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                            isSelected ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <ChatAvatar src={coachAvatar(item)} name={name} className="size-9" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[item.title, item.currentClub].filter(Boolean).join(" • ") || "—"}
                            </p>
                          </div>
                          {isSelected && <IconCheck className="size-5 shrink-0 text-primary" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</span>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-full border-white/10 bg-white/5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMY_COACH_ROLES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message (optional)</span>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a note for the coach..."
            className="min-h-20 border-white/10 bg-white/5"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isLoading} className="gap-2">
            {isLoading ? <IconLoader2 className="size-4 animate-spin" /> : <IconSend className="size-4" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCoachModal;
