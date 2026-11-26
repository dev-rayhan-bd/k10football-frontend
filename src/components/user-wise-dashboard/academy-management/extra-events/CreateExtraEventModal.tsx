"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconPlus,
  IconChevronDown,
  IconCalendar,
  IconUpload,
  IconLoader2,
  IconAlertCircle,
  IconDeviceFloppy,
  IconCrown,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getExtraEventApiError,
  useCreateAcademyEventMutation,
  useUpdateAcademyEventMutation,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IAcademyEventDetail, IExtraEventMeta } from "@/types/extraEvent.type";
import { cn } from "@/lib/utils";
import { toDateInput, toOptions } from "@/components/extra-events/manage/extraEventUtils";
import { TIME_OPTIONS, parseTimeToMinutes, formatTo12Hour } from "./extra-events.constants";

interface CreateExtraEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: IExtraEventMeta | undefined;
  /** When given, the modal edits this event (PATCH) instead of creating one. Mount it fresh per edit. */
  event?: IAcademyEventDetail | null;
  onSaved?: () => void;
}

const SUBSCRIPTION_URL = "/dashboard/academy/management/my-subscription";

const DEFAULT_EVENT_TYPES = [
  "Summer Training Camp",
  "Tournament Registration",
  "Skills Workshop",
  "Friendly Match",
  "Trial",
  "Clinic",
  "Charity Event",
  "Other",
];
const DEFAULT_GROUPS = ["Academy Members", "Grassroots Teams", "Families", "External Teams", "All Members"];
const DEFAULT_AGE_GROUPS = ["U-7", "U-9", "U-11", "U-13", "U-15", "U-17", "U-19", "Senior", "All Age Groups"];
const DEFAULT_TARGETS = ["Boys", "Girls", "Mixed / Co-Ed", "Goalkeepers", "Elite Players", "Grassroots", "Open to All"];

const inputClass =
  "w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all";
const selectClass =
  "w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 pr-11 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer";
const dateClass =
  "w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 pr-11 text-sm text-white focus:outline-none focus:border-white/25 transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100";

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
    {children} {required && <span className="text-[#E31B23]">*</span>}
  </label>
);

const SelectBox = ({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
}) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, className)}>
      <option value="" className="bg-[#111111] text-white">
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled} className="bg-[#111111] text-white">
          {o.label}
        </option>
      ))}
    </select>
    <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
  </div>
);

const DateInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  const open = () => {
    try {
      ref.current?.showPicker?.();
    } catch {}
  };
  return (
    <div className="relative cursor-pointer" onClick={open}>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ colorScheme: "dark" }}
        className={dateClass}
      />
      <IconCalendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
    </div>
  );
};

const withCurrent = (list: { value: string; label: string }[], current?: string) =>
  current && !list.some((o) => o.value === current) ? [{ value: current, label: current }, ...list] : list;

export const CreateExtraEventModal: React.FC<CreateExtraEventModalProps> = ({
  isOpen,
  onClose,
  meta,
  event,
  onSaved,
}) => {
  const isEdit = !!event?._id;
  const [createEvent, { isLoading: isCreating }] = useCreateAcademyEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateAcademyEventMutation();
  const isSaving = isCreating || isUpdating;

  // Initial state comes from `event` (edit) — the parent remounts the modal per open.
  const [eventName, setEventName] = useState(event?.eventName ?? "");
  const [eventType, setEventType] = useState(event?.eventType ?? "");
  const [eventGroup, setEventGroup] = useState(event?.group ?? "");
  const [ageGroup, setAgeGroup] = useState(event?.ageGroup ?? "");
  const [targetAttendees, setTargetAttendees] = useState(event?.targetAttendees ?? "");
  const [eventDate, setEventDate] = useState(toDateInput(event?.eventDate));
  const [eventEndDate, setEventEndDate] = useState(toDateInput(event?.eventEndDate));
  const [startTime, setStartTime] = useState(event?.startTime ? formatTo12Hour(event.startTime) : "");
  const [endTime, setEndTime] = useState(event?.endTime ? formatTo12Hour(event.endTime) : "");
  const [regDeadline, setRegDeadline] = useState(toDateInput(event?.registrationDeadline));
  const [venueName, setVenueName] = useState(event?.venueName ?? "");
  const [venueAddress, setVenueAddress] = useState(event?.venueAddress ?? "");
  const [eventFee, setEventFee] = useState(
    event?.registrationFee !== undefined && event?.registrationFee !== null ? String(event.registrationFee) : ""
  );
  const [currency, setCurrency] = useState(event?.currency ?? "USD");
  const [maxCapacity, setMaxCapacity] = useState(event?.maxCapacity ? String(event.maxCapacity) : "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [requirements, setRequirements] = useState(event?.requirements ?? "");
  const [contactPerson, setContactPerson] = useState(event?.contactPerson ?? "");
  const [contactPhone, setContactPhone] = useState(event?.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(event?.contactEmail ?? "");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState(event?.bannerImage ?? "");
  const [eliteRequired, setEliteRequired] = useState<string | null>(null);

  const timeValidationError = useMemo(() => {
    if (!startTime || !endTime) return null;
    const s = parseTimeToMinutes(startTime);
    const e = parseTimeToMinutes(endTime);
    if (s === -1 || e === -1) return null;
    if (eventEndDate && eventDate && eventEndDate > eventDate) return null; // multi-day event
    return s >= e
      ? "Start time cannot be later than or equal to End time. Please select an End time that comes after Start time."
      : null;
  }, [startTime, endTime, eventDate, eventEndDate]);

  const eventTypes = withCurrent(toOptions(meta?.eventTypes, DEFAULT_EVENT_TYPES), event?.eventType);
  const groups = withCurrent(toOptions(meta?.groups, DEFAULT_GROUPS), event?.group);
  const ageGroups = withCurrent(toOptions(meta?.ageGroups, DEFAULT_AGE_GROUPS), event?.ageGroup);
  const targets = withCurrent(toOptions(meta?.targetAttendees, DEFAULT_TARGETS), event?.targetAttendees);
  const timeOptions = Array.from(new Set([...(startTime ? [startTime] : []), ...(endTime ? [endTime] : []), ...TIME_OPTIONS]))
    .filter((t) => parseTimeToMinutes(t) !== -1)
    .sort((a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b));

  const handleSubmit = async () => {
    const required: [string, string][] = [
      [eventName.trim(), "Please enter an event name"],
      [eventType, "Please select an event type"],
      [eventGroup, "Please select a group"],
      [ageGroup, "Please select an age group"],
      [targetAttendees, "Please select target attendees"],
      [eventDate, "Please select an event date"],
      [startTime, "Please select a start time"],
      [endTime, "Please select an end time"],
      [regDeadline, "Please select registration deadline"],
      [venueName.trim(), "Please enter venue name"],
      [venueAddress.trim(), "Please enter full address"],
      [description.trim(), "Please enter event description"],
      [contactPerson.trim(), "Please enter contact person name"],
      [contactPhone.trim(), "Please enter contact phone"],
      [contactEmail.trim(), "Please enter contact email"],
    ];
    const missing = required.find(([v]) => !v);
    if (missing) return toast.error(missing[1]);
    if (timeValidationError) return toast.error(timeValidationError);
    if (eventEndDate && eventEndDate < eventDate) return toast.error("End date cannot be before the event date");
    if (regDeadline > (eventEndDate || eventDate)) return toast.error("Registration deadline must be on or before the event date");

    const fee = eventFee.trim() ? Number(eventFee.replace(/[^0-9.]/g, "")) : 0;
    const capacity = maxCapacity.trim() ? Number(maxCapacity.replace(/[^0-9]/g, "")) : NaN;

    // Flat multipart fields, per the backend spec.
    const fd = new FormData();
    const fields: Record<string, string> = {
      eventName: eventName.trim(),
      eventType,
      group: eventGroup,
      ageGroup,
      targetAttendees,
      eventDate,
      startTime: formatTo12Hour(startTime),
      endTime: formatTo12Hour(endTime),
      registrationDeadline: regDeadline,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      description: description.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      registrationFee: String(Number.isFinite(fee) ? fee : 0),
      currency: currency.trim() || "USD",
      requirements: requirements.trim(),
    };
    if (eventEndDate) fields.eventEndDate = eventEndDate;
    if (Number.isFinite(capacity) && capacity > 0) fields.maxCapacity = String(capacity);
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (bannerFile) fd.append("bannerImage", bannerFile);

    try {
      const res = isEdit
        ? await updateEvent({ id: event!._id, body: fd }).unwrap()
        : await createEvent(fd).unwrap();
      toast.success(res?.message || (isEdit ? "Event updated" : "Event created"));
      onSaved?.();
      onClose();
    } catch (err) {
      const { status, message } = getExtraEventApiError(err, isEdit ? "Failed to update event" : "Failed to create event");
      if (status === 403) setEliteRequired(message);
      toast.error(message);
    }
  };

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Extra Event" : "Create Extra Event"}
      subtitle={
        isEdit
          ? "Update the event details. Registrations already received are kept."
          : "Set up a new event for academy members, grassroots teams, and families"
      }
      showBackButton
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            {isSaving ? (
              <IconLoader2 size={18} className="animate-spin shrink-0" />
            ) : isEdit ? (
              <IconDeviceFloppy size={18} className="shrink-0" />
            ) : (
              <IconPlus size={18} className="shrink-0" />
            )}
            <span className="truncate">
              {isSaving ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save Changes" : "Create Event"}
            </span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-10">
        {eliteRequired && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-[#FDC700]/30 bg-[#FDC700]/5">
            <IconCrown size={28} className="text-[#FDC700] shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className="text-sm font-black uppercase text-white font-orbitron">Upgrade to Elite</p>
              <p className="text-xs text-white/60">{eliteRequired}</p>
            </div>
            <Link
              href={SUBSCRIPTION_URL}
              className="px-5 py-2.5 rounded-xl bg-[#FDC700] text-black text-[10px] font-black uppercase tracking-widest text-center shrink-0"
            >
              Upgrade Plan
            </Link>
          </div>
        )}

        {/* Event Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label required>Event Name</Label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Summer Training Camp"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Event Type</Label>
              <SelectBox value={eventType} onChange={setEventType} placeholder="Select event type" options={eventTypes} />
              {/tournament/i.test(eventType) && (
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                  Tournament events register clubs (with rosters) and unlock groups, fixtures and the live arena.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Group</Label>
              <SelectBox value={eventGroup} onChange={setEventGroup} placeholder="Select group" options={groups} />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Age Group</Label>
              <SelectBox value={ageGroup} onChange={setAgeGroup} placeholder="Select age group" options={ageGroups} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label required>Target Attendees / Player Type</Label>
              <SelectBox
                value={targetAttendees}
                onChange={setTargetAttendees}
                placeholder="Select an option"
                options={targets}
              />
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Date & Time</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label required>Event Date</Label>
              <DateInput value={eventDate} onChange={setEventDate} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>End Date (multi-day)</Label>
              <DateInput value={eventEndDate} onChange={setEventEndDate} />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Start Time</Label>
              <SelectBox
                value={startTime}
                onChange={setStartTime}
                placeholder="Select start time"
                options={timeOptions.map((t) => ({ value: t, label: t }))}
                className={timeValidationError ? "border-destructive text-destructive" : undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>End Time</Label>
              <SelectBox
                value={endTime}
                onChange={setEndTime}
                placeholder="Select end time"
                options={timeOptions.map((t) => ({ value: t, label: t }))}
                className={timeValidationError ? "border-destructive text-destructive" : undefined}
              />
            </div>
            {timeValidationError && (
              <div className="sm:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold">
                <IconAlertCircle size={16} className="shrink-0" />
                <span>{timeValidationError}</span>
              </div>
            )}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label required>Registration Deadline</Label>
              <DateInput value={regDeadline} onChange={setRegDeadline} />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Last date to register for this event</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label required>Venue Name</Label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., St. George's National Football Centre"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Full Address</Label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g., Newborough Road, Needwood, DE13 9PD"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Registration & Fees */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Registration & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <Label>Registration Fee</Label>
              <input
                type="text"
                inputMode="decimal"
                value={eventFee}
                onChange={(e) => setEventFee(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Leave blank or 0 for free events</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Currency</Label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Maximum Capacity</Label>
              <input
                type="text"
                inputMode="numeric"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="e.g., 40"
                className={inputClass}
              />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Leave blank for unlimited capacity</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Details</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label required>Event Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive intensive football training camp covering tactical drills, technical skills..."
                className={cn(inputClass, "h-32 resize-none")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Requirements / What to Bring</Label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Football boots, shin pads, training kit, water bottle, and completed medical consent form."
                className={cn(inputClass, "h-32 resize-none")}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <Label required>Contact Person</Label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Coach Marcus Vance"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Contact Phone</Label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+44 7123 456789"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label required>Contact Email</Label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="events@k10football.com"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Image</h3>
          <div className="flex flex-col gap-2">
            <Label>Upload Event Banner</Label>
            <div className="w-full border-2 border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-white/25 transition-all cursor-pointer bg-white/2 relative">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBannerFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setBannerPreview(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              {bannerPreview ? (
                <div className="relative flex flex-col items-center gap-3 w-full">
                  <div className="relative w-full max-w-md h-44 rounded-xl overflow-hidden border border-white/10">
                    <Image fill src={bannerPreview} alt="Banner Preview" className="object-cover" />
                  </div>
                  {bannerFile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBannerFile(null);
                        setBannerPreview(event?.bannerImage ?? "");
                      }}
                      className="text-xs text-destructive hover:underline font-bold uppercase tracking-wider relative z-10 cursor-pointer"
                    >
                      Remove New Banner
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <IconUpload size={32} className="text-white/20" />
                  <p className="text-sm font-bold text-white/60">Click to upload or drag and drop an image</p>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                    Recommended: 1200x630 pixels for best display
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardModal>
  );
};

export default CreateExtraEventModal;
