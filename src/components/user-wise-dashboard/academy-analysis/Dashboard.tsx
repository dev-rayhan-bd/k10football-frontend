"use client";
import { useState } from "react";
import Link from "next/link";
import {
  IconUsers,
  IconTrophy,
  IconFileAnalytics,
  IconBallFootball,
  IconCalendarFilled,
  IconHeartFilled,
  IconMapPin,
  IconCalendarEvent,
  IconClipboardText,
  IconFileCheck,
} from "@tabler/icons-react";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import {
  DashboardSidebarPanel,
  DashboardSidebarItem,
} from "@/components/dashboard/DashboardSidebar";
import AcademyDashboardSuccessStories from "@/components/user-wise-dashboard/academy-management/AcademyDashboardSuccessStories";
import { AcademyImagesSection, AcademyVideosSection } from "./media";
import { useGetAcademyDashboardQuery } from "@/redux/features/academy/academyApi";
import type { IAcademyDashboardMetricCardItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const YEAR_OPTIONS_COUNT = 5;

type BadgeTone = "danger" | "warning" | "success";

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  danger: "text-red-500 bg-red-500/10 border-red-500/20",
  warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
  success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
};

const PlayerStatusItem = ({
  name,
  avatar,
  coachLabel,
  badge,
  tone,
}: {
  name: string;
  avatar: string | null;
  coachLabel: string;
  badge: string;
  tone: BadgeTone;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 transition-all hover:bg-white/4">
    <div className="flex min-w-0 items-center gap-3">
      <div className="size-10 shrink-0 overflow-hidden rounded-full border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar || "/placeholder_img.jpg"}
          alt={name}
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder_img.jpg";
          }}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold text-white">{name}</p>
        <p className="truncate text-[9px] font-bold uppercase tracking-wider text-white/40">
          {coachLabel}
        </p>
      </div>
    </div>
    {badge && (
      <span
        className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider",
          BADGE_TONE_CLASSES[tone],
        )}
      >
        {badge}
      </span>
    )}
  </div>
);

const EmptyText = ({ children }: { children: React.ReactNode }) => (
  <p className="p-3 text-center text-xs font-bold text-white/40">{children}</p>
);

const AcademyAnalysisDashboard = () => {
  const [yearOptions] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: YEAR_OPTIONS_COUNT },
      (_, i) => currentYear - i,
    );
  });
  const [year, setYear] = useState(yearOptions[0]);
  const {
    data: dashboardResponse,
    isLoading,
    isFetching,
  } = useGetAcademyDashboardQuery({ year });
  const dashboard = dashboardResponse?.data;
  const academy = dashboard?.academy;
  const metricCards = dashboard?.metricCards;
  const analytics = dashboard?.analytics;
  const sidebar = dashboard?.sidebar;
  const quickStats = sidebar?.quickStats;

  const metricValue = (item?: IAcademyDashboardMetricCardItem) =>
    isLoading && !metricCards ? "..." : String(item?.count ?? 0);

  const stats = [
    {
      key: "teams",
      icon: <IconBallFootball size={24} />,
      fallback: "Teams",
      item: metricCards?.teams,
    },
    {
      key: "players",
      icon: <IconUsers size={24} />,
      fallback: "Players",
      item: metricCards?.players,
    },
    {
      key: "coaches",
      icon: <IconTrophy size={24} />,
      fallback: "Coaches",
      item: metricCards?.coaches,
    },
    {
      key: "gameReports",
      icon: <IconFileAnalytics size={24} />,
      fallback: "Game Reports",
      item: metricCards?.gameReports,
    },
    {
      key: "pendingEvaluations",
      icon: <IconClipboardText size={24} />,
      fallback: "Pending Evaluations",
      item: metricCards?.pendingEvaluations,
    },
    {
      key: "pendingCvs",
      icon: <IconFileCheck size={24} />,
      fallback: "Pending CVs",
      item: metricCards?.pendingCvs,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Breadcrumbs */}
      <div className="text-xs font-medium uppercase tracking-widest text-gray-500">
        Academy Dashboard / <span className="text-white">Analysis</span>
      </div>
      <div className="flex flex-col gap-8 xl:flex-row">
        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <DashboardHero
            backgroundImage={academy?.coverPhoto || "/placeholder_img.jpg"}
            logoImage={academy?.badge || "/placeholder_img.jpg"}
            badgeText={academy?.status || ""}
            title={academy?.name || ""}
            subtitle={academy?.category || ""}
            details={[
              {
                icon: <IconCalendarEvent size={16} />,
                text:
                  academy?.foundedText ||
                  (academy?.foundedYear
                    ? `Founded ${academy.foundedYear}`
                    : "—"),
              },
              {
                icon: <IconMapPin size={16} className="text-green-500" />,
                text: academy?.location || "—",
              },
            ]}
            contacts={[
              {
                type: "phone",
                label: "Contact",
                value: academy?.contactPhone || "—",
              },
              {
                type: "email",
                label: "Email",
                value: academy?.contactEmail || "—",
              },
            ]}
            isLoading={isLoading}
          />

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {stats.map((stat) => (
              <DashboardStatCard
                key={stat.key}
                icon={stat.icon}
                label={stat.item?.label || stat.fallback}
                value={metricValue(stat.item)}
              />
            ))}
          </div>

          {/* Analytics Section */}
          <div className="flex flex-col gap-8 rounded-3xl border border-white/5 bg-[#111111] p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-orbitron text-2xl font-black uppercase text-white">
                  {analytics?.title || "Analytics"}
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  {analytics?.subtitle || "Deep insights into Revenue"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select
                  value={String(year)}
                  onValueChange={(value) => setYear(Number(value))}
                >
                  <SelectTrigger
                    aria-label="Select year"
                    className="h-10 w-28 rounded-xl border-white/10 bg-white/5 text-xs font-black text-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link
                  href="/dashboard/academy/analysis/analytics"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                >
                  Full Analytics
                </Link>
              </div>
            </div>
            <div
              className={cn(
                "transition-opacity",
                isFetching && !isLoading && "opacity-50",
              )}
            >
              <DashboardCharts analytics={analytics} />
            </div>
          </div>

          <AcademyImagesSection />
          <AcademyVideosSection />
          <AcademyDashboardSuccessStories viewAllHref="/dashboard/academy/analysis/success-story" />
        </div>

        {/* Sidebar */}
        <div className="flex w-full shrink-0 flex-col gap-6 xl:w-95">
          <DashboardSidebarPanel
            title="Pending Game Reports"
            icon={<IconCalendarFilled size={24} />}
          >
            {sidebar?.pendingGameReports?.length ? (
              sidebar.pendingGameReports.map((report) => (
                <DashboardSidebarItem
                  key={report.id}
                  avatar={report.playerAvatar || undefined}
                  title={report.playerName}
                  subtitle={report.matchName || report.position}
                  subtitleColor="text-[#E31B23]"
                  extraInfo={report.score}
                />
              ))
            ) : (
              <EmptyText>
                {isLoading ? "Loading..." : "No pending game reports"}
              </EmptyText>
            )}
          </DashboardSidebarPanel>

          <DashboardSidebarPanel
            title="Pending CV Validations"
            icon={<IconFileCheck size={24} />}
          >
            {sidebar?.pendingCvValidations?.length ? (
              sidebar.pendingCvValidations.map((cv) => (
                <PlayerStatusItem
                  key={cv.id}
                  name={cv.playerName}
                  avatar={cv.playerAvatar}
                  coachLabel={
                    cv.coachLabel || `Coach: ${cv.coachName || "Unassigned"}`
                  }
                  badge={cv.badge}
                  tone={cv.isOverdue ? "danger" : "warning"}
                />
              ))
            ) : (
              <EmptyText>
                {isLoading ? "Loading..." : "No pending CV validations"}
              </EmptyText>
            )}
          </DashboardSidebarPanel>

          <DashboardSidebarPanel
            title="Player Evaluations"
            icon={<IconClipboardText size={24} />}
          >
            <div className="flex max-h-75 flex-col gap-3 overflow-y-auto pr-1">
              {sidebar?.playerEvaluations?.length ? (
                sidebar.playerEvaluations.map((evaluation) => {
                  const isOverdue = /overdue|expired/i.test(
                    evaluation.badge || "",
                  );
                  return (
                    <PlayerStatusItem
                      key={evaluation.id}
                      name={evaluation.playerName}
                      avatar={evaluation.playerAvatar}
                      coachLabel={
                        evaluation.coachLabel ||
                        `Coach: ${evaluation.coachName || "N/A"}`
                      }
                      badge={evaluation.badge || evaluation.status}
                      tone={
                        isOverdue
                          ? "danger"
                          : evaluation.status === "EVALUATED"
                            ? "success"
                            : "warning"
                      }
                    />
                  );
                })
              ) : (
                <EmptyText>
                  {isLoading ? "Loading..." : "No player evaluations"}
                </EmptyText>
              )}
            </div>
          </DashboardSidebarPanel>

          <DashboardSidebarPanel
            title="Clubs Interested"
            icon={<IconHeartFilled size={24} />}
          >
            {sidebar?.clubsInterested?.length ? (
              sidebar.clubsInterested.map((club) => (
                <DashboardSidebarItem
                  key={club.clubId}
                  avatar={club.clubLogo || undefined}
                  title={club.clubName}
                  subtitle={
                    club.action ||
                    [club.country, club.league].filter(Boolean).join(" • ")
                  }
                  subtitleColor="text-white/60"
                />
              ))
            ) : (
              <EmptyText>
                {isLoading ? "Loading..." : "No clubs interested yet"}
              </EmptyText>
            )}
          </DashboardSidebarPanel>

          <DashboardSidebarPanel title="Quick stats">
            <div className="flex flex-col gap-4 px-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Profile Views
                </span>
                <span className="text-sm font-black text-white">
                  {quickStats?.profileViews?.formatted ?? "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Total Likes
                </span>
                <span className="text-sm font-black text-[#E31B23]">
                  {quickStats?.totalLikes?.formatted ?? "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Reports
                </span>
                <span className="text-sm font-black text-[#4ADE80]">
                  {quickStats?.reports?.formatted ?? "0"}
                </span>
              </div>
            </div>
          </DashboardSidebarPanel>
        </div>
      </div>
    </div>
  );
};
export default AcademyAnalysisDashboard;
