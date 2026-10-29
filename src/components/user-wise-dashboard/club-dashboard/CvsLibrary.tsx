"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconFileText,
  IconHeart,
  IconShare,
  IconChevronDown,
  IconRefresh,
  IconUserOff,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  DashboardPageHeader,
  DashboardStatCard,
  DashboardSection,
} from "@/components/dashboard/DashboardElements";
import {
  useGetCvsLibraryQuery,
  useToggleLikeCvsPlayerMutation,
  useShareCvsPlayerMutation,
} from "@/redux/features/club/clubApi";
import { ICvsLibraryPlayer } from "@/types/club.type";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const playerPositionOptions = [
  { label: "All Positions", value: "ALL" },
  { label: "Forward", value: "FORWARD" },
  { label: "Midfielder", value: "MIDFIELDER" },
  { label: "Defender", value: "DEFENDER" },
  { label: "Goalkeeper", value: "GOALKEEPER" },
];

const statusOptions = [
  { label: "All Status", value: "ALL" },
  { label: "Gold", value: "GOLD" },
  { label: "Silver", value: "SILVER" },
  { label: "Bronze", value: "BRONZE" },
];

const CVsLibrary = () => {
  const router = useRouter();

  // Tab and Filter states
  const [activeTab, setActiveTab] = useState<"ALL" | "LIKED" | "SHARED">("ALL");
  const [position, setPosition] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query API: GET {{baseUrl}}/clubs/cvs-library
  const {
    data: cvsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCvsLibraryQuery({
    tab: activeTab,
    page,
    limit,
    position,
    status,
  });

  const [toggleLikeCvsPlayer] = useToggleLikeCvsPlayerMutation();
  const [shareCvsPlayer] = useShareCvsPlayerMutation();
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  const togglePlayerLike = async (p: ICvsLibraryPlayer) => {
    const key = p.playerId || p.id;
    const current = favMap[key] !== undefined ? favMap[key] : p.isLiked;
    const next = !current;

    setFavMap((prev) => ({ ...prev, [key]: next }));

    try {
      const res = await toggleLikeCvsPlayer(key).unwrap();
      if (res?.data?.isLiked !== undefined) {
        setFavMap((prev) => ({ ...prev, [key]: Boolean(res.data?.isLiked) }));
      }
    } catch {
      setFavMap((prev) => ({ ...prev, [key]: current })); // rollback
    }
  };

  const handleShare = async (p: ICvsLibraryPlayer) => {
    const key = p.playerId || p.id;
    try {
      const res = await shareCvsPlayer(key).unwrap();
      const shareUrl =
        res?.data?.shareableUrl ||
        p.shareableUrl ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/club/scouting-board/${key}`
          : "");

      if (typeof window !== "undefined" && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Profile link copied to clipboard");
      }
    } catch {
      const fallbackUrl =
        p.shareableUrl ||
        (typeof window !== "undefined"
          ? `${window.location.origin}/dashboard/club/scouting-board/${key}`
          : "");
      if (typeof window !== "undefined" && fallbackUrl) {
        await navigator.clipboard.writeText(fallbackUrl);
        toast.success("Profile link copied to clipboard");
      }
    }
  };

  const metrics = cvsResponse?.data?.metrics;
  const players = cvsResponse?.data?.data || [];
  const meta = cvsResponse?.data?.meta;

  const stats = [
    {
      key: "ALL" as const,
      label: metrics?.allCvs?.label || "ALL CVS",
      value: metrics?.allCvs?.count ?? 0,
      icon: IconFileText,
    },
    {
      key: "LIKED" as const,
      label: metrics?.likedCvs?.label || "LIKED CVS",
      value: metrics?.likedCvs?.count ?? 0,
      icon: IconHeart,
    },
    {
      key: "SHARED" as const,
      label: metrics?.profilesShared?.label || "PROFILES SHARED",
      value: metrics?.profilesShared?.count ?? 0,
      icon: IconShare,
    },
  ];

  const columns: Column<ICvsLibraryPlayer>[] = [
    {
      header: "Name",
      key: "name",
      render: (p) => {
        const avatarSrc = p.avatar || "/placeholder_img.jpg";
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={avatarSrc}
                className="size-10 rounded-full object-cover"
                alt={p.name}
                width={40}
                height={40}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{p.name}</div>
              <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
                {p.position || "FORWARD"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (p) => (
        <span className="text-sm font-black text-destructive italic">
          {p.rating || (p.rawRating ? (p.rawRating / 10).toFixed(1) : "—")}
        </span>
      ),
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.club || "—"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.country || "—"}</span>,
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => (
        <span>{p.age !== null && p.age !== undefined ? p.age : "—"}</span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (p) => {
        const s = (p.status || "BRONZE").toUpperCase();
        const badgeStyle =
          s === "GOLD"
            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            : s === "SILVER"
            ? "bg-slate-400/10 text-slate-300 border-slate-400/20"
            : "bg-orange-500/10 text-orange-500 border-orange-500/20";
        return (
          <span
            className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badgeStyle}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (p) => {
        const key = p.playerId || p.id;
        const isFav = favMap[key] !== undefined ? favMap[key] : p.isLiked;
        return (
          <TableActionButtons
            onView={() => router.push(`/dashboard/club/scouting-board/${key}`)}
            onHeart={() => togglePlayerLike(p)}
            onShare={() => handleShare(p)}
            isHeartFilled={isFav}
            heartColor={
              isFav
                ? "text-[#E31B23] border-[#E31B23]/40 bg-[#E31B23]/10"
                : undefined
            }
          />
        );
      },
    },
  ];

  // Filters with Country and Age Range removed per user instruction
  const filterAction = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <DropdownFilter
        value={position}
        onChange={(val) => {
          setPosition(val);
          setPage(1);
        }}
        options={playerPositionOptions}
      />
      <DropdownFilter
        value={status}
        onChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        options={statusOptions}
      />
    </div>
  );

  const resetFilters = () => {
    setPosition("ALL");
    setStatus("ALL");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 min-w-0">
      <DashboardPageHeader
        title="CVs Library"
        subtitle="View and manage athlete CVs"
      />

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => {
              setActiveTab(stat.key);
              setPage(1);
            }}
            className="cursor-pointer"
          >
            <DashboardStatCard
              label={stat.label}
              value={stat.value}
              icon={<stat.icon size={20} />}
            />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-8 border-b border-white/10 pb-4">
        {stats.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 text-sm font-bold transition-all cursor-pointer py-1",
              activeTab === tab.key
                ? "text-destructive border-b-2 border-destructive"
                : "text-gray-500 hover:text-white"
            )}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center justify-between gap-3 text-destructive">
          <p className="text-xs sm:text-sm font-semibold">
            Failed to load CVs library. Please check your connection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-destructive/30 text-white hover:bg-destructive/20 shrink-0 gap-1.5 cursor-pointer text-xs"
          >
            <IconRefresh size={14} /> Retry
          </Button>
        </div>
      )}

      {/* Main Section */}
      <DashboardSection action={filterAction}>
        {isLoading ? (
          <TableSkeleton rowCount={6} columnCount={7} />
        ) : players.length === 0 ? (
          <EmptyState
            title="No athlete CVs found"
            description={
              activeTab === "LIKED"
                ? "You haven't liked any player CVs yet. Browse and click the heart icon on any profile."
                : activeTab === "SHARED"
                ? "No shared profile records available."
                : "No athlete CVs match your filter criteria. Try resetting your position or status filters."
            }
            onReset={resetFilters}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <DashboardTable
              columns={columns}
              data={players}
              className="border-white/10"
            />

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                <span>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} athletes)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPages || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardSection>
    </div>
  );
};

interface DropdownFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

const DropdownFilter = ({ value, onChange, options }: DropdownFilterProps) => (
  <div className="relative inline-block flex-1 sm:flex-none min-w-fit">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-auto appearance-none flex items-center justify-between gap-2 px-3 sm:px-4 py-2 pr-8 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/10 focus:outline-none focus:border-white/25 transition-all cursor-pointer whitespace-nowrap"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#111111] text-white">
          {opt.label}
        </option>
      ))}
    </select>
    <IconChevronDown
      size={14}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
    />
  </div>
);

const EmptyState = ({
  title,
  description,
  onReset,
}: {
  title: string;
  description: string;
  onReset: () => void;
}) => (
  <div className="py-12 px-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center bg-white/[0.01]">
    <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
      <IconUserOff size={24} />
    </div>
    <div>
      <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
      <p className="text-xs text-white/40 mt-1 max-w-sm">{description}</p>
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={onReset}
      className="mt-2 border-white/20 text-white hover:bg-white/10 cursor-pointer text-xs"
    >
      Reset Filters
    </Button>
  </div>
);

const TableSkeleton = ({
  rowCount = 5,
  columnCount = 7,
}: {
  rowCount?: number;
  columnCount?: number;
}) => (
  <div className="border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-10 bg-white/5 border-b border-white/10" />
    <div className="divide-y divide-white/5">
      {Array.from({ length: rowCount }).map((_, r) => (
        <div key={r} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <div className="size-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3 w-3/4 rounded bg-white/10" />
              <div className="h-2 w-1/2 rounded bg-white/5" />
            </div>
          </div>
          {Array.from({ length: columnCount - 2 }).map((_, c) => (
            <div key={c} className="h-3 w-16 rounded bg-white/5 hidden sm:block" />
          ))}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CVsLibrary;
