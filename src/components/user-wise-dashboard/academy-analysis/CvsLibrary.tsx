"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFileText,
  IconHeart,
  IconHeartFilled,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconShare,
  IconX,
} from "@tabler/icons-react";
import { resolveChatMediaUrl } from "@/components/chat/ChatAvatar";
import {
  useGetAcademyCvsLibraryQuery,
  useShareAcademyCvMutation,
  useToggleAcademyCvLikeMutation,
} from "@/redux/features/academy/academyApi";
import { getApiError } from "@/redux/features/cvValidation/cvValidationApi";
import type { AcademyCvsTab, IAcademyCvsLibraryItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

const ALL = "ALL";

/**
 * filterOptions items are { value, label }; tolerate plain strings too. "ALL" is the
 * no-filter entry — it maps to "" here so the param is omitted.
 */
const toOptions = (items: unknown, allLabel: string): { value: string; label: string }[] => {
  const list = Array.isArray(items) ? items : [];
  const options = list
    .map((item) => {
      if (typeof item === "string") return { value: item, label: item };
      const record = item as { value?: unknown; label?: unknown } | null;
      const value = record?.value != null ? String(record.value) : "";
      return value ? { value, label: record?.label != null ? String(record.label) : value } : null;
    })
    .filter((option): option is { value: string; label: string } => option !== null);
  const all = options.find((option) => option.value.toUpperCase() === ALL);
  return [
    { value: "", label: all?.label || allLabel },
    ...options.filter((option) => option.value.toUpperCase() !== ALL),
  ];
};

const TABS: { value: AcademyCvsTab; label: string; icon: typeof IconFileText }[] = [
  { value: "ALL", label: "All CVs", icon: IconFileText },
  { value: "LIKED", label: "Liked CVs", icon: IconHeart },
  { value: "SHARED", label: "Profiles Shared", icon: IconEye },
];

const STATUS_STYLES: Record<string, string> = {
  GOLD: "bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/40",
  SILVER: "bg-white/10 text-[#CBD5E1] border-[#CBD5E1]/30",
  BRONZE: "bg-[#CD7F32]/15 text-[#E0955A] border-[#CD7F32]/40",
};

/** null / '' → "—" (never invent values). */
const show = (value: unknown) => (value === null || value === undefined || value === "" ? "—" : String(value));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const LibraryStatCard = ({
  icon: Icon,
  value,
  label,
  isLoading,
}: {
  icon: typeof IconFileText;
  value: number | undefined;
  label: string;
  isLoading: boolean;
}) => (
  <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-2xl border border-white/20 bg-[#111111] p-8">
    <div className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/5">
      <Icon size={20} className="text-white/60" />
    </div>
    <div>
      <p className="font-orbitron text-4xl font-black text-white">{isLoading ? "..." : (value ?? 0)}</p>
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{label}</p>
    </div>
  </div>
);

const PlayerAvatar = ({ src, name }: { src: string | null; name: string }) => {
  const resolved = resolveChatMediaUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(resolved) && failedSrc !== resolved;

  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolved} alt={name} className="size-full object-cover" onError={() => setFailedSrc(resolved)} />
      ) : (
        <span className="text-xs font-black text-white/70">{initials(name)}</span>
      )}
    </div>
  );
};

const FilterSelect = ({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="relative w-full sm:w-auto">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={cn(
        "h-10 w-full cursor-pointer appearance-none rounded-xl border border-white/20 bg-black/40 pl-4 pr-9 text-[10px] font-black uppercase tracking-wider focus:border-white/40 focus:outline-none sm:w-auto",
        value ? "text-white" : "text-white/60"
      )}
    >
      {children}
    </select>
    <IconChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
  </div>
);

const CvsLibrary = () => {
  const router = useRouter();
  const [tab, setTab] = useState<AcademyCvsTab>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [position, setPosition] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const { data, isLoading, isFetching, error, refetch } = useGetAcademyCvsLibraryQuery({
    tab,
    searchTerm: searchTerm || undefined,
    position: position || undefined,
    ageRange: ageRange || undefined,
    status: status || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const [toggleLike] = useToggleAcademyCvLikeMutation();
  const [shareCv] = useShareAcademyCvMutation();
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [pendingShareId, setPendingShareId] = useState<string | null>(null);

  const library = data?.data;
  const metrics = library?.metrics;
  const filterOptions = library?.filterOptions;
  const positionOptions = toOptions(filterOptions?.positions, "All Positions");
  const ageRangeOptions = toOptions(filterOptions?.ageRanges, "All Ages");
  const statusOptions = toOptions(filterOptions?.statuses, "All Status");
  const rows = library?.data ?? [];
  const meta = library?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const errorMessage = error ? getApiError(error, "Failed to load the CVs library").message : "";
  const hasFilters = Boolean(searchTerm || position || ageRange || status);

  // Every filter, tab or search change goes back to page 1.
  const withPageReset =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPage(1);
    };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  const handleLike = async (row: IAcademyCvsLibraryItem) => {
    if (pendingLikeId) return;
    setPendingLikeId(row.playerId);
    try {
      const res = await toggleLike(row.playerId).unwrap();
      toast.success(res?.data?.message || res?.message || (res?.data?.isLiked ? "CV liked" : "CV unliked"));
    } catch (err) {
      const { status: code, message } = getApiError(err, "Failed to update like");
      if (code !== 401) toast.error(message);
    } finally {
      setPendingLikeId(null);
    }
  };

  const handleShare = async (row: IAcademyCvsLibraryItem) => {
    if (pendingShareId) return;
    setPendingShareId(row.playerId);
    try {
      const res = await shareCv(row.playerId).unwrap();
      const url = res?.data?.shareableUrl || row.shareableUrl;
      const message = res?.data?.message || res?.message || "Profile shared";
      if (url) {
        try {
          await navigator.clipboard.writeText(url);
          toast.success(message, { description: "Link copied to clipboard" });
        } catch {
          toast.success(message, { description: url });
        }
      } else {
        toast.success(message);
      }
    } catch (err) {
      const { status: code, message } = getApiError(err, "Failed to share profile");
      if (code !== 401) toast.error(message);
    } finally {
      setPendingShareId(null);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-8 overflow-x-hidden pb-10 md:overflow-x-visible">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-orbitron text-3xl font-black uppercase tracking-tight text-white md:text-5xl">CVs Library</h1>
          <p className="mt-2 text-sm font-medium text-white/60 md:text-lg">View and manage athlete CVs</p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <div className="relative flex-1 md:w-80">
            <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search name, club, position, country..."
              className="h-11 w-full rounded-xl border border-white/20 bg-[#111111] pl-10 pr-9 text-xs text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white/40 hover:text-white"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh"
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <IconRefresh size={18} className={cn(isFetching && "animate-spin text-white")} />
          </button>
        </div>
      </div>

      {/* Summary Container */}
      <div className="flex w-full min-w-0 flex-col gap-6 rounded-3xl border border-white/15 bg-[#111111] p-6 md:gap-10 md:rounded-[40px] md:p-10">
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
          <LibraryStatCard icon={IconFileText} value={metrics?.allCvs?.count} label={metrics?.allCvs?.label || "All CVs"} isLoading={isLoading} />
          <LibraryStatCard icon={IconHeart} value={metrics?.likedCvs?.count} label={metrics?.likedCvs?.label || "Liked CVs"} isLoading={isLoading} />
          <LibraryStatCard
            icon={IconEye}
            value={metrics?.profilesShared?.count}
            label={metrics?.profilesShared?.label || "Profiles Shared"}
            isLoading={isLoading}
          />
        </div>
        {/* Tabs */}
        <div className="no-scrollbar flex w-full min-w-0 gap-4 overflow-x-auto whitespace-nowrap border-b border-white/15 md:gap-8">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => withPageReset(setTab)(value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 border-b-2 pb-4 transition-all",
                tab === value ? "border-white text-white" : "border-transparent text-white/40 hover:text-white/60"
              )}
            >
              <Icon size={18} />
              <span className="text-xs font-black uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex w-full min-w-0 flex-col gap-6 rounded-3xl border border-white/20 bg-[#111111] p-6 md:gap-8 md:rounded-[40px] md:p-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 sm:justify-end">
          {[
            { key: "position", value: position, set: setPosition, options: positionOptions, label: "Filter by position" },
            { key: "ageRange", value: ageRange, set: setAgeRange, options: ageRangeOptions, label: "Filter by age range" },
            { key: "status", value: status, set: setStatus, options: statusOptions, label: "Filter by status" },
          ].map((filter) => (
            <FilterSelect key={filter.key} value={filter.value} onChange={withPageReset(filter.set)} label={filter.label}>
              {filter.options.map((option) => (
                <option key={option.value || "all"} value={option.value} className="bg-[#111111]">
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          ))}
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-2xl border border-white/20">
          <div className="min-w-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/20 bg-white/5">
                  {["Name", "Rating", "Club", "Country", "Age", "Status", "Actions"].map((heading, idx, arr) => (
                    <th
                      key={heading}
                      className={cn(
                        "px-6 py-4 text-[10px] font-black uppercase tracking-wider text-white",
                        idx > 0 && "text-center",
                        idx < arr.length - 1 && "border-r border-white/20"
                      )}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={cn("divide-y divide-white/20 transition-opacity", isFetching && !isLoading && "opacity-60")}>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="border-r border-white/20 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-white/10" />
                          <div className="h-4 w-36 rounded bg-white/10" />
                        </div>
                      </td>
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="border-r border-white/20 px-6 py-5 last:border-r-0">
                          <div className="mx-auto h-4 w-14 rounded bg-white/10" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : errorMessage ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <IconAlertCircle size={28} className="text-destructive" />
                        <p className="text-sm font-bold text-white">{errorMessage}</p>
                        <button
                          type="button"
                          onClick={() => refetch()}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                        >
                          <IconRefresh size={14} /> Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm font-medium text-white/40">
                      {hasFilters
                        ? "No CVs match your search or filters."
                        : tab === "LIKED"
                          ? "You haven't liked any CVs yet."
                          : tab === "SHARED"
                            ? "You haven't shared any profiles yet."
                            : "No CVs in the library yet."}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.playerId} className="transition-colors hover:bg-white/2">
                      <td className="border-r border-white/20 px-6 py-5">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar src={row.avatar} name={row.name || "?"} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black uppercase text-white">{show(row.name)}</p>
                            <p className="truncate text-[10px] font-bold uppercase text-red-500">{show(row.position)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="border-r border-white/20 px-6 py-5 text-center">
                        <span className="font-orbitron text-lg font-black text-red-600">{show(row.rating)}</span>
                      </td>
                      <td className="border-r border-white/20 px-6 py-5 text-center">
                        <span className="text-sm font-black text-white">{show(row.club)}</span>
                      </td>
                      <td className="border-r border-white/20 px-6 py-5 text-center">
                        <span className="text-sm font-medium text-white/60">{show(row.country)}</span>
                      </td>
                      <td className="border-r border-white/20 px-6 py-5 text-center">
                        <span className="font-orbitron text-sm font-black text-white/60">{show(row.age)}</span>
                      </td>
                      <td className="border-r border-white/20 px-6 py-5 text-center">
                        {row.status ? (
                          <span
                            className={cn(
                              "rounded-full border px-4 py-1 text-[10px] font-black uppercase",
                              STATUS_STYLES[String(row.status).toUpperCase()] ?? "border-white/20 bg-white/5 text-white/60"
                            )}
                          >
                            {row.status}
                          </span>
                        ) : (
                          <span className="text-white/60">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => router.push(`/cvs/player-cv-details?playerId=${row.playerId}`)}
                            title="View CV"
                            aria-label={`View ${row.name}'s CV`}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/40 transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:text-white"
                          >
                            <IconEye size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLike(row)}
                            disabled={pendingLikeId === row.playerId}
                            title={row.isLiked ? "Unlike" : "Like"}
                            aria-pressed={row.isLiked}
                            aria-label={row.isLiked ? `Unlike ${row.name}` : `Like ${row.name}`}
                            className={cn(
                              "flex size-10 cursor-pointer items-center justify-center rounded-xl border transition-all hover:scale-105 disabled:cursor-wait",
                              row.isLiked
                                ? "border-red-500/40 bg-red-500/10 text-red-500"
                                : "border-white/20 bg-white/5 text-white/40 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
                            )}
                          >
                            {pendingLikeId === row.playerId ? (
                              <IconLoader2 size={18} className="animate-spin" />
                            ) : row.isLiked ? (
                              <IconHeartFilled size={18} />
                            ) : (
                              <IconHeart size={18} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShare(row)}
                            disabled={pendingShareId === row.playerId}
                            title={row.shareCount ? `Share (shared ${row.shareCount}×)` : "Share"}
                            aria-label={`Share ${row.name}'s CV`}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/40 transition-all hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-500 disabled:cursor-wait"
                          >
                            {pendingShareId === row.playerId ? <IconLoader2 size={18} className="animate-spin" /> : <IconShare size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs text-white/50">
            <p>
              Page <span className="font-bold text-white">{meta?.page ?? page}</span> of{" "}
              <span className="font-bold text-white">{totalPages}</span> ({meta?.total ?? 0} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
                className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
                className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CvsLibrary;
