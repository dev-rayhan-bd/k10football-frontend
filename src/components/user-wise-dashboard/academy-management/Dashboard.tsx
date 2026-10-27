/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
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
  IconBell
} from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/reduxHooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { DashboardSidebarPanel, DashboardSidebarItem } from "@/components/dashboard/DashboardSidebar";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import AcademyDashboardSuccessStories from "./AcademyDashboardSuccessStories";
import AcademyDashboardProducts from "./AcademyDashboardProducts";
import { useGetAcademyDashboardQuery } from "@/redux/features/academy/academyApi";
import { cn } from "@/lib/utils";

const PlayerEvalSidebarItem = ({ player, status, onClick }: { player: any, status: any, onClick?: () => void }) => {
  const playerImgSrc = typeof player.playerImage === 'string' && player.playerImage
    ? player.playerImage
    : (player.playerImage?.src || player.avatar || player.playerAvatar || "/placeholder_img.jpg");
  return (
    <div onClick={onClick} className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/4 transition-all group flex items-center justify-between gap-3 cursor-pointer">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 md:size-12 rounded-full overflow-hidden border border-white/10 shrink-0">
          <Image width={100} height={100} src={playerImgSrc} alt={player.fullName || player.playerName || player.title || "Player"} className="size-full object-cover" onError={(e) => { e.currentTarget.src = "/placeholder_img.jpg"; }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white group-hover:text-[#E31B23] transition-colors truncate">
            {player.fullName || player.playerName || player.title}
          </p>
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider truncate">
            {player.coachLabel || (player.coachName ? `Coach: ${player.coachName}` : "Coach: N/A")}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        {status?.badge ? (
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
            status.isOverdue
              ? "text-red-500 bg-red-500/10 border border-red-500/20"
              : status.status === "EVALUATED" || status.badge === "EVALUATED"
              ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
              : "text-yellow-500 bg-yellow-500/10 border border-yellow-500/20"
          )}>
            {status.badge}
          </span>
        ) : status?.expired ? (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20">
            {status.remainingDays < 0 ? `Overdue ${Math.abs(status.remainingDays)}d` : "Expired"}
          </span>
        ) : status?.remainingDays !== undefined && status.remainingDays <= 15 ? (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-yellow-500 bg-yellow-500/10 border border-yellow-500/20">
            {status.remainingDays}d left
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
            {status?.remainingDays !== undefined ? `${status.remainingDays}d left` : "Evaluated"}
          </span>
        )}
      </div>
    </div>
  );
};

const AcademyManagementDashboard = () => {
  const [selectedNotifyPlayer, setSelectedNotifyPlayer] = React.useState<any | null>(null);

  // RTK Query: fetch live academy management dashboard data
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useGetAcademyDashboardQuery();
  const dashboardData = dashboardResponse?.data;
  const academy = dashboardData?.academy;
  const metricCards = dashboardData?.metricCards;
  const analytics = dashboardData?.analytics;
  const sidebar = dashboardData?.sidebar;

  // Local fallback players from redux if needed
  const players = useAppSelector((state) => state.player.players);
  const evaluationRecords = useAppSelector((state) => state.evaluation.records);
  const getEvaluationStatus = (player: any) => {
    const reduxRecord = evaluationRecords[player.id];
    const evalDateStr = reduxRecord?.date || player.evaluationDate || player.lastValidatedDate;
    if (!evalDateStr) {
      return {
        expired: true,
        remainingDays: 0,
        label: "Expired",
      };
    }
    const evalDate = new Date(evalDateStr);
    const currentDate = new Date();
    evalDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    const dueDate = new Date(evalDate.getTime());
    dueDate.setDate(dueDate.getDate() + 90);
    const diffTime = dueDate.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      expired: diffDays <= 0,
      remainingDays: diffDays,
      label: diffDays <= 0
        ? `Expired (${Math.abs(diffDays)}d overdue)`
        : `${diffDays}d remaining`,
    };
  };

  const playersWithStatus = players.map(player => ({
    player,
    status: getEvaluationStatus(player)
  })).sort((a, b) => {
    if (a.status.expired && !b.status.expired) return -1;
    if (!a.status.expired && b.status.expired) return 1;
    if (a.status.expired && b.status.expired) {
      return a.status.remainingDays - b.status.remainingDays;
    }
    return a.status.remainingDays - b.status.remainingDays;
  });

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium px-1">
        Academy Dashboard / <span className="text-white">Management</span>
      </div>
      <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Hero Section */}
          <DashboardHero
            backgroundImage={academy?.coverPhoto || "/banner.png"}
            logoImage={academy?.badge || "/image 47.png"}
            badgeText={academy?.status || "Active Academy"}
            title={academy?.name || "Santos FC Academy"}
            subtitle={academy?.category || "Premier League Academy"}
            details={[
              {
                icon: <IconCalendarEvent size={16} />,
                text: academy?.foundedText || (academy?.foundedYear ? `Founded ${academy.foundedYear}` : "Founded 2018")
              },
              {
                icon: <IconMapPin size={16} className="text-green-500" />,
                text: academy?.location || "São Paulo, Brazil"
              },
            ]}
            contacts={[
              {
                type: "phone",
                label: "Contact",
                value: academy?.contactPhone || "+55 11 9999-8888"
              },
              {
                type: "email",
                label: "Email",
                value: academy?.contactEmail || "contact@santosfc.academy"
              },
            ]}
          />
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <DashboardStatCard
              icon={<IconBallFootball size={24} />}
              label={metricCards?.teams?.label || "Teams"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.teams?.count ?? 0)}
            />
            <DashboardStatCard
              icon={<IconUsers size={24} />}
              label={metricCards?.players?.label || "Players"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.players?.count ?? 0)}
            />
            <DashboardStatCard
              icon={<IconTrophy size={24} />}
              label={metricCards?.coaches?.label || "Coaches"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.coaches?.count ?? 0)}
            />
            <DashboardStatCard
              icon={<IconFileAnalytics size={24} />}
              label={metricCards?.gameReports?.label || "Game Reports"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.gameReports?.count ?? 0)}
            />
            <DashboardStatCard
              icon={<IconClipboardText size={24} />}
              label={metricCards?.pendingEvaluations?.label || "Pending Evaluations"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.pendingEvaluations?.count ?? 0)}
            />
            <DashboardStatCard
              icon={<IconFileAnalytics size={24} />}
              label={metricCards?.pendingCvs?.label || "Pending CVs"}
              value={isDashboardLoading && !metricCards ? "..." : String(metricCards?.pendingCvs?.count ?? 0)}
            />
          </div>
          {/* Analytics Section */}
          <div className="bg-[#111111] rounded-3xl border border-white/5 p-5 md:p-8 flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron">
                  {analytics?.title || "Analytics"}
                </h2>
                <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                  {analytics?.subtitle || "Deep insights into Revenue"}
                </p>
              </div>
              <Link
                href="/dashboard/academy/management/analytics-report"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-6 py-3 sm:py-2.5 rounded-xl transition-all text-center"
              >
                Full Analytics
              </Link>
            </div>
            <DashboardCharts analytics={analytics} />
          </div>
          {/* Product Store Section */}
          <AcademyDashboardProducts />
          {/* Success Story Section */}
          <AcademyDashboardSuccessStories />
        </div>
        {/* Sidebar */}
        <div className="w-full xl:w-95 shrink-0 flex flex-col gap-6">
          <DashboardSidebarPanel title="Pending Game Reports" icon={<IconCalendarFilled size={24} />}>
            {sidebar?.pendingGameReports && sidebar.pendingGameReports.length > 0 ? (
              sidebar.pendingGameReports.map((report) => (
                <DashboardSidebarItem
                  key={report.id}
                  avatar={report.playerAvatar || `https://i.pravatar.cc/100?u=${report.playerId || report.id}`}
                  title={report.playerName}
                  subtitle={report.position}
                  subtitleColor="text-[#E31B23]"
                  extraInfo={report.score}
                  onClick={() => setSelectedNotifyPlayer({
                    fullName: report.playerName,
                    subtitle: report.position,
                    rating: Math.round(Number(report.score) * 10) || 88,
                    playerImage: report.playerAvatar || `https://i.pravatar.cc/100?u=${report.playerId || report.id}`,
                    matchName: report.matchName,
                  })}
                />
              ))
            ) : (
              <p className="text-xs text-white/40 p-3 text-center font-bold">No pending game reports</p>
            )}
          </DashboardSidebarPanel>
          <DashboardSidebarPanel title="Pending CV Validations" icon={<IconFileAnalytics size={24} />}>
            {sidebar?.pendingCvValidations && sidebar.pendingCvValidations.length > 0 ? (
              sidebar.pendingCvValidations.map((cv) => (
                <PlayerEvalSidebarItem
                  key={cv.id}
                  player={{
                    id: cv.id,
                    fullName: cv.playerName,
                    coachName: cv.coachName,
                    coachLabel: cv.coachLabel,
                    playerImage: cv.playerAvatar,
                  }}
                  status={{
                    badge: cv.badge,
                    isOverdue: cv.isOverdue,
                  }}
                  onClick={() => setSelectedNotifyPlayer({
                    fullName: cv.playerName,
                    subtitle: cv.coachLabel || "CV Validation",
                    playerImage: cv.playerAvatar,
                  })}
                />
              ))
            ) : (
              <p className="text-xs text-white/40 p-3 text-center font-bold">No pending CV validations</p>
            )}
          </DashboardSidebarPanel>
          <DashboardSidebarPanel title="Player Evaluations" icon={<IconClipboardText size={24} />}>
            <div className="max-h-75 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {sidebar?.playerEvaluations && sidebar.playerEvaluations.length > 0 ? (
                sidebar.playerEvaluations.map((evaluation) => (
                  <PlayerEvalSidebarItem
                    key={evaluation.id}
                    player={{
                      id: evaluation.id,
                      fullName: evaluation.playerName,
                      coachName: evaluation.coachName,
                      coachLabel: evaluation.coachLabel,
                      playerImage: evaluation.playerAvatar,
                    }}
                    status={{
                      badge: evaluation.badge || evaluation.status || "EVALUATED",
                      status: evaluation.status,
                    }}
                    onClick={() => setSelectedNotifyPlayer({
                      fullName: evaluation.playerName,
                      subtitle: evaluation.coachLabel || "Player Evaluation",
                      playerImage: evaluation.playerAvatar,
                    })}
                  />
                ))
              ) : playersWithStatus.length > 0 ? (
                playersWithStatus.map(({ player, status }) => (
                  <PlayerEvalSidebarItem key={player.id} player={player} status={status} onClick={() => setSelectedNotifyPlayer(player)} />
                ))
              ) : (
                <p className="text-xs text-white/40 p-3 text-center font-bold">No player evaluations</p>
              )}
            </div>
          </DashboardSidebarPanel>
          <DashboardSidebarPanel title="Clubs Interested" icon={<IconHeartFilled size={24} />}>
            {sidebar?.clubsInterested && sidebar.clubsInterested.length > 0 ? (
              sidebar.clubsInterested.map((club) => (
                <DashboardSidebarItem
                  key={club.clubId}
                  avatar={club.clubLogo || "/placeholder_img.jpg"}
                  title={club.clubName}
                  subtitle={club.action || `${club.country} • ${club.league}`}
                  subtitleColor="text-white/60"
                />
              ))
            ) : (
              <p className="text-xs text-white/40 p-3 text-center font-bold">No clubs interested yet</p>
            )}
          </DashboardSidebarPanel>
          <DashboardSidebarPanel title="Quick stats">
            <div className="flex flex-col gap-4 px-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Profile Views</span>
                <span className="text-sm font-black text-white">{sidebar?.quickStats?.profileViews?.formatted ?? "127"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Likes</span>
                <span className="text-sm font-black text-[#E31B23]">{sidebar?.quickStats?.totalLikes?.formatted ?? "8"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Reports</span>
                <span className="text-sm font-black text-[#4ADE80]">{sidebar?.quickStats?.reports?.formatted ?? "12"}</span>
              </div>
            </div>
          </DashboardSidebarPanel>
        </div>
      </div>

      
      {/* Notify Coach Modal */}
      <Dialog open={!!selectedNotifyPlayer} onOpenChange={(open) => !open && setSelectedNotifyPlayer(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-sm p-6 flex flex-col gap-4">
          <DialogHeader className="flex flex-row justify-between items-center mb-2 p-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24] font-black uppercase text-[10px] whitespace-nowrap">Gold CV</span>
              <DialogTitle className="text-base sm:text-lg font-black uppercase font-orbitron truncate w-50">
                {selectedNotifyPlayer?.fullName || selectedNotifyPlayer?.playerName || selectedNotifyPlayer?.title || "Unknown Player"}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 w-full">
            <button className="w-full flex justify-center items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-white font-black uppercase text-[10px] py-4 rounded-xl shadow-[0_0_15px_rgba(227,27,35,0.3)] transition-all cursor-pointer">
              <IconBell size={16} /> Select & Notify Coach
            </button>
            <button className="w-full flex justify-center items-center gap-2 bg-transparent border-2 border-white/10 hover:bg-white/5 text-white/70 hover:text-white font-black uppercase text-[10px] py-4 rounded-xl transition-all cursor-pointer">
              <IconBell size={16} /> Auto Notify
            </button>
          </div>

          {/* Player Card */}
          <div className="mt-2 relative rounded-3xl overflow-hidden border border-white/10 bg-linear-to-b from-blue-900/40 to-black aspect-3/4 p-6 flex flex-col justify-end">
            <div className="absolute top-4 left-4 size-12 bg-amber-400 rounded-full flex items-center justify-center font-black text-xl text-black shadow-lg">
              {selectedNotifyPlayer?.rating || 88}
            </div>
            <Image 
              src={selectedNotifyPlayer?.playerImage?.src || selectedNotifyPlayer?.playerImage || selectedNotifyPlayer?.playerAvatar || selectedNotifyPlayer?.avatar || "/placeholder_img.jpg"} 
              alt="player" 
              width={300} 
              height={400} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              onError={(e) => { e.currentTarget.src = "/placeholder_img.jpg"; }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#E31B23] text-white font-black uppercase text-[8px] w-fit">Active</span>
              <h3 className="text-2xl font-black uppercase font-orbitron leading-none text-white">
                {selectedNotifyPlayer?.fullName || selectedNotifyPlayer?.playerName || selectedNotifyPlayer?.title || "Unknown"}
              </h3>
              <p className="text-[#E31B23] text-[10px] font-black uppercase">
                {selectedNotifyPlayer?.subtitle || selectedNotifyPlayer?.position || "Player"}
              </p>
              <div className="flex items-center gap-2 text-[9px] font-bold text-white/70 uppercase">
                <span>{selectedNotifyPlayer?.age || 24} Years Old</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Image src="https://flagcdn.com/br.svg" alt="country" width={12} height={8} className="object-cover" />
                  {selectedNotifyPlayer?.birthCountry || "Brazil"}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AcademyManagementDashboard;