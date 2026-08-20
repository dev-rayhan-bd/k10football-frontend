/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  IconUsers,
  IconCurrencyDollar,
  IconFileText,
  IconChevronDown
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Button } from "@/components/ui/button";

const AnalyticsStatCard = ({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-6 flex flex-col gap-4 flex-1 min-w-0">
    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-white text-3xl font-black font-orbitron">{value}</p>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const growthData = [
  { name: "Jan-Feb", value: 500 },
  { name: "Mar-Apr", value: 720 },
  { name: "May-Jun", value: 730 },
  { name: "Jul-Aug", value: 620 },
  { name: "Sept-Oct", value: 610 },
  { name: "Nov-Dec", value: 950 },
];

const pieData = [
  { name: "Player", value: 72, fill: "#FF9999" },
  { name: "Coach", value: 4, fill: "#FF0000" },
  { name: "Academy", value: 7, fill: "#CC0000" },
  { name: "Agent", value: 3, fill: "#FFB3B3" },
  { name: "Club", value: 4, fill: "#990000" },
];

const revenueData = [
  { name: "Jan-Feb", subscriptions: 5, reports: 3 },
  { name: "Mar-Apr", subscriptions: 6, reports: 2 },
  { name: "May-Jun", subscriptions: 7, reports: 4 },
  { name: "Jul-Aug", subscriptions: 7, reports: 3 },
  { name: "Sept-Oct", subscriptions: 5, reports: 3 },
  { name: "Nov-Dec", subscriptions: 3, reports: 4 },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-xl border border-white/10 min-w-30">
        <p className="text-[#E31B23] font-bold text-xs mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[#111111] font-bold text-[10px] tracking-wide">
            {entry.name} : {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  let angle = -midAngle;
  if (angle < -90 && angle > -270) {
    angle += 180;
  }

  // Hide label if percentage is too small to avoid overlapping
  if (percent < 0.03) return null;

  // Dynamically set font size based on the slice size
  let fontSize = "10px";
  if (percent >= 0.5) {
    fontSize = "16px"; // Very large for dominant slices (e.g., 72%)
  } else if (percent >= 0.2) {
    fontSize = "16px"; // Medium-large
  } else if (percent >= 0.06) {
    fontSize = "13px"; // Standard
  } else {
    fontSize = "11px"; // Small for thin slices (e.g., 3-4%)
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-black font-orbitron"
      style={{ fontSize }}
      transform={`rotate(${angle}, ${x}, ${y})`}
    >
      {`${name}: ${value}%`}
    </text>
  );
};

const SuperAdminAnalytics = () => {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="shrink-0 w-full min-w-0">
        <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">Analytics</h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">Insights and metrics across the platform</p>
      </div>

      {/* Summary Stats */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 min-w-0 w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <AnalyticsStatCard icon={IconUsers} value="772" label="Total users" />
          <AnalyticsStatCard icon={IconCurrencyDollar} value="$ 10,400" label="Revenue" />
          <AnalyticsStatCard icon={IconFileText} value="1,247" label="Game Reports" />
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="flex flex-col gap-6 sm:gap-8 w-full min-w-0">
        {/* User Growth By Role */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 w-full">
          <div className="flex justify-between items-start sm:items-center gap-4 sm:gap-0 w-full min-w-0 shrink-0">
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate w-full sm:w-auto">User Growth By Role</h2>
            <Button variant="outline" className="bg-black/40 border-white/20 h-9 sm:h-10 rounded-xl text-white/60 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 shrink-0">
              All Roles <IconChevronDown size={14} />
            </Button>
          </div>

          <div className="h-62.5 sm:h-75 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                  domain={[0, 1200]}
                  ticks={[0, 300, 600, 900, 1200]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff20', borderRadius: '12px' }}
                  itemStyle={{ color: '#E31B23', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#E31B23"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#E31B23", strokeWidth: 2, stroke: "#111111" }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-2 sm:mt-4 w-full">
            {["Player", "Coach", "Academy", "Agent", "Clubs"].map((role) => (
              <div key={role} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="w-3 sm:w-4 h-1 bg-[#E31B23] rounded-full relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-sm sm:border-2 border-[#E31B23] bg-[#111111]" />
                </div>
                <span className="text-white text-[10px] sm:text-xs font-bold">{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full min-w-0">
          {/* User Role Distribution */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 relative overflow-hidden min-w-0 w-full">
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight text-center lg:text-left z-10 w-full truncate">User Role Distribution</h2>
            <div className="h-62.5 sm:h-100 w-full relative flex flex-col items-center justify-center min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius="95%"
                    paddingAngle={1}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 sm:mt-4 w-full">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm shrink-0" style={{ backgroundColor: entry.fill }} />
                    <span className="text-white/60 text-[10px] sm:text-xs font-bold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 w-full">
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate w-full">Revenue Breakdown</h2>
            <div className="h-62.5 sm:h-100 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff40"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    domain={[0, 12]}
                    ticks={[0, 3, 6, 9, 12]}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="subscriptions" fill="#ffffff40" radius={[4, 4, 0, 0]} barSize={12} />
                  <Bar dataKey="reports" fill="#ffffff20" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
