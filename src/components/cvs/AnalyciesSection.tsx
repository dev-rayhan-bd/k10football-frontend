/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import image_bar from "@/assets/cvs/bar.png";
import cleanPitch from "@/assets/cvs/clean_pitch.png";
import { useGetCvAnalyticsQuery } from "@/redux/features/player/playerApi";
import { cn } from "@/lib/utils";

const AGE_COLORS = ["#FF1010", "#00FF62", "#FDC700", "#0077FF", "#9333EA", "#06B6D4"];

interface PositionConfig {
  code: string;
  label: string;
  name: string;
  x: number;
  y: number;
  color: string;
}

const POSITIONS: PositionConfig[] = [
  // Goal Keeper
  { code: "GK", label: "GK", name: "Goalkeeper", x: 7, y: 50, color: "#EAB308" },
  // Defenders
  { code: "LWB", label: "LWB", name: "Left Wing Back", x: 31, y: 11, color: "#EF4444" },
  { code: "LB", label: "LB", name: "Left Back", x: 27, y: 27, color: "#EF4444" },
  { code: "CB", label: "CB", name: "Center Back", x: 22, y: 50, color: "#EF4444" },
  { code: "RB", label: "RB", name: "Right Back", x: 27, y: 73, color: "#EF4444" },
  { code: "RWB", label: "RWB", name: "Right Wing Back", x: 31, y: 89, color: "#EF4444" },
  // Midfielders
  { code: "CDM", label: "CDM", name: "Defensive Midfielder", x: 38, y: 50, color: "#3B82F6" },
  { code: "LM", label: "LM", name: "Left Midfielder", x: 49, y: 22, color: "#3B82F6" },
  { code: "CM", label: "CM", name: "Center Midfielder", x: 49, y: 50, color: "#3B82F6" },
  { code: "RM", label: "RM", name: "Right Midfielder", x: 49, y: 78, color: "#3B82F6" },
  { code: "CAM", label: "CAM", name: "Attacking Midfielder", x: 61, y: 50, color: "#3B82F6" },
  // Forwards / Attackers
  { code: "LW", label: "LW", name: "Left Winger", x: 74, y: 13, color: "#3B82F6" },
  { code: "LF", label: "LF", name: "Left Forward", x: 76, y: 29, color: "#F97316" },
  { code: "CF", label: "CF", name: "Center Forward", x: 76, y: 44, color: "#F97316" },
  { code: "ST", label: "ST", name: "Striker", x: 83, y: 50, color: "#F97316" },
  { code: "RF", label: "RF", name: "Right Forward", x: 76, y: 68, color: "#F97316" },
  { code: "RW", label: "RW", name: "Right Winger", x: 74, y: 87, color: "#3B82F6" },
];

const CustomBar = (props: any) => {
  const { x, y, width, height } = props;
  if (width <= 0 || height <= 0) return null;
  return (
    <image
      x={x}
      y={y}
      width={width}
      height={height}
      href={image_bar.src}
      preserveAspectRatio="none"
      style={{ filter: "brightness(0.9)" }}
    />
  );
};

const AnalyciesSection = () => {
  const { data, isLoading } = useGetCvAnalyticsQuery();

  // Nationality Chart Data
  const nationalityChartData = useMemo(() => {
    if (data?.data?.byNationality && data.data.byNationality.length > 0) {
      return data.data.byNationality.map((item) => ({
        name: item.country,
        Players: item.count,
      }));
    }
    return [];
  }, [data]);

  // Age Group Chart Data
  const ageGroupData = useMemo(() => {
    if (data?.data?.byAge && data.data.byAge.length > 0) {
      return data.data.byAge.map((item, index) => ({
        name: item.label,
        value: item.count,
        percentage: item.percentage,
        fill: AGE_COLORS[index % AGE_COLORS.length],
      }));
    }
    return [];
  }, [data]);

  const byPosition = data?.data?.byPosition || {};
  const totalPlayers = data?.data?.totalPlayers ?? 0;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Bar Chart - Players by Nationality */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-border min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Players by Nationality</h2>
            {isLoading && <span className="shimmer text-xs text-muted-foreground">Loading...</span>}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={nationalityChartData}>
              <XAxis dataKey="name" stroke="#888888" tick={{ fontSize: 12 }} />
              <YAxis stroke="#888888" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#ffffff" }}
              />
              <Legend />
              <Bar dataKey="Players" shape={<CustomBar />} fill="#00FF62" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart - By Age */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-border flex flex-col items-center justify-center min-w-0">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">BY AGE</h2>
            {isLoading && <span className="shimmer text-xs text-muted-foreground">Loading...</span>}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ageGroupData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {ageGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #262626",
                  borderRadius: "8px",
                }}
                formatter={(value: any, name: any, props: any) => [
                  `${value} Players (${props?.payload?.percentage ?? 0}%)`,
                  name,
                ]}
                labelStyle={{ color: "#ffffff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-xs sm:text-sm">
            {ageGroupData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span>
                  {item.name} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player Position Field */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">BY PLAYER POSITION</h2>
          <div className="text-xs sm:text-sm text-gray-400">
            Total Players: <span className="text-primary font-bold">{totalPlayers}</span>
          </div>
        </div>

        <div
          className="relative w-full overflow-hidden rounded-xl border border-white/10"
          style={{ aspectRatio: "2800/1860" }}
        >
          {/* Background Football Pitch */}
          <Image
            src={cleanPitch}
            alt="Football Pitch"
            fill
            className="object-cover select-none pointer-events-none"
            priority
          />

          {/* Dynamic Position Badges */}
          {POSITIONS.map((pos) => {
            const count = byPosition[pos.code] ?? 0;

            return (
              <div
                key={pos.code}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-all duration-200 hover:scale-125 hover:z-20"
                title={`${pos.name} (${pos.code}): ${count} players`}
              >
                <div
                  className="size-7 sm:size-9 md:size-10 text-xs sm:text-sm rounded-full flex items-center justify-center font-bold text-white shadow-lg font-heading border-2 border-white/60 ring-2 ring-black/30 shadow-[0_0_12px_rgba(0,0,0,0.5)] transition-all duration-200"
                  style={{ backgroundColor: pos.color }}
                >
                  {count}
                </div>
                <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] mt-0.5 transition-all duration-200">
                  {pos.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyciesSection;
