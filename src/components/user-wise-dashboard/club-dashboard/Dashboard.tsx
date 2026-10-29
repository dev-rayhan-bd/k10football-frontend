"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  IconUsers,
  IconTrophy,
  IconHeart,
  IconShare,
  IconEye,
  IconBell,
  IconUpload,
  IconPhoto,
  IconVideo,
  IconRefresh,
  IconLoader2,
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
import DashboardHero from "@/components/dashboard/DashboardHero";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  DashboardStatCard,
  DashboardSection,
} from "@/components/dashboard/DashboardElements";
import { useGetMyMediaQuery } from "@/redux/features/media/mediaApi";
import { IMediaItem } from "@/types/media.type";
import {
  AcademyMediaCard,
  MediaCardSkeleton,
  UploadImageModal,
  UploadVideoModal,
  MediaPreviewModal,
  EditMediaModal,
  DeleteMediaModal,
} from "@/components/user-wise-dashboard/academy-analysis/media";
import { useMediaUpload } from "@/providers/MediaUploadProvider";
import { MediaUploadProgressWidget } from "@/components/user-wise-dashboard/player-dashboard/images-videos";
import {
  useGetClubDashboardAnalyticsQuery,
  useToggleScoutingBoardFavouriteMutation,
} from "@/redux/features/club/clubApi";
import {
  IClubDashboardPlayerItem,
  IClubDashboardCoachItem,
} from "@/types/club.type";
import { toast } from "sonner";

const ClubDashboard = () => {
  const router = useRouter();

  // API Query: GET {{baseUrl}}/clubs/dashboard-analytics
  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useGetClubDashboardAnalyticsQuery();

  const [toggleScoutingBoardFavourite] = useToggleScoutingBoardFavouriteMutation();

  const dashboardData = dashboardResponse?.data;
  const club = dashboardData?.club;
  const metrics = dashboardData?.metrics;
  const analytics = dashboardData?.analytics;
  const coachesAndPlayers = dashboardData?.coachesAndPlayers;
  const favourites = dashboardData?.favourites;
  const recentActivities = dashboardData?.recentActivity || [];

  // Global Upload Context (Background uploader with real-time percentage)
  const { activeUploadTask, startUpload, cancelUpload, dismissUpload } = useMediaUpload();

  // Query images and videos from mediaApi
  const {
    data: imagesData,
    isLoading: isImagesLoading,
    isError: isImagesError,
    refetch: refetchImages,
  } = useGetMyMediaQuery({ mediaType: "IMAGE", limit: 20 });

  const {
    data: videosData,
    isLoading: isVideosLoading,
    isError: isVideosError,
    refetch: refetchVideos,
  } = useGetMyMediaQuery({ mediaType: "VIDEO", limit: 20 });

  const imagesList = imagesData?.data?.media || [];
  const videosList = videosData?.data?.media || [];

  // Modal states
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<IMediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<IMediaItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<IMediaItem | null>(null);

  // Share handlers
  const handleShareUrl = async (url?: string, defaultPath?: string) => {
    const toCopy = url || (defaultPath ? `${window.location.origin}${defaultPath}` : window.location.href);
    try {
      await navigator.clipboard.writeText(toCopy);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleTogglePlayerFav = async (playerId: string) => {
    try {
      await toggleScoutingBoardFavourite({ targetType: "PLAYER", targetId: playerId }).unwrap();
      refetchDashboard();
    } catch {
      // Toast handled by mutation
    }
  };

  const handleToggleCoachFav = async (coachId: string) => {
    try {
      await toggleScoutingBoardFavourite({ targetType: "COACH", targetId: coachId }).unwrap();
      refetchDashboard();
    } catch {
      // Toast handled by mutation
    }
  };

  // Stat metrics cards
  const stats = [
    {
      label: metrics?.players?.label || "Players",
      value: metrics?.players?.count !== undefined ? String(metrics.players.count) : "0",
      icon: IconUsers,
    },
    {
      label: metrics?.coaches?.label || "Coaches",
      value: metrics?.coaches?.count !== undefined ? String(metrics.coaches.count) : "0",
      icon: IconTrophy,
    },
    {
      label: metrics?.likedCvs?.label || "Liked CVs",
      value: metrics?.likedCvs?.count !== undefined ? String(metrics.likedCvs.count) : "0",
      icon: IconHeart,
    },
    {
      label: metrics?.profileShare?.label || "Profile share",
      value: metrics?.profileShare?.count !== undefined ? String(metrics.profileShare.count) : "0",
      icon: IconShare,
    },
  ];

  // Timeline monitored data
  const timelineData =
    analytics?.playersAndCoachesMonitored && analytics.playersAndCoachesMonitored.length > 0
      ? analytics.playersAndCoachesMonitored.map((item) => ({
          name: item.period,
          players: item.players,
          coaches: item.coaches,
        }))
      : [
          { name: "Jan-Feb", players: 0, coaches: 0 },
          { name: "Mar-Apr", players: 0, coaches: 0 },
          { name: "May-Jun", players: 0, coaches: 0 },
          { name: "Jul-Aug", players: 0, coaches: 0 },
          { name: "Sept-Oct", players: 0, coaches: 0 },
          { name: "Nov-Dec", players: 0, coaches: 0 },
        ];

  // Position distribution data
  const distributionData =
    analytics?.positionInterestDistribution && analytics.positionInterestDistribution.length > 0
      ? analytics.positionInterestDistribution.map((item) => ({
          name: item.position,
          value: item.percentage ?? item.value,
          highlight: item.percentage > 0 || item.value > 0,
        }))
      : [
          { name: "Midfielder", value: 0, highlight: false },
          { name: "Striker", value: 0, highlight: false },
          { name: "Defender", value: 0, highlight: false },
          { name: "Goalkeeper", value: 0, highlight: false },
          { name: "Winger", value: 0, highlight: false },
        ];

  // Columns: Coaches & Players -> Players Table
  const playerColumns: Column<IClubDashboardPlayerItem>[] = [
    {
      header: "Player Name",
      key: "name",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Image
            width={40}
            height={40}
            src={p.avatar || "/placeholder_img.jpg"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
            className="size-10 rounded-full object-cover shrink-0 border border-white/10"
            alt={p.name}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{p.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
              {p.position}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (p) => <span className="text-sm font-black text-destructive italic">{p.rating || "N/A"}</span>,
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => p.club || "Free Agent",
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => p.country || "N/A",
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => (p.age ? `${p.age} yrs` : "N/A"),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (p) => (
        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-green-500/20">
          {p.status || "ACTIVE"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (p) => (
        <TableActionButtons
          onView={() => router.push(`/dashboard/club/player-cv/${p.playerId || p.id}`)}
        />
      ),
    },
  ];

  // Columns: Coaches & Players -> Coaches Table
  const coachColumns: Column<IClubDashboardCoachItem>[] = [
    {
      header: "Coach Name",
      key: "name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Image
            src={c.avatar || "/placeholder_img.jpg"}
            className="size-10 rounded-full object-cover shrink-0 border border-white/10"
            alt={c.name}
            width={40}
            height={40}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{c.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
              {c.role}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Speciality",
      key: "speciality",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.speciality || "N/A",
    },
    {
      header: "Club / Team",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.club || c.team || "N/A",
    },
    {
      header: "Experience",
      key: "experience",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.experience || (c.yearsExperience ? `${c.yearsExperience} yrs` : "N/A"),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (c) => (
        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-green-500/20">
          {c.status || "ACTIVE"}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (c) => (
        <TableActionButtons
          onView={() => router.push(`/cvs/coach-cv-details?coachId=${c.coachId || c.id}`)}
        />
      ),
    },
  ];

  // Columns: Favourites -> Favourite Players Table
  const favPlayerColumns: Column<IClubDashboardPlayerItem>[] = [
    {
      header: "Name",
      key: "name",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Image
            width={40}
            height={40}
            src={p.avatar || "/placeholder_img.jpg"}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
            className="size-10 rounded-full object-cover shrink-0 border border-white/10"
            alt={p.name}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{p.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
              {p.position}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (p) => <span className="text-sm font-black text-destructive italic">{p.rating || "N/A"}</span>,
    },
    {
      header: "Club",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => p.club || "Free Agent",
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => p.country || "N/A",
    },
    {
      header: "Age",
      key: "age",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (p) => (p.age ? `${p.age} yrs` : "N/A"),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (p) => (
        <TableActionButtons
          onView={() => router.push(`/dashboard/club/player-cv/${p.playerId || p.id}`)}
          onHeart={() => handleTogglePlayerFav(p.playerId || p.id)}
          isHeartFilled={true}
          onShare={() => handleShareUrl(p.shareableUrl, `/players/share/${p.playerId || p.id}`)}
        />
      ),
    },
  ];

  // Columns: Favourites -> Favourite Coaches Table
  const favCoachColumns: Column<IClubDashboardCoachItem>[] = [
    {
      header: "Name",
      key: "name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Image
            src={c.avatar || "/placeholder_img.jpg"}
            className="size-10 rounded-full object-cover shrink-0 border border-white/10"
            alt={c.name}
            width={40}
            height={40}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{c.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest truncate">
              {c.role}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Speciality",
      key: "speciality",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.speciality || "N/A",
    },
    {
      header: "Club / Team",
      key: "club",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.club || c.team || "N/A",
    },
    {
      header: "Country",
      key: "country",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.country || "N/A",
    },
    {
      header: "Experience",
      key: "experience",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (c) => c.experience || "N/A",
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (c) => (
        <TableActionButtons
          onView={() => router.push(`/cvs/coach-cv-details?coachId=${c.coachId || c.id}`)}
          onHeart={() => handleToggleCoachFav(c.coachId || c.id)}
          isHeartFilled={true}
          onShare={() => handleShareUrl(c.shareableUrl, `/coach/share/${c.coachId || c.id}`)}
        />
      ),
    },
  ];

  // Derived Hero data
  const heroCover = club?.coverPhoto || "/barcelona-la-liga-champions.avif";
  const heroTier = club?.tier || "Active Club";
  const heroTitle = club?.name || "FC Barcelona";
  const heroSubtitle = club?.category || club?.clubType || "Chief Scout / Director";
  const heroEst = club?.establishedYear ? `Est. ${club.establishedYear}` : "Est. 1899";
  const heroCountry = club?.country || "Spain";
  const heroPhone = club?.contactPhone || "+34 902 1899 00";
  const heroEmail = club?.contactEmail || "oab@fcbarcelona.cat";
  const heroLogo = club?.logo || "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg";

  // Skeleton Loader for whole dashboard
  if (isDashboardLoading) {
    return (
      <div className="flex flex-col gap-8 pb-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 flex flex-col gap-8">
            <div className="h-72 w-full bg-white/5 rounded-3xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-white/5 rounded-2xl" />
              ))}
            </div>
            <div className="h-96 w-full bg-white/5 rounded-2xl" />
          </div>
          <div className="hidden lg:block lg:col-span-3">
            <div className="h-96 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section - Main Content */}
        <div className="lg:col-span-9 flex flex-col gap-8 min-w-0">
          {/* Hero Section */}
          <div className="rounded-3xl overflow-hidden border border-white/10 relative">
            <DashboardHero
              backgroundImage={heroCover}
              badgeText={heroTier}
              title={heroTitle}
              subtitle={heroSubtitle}
              details={[
                { text: heroEst },
                { text: heroCountry },
              ]}
              contacts={[
                { type: "phone", label: "Contact", value: heroPhone },
                { type: "email", label: "Email", value: heroEmail },
              ]}
              logoImage={heroLogo}
            />
            {isDashboardFetching && !isDashboardLoading && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-[10px] text-white/70 backdrop-blur-md">
                <IconLoader2 className="animate-spin size-3 text-[#E31B23]" />
                <span>Syncing dashboard...</span>
              </div>
            )}
          </div>

          {/* Stat Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <DashboardStatCard key={idx} {...stat} icon={<stat.icon size={20} />} />
            ))}
          </div>

          {/* Analytics */}
          <DashboardSection
            title="Analytics"
            action={
              <Link
                href="/dashboard/club/analytics"
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all inline-block"
              >
                Full Analytics
              </Link>
            }
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 italic">
                  Players & Coaches Monitored
                </h4>
                <div className="h-64 sm:h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 10 }} tickMargin={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #333", borderRadius: "12px" }} />
                      <Line type="monotone" name="Players Monitored" dataKey="players" stroke="#E31B23" strokeWidth={3} dot={{ r: 4, fill: "#E31B23" }} />
                      <Line type="monotone" name="Coaches Monitored" dataKey="coaches" stroke="#666" strokeWidth={2} dot={{ r: 3, fill: "#666" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 italic">
                  Position Interest Distribution
                </h4>
                <div className="h-64 sm:h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distributionData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 10 }} tickMargin={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 10 }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.highlight ? "#E31B23" : "#333"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </DashboardSection>

          {/* Coaches & Players */}
          <DashboardSection title="Coaches & Players">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-6">Players</p>
            {coachesAndPlayers?.players && coachesAndPlayers.players.length > 0 ? (
              <DashboardTable columns={playerColumns} data={coachesAndPlayers.players} className="border-white/10" />
            ) : (
              <div className="py-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No players found.
              </div>
            )}

            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-10 mb-6">Coaches</p>
            {coachesAndPlayers?.coaches && coachesAndPlayers.coaches.length > 0 ? (
              <DashboardTable columns={coachColumns} data={coachesAndPlayers.coaches} className="border-white/10" />
            ) : (
              <div className="py-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No coaches found.
              </div>
            )}
          </DashboardSection>

          {/* Favourites */}
          <DashboardSection title="Favourites">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-6">Favourite Players</p>
            {favourites?.players && favourites.players.length > 0 ? (
              <DashboardTable columns={favPlayerColumns} data={favourites.players} className="border-white/10" />
            ) : (
              <div className="py-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No favourite players added yet.
              </div>
            )}

            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-10 mb-6">Favourite Coaches</p>
            {favourites?.coaches && favourites.coaches.length > 0 ? (
              <DashboardTable columns={favCoachColumns} data={favourites.coaches} className="border-white/10" />
            ) : (
              <div className="py-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                No favourite coaches added yet.
              </div>
            )}
          </DashboardSection>

          {/* Background Image Upload Progress Widget */}
          {activeUploadTask && activeUploadTask.type === "image" && (
            <MediaUploadProgressWidget
              task={activeUploadTask}
              onCancel={cancelUpload}
              onDismiss={dismissUpload}
            />
          )}

          {/* Images */}
          <DashboardSection
            title="Images"
            action={
              <button
                type="button"
                onClick={() => setIsUploadImageOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shrink-0 cursor-pointer hover:scale-102"
              >
                <IconUpload size={16} /> <span className="hidden sm:inline">Upload Image</span>
              </button>
            }
          >
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4 md:mb-8 wrap-break-word">
              Match highlights & training
            </p>

            {isImagesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <MediaCardSkeleton key={`img-skel-${i}`} />
                ))}
              </div>
            ) : isImagesError ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/[0.02]">
                <p className="text-sm font-bold text-destructive">Failed to load images</p>
                <button
                  type="button"
                  onClick={() => refetchImages()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  <IconRefresh size={14} /> Retry
                </button>
              </div>
            ) : imagesList.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <IconPhoto size={24} />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  No images uploaded yet
                </p>
                <p className="text-xs text-white/40 max-w-sm">
                  Upload match photos and training highlights to showcase your club.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadImageOpen(true)}
                  className="mt-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <IconUpload size={14} />
                  <span>Upload First Image</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
                {imagesList.map((item) => (
                  <AcademyMediaCard
                    key={item._id}
                    item={item}
                    type="IMAGE"
                    onPreview={setPreviewItem}
                    onEdit={setEditingItem}
                    onDelete={setDeletingItem}
                  />
                ))}
              </div>
            )}
          </DashboardSection>

          {/* Background Video Upload Progress Widget */}
          {activeUploadTask && activeUploadTask.type === "video" && (
            <MediaUploadProgressWidget
              task={activeUploadTask}
              onCancel={cancelUpload}
              onDismiss={dismissUpload}
            />
          )}

          {/* Videos */}
          <DashboardSection
            title="Videos"
            action={
              <button
                type="button"
                onClick={() => setIsUploadVideoOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shrink-0 cursor-pointer hover:scale-102"
              >
                <IconUpload size={16} /> <span className="hidden sm:inline">Upload Video</span>
              </button>
            }
          >
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-4 md:mb-8 wrap-break-word">
              Match highlights & training
            </p>

            {isVideosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <MediaCardSkeleton key={`vid-skel-${i}`} isVideo />
                ))}
              </div>
            ) : isVideosError ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/[0.02]">
                <p className="text-sm font-bold text-destructive">Failed to load videos</p>
                <button
                  type="button"
                  onClick={() => refetchVideos()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all cursor-pointer"
                >
                  <IconRefresh size={14} /> Retry
                </button>
              </div>
            ) : videosList.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                  <IconVideo size={24} />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  No videos uploaded yet
                </p>
                <p className="text-xs text-white/40 max-w-sm">
                  Upload match recordings and training drill clips with custom thumbnails.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUploadVideoOpen(true)}
                  className="mt-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <IconUpload size={14} />
                  <span>Upload First Video</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full">
                {videosList.map((item) => (
                  <AcademyMediaCard
                    key={item._id}
                    item={item}
                    type="VIDEO"
                    onPreview={setPreviewItem}
                    onEdit={setEditingItem}
                    onDelete={setDeletingItem}
                  />
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        {/* Right Section - Recent Activity */}
        <div className="hidden lg:block lg:col-span-3 sticky top-8 h-fit min-w-0">
          <div className="p-8 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <IconBell size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Recent Activity</h3>
            </div>
            <div className="flex flex-col gap-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => {
                  const getIcon = () => {
                    const upperType = (act.type || "").toUpperCase();
                    if (upperType.includes("FAVOURITE") || upperType.includes("LIKE")) {
                      return <IconHeart className="size-4.5 text-destructive" />;
                    }
                    if (upperType.includes("SHARE")) {
                      return <IconShare className="size-4.5" />;
                    }
                    if (upperType.includes("VIEW") || upperType.includes("SCOUT")) {
                      return <IconEye className="size-4.5" />;
                    }
                    return <IconBell className="size-4.5" />;
                  };

                  return (
                    <ActivityItem
                      key={act.id}
                      icon={getIcon()}
                      text={act.title || act.description}
                      time={act.timeAgo || "RECENT"}
                    />
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-white/40 border border-dashed border-white/10 rounded-xl">
                  No recent activity recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Modals */}
      <UploadImageModal
        isOpen={isUploadImageOpen}
        onClose={() => setIsUploadImageOpen(false)}
        onStartUpload={startUpload}
      />
      <UploadVideoModal
        isOpen={isUploadVideoOpen}
        onClose={() => setIsUploadVideoOpen(false)}
        onStartUpload={startUpload}
      />
      <MediaPreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
      <EditMediaModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
      />
      <DeleteMediaModal
        item={deletingItem}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};

const ActivityItem = ({
  icon,
  text,
  time,
}: {
  icon: React.ReactNode;
  text: string;
  time: string;
}) => (
  <div className="p-4 rounded-2xl border border-white/5 bg-white/2 flex gap-4 hover:border-destructive/30 transition-all group">
    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-destructive/10 group-hover:text-destructive transition-colors shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-xs font-bold text-white leading-tight mb-1 truncate">{text}</div>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{time}</div>
    </div>
  </div>
);

export default ClubDashboard;
