/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import DashboardModal from "@/components/dashboard/dashboard-modal";
import { 
  IconPlus, 
  IconChevronDown,
  IconCalendar,
  IconUsers,
  IconCurrencyDollar,
  IconUpload,
  IconCopy
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import Image from "next/image";

export const TOURNAMENT_PRESET_LOGOS = [
  {
    id: "preset-cup",
    name: "Champions Cup",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z" fill="#111111" stroke="#FDC700" stroke-width="4"/>
      <path d="M35 30 H65 V35 C65 45 58 52 50 52 C42 52 35 45 35 35 V30 Z" fill="#FDC700"/>
      <path d="M47 52 H53 V68 H47 V52 Z" fill="#FDC700"/>
      <path d="M30 72 H70 V77 H30 V72 Z" fill="#FDC700"/>
      <circle cx="50" cy="40" r="4" fill="#111111"/>
      <path d="M30 32 C25 32 25 42 30 42 H35 V32 H30 Z" stroke="#FDC700" stroke-width="2" fill="none"/>
      <path d="M70 32 C75 32 75 42 70 42 H65 V32 H70 Z" stroke="#FDC700" stroke-width="2" fill="none"/>
    </svg>`
  },
  {
    id: "preset-shield",
    name: "Elite League",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 15 H85 V45 C85 70 50 90 50 90 C50 90 15 70 15 45 V15 Z" fill="#111111" stroke="#0077FF" stroke-width="4"/>
      <path d="M30 35 L50 20 L70 35 V50 C70 65 50 78 50 78 C50 78 30 65 30 50 V35 Z" fill="#0077FF" opacity="0.2"/>
      <circle cx="50" cy="48" r="15" stroke="#0077FF" stroke-width="3" fill="none"/>
      <path d="M42 48 L48 54 L58 42" stroke="#00FF62" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: "preset-grass",
    name: "Grassroots Cup",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#111111" stroke="#00FF62" stroke-width="4"/>
      <path d="M50 15 C55 35 75 50 75 50 C75 50 55 65 50 85 C45 65 25 50 25 50 C25 50 45 35 50 15 Z" fill="#00FF62" opacity="0.3"/>
      <circle cx="50" cy="50" r="10" stroke="#FFF" stroke-width="2"/>
      <path d="M50 20 V80 M20 50 H80" stroke="#FFF" stroke-width="1" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: "preset-star",
    name: "Academy Premier",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L92 36 L76 86 L24 86 L8 36 Z" fill="#111111" stroke="#FF1010" stroke-width="4"/>
      <path d="M50 20 L58 38 H78 L62 50 L68 68 L50 56 L32 68 L38 50 L22 38 H42 L50 20 Z" fill="#FF1010"/>
    </svg>`
  }
];

export const CLUB_PRESET_LOGOS = [
  {
    id: "club-badge-1",
    name: "Red Devils Academy",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#FF1010" opacity="0.1" stroke="#FF1010" stroke-width="4"/>
      <path d="M35 40 Q50 30 65 40 V55 Q50 70 35 55 Z" fill="#FF1010"/>
      <circle cx="43" cy="46" r="3" fill="#FFF"/>
      <circle cx="57" cy="46" r="3" fill="#FFF"/>
      <path d="M45 52 Q50 56 55 52" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "club-badge-2",
    name: "Blue Tigers FC",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#0077FF" opacity="0.1" stroke="#0077FF" stroke-width="4"/>
      <path d="M30 45 C35 35 45 35 50 40 C55 35 65 35 70 45 C70 60 50 75 50 75 C50 75 30 60 30 45 Z" fill="#0077FF"/>
      <path d="M40 43 L45 47 L40 51" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
      <path d="M60 43 L55 47 L60 51" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "club-badge-3",
    name: "Green Hawks Academy",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#00FF62" opacity="0.1" stroke="#00FF62" stroke-width="4"/>
      <path d="M50 25 L70 45 H30 L50 25 Z" fill="#00FF62"/>
      <path d="M30 50 L50 70 L70 50 H30 Z" fill="#00FF62"/>
    </svg>`
  },
  {
    id: "club-badge-4",
    name: "Yellow Hornets FC",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#FDC700" opacity="0.1" stroke="#FDC700" stroke-width="4"/>
      <circle cx="50" cy="48" r="18" fill="#FDC700"/>
      <path d="M40 45 H60 M40 51 H60 M45 57 H55" stroke="#111" stroke-width="3"/>
    </svg>`
  }
];

export const getStoredEvents = () => {
  if (typeof window === "undefined") return events;
  const stored = localStorage.getItem("k10_extra_events");
  if (!stored) {
    localStorage.setItem("k10_extra_events", JSON.stringify(events));
    return events;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return events;
  }
};

export const saveStoredEvents = (newEvents: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("k10_extra_events", JSON.stringify(newEvents));
  }
};

export const events = [
  {
    id: 1,
    title: "Summer Training Camp",
    date: "15-20 February 2026",
    fee: "£250",
    enrolled: "32/40",
    status: "Open",
    group: "Group A",
    ageGroup: "U-14",
    targetGroup: "Academy Players Only"
  },
  {
    id: 2,
    title: "Tournament Registration",
    date: "5 March 2026",
    fee: "£180",
    enrolled: "24/30",
    status: "Open",
    group: "Group B",
    ageGroup: "U-16",
    targetGroup: "All Members & Families"
  },
  {
    id: 3,
    title: "Skills Workshop",
    date: "30 January 2026",
    fee: "£75",
    enrolled: "18/20",
    status: "Closing Soon",
    group: "Group C",
    ageGroup: "U-12",
    targetGroup: "Academy Players Only"
  },
  {
    id: 4,
    title: "Skills Workshop",
    date: "30 January 2026",
    fee: "£75",
    enrolled: "18/20",
    status: "Closing Soon",
    group: "Group D",
    ageGroup: "U-10",
    targetGroup: "Academy Players Only"
  }
];

export const ExtraEventsManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const players = useAppSelector((state) => state.player.players);
  
  // State for creating new events
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventGroup, setEventGroup] = useState("");
  const [targetAttendees, setTargetAttendees] = useState("");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [matchFormation, setMatchFormation] = useState("11v11");
  const [tournamentFormat, setTournamentFormat] = useState("group-knockout");
  const [numberOfPitches, setNumberOfPitches] = useState("6");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [eventFee, setEventFee] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [tournamentLogo, setTournamentLogo] = useState(TOURNAMENT_PRESET_LOGOS[0].id);
  const [customLogoBase64, setCustomLogoBase64] = useState("");
  const [eventBanner, setEventBanner] = useState("");

  useEffect(() => {
    setEventsList(getStoredEvents());
  }, []);

  const handleCreateEvent = () => {
    if (!eventName) {
      toast.error("Please enter an event name");
      return;
    }
    if (!eventType) {
      toast.error("Please select an event type");
      return;
    }

    const currentEvents = getStoredEvents();
    const newId = currentEvents.length > 0 ? Math.max(...currentEvents.map((e: any) => e.id)) + 1 : 1;

    const formattedFee = eventFee ? (eventFee.startsWith("£") || eventFee.startsWith("$") ? eventFee : `£${eventFee}`) : "Free";

    const newEvent = {
      id: newId,
      title: eventName,
      date: eventDate ? new Date(eventDate + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBA",
      fee: formattedFee,
      enrolled: `0/${maxCapacity || "16 Teams"}`,
      status: "Open",
      group: eventGroup || "Group A",
      ageGroup: selectedAgeGroups.length > 0 ? selectedAgeGroups.join(", ") : "U-14",
      targetGroup: targetAttendees === "players" ? "Academy Players Only" : targetAttendees === "grassroots" ? "Grassroot Players Only" : "All Members",
      eventType,
      tournamentFormat,
      matchFormation,
      numberOfPitches: Number(numberOfPitches) || 6,
      venueName,
      address,
      description,
      requirements,
      contactName,
      contactPhone,
      contactEmail,
      logoId: tournamentLogo,
      customLogo: customLogoBase64,
      banner: eventBanner,
      isCreated: true // flag indicating it was custom created
    };

    const updated = [newEvent, ...currentEvents];
    saveStoredEvents(updated);
    setEventsList(updated);
    toast.success("Event created successfully!");
    setShowCreateModal(false);

    // Reset Form
    setEventName("");
    setEventType("");
    setEventGroup("");
    setTargetAttendees("");
    setSelectedAgeGroups([]);
    setEventFee("");
    setMaxCapacity("");
    setDescription("");
    setRequirements("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setTournamentLogo(TOURNAMENT_PRESET_LOGOS[0].id);
    setCustomLogoBase64("");
  };

  const handleCopyEventLink = (eventId: number) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const path = `/dashboard/academy/management/extra-events/${eventId}`;
      const url = origin + path;
      navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none">Extra Events</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[11px] mt-2">Manage special events and activities</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20"
        >
          <IconPlus size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Create Event</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex justify-end gap-3">
        <button className="bg-[#111111] border border-white/15 px-5 py-2.5 rounded-xl text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all">
          All Events
          <IconChevronDown size={14} />
        </button>
        <button className="bg-[#111111] border border-white/15 px-5 py-2.5 rounded-xl text-[11px] font-bold text-white/60 hover:text-white flex items-center gap-2 transition-all">
          Date
          <IconChevronDown size={14} />
        </button>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {eventsList.map((event) => (
          <div key={event.id} className="bg-[#111111] rounded-4xl border border-white/15 p-6 flex flex-col gap-6 hover:border-white/25 transition-all shadow-xl group">
            <div className="flex justify-between items-start">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                event.status === 'Open' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#FBBF24]/10 text-[#FBBF24]'
              }`}>
                {event.status}
              </span>
              
              {event.eventType === "tournament" && (
                <div className="w-10 h-10 text-white select-none">
                  {event.customLogo ? (
                    <Image width={20} height={20} src={event.customLogo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div dangerouslySetInnerHTML={{ 
                      __html: TOURNAMENT_PRESET_LOGOS.find(l => l.id === event.logoId)?.svg || TOURNAMENT_PRESET_LOGOS[0].svg 
                    }} />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase text-white font-orbitron leading-tight min-h-12 line-clamp-2">
                {event.title}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                  <IconCalendar size={16} />
                  {event.date}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                  <IconCurrencyDollar size={16} />
                  {event.fee}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                  <IconUsers size={16} />
                  {event.enrolled}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto w-full">
              <Link 
                href={`/dashboard/academy/management/extra-events/${event.id}`}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all text-center block"
              >
                View Details
              </Link>
              <button 
                type="button"
                onClick={() => handleCopyEventLink(event.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl text-white/60 hover:text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
                title="Copy Event Link"
              >
                <IconCopy size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      <DashboardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Extra Event"
        subtitle="Set up a new event for academy members, grassroots teams, and families"
        showBackButton
        footer={
          <div className="flex justify-end gap-4">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateEvent}
              className="px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer"
            >
              Create Event
            </button>
          </div>
        }
      >
        <div className="space-y-10">
          {/* Event Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Event Name <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Summer Football Camp" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Event Type <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                  >
                    <option value="">Select event type</option>
                    <option value="tournament">Tournament</option>
                    <option value="training-camp">Training Camp</option>
                    <option value="friendly-match">Friendly Match</option>
                    <option value="workshop">Workshop / Clinic</option>
                    <option value="trial">Club Trial / Tryout</option>
                    <option value="social">Social Event</option>
                    <option value="other">Other Event</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
              
              {/* Tournament Logo Picker */}
              {eventType === "tournament" && (
                <div className="space-y-3 md:col-span-2 bg-[#1c1c1c]/20 border border-white/5 rounded-3xl p-6">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                    Tournament Logo / Badge <span className="text-[#E31B23]">*</span>
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
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer ${
                          tournamentLogo === preset.id && !customLogoBase64
                            ? "border-[#E31B23] bg-[#E31B23]/5"
                            : "border-white/10 bg-[#111] hover:border-white/20"
                        }`}
                      >
                        <div className="w-12 h-12">
                          <div dangerouslySetInnerHTML={{ __html: preset.svg }} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/60 text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                    {/* Custom Upload Logo */}
                    <label
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer relative ${
                        customLogoBase64
                          ? "border-[#E31B23] bg-[#E31B23]/5"
                          : "border-white/10 bg-[#111] hover:border-white/20"
                      }`}
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
                        <Image width={20} height={20} src={customLogoBase64} alt="Custom Logo" className="w-12 h-12 object-contain" />
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

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Group <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={eventGroup}
                    onChange={(e) => setEventGroup(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                  >
                    <option value="">Select group</option>
                    {Array.from({ length: 26 }, (_, i) => {
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <option key={letter} value={letter}>
                          Group {letter}
                        </option>
                      );
                    })}
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
              {eventType !== "tournament" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                    Age Group <span className="text-[#E31B23]">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedAgeGroups[0] || ""}
                      onChange={(e) => setSelectedAgeGroups([e.target.value])}
                      className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                    >
                      <option value="">Select age group</option>
                      {Array.from({ length: 17 }, (_, i) => {
                        const age = 5 + i;
                        return (
                          <option key={age} value={`U-${age}`}>
                            U-{age}
                          </option>
                        );
                      })}
                    </select>
                    <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Target Attendees / Player Type <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={targetAttendees}
                    onChange={(e) => setTargetAttendees(e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white/60 appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                  >
                    <option value="">Select an option</option>
                    <option value="players">Academy Players Only</option>
                    <option value="grassroots">Grassroot Players Only</option>
                    <option value="all">All Members & Families</option>
                    <option value="coaches">Coaches & Staff Only</option>
                    <option value="parents">Parents & Guardians Only</option>
                    <option value="public">Public Event (Open to all)</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Tournament Match Setup (Conditional) */}
          {eventType === "tournament" && (
            <div className="bg-[#1C1C1C]/40 border border-[#E31B23]/35 rounded-4xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xl font-black uppercase text-white font-orbitron tracking-tight">Tournament Setup</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Groups Multi-Select */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                    Target Age Groups / Categories <span className="text-[#E31B23]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["U-6", "U-7", "U-8", "U-9", "U-10", "U-11", "U-12", "U-13", "U-14", "U-15", "U-16", "U-17", "U-18", "U-19", "U-21"].map((group) => {
                      const isSelected = selectedAgeGroups.includes(group);
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedAgeGroups(selectedAgeGroups.filter(g => g !== group));
                            } else {
                              setSelectedAgeGroups([...selectedAgeGroups, group]);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
                            isSelected 
                              ? 'bg-[#E31B23] border-[#E31B23] text-white shadow-md shadow-[#E31B23]/10' 
                              : 'bg-[#111] border-white/10 text-white/40 hover:border-white/20'
                          }`}
                        >
                          {group}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Organize Formation (Match Format) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                    Match Formation / Format <span className="text-[#E31B23]">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={matchFormation}
                      onChange={(e) => setMatchFormation(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                    >
                      <option value="11-a-side">11-a-side (Standard)</option>
                      <option value="9-a-side">9-a-side (Intermediate)</option>
                      <option value="7-a-side">7-a-side (Junior)</option>
                      <option value="5-a-side">5-a-side (Futsal / Mini)</option>
                    </select>
                    <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                </div>

                {/* Number of Pitches */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                    Number of Pitches <span className="text-[#E31B23]">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={numberOfPitches}
                      onChange={(e) => setNumberOfPitches(e.target.value)}
                      className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map((n) => (
                        <option key={n} value={String(n)}>{n} Pitch{n > 1 ? 'es' : ''} (Pitch A{n > 1 ? ` – ${String.fromCharCode(64 + n)}` : ''})</option>
                      ))}
                    </select>
                    <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                  <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">How many football pitches are available at the venue</p>
                </div>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Event Date <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Start Time <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  End Time <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="time" 
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Registration Deadline <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="date" 
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all" 
                />
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Last date to register for this event</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Venue Name <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g., City Sports Complex" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Full Address <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, City, State, ZIP" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Registration & Fees */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Registration & Fees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Registration Fee (£ / $)</label>
                <input 
                  type="text" 
                  value={eventFee}
                  onChange={(e) => setEventFee(e.target.value)}
                  placeholder="150" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Leave blank or enter 0 for free events</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Maximum Club Capacity</label>
                <input 
                  type="text" 
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  placeholder="e.g., 16 Teams" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Leave blank for unlimited capacity</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Event Description <span className="text-[#E31B23]">*</span>
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of the event, tournament structure, and expectations..." 
                  className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Requirements / What to Bring</label>
                <textarea 
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List any requirements, roster rules, kit regulations, etc." 
                  className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Contact Person <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full name" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Contact Phone <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+44 7123 456789" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Contact Email <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@club.com" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/25 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Event Image</h3>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Upload Event Banner</label>
              <div className="w-full border-2 border-dashed border-white/15 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-white/25 transition-all cursor-pointer bg-white/1 relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEventBanner(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {eventBanner ? (
                  <Image width={20} height={20} src={eventBanner} alt="Banner Preview" className="max-h-48 rounded-xl object-contain" />
                ) : (
                  <>
                    <IconUpload size={32} className="text-white/20" />
                    <p className="text-sm font-bold text-white/60">Click to upload or drag and drop image/*</p>
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Recommended: 1200x630 pixels for best display</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardModal>
    </div>
  );
};

export default ExtraEventsManagement;
