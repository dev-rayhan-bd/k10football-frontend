"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, ClipboardCheck, FileText, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { resolveChatMediaUrl } from "@/components/chat/ChatAvatar";
import { cn } from "@/lib/utils";
import { useGetCoachEvaluationsQuery } from "@/redux/features/evaluation/evaluationApi";
import type { CoachEvaluationStatusFilter, ICoachEvaluationRow } from "@/types/evaluation.type";
import { EvaluationReport } from "./EvaluationReport";
import { EvaluationSheet } from "./EvaluationSheet";
import { display, formatDate, isStatus, PLAYER_PLACEHOLDER_IMG } from "./utils";

const PAGE_LIMIT = 10;

type View = { mode: "evaluate" | "report"; row: ICoachEvaluationRow } | null;

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: "border-yellow-500/30 text-yellow-400",
  EVALUATED: "border-green-500/30 text-green-400",
  EXPIRED: "border-red-500/30 text-red-400",
};

const TABLE_HEADERS = ["Name", "Rating", "Academy", "Last Evaluated", "Next Due", "Status", "Actions"];

export const CoachPlayerEvaluation = () => {
  const [status, setStatus] = useState<CoachEvaluationStatusFilter>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError, refetch } = useGetCoachEvaluationsQuery({
    status,
    searchTerm: debouncedSearch || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const summary = data?.data?.summary;
  const players = data?.data?.players ?? [];
  const meta = data?.meta;
  const totalPage = meta?.totalPage ?? 1;

  const tabs: { value: CoachEvaluationStatusFilter; label: string; count?: number }[] = [
    { value: "PENDING", label: "Pending", count: summary?.pendingCount },
    { value: "EVALUATED", label: "Evaluated", count: summary?.evaluatedCount },
    { value: "EXPIRED", label: "Expired", count: summary?.expiredCount },
    { value: "ALL", label: "All", count: summary?.total },
  ];

  const changeTab = (next: CoachEvaluationStatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  if (view?.mode === "evaluate") {
    return <EvaluationSheet key={view.row._id} row={view.row} onClose={() => setView(null)} />;
  }
  if (view?.mode === "report") {
    return <EvaluationReport key={view.row._id} row={view.row} onClose={() => setView(null)} />;
  }

  const openRow = (row: ICoachEvaluationRow) => {
    if (row.canSubmit === true) setView({ mode: "evaluate", row });
    else if (isStatus(row, "EVALUATED")) setView({ mode: "report", row });
  };

  // A brand-new coach: nothing on the team and no academy requests at all.
  const isBrandNew = !!summary && summary.total === 0 && !debouncedSearch;

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div>
        <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white">Player Evaluation</h1>
        <p className="mt-2 text-sm text-gray-500">
          Grade your players every 4 months and respond to academy evaluation requests
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 overflow-x-auto border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => changeTab(tab.value)}
            className={cn(
              "relative cursor-pointer whitespace-nowrap pb-4 text-xs font-black uppercase tracking-widest transition-all",
              status === tab.value ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            {tab.label}
            {typeof tab.count === "number" ? ` (${tab.count})` : ""}
            {status === tab.value && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#E31B23]" />}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by player name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-12 w-full rounded-xl border border-white/10 bg-white/2 pl-12 pr-4 text-sm font-bold text-white transition-all placeholder:text-gray-600 focus:border-[#E31B23]/50 focus:outline-none"
        />
      </div>

      <div className="rounded-3xl border border-white/20 bg-[#0D0D0D] p-4 sm:p-8">
        {isLoading ? (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-max border-collapse whitespace-nowrap text-left">
              <TableHead />
              <tbody className="divide-y divide-white/4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 rounded-full bg-white/10" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-32 rounded bg-white/10" />
                          <div className="h-3 w-16 rounded bg-white/5" />
                        </div>
                      </div>
                    </td>
                    {[8, 32, 24, 24, 16].map((w, idx) => (
                      <td key={idx} className="px-4 py-4">
                        <div className="h-4 rounded bg-white/10" style={{ width: `${w * 4}px` }} />
                      </td>
                    ))}
                    <td className="px-4 py-4 text-right">
                      <div className="ml-auto h-8 w-28 rounded-lg bg-white/10" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-red-500/10 p-4 text-red-500">
              <AlertCircle size={40} />
            </div>
            <h3 className="mb-1 text-base font-bold text-white">Failed to Load Evaluations</h3>
            <p className="mb-4 text-xs text-gray-500">Something went wrong while fetching evaluations data.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-white/10"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-white/5 p-4 text-gray-600">
              <ClipboardCheck size={40} />
            </div>
            {isBrandNew ? (
              <>
                <h3 className="mb-1 text-base font-bold text-white">No Players to Evaluate Yet</h3>
                <p className="max-w-md text-xs text-gray-500">
                  Players on your team and evaluation requests from academies will appear here.
                </p>
              </>
            ) : (
              <>
                <h3 className="mb-1 text-base font-bold text-white">No Players Found</h3>
                <p className="text-xs text-gray-500">
                  {debouncedSearch ? "No players match your search." : "There are no players in this list right now."}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={cn("-mx-4 overflow-x-auto px-4 transition-opacity sm:mx-0 sm:px-0", isFetching && "opacity-60")}>
            <table className="w-full min-w-max border-collapse whitespace-nowrap text-left">
              <TableHead />
              <tbody className="divide-y divide-white/4">
                {players.map((row) => (
                  <PlayerRow
                    key={`${row._id}-${row.evaluationId ?? ""}`}
                    row={row}
                    onOpen={() => openRow(row)}
                    onEvaluate={() => setView({ mode: "evaluate", row })}
                    onReport={() => setView({ mode: "report", row })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && totalPage > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
            <span className="text-xs text-gray-500">
              Page {meta?.page ?? page} of {totalPage}
              {typeof meta?.total === "number" ? ` · ${meta.total} players` : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page >= totalPage || isFetching}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TableHead = () => (
  <thead>
    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
      {TABLE_HEADERS.map((h) => (
        <th key={h} className={cn("px-4 py-4", h === "Rating" && "text-center", h === "Actions" && "text-right")}>
          {h}
        </th>
      ))}
    </tr>
  </thead>
);

interface PlayerRowProps {
  row: ICoachEvaluationRow;
  onOpen: () => void;
  onEvaluate: () => void;
  onReport: () => void;
}

const PlayerRow = ({ row, onOpen, onEvaluate, onReport }: PlayerRowProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedAvatar = resolveChatMediaUrl(row.avatar);
  const avatarSrc = resolvedAvatar && !imgFailed ? resolvedAvatar : PLAYER_PLACEHOLDER_IMG;
  const statusKey = (row.status || "").toUpperCase();
  const isEvaluated = statusKey === "EVALUATED";
  const canSubmit = row.canSubmit === true;
  const clickable = canSubmit || isEvaluated;

  return (
    <tr
      onClick={clickable ? onOpen : undefined}
      className={cn("group transition-all", clickable && "cursor-pointer hover:bg-white/2")}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-gray-900">
            <Image
              src={avatarSrc}
              className="size-full object-cover"
              alt={row.name || "Player"}
              width={40}
              height={40}
              onError={() => setImgFailed(true)}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white transition-colors group-hover:text-red-500">
                {display(row.name)}
              </span>
              {row.requestedByAcademy && (
                <Badge
                  variant="outline"
                  className="border-[#E31B23]/40 text-[9px] font-black uppercase tracking-widest text-red-400"
                >
                  Requested by academy
                </Badge>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">{display(row.position)}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-sm font-black italic text-red-600">{display(row.rating)}</span>
      </td>
      <td className="px-4 py-4 text-sm font-semibold text-gray-300">{display(row.academy)}</td>
      <td className="px-4 py-4 text-sm text-gray-400">{formatDate(row.lastEvaluationDate) ?? "Never"}</td>
      <td className="px-4 py-4 text-sm text-gray-400">{display(formatDate(row.nextEvaluationDue))}</td>
      <td className="px-4 py-4">
        <Badge
          variant="outline"
          className={cn("text-[10px] font-black uppercase tracking-widest", STATUS_BADGE_CLASS[statusKey] ?? "text-gray-400")}
        >
          {display(row.status)}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-2">
          {isEvaluated && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReport();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/80 transition-all hover:bg-white/10"
            >
              <FileText size={12} /> Report
            </button>
          )}
          {canSubmit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEvaluate();
              }}
              className="cursor-pointer rounded-lg border border-[#E31B23] bg-[#E31B23] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#ff2d35]"
            >
              {statusKey === "PENDING" ? "Evaluate Player" : "Re-evaluate"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};
