"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { 
  IconPlus, 
  IconChevronDown, 
  IconCalendar, 
  IconUpload, 
  IconLoader2,
  IconAlertCircle
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useCreateExtraEventMutation } from "@/redux/features/academy/academyApi";
import { IExtraEventsMetaData } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import { 
  TOURNAMENT_PRESET_LOGOS, 
  TIME_OPTIONS, 
  parseTimeToMinutes,
  formatTo12Hour 
} from "./extra-events.constants";

interface CreateExtraEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  meta: IExtraEventsMetaData | undefined;
}

export const CreateExtraEventModal: React.FC<CreateExtraEventModalProps> = ({
  isOpen,
  onClose,
  meta,
}) => {
  const [createExtraEvent, { isLoading: isCreating }] = useCreateExtraEventMutation();

  // Form States
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventGroup, setEventGroup] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [targetAttendees, setTargetAttendees] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [eventFee, setEventFee] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState("");

  // Optional Tournament Setup
  const [tournamentLogo, setTournamentLogo] = useState(TOURNAMENT_PRESET_LOGOS[0].id);
  const [customLogoBase64, setCustomLogoBase64] = useState("");

  // Refs for Native Date Pickers
  const eventDateRef = useRef<HTMLInputElement>(null);
  const regDeadlineRef = useRef<HTMLInputElement>(null);

  // Time Validation: Start time cannot be greater than or equal to End time
  const timeValidationError = useMemo(() => {
    if (!startTime || !endTime) return null;
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    if (startMinutes === -1 || endMinutes === -1) return null;

    if (startMinutes >= endMinutes) {
      return "Start time cannot be later than or equal to End time. Please select an End time that comes after Start time.";
    }
    return null;
  }, [startTime, endTime]);

  const resetForm = () => {
    setEventName("");
    setEventType("");
    setEventGroup("");
    setSelectedAgeGroup("");
    setTargetAttendees("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setRegDeadline("");
    setVenueName("");
    setVenueAddress("");
    setEventFee("");
    setMaxCapacity("");
    setDescription("");
    setRequirements("");
    setContactPerson("");
    setContactPhone("");
    setContactEmail("");
    setBannerFile(null);
    setBannerPreview("");
    setTournamentLogo(TOURNAMENT_PRESET_LOGOS[0].id);
    setCustomLogoBase64("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateEvent = async () => {
    if (!eventName.trim()) {
      toast.error("Please enter an event name");
      return;
    }
    if (!eventType) {
      toast.error("Please select an event type");
      return;
    }
    if (!eventGroup) {
      toast.error("Please select a group");
      return;
    }
    if (!selectedAgeGroup) {
      toast.error("Please select an age group");
      return;
    }
    if (!targetAttendees) {
      toast.error("Please select target attendees");
      return;
    }
    if (!eventDate) {
      toast.error("Please select an event date");
      return;
    }
    if (!startTime) {
      toast.error("Please select a start time");
      return;
    }
    if (!endTime) {
      toast.error("Please select an end time");
      return;
    }

    // Time Comparison Validation Rule: Start time must not be greater than or equal to end time
    if (timeValidationError) {
      toast.error(timeValidationError);
      return;
    }

    if (!regDeadline) {
      toast.error("Please select registration deadline");
      return;
    }
    if (!venueName.trim()) {
      toast.error("Please enter venue name");
      return;
    }
    if (!venueAddress.trim()) {
      toast.error("Please enter full address");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter event description");
      return;
    }
    if (!contactPerson.trim()) {
      toast.error("Please enter contact person name");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Please enter contact phone");
      return;
    }
    if (!contactEmail.trim()) {
      toast.error("Please enter contact email");
      return;
    }

    const parsedFee = eventFee ? Number(eventFee.replace(/[^0-9.]/g, "")) : 0;
    const parsedCapacity = maxCapacity ? Number(maxCapacity.replace(/[^0-9]/g, "")) : 0;

    const payload = {
      eventName: eventName.trim(),
      eventType,
      group: eventGroup,
      ageGroup: selectedAgeGroup,
      targetAttendees,
      eventDate,
      startTime: startTime ? formatTo12Hour(startTime) : "09:00 AM",
      endTime: endTime ? formatTo12Hour(endTime) : "04:00 PM",
      registrationDeadline: regDeadline || eventDate,
      venueName: venueName.trim(),
      venueAddress: venueAddress.trim(),
      registrationFee: isNaN(parsedFee) ? 0 : parsedFee,
      currency: "$",
      maxCapacity: isNaN(parsedCapacity) ? 0 : parsedCapacity,
      description: description.trim(),
      requirements: requirements.trim(),
      contactPerson: contactPerson.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      status: "OPEN",
    };

    try {
      await createExtraEvent({
        ...payload,
        bannerImage: bannerFile,
      }).unwrap();

      handleClose();
    } catch {
      // RTK Query onQueryStarted handles notification toasts
    }
  };

  // Dropdown lists with fallback defaults from meta
  const eventTypesList = meta?.eventTypes || [
    "Summer Training Camp",
    "Tournament Registration",
    "Skills Workshop",
    "Friendly Match",
    "Trial",
    "Clinic",
    "Charity Event",
    "Other"
  ];

  const groupsList = meta?.groups || [
    "Academy Members",
    "Grassroots Teams",
    "Families",
    "External Teams",
    "All Members"
  ];

  const ageGroupsList = meta?.ageGroups || [
    "U-7",
    "U-9",
    "U-11",
    "U-13",
    "U-15",
    "U-17",
    "U-19",
    "Senior",
    "All Age Groups"
  ];

  const targetAttendeesList = meta?.targetAttendees || [
    "Boys",
    "Girls",
    "Mixed / Co-Ed",
    "Goalkeepers",
    "Elite Players",
    "Grassroots",
    "Open to All"
  ];

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Extra Event"
      subtitle="Set up a new event for academy members, grassroots teams, and families"
      showBackButton
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button 
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleCreateEvent}
            disabled={isCreating}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            {isCreating ? (
              <>
                <IconLoader2 size={18} className="animate-spin shrink-0" />
                <span className="truncate">Creating...</span>
              </>
            ) : (
              <>
                <IconPlus size={18} className="shrink-0" />
                <span className="truncate">Create Event</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-10">
        {/* Event Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Event Name <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="text" 
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Summer Training Camp" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>

            {/* Event Type from Meta */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Event Type <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#111111] text-white">Select event type</option>
                  {eventTypesList.map((type) => (
                    <option key={type} value={type} className="bg-[#111111] text-white">
                      {type}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Optional Tournament Logo Picker */}
            {(eventType === "Tournament Registration" || eventType === "tournament") && (
              <div className="flex flex-col gap-3 md:col-span-2 bg-[#1c1c1c]/20 border border-white/5 rounded-3xl p-6">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  Tournament Logo / Badge
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
                  {TOURNAMENT_PRESET_LOGOS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setTournamentLogo(preset.id);
                        setCustomLogoBase64("");
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer",
                        tournamentLogo === preset.id && !customLogoBase64
                          ? "border-[#E31B23] bg-[#E31B23]/5"
                          : "border-white/10 bg-[#111] hover:border-white/20"
                      )}
                    >
                      <div className="size-12">
                        <div dangerouslySetInnerHTML={{ __html: preset.svg }} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                  {/* Custom Upload Logo */}
                  <label
                    className={cn(
                      "p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer relative",
                      customLogoBase64
                        ? "border-[#E31B23] bg-[#E31B23]/5"
                        : "border-white/10 bg-[#111] hover:border-white/20"
                    )}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCustomLogoBase64(reader.result as string);
                            setTournamentLogo("custom");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {customLogoBase64 ? (
                      <Image width={48} height={48} src={customLogoBase64} alt="Custom Logo" className="size-12 object-contain" />
                    ) : (
                      <IconUpload size={24} className="text-white/40" />
                    )}
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">
                      {customLogoBase64 ? "Custom" : "Upload Logo"}
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Group from Meta */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Group <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={eventGroup}
                  onChange={(e) => setEventGroup(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#111111] text-white">Select group</option>
                  {groupsList.map((grp) => (
                    <option key={grp} value={grp} className="bg-[#111111] text-white">
                      {grp}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Age Group from Meta */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Age Group <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={selectedAgeGroup}
                  onChange={(e) => setSelectedAgeGroup(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#111111] text-white">Select age group</option>
                  {ageGroupsList.map((ag) => (
                    <option key={ag} value={ag} className="bg-[#111111] text-white">
                      {ag}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Target Attendees from Meta */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Target Attendees / Player Type <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={targetAttendees}
                  onChange={(e) => setTargetAttendees(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="" className="bg-[#111111] text-white">Select an option</option>
                  {targetAttendeesList.map((att) => (
                    <option key={att} value={att} className="bg-[#111111] text-white">
                      {att}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Date & Time</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Event Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Event Date <span className="text-[#E31B23]">*</span>
              </label>
              <div 
                className="relative cursor-pointer"
                onClick={() => {
                  try {
                    eventDateRef.current?.showPicker?.();
                  } catch {}
                }}
              >
                <input 
                  ref={eventDateRef}
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 pr-11 text-sm text-white focus:outline-none focus:border-white/25 transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100" 
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      eventDateRef.current?.showPicker?.();
                    } catch {}
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Select Date"
                >
                  <IconCalendar size={18} />
                </button>
              </div>
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Start Time <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-11 text-sm text-white appearance-none focus:outline-none transition-all cursor-pointer",
                    timeValidationError
                      ? "border-destructive focus:border-destructive text-destructive"
                      : "border-white/15 focus:border-white/25"
                  )}
                >
                  <option value="" className="bg-[#111111] text-white">Select start time</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t} className="bg-[#111111] text-white">
                      {t}
                    </option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
              </div>
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                End Time <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-11 text-sm text-white appearance-none focus:outline-none transition-all cursor-pointer",
                    timeValidationError
                      ? "border-destructive focus:border-destructive text-destructive"
                      : "border-white/15 focus:border-white/25"
                  )}
                >
                  <option value="" className="bg-[#111111] text-white">Select end time</option>
                  {TIME_OPTIONS.map((t) => {
                    const isBeforeStart = startTime ? parseTimeToMinutes(t) <= parseTimeToMinutes(startTime) : false;
                    return (
                      <option 
                        key={t} 
                        value={t} 
                        disabled={isBeforeStart}
                        className={cn("bg-[#111111]", isBeforeStart ? "text-white/20" : "text-white")}
                      >
                        {t} {isBeforeStart ? "(Before start)" : ""}
                      </option>
                    );
                  })}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Inline Time Validation Warning */}
            {timeValidationError && (
              <div className="sm:col-span-2 md:col-span-3 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold animate-in fade-in duration-200">
                <IconAlertCircle size={16} className="shrink-0" />
                <span>{timeValidationError}</span>
              </div>
            )}

            {/* Registration Deadline */}
            <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Registration Deadline <span className="text-[#E31B23]">*</span>
              </label>
              <div 
                className="relative cursor-pointer"
                onClick={() => {
                  try {
                    regDeadlineRef.current?.showPicker?.();
                  } catch {}
                }}
              >
                <input 
                  ref={regDeadlineRef}
                  type="date" 
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.();
                    } catch {}
                  }}
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 pr-11 text-sm text-white focus:outline-none focus:border-white/25 transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100" 
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      regDeadlineRef.current?.showPicker?.();
                    } catch {}
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                  title="Select Deadline"
                >
                  <IconCalendar size={18} />
                </button>
              </div>
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                Last date to register for this event
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Venue Name <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="text" 
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., St. George's National Football Centre" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Full Address <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="text" 
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g., Newborough Road, Needwood, Burton upon Trent, DE13 9PD" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Registration & Fees */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Registration & Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Registration Fee ($)
              </label>
              <input 
                type="text" 
                value={eventFee}
                onChange={(e) => setEventFee(e.target.value)}
                placeholder="250" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                Leave blank or enter 0 for free events
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Maximum Club Capacity
              </label>
              <input 
                type="text" 
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="e.g., 40" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
              <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                Leave blank for unlimited capacity
              </p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Details</h3>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Event Description <span className="text-[#E31B23]">*</span>
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive intensive football training camp covering tactical drills, technical skills..." 
                className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Requirements / What to Bring
              </label>
              <textarea 
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Football boots, shin pads, training kit, water bottle, and completed medical consent form." 
                className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Contact Person <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="text" 
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Coach Marcus Vance" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Contact Phone <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="text" 
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+44 7123 456789" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Contact Email <span className="text-[#E31B23]">*</span>
              </label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="events@k10football.com" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Event Image */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Image</h3>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
              Upload Event Banner
            </label>
            <div className="w-full border-2 border-dashed border-white/15 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-white/25 transition-all cursor-pointer bg-white/2 relative">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setBannerFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setBannerPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              {bannerPreview ? (
                <div className="relative flex flex-col items-center gap-3">
                  <div className="relative max-h-52 w-full max-w-md h-44 rounded-xl overflow-hidden border border-white/10">
                    <Image fill src={bannerPreview} alt="Banner Preview" className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerFile(null);
                      setBannerPreview("");
                    }}
                    className="text-xs text-destructive hover:underline font-bold uppercase tracking-wider relative z-10 cursor-pointer"
                  >
                    Remove Banner
                  </button>
                </div>
              ) : (
                <>
                  <IconUpload size={32} className="text-white/20" />
                  <p className="text-sm font-bold text-white/60">Click to upload or drag and drop image/*</p>
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
