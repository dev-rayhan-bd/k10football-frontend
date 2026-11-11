"use client";

import React from "react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from "recharts";
import { 
  IconStar, 
  IconTarget, 
  IconCircleCheck, 
  IconChartBar,
  IconTrendingUp,
  IconAlertCircle,
  IconRefresh,
  IconLock,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetMyPlayerAnalyticsQuery } from "@/redux/features/player/playerApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { 
  ISkillAnalysisItem, 
  IRadarDataItem 
} from "@/types/player.type";
import { cn } from "@/lib/utils";

const getStatIcon = (iconName?: string, key?: string) => {
  const normalized = (iconName || key || "").toLowerCase();
  if (normalized.includes("star") || normalized.includes("rating")) return IconStar;
  if (normalized.includes("target") || normalized.includes("goal")) return IconTarget;
  if (normalized.includes("check") || normalized.includes("assist")) return IconCircleCheck;
  if (normalized.includes("trend") || normalized.includes("improv")) return IconTrendingUp;
  return IconChartBar;
};

const PlayerAnalytics = () => {
  const { data: subscriptionResponse, isLoading: isSubLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const { data: response, isLoading, isError, refetch } = useGetMyPlayerAnalyticsQuery(undefined, {
    skip: !hasActiveSubscription,
  });
  const analytics = response?.data;

  if (isSubLoading || (hasActiveSubscription && isLoading)) {
    return <AnalyticsSkeleton />;
  }

  if (!hasActiveSubscription) {
    return (
      <div className="flex flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Analytics
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
            Track Your Performance and Improvement
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-[30px] border border-white/10 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-6 max-w-lg mx-auto">
          <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary">
            <IconLock className="size-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white uppercase font-heading">
              Advanced Analytics Locked
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Detailed performance radar charts, attribute progression graphs, and psychological metrics are available with an active Athlete Membership plan.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link href="/dashboard/player/my-subscription">
              <Button className="w-full sm:w-auto bg-primary hover:bg-[#00dd00] text-black font-bold">
                View Membership Plans
              </Button>
            </Link>
            <Link href="/dashboard/player">
              <Button variant="outline" className="w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-10 pb-16">
        <div className="flex flex-col gap-2 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Analytics
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
            Track Your Performance and Improvement
          </p>
        </div>

        <div className="p-8 sm:p-12 rounded-[30px] border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4">
          <IconAlertCircle className="size-12 text-red-500" stroke={1.5} />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-white">Failed to load analytics</h3>
            <p className="text-sm text-gray-400">
              An error occurred while fetching your analytics data. Please try again.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-lg shadow-red-600/20"
          >
            <IconRefresh className="size-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const statsList = summary
    ? [
        {
          key: "overallRating",
          label: summary.overallRating?.label || "OVERALL RATING",
          value: summary.overallRating?.value !== undefined ? String(summary.overallRating.value) : "0",
          icon: getStatIcon(summary.overallRating?.icon, "overallRating"),
        },
        {
          key: "goals",
          label: summary.goals?.label || "GOALS",
          value: summary.goals?.value !== undefined ? String(summary.goals.value) : "0",
          icon: getStatIcon(summary.goals?.icon, "goals"),
        },
        {
          key: "assists",
          label: summary.assists?.label || "ASSISTS",
          value: summary.assists?.value !== undefined ? String(summary.assists.value) : "0",
          icon: getStatIcon(summary.assists?.icon, "assists"),
        },
        {
          key: "improvement",
          label: summary.improvement?.label || "IMPROVEMENT",
          value: summary.improvement?.value !== undefined ? String(summary.improvement.value) : "+0%",
          icon: getStatIcon(summary.improvement?.icon, "improvement"),
        },
      ]
    : [
        { key: "overallRating", label: "OVERALL RATING", value: "0", icon: IconStar },
        { key: "goals", label: "GOALS", value: "0", icon: IconTarget },
        { key: "assists", label: "ASSISTS", value: "0", icon: IconCircleCheck },
        { key: "improvement", label: "IMPROVEMENT", value: "+0%", icon: IconTrendingUp },
      ];

  const fullPotential = analytics?.fullPotential;
  const mentalAnalysis = analytics?.mentalAnalysis;
  const skills = analytics?.skillsAnalysis || [];
  const performanceTrend = analytics?.performanceTrend || [];

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
          Analytics
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
          Track Your Performance and Improvement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsList.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div 
                key={stat.key} 
                className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60 group hover:border-white/10 transition-all duration-500"
              >
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all duration-500">
                    <StatIcon size={20} stroke={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-3xl sm:text-4xl font-bold text-white tracking-tighter font-orbitron">
                      {stat.value}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Radar Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RadarCard 
          title={fullPotential?.title || "Full Potential"} 
          subtitle={fullPotential?.subtitle || "Physical & Technical Attributes"} 
          data={fullPotential?.radarData || []} 
          color={fullPotential?.radarColor || fullPotential?.scoreColor || "#EF4444"} 
          score={fullPotential?.overallScoreDisplay || (fullPotential?.overallScore !== undefined ? `${fullPotential.overallScore}/100` : "0/100")} 
          growth={fullPotential?.growthDisplay || (fullPotential?.growth !== undefined ? `↑ ${fullPotential.growth}%` : "0%")} 
          growthDirection={fullPotential?.growthDirection || "up"}
          growthText={fullPotential?.growthText || "Growth vs last month"}
        />
        <RadarCard 
          title={mentalAnalysis?.title || "Mental Analysis"} 
          subtitle={mentalAnalysis?.subtitle || "Psychological Performance Metrics"} 
          data={mentalAnalysis?.radarData || []} 
          color={mentalAnalysis?.radarColor || mentalAnalysis?.scoreColor || "#00FF66"} 
          score={mentalAnalysis?.overallScoreDisplay || (mentalAnalysis?.overallScore !== undefined ? `${mentalAnalysis.overallScore}/100` : "0/100")} 
          growth={mentalAnalysis?.growthDisplay || (mentalAnalysis?.growth !== undefined ? `↑ ${mentalAnalysis.growth}%` : "0%")} 
          growthDirection={mentalAnalysis?.growthDirection || "up"}
          growthText={mentalAnalysis?.growthText || "Growth vs last month"}
        />
      </div>

      {/* Skills Analysis */}
      <div className="flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase font-heading">
          Skills Analysis
        </h2>
        {skills.length === 0 ? (
          <div className="p-8 rounded-4xl border border-white/5 bg-[#0A0A0A]/60 text-center text-gray-500 text-sm">
            No skills analysis data available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, idx) => (
              <SkillCard key={skill.id || idx} skill={skill} />
            ))}
          </div>
        )}
      </div>

      {/* Performance Trend */}
      <div className="p-4 sm:p-10 rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-heading mb-6 sm:mb-10">
          Performance Trend
        </h2>
        {performanceTrend.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No performance trend data recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {performanceTrend.map((item, idx) => (
              <div 
                key={idx} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group gap-4 sm:gap-0"
              >
                <div className="text-base sm:text-lg font-bold text-white w-full sm:w-28 border-b sm:border-0 border-white/10 pb-2 sm:pb-0">
                  {item.monthFull || item.month}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-8 min-w-0">
                  <div className="flex flex-col xl:flex-row items-start xl:items-center gap-1 xl:gap-3">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest">
                      Goals:
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {item.goals ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col xl:flex-row items-start xl:items-center gap-1 xl:gap-3">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest">
                      Assists:
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {item.assists ?? 0}
                    </span>
                  </div>
                  <div className="flex flex-col xl:flex-row items-start xl:items-center justify-start xl:justify-end gap-1 xl:gap-3">
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-widest">
                      Rating:
                    </span>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {item.rating ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface RadarCardProps {
  title?: string;
  subtitle?: string;
  data?: IRadarDataItem[];
  color?: string;
  score?: string;
  growth?: string;
  growthDirection?: "up" | "down" | string;
  growthText?: string;
}

const RadarCard = ({ 
  title, 
  subtitle, 
  data = [], 
  color = "#EF4444", 
  score = "0/100", 
  growth = "0%", 
  growthDirection = "up",
  growthText = "Growth vs last month"
}: RadarCardProps) => {
  const formattedData = data.map((item) => ({
    subject: item.attribute || item.subject || "",
    value: item.value ?? item.A ?? 0,
    fullMark: item.fullMark ?? 100,
  }));

  return (
    <div className="p-4 sm:p-10 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl flex flex-col items-center">
      <div className="w-full mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase font-heading">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      
      <div className="w-full h-[320px] sm:h-[380px]">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={formattedData}>
              <PolarGrid stroke="#333333" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#999999", fontSize: 12, fontWeight: 500 }} />
              <Radar
                name={title}
                dataKey="value"
                stroke={color}
                fill={color}
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="size-full flex items-center justify-center text-gray-500 text-sm">
            No radar data available
          </div>
        )}
      </div>

      <div className="w-full border-t border-white/10 pt-8 mt-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Overall Score</p>
          <p className="text-sm text-gray-400 font-light italic">{growthText}</p>
        </div>
        <div className="text-right flex flex-col gap-1">
          <p className="text-2xl font-bold font-orbitron" style={{ color }}>{score}</p>
          <p className={cn(
            "text-sm font-bold",
            growthDirection === "down" ? "text-red-500" : "text-[#00FF66]"
          )}>
            {growth}
          </p>
        </div>
      </div>
    </div>
  );
};

interface SkillCardProps {
  skill: ISkillAnalysisItem;
}

const SkillCard = ({ skill }: SkillCardProps) => {
  const percentVal = typeof skill.score === "number"
    ? skill.score
    : parseFloat(String(skill.percentage || 0)) || 0;
  const percentDisplay = typeof skill.percentage === "string"
    ? skill.percentage
    : `${percentVal}%`;
  const color = skill.color || "#00FF66";
  const subSkills = skill.subSkills || skill.subMetrics || [];

  const strokeDashoffset = 364.4 * (1 - Math.min(100, Math.max(0, percentVal)) / 100);

  return (
    <div className="p-8 rounded-4xl border border-white/5 bg-[#0A0A0A]/60 flex flex-col items-center gap-8 group hover:border-white/10 transition-all duration-500">
      <div className="relative size-32 flex items-center justify-center">
        <svg className="size-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-white/5"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={364.4}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ color }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white font-orbitron">{percentDisplay}</span>
        </div>
      </div>

      <div className="w-full text-center flex flex-col gap-6">
        <h4 className="text-xl font-bold text-white uppercase tracking-tight font-heading">{skill.title}</h4>
        <div className="flex flex-col gap-4">
          {subSkills.map((metric, idx) => {
            const metricVal = typeof metric.value === "number"
              ? metric.value
              : parseFloat(String(metric.percentage || 0)) || 0;
            const metricDisplay = metric.percentage || `${metricVal}%`;
            const metricColor = metric.color || color;

            return (
              <div key={metric.key || idx} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <span>{metric.name}</span>
                  <span style={{ color: metricColor }}>{metricDisplay}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 ease-out" 
                    style={{ width: `${Math.min(100, Math.max(0, metricVal))}%`, backgroundColor: metricColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AnalyticsSkeleton = () => (
  <div className="flex flex-col gap-10 pb-16 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col gap-2 px-2 sm:px-0">
      <div className="h-10 w-48 bg-white/10 rounded-lg" />
      <div className="h-5 w-72 bg-white/5 rounded-lg" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="p-4 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="size-10 rounded-xl bg-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-8 w-16 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Radar Charts Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[...Array(2)].map((_, idx) => (
        <div key={idx} className="p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 flex flex-col items-center">
          <div className="w-full flex flex-col gap-2 mb-6 sm:mb-8">
            <div className="h-6 w-36 bg-white/10 rounded" />
            <div className="h-4 w-52 bg-white/5 rounded" />
          </div>
          <div className="size-64 rounded-full bg-white/5 flex items-center justify-center my-4" />
          <div className="w-full border-t border-white/10 pt-8 mt-4 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-4 w-32 bg-white/5 rounded" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-6 w-16 bg-white/10 rounded" />
              <div className="h-4 w-12 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Skills Analysis Skeleton */}
    <div className="flex flex-col gap-8">
      <div className="h-7 w-48 bg-white/10 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="p-8 rounded-4xl border border-white/5 bg-[#0A0A0A]/60 flex flex-col items-center gap-8">
            <div className="size-32 rounded-full border-8 border-white/5" />
            <div className="w-full flex flex-col gap-4">
              <div className="h-5 w-24 bg-white/10 rounded mx-auto" />
              <div className="h-2 w-full bg-white/5 rounded" />
              <div className="h-2 w-full bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PlayerAnalytics;
