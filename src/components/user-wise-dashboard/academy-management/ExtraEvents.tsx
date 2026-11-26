/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { IconPlus, IconCalendar } from "@tabler/icons-react";
import { toast } from "sonner";
import { 
  useGetExtraEventsMetaQuery,
  useGetExtraEventsQuery 
} from "@/redux/features/academy/academyApi";
import { 
  ExtraEventsFilterBar,
  ExtraEventCard,
  CreateExtraEventModal,
  TOURNAMENT_PRESET_LOGOS,
  CLUB_PRESET_LOGOS,
  TIME_OPTIONS,
  events,
  getStoredEvents,
  saveStoredEvents,
  parseTimeToMinutes,
  formatTo12Hour
} from "./extra-events";

// Re-exports for backward compatibility
export { 
  TOURNAMENT_PRESET_LOGOS, 
  CLUB_PRESET_LOGOS, 
  TIME_OPTIONS, 
  events, 
  getStoredEvents, 
  saveStoredEvents,
  parseTimeToMinutes,
  formatTo12Hour,
  ExtraEventsFilterBar,
  ExtraEventCard,
  CreateExtraEventModal
};

interface ExtraEventsManagementProps {
  readOnly?: boolean;
  basePath?: string;
}

export const ExtraEventsManagement = ({ readOnly = false, basePath }: ExtraEventsManagementProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // RTK Query API Hooks
  const { data: metaResponse } = useGetExtraEventsMetaQuery();
  const meta = metaResponse?.data;

  const { data: eventsResponse, isLoading: isEventsLoading } = useGetExtraEventsQuery({
    status: selectedStatus || undefined,
    date: selectedDate || undefined,
  });

  const handleCopyEventLink = (eventId: string | number) => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const path = `${basePath || "/dashboard/academy/management/extra-events"}/${eventId}`;
      const url = origin + path;
      navigator.clipboard.writeText(url);
      toast.success("Event link copied to clipboard!");
    }
  };

  const statusOptionsList = meta?.statusOptions || [
    "OPEN",
    "CLOSING SOON",
    "CLOSED"
  ];

  const dateFiltersList = meta?.dateFilters || [
    "today",
    "this_week",
    "this_month",
    "upcoming",
    "past"
  ];

  const displayedEvents = eventsResponse?.data?.events ?? [];

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Extra Events
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Manage special events and activities
          </p>
        </div>
        {!readOnly && (
          <button 
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            <IconPlus size={20} className="shrink-0" />
            <span className="text-sm font-bold uppercase tracking-widest truncate">Create Event</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <ExtraEventsFilterBar
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={statusOptionsList}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        dateFilters={dateFiltersList}
      />

      {/* Event Cards Grid */}
      {isEventsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-[#111111] rounded-4xl border border-white/10 p-5 md:p-6 flex flex-col gap-5 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="w-16 h-6 rounded-xl bg-white/5 shimmer" />
                <div className="size-10 rounded-xl bg-white/5 shimmer" />
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-3/4 h-6 rounded bg-white/5 shimmer" />
                <div className="flex flex-col gap-3">
                  <div className="w-1/2 h-4 rounded bg-white/5 shimmer" />
                  <div className="w-1/3 h-4 rounded bg-white/5 shimmer" />
                  <div className="w-1/3 h-4 rounded bg-white/5 shimmer" />
                </div>
              </div>
              <div className="flex gap-2 mt-auto w-full">
                <div className="flex-1 h-10 rounded-2xl bg-white/5 shimmer" />
                <div className="size-10 rounded-2xl bg-white/5 shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-white/40">
            <IconCalendar size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-black uppercase text-white font-orbitron">No Extra Events Found</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">
              {selectedStatus || selectedDate
                ? "No events match the selected filters. Try changing or clearing filters."
                : "You haven't created any extra events yet. Click 'Create Event' to get started."}
            </p>
          </div>
          {(selectedStatus || selectedDate) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("");
                setSelectedDate("");
              }}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayedEvents.map((event) => (
            <ExtraEventCard 
              key={event._id || event.id} 
              event={event} 
              onCopyLink={handleCopyEventLink} 
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {!readOnly && (
        <CreateExtraEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          meta={meta}
        />
      )}
    </div>
  );
};

export default ExtraEventsManagement;
