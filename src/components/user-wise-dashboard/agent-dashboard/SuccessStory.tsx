"use client";

import Image from "next/image";
import React, { useState, useRef } from "react";
import {
  IconPlus,
  IconCloudUpload,
  IconRefresh,
  IconLoader2,
  IconX,
  IconTrophy,
  IconCalendar,
  IconCategory,
  IconUser,
  IconBuildingStadium,
  IconSchool,
  IconAlertTriangle,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAgentSuccessStoriesQuery,
  useAddAgentSuccessStoryMutation,
  useUpdateAgentSuccessStoryMutation,
  useDeleteAgentSuccessStoryMutation,
} from "@/redux/features/agent/agentApi";
import { IAgentSuccessStoryItem } from "@/types/agent.type";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categoryOptions = [
  "Transfer Achievement",
  "Signing Achievement",
  "Agent Milestone",
  "Trial Secured",
  "Contract Extension",
  "Player Promotion",
];

const positionOptions = [
  "Forward",
  "Striker",
  "Winger",
  "Midfielder",
  "Attacking Midfielder",
  "Defensive Midfielder",
  "Defender",
  "Centre Back",
  "Full Back",
  "Goalkeeper",
];

const achievementSuggestions = [
  "Benfica Academy - Trial Secured",
  "Chelsea Youth - Contract Signed",
  "Manchester Academy - Trial Secured",
  "Barcelona B - Contract Signed",
  "Ajax Youth - Trial Contract",
];

const getStatusBadge = (status?: string) => {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") {
    return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
  }
  if (s === "REJECTED") {
    return "border-destructive/50 bg-destructive/10 text-destructive";
  }
  return "border-amber-500/50 bg-amber-500/10 text-amber-400";
};

const SuccessStory = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: GET {{baseUrl}}/agents/success-stories
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAgentSuccessStoriesQuery({ page, limit });

  const [addStory, { isLoading: isAdding }] = useAddAgentSuccessStoryMutation();
  const [updateStory, { isLoading: isUpdating }] = useUpdateAgentSuccessStoryMutation();
  const [deleteStory, { isLoading: isDeleting }] = useDeleteAgentSuccessStoryMutation();

  const stories = response?.data?.data || [];
  const meta = response?.data?.meta;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<IAgentSuccessStoryItem | null>(null);
  const [viewingStory, setViewingStory] = useState<IAgentSuccessStoryItem | null>(null);
  const [deletingStory, setDeletingStory] = useState<IAgentSuccessStoryItem | null>(null);

  // Form Fields State
  const [storyTitle, setStoryTitle] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("Forward");
  const [previousAcademy, setPreviousAcademy] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [signedClub, setSignedClub] = useState("");
  const [category, setCategory] = useState("Transfer Achievement");
  const [storyContent, setStoryContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStoryTitle("");
    setPlayerName("");
    setPosition("Forward");
    setPreviousAcademy("");
    setDate(new Date().toISOString().split("T")[0]);
    setSignedClub("");
    setCategory("Transfer Achievement");
    setStoryContent("");
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (story: IAgentSuccessStoryItem) => {
    setEditingStory(story);
    setStoryTitle(story.storyTitle || "");
    setPlayerName(story.playerName || "");
    setPosition(story.position || "Forward");
    setPreviousAcademy(story.previousAcademy || "");
    setDate(
      story.formattedDate ||
        (story.date ? story.date.split("T")[0] : new Date().toISOString().split("T")[0])
    );
    setSignedClub(story.signedClub || "");
    setCategory(story.category || "Transfer Achievement");
    setStoryContent(story.storyContent || "");
    setImageFile(null);
    setImagePreview(story.image || "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim()) {
      toast.error("Please enter a story title");
      return;
    }
    if (!playerName.trim()) {
      toast.error("Please enter the player's name");
      return;
    }
    if (!signedClub.trim()) {
      toast.error("Please enter signed club or achievement");
      return;
    }
    if (!imageFile) {
      toast.error("Please select a cover photo for this story");
      return;
    }

    const formData = new FormData();
    const dataPayload = {
      storyTitle: storyTitle.trim(),
      playerName: playerName.trim(),
      position: position.trim() || "Forward",
      previousAcademy: previousAcademy.trim() || "Local Youth Academy",
      date,
      signedClub: signedClub.trim(),
      category: category.trim() || "Transfer Achievement",
      storyContent: storyContent.trim() || "",
    };

    formData.append("data", JSON.stringify(dataPayload));
    formData.append("image", imageFile);

    try {
      await addStory(formData).unwrap();
      setIsAddOpen(false);
      resetForm();
    } catch {
      // Error handled by mutation toast
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!storyTitle.trim()) {
      toast.error("Please enter a story title");
      return;
    }
    if (!playerName.trim()) {
      toast.error("Please enter the player's name");
      return;
    }
    if (!signedClub.trim()) {
      toast.error("Please enter signed club or achievement");
      return;
    }

    const formData = new FormData();
    const dataPayload = {
      storyTitle: storyTitle.trim(),
      playerName: playerName.trim(),
      position: position.trim() || "Forward",
      previousAcademy: previousAcademy.trim() || "Local Youth Academy",
      date,
      signedClub: signedClub.trim(),
      category: category.trim() || "Transfer Achievement",
      storyContent: storyContent.trim() || "",
    };

    formData.append("data", JSON.stringify(dataPayload));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await updateStory({ storyId: editingStory._id, formData }).unwrap();
      setEditingStory(null);
      resetForm();
    } catch {
      // Error handled by mutation toast
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingStory) return;
    try {
      await deleteStory(deletingStory._id).unwrap();
      setDeletingStory(null);
    } catch {
      // Error handled by mutation toast
    }
  };

  // Table Columns
  const columns: Column<IAgentSuccessStoryItem>[] = [
    {
      header: "Story Title",
      key: "storyTitle",
      align: "left",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
            {row.image ? (
              <Image
                src={row.image}
                alt={row.storyTitle}
                fill
                sizes="40px"
                unoptimized
                className="object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/placeholder_img.jpg";
                }}
              />
            ) : (
              <div className="size-full flex items-center justify-center text-white/40">
                <IconTrophy size={18} />
              </div>
            )}
          </div>
          <div className="min-w-0 max-w-xs md:max-w-md">
            <p className="text-white font-medium text-sm truncate" title={row.storyTitle}>
              {row.storyTitle}
            </p>
            {row.playerName && (
              <p className="text-xs text-gray-500 truncate">Player: {row.playerName}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      key: "category",
      align: "center",
      cellClassName: "text-gray-300 font-medium text-sm",
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      render: (row) => {
        const displayDate =
          row.formattedDate ||
          (row.date ? row.date.split("T")[0] : "-");
        return <span className="text-gray-400 text-sm font-medium">{displayDate}</span>;
      },
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => {
        const label = row.statusLabel || row.status?.toLowerCase() || "Pending";
        return (
          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold border capitalize inline-block",
              getStatusBadge(row.status)
            )}
          >
            {label}
          </span>
        );
      },
    },
    {
      header: "Action",
      key: "actions",
      align: "center",
      render: (row) => (
        <TableActionButtons
          onView={() => setViewingStory(row)}
          onEdit={() => handleOpenEdit(row)}
          onDelete={() => setDeletingStory(row)}
        />
      ),
    },
  ];

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
            Success Story
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Share your academy&apos;s latest achievement or success Story
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-xl px-4 py-2 shrink-0 h-11 w-full sm:w-auto font-bold cursor-pointer transition-all hover:scale-102 flex items-center justify-center gap-2"
        >
          <IconPlus className="size-5 text-gray-400" />
          <span>Add Success Story</span>
        </Button>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8">
        {isLoading ? (
          <TableSkeleton rowCount={5} columnCount={5} />
        ) : isError ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
            <IconAlertTriangle className="size-8 text-destructive" />
            <p className="text-sm font-bold text-destructive">
              Failed to load success stories
            </p>
            <Button
              type="button"
              onClick={() => refetch()}
              variant="outline"
              className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
            >
              <IconRefresh size={14} className="mr-2" />
              Retry
            </Button>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/1">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <IconTrophy size={28} />
            </div>
            <p className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
              No Success Stories Found
            </p>
            <p className="text-xs text-white/40 max-w-sm">
              You haven&apos;t shared any player trials, signings, or career milestones yet.
            </p>
            <Button
              onClick={handleOpenAdd}
              className="mt-2 bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 cursor-pointer"
            >
              <IconPlus size={14} className="mr-1.5" />
              Add First Success Story
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto">
              <div className="min-w-[750px]">
                <DashboardTable columns={columns} data={stories} />
              </div>
            </div>

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-gray-400">
                <span>
                  Showing page {meta.page} of {meta.totalPages} ({meta.total} stories)
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

      {/* ─── ADD SUCCESS STORY MODAL ────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-white/15 text-white sm:max-w-175 md:max-w-212.5 w-[95vw] rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] shadow-2xl shadow-black/50">
          <DialogHeader className="p-5 md:p-8 border-b border-white/10 shrink-0 bg-linear-to-b from-white/2 to-transparent">
            <DialogTitle className="text-xl md:text-2xl font-orbitron tracking-wide font-normal">
              Add Success Story
            </DialogTitle>
            <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">
              Share your academy&apos;s latest achievement or success Story
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 md:p-8 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar min-w-0">
              {/* Story Title */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Story Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g., Agent Luis Secures Trial for Midfielder at Benfica Academy"
                  className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  required
                />
              </div>

              {/* Player Name & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Player Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g., Marcus Silva"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    list="position-suggestions"
                    placeholder="e.g., Forward"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                  <datalist id="position-suggestions">
                    {positionOptions.map((pos) => (
                      <option key={pos} value={pos} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Previous Academy & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Previous Academy
                  </Label>
                  <Input
                    value={previousAcademy}
                    onChange={(e) => setPreviousAcademy(e.target.value)}
                    placeholder="e.g., Local Youth Academy"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl scheme-dark focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                </div>
              </div>

              {/* Signed Club / Achievement */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Signed Club / Achievement <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={signedClub}
                  onChange={(e) => setSignedClub(e.target.value)}
                  list="achievement-suggestions"
                  placeholder="e.g., Benfica Academy - Trial Secured"
                  className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  required
                />
                <datalist id="achievement-suggestions">
                  {achievementSuggestions.map((ach) => (
                    <option key={ach} value={ach} />
                  ))}
                </datalist>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-white/15 text-white">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Photo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Upload Photo <span className="text-destructive">*</span>
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-3">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="bg-black/60 border-white/20 text-white hover:bg-black/80 rounded-xl text-xs"
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="destructive"
                        className="rounded-xl text-xs"
                      >
                        <IconX size={14} className="mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-40 border border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-white/30 hover:text-white transition-colors cursor-pointer bg-white/1 p-6"
                  >
                    <IconCloudUpload className="size-8 mb-2 opacity-50" stroke={1.5} />
                    <p className="text-xs font-medium opacity-50">Upload Image</p>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">Story Content</Label>
                <Textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="min-h-30 bg-[#111111] border-white/15 text-white rounded-xl resize-none p-4 text-sm focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  placeholder="Tell the full story of this achievement..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 md:p-8 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 bg-[#0a0a0a] shrink-0 items-center justify-center">
              <Button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-full sm:flex-1 bg-transparent border border-white/15 text-white hover:bg-white/5 h-12 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="w-full sm:flex-1 bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-50 text-white border-none h-12 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT SUCCESS STORY MODAL ───────────────────────────────────────── */}
      <Dialog open={!!editingStory} onOpenChange={(open) => !open && setEditingStory(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-white/15 text-white sm:max-w-175 md:max-w-212.5 w-[95vw] rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] shadow-2xl shadow-black/50">
          <DialogHeader className="p-5 md:p-8 border-b border-white/10 shrink-0 bg-linear-to-b from-white/2 to-transparent">
            <DialogTitle className="text-xl md:text-2xl font-orbitron tracking-wide font-normal">
              Edit Success Story
            </DialogTitle>
            <p className="text-gray-400 text-xs md:text-sm font-medium mt-1">
              Update your story details and achievements
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 md:p-8 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar min-w-0">
              {/* Story Title */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Story Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="e.g., Agent Luis Secures Trial for Midfielder at Benfica Academy"
                  className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  required
                />
              </div>

              {/* Player Name & Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Player Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g., Marcus Silva"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    list="edit-position-suggestions"
                    placeholder="e.g., Forward"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                  <datalist id="edit-position-suggestions">
                    {positionOptions.map((pos) => (
                      <option key={pos} value={pos} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Previous Academy & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Previous Academy
                  </Label>
                  <Input
                    value={previousAcademy}
                    onChange={(e) => setPreviousAcademy(e.target.value)}
                    placeholder="e.g., Local Youth Academy"
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-gray-300 text-xs ml-1 font-medium">
                    Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#111111] border-white/15 text-white h-11 rounded-xl scheme-dark focus:border-white/40 focus:ring-1 focus:ring-white/40"
                    required
                  />
                </div>
              </div>

              {/* Signed Club / Achievement */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Signed Club / Achievement <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={signedClub}
                  onChange={(e) => setSignedClub(e.target.value)}
                  list="edit-achievement-suggestions"
                  placeholder="e.g., Benfica Academy - Trial Secured"
                  className="bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  required
                />
                <datalist id="edit-achievement-suggestions">
                  {achievementSuggestions.map((ach) => (
                    <option key={ach} value={ach} />
                  ))}
                </datalist>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full bg-[#111111] border-white/15 text-white h-11 rounded-xl focus:border-white/40 focus:ring-1 focus:ring-white/40">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-white/15 text-white">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Photo */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">
                  Cover Photo (Optional to change)
                </Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-3">
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="bg-black/60 border-white/20 text-white hover:bg-black/80 rounded-xl text-xs"
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        onClick={handleRemoveImage}
                        variant="destructive"
                        className="rounded-xl text-xs"
                      >
                        <IconX size={14} className="mr-1" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-40 border border-dashed border-white/15 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-white/30 hover:text-white transition-colors cursor-pointer bg-white/1 p-6"
                  >
                    <IconCloudUpload className="size-8 mb-2 opacity-50" stroke={1.5} />
                    <p className="text-xs font-medium opacity-50">Upload New Photo</p>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-gray-300 text-xs ml-1 font-medium">Story Content</Label>
                <Textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="min-h-30 bg-[#111111] border-white/15 text-white rounded-xl resize-none p-4 text-sm focus:border-white/40 focus:ring-1 focus:ring-white/40"
                  placeholder="Tell the full story of this achievement..."
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 md:p-8 border-t border-white/10 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 bg-[#0a0a0a] shrink-0 items-center justify-center">
              <Button
                type="button"
                onClick={() => setEditingStory(null)}
                className="w-full sm:flex-1 bg-transparent border border-white/15 text-white hover:bg-white/5 h-12 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:flex-1 bg-[#E31B23] hover:bg-[#C2181F] disabled:opacity-50 text-white border-none h-12 rounded-xl font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── VIEW STORY DETAILS MODAL ───────────────────────────────────────── */}
      <Dialog open={!!viewingStory} onOpenChange={(open) => !open && setViewingStory(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-white/15 text-white sm:max-w-175 md:max-w-200 w-[95vw] rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/50">
          {viewingStory && (
            <>
              {/* Cover Banner */}
              <div className="relative aspect-video sm:aspect-21/9 w-full bg-white/5 border-b border-white/10 overflow-hidden">
                {viewingStory.image ? (
                  <Image
                    src={viewingStory.image}
                    alt={viewingStory.storyTitle}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-white/30">
                    <IconTrophy size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold border capitalize backdrop-blur-md",
                      getStatusBadge(viewingStory.status)
                    )}
                  >
                    {viewingStory.statusLabel || viewingStory.status?.toLowerCase() || "Pending"}
                  </span>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#E31B23] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {viewingStory.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2 drop-shadow-md">
                    {viewingStory.storyTitle}
                  </h2>
                </div>
              </div>

              {/* Story Details Body */}
              <div className="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/2 border border-white/10">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider flex items-center gap-1">
                      <IconUser size={12} /> Player
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {viewingStory.playerName || "-"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider flex items-center gap-1">
                      <IconCategory size={12} /> Position
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {viewingStory.position || "-"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider flex items-center gap-1">
                      <IconBuildingStadium size={12} /> Signed Club
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {viewingStory.signedClub || "-"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider flex items-center gap-1">
                      <IconCalendar size={12} /> Date
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {viewingStory.formattedDate ||
                        (viewingStory.date ? viewingStory.date.split("T")[0] : "-")}
                    </span>
                  </div>
                </div>

                {viewingStory.previousAcademy && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <IconSchool size={16} className="text-[#E31B23]" />
                    <span>Previous Academy: <strong className="text-white">{viewingStory.previousAcademy}</strong></span>
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xs uppercase font-black tracking-widest text-gray-400">
                    Story Description
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap bg-white/2 p-4 rounded-xl border border-white/5">
                    {viewingStory.storyContent || "No detailed description provided."}
                  </p>
                </div>

                {/* Admin Review Notes (if present) */}
                {viewingStory.adminReviewNotes && (
                  <div className="flex flex-col gap-2 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <h4 className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1.5">
                      <IconAlertTriangle size={14} /> Admin Review Notes
                    </h4>
                    <p className="text-xs text-gray-300">
                      {viewingStory.adminReviewNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-white/10 flex items-center justify-between bg-[#0a0a0a]">
                <Button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingStory;
                    setViewingStory(null);
                    handleOpenEdit(toEdit);
                  }}
                  variant="outline"
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs font-bold"
                >
                  Edit This Story
                </Button>
                <Button
                  type="button"
                  onClick={() => setViewingStory(null)}
                  className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold px-6"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRMATION MODAL ──────────────────────────────────────── */}
      <Dialog open={!!deletingStory} onOpenChange={(open) => !open && setDeletingStory(null)}>
        <DialogContent className="bg-[#111111] border border-white/15 text-white rounded-3xl sm:max-w-md p-6 sm:p-8">
          <DialogHeader>
            <div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <IconAlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white font-orbitron">
              Delete Success Story?
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-gray-400 leading-relaxed">
              Are you sure you want to permanently delete this success story:
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white truncate">
              {deletingStory?.storyTitle}
            </div>
            <p className="text-xs text-destructive">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingStory(null)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              variant="destructive"
              className="rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Story"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuccessStory;
