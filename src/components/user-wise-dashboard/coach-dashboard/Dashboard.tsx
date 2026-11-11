/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useContext, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/reduxHooks";
import { CoachContext } from "@/app/dashboard/coach/layout";
import { useCoach } from "@/hooks/useCoach";
import {
  IconBallFootball,
  IconEye,
  IconHeart,
  IconPlayerPlay,
  IconPlus,
  IconCircleCheck,
  IconPhoto,
  IconVideo,
  IconUpload,
  IconEdit,
  IconTrash,
  IconShare,
  IconLoader2,
  IconAlertCircle,
  IconAward,
  IconMoodEmpty,
  IconChevronDown,
  IconCheck,
  IconLock,
} from "@tabler/icons-react";
import {
  useGetMyMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} from "@/redux/features/media/mediaApi";
import {
  useGetMyCoachAnalyticsQuery,
  useGetMyTeamsQuery,
  useUpdatePlayerFitnessStatusMutation,
} from "@/redux/features/coach/coachApi";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { ICoachTeamPlayer } from "@/types/coach.type";
import { IMediaItem } from "@/types/media.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import DashboardHero from "@/components/dashboard/DashboardHero";

const DEFAULT_AVATAR =
  "https://res.cloudinary.com/da1uxchgo/image/upload/v1789553255/player_profiles/ejlqkaqmvctx4xodazzj.jpg";

const clubsInterested = [
  { id: 1, name: "Manchester City", logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", action: "Viewed your profile" },
  { id: 2, name: "Liverpool FC", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", action: "Viewed your profile" },
  { id: 3, name: "Chelsea FC", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", action: "Viewed your profile" },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  } catch {
    return dateStr;
  }
};

const MediaCardSkeleton = ({ isVideo }: { isVideo?: boolean }) => (
  <div className="rounded-xl overflow-hidden border border-white/20 bg-[#111] flex flex-col animate-pulse">
    <div className="relative aspect-video bg-white/5 flex items-center justify-center overflow-hidden">
      {isVideo && (
        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center">
          <div className="size-4 rounded-full bg-white/15" />
        </div>
      )}
    </div>
    <div className="p-3 bg-linear-to-b from-[#111] to-[#0D0D0D] flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-3/4 rounded-md bg-white/10" />
        <div className="h-2 w-1/3 rounded-md bg-white/5" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-8 rounded bg-white/5" />
          <div className="h-2.5 w-8 rounded bg-white/5" />
        </div>
      </div>
    </div>
  </div>
);

const CoachDashboard = () => {
  const { hasAcademy } = useContext(CoachContext);
  const { coachData } = useCoach();
  const router = useRouter();
  const requests = useAppSelector(state => state.reports.requests);

  // Coach Analytics API Query
  const {
    data: analyticsResponse,
    isLoading: isLoadingAnalytics,
  } = useGetMyCoachAnalyticsQuery();

  const analytics = analyticsResponse?.data;
  const profileAnalysis = analytics?.coachProfileAnalysis;
  const tournamentStats = analytics?.tournamentStats;

  // Radar chart data for Coach Profile Analysis
  const profileAnalysisData = useMemo(() => {
    if (!profileAnalysis) {
      return [
        { subject: "Tactics", A: 0, fullMark: 100 },
        { subject: "Leadership", A: 0, fullMark: 100 },
        { subject: "Communication", A: 0, fullMark: 100 },
        { subject: "Adaptability", A: 0, fullMark: 100 },
        { subject: "Discipline", A: 0, fullMark: 100 },
        { subject: "Development", A: 0, fullMark: 100 },
      ];
    }
    return [
      { subject: "Tactics", A: profileAnalysis.tactics ?? 0, fullMark: 100 },
      { subject: "Leadership", A: profileAnalysis.leadership ?? 0, fullMark: 100 },
      { subject: "Communication", A: profileAnalysis.communication ?? 0, fullMark: 100 },
      { subject: "Adaptability", A: profileAnalysis.adaptability ?? 0, fullMark: 100 },
      { subject: "Discipline", A: profileAnalysis.discipline ?? 0, fullMark: 100 },
      { subject: "Development", A: profileAnalysis.development ?? 0, fullMark: 100 },
    ];
  }, [profileAnalysis]);

  // Tournament Stats Pie chart data
  const tournamentStatsData = useMemo(() => {
    const percentages = tournamentStats?.percentages;
    return [
      {
        name: "WIN",
        value: percentages?.win ?? 0,
        count: tournamentStats?.win ?? 0,
        color: "#A80000",
      },
      {
        name: "LOSS",
        value: percentages?.loss ?? 0,
        count: tournamentStats?.loss ?? 0,
        color: "#FF1A1A",
      },
      {
        name: "DRAW",
        value: percentages?.draw ?? 0,
        count: tournamentStats?.draw ?? 0,
        color: "#FF9999",
      },
      {
        name: "RUNNER UP",
        value: percentages?.runnerUp ?? 0,
        count: tournamentStats?.runnerUp ?? 0,
        color: "#FF4D4D",
      },
      {
        name: "CHAMPION",
        value: percentages?.champion ?? 0,
        count: tournamentStats?.champion ?? 0,
        color: "#FFEBEB",
      },
    ];
  }, [tournamentStats]);

  // My Teams API Query & Mutation
  const {
    data: teamResponse,
    isLoading: isLoadingTeam,
  } = useGetMyTeamsQuery();
  const { data: subscriptionResponse } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subscriptionResponse?.data?.hasActiveSubscription);

  const [updatePlayerFitnessStatus] = useUpdatePlayerFitnessStatusMutation();
  const [updatingTeamPlayerId, setUpdatingTeamPlayerId] = useState<string | null>(null);

  const teamData = teamResponse?.data;
  const academy = teamData?.academy;
  const players: ICoachTeamPlayer[] = useMemo(() => teamData?.players || [], [teamData]);

  const handleUpdateTeamPlayerStatus = async (
    player: ICoachTeamPlayer,
    newStatus: "ACTIVE" | "INJURED"
  ) => {
    const playerId = player._id || player.id;
    if (!playerId) return;
    if (player.status?.toUpperCase() === newStatus) return;

    if (!hasActiveSubscription) {
      toast.error(
        "Active coach subscription required to update squad fitness/injury status."
      );
      router.push("/dashboard/coach/my-subscription");
      return;
    }

    try {
      setUpdatingTeamPlayerId(playerId);
      await updatePlayerFitnessStatus({ playerId, status: newStatus }).unwrap();
    } catch {
      // Handled by onQueryStarted in coachApi
    } finally {
      setUpdatingTeamPlayerId(null);
    }
  };

  // Media API Queries
  const {
    data: imagesResponse,
    isLoading: isLoadingImages,
  } = useGetMyMediaQuery({ mediaType: "IMAGE", limit: 50 });

  const {
    data: videosResponse,
    isLoading: isLoadingVideos,
  } = useGetMyMediaQuery({ mediaType: "VIDEO", limit: 50 });

  // Media API Mutations
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [updateMedia, { isLoading: isUpdating }] = useUpdateMediaMutation();
  const [deleteMedia, { isLoading: isDeleting }] = useDeleteMediaMutation();

  // Modals state
  const [isUploadImageOpen, setIsUploadImageOpen] = useState(false);
  const [isUploadVideoOpen, setIsUploadVideoOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<IMediaItem | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<IMediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<IMediaItem | null>(null);

  // Form states
  const [imageTitle, setImageTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");

  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreviewUrl, setVideoThumbnailPreviewUrl] = useState<string>("");

  const [editTitle, setEditTitle] = useState("");

  const imagesList = imagesResponse?.data?.media || [];
  const videosList = videosResponse?.data?.media || [];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file for thumbnail");
        return;
      }
      setVideoThumbnailFile(file);
      setVideoThumbnailPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageTitle.trim()) {
      toast.error("Please provide an image title");
      return;
    }
    if (!imageFile) {
      toast.error("Please select an image file to upload");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: imageTitle.trim() }));
      formData.append("image", imageFile);

      await uploadMedia(formData).unwrap();
      setIsUploadImageOpen(false);
      setImageTitle("");
      setImageFile(null);
      setImagePreviewUrl("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  const handleUploadVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      toast.error("Please provide a video title");
      return;
    }
    if (!videoFile) {
      toast.error("Please select a video file to upload");
      return;
    }
    if (!videoThumbnailFile) {
      toast.error("Please select a cover thumbnail image");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ title: videoTitle.trim() }));
      formData.append("video", videoFile);
      formData.append("thumbnail", videoThumbnailFile);

      await uploadMedia(formData).unwrap();
      setIsUploadVideoOpen(false);
      setVideoTitle("");
      setVideoFile(null);
      setVideoThumbnailFile(null);
      setVideoThumbnailPreviewUrl("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  const handleOpenEdit = (item: IMediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title || "");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia || !editTitle.trim()) return;
    try {
      await updateMedia({ mediaId: editingMedia._id, title: editTitle.trim() }).unwrap();
      setEditingMedia(null);
      setEditTitle("");
    } catch {
      // Toast handled by mediaApi
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingMedia) return;
    try {
      await deleteMedia(deletingMedia._id).unwrap();
      setDeletingMedia(null);
    } catch {
      // Toast handled by mediaApi
    }
  };

  const handleShare = (item: IMediaItem) => {
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.url);
      toast.success("Media link copied to clipboard");
    }
  };
  const teamColumns: Column<ICoachTeamPlayer>[] = useMemo(
    () => [
      {
        header: "Name",
        key: "name",
        render: (player) => (
          <div className="flex items-center gap-3">
            <Image
              width={40}
              height={40}
              src={player.avatar || DEFAULT_AVATAR}
              className="size-10 rounded-full object-cover border border-white/10"
              alt={player.name || "Player"}
            />
            <div>
              <div className="text-sm font-bold text-white">{player.name}</div>
              <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                {player.position || "N/A"}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Rating",
        key: "rating",
        align: "center",
        render: (player) => (
          <span className="text-sm font-black text-[#E31B23] italic">
            {player.rating !== undefined ? player.rating : "-"}
          </span>
        ),
      },
      {
        header: "Matches",
        key: "matches",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.matches ?? 0,
      },
      {
        header: "Goals",
        key: "goals",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.goals ?? 0,
      },
      {
        header: "Assists",
        key: "assists",
        align: "center",
        cellClassName: "text-sm text-gray-400",
        render: (player) => player.assists ?? 0,
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        render: (player) => {
          const playerId = player._id || player.id || "";
          const isActive = player.status?.toUpperCase() === "ACTIVE";
          const isUpdatingThis = updatingTeamPlayerId === playerId;

          if (!hasActiveSubscription) {
            return (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toast.error(
                    "Active coach subscription required to update squad fitness/injury status."
                  );
                  router.push("/dashboard/coach/my-subscription");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 bg-white/5 text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-white transition-all select-none"
                title="Subscription required to update squad fitness"
              >
                <IconLock size={12} className="text-primary" />
                <span>{player.status || "ACTIVE"}</span>
              </div>
            );
          }

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={isUpdatingThis}>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border select-none focus:outline-none",
                      isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
                      isUpdatingThis && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isUpdatingThis ? (
                      <IconLoader2 size={12} className="animate-spin" />
                    ) : (
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          isActive ? "bg-green-500" : "bg-red-500"
                        )}
                      />
                    )}
                    <span>{player.status || "ACTIVE"}</span>
                    <IconChevronDown size={11} className="opacity-60" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="bg-[#141414] border border-white/15 text-white p-1 rounded-xl shadow-2xl min-w-32"
                >
                  <DropdownMenuItem
                    onClick={() => handleUpdateTeamPlayerStatus(player, "ACTIVE")}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors",
                      isActive ? "text-green-400 bg-green-500/10" : "text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-green-500" />
                      <span>Active</span>
                    </div>
                    {isActive && <IconCheck size={14} className="text-green-400" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUpdateTeamPlayerStatus(player, "INJURED")}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors",
                      !isActive ? "text-red-400 bg-red-500/10" : "text-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-red-500" />
                      <span>Injured</span>
                    </div>
                    {!isActive && <IconCheck size={14} className="text-red-400" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
      {
        header: "Actions",
        key: "actions",
        align: "right",
        render: (player) => (
          <TableActionButtons
            onView={() =>
              router.push(
                `/dashboard/coach/game-reports?playerId=${player.id || player._id}`
              )
            }
            viewColor="text-[#E31B23] hover:text-white border-[#E31B23]/20 hover:border-[#E31B23] bg-[#E31B23]/5 hover:bg-[#E31B23]"
          />
        ),
      },
    ],
    [router, updatingTeamPlayerId]
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-9 space-y-6 min-w-0">
          {/* Hero Section */}
          <DashboardHero
            backgroundImage="/stadium-night.jpg"
            rating={profileAnalysis?.overall ?? 58}
            badgeText={`${coachData.transferStatus} Coach`}
            title={coachData.fullName}
            subtitle={coachData.coachType}
            details={[
              { text: coachData.age ? coachData.age.replace(/\D/g, "") : "" },
              { text: coachData.birthCountry }
            ]}
            contacts={[
              { type: "club", label: "Current Club", value: coachData.agency },
              { type: "phone", label: "Contact", value: coachData.phone },
              { type: "license", label: "Validation Status", value: "UEFA A License" },
              { type: "email", label: "Email", value: coachData.email },
            ]}
            characterImage={coachData.coachImage}
          />
          {/* Analytics Section */}
          <div className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white">Analytics</h2>
                <p className="text-xs md:text-sm text-gray-500">Deep insights into coaching performance and leadership</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard/coach/analytics")}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                Full Analytics
              </button>
            </div>

            {isLoadingAnalytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] h-80 flex flex-col justify-between animate-pulse">
                  <div className="h-5 w-40 bg-white/10 rounded-md" />
                  <div className="size-44 rounded-full bg-white/5 mx-auto" />
                  <div className="h-4 w-28 bg-white/5 rounded-md" />
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] h-80 flex flex-col justify-between animate-pulse">
                  <div className="h-5 w-40 bg-white/10 rounded-md" />
                  <div className="size-44 rounded-full bg-white/5 mx-auto" />
                  <div className="h-4 w-40 bg-white/5 rounded-md mx-auto" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coach Profile Analysis */}
                <div className="h-80 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <IconAward className="size-4 text-[#E31B23]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
                        Coach Profile Analysis
                      </h3>
                    </div>
                    {profileAnalysis?.overall !== undefined && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E31B23]/10 border border-[#E31B23]/30">
                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                          Overall:
                        </span>
                        <span className="text-xs font-black text-[#E31B23] font-orbitron">
                          {profileAnalysis.overall}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="size-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="68%" data={profileAnalysisData}>
                        <PolarGrid stroke="#2a2a2a" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#999", fontSize: 10, fontWeight: "bold" }}
                        />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="#E31B23"
                          fill="#E31B23"
                          fillOpacity={0.65}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                          itemStyle={{ color: "#E31B23", fontWeight: "bold" }}
                          formatter={(val: any) => [`${val} / 100`, "Score"]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tournament Stats */}
                <div className="h-88 flex flex-col justify-between pb-2">
                  <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <IconBallFootball className="size-4 text-[#E31B23]" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest italic font-orbitron">
                        Tournament Stats
                      </h3>
                    </div>
                    {tournamentStats?.totalMatches !== undefined && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15">
                        <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">
                          Matches:
                        </span>
                        <span className="text-xs font-black text-white font-orbitron">
                          {tournamentStats.totalMatches}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="size-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tournamentStatsData}
                          cx="50%"
                          cy="46%"
                          outerRadius={95}
                          dataKey="value"
                          labelLine={false}
                          label={({
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                            index,
                          }) => {
                            if (percent < 0.04) return null;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.58;
                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                            return (
                              <text
                                x={x}
                                y={y}
                                fill={index === 4 ? "#000" : "#fff"}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="text-[10px] font-black font-orbitron"
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                        >
                          {tournamentStatsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="#0D0D0D"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                          itemStyle={{ color: "#fff" }}
                          formatter={(value: any, name: any, item: any) => [
                            `${value}% (${item?.payload?.count ?? 0} matches)`,
                            name,
                          ]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="square"
                          iconSize={8}
                          wrapperStyle={{ paddingTop: "12px" }}
                          formatter={(value) => (
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mr-2">
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* My CV Section */}
          <div className="p-6 md:p-8 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <h2 className="text-lg md:text-xl font-bold text-white mb-6">My CV</h2>
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
              {/* Progress Card */}
              <div className="p-5 rounded-xl border border-white/10 bg-white/2 w-full lg:w-auto min-w-50">
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Profile Completion</span>
                <div className="text-4xl font-black text-[#E31B23] italic mt-1 mb-3">85%</div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E31B23] rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              {/* Info and Checklist */}
              <div className="flex-1 space-y-6 min-w-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  {[
                    { label: 'Personal Info', checked: true },
                    { label: 'Key Accomplishments', checked: true },
                    { label: 'Major Trophies', checked: true },
                    { label: 'Key Skills', checked: true },
                    { label: 'Courses', checked: true }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <IconCircleCheck size={18} className="text-green-500" />
                      <span className="text-sm font-bold text-white">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <div className="w-1 h-12 bg-white/40 rounded-full" />
                  <div>
                    <h4 className="text-base font-bold text-white mb-1 italic">Silver</h4>
                    <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                      Your CV meets silver standards and is ready to share with top clubs and agents.
                    </p>
                  </div>
                </div>
              </div>
              {/* Buttons */}
              <div className="flex flex-col gap-2 w-full lg:w-auto">
                <button className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all text-center">
                  Download PDF
                </button>
                <button className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all text-center">
                  Share Agent
                </button>
              </div>
            </div>
          </div>
          {/* Media Sections */}
          <div className="flex flex-col gap-6">
            {/* My Images Section */}
            <div className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-white">My Images</h2>
                    <span className="text-xs font-bold text-white/40">({imagesList.length})</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">Match highlights & training</p>
                </div>
                <button
                  onClick={() => {
                    setImageTitle("");
                    setImageFile(null);
                    setImagePreviewUrl("");
                    setIsUploadImageOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <IconPlus size={16} />
                  <span>Upload Image</span>
                </button>
              </div>

              {isLoadingImages ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <MediaCardSkeleton key={`img-skel-${i}`} isVideo={false} />
                  ))}
                </div>
              ) : imagesList.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                    <IconPhoto size={20} />
                  </div>
                  <p className="text-xs font-bold text-white/70">No images uploaded yet</p>
                  <button
                    onClick={() => {
                      setImageTitle("");
                      setImageFile(null);
                      setImagePreviewUrl("");
                      setIsUploadImageOpen(true);
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-[#00FF85] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <IconPlus size={14} />
                    <span>Upload First Image</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {imagesList.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-xl overflow-hidden border border-white/20 bg-[#111] hover:border-white/40 transition-all flex flex-col"
                    >
                      <div
                        onClick={() => setPreviewMedia(item)}
                        className="relative aspect-video overflow-hidden cursor-pointer bg-black/40"
                      >
                        <Image
                          width={400}
                          height={250}
                          src={item.url || "/placeholder_img.jpg"}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          alt={item.title}
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder_img.jpg";
                          }}
                        />
                        {/* Hover action buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit title"
                            className="size-7 rounded-lg bg-black/75 hover:bg-[#E31B23] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                          >
                            <IconEdit size={12} />
                          </button>
                          <button
                            onClick={() => setDeletingMedia(item)}
                            title="Delete image"
                            className="size-7 rounded-lg bg-black/75 hover:bg-red-600 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3">
                        <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <IconEye size={12} /> {item.views ?? 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <IconHeart size={12} className="text-[#E31B23]" /> {item.likes ?? 0}
                            </div>
                          </div>
                          <button
                            onClick={() => handleShare(item)}
                            title="Share"
                            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <IconShare size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Videos Section */}
            <div className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold text-white">My Videos</h2>
                    <span className="text-xs font-bold text-white/40">({videosList.length})</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">Match highlights & training</p>
                </div>
                <button
                  onClick={() => {
                    setVideoTitle("");
                    setVideoFile(null);
                    setVideoThumbnailFile(null);
                    setVideoThumbnailPreviewUrl("");
                    setIsUploadVideoOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <IconPlayerPlay size={16} />
                  <span>Upload Video</span>
                </button>
              </div>

              {isLoadingVideos ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <MediaCardSkeleton key={`vid-skel-${i}`} isVideo={true} />
                  ))}
                </div>
              ) : videosList.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                    <IconVideo size={20} />
                  </div>
                  <p className="text-xs font-bold text-white/70">No videos uploaded yet</p>
                  <button
                    onClick={() => {
                      setVideoTitle("");
                      setVideoFile(null);
                      setVideoThumbnailFile(null);
                      setVideoThumbnailPreviewUrl("");
                      setIsUploadVideoOpen(true);
                    }}
                    className="text-xs font-bold uppercase tracking-wider text-[#E31B23] hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <IconPlayerPlay size={14} />
                    <span>Upload First Video</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {videosList.map((item) => (
                    <div
                      key={item._id}
                      className="group relative rounded-xl overflow-hidden border border-white/20 bg-[#111] hover:border-white/40 transition-all flex flex-col"
                    >
                      <div
                        onClick={() => setPreviewMedia(item)}
                        className="relative aspect-video overflow-hidden cursor-pointer bg-black/40"
                      >
                        <Image
                          width={400}
                          height={250}
                          src={item.thumbnailUrl || item.url || "/placeholder_img.jpg"}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
                          alt={item.title}
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/placeholder_img.jpg";
                          }}
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="size-10 rounded-full bg-[#E31B23] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <IconPlayerPlay size={20} className="text-white fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Hover action buttons */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10"
                        >
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit title"
                            className="size-7 rounded-lg bg-black/75 hover:bg-[#E31B23] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                          >
                            <IconEdit size={12} />
                          </button>
                          <button
                            onClick={() => setDeletingMedia(item)}
                            title="Delete video"
                            className="size-7 rounded-lg bg-black/75 hover:bg-red-600 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                          >
                            <IconTrash size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="p-3">
                        <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                          {formatDate(item.createdAt)}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <IconEye size={12} /> {item.views ?? 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                              <IconHeart size={12} className="text-[#E31B23]" /> {item.likes ?? 0}
                            </div>
                          </div>
                          <button
                            onClick={() => handleShare(item)}
                            title="Share"
                            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                          >
                            <IconShare size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Conditional My Teams Section */}
          {hasAcademy && (
            <div className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg md:text-xl font-bold text-white">My Teams</h2>
                    {academy?.name && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-white/80">
                        {academy.logo && (
                          <Image
                            src={academy.logo}
                            alt={academy.name}
                            width={14}
                            height={14}
                            className="size-3.5 rounded-full object-cover"
                          />
                        )}
                        {academy.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">Professional players under your management</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Add Player button temporarily hidden per user request */}
                  {/* <button className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-xs font-bold text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                    <IconPlus size={16} /> Add Player
                  </button> */}

                  {players.length > 0 && (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {players.length} {players.length === 1 ? "Player" : "Players"}
                    </span>
                  )}
                </div>
              </div>

              {isLoadingTeam ? (
                <div className="border border-white/20 rounded-2xl overflow-hidden animate-pulse">
                  <div className="bg-white/5 border-b border-white/20 px-6 py-4 flex items-center justify-between">
                    <div className="h-3 w-16 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                    <div className="h-3 w-14 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                    <div className="h-3 w-12 bg-white/10 rounded" />
                    <div className="h-3 w-14 bg-white/10 rounded" />
                    <div className="h-3 w-14 bg-white/10 rounded" />
                  </div>
                  <div className="divide-y divide-white/20">
                    {[...Array(3)].map((_, rowIdx) => (
                      <div key={rowIdx} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-white/10 shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-3.5 w-24 bg-white/10 rounded" />
                            <div className="h-2.5 w-14 bg-white/5 rounded" />
                          </div>
                        </div>
                        <div className="h-3.5 w-8 bg-white/10 rounded" />
                        <div className="h-3.5 w-8 bg-white/10 rounded" />
                        <div className="h-3.5 w-8 bg-white/10 rounded" />
                        <div className="h-3.5 w-8 bg-white/10 rounded" />
                        <div className="h-5 w-16 rounded-full bg-white/10" />
                        <div className="size-8 rounded-lg bg-white/5 border border-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : players.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-white/10 rounded-2xl">
                  <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 mb-3">
                    <IconMoodEmpty size={24} />
                  </div>
                  <p className="text-sm font-semibold text-white">No players found</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    There are currently no players assigned to your squad.
                  </p>
                </div>
              ) : (
                <DashboardTable
                  columns={teamColumns}
                  data={players}
                  className="border-white/20"
                  onRowClick={(player) =>
                    router.push(`/dashboard/coach/game-reports?playerId=${player.id || player._id}`)
                  }
                />
              )}
            </div>
          )}
        </div>
        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6 min-w-0">
          {/* Pending Game Reports */}
          <section className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#E31B23]/10 text-[#E31B23]">
                <IconBallFootball size={20} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Pending Game Reports</h2>
            </div>
            <div className="space-y-4">
              {requests.filter(req => req.status === 'Pending').map((req) => (
                <div
                  key={req.id}
                  onClick={() => router.push(`/dashboard/coach/game-reports/create?playerId=${req.playerId}&requestId=${req.id}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/20 group hover:border-[#E31B23]/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      src={players.find(p => String(p.id || p._id) === String(req.playerId))?.avatar || DEFAULT_AVATAR}
                      className="size-10 rounded-full object-cover"
                      alt={req.playerName}
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{req.playerName}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">{req.playerPosition}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">CREATE</div>
                </div>
              ))}
            </div>
          </section>
          {/* Clubs Interested */}
          <section className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#E31B23]/10 text-[#E31B23]">
                <IconHeart size={20} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Clubs Interested</h2>
            </div>
            <div className="space-y-4">
              {clubsInterested.map((club) => (
                <div key={club.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/10 border border-white/20 group hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 p-1 rounded-lg bg-white/10 flex items-center justify-center">
                    <Image width={50} height={50} src={club.logo} className="w-full h-full object-contain" alt={club.name} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{club.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{club.action}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Quick Stats */}
          <section className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 italic">Quick stats</h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Matches Coached",
                  value: (tournamentStats?.totalMatches ?? coachData.seasonStats.matches ?? 0).toString(),
                  color: "text-white",
                },
                {
                  label: "Total Wins",
                  value: (tournamentStats?.win ?? coachData.seasonStats.wins ?? 0).toString(),
                  color: "text-red-500",
                },
                {
                  label: "Losses",
                  value: (tournamentStats?.loss ?? Math.max(2, coachData.seasonStats.losses || 0)).toString(),
                  color: "text-red-500",
                },
                {
                  label: "Draws",
                  value: (tournamentStats?.draw ?? Math.max(2, coachData.seasonStats.draws || 0)).toString(),
                  color: "text-blue-500",
                },
                {
                  label: "Clean Sheets",
                  value: (coachData.seasonStats.cleanSheets ?? 0).toString(),
                  color: "text-green-500",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-sm font-black italic ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL 1: Upload Image Modal */}
      <Dialog open={isUploadImageOpen} onOpenChange={setIsUploadImageOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <IconPhoto className="text-[#00FF85] size-6 shrink-0" />
              <span>Upload Image</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUploadImageSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Image Title <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="e.g. Training Highlights 2026"
                className="w-full h-10 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Choose Image File <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#00FF85]/50 rounded-xl p-4 bg-white/[0.02] flex flex-col items-center justify-center gap-2 transition-colors text-center group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!imageFile}
                />

                {imagePreviewUrl ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={imagePreviewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                        Click to change image
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#00FF85] transition-colors">
                      <IconPhoto size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Click or drag & drop image</p>
                      <p className="text-[10px] text-white/40 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadImageOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !imageTitle.trim() || !imageFile}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  !isUploading && imageTitle.trim() && imageFile
                    ? "bg-[#00FF85] hover:bg-[#00E577] text-black shadow-lg cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Image</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Upload Video Modal */}
      <Dialog open={isUploadVideoOpen} onOpenChange={setIsUploadVideoOpen}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl max-w-lg w-[92vw] sm:w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <IconVideo className="text-[#E31B23] size-6 shrink-0" />
              <span>Upload Video</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUploadVideoSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Video Title <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. Best Match Clips 2026"
                className="w-full h-10 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23]/50 transition-all"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                Video File <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#E31B23]/50 rounded-xl p-3 bg-white/[0.02] flex flex-col items-center justify-center gap-1.5 text-center transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!videoFile}
                />
                <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#E31B23] transition-colors">
                  <IconVideo size={16} />
                </div>
                {videoFile ? (
                  <span className="text-xs font-bold text-white truncate max-w-xs">{videoFile.name}</span>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-white">Click or drag & drop video</p>
                    <p className="text-[10px] text-white/40">MP4, MOV, WebM</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center justify-between">
                <span>Cover Thumbnail <span className="text-[#E31B23]">*</span></span>
                <span className="text-[10px] text-[#00FF85] font-semibold">Required for video</span>
              </label>
              <div className="relative border-2 border-dashed border-white/20 hover:border-[#00FF85]/50 rounded-xl p-3 bg-white/[0.02] flex flex-col items-center justify-center gap-1.5 text-center transition-colors group cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  required={!videoThumbnailFile}
                />

                {videoThumbnailPreviewUrl ? (
                  <div className="relative w-full h-24 rounded-lg overflow-hidden border border-white/10">
                    <Image
                      src={videoThumbnailPreviewUrl}
                      alt="Thumbnail Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <>
                    <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#00FF85] transition-colors">
                      <IconPhoto size={16} />
                    </div>
                    <p className="text-xs font-bold text-white">Choose thumbnail image</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadVideoOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !videoTitle.trim() || !videoFile || !videoThumbnailFile}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                  !isUploading && videoTitle.trim() && videoFile && videoThumbnailFile
                    ? "bg-[#E31B23] hover:bg-[#c0161d] text-white shadow-lg cursor-pointer"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload Video</span>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Edit Title Modal */}
      <Dialog open={!!editingMedia} onOpenChange={(open) => !open && setEditingMedia(null)}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl max-w-md w-[92vw] sm:w-full p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <IconEdit className="text-white/60 size-5 shrink-0" />
              <span>Edit Title</span>
            </DialogTitle>
          </DialogHeader>

          {editingMedia && (
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white/70 uppercase tracking-widest">
                  New Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full h-10 bg-white/5 border border-white/15 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editTitle.trim()}
                  className={cn(
                    "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                    !isUpdating && editTitle.trim()
                      ? "bg-[#00FF85] hover:bg-[#00E577] text-black cursor-pointer shadow-md"
                      : "bg-white/10 text-white/30 cursor-not-allowed"
                  )}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Delete Confirmation Dialog */}
      <Dialog open={!!deletingMedia} onOpenChange={(open) => !open && setDeletingMedia(null)}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-2xl max-w-md w-[92vw] sm:w-full p-5 sm:p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <IconAlertCircle size={24} />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Delete Media Item?</h3>
              <p className="text-xs text-white/60">
                Are you sure you want to delete &quot;<span className="text-white font-bold">{deletingMedia?.title}</span>&quot;?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 w-full mt-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Preview Lightbox / Video Player Modal */}
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="bg-[#0A0A0A] border border-white/20 text-white rounded-2xl max-w-4xl w-[94vw] sm:w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
          {previewMedia && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10">
                <div className="flex flex-col min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{previewMedia.title}</h3>
                  <span className="text-[10px] text-white/50 uppercase font-semibold">
                    {previewMedia.mediaType} • {formatDate(previewMedia.createdAt)}
                  </span>
                </div>
              </div>

              {previewMedia.mediaType === "VIDEO" ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="size-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative max-h-[70vh] w-full flex items-center justify-center rounded-xl overflow-hidden bg-black/60">
                  <Image
                    src={previewMedia.url}
                    alt={previewMedia.title}
                    width={1200}
                    height={800}
                    className="max-h-[70vh] w-auto object-contain rounded-xl"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachDashboard;
