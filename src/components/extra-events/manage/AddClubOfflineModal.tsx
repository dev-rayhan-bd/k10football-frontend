"use client";

import React, { useState } from "react";
import Image from "next/image";
import { IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { getExtraEventApiError, useRegisterEventClubMutation } from "@/redux/features/extraEvent/extraEventApi";
import { cn } from "@/lib/utils";
import { CLUB_PRESET_LOGOS } from "@/components/user-wise-dashboard/academy-management/extra-events/extra-events.constants";
import { ActionButton, Field, fieldClass } from "./ManageUi";

interface RosterRow {
  key: number;
  fullName: string;
  dateOfBirth: string;
  shirtNo: string;
}

let rowKey = 0;
const newRow = (): RosterRow => ({ key: ++rowKey, fullName: "", dateOfBirth: "", shirtNo: "" });

/** Organising academy adds a club that paid offline (paymentMethod MANUAL). */
export const AddClubOfflineModal = ({
  eventId,
  defaultCategory,
  onClose,
}: {
  eventId: string;
  defaultCategory?: string;
  onClose: () => void;
}) => {
  const [registerClub, { isLoading }] = useRegisterEventClubMutation();
  const [clubName, setClubName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [category, setCategory] = useState(defaultCategory ?? "");
  const [badgePreset, setBadgePreset] = useState<string>(CLUB_PRESET_LOGOS[0].id);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [roster, setRoster] = useState<RosterRow[]>(() => [newRow()]);

  const updateRow = (key: number, patch: Partial<RosterRow>) =>
    setRoster((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleSubmit = async () => {
    if (!clubName.trim()) return toast.error("Club name is required");
    if (!coachName.trim()) return toast.error("Coach name is required");
    if (!contactEmail.trim()) return toast.error("Contact email is required");

    const players = roster
      .filter((r) => r.fullName.trim())
      .map((r) => ({
        fullName: r.fullName.trim(),
        ...(r.dateOfBirth ? { dateOfBirth: r.dateOfBirth } : {}),
        ...(r.shirtNo.trim() ? { shirtNo: Number(r.shirtNo) || r.shirtNo.trim() } : {}),
      }));

    const fd = new FormData();
    fd.append("clubName", clubName.trim());
    fd.append("coachName", coachName.trim());
    fd.append("contactEmail", contactEmail.trim());
    if (contactPerson.trim()) fd.append("contactPerson", contactPerson.trim());
    if (contactPhone.trim()) fd.append("contactPhone", contactPhone.trim());
    if (category.trim()) fd.append("category", category.trim());
    fd.append("roster", JSON.stringify(players));
    fd.append("paymentMethod", "MANUAL");
    if (logoFile) fd.append("logo", logoFile);
    else fd.append("badgePreset", badgePreset);

    try {
      const res = await registerClub({ eventId, body: fd }).unwrap();
      toast.success(res?.data?.message || res?.message || "Club added");
      onClose();
    } catch (err) {
      toast.error(getExtraEventApiError(err, "Failed to add club").message);
    }
  };

  return (
    <DashboardModal
      isOpen
      onClose={onClose}
      title="Add Club Offline"
      subtitle="Register a club that arranged payment directly with the academy (manual payment)"
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant="primary" loading={isLoading} onClick={handleSubmit} icon={<IconPlus size={16} />}>
            Add Club
          </ActionButton>
        </div>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Club Name" required>
            <input className={fieldClass} value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="e.g., Riverside FC" />
          </Field>
          <Field label="Coach Name" required>
            <input className={fieldClass} value={coachName} onChange={(e) => setCoachName(e.target.value)} placeholder="Head coach" />
          </Field>
          <Field label="Contact Email" required>
            <input type="email" className={fieldClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="club@example.com" />
          </Field>
          <Field label="Contact Person">
            <input className={fieldClass} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <input className={fieldClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
          </Field>
          <Field label="Category">
            <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., U-13" />
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Club Badge</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {CLUB_PRESET_LOGOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setBadgePreset(preset.id);
                  setLogoFile(null);
                  setLogoPreview("");
                }}
                className={cn(
                  "p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 cursor-pointer",
                  badgePreset === preset.id && !logoFile ? "border-[#E31B23] bg-[#E31B23]/5" : "border-white/10 bg-[#111] hover:border-white/20"
                )}
              >
                <div className="size-10" dangerouslySetInnerHTML={{ __html: preset.svg }} />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/50 text-center">{preset.name}</span>
              </button>
            ))}
            <label
              className={cn(
                "p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer",
                logoFile ? "border-[#E31B23] bg-[#E31B23]/5" : "border-white/10 bg-[#111] hover:border-white/20"
              )}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLogoFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setLogoPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              {logoPreview ? (
                <Image width={40} height={40} src={logoPreview} alt="Logo" className="size-10 object-contain" />
              ) : (
                <IconUpload size={22} className="text-white/40" />
              )}
              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{logoFile ? "Custom" : "Upload Logo"}</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-widest text-white/60">Roster ({roster.filter((r) => r.fullName.trim()).length})</p>
            <ActionButton icon={<IconPlus size={14} />} onClick={() => setRoster((r) => [...r, newRow()])}>
              Add Player
            </ActionButton>
          </div>
          <div className="flex flex-col gap-2">
            {roster.map((r) => (
              <div key={r.key} className="grid grid-cols-[1fr_72px_auto] sm:grid-cols-[2fr_1fr_80px_auto] gap-2 items-center">
                <input
                  className={cn(fieldClass, "col-span-3 sm:col-span-1")}
                  value={r.fullName}
                  onChange={(e) => updateRow(r.key, { fullName: e.target.value })}
                  placeholder="Player full name"
                />
                <input
                  type="date"
                  style={{ colorScheme: "dark" }}
                  className={fieldClass}
                  value={r.dateOfBirth}
                  onChange={(e) => updateRow(r.key, { dateOfBirth: e.target.value })}
                />
                <input
                  className={fieldClass}
                  value={r.shirtNo}
                  onChange={(e) => updateRow(r.key, { shirtNo: e.target.value })}
                  placeholder="No."
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setRoster((rows) => (rows.length > 1 ? rows.filter((x) => x.key !== r.key) : [newRow()]))}
                  className="size-11 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-destructive flex items-center justify-center cursor-pointer"
                  title="Remove player"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardModal>
  );
};

export default AddClubOfflineModal;
