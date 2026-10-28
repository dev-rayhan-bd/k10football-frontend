"use client";
import Image from "next/image";
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

const stats = [
  { label: "Players", value: "156", icon: IconUsers },
  { label: "Coaches", value: "12", icon: IconTrophy },
  { label: "Liked CVs", value: "42", icon: IconHeart },
  { label: "Profile share", value: "18", icon: IconShare },
];

const timelineData = [
  { name: "Jan-Feb", players: 45, coaches: 12 },
  { name: "Mar-Apr", players: 62, coaches: 15 },
  { name: "May-Jun", players: 75, coaches: 18 },
  { name: "Jul-Aug", players: 70, coaches: 16 },
  { name: "Sept-Oct", players: 85, coaches: 22 },
  { name: "Nov-Dec", players: 98, coaches: 25 },
];

const distributionData = [
  { name: "Midfielder", value: 80 },
  { name: "Striker", value: 65 },
  { name: "Defender", value: 92, highlight: true },
  { name: "Goalkeeper", value: 75 },
  { name: "Winger", value: 58 },
];

const staffData = [
  { id: 1, teamName: "Santos U17", ageGroup: "Under 17", scout: "Carlos Silva", players: 22, status: "Active" },
  { id: 2, teamName: "Santos U19", ageGroup: "Under 19", scout: "Roberto Lima", players: 18, status: "Active" },
  { id: 3, teamName: "Santos U16", ageGroup: "Under 16", scout: "Alex Jonson", players: 16, status: "Pending" },
  { id: 4, teamName: "Santos U18", ageGroup: "Under 18", scout: "James Brown", players: 20, status: "Active" },
];

const coachData = [
  { id: 1, name: "Eduardo Ricci", role: "Head Coach", team: "Santos U19", experience: "12 yrs", status: "Active" },
  { id: 2, name: "Marco Fernandez", role: "Assistant Coach", team: "Santos U17", experience: "8 yrs", status: "Active" },
  { id: 3, name: "Lucas Oliveira", role: "Fitness Coach", team: "Santos U18", experience: "5 yrs", status: "Active" },
  { id: 4, name: "Rafael Costa", role: "Goalkeeping Coach", team: "Santos U16", experience: "10 yrs", status: "Pending" },
];

const favPlayerData = [
  { id: 1, name: "Marcus Silva", position: "Forward", rating: 9.2, club: "Manchester Academy", country: "Brazil", age: 19, avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "David Chen", position: "Midfielder", rating: 8.8, club: "Chelsea Youth", country: "England", age: 18, avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Alex Jonson", position: "Defender", rating: 8.5, club: "Barcelona B", country: "Spain", age: 20, avatar: "https://i.pravatar.cc/150?u=3" },
];

const favCoachData = [
  { id: 1, name: "Eduardo Ricci", role: "Head Coach", speciality: "Attacking", experience: "12 yrs", club: "Santos FC", country: "Brazil", avatar: "https://i.pravatar.cc/150?u=10" },
  { id: 2, name: "Marco Fernandez", role: "Assistant Coach", speciality: "Defending", experience: "8 yrs", club: "Real Madrid B", country: "Spain", avatar: "https://i.pravatar.cc/150?u=11" },
  { id: 3, name: "Lucas Oliveira", role: "Fitness Coach", speciality: "Physical", experience: "5 yrs", club: "PSG Academy", country: "France", avatar: "https://i.pravatar.cc/150?u=12" },
];

const ClubDashboard = () => {
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

  const staffColumns: Column<typeof staffData[0]>[] = [
    { header: "Team Name", key: "teamName", cellClassName: "text-sm text-gray-400" },
    { header: "Age Group", key: "ageGroup", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Scout", key: "scout", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Players", key: "players", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (item) => (
        <span
          className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            item.status === "Active"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: () => <TableActionButtons onView={() => {}} />,
    },
  ];

  const coachColumns: Column<typeof coachData[0]>[] = [
    { header: "Name", key: "name", cellClassName: "text-sm text-white font-semibold" },
    { header: "Role", key: "role", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Team", key: "team", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Experience", key: "experience", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (item) => (
        <span
          className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            item.status === "Active"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: () => <TableActionButtons onView={() => {}} />,
    },
  ];

  const favPlayerColumns: Column<typeof favPlayerData[0]>[] = [
    {
      header: "Name",
      key: "name",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Image
            width={500}
            height={500}
            src={p.avatar}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
            className="size-10 rounded-full object-cover"
            alt="avatar"
          />
          <div>
            <div className="text-sm font-bold text-white">{p.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest">{p.position}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Rating",
      key: "rating",
      align: "center",
      render: (p) => <span className="text-sm font-black text-destructive italic">{p.rating}</span>,
    },
    { header: "Club", key: "club", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Country", key: "country", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Age", key: "age", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: () => <TableActionButtons onView={() => {}} onHeart={() => {}} onShare={() => {}} />,
    },
  ];

  const favCoachColumns: Column<typeof favCoachData[0]>[] = [
    {
      header: "Name",
      key: "name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Image
            src={c.avatar}
            className="size-10 rounded-full object-cover"
            alt="avatar"
            width={500}
            height={500}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = "";
              target.src = "/placeholder_img.jpg";
            }}
          />
          <div>
            <div className="text-sm font-bold text-white">{c.name}</div>
            <div className="text-[10px] text-destructive font-bold uppercase tracking-widest">{c.role}</div>
          </div>
        </div>
      ),
    },
    { header: "Speciality", key: "speciality", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Club", key: "club", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Country", key: "country", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Experience", key: "experience", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: () => <TableActionButtons onView={() => {}} onHeart={() => {}} onShare={() => {}} />,
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section - Main Content */}
        <div className="lg:col-span-9 flex flex-col gap-8 min-w-0">
          {/* Hero Section */}
          <div className="rounded-3xl overflow-hidden border border-white/10">
            <DashboardHero
              backgroundImage="/barcelona-la-liga-champions.avif"
              badgeText="Active Club"
              title="FC Barcelona"
              subtitle="Premium Club"
              details={[
                { text: "Est. 1899" },
                { text: "Spain" },
              ]}
              contacts={[
                { type: "phone", label: "Contact", value: "+34 902 1899 00" },
                { type: "email", label: "Email", value: "oab@fcbarcelona.cat" },
              ]}
              logoImage="https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_(crest).svg"
            />
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
              <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Full Analytics
              </button>
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
                      <Line type="monotone" name="Coaches Monitored" dataKey="coaches" stroke="#444" strokeWidth={2} dot={{ r: 3, fill: "#444" }} />
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
                          <Cell key={`cell-${index}`} fill={entry.highlight ? "#fff" : "#333"} />
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
            <DashboardTable columns={staffColumns} data={staffData} className="border-white/10" />
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-10 mb-6">Coaches</p>
            <DashboardTable columns={coachColumns} data={coachData} className="border-white/10" />
          </DashboardSection>

          {/* Favourites */}
          <DashboardSection title="Favourites">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-6">Favourite Players</p>
            <DashboardTable columns={favPlayerColumns} data={favPlayerData} className="border-white/10" />
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-10 mb-6">Favourite Coaches</p>
            <DashboardTable columns={favCoachColumns} data={favCoachData} className="border-white/10" />
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
            <div className="flex flex-col gap-6">
              <ActivityItem
                icon={<IconHeart size={18} />}
                text="John Smith viewed CV for Marcus Johnson"
                time="2 hours ago"
              />
              <ActivityItem
                icon={<IconShare size={18} />}
                text="Profile shared: David Martinez"
                time="5 hours ago"
              />
              <ActivityItem
                icon={<IconEye size={18} />}
                text="New scout view from Manchester United"
                time="8 hours ago"
              />
              <ActivityItem
                icon={<IconUsers size={18} />}
                text="Team Santos U17 updated roster"
                time="1 day ago"
              />
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
  <div className="p-5 rounded-2xl border border-white/5 bg-white/2 flex gap-4 hover:border-destructive/30 transition-all group">
    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-destructive/10 group-hover:text-destructive transition-colors">
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold text-white leading-tight mb-1">{text}</div>
      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{time}</div>
    </div>
  </div>
);

export default ClubDashboard;
