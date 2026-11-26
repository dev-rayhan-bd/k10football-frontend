"use client";

import React, { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { IPublicEventListParams } from "@/types/extraEvent.type";

export type EventFilterState = Required<Pick<IPublicEventListParams, "when" | "openOnly">> & {
  searchTerm: string;
  eventType: string;
  ageGroup: string;
  targetAttendees: string;
};

export const DEFAULT_EVENT_FILTERS: EventFilterState = {
  searchTerm: "",
  eventType: "ALL",
  ageGroup: "ALL",
  targetAttendees: "ALL",
  when: "upcoming",
  openOnly: false,
};

interface EventFiltersProps {
  value: EventFilterState;
  onChange: (next: EventFilterState) => void;
  options: { eventTypes: string[]; ageGroups: string[]; targetAttendees: string[] };
}

const FilterSelect = ({
  label,
  value,
  onValueChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
}) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <Label className="text-xs text-foreground/60">{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={allLabel || "All"} />
      </SelectTrigger>
      <SelectContent>
        {allLabel && <SelectItem value="ALL">{allLabel}</SelectItem>}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

const EventFilters = ({ value, onChange, options }: EventFiltersProps) => {
  // Debounce the search box; the other filters apply immediately.
  const [search, setSearch] = useState(value.searchTerm);
  useEffect(() => {
    if (search === value.searchTerm) return;
    const timer = setTimeout(() => onChange({ ...value, searchTerm: search }), 400);
    return () => clearTimeout(timer);
  }, [search, value, onChange]);

  const set = <K extends keyof EventFilterState>(key: K, v: EventFilterState[K]) => onChange({ ...value, [key]: v });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-cardBg p-4">
      <div className="relative">
        <IconSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/50" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events, academies, venues…"
          className="pl-9"
          aria-label="Search events"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <FilterSelect
          label="Event type"
          value={value.eventType}
          onValueChange={(v) => set("eventType", v)}
          options={toOptions(options.eventTypes)}
          allLabel="All types"
        />
        <FilterSelect
          label="Age group"
          value={value.ageGroup}
          onValueChange={(v) => set("ageGroup", v)}
          options={toOptions(options.ageGroups)}
          allLabel="All ages"
        />
        <FilterSelect
          label="Who it's for"
          value={value.targetAttendees}
          onValueChange={(v) => set("targetAttendees", v)}
          options={toOptions(options.targetAttendees)}
          allLabel="Everyone"
        />
        <FilterSelect
          label="When"
          value={value.when}
          onValueChange={(v) => set("when", v as EventFilterState["when"])}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "all", label: "All dates" },
          ]}
        />
        <div className="flex items-end">
          <Label className="flex h-9 cursor-pointer items-center gap-2 text-sm">
            <Switch checked={value.openOnly} onCheckedChange={(checked) => set("openOnly", checked)} />
            Open for registration
          </Label>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
