"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  IconUsers, 
  IconHeart, 
  IconShare, 
  IconEye,
  IconChevronDown,
  IconRefresh,
  IconUserOff,
} from "@tabler/icons-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { useGetClubAnalyticsQuery } from "@/redux/features/club/clubApi";
import { ITopPlayerEngagedItem } from "@/types/club.type";
import { Button } from "@/components/ui/button";

const positionOptions = [
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

const yearOptions = [
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
  { label: "2028", value: "2028" },
  { label: "2029", value: "2029" },
  { label: "2030", value: "2030" },
];

const Analytics = () => {
  const router = useRouter();

  // Filter States
  const [year, setYear] = useState("2026");
  const [position, setPosition] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: GET {{baseUrl}}/clubs/analytics?year=2026&page=1&limit=10&position=...&status=...
  const {
    data: analyticsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClubAnalyticsQuery({
    year,
    page,
    limit,
    position,
    status,
  });

  const analyticsData = analyticsResponse?.data;
  const metrics = analyticsData?.metrics;
  const timelineData = analyticsData?.playersAndCoachesMonitored || [];
  const distributionData = analyticsData?.positionInterestDistribution || [];
  const topPlayers = analyticsData?.topPlayersEngaged?.data || [];
  const meta = analyticsData?.topPlayersEngaged?.meta;

  const stats = [
    {
      label: metrics?.playersProfileViewed?.label || "PLAYERS PROFILE VIEWED",
      value: metrics?.playersProfileViewed?.count ?? 0,
      icon: IconUsers,
    },
    {
      label: metrics?.likedCvs?.label || "LIKED CVS",
      value: metrics?.likedCvs?.count ?? 0,
      icon: IconHeart,
    },
    {
      label: metrics?.sharedProfiles?.label || "SHARED PROFILES",
      value: metrics?.sharedProfiles?.count ?? 0,
      icon: IconShare,
    },
    {
      label: metrics?.profileViews?.label || "PROFILE VIEWS",
      value: metrics?.profileViews?.count ?? 0,
      icon: IconEye,
    },
  ];

  const columns: Column<ITopPlayerEngagedItem>[] = [
    {
      header: "Name",
      key: "name",
      render: (player) => {
        const avatarSrc = player.avatar || "/placeholder_img.jpg";
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={avatarSrc}
                className="size-10 rounded-full object-cover"
                alt={player.name}
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
              <div className="text-sm font-bold text-white truncate">{player.name}</div>
              <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
                {player.position}
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
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.age !== null && p.age !== undefined ? p.age : "—"}</span>,
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.country || "—"}</span>,
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.club || "—"}</span>,
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
      header: "Views",
      key: "views",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.views ?? 0}</span>,
    },
    {
      header: "Likes",
      key: "likes",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.likes ?? 0}</span>,
    },
    {
      header: "Shares",
      key: "shares",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => <span>{p.shares ?? 0}</span>,
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (p) => {
        const key = p.playerId || p.id;
        return (
          <TableActionButtons
            onView={() => router.push(`/dashboard/club/scouting-board/${key}`)}
          />
        );
      },
    },
  ];

  const resetFilters = () => {
    setPosition("ALL");
    setStatus("ALL");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 min-w-0">
      {/* Top Header with Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
            Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Track engagement and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Year:</span>
          <DropdownFilter
            value={year}
            onChange={(val) => {
              setYear(val);
              setPage(1);
            }}
            options={yearOptions}
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center justify-between gap-3 text-destructive">
          <p className="text-xs sm:text-sm font-semibold">
            Failed to load club analytics. Please check your connection.
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

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex flex-col gap-4">
              <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-3xl font-black text-white italic mb-1">
                  {stat.value}
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Line Chart: Players & Coaches Monitored */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D]">
          <h3 className="text-xs sm:text-sm font-bold text-white mb-6 sm:mb-8 uppercase tracking-widest italic">
            Players & Coaches Monitored ({year})
          </h3>
          <div className="h-75 sm:h-100 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#888", fontSize: 10 }} 
                  tickMargin={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#888", fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "12px" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Line 
                  type="monotone" 
                  name="Players Monitored" 
                  dataKey="players" 
                  stroke="#E31B23" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#E31B23", strokeWidth: 0 }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  name="Coaches Monitored" 
                  dataKey="coaches" 
                  stroke="#888" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: "#888", strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Position Interest Distribution */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D]">
          <h3 className="text-xs sm:text-sm font-bold text-white mb-6 sm:mb-8 uppercase tracking-widest italic">
            Position Interest Distribution ({year})
          </h3>
          <div className="h-75 sm:h-100 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="position" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#888", fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#888", fontSize: 10 }} 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "12px" }}
                  formatter={(val, _name, item) => [
                    `${val}% (${(item as { payload?: { value?: number } })?.payload?.value ?? 0} players)`,
                    "Interest",
                  ]}
                />
                <Bar dataKey="percentage" barSize={35} radius={[10, 10, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percentage > 0 ? "#E31B23" : "#333"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Players Engaged Table Section */}
      <div className="p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D] overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-xl font-bold text-white italic uppercase tracking-tight">
              Top Players Engaged
            </h3>
            {meta?.total !== undefined && (
              <span className="text-xs text-white/40 font-bold">
                ({meta.total})
              </span>
            )}
          </div>

          {/* Filters: Country & Age Range removed as requested */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DropdownFilter
              value={position}
              onChange={(val) => {
                setPosition(val);
                setPage(1);
              }}
              options={positionOptions}
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
        </div>

        {/* Data Table / Loading / Empty */}
        {isLoading ? (
          <TableSkeleton rowCount={4} columnCount={10} />
        ) : topPlayers.length === 0 ? (
          <div className="py-12 px-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center bg-white/[0.01]">
            <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <IconUserOff size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider">
                No Engaged Players Found
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                No player engagement data found matching your selected filters for {year}.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-2 border-white/20 text-white hover:bg-white/10 cursor-pointer text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <DashboardTable 
              columns={columns} 
              data={topPlayers} 
              className="border-white/10" 
            />

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                <span>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} players)
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
      </div>
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

const TableSkeleton = ({
  rowCount = 4,
  columnCount = 10,
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
              <div className="h-3.5 w-3/4 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
          {Array.from({ length: columnCount - 2 }).map((_, c) => (
            <div key={c} className="h-3 w-16 rounded bg-white/5 hidden sm:block" />
          ))}
          <div className="size-8 rounded-lg bg-white/5" />
        </div>
      ))}
    </div>
  </div>
);

export default Analytics;
