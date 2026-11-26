"use client";

import React from "react";
import EventsBrowser from "./EventsBrowser";

interface AcademyEventsListProps {
  academyId: string;
  /** Show search / type / age / date filters (default: true). */
  showFilters?: boolean;
  pageSize?: number;
  className?: string;
}

/** An academy's public events (for its public profile "Events" tab). */
const AcademyEventsList = ({ academyId, showFilters = true, pageSize = 6, className }: AcademyEventsListProps) => {
  if (!academyId) return null;
  return (
    <EventsBrowser
      key={academyId}
      academyId={academyId}
      showFilters={showFilters}
      pageSize={pageSize}
      className={className}
      gridClassName="lg:grid-cols-2 xl:grid-cols-3"
    />
  );
};

export default AcademyEventsList;
