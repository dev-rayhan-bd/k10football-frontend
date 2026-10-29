"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  IconPlus,
  IconRefresh,
  IconPhoto,
  IconTrophy,
  IconCalendar,
  IconCategory,
  IconAlertTriangle,
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  DashboardPageHeader,
  DashboardSection,
} from "@/components/dashboard/DashboardElements";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  useGetClubSuccessStoriesQuery,
  useAddClubSuccessStoryMutation,
  useUpdateClubSuccessStoryMutation,
  useDeleteClubSuccessStoryMutation,
} from "@/redux/features/club/clubApi";
import { IClubSuccessStoryItem } from "@/types/club.type";
import { toast } from "sonner";

const categorySuggestions = [
  "Player Promotion",
  "Tournament Achievement",
  "Seasonal Highlight",
  "Academy Partnership",
  "Transfer Success",
  "Scouting Milestone",
];

const SuccessStory = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query: GET {{baseUrl}}/clubs/success-stories
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClubSuccessStoriesQuery({ page, limit });

  const [addStory, { isLoading: isAdding }] = useAddClubSuccessStoryMutation();
  const [updateStory, { isLoading: isUpdating }] = useUpdateClubSuccessStoryMutation();
  const [deleteStory, { isLoading: isDeleting }] = useDeleteClubSuccessStoryMutation();

  const stories = response?.data?.data || [];
  const meta = response?.data?.meta;

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<IClubSuccessStoryItem | null>(null);
  const [viewingStory, setViewingStory] = useState<IClubSuccessStoryItem | null>(null);
  const [deletingStory, setDeletingStory] = useState<IClubSuccessStoryItem | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Player Promotion");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  const resetForm = () => {
    setTitle("");
    setCategory("Player Promotion");
    setDate(new Date().toISOString().split("T")[0]);
    setCoverImageFile(null);
    setCoverImagePreview("");
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (story: IClubSuccessStoryItem) => {
    setEditingStory(story);
    setTitle(story.storyTitle);
    setCategory(story.category);
    setDate(
      story.formattedDate || (story.date ? story.date.split("T")[0] : new Date().toISOString().split("T")[0])
    );
    setCoverImageFile(null);
    setCoverImagePreview(story.coverImage || "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit Add
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a story title");
      return;
    }
    if (!coverImageFile) {
      toast.error("Please select a cover image");
      return;
    }

    const formData = new FormData();
    const jsonData = JSON.stringify({
      storyTitle: title.trim(),
      category: category.trim() || "Player Promotion",
      date,
    });
    formData.append("data", jsonData);
    formData.append("coverImage", coverImageFile);

    try {
      await addStory(formData).unwrap();
      setIsAddOpen(false);
      resetForm();
    } catch {
      // Toast handled by onQueryStarted
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!title.trim()) {
      toast.error("Please enter a story title");
      return;
    }

    const formData = new FormData();
    const jsonData = JSON.stringify({
      storyTitle: title.trim(),
      category: category.trim() || editingStory.category,
      date: date || (editingStory.date ? editingStory.date.split("T")[0] : ""),
    });
    formData.append("data", jsonData);
    if (coverImageFile) {
      formData.append("coverImage", coverImageFile);
    }

    try {
      await updateStory({ storyId: editingStory._id, formData }).unwrap();
      setEditingStory(null);
      resetForm();
    } catch {
      // Toast handled by onQueryStarted
    }
  };

  // Submit Delete
  const handleConfirmDelete = async () => {
    if (!deletingStory) return;
    try {
      await deleteStory(deletingStory._id).unwrap();
      setDeletingStory(null);
    } catch {
      // Toast handled by onQueryStarted
    }
  };

  const columns: Column<IClubSuccessStoryItem>[] = [
    {
      header: "Story Title",
      key: "storyTitle",
      render: (item) => {
        const coverSrc = item.coverImage || "/placeholder_img.jpg";
        return (
          <div className="flex items-center gap-2 sm:gap-3 py-2">
            <div className="relative size-10 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <Image
                src={coverSrc}
                className="size-10 rounded-full object-cover"
                alt={item.storyTitle}
                width={40}
                height={40}
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white max-w-48 sm:max-w-xs leading-snug line-clamp-2 whitespace-normal">
              {item.storyTitle}
            </span>
          </div>
        );
      },
    },
    {
      header: "Category",
      key: "category",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (item) => <span>{item.category || "—"}</span>,
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      cellClassName: "text-sm text-gray-400",
      render: (item) => {
        const dateStr = item.formattedDate || (item.date ? item.date.split("T")[0] : "—");
        return <span>{dateStr}</span>;
      },
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (item) => {
        const statusUpper = (item.status || "PENDING").toUpperCase();
        const badgeStyle =
          statusUpper === "APPROVED"
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            : statusUpper === "PENDING"
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-destructive/10 text-destructive border-destructive/20";
        return (
          <span
            className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${badgeStyle}`}
          >
            {item.statusLabel || statusUpper}
          </span>
        );
      },
    },
    {
      header: "Action",
      key: "actions",
      align: "right",
      render: (item) => (
        <TableActionButtons
          onView={() => setViewingStory(item)}
          onEdit={() => handleOpenEdit(item)}
          onDelete={() => setDeletingStory(item)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 min-w-0">
      <DashboardPageHeader
        title="Success Story"
        subtitle="Share your academy's latest achievement or success story"
        action={{
          label: "Add Success Story",
          icon: <IconPlus size={18} />,
          onClick: handleOpenAdd,
        }}
      />

      {/* Error State */}
      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center justify-between gap-3 text-destructive">
          <p className="text-xs sm:text-sm font-semibold">
            Failed to load success stories. Please check your connection.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-destructive/30 text-white hover:bg-destructive/20 shrink-0 gap-1.5 cursor-pointer text-xs"
          >
            <IconRefresh size={14} /> Retry
          </Button>
        </div>
      )}

      {/* Main Section */}
      <DashboardSection>
        {isLoading ? (
          <TableSkeleton rowCount={4} columnCount={5} />
        ) : stories.length === 0 ? (
          <div className="py-16 px-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-center bg-white/[0.01]">
            <div className="size-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
              <IconTrophy size={28} />
            </div>
            <div>
              <p className="text-base font-bold text-white uppercase tracking-wider">
                No Success Stories Yet
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                Publish your club&apos;s achievements, player promotions, or tournament victories to inspire scouts and players.
              </p>
            </div>
            <Button
              onClick={handleOpenAdd}
              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold cursor-pointer text-xs gap-1.5"
            >
              <IconPlus size={16} /> Add Success Story
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <DashboardTable
              columns={columns}
              data={stories}
              className="border-white/10"
            />

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
      </DashboardSection>

      {/* ─── ADD SUCCESS STORY DIALOG ────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl w-[95vw] sm:max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Add Success Story
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd} className="flex flex-col gap-5 mt-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Story Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Striker Joins U17 Squad from Local Rivals"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Category
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
                placeholder="e.g. Player Promotion, Tournament Achievement"
                className="bg-white/5 border-white/10 text-white"
                required
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white scheme-dark"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Cover Image <span className="text-destructive">*</span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-white/5 border-white/10 text-white file:text-white cursor-pointer"
                required
              />
              {coverImagePreview && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mt-2 bg-black/40">
                  <Image
                    src={coverImagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => setIsAddOpen(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 cursor-pointer"
              >
                {isAdding ? "Submitting..." : "Submit Story"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── EDIT SUCCESS STORY DIALOG ───────────────────────────────────── */}
      <Dialog open={Boolean(editingStory)} onOpenChange={(open) => !open && setEditingStory(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl w-[95vw] sm:max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Edit Success Story
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit} className="flex flex-col gap-5 mt-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Story Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Category
              </Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
                placeholder="e.g. Tournament Achievement"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/5 border-white/10 text-white scheme-dark"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Cover Image (Leave empty to keep current)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="bg-white/5 border-white/10 text-white file:text-white cursor-pointer"
              />
              {coverImagePreview && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mt-2 bg-black/40">
                  <Image
                    src={coverImagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10 cursor-pointer"
                onClick={() => setEditingStory(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold border-0 cursor-pointer"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── VIEW SUCCESS STORY DIALOG ───────────────────────────────────── */}
      <Dialog open={Boolean(viewingStory)} onOpenChange={(open) => !open && setViewingStory(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl w-[95vw] sm:max-w-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          {viewingStory && (
            <div className="flex flex-col gap-5">
              {viewingStory.coverImage ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                  <Image
                    src={viewingStory.coverImage}
                    alt={viewingStory.storyTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/30 bg-white/[0.02]">
                  <IconPhoto size={40} />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase border-primary/40 text-primary flex items-center gap-1.5">
                  <IconCategory size={14} />
                  {viewingStory.category}
                </Badge>
                <Badge variant="secondary" className="text-xs uppercase flex items-center gap-1.5">
                  <IconCalendar size={14} />
                  {viewingStory.formattedDate || (viewingStory.date ? viewingStory.date.split("T")[0] : "—")}
                </Badge>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    (viewingStory.status || "").toUpperCase() === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : (viewingStory.status || "").toUpperCase() === "PENDING"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {viewingStory.statusLabel || viewingStory.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight font-orbitron">
                  {viewingStory.storyTitle}
                </h3>
              </div>

              {viewingStory.adminReviewNotes && (
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Admin Review Feedback
                  </span>
                  <p className="text-sm text-gray-300">
                    {viewingStory.adminReviewNotes}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white cursor-pointer"
                  onClick={() => setViewingStory(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DELETE CONFIRMATION DIALOG ─────────────────────────────────── */}
      <Dialog open={Boolean(deletingStory)} onOpenChange={(open) => !open && setDeletingStory(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl w-[95vw] sm:max-w-md p-6 sm:p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
              <IconAlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                Delete Success Story
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Are you sure you want to delete &ldquo;{deletingStory?.storyTitle}&rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white cursor-pointer"
                onClick={() => setDeletingStory(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-bold cursor-pointer"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Story"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TableSkeleton = ({
  rowCount = 4,
  columnCount = 5,
}: {
  rowCount?: number;
  columnCount?: number;
}) => (
  <div className="border border-white/10 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-10 bg-white/5 border-b border-white/10" />
    <div className="divide-y divide-white/5">
      {Array.from({ length: rowCount }).map((_, r) => (
        <div key={r} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="size-10 rounded-full bg-white/10 shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <div className="h-3.5 w-3/4 rounded bg-white/10" />
              <div className="h-2.5 w-1/2 rounded bg-white/5" />
            </div>
          </div>
          {Array.from({ length: columnCount - 2 }).map((_, c) => (
            <div key={c} className="h-3 w-20 rounded bg-white/5 hidden sm:block" />
          ))}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
            <div className="size-8 rounded-lg bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default SuccessStory;
