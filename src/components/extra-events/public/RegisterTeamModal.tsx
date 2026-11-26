"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { IconCircleCheck, IconLoader2, IconPlus, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getExtraEventApiError,
  unwrapList,
  useGetEventBadgePresetsQuery,
  useRegisterEventClubMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IBadgePreset, IPublicEvent } from "@/types/extraEvent.type";
import { formatFee, readSession } from "./eventUtils";

interface RegisterTeamModalProps {
  event: IPublicEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RosterRow {
  key: number;
  fullName: string;
  dateOfBirth: string;
  shirtNo: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

const presetKey = (preset: IBadgePreset) =>
  String(preset.key ?? preset.id ?? preset._id ?? preset.name ?? preset.label ?? "");

const presetTaken = (preset: IBadgePreset) => Boolean(preset.isTaken || preset.taken || preset.isAvailable === false);

/** Image source for a preset: a URL, or inline SVG markup rendered as an <img> data URL (never injected as HTML). */
const presetSrc = (preset: IBadgePreset): string | null => {
  const url = [preset.imageUrl, preset.url].find((v) => typeof v === "string" && v.trim());
  if (url) return url as string;
  const svg = typeof preset.svg === "string" ? preset.svg.trim() : "";
  if (!svg) return null;
  if (svg.startsWith("<")) return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  if (/^(https?:|\/|data:image\/)/.test(svg)) return svg;
  return null;
};

let rowSeq = 0;
const newRow = (): RosterRow => ({ key: ++rowSeq, fullName: "", dateOfBirth: "", shirtNo: "" });

const RegisterTeamForm = ({ event, onClose }: { event: IPublicEvent; onClose: () => void }) => {
  const [session] = useState(readSession);

  const [clubName, setClubName] = useState("");
  const [coachName, setCoachName] = useState(session.role === "coach" ? session.fullName : "");
  const [contactEmail, setContactEmail] = useState(session.email);
  const [contactPerson, setContactPerson] = useState(session.fullName);
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>(() => [newRow(), newRow(), newRow()]);
  const [badgeMode, setBadgeMode] = useState<"preset" | "logo">("preset");
  const [badgePreset, setBadgePreset] = useState<string>("");
  const [logo, setLogo] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const logoPreview = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo]);
  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview]
  );

  const { data: presetsRes, isLoading: presetsLoading, isError: presetsError } = useGetEventBadgePresetsQuery(event._id);
  const presets = useMemo(
    () => unwrapList<IBadgePreset>(presetsRes?.data, ["presets", "badges"]).filter((p) => presetKey(p)),
    [presetsRes]
  );

  const [registerClub, { isLoading }] = useRegisterEventClubMutation();
  const fee = formatFee(event);
  const isPaid = Boolean(event.registrationFee) && fee !== "Free";
  const categories = (event.ageGroup || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const updateRow = (key: number, patch: Partial<RosterRow>) =>
    setRoster((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setFormError("The logo must be an image.");
    if (file.size > MAX_LOGO_BYTES) return setFormError("The logo must be 5 MB or smaller.");
    setFormError(null);
    setLogo(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!clubName.trim()) return setFormError("Club / team name is required.");
    if (!coachName.trim()) return setFormError("Coach name is required.");
    if (!contactEmail.trim() || !EMAIL_RE.test(contactEmail.trim()))
      return setFormError("A valid contact email is required.");

    const players = roster
      .filter((r) => r.fullName.trim())
      .map((r) => {
        const shirt = r.shirtNo.trim();
        return {
          fullName: r.fullName.trim(),
          ...(r.dateOfBirth ? { dateOfBirth: r.dateOfBirth } : {}),
          ...(shirt ? { shirtNo: /^\d+$/.test(shirt) ? Number(shirt) : shirt } : {}),
        };
      });
    if (players.length === 0) return setFormError("Add at least one player to the roster.");

    if (badgeMode === "logo" && !logo) return setFormError("Upload your club logo or pick a preset badge.");
    if (badgeMode === "preset" && !badgePreset) return setFormError("Pick a badge or upload your club logo.");

    const body = new FormData();
    body.append("clubName", clubName.trim());
    body.append("coachName", coachName.trim());
    body.append("contactEmail", contactEmail.trim());
    if (contactPerson.trim()) body.append("contactPerson", contactPerson.trim());
    if (contactPhone.trim()) body.append("contactPhone", contactPhone.trim());
    if (category.trim()) body.append("category", category.trim());
    body.append("roster", JSON.stringify(players));
    if (badgeMode === "logo" && logo) body.append("logo", logo);
    else body.append("badgePreset", badgePreset);
    // Never send paymentMethod from the public form (MANUAL is for the organising academy only).

    try {
      const res = await registerClub({ eventId: event._id, body }).unwrap();
      const result = res.data;
      if (result?.checkoutUrl) {
        setIsRedirecting(true);
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result?.requiresPayment) {
        setFormError("Payment could not be started. Please try again in a moment.");
        return;
      }
      const message = result?.message || res.message || "Your team is registered.";
      setSuccessMessage(message);
      toast.success(message);
    } catch (err) {
      const { message } = getExtraEventApiError(err, "Team registration failed. Please try again.");
      setFormError(message);
      toast.error(message);
    }
  };

  if (successMessage) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <IconCircleCheck className="size-14 text-primary" />
        <div className="flex flex-col gap-1">
          <DialogTitle>Team registered</DialogTitle>
          <DialogDescription>{successMessage}</DialogDescription>
        </div>
        <Button onClick={onClose}>Done</Button>
      </div>
    );
  }

  const busy = isLoading || isRedirecting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Register your team</DialogTitle>
        <DialogDescription>
          {event.eventName}
          {isPaid ? ` · Entry fee ${fee}, paid by secure checkout.` : " · Free entry."}
        </DialogDescription>
      </DialogHeader>

      {!session.loggedIn && (
        <p className="rounded-lg border border-border p-3 text-xs text-foreground/70">
          Tip: log in before registering so your team appears under &quot;My events&quot;.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold">Team details</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-name">Club / team name *</Label>
            <Input id="club-name" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-coach">Coach name *</Label>
            <Input id="club-coach" value={coachName} onChange={(e) => setCoachName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-email">Contact email *</Label>
            <Input
              id="club-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-person">Contact person</Label>
            <Input id="club-person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-phone">Contact phone</Label>
            <Input
              id="club-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="club-category">Category</Label>
            <Input
              id="club-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={categories[0] ? `e.g. ${categories[0]}` : "e.g. U-14"}
              list="club-category-options"
            />
            {categories.length > 0 && (
              <datalist id="club-category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Roster ({roster.filter((r) => r.fullName.trim()).length})</h4>
          <Button type="button" variant="outline" size="sm" onClick={() => setRoster((rows) => [...rows, newRow()])}>
            <IconPlus /> Add player
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="hidden grid-cols-[1fr_9rem_5rem_2.25rem] gap-2 text-xs text-foreground/60 sm:grid">
            <span>Full name</span>
            <span>Date of birth</span>
            <span>Shirt no.</span>
            <span />
          </div>
          {roster.map((row, index) => (
            <div key={row.key} className="grid grid-cols-[1fr_2.25rem] gap-2 sm:grid-cols-[1fr_9rem_5rem_2.25rem]">
              <Input
                value={row.fullName}
                onChange={(e) => updateRow(row.key, { fullName: e.target.value })}
                placeholder={`Player ${index + 1}`}
                aria-label={`Player ${index + 1} full name`}
              />
              <Input
                type="date"
                value={row.dateOfBirth}
                onChange={(e) => updateRow(row.key, { dateOfBirth: e.target.value })}
                aria-label={`Player ${index + 1} date of birth`}
                className="col-start-1 sm:col-start-auto"
              />
              <Input
                value={row.shirtNo}
                onChange={(e) => updateRow(row.key, { shirtNo: e.target.value })}
                placeholder="#"
                inputMode="numeric"
                aria-label={`Player ${index + 1} shirt number`}
                className="col-start-1 sm:col-start-auto"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="row-start-1 col-start-2 sm:row-start-auto sm:col-start-auto"
                onClick={() => setRoster((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== row.key) : rows))}
                disabled={roster.length <= 1}
                aria-label={`Remove player ${index + 1}`}
              >
                <IconTrash />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">Club badge *</h4>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            <Button
              type="button"
              size="xs"
              variant={badgeMode === "preset" ? "default" : "ghost"}
              onClick={() => setBadgeMode("preset")}
            >
              Pick a badge
            </Button>
            <Button
              type="button"
              size="xs"
              variant={badgeMode === "logo" ? "default" : "ghost"}
              onClick={() => setBadgeMode("logo")}
            >
              Upload logo
            </Button>
          </div>
        </div>

        {badgeMode === "preset" ? (
          presetsLoading ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : presetsError || presets.length === 0 ? (
            <p className="text-xs text-foreground/60">
              No preset badges are available for this event. Please upload your club logo instead.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {presets.map((preset) => {
                const key = presetKey(preset);
                const taken = presetTaken(preset);
                const src = presetSrc(preset);
                const label = String(preset.label || preset.name || key);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={taken}
                    onClick={() => setBadgePreset(key)}
                    title={taken ? `${label} (taken)` : label}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-border p-1.5 transition-colors",
                      badgePreset === key ? "border-primary ring-2 ring-primary/40" : "hover:border-primary/50",
                      taken && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {src ? (
                      <Image src={src} alt={label} width={48} height={48} unoptimized className="size-10 object-contain" />
                    ) : (
                      <span className="text-[10px] font-semibold">{label.slice(0, 3).toUpperCase()}</span>
                    )}
                    <span className="w-full truncate text-center text-[10px] text-foreground/60">
                      {taken ? "Taken" : label}
                    </span>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex items-center gap-3">
            {logoPreview ? (
              <div className="relative size-16 overflow-hidden rounded-lg border border-border">
                <Image src={logoPreview} alt="Club logo preview" fill unoptimized className="object-contain" />
              </div>
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg border border-dashed border-border text-foreground/40">
                <IconUpload className="size-5" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label className="cursor-pointer">
                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:border-primary/50">
                  <IconUpload className="size-4" />
                  {logo ? "Change logo" : "Choose image"}
                </span>
                <input type="file" accept="image/*" className="sr-only" onChange={handleLogo} />
              </Label>
              {logo && (
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-foreground/60 hover:text-destructive"
                  onClick={() => setLogo(null)}
                >
                  <IconX className="size-3" /> <span className="max-w-[12rem] truncate">{logo.name}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <IconLoader2 className="animate-spin" />}
          {isRedirecting ? "Redirecting to payment…" : isPaid ? `Continue to payment (${fee})` : "Register team"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const RegisterTeamModal = ({ event, open, onOpenChange }: RegisterTeamModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      {open && <RegisterTeamForm event={event} onClose={() => onOpenChange(false)} />}
    </DialogContent>
  </Dialog>
);

export default RegisterTeamModal;
