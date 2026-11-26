"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconAlertCircle,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconCreditCard,
  IconHourglassEmpty,
  IconMoodEmpty,
  IconRefresh,
  IconSearch,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import ChatAvatar from "@/components/chat/ChatAvatar";
import { Input } from "@/components/ui/input";
import { useGetCoachPlayerCvValidationsQuery } from "@/redux/features/coach/coachApi";
import { ICoachPlayerCvValidationPlayer } from "@/types/coach.type";
import { cn } from "@/lib/utils";
import { ValidatePlayerCvModal } from "./player-cv/ValidatePlayerCvModal";

const PAGE_LIMIT = 10;

const STATUS_TABS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { value: "VERIFIED", label: "Verified" },
  { value: "EXPIRED", label: "Expired" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  AWAITING_PAYMENT: "bg-white/5 text-muted-foreground border-white/15",
  VERIFIED: "bg-green-500/10 text-green-500 border-green-500/20",
  EXPIRED: "bg-destructive/10 text-destructive border-destructive/20",
};

const StatusBadge = ({ status, compact }: { status?: string; compact?: boolean }) => {
  const norm = (status || "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-block rounded-full border font-bold uppercase tracking-widest whitespace-nowrap",
        compact ? "px-2.5 py-0.5 text-[9px]" : "px-4 py-1 text-[10px]",
        STATUS_STYLES[norm] || "bg-white/5 text-muted-foreground border-white/15"
      )}
    >
      {norm ? norm.replace(/_/g, " ") : "—"}
    </span>
  );
};

const formatLastValidated = (value?: string | null) => {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getPlayerId = (player: ICoachPlayerCvValidationPlayer) => player._id || player.id || "";

const PlayerCvValidationsSkeleton = () => (
  <div className="flex flex-col gap-6 md:gap-8 pb-12 animate-pulse w-full">
    <div className="h-9 w-64 bg-white/10 rounded-xl" />
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="h-32 rounded-2xl border border-white/20 bg-[#0D0D0D]" />
      ))}
    </div>
    <div className="h-96 rounded-3xl border border-white/20 bg-[#0D0D0D]" />
  </div>
);

const PlayerCVValidations = () => {
  const router = useRouter();
  const [status, setStatus] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [validatingPlayer, setValidatingPlayer] = useState<ICoachPlayerCvValidationPlayer | null>(null);

  // Debounce search; any filter change goes back to page 1.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const {
    data: validationsResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetCoachPlayerCvValidationsQuery({ status, searchTerm, page, limit: PAGE_LIMIT });

  const summary = validationsResponse?.data?.summary;
  const players = useMemo(() => validationsResponse?.data?.players || [], [validationsResponse]);
  const meta = validationsResponse?.meta;
  const totalPage = Math.max(1, meta?.totalPage || 1);

  const stats = [
    { label: "Pending Validations", value: summary?.pendingValidations ?? 0, icon: IconClock },
    { label: "Verified CVs", value: summary?.verifiedCvs ?? 0, icon: IconCircleCheck },
    { label: "Updated This Month", value: summary?.updatedThisMonth ?? 0, icon: IconCalendar },
    { label: "Expired", value: summary?.expiredStatus ?? 0, icon: IconHourglassEmpty },
    { label: "Awaiting Payment", value: summary?.awaitingPayment ?? 0, icon: IconCreditCard },
  ];

  const openPlayer = (player: ICoachPlayerCvValidationPlayer, validate = false) => {
    const params = new URLSearchParams();
    if (player.canValidate === true) params.set("canValidate", "true");
    if (validate && player.canValidate === true) params.set("validate", "true");
    const qs = params.toString();
    router.push(`/dashboard/coach/player-cv-validations/${getPlayerId(player)}${qs ? `?${qs}` : ""}`);
  };

  // ✓ only when the API says this coach can validate this request right now.
  const renderActions = (player: ICoachPlayerCvValidationPlayer) => (
    <TableActionButtons
      onView={() => openPlayer(player)}
      onVerify={player.canValidate === true ? () => setValidatingPlayer(player) : undefined}
    />
  );

  const columns: Column<ICoachPlayerCvValidationPlayer>[] = [
    {
      header: "Name",
      key: "name",
      render: (player) => (
        <div className="flex items-center gap-3">
          <ChatAvatar src={player.avatar} name={player.name} className="size-10" />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{player.name || "—"}</div>
            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{player.position || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (player) => <span className="text-sm font-black text-red-600 italic">{player.rating ?? "—"}</span>,
    },
    {
      header: "Club/Current",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (player) => player.club || "—",
    },
    { header: "Goals", key: "goals", align: "center", cellClassName: "text-sm text-gray-400", render: (p) => p.goals ?? 0 },
    { header: "Assists", key: "assists", align: "center", cellClassName: "text-sm text-gray-400", render: (p) => p.assists ?? 0 },
    {
      header: "Last Validated",
      key: "lastValidated",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (player) => formatLastValidated(player.lastValidated),
    },
    { header: "Status", key: "status", align: "center", render: (player) => <StatusBadge status={player.status} /> },
    { header: "Actions", key: "actions", align: "right", render: renderActions },
  ];

  if (isLoading) return <PlayerCvValidationsSkeleton />;

  // The access gate answers 402 (no subscription) or 403 (not academy-verified).
  const gateStatus = (error as { status?: unknown } | undefined)?.status;
  const isGateError = gateStatus === 402 || gateStatus === 403;
  const gateMessage = isGateError ? (error as { data?: { message?: string } } | undefined)?.data?.message : undefined;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-destructive/20 rounded-3xl bg-[#0D0D0D] my-8">
        <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-4">
          <IconAlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-white uppercase italic tracking-tight mb-2">
          {isGateError ? "Subscribe / get academy-approved" : "Failed to Load Player CV Validations"}
        </h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          {gateMessage ||
            (isGateError
              ? "CV validations need an active coach subscription and approval from your academy."
              : "Please check your connection and try again.")}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#c0161d] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
        >
          <IconRefresh size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
            Player CV Validations
          </h1>
          {isFetching && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400 animate-pulse">
              <IconRefresh size={13} className="animate-spin text-[#E31B23]" />
              Updating...
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs md:text-sm mt-1">Paid validation requests from players and parents</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-4 sm:p-6 rounded-2xl border border-white/20 bg-[#0D0D0D] flex flex-col gap-3 sm:gap-4">
            <div className="size-8 sm:size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <stat.icon className="size-4 sm:size-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl md:text-3xl font-black text-white italic mb-1">{stat.value}</div>
              <div className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-black tracking-widest leading-tight line-clamp-2">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-3xl border border-white/20 bg-[#0D0D0D] w-full max-w-full overflow-hidden flex flex-col gap-5">
        {/* Tabs + search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer",
                  status === tab.value
                    ? "bg-[#E31B23] border-[#E31B23] text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search players..."
              className="pl-9 bg-white/5 border-white/10"
            />
          </div>
        </div>

        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-2xl">
            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 mb-3">
              <IconMoodEmpty size={24} />
            </div>
            <p className="text-sm font-semibold text-white">No validations found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {searchTerm || status !== "ALL"
                ? "No requests match the current filter."
                : "Validation requests appear here once a player or parent picks you as their coach."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="lg:hidden flex flex-col gap-4">
              {players.map((player) => (
                <div key={getPlayerId(player)} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ChatAvatar src={player.avatar} name={player.name} className="size-10" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{player.name || "—"}</div>
                        <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{player.position || "—"}</div>
                      </div>
                    </div>
                    <div className="text-xl font-black text-red-600 italic">{player.rating ?? "—"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black block">Club/Current</span>
                      <span className="text-white">{player.club || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black block mb-1">Status</span>
                      <StatusBadge status={player.status} compact />
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black block">Goals / Assists</span>
                      <span className="text-white">{player.goals ?? 0} / {player.assists ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-black block">Last Validated</span>
                      <span className="text-white">{formatLastValidated(player.lastValidated)}</span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-white/10">{renderActions(player)}</div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden lg:block overflow-x-auto">
              <DashboardTable
                columns={columns}
                data={players}
                className="border-white/10 min-w-150"
                onRowClick={(player) => openPlayer(player)}
              />
            </div>

            {/* Pagination */}
            {totalPage > 1 && (
              <div className="flex items-center justify-between gap-3 text-xs text-gray-400">
                <span>
                  Page {page} of {totalPage} · {meta?.total ?? players.length} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="size-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <IconChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPage || isFetching}
                    onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                    className="size-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <IconChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ValidatePlayerCvModal
        isOpen={Boolean(validatingPlayer)}
        onClose={() => setValidatingPlayer(null)}
        playerId={validatingPlayer ? getPlayerId(validatingPlayer) : ""}
        playerName={validatingPlayer?.name || "Player"}
      />
    </div>
  );
};

export default PlayerCVValidations;
