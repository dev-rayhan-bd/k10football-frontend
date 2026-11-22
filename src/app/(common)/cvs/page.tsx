"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchBar, { CvsFilterState, SearchTargetType } from "@/components/cvs/SearchBar";
import AnalyciesSection from "@/components/cvs/AnalyciesSection";
import ImageCarousel from "@/components/common/ImageCarousel";
import StartJourneySection from "@/components/common/StartJourneySection";
import Players from "@/components/cvs/PlayerSection";
import Coaches from "@/components/cvs/CoatchesSection";

const DEFAULT_FILTERS: CvsFilterState = {
  searchTarget: "",
  search: "",
  category: "",
  ageGroup: "",
  position: "",
};

const CVSPageContent = () => {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CvsFilterState>(() => ({
    searchTarget: (searchParams?.get("searchTarget") as SearchTargetType) || "",
    search: searchParams?.get("search") || "",
    category: searchParams?.get("category") || searchParams?.get("cvTier") || "",
    ageGroup: searchParams?.get("ageGroup") || "",
    position: searchParams?.get("position") || "",
  }));

  const handleFilterChange = useCallback((changes: Partial<CvsFilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...changes };
      const params = new URLSearchParams();
      if (next.searchTarget) params.set("searchTarget", next.searchTarget);
      if (next.search) params.set("search", next.search);
      if (next.category) params.set("category", next.category);
      if (next.ageGroup) params.set("ageGroup", next.ageGroup);
      if (next.position) params.set("position", next.position);
      const query = params.toString();
      const newUrl = query ? `/cvs?${query}` : "/cvs";
      window.history.replaceState(null, "", newUrl);
      return next;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    window.history.replaceState(null, "", "/cvs");
  }, []);

  return (
    <div className="min-h-screen">
      <SearchBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
      <AnalyciesSection />
      <Players filters={filters} onResetFilters={handleResetFilters} />
      <Coaches filters={filters} onResetFilters={handleResetFilters} />
      <ImageCarousel />
      <StartJourneySection />
    </div>
  );
};

const CVSPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <CVSPageContent />
    </Suspense>
  );
};

export default CVSPage;