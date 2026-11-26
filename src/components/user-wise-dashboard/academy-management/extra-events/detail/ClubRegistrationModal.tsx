"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconCreditCard,
  IconLoader2,
  IconPlus,
  IconShield,
  IconTrash,
  IconUpload,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  getExtraEventApiError,
  unwrapList,
  useGetEventBadgePresetsQuery,
  useRegisterEventClubMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IAcademyEventDetail, IBadgePreset } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";

interface RosterDraft {
  fullName: string;
  dateOfBirth: string;
  shirtNo: string;
  photoPreview?: string;
}

interface ClubRegistrationModalProps {
  event: IAcademyEventDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClubRegistrationModal: React.FC<ClubRegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Club Info & Badge Preset
  const [clubName, setClubName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const categories = useMemo(
    () =>
      (event.ageGroup || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    [event.ageGroup]
  );
  const [category, setCategory] = useState(categories[0] || "");
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  // Step 2: Squad Roster
  const [roster, setRoster] = useState<RosterDraft[]>([
    { fullName: "", dateOfBirth: "", shirtNo: "1" },
  ]);

  const { data: presetsRes, isLoading: isPresetsLoading } = useGetEventBadgePresetsQuery(event._id, {
    skip: !isOpen || !event._id,
  });
  const presets = useMemo(
    () => unwrapList<IBadgePreset>(presetsRes?.data, ["presets", "badges"]),
    [presetsRes]
  );

  const [registerClub, { isLoading: isSubmitting }] = useRegisterEventClubMutation();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setSelectedPreset("");
    setLogoPreview(URL.createObjectURL(file));
  };

  const handlePlayerPhoto = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRoster((prev) => prev.map((p, i) => (i === idx ? { ...p, photoPreview: url } : p)));
  };

  const addPlayerRow = () => {
    setRoster((prev) => [...prev, { fullName: "", dateOfBirth: "", shirtNo: String(prev.length + 1) }]);
  };

  const removePlayerRow = (idx: number) => {
    setRoster((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  };

  const updatePlayer = (idx: number, field: keyof RosterDraft, value: string) => {
    setRoster((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const canProceedStep1 = Boolean(clubName.trim() && coachName.trim() && contactEmail.trim());
  const validRoster = roster.filter((p) => p.fullName.trim().length > 0);
  const canProceedStep2 = validRoster.length > 0;

  const handleSubmit = async () => {
    if (!canProceedStep1 || !canProceedStep2 || isSubmitting) return;

    const formData = new FormData();
    formData.append("clubName", clubName.trim());
    formData.append("coachName", coachName.trim());
    formData.append("contactEmail", contactEmail.trim());
    if (contactPhone.trim()) formData.append("contactPhone", contactPhone.trim());
    if (category) formData.append("category", category);
    if (logoFile) {
      formData.append("logo", logoFile);
    } else if (selectedPreset) {
      formData.append("badgePreset", selectedPreset);
    }

    const cleanRoster = validRoster.map((p) => ({
      fullName: p.fullName.trim(),
      ...(p.dateOfBirth ? { dateOfBirth: p.dateOfBirth } : {}),
      ...(p.shirtNo ? { shirtNo: p.shirtNo } : {}),
    }));
    formData.append("roster", JSON.stringify(cleanRoster));

    try {
      const res = await registerClub({ eventId: event._id, body: formData }).unwrap();
      const checkoutUrl = res?.data?.checkoutUrl;
      if (checkoutUrl && typeof window !== "undefined") {
        toast.success("Redirecting to Stripe Checkout...");
        window.location.href = checkoutUrl;
        return;
      }
      toast.success(res?.message || "Club registered successfully!");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to register club").message);
    }
  };

  const feeText =
    event.feeFormatted ||
    (event.registrationFee && Number(event.registrationFee) > 0
      ? `$${Number(event.registrationFee).toFixed(2)}`
      : "Free");

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`Register Club — ${event.eventName}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: "1. Club & Badge" },
            { num: 2, label: "2. Squad Roster" },
            { num: 3, label: "3. Payment" },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num === 1) setStep(1);
                else if (s.num === 2 && canProceedStep1) setStep(2);
                else if (s.num === 3 && canProceedStep1 && canProceedStep2) setStep(3);
              }}
              className={cn(
                "py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all font-orbitron cursor-pointer",
                step === s.num
                  ? "bg-[#E31B23] text-white border-[#E31B23]"
                  : step > s.num
                    ? "bg-[#00FF62]/10 text-[#00FF62] border-[#00FF62]/30"
                    : "bg-white/5 text-white/40 border-white/10"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* STEP 1: Club Info + Badge Preset */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Club Name *
                </label>
                <input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="e.g. FC Barcelona Youth"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Head Coach Name *
                </label>
                <input
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  placeholder="e.g. Marco Silva"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Contact Email *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="club@example.com"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Contact Phone
                </label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 555 0100"
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Category / Age Group
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Badge Presets */}
            <div className="space-y-2.5 bg-black/40 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  Select Club Badge Preset or Upload Logo
                </span>
                <label className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#00FF62] cursor-pointer hover:underline">
                  <IconUpload size={14} /> Upload Custom
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>

              {logoPreview && (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
                  <Image src={logoPreview} alt="Custom logo" width={40} height={40} className="size-10 rounded-lg object-cover" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{logoFile?.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview("");
                    }}
                    className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {isPresetsLoading ? (
                <div className="flex items-center gap-2 text-xs text-white/40 py-2">
                  <IconLoader2 size={14} className="animate-spin" /> Loading badge presets...
                </div>
              ) : presets.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {presets.map((preset) => {
                    const key = preset.key || preset.id || preset._id || preset.name || "";
                    const img = preset.imageUrl || preset.url;
                    const active = selectedPreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={preset.isTaken}
                        onClick={() => {
                          setSelectedPreset(key);
                          setLogoFile(null);
                          setLogoPreview("");
                        }}
                        className={cn(
                          "p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer",
                          active
                            ? "border-[#00FF62] bg-[#00FF62]/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10",
                          preset.isTaken && "opacity-30 cursor-not-allowed"
                        )}
                      >
                        {img ? (
                          <Image src={img} alt={preset.label || key} width={32} height={32} className="size-8 object-contain" />
                        ) : (
                          <IconShield size={24} className="text-white/60" />
                        )}
                        <span className="text-[8px] font-bold text-white/60 truncate w-full text-center">
                          {preset.label || preset.name || key}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-white/40">No badge presets configured — you may upload a custom logo.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl cursor-pointer font-orbitron"
              >
                Next: Squad Roster
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Squad Roster */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white/70 flex items-center gap-2">
                <IconUsers size={16} className="text-[#E31B23]" /> Players ({validRoster.length})
              </span>
              <button
                type="button"
                onClick={addPlayerRow}
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/15 text-white px-3 py-2 rounded-xl cursor-pointer"
              >
                <IconPlus size={14} /> Add Player
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {roster.map((player, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 border border-white/10 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                >
                  <label className="sm:col-span-2 flex items-center justify-center size-10 rounded-full bg-white/5 border border-white/10 overflow-hidden cursor-pointer mx-auto">
                    {player.photoPreview ? (
                      <Image src={player.photoPreview} alt="Player" width={40} height={40} className="size-full object-cover" />
                    ) : (
                      <IconUpload size={14} className="text-white/40" />
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePlayerPhoto(idx, e)} />
                  </label>
                  <input
                    value={player.fullName}
                    onChange={(e) => updatePlayer(idx, "fullName", e.target.value)}
                    placeholder="Player full name *"
                    className="sm:col-span-5 bg-[#111] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="date"
                    value={player.dateOfBirth}
                    onChange={(e) => updatePlayer(idx, "dateOfBirth", e.target.value)}
                    className="sm:col-span-3 bg-[#111] border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white"
                  />
                  <div className="sm:col-span-2 flex items-center gap-1.5">
                    <input
                      value={player.shirtNo}
                      onChange={(e) => updatePlayer(idx, "shirtNo", e.target.value)}
                      placeholder="#"
                      className="w-full bg-[#111] border border-white/15 rounded-xl px-2 py-2 text-xs text-white text-center"
                    />
                    {roster.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayerRow(idx)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <IconTrash size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                className="bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl cursor-pointer font-orbitron"
              >
                Next: Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment & Confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Club</span>
                <span className="font-bold text-white">{clubName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Coach</span>
                <span className="font-bold text-white">{coachName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Squad Size</span>
                <span className="font-bold text-white">{validRoster.length} Players</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white/60">Entry Fee</span>
                <span className="text-lg font-black text-[#00FF62] font-orbitron">{feeText}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-[#00FF62] hover:bg-[#00e056] text-black text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl cursor-pointer font-orbitron flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconCreditCard size={16} />
                )}
                {isSubmitting ? "Submitting..." : Number(event.registrationFee) > 0 ? "Proceed to Stripe Payment" : "Complete Registration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardModal>
  );
};
