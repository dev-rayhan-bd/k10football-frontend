"use client";

import React, { useState, useRef, useId } from "react";
import Image from "next/image";
import Link from "next/link";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconPlus,
  IconEye,
  IconPencil,
  IconTrash,
  IconDotsVertical,
  IconChevronDown,
  IconUpload,
  IconX,
  IconLoader2,
  IconAlertCircle,
  IconCalendar,
  IconUser,
  IconBuildingSkyscraper,
  IconTrophy,
  IconFileText,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  useGetSuccessStoriesMetaQuery,
  useGetSuccessStoriesQuery,
  useAddSuccessStoryMutation,
  useUpdateSuccessStoryMutation,
  useDeleteSuccessStoryMutation,
} from "@/redux/features/academy/academyApi";
import { ISuccessStoryItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";
import { ErrorToast } from "@/helpers/ValidationHelper";

const DEFAULT_CATEGORIES = [
  "Tournament Achievement",
  "Seasonal Highlight",
  "Coach Promotion",
  "Player Signing",
  "National Team Callup",
  "International Debut",
  "General Achievement",
];

const DEFAULT_POSITIONS = [
  "Goalkeeper",
  "Right Back",
  "Left Back",
  "Centre Back",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Winger",
  "Forward",
  "Striker",
  "Coach",
];

interface FormValues {
  storyTitle: string;
  playerName: string;
  position: string;
  currentAcademy: string;
  date: string;
  category: string;
  storyContent: string;
}

interface FormErrors {
  storyTitle?: string;
  playerName?: string;
  position?: string;
  currentAcademy?: string;
  date?: string;
  category?: string;
  storyContent?: string;
  photo?: string;
}

const initialFormValues: FormValues = {
  storyTitle: "",
  playerName: "",
  position: "",
  currentAcademy: "",
  date: "",
  category: "",
  storyContent: "",
};

export const AcademyDashboardSuccessStories = () => {
  const fileInputId = useId();

  // Modals & Action States
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [viewingStory, setViewingStory] = useState<ISuccessStoryItem | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<ISuccessStoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormValues>(initialFormValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // RTK Query Hooks
  const { data: metaResponse, isLoading: isMetaLoading } = useGetSuccessStoriesMetaQuery();

  const {
    data: storiesResponse,
    isLoading: isStoriesLoading,
  } = useGetSuccessStoriesQuery({ limit: 6 });

  const [addSuccessStory, { isLoading: isAdding }] = useAddSuccessStoryMutation();
  const [updateSuccessStory, { isLoading: isUpdating }] = useUpdateSuccessStoryMutation();
  const [deleteSuccessStory, { isLoading: isDeleting }] = useDeleteSuccessStoryMutation();

  const isSaving = isAdding || isUpdating;

  const categories = metaResponse?.data?.categories?.length
    ? metaResponse.data.categories
    : DEFAULT_CATEGORIES;

  const positions = metaResponse?.data?.positions?.length
    ? metaResponse.data.positions
    : DEFAULT_POSITIONS;

  const storiesList: ISuccessStoryItem[] = storiesResponse?.data?.stories || [];

  // Reset form
  const resetForm = () => {
    setFormData(initialFormValues);
    setPhotoFile(null);
    if (photoPreview && !photoPreview.startsWith("http")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    setErrors({});
    setEditingStoryId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    resetForm();
    setEditingStoryId(null);
    setShowFormModal(true);
  };

  // Open Edit Modal with Pre-filled Data
  const handleOpenEdit = (story: ISuccessStoryItem) => {
    setEditingStoryId(story._id);
    setFormData({
      storyTitle: story.storyTitle || "",
      playerName: story.playerName || "",
      position: story.position || "",
      currentAcademy: story.currentAcademy || "",
      date: story.formattedDate || (story.date ? story.date.split("T")[0] : ""),
      category: story.category || "",
      storyContent: story.storyContent || "",
    });
    setPhotoFile(null);
    setPhotoPreview(story.photo || null);
    setErrors({});
    setShowFormModal(true);
  };

  // Handle Input Changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle Photo File Selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "Please upload an image file (PNG, JPG, WEBP)" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "Image size must be less than 5MB" }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    if (photoPreview && !photoPreview.startsWith("http")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.storyTitle.trim()) {
      newErrors.storyTitle = "Story title is required";
    } else if (formData.storyTitle.trim().length < 3) {
      newErrors.storyTitle = "Story title must be at least 3 characters";
    }

    if (!formData.playerName.trim()) {
      newErrors.playerName = "Player name is required";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Please select a position";
    }

    if (!formData.currentAcademy.trim()) {
      newErrors.currentAcademy = "Current academy is required";
    }

    if (!formData.date.trim()) {
      newErrors.date = "Please select a date";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please select a category";
    }

    if (!formData.storyContent.trim()) {
      newErrors.storyContent = "Story content is required";
    } else if (formData.storyContent.trim().length < 10) {
      newErrors.storyContent = "Story content must be at least 10 characters";
    }

    // Photo is strictly required for add; for edit, existing photo is accepted
    if (!editingStoryId && !photoFile) {
      newErrors.photo = "Please upload a photo for the story";
    } else if (editingStoryId && !photoFile && !photoPreview) {
      newErrors.photo = "Please upload a photo for the story";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      ErrorToast("Please fill in all required fields properly");
      return;
    }

    try {
      const payload = {
        storyTitle: formData.storyTitle.trim(),
        playerName: formData.playerName.trim(),
        position: formData.position.trim(),
        currentAcademy: formData.currentAcademy.trim(),
        date: formData.date,
        category: formData.category.trim(),
        storyContent: formData.storyContent.trim(),
      };

      const submitData = new FormData();
      submitData.append("data", JSON.stringify(payload));
      if (photoFile) {
        submitData.append("photo", photoFile);
      }

      if (editingStoryId) {
        await updateSuccessStory({
          storyId: editingStoryId,
          formData: submitData,
        }).unwrap();
      } else {
        await addSuccessStory(submitData).unwrap();
      }

      resetForm();
      setShowFormModal(false);
    } catch {
      // Handled by RTK Query onQueryStarted
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return;
    try {
      await deleteSuccessStory(storyToDelete._id).unwrap();
      setStoryToDelete(null);
    } catch {
      // Handled by RTK Query onQueryStarted
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status?: string) => {
    const normalized = (status || "").toUpperCase();
    if (normalized === "APPROVED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-xs">
          APPROVED
        </span>
      );
    }
    if (normalized === "PENDING") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-xs">
          PENDING
        </span>
      );
    }
    if (normalized === "REJECTED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 backdrop-blur-xs">
          REJECTED
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111111] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-white font-orbitron">
            Success Story
          </h2>
          <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
            Share and view academy milestones
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/academy/management/success-story"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-4 py-3 sm:py-2.5 rounded-xl transition-all"
          >
            <span>View All</span>
            <IconArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial flex shrink-0 justify-center items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-4 py-3 sm:px-6 sm:py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.2)] cursor-pointer"
          >
            <IconPlus size={16} />
            <span>Add Success Story</span>
          </button>
        </div>
      </div>

      {/* Stories Grid / Loading Skeleton / Empty State */}
      {isStoriesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`story-skeleton-${idx}`}
              className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full animate-pulse"
            >
              <div className="aspect-video w-full bg-white/10 shimmer" />
              <div className="p-6 flex flex-col gap-3 grow">
                <div className="h-3 w-28 bg-white/10 rounded shimmer" />
                <div className="h-5 w-4/5 bg-white/10 rounded shimmer" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 w-full bg-white/5 rounded shimmer" />
                  <div className="h-3 w-5/6 bg-white/5 rounded shimmer" />
                  <div className="h-3 w-2/3 bg-white/5 rounded shimmer" />
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-auto">
                  <div className="h-3 w-20 bg-white/5 rounded shimmer" />
                  <div className="h-3 w-16 bg-white/5 rounded shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : storiesList.length === 0 ? (
        <div className="py-14 px-6 rounded-2xl bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center gap-3">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
            <IconTrophy size={28} />
          </div>
          <p className="text-base font-bold text-white">No Success Stories Found</p>
          <p className="text-xs text-white/50 max-w-sm">
            Start sharing your academy&apos;s achievements, player signings, tournament trophies, and memorable milestones.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.2)]"
          >
            <IconPlus size={16} />
            <span>Add First Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storiesList.map((story) => (
            <div
              key={story._id}
              className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all flex flex-col h-full group relative"
            >
              {/* Actions Dropdown Button */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdownId(activeDropdownId === story._id ? null : story._id);
                  }}
                  className="size-8 rounded-full bg-black/70 hover:bg-black/90 border border-white/15 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-all shadow-md backdrop-blur-xs"
                  aria-label="Story actions"
                >
                  <IconDotsVertical size={16} />
                </button>
                {activeDropdownId === story._id && (
                  <>
                    <div
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(null);
                      }}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-[#161616] border border-white/15 rounded-xl shadow-2xl py-1.5 z-30 flex flex-col">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(null);
                          setViewingStory(story);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-white/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <IconEye size={14} className="text-zinc-400" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(null);
                          handleOpenEdit(story);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-white/80 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <IconPencil size={14} className="text-blue-400" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(null);
                          setStoryToDelete(story);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold uppercase text-destructive hover:text-destructive hover:bg-destructive/10 transition-all flex items-center gap-2 cursor-pointer border-t border-white/5"
                      >
                        <IconTrash size={14} className="text-destructive" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Status Badge in top left */}
              {story.status && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                  {renderStatusBadge(story.status)}
                </div>
              )}

              {/* Media Thumbnail Container */}
              <div
                onClick={() => setViewingStory(story)}
                className="aspect-video w-full bg-[#161616] relative overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group/thumb"
              >
                <Image
                  fill
                  src={story.photo || "/placeholder_img.jpg"}
                  alt={story.storyTitle}
                  className="object-cover group-hover/thumb:scale-105 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.srcset = "";
                    target.src = "/placeholder_img.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                    <IconEye size={12} /> View Story
                  </span>
                </div>
              </div>

              {/* Text Details & Card Body */}
              <div className="p-6 flex flex-col gap-3 grow justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <span className="text-primary truncate">{story.category || "Milestone"}</span>
                    {story.playerName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{story.playerName}</span>
                      </>
                    )}
                  </div>
                  <h3
                    onClick={() => setViewingStory(story)}
                    className="text-lg font-bold text-white leading-tight font-orbitron uppercase group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                  >
                    {story.storyTitle}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                    {story.storyContent}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <IconCalendar size={13} className="text-zinc-500" />
                    <span>
                      {story.formattedDate || (story.date ? story.date.split("T")[0] : "Recent")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewingStory(story)}
                    className="text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full</span>
                    <IconArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Success Story Modal */}
      <DashboardModal
        isOpen={showFormModal}
        onClose={() => {
          if (!isSaving) {
            setShowFormModal(false);
          }
        }}
        title={editingStoryId ? "Edit Success Story" : "Add Success Story"}
        subtitle={
          editingStoryId
            ? "Update your academy's achievement or success story details"
            : "Share your academy's latest achievement or success story"
        }
        showBackButton
        maxWidth="max-w-3xl"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setShowFormModal(false)}
              className="w-full sm:flex-1 py-3.5 sm:py-4 rounded-xl border border-white/20 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all min-w-0 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit}
              className="w-full sm:flex-2 py-3.5 sm:py-4 rounded-xl font-black text-black text-xs sm:text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>{editingStoryId ? "Saving Changes..." : "Submitting for Approval..."}</span>
                </>
              ) : (
                <>
                  <IconCheck size={18} className="stroke-[3]" />
                  <span>{editingStoryId ? "Save Changes" : "Submit for Approval"}</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* SECTION 1: STORY OVERVIEW */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Story Overview
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
            </div>

            {/* Story Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span>Story Title</span>
                <span className="text-primary font-black">*</span>
              </label>
              <div className="relative group">
                <IconFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                <input
                  type="text"
                  name="storyTitle"
                  value={formData.storyTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. U17 Championship Triumph"
                  className={cn(
                    "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                    errors.storyTitle
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
              </div>
              {errors.storyTitle && (
                <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{errors.storyTitle}</span>
                </p>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Category</span>
                  {isMetaLoading && (
                    <IconLoader2 size={12} className="animate-spin text-zinc-400" />
                  )}
                </span>
                <span className="text-primary font-black">*</span>
              </label>
              <div className="relative group">
                <IconTrophy className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full pl-10 pr-10 py-3.5 rounded-xl border bg-[#161a18] text-sm font-medium appearance-none focus:outline-none transition-all shadow-inner cursor-pointer",
                    formData.category ? "text-white" : "text-zinc-500",
                    errors.category
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                >
                  <option value="" className="bg-[#161a18] text-zinc-500">
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#161a18] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none group-focus-within:text-primary transition-colors"
                />
              </div>
              {errors.category && (
                <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>
          </div>

          {/* SECTION 2: PARTICIPANT & ACADEMY DETAILS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Participant &amp; Academy Details
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Player Name</span>
                  <span className="text-primary font-black">*</span>
                </label>
                <div className="relative group">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleInputChange}
                    placeholder="e.g. Marcus Silva"
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.playerName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                </div>
                {errors.playerName && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.playerName}</span>
                  </p>
                )}
              </div>

              {/* Position Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span>Position</span>
                    {isMetaLoading && (
                      <IconLoader2 size={12} className="animate-spin text-zinc-400" />
                    )}
                  </span>
                  <span className="text-primary font-black">*</span>
                </label>
                <div className="relative group">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full pl-10 pr-10 py-3.5 rounded-xl border bg-[#161a18] text-sm font-medium appearance-none focus:outline-none transition-all shadow-inner cursor-pointer",
                      formData.position ? "text-white" : "text-zinc-500",
                      errors.position
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  >
                    <option value="" className="bg-[#161a18] text-zinc-500">
                      Select Position
                    </option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos} className="bg-[#161a18] text-white">
                        {pos}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none group-focus-within:text-primary transition-colors"
                  />
                </div>
                {errors.position && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.position}</span>
                  </p>
                )}
              </div>

              {/* Current Academy */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Current Academy</span>
                  <span className="text-primary font-black">*</span>
                </label>
                <div className="relative group">
                  <IconBuildingSkyscraper className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="currentAcademy"
                    value={formData.currentAcademy}
                    onChange={handleInputChange}
                    placeholder="e.g. Santos FC Academy"
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.currentAcademy
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                </div>
                {errors.currentAcademy && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.currentAcademy}</span>
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Date</span>
                  <span className="text-primary font-black">*</span>
                </label>
                <div className="relative group">
                  <IconCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-sm font-medium focus:outline-none transition-all shadow-inner cursor-pointer [color-scheme:dark]",
                      formData.date ? "text-white" : "text-zinc-500",
                      errors.date
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    )}
                  />
                </div>
                {errors.date && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: MEDIA & STORY CONTENT */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Media &amp; Story Content
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
            </div>

            {/* Upload Photo Dropzone */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={fileInputId}
                className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between"
              >
                <span>Upload Story Photo</span>
                <span className="text-primary font-black">*</span>
              </label>

              {photoPreview ? (
                <div className="relative w-full aspect-video sm:aspect-21/9 rounded-2xl border border-white/20 overflow-hidden bg-black/60 shadow-inner group">
                  <Image
                    src={photoPreview}
                    alt="Story preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                          {photoFile?.name || "Current Story Photo"}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {photoFile
                            ? `${(photoFile.size / 1024 / 1024).toFixed(2)} MB`
                            : "Existing Uploaded Image"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="p-1.5 rounded-lg bg-destructive/80 hover:bg-destructive text-white transition-all cursor-pointer"
                          title="Remove photo"
                        >
                          <IconX size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full aspect-video sm:aspect-21/9 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group p-6 shadow-inner",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : errors.photo
                      ? "border-red-500/80 bg-red-500/5 hover:border-red-500"
                      : "border-white/20 bg-[#161a18]/70 hover:bg-[#161a18] hover:border-primary/50"
                  )}
                >
                  <div className="size-12 sm:size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-primary group-hover:border-primary/40 group-hover:scale-105 transition-all">
                    <IconUpload size={24} />
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors">
                      Click to upload or drag &amp; drop photo
                    </p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">
                      PNG, JPG, JPEG or WEBP (Max 5MB)
                    </p>
                  </div>
                </div>
              )}

              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {errors.photo && (
                <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{errors.photo}</span>
                </p>
              )}
            </div>

            {/* Story Content */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Story Content</span>
                  <span className="text-primary font-black ml-1">*</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formData.storyContent.length} chars
                </span>
              </div>
              <textarea
                name="storyContent"
                value={formData.storyContent}
                onChange={handleInputChange}
                placeholder="Tell the full story of this achievement, match details, performance highlights, and what made it special..."
                className={cn(
                  "w-full h-36 sm:h-44 rounded-xl border bg-[#161a18] p-4 text-xs sm:text-sm text-white placeholder:text-zinc-500 font-medium focus:outline-none transition-all resize-none custom-scrollbar leading-relaxed shadow-inner",
                  errors.storyContent
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
                )}
              />
              {errors.storyContent && (
                <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{errors.storyContent}</span>
                </p>
              )}
            </div>
          </div>
        </form>
      </DashboardModal>

      {/* View Story Modal */}
      {viewingStory && (
        <DashboardModal
          isOpen={!!viewingStory}
          onClose={() => setViewingStory(null)}
          title="Story Details"
          subtitle={viewingStory.category}
          maxWidth="max-w-3xl"
          footer={
            <div className="flex justify-end w-full">
              <button
                type="button"
                onClick={() => setViewingStory(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="flex flex-col gap-6">
            {/* Story Image Banner */}
            <div className="relative w-full aspect-video sm:aspect-21/9 rounded-3xl overflow-hidden border border-white/15 bg-black/50">
              <Image
                src={viewingStory.photo || "/placeholder_img.jpg"}
                alt={viewingStory.storyTitle}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-4 right-4">
                {renderStatusBadge(viewingStory.status)}
              </div>
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-orbitron uppercase">
                {viewingStory.storyTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/10 text-white font-medium">
                  {viewingStory.category}
                </span>
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary font-bold">
                  {viewingStory.position}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {viewingStory.formattedDate || viewingStory.date?.split("T")[0]}
                </span>
              </div>
            </div>

            {/* Player & Academy Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/3 border border-white/10">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Player / Protagonist
                </p>
                <p className="text-sm font-bold text-white">{viewingStory.playerName}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Academy / Organization
                </p>
                <p className="text-sm font-bold text-white">{viewingStory.currentAcademy}</p>
              </div>
            </div>

            {/* Story Content */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <IconFileText size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">Achievement Story</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#0F0F0F] border border-white/10 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {viewingStory.storyContent}
              </div>
            </div>
          </div>
        </DashboardModal>
      )}

      {/* Delete Confirmation Modal */}
      {storyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => !isDeleting && setStoryToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-destructive/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <IconTrash size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-white">Delete Success Story</h3>
                <p className="text-xs text-zinc-400">
                  Are you sure you want to delete{" "}
                  <span className="text-white font-semibold">
                    &quot;{storyToDelete.storyTitle}&quot;
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStoryToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Story</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademyDashboardSuccessStories;
