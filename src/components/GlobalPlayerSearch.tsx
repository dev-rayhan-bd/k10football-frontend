/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAdjustmentsHorizontal, IconLoader2, IconSearch, IconX } from "@tabler/icons-react";
import { useGetPlayersQuery } from "@/redux/features/player/playerApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Filters supported by GET /players (global search). */
interface SearchFilters {
  position: string;
  country: string;
  minAge: string;
  maxAge: string;
  cvTier: string;
}

const EMPTY_FILTERS: SearchFilters = { position: "", country: "", minAge: "", maxAge: "", cvTier: "" };
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"];
const CV_TIERS = ["BRONZE", "SILVER", "GOLD"];
const RESULT_LIMIT = 8;
const DEBOUNCE_MS = 400;

const FIELD_CLASS =
  "h-9 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

/**
 * Header search: free text + position / country / age range / CV tier,
 * backed by GET /players. Results open the player's public CV.
 */
const GlobalPlayerSearch = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [open, setOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce typing so the API is called once the user pauses.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(term.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [term]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeFilterCount = Object.values(filters).filter((v) => v.trim() !== "").length;
  const hasCriteria = debouncedTerm !== "" || activeFilterCount > 0;

  const queryArgs = useMemo(
    () => ({
      searchTerm: debouncedTerm,
      position: filters.position.toLowerCase(),
      country: filters.country.trim(),
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      cvTier: filters.cvTier,
      page: 1,
      limit: RESULT_LIMIT,
    }),
    [debouncedTerm, filters]
  );

  const { data, isFetching, isError } = useGetPlayersQuery(queryArgs, { skip: !hasCriteria });
  const players: any[] = Array.isArray(data?.data) ? data.data : [];
  const total: number = data?.meta?.total ?? players.length;

  const setFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setOpen(true);
  };

  const clearAll = () => {
    setTerm("");
    setDebouncedTerm("");
    setFilters(EMPTY_FILTERS);
  };

  const openPlayer = (player: any) => {
    const id = player._id || player.id;
    if (!id) return;
    setOpen(false);
    router.push(`/cvs/player-cv-details?playerId=${id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
      <input
        type="text"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search By Age Range, Country, Gender And Positions..."
        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-20 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {(term || activeFilterCount > 0) && (
          <button
            type="button"
            onClick={clearAll}
            className="p-1 rounded-full text-gray-500 hover:text-white cursor-pointer"
            aria-label="Clear search"
          >
            <IconX size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setShowFilters((v) => !v);
            setOpen(true);
          }}
          className={cn(
            "relative p-1 rounded-full hover:text-white cursor-pointer",
            showFilters || activeFilterCount > 0 ? "text-primary" : "text-gray-500"
          )}
          aria-label="Search filters"
        >
          <IconAdjustmentsHorizontal size={18} />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {open && (showFilters || hasCriteria) && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl overflow-hidden">
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border-b border-border">
              <select
                value={filters.position}
                onChange={(e) => setFilter("position", e.target.value)}
                className={FIELD_CLASS}
                aria-label="Position"
              >
                <option value="">Any position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                value={filters.country}
                onChange={(e) => setFilter("country", e.target.value)}
                placeholder="Country"
                className={FIELD_CLASS}
                aria-label="Country"
              />
              <input
                type="number"
                min={0}
                value={filters.minAge}
                onChange={(e) => setFilter("minAge", e.target.value)}
                placeholder="Min age"
                className={FIELD_CLASS}
                aria-label="Minimum age"
              />
              <input
                type="number"
                min={0}
                value={filters.maxAge}
                onChange={(e) => setFilter("maxAge", e.target.value)}
                placeholder="Max age"
                className={FIELD_CLASS}
                aria-label="Maximum age"
              />
              <select
                value={filters.cvTier}
                onChange={(e) => setFilter("cvTier", e.target.value)}
                className={FIELD_CLASS}
                aria-label="CV tier"
              >
                <option value="">Any tier</option>
                {CV_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!hasCriteria ? (
            <p className="p-4 text-xs text-muted-foreground">Type a name or choose filters to search players.</p>
          ) : isFetching && players.length === 0 ? (
            <div className="flex items-center justify-center gap-2 p-6 text-xs text-muted-foreground">
              <IconLoader2 className="size-4 animate-spin" /> Searching players...
            </div>
          ) : isError ? (
            <p className="p-4 text-xs text-destructive">Search failed. Please try again.</p>
          ) : players.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No players found.</p>
          ) : (
            <>
              <ul className="max-h-96 overflow-y-auto divide-y divide-border">
                {players.map((p) => {
                  const name = p.fullName || p.userId?.name || "Player";
                  const meta = [p.position, p.country, p.age ? `${p.age} yrs` : ""].filter(Boolean).join(" · ");
                  const rating = Number(p.overallRating ?? p.fifaCardStats?.overallRating ?? 0);
                  return (
                    <li key={p._id || p.id}>
                      <button
                        type="button"
                        onClick={() => openPlayer(p)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent transition-colors cursor-pointer"
                      >
                        <Image
                          src={p.profileImage || p.fifaCardStats?.cardImage || "/profile_placeholder.png"}
                          alt={name}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 rounded-full object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate">{name}</p>
                          {meta && <p className="text-xs text-muted-foreground truncate">{meta}</p>}
                        </div>
                        {p.cvTier && <Badge variant="outline">{p.cvTier}</Badge>}
                        {rating > 0 && <span className="text-sm font-black text-primary w-8 text-right">{rating}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
                <span>
                  Showing {players.length} of {total}
                  {isFetching && <IconLoader2 className="inline size-3 ml-2 animate-spin" />}
                </span>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setFilters(EMPTY_FILTERS)}>
                    Reset filters
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalPlayerSearch;
