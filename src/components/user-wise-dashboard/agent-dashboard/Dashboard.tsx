/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  IconUsers,
  IconHeart,
  IconShare,
  IconEye,
  IconShieldCheck,
  IconCertificate,
  IconPhone,
  IconMail,
  IconChevronDown,
  IconUpload,
  IconPhoto,
  IconVideo,
  IconRefresh,
} from "@tabler/icons-react";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { DashboardSidebarPanel } from "@/components/dashboard/DashboardSidebar";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { DashboardSection } from "@/components/dashboard/DashboardElements";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
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
import { useGetAgentAnalyticsQuery } from "@/redux/features/agent/agentApi";

const areaData = [
  { week: "Week 1", views: 14 },
  { week: "Week 2", views: 21 },
  { week: "Week 3", views: 12 },
  { week: "Week 4", views: 25 },
];

const barData = [
  { week: "Week 1", likes: 8, shares: 5 },
  { week: "Week 2", likes: 6, shares: 9 },
  { week: "Week 3", likes: 11, shares: 4 },
  { week: "Week 4", likes: 3, shares: 5 },
];

type Player = {
  avatar: string;
  name: string;
  position: string;
  rating: number;
  club: string;
  country: string;
  age: number;
  status: "Gold" | "Silver" | "Bronze";
};

const monitoredPlayers: Player[] = [
  { avatar: "https://i.pravatar.cc/150?u=10", name: "Marcus Silva", position: "Forward", rating: 9.2, club: "Manchester Academy", country: "Brazil", age: 19, status: "Silver" },
  { avatar: "https://i.pravatar.cc/150?u=11", name: "David Chen", position: "Midfielder", rating: 8.8, club: "Chelsea Youth", country: "England", age: 18, status: "Gold" },
  { avatar: "https://i.pravatar.cc/150?u=12", name: "Alex Jonson", position: "Defender", rating: 8.5, club: "Barcelona B", country: "Spain", age: 20, status: "Silver" },
  { avatar: "https://i.pravatar.cc/150?u=13", name: "James Brown", position: "Goalkeeper", rating: 7.9, club: "Liverpool Academy", country: "Argentina", age: 17, status: "Bronze" },
];

const getStatusColor = (status: "Gold" | "Silver" | "Bronze") => {
  switch (status) {
    case "Gold": return "bg-[#ffc107] text-black";
    case "Silver": return "bg-[#e0e0e0] text-black";
    case "Bronze": return "bg-[#cd7f32] text-white";
    default: return "bg-gray-500 text-white";
  }
};

const columns: Column<Player>[] = [
  {
    header: "Name",
    key: "name",
    align: "left",
    render: (row) => (
      <div className="flex items-center gap-3">
        <Image src={row.avatar} alt={row.name} className="size-10 rounded-full border border-white/10" width={40} height={40} />
        <div>
          <p className="text-white font-semibold">{row.name}</p>
          <p className="text-[#E31B23] text-xs">{row.position}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Rating",
    key: "rating",
    align: "center",
    render: (row) => <span className="text-[#E31B23] font-bold">{row.rating.toFixed(1)}</span>,
  },
  {
    header: "Club",
    key: "club",
    align: "center",
    cellClassName: "text-white font-medium",
  },
  {
    header: "Country",
    key: "country",
    align: "center",
    cellClassName: "text-gray-400",
  },
  {
    header: "Age",
    key: "age",
    align: "center",
    cellClassName: "text-gray-400",
  },
  {
    header: "Status",
    key: "status",
    align: "center",
    render: (row) => (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(row.status)}`}>
        {row.status}
      </span>
    ),
  },
  {
    header: "Actions",
    key: "actions",
    align: "center",
    render: () => (
      <TableActionButtons
        onView={() => { }}
        onHeart={() => { }}
        onShare={() => { }}
      />
    ),
  },
];

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] text-white p-3 rounded-xl border border-white/10 shadow-lg">
        <p className="text-gray-400 text-xs mb-1">-- {label} --</p>
        <p className="font-semibold text-sm">
          {payload[0].name} : {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-black p-3 rounded-xl border-none shadow-lg">
        <p className="font-bold text-sm text-[#E31B23] mb-1">{label}</p>
        {payload.map((p: any, idx: number) => (
          <p key={idx} className="font-semibold text-sm">
            {p.name} : {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AgentDashboard = () => {
  const router = useRouter();

  // Agent Analytics query
  const { data: analyticsResponse } = useGetAgentAnalyticsQuery({ year: 2026 });
  const analyticsData = analyticsResponse?.data;
  const overview = analyticsData?.overview;

  const currentAreaData =
    analyticsData?.cvsViewsOverTime && analyticsData.cvsViewsOverTime.length > 0
      ? analyticsData.cvsViewsOverTime
      : areaData;

  const currentBarData =
    analyticsData?.likesAndSharesActivity && analyticsData.likesAndSharesActivity.length > 0
      ? analyticsData.likesAndSharesActivity
      : barData;

  // Media upload background context
  const { startUpload } = useMediaUpload();

  // Media queries
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

  return (
    <div className="flex flex-col gap-6">
      {/* Hero & Sidebar Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Custom Agent Hero */}
        <div className="flex-1 min-w-0">
          <div className="relative rounded-3xl overflow-hidden min-h-112.5 border border-white/15 group flex flex-col h-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(/707964211aa29e42aa7d522475b870cad9c4ad92.png)` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-black via-black/50 to-transparent" />
            <div className="relative p-6 sm:p-8 md:p-10 w-full flex flex-col h-full justify-between">
              <div>
                {/* Progress Circle SVG */}
                <div className="relative size-32 flex items-center justify-center mb-6">
                  <svg className="size-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#E31B23]" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.74)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-black italic">74%</span>
                    <span className="text-[10px] text-white/60 uppercase font-bold tracking-widest">Profile</span>
                  </div>
                </div>
                <div className="bg-black/80 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase w-fit tracking-[0.2em] mb-4">
                  ACTIVE AGENT
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none font-orbitron mb-3 wrap-break-word">
                  John Doe
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400">
                  <span className="text-[#E31B23]">Premium Agent</span>
                  <span className="hidden sm:inline">•</span>
                  <span>58 Years Old</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-3 bg-green-600 border border-white/10 rounded-sm"></span> Brazil</span>
                </div>
              </div>
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/15">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/15 text-white/40 shrink-0">
                    <IconShieldCheck className="size-5 sm:size-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate">License ID</p>
                    <p className="text-white text-sm sm:text-base font-bold font-heading truncate">UK-AG-2024-001</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/15 text-white/40 shrink-0">
                    <IconCertificate className="size-5 sm:size-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Certifications</p>
                    <p className="text-[#E31B23] text-sm sm:text-base font-bold font-heading truncate">FIFA Licensed Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/15 text-white/40 shrink-0">
                    <IconPhone className="size-5 sm:size-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Contact</p>
                    <p className="text-white text-sm sm:text-base font-bold font-heading truncate">+55 11 9999-8888</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/15 text-white/40 shrink-0">
                    <IconMail className="size-5 sm:size-5.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate">Email</p>
                    <p className="text-white text-sm sm:text-base font-bold font-heading truncate">john.doe@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-full xl:w-[320px] shrink-0">
          <DashboardSidebarPanel title="Recent Activity" icon={<IconShieldCheck size={20} />} iconColor="text-[#E31B23]">
            <div className="flex flex-col gap-4">
              {/* Activity Item 1 */}
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/4 transition-all flex items-start gap-4">
                <div className="mt-1">
                  <IconHeart size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    You liked CV James Rodriguez&apos;s
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              {/* Activity Item 2 */}
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/4 transition-all flex items-start gap-4">
                <div className="mt-1">
                  <IconShare size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    You shared profile Sarah Mitchell&apos;s
                  </p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              {/* Activity Item 3 */}
              <div className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/4 transition-all flex items-start gap-4">
                <div className="mt-1">
                  <IconShieldCheck size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    Verification status updated to Approved
                  </p>
                  <p className="text-xs text-gray-500">Yesterday at 3:45 PM</p>
                </div>
              </div>
            </div>
          </DashboardSidebarPanel>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard
          icon={<IconUsers className="size-6" />}
          label={overview?.playersProfileViewed?.label || "Players Profile Viewed"}
          value={String(overview?.playersProfileViewed?.count ?? 0)}
        />
        <DashboardStatCard
          icon={<IconHeart className="size-6" />}
          label={overview?.likedCvs?.label || "Liked CVs"}
          value={String(overview?.likedCvs?.count ?? 0)}
        />
        <DashboardStatCard
          icon={<IconShare className="size-6" />}
          label={overview?.sharedProfiles?.label || "Shared Profiles"}
          value={String(overview?.sharedProfiles?.count ?? 0)}
        />
        <DashboardStatCard
          icon={<IconEye className="size-6" />}
          label={overview?.profileViews?.label || "Profile Views"}
          value={String(overview?.profileViews?.count ?? 0)}
        />
      </div>

      {/* Analytics */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl p-5 sm:p-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron tracking-wide mb-1">
              {analyticsData?.title || "Analytics For Players Monitored"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {analyticsData?.subtitle ||
                "Insights based on Players interactions, profile activity & performance data."}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/agent/analytics")}
            className="w-full sm:w-auto bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg px-6 cursor-pointer"
          >
            Full Analytics
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Area Chart */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">CV Views Over Time</h3>
              <p className="text-xs text-gray-500">Your profile viewing trends</p>
            </div>
            <div className="h-55 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentAreaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E31B23" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#E31B23" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="views"
                    stroke="#E31B23"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    strokeWidth={2}
                    activeDot={{ r: 5, fill: '#111', stroke: '#E31B23', strokeWidth: 2 }}
                    dot={{ r: 3, fill: '#111', stroke: '#fff', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Likes & Shares Activity</h3>
              <p className="text-xs text-gray-500">Your interaction patterns</p>
            </div>
            <div className="h-55 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentBarData} barSize={12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                    allowDecimals={false}
                  />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomBarTooltip />} />
                  <Legend
                    iconType="square"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Bar dataKey="likes" name="Likes" fill="#E31B23" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" name="Shares" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Monitored Players */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl p-5 sm:p-8 flex flex-col gap-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white font-orbitron tracking-wide mb-4">Monitored Players</h2>
        <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-4 lg:justify-end mb-6">
          <Button variant="outline" className="w-full bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-4">
            All Positions <IconChevronDown className="ml-1 sm:ml-2 size-3 sm:size-4" />
          </Button>
          <Button variant="outline" className="w-full bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-4">
            Country <IconChevronDown className="ml-1 sm:ml-2 size-3 sm:size-4" />
          </Button>
          <Button variant="outline" className="w-full bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-4">
            Age Range <IconChevronDown className="ml-1 sm:ml-2 size-3 sm:size-4" />
          </Button>
          <Button variant="outline" className="w-full bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-xs sm:text-sm px-2 sm:px-4">
            All Status <IconChevronDown className="ml-1 sm:ml-2 size-3 sm:size-4" />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <DashboardTable columns={columns} data={monitoredPlayers} />
          </div>
        </div>
      </div>


      {/* My Images Section */}
      <DashboardSection
        title="My Images"
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
              Upload match photos and training highlights to showcase your profile.
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


      {/* My Videos Section */}
      <DashboardSection
        title="My Videos"
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

export default AgentDashboard;
