"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Search, X, RotateCcw, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type SearchTargetType = "player" | "coach" | "";

export interface CvsFilterState {
  searchTarget: SearchTargetType;
  search: string;
  category: string;
  ageGroup: string;
  position: string;
}

interface SearchBarProps {
  filters?: CvsFilterState;
  onFilterChange?: (changes: Partial<CvsFilterState>) => void;
  onReset?: () => void;
}

const DEFAULT_FILTERS: CvsFilterState = {
  searchTarget: "",
  search: "",
  category: "",
  ageGroup: "",
  position: "",
};

const SearchBar = ({
  filters = DEFAULT_FILTERS,
  onFilterChange,
  onReset,
}: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [searchTarget, setSearchTarget] = useState<SearchTargetType>(filters.searchTarget || "");
  const [isSubmittedAttempted, setIsSubmittedAttempted] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setSearchTarget(filters.searchTarget || "");
  }, [filters.searchTarget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTarget) {
      setIsSubmittedAttempted(true);
      toast.error("Please select whether to search for Player or Coach before searching.");
      return;
    }

    onFilterChange?.({
      searchTarget,
      search: searchInput.trim(),
    });

    // Smooth-scroll to target section
    if (typeof window !== "undefined") {
      const sectionId = searchTarget === "coach" ? "coaches-section" : "players-section";
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange?.({ search: "" });
  };

  const handleTargetChange = (val: SearchTargetType) => {
    setSearchTarget(val);
    setIsSubmittedAttempted(false);
    onFilterChange?.({ searchTarget: val });
  };

  const hasActiveFilters = Boolean(
    filters.searchTarget || filters.search || filters.category || filters.ageGroup || filters.position
  );

  return (
    <section className="mb-6 sm:mb-10 bg-background text-foreground">
      {/* Header */}
      <div className="pt-8 sm:pt-16 pb-6 sm:pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight">
          Analysis{" "}
          <span className="text-primary font-bold">CVs</span>
        </h1>
      </div>

      {/* Search and Filters Container */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border shadow-xl">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            {/* Required Search Target Selector */}
            <div className="relative sm:w-52 shrink-0">
              <select
                value={searchTarget}
                onChange={(e) => handleTargetChange(e.target.value as SearchTargetType)}
                className={cn(
                  "w-full bg-input border rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition appearance-none cursor-pointer focus:outline-none focus:ring-1",
                  !searchTarget && isSubmittedAttempted
                    ? "border-destructive text-destructive bg-destructive/10 focus:ring-destructive animate-pulse"
                    : searchTarget
                    ? "border-primary/60 text-primary focus:ring-primary"
                    : "border-border text-foreground focus:ring-ring"
                )}
              >
                <option value="">Select Target *</option>
                <option value="player">👤 Player</option>
                <option value="coach">👔 Coach</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  searchTarget === "coach"
                    ? "Search coach by name, club, or country..."
                    : searchTarget === "player"
                    ? "Search player by name, position, or country..."
                    : "Select Player or Coach first, then search..."
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-10 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-primary text-black hover:bg-primary/90 font-semibold rounded-xl px-6 py-3 text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <Search size={18} />
              Search
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="bg-input border border-border hover:bg-white/10 text-gray-300 hover:text-white rounded-xl px-4 py-3 text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                title="Reset all filters"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </form>

          {/* Target Selector Validation Warning */}
          {!searchTarget && isSubmittedAttempted && (
            <p className="text-xs text-destructive font-medium -mt-2 mb-3">
              * Please choose whether you are searching for a <strong>Player</strong> or <strong>Coach</strong> to execute search.
            </p>
          )}

          {/* Advanced Filters Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
              <div className="size-5 rounded-full border border-border flex items-center justify-center">
                <ChevronDown size={14} />
              </div>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-orbitron">
                Advanced Filters {searchTarget ? `(${searchTarget === "coach" ? "Coaches" : "Players"})` : ""}
              </span>
            </div>
            {hasActiveFilters && (
              <span className="text-xs text-primary font-medium">
                Active filters applied
              </span>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category / Tier Dropdown */}
            <div className="relative">
              <select
                value={filters.category || ""}
                onChange={(e) => onFilterChange?.({ category: e.target.value })}
                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                <option value="GOLD">Gold Tier</option>
                <option value="SILVER">Silver Tier</option>
                <option value="BRONZE">Bronze Tier</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Age Groups Dropdown */}
            <div className="relative">
              <select
                value={filters.ageGroup || ""}
                disabled={searchTarget === "coach"}
                onChange={(e) => {
                  if (!searchTarget) handleTargetChange("player");
                  onFilterChange?.({ ageGroup: e.target.value });
                }}
                className={cn(
                  "w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer",
                  searchTarget === "coach" && "opacity-40 cursor-not-allowed"
                )}
              >
                <option value="">{searchTarget === "coach" ? "Age Group (Players only)" : "Select Age Group"}</option>
                <option value="16-20">16-20</option>
                <option value="18-24">18-24</option>
                <option value="18+">18+</option>
                <option value="25+">25+</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Position Dropdown */}
            <div className="relative">
              <select
                value={filters.position || ""}
                disabled={searchTarget === "coach"}
                onChange={(e) => {
                  if (!searchTarget) handleTargetChange("player");
                  onFilterChange?.({ position: e.target.value });
                }}
                className={cn(
                  "w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer",
                  searchTarget === "coach" && "opacity-40 cursor-not-allowed"
                )}
              >
                <option value="">{searchTarget === "coach" ? "Position (Players only)" : "Select Position"}</option>
                <option value="Forward">Forward (ST / RW / LW)</option>
                <option value="Midfielder">Midfielder (CAM / CM / CDM)</option>
                <option value="Defender">Defender (CB / LB / RB)</option>
                <option value="Goalkeeper">Goalkeeper (GK)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;