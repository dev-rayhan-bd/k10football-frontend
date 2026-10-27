"use client";

import React, { useState, useRef, useId } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconPlus,
  IconChevronDown,
  IconEye,
  IconEdit,
  IconTrash,
  IconLock,
  IconFileText,
  IconWorld,
  IconPencil,
  IconUpload,
  IconLoader2,
  IconAlertCircle,
  IconCalendar,
  IconUser,
  IconTag,
  IconBell,
  IconRefresh,
  IconRotateClockwise,
} from "@tabler/icons-react";
import {
  useGetAcademyNewsMetaQuery,
  useGetAcademyNewsQuery,
  useCreateAcademyNewsMutation,
  useUpdateAcademyNewsMutation,
  useToggleNewsVisibilityMutation,
  useMoveNewsToBinMutation,
  useRestoreNewsFromBinMutation,
  useDeleteAcademyNewsMutation,
} from "@/redux/features/academy/academyApi";
import { IAcademyNewsItem } from "@/types/academy.type";
import { getUserInfo } from "@/helpers/SessionHelper";
import { ErrorToast } from "@/helpers/ValidationHelper";
import { cn } from "@/lib/utils";

// Fallback defaults if meta is loading or empty
const DEFAULT_CATEGORIES = [
  "Match Report",
  "Championship",
  "Announcement",
  "Training",
  "Facility Update",
  "Tournament",
  "General News",
  "Club News",
];

const DEFAULT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const DEFAULT_VISIBILITIES = ["PUBLIC", "PRIVATE"];

type StatusTabKey = "ALL_NEWS" | "PUBLISHED" | "PRIVATE" | "DRAFT" | "BIN";

interface TabItem {
  key: StatusTabKey;
  name: string;
  icon: React.ElementType;
  countKey: "all" | "published" | "private" | "draft" | "bin";
}

const TABS: TabItem[] = [
  { key: "ALL_NEWS", name: "All News", icon: IconFileText, countKey: "all" },
  { key: "PUBLISHED", name: "Published", icon: IconWorld, countKey: "published" },
  { key: "PRIVATE", name: "Private", icon: IconLock, countKey: "private" },
  { key: "DRAFT", name: "Draft", icon: IconPencil, countKey: "draft" },
  { key: "BIN", name: "BIN", icon: IconTrash, countKey: "bin" },
];

interface FormValues {
  articleTitle: string;
  category: string;
  author: string;
  publishDate: string;
  fullArticle: string;
  priority: string;
  visibility: string;
  tags: string;
  sendPushNotification: boolean;
}

interface FormErrors {
  articleTitle?: string;
  category?: string;
  author?: string;
  publishDate?: string;
  fullArticle?: string;
  priority?: string;
  visibility?: string;
  featuredImage?: string;
}

export const AcademyNewsManagement = () => {
  const createFileInputId = useId();
  const editFileInputId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const publishDateInputRef = useRef<HTMLInputElement>(null);

  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editPublishDateInputRef = useRef<HTMLInputElement>(null);

  // Helper to get local YYYY-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Active status filter tab
  const [activeTab, setActiveTab] = useState<StatusTabKey>("ALL_NEWS");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<IAcademyNewsItem | null>(null);
  const [viewingArticle, setViewingArticle] = useState<IAcademyNewsItem | null>(null);
  const [binConfirmArticle, setBinConfirmArticle] = useState<IAcademyNewsItem | null>(null);
  const [permanentDeleteArticle, setPermanentDeleteArticle] = useState<IAcademyNewsItem | null>(null);

  // Submitting state: "DRAFT" | "PUBLISHED" | null
  const [submittingStatus, setSubmittingStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);
  const [editSubmittingStatus, setEditSubmittingStatus] = useState<"DRAFT" | "PUBLISHED" | null>(null);

  // Form State (Create)
  const initialAuthor = getUserInfo()?.fullName || "Admin";

  const [formData, setFormData] = useState<FormValues>({
    articleTitle: "",
    category: "",
    author: initialAuthor,
    publishDate: getTodayDateString(),
    fullArticle: "",
    priority: "MEDIUM",
    visibility: "PUBLIC",
    tags: "",
    sendPushNotification: false,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Form State (Edit)
  const [editFormData, setEditFormData] = useState<FormValues>({
    articleTitle: "",
    category: "",
    author: initialAuthor,
    publishDate: getTodayDateString(),
    fullArticle: "",
    priority: "MEDIUM",
    visibility: "PUBLIC",
    tags: "",
    sendPushNotification: false,
  });
  const [editFormErrors, setEditFormErrors] = useState<FormErrors>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isEditDragOver, setIsEditDragOver] = useState<boolean>(false);

  // Action loading tracker by article ID for inline buttons
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // RTK Query & Mutation Hooks
  const { data: metaResponse } = useGetAcademyNewsMetaQuery();
  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isFetching: isNewsFetching,
    refetch,
  } = useGetAcademyNewsQuery({ status: activeTab });

  const [createAcademyNews] = useCreateAcademyNewsMutation();
  const [updateAcademyNews] = useUpdateAcademyNewsMutation();
  const [toggleNewsVisibility] = useToggleNewsVisibilityMutation();
  const [moveNewsToBin, { isLoading: isMovingToBin }] = useMoveNewsToBinMutation();
  const [restoreNewsFromBin] = useRestoreNewsFromBinMutation();
  const [deleteAcademyNews, { isLoading: isDeletingPermanently }] = useDeleteAcademyNewsMutation();

  // Dynamic meta options
  const categories = metaResponse?.data?.categories?.length
    ? metaResponse.data.categories
    : DEFAULT_CATEGORIES;

  const priorities = metaResponse?.data?.priorities?.length
    ? metaResponse.data.priorities
    : DEFAULT_PRIORITIES;

  const visibilities = metaResponse?.data?.visibilities?.length
    ? metaResponse.data.visibilities
    : DEFAULT_VISIBILITIES;

  const tabCounts = newsResponse?.data?.tabCounts;
  const newsArticles = newsResponse?.data?.news || [];

  // Reset Create Form
  const resetForm = () => {
    const today = getTodayDateString();
    setFormData({
      articleTitle: "",
      category: categories[0] || "",
      author: initialAuthor,
      publishDate: today,
      fullArticle: "",
      priority: priorities.includes("MEDIUM") ? "MEDIUM" : (priorities[0] || "MEDIUM"),
      visibility: visibilities.includes("PUBLIC") ? "PUBLIC" : (visibilities[0] || "PUBLIC"),
      tags: "",
      sendPushNotification: false,
    });
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (article: IAcademyNewsItem) => {
    let dateStr = getTodayDateString();
    if (article.publishDate) {
      dateStr = article.publishDate.split("T")[0];
    }

    setEditFormData({
      articleTitle: article.articleTitle || "",
      category: article.category || (categories[0] || ""),
      author: article.author || article.publishedBy || initialAuthor,
      publishDate: dateStr,
      fullArticle: article.fullArticle || article.excerpt || "",
      priority: article.priority || "MEDIUM",
      visibility: article.visibility || "PUBLIC",
      tags: article.tags?.join(", ") || "",
      sendPushNotification: Boolean(article.sendPushNotification),
    });
    setEditFormErrors({});
    setEditImageFile(null);
    setEditImagePreview(article.featuredImage || null);
    setEditingArticle(article);
  };

  // Image handling (Create)
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, featuredImage: "Only image files (PNG, JPG, WEBP) are allowed" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, featuredImage: "Image file size must be less than 5MB" }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, featuredImage: undefined }));
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Image handling (Edit)
  const handleEditFileChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setEditFormErrors((prev) => ({ ...prev, featuredImage: "Only image files (PNG, JPG, WEBP) are allowed" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditFormErrors((prev) => ({ ...prev, featuredImage: "Image file size must be less than 5MB" }));
      return;
    }

    setEditFormErrors((prev) => ({ ...prev, featuredImage: undefined }));
    setEditImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Validate form (Create)
  const validateForm = (targetStatus: "DRAFT" | "PUBLISHED"): boolean => {
    const errors: FormErrors = {};

    if (!formData.articleTitle.trim()) {
      errors.articleTitle = "Article title is required";
    } else if (formData.articleTitle.trim().length < 3) {
      errors.articleTitle = "Title must be at least 3 characters";
    }

    if (!formData.category) {
      errors.category = "Please select a category";
    }

    if (!formData.author.trim()) {
      errors.author = "Author name is required";
    }

    if (!formData.publishDate || formData.publishDate.trim() === "") {
      errors.publishDate = "Publish date is required";
    }

    if (targetStatus === "PUBLISHED") {
      if (!formData.fullArticle.trim()) {
        errors.fullArticle = "Full article content is required to publish";
      } else if (formData.fullArticle.trim().length < 10) {
        errors.fullArticle = "Article content must be at least 10 characters";
      }
    }

    if (!formData.priority) {
      errors.priority = "Please select a priority";
    }

    if (!formData.visibility) {
      errors.visibility = "Please select visibility";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate form (Edit)
  const validateEditForm = (targetStatus: "DRAFT" | "PUBLISHED"): boolean => {
    const errors: FormErrors = {};

    if (!editFormData.articleTitle.trim()) {
      errors.articleTitle = "Article title is required";
    } else if (editFormData.articleTitle.trim().length < 3) {
      errors.articleTitle = "Title must be at least 3 characters";
    }

    if (!editFormData.category) {
      errors.category = "Please select a category";
    }

    if (!editFormData.author.trim()) {
      errors.author = "Author name is required";
    }

    if (!editFormData.publishDate || editFormData.publishDate.trim() === "") {
      errors.publishDate = "Publish date is required";
    }

    if (targetStatus === "PUBLISHED") {
      if (!editFormData.fullArticle.trim()) {
        errors.fullArticle = "Full article content is required to publish";
      } else if (editFormData.fullArticle.trim().length < 10) {
        errors.fullArticle = "Article content must be at least 10 characters";
      }
    }

    if (!editFormData.priority) {
      errors.priority = "Please select a priority";
    }

    if (!editFormData.visibility) {
      errors.visibility = "Please select visibility";
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create News
  const handleSubmitCreate = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (!validateForm(targetStatus)) {
      ErrorToast("Please fill in all required fields correctly");
      return;
    }

    setSubmittingStatus(targetStatus);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        articleTitle: formData.articleTitle.trim(),
        category: formData.category,
        author: formData.author.trim(),
        publishDate: formData.publishDate,
        fullArticle: formData.fullArticle.trim(),
        priority: formData.priority,
        tags: tagsArray,
        visibility: formData.visibility,
        status: targetStatus,
        sendPushNotification: formData.sendPushNotification,
      };

      const submitFormData = new FormData();
      submitFormData.append("data", JSON.stringify(payload));

      if (imageFile) {
        submitFormData.append("featuredImage", imageFile);
      }

      await createAcademyNews(submitFormData).unwrap();

      setShowCreateModal(false);
      resetForm();
    } catch {
      // Toast handled by academyApi
    } finally {
      setSubmittingStatus(null);
    }
  };

  // Submit Edit News (PATCH /academies/academy-news/:id)
  const handleSubmitEdit = async (targetStatus: "DRAFT" | "PUBLISHED") => {
    if (!editingArticle) return;
    if (!validateEditForm(targetStatus)) {
      ErrorToast("Please fill in all required fields correctly");
      return;
    }

    setEditSubmittingStatus(targetStatus);

    try {
      const tagsArray = editFormData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        articleTitle: editFormData.articleTitle.trim(),
        category: editFormData.category,
        author: editFormData.author.trim(),
        publishDate: editFormData.publishDate,
        fullArticle: editFormData.fullArticle.trim(),
        priority: editFormData.priority,
        tags: tagsArray,
        visibility: editFormData.visibility,
        status: targetStatus,
        sendPushNotification: editFormData.sendPushNotification,
      };

      const submitFormData = new FormData();
      submitFormData.append("data", JSON.stringify(payload));

      if (editImageFile) {
        submitFormData.append("featuredImage", editImageFile);
      }

      await updateAcademyNews({ id: editingArticle._id, formData: submitFormData }).unwrap();

      setEditingArticle(null);
    } catch {
      // Toast handled by academyApi
    } finally {
      setEditSubmittingStatus(null);
    }
  };

  // Toggle Visibility (PATCH /academies/academy-news/:id/toggle-visibility)
  const handleToggleVisibility = async (article: IAcademyNewsItem) => {
    setActionLoadingId(article._id);
    try {
      await toggleNewsVisibility(article._id).unwrap();
    } catch {
      // Toast handled by academyApi
    } finally {
      setActionLoadingId(null);
    }
  };

  // Move to Bin (Soft Delete) (PATCH /academies/academy-news/:id/bin)
  const handleMoveToBinConfirm = async () => {
    if (!binConfirmArticle) return;
    try {
      await moveNewsToBin(binConfirmArticle._id).unwrap();
      setBinConfirmArticle(null);
    } catch {
      // Toast handled by academyApi
    }
  };

  // Restore from Bin (PATCH /academies/academy-news/:id/restore)
  const handleRestoreFromBin = async (article: IAcademyNewsItem) => {
    setActionLoadingId(article._id);
    try {
      await restoreNewsFromBin(article._id).unwrap();
    } catch {
      // Toast handled by academyApi
    } finally {
      setActionLoadingId(null);
    }
  };

  // Permanent Delete (DELETE /academies/academy-news/:id)
  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteArticle) return;
    try {
      await deleteAcademyNews(permanentDeleteArticle._id).unwrap();
      setPermanentDeleteArticle(null);
    } catch {
      // Toast handled by academyApi
    }
  };

  // Badge helpers
  const getPriorityStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "URGENT":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/25";
      case "HIGH":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/25";
      case "MEDIUM":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/25";
      case "LOW":
      default:
        return "bg-zinc-500/15 text-zinc-400 border border-zinc-500/25";
    }
  };

  const getStatusBadge = (article: IAcademyNewsItem) => {
    if (article.statusBadge?.label) {
      const variant = article.statusBadge.variant?.toLowerCase();
      if (variant === "green" || article.status === "PUBLISHED") {
        return "bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/20";
      }
      if (variant === "yellow" || article.status === "DRAFT") {
        return "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/20";
      }
      return "bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/20";
    }

    if (article.status === "PUBLISHED") {
      return "bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/20";
    }
    if (article.status === "DRAFT") {
      return "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/20";
    }
    return "bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/20";
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Academy News
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Create and manage news articles
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => refetch()}
            disabled={isNewsFetching}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0 cursor-pointer"
            title="Refresh News"
          >
            <IconRefresh size={20} className={cn(isNewsFetching && "animate-spin text-[#E31B23]")} />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 md:flex-initial justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
          >
            <IconPlus size={20} className="shrink-0" />
            <span className="text-sm font-bold uppercase tracking-widest truncate">Create News</span>
          </button>
        </div>
      </div>

      {/* Tabs / Filters Bar */}
      <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-3 md:p-4 flex gap-2 md:gap-4 shadow-xl overflow-x-auto custom-scrollbar w-full max-w-full">
        {TABS.map((tab) => {
          const count = tabCounts ? tabCounts[tab.countKey] : undefined;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all px-4 py-2.5 rounded-xl shrink-0 cursor-pointer",
                isActive
                  ? "bg-white/10 text-white border border-white/20 shadow-md"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <tab.icon size={17} className={cn("shrink-0", isActive ? "text-[#E31B23]" : "text-white/40")} />
              <span>{tab.name}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight",
                    isActive
                      ? "bg-[#E31B23] text-white"
                      : "bg-white/10 text-white/60"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* News Cards List */}
      <div className="flex flex-col gap-6">
        {/* Loading Skeletons */}
        {isNewsLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/10 p-6 md:p-8 flex flex-col gap-5 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <div className="h-6 w-24 bg-white/10 rounded-xl" />
                    <div className="h-6 w-20 bg-white/10 rounded-xl" />
                  </div>
                  <div className="flex gap-2">
                    <div className="size-9 bg-white/10 rounded-xl" />
                    <div className="size-9 bg-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="h-7 w-3/4 bg-white/10 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-md" />
                <div className="h-4 w-2/3 bg-white/5 rounded-md" />
                <div className="pt-4 border-t border-white/5 flex gap-4">
                  <div className="h-4 w-32 bg-white/5 rounded-md" />
                  <div className="h-4 w-32 bg-white/5 rounded-md" />
                  <div className="h-4 w-20 bg-white/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : newsArticles.length === 0 ? (
          /* Empty State */
          <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
            <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
              <IconFileText size={32} />
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="text-xl font-black uppercase text-white font-orbitron">No News Found</h3>
              <p className="text-xs font-medium text-white/50 leading-relaxed">
                There are no news articles in the &ldquo;{TABS.find((t) => t.key === activeTab)?.name}&rdquo; tab yet.
              </p>
            </div>
            {activeTab !== "BIN" && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer"
              >
                <IconPlus size={18} />
                <span>Create First Article</span>
              </button>
            )}
          </div>
        ) : (
          /* Live Articles */
          newsArticles.map((article) => {
            const statusBadgeText = article.statusBadge?.label || article.status;
            const visibilityBadgeText = article.visibilityBadge?.label || article.visibility;
            const isBinTab = activeTab === "BIN" || article.status === "BIN" || article.isDeleted;
            const isLoadingAction = actionLoadingId === article._id;

            return (
              <div
                key={article._id}
                className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 hover:border-white/25 transition-all shadow-2xl min-w-0"
              >
                {/* Badges & Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0",
                        getStatusBadge(article)
                      )}
                    >
                      {statusBadgeText}
                    </span>

                    {/* Visibility Badge */}
                    <span
                      className={cn(
                        "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0 flex items-center gap-1.5",
                        article.visibility === "PRIVATE"
                          ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                          : "bg-white/5 border border-white/10 text-white/70"
                      )}
                    >
                      {article.visibility === "PRIVATE" ? <IconLock size={12} /> : <IconWorld size={12} />}
                      {visibilityBadgeText}
                    </span>

                    {/* Priority Badge */}
                    {article.priority && (
                      <span
                        className={cn(
                          "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0",
                          getPriorityStyle(article.priority)
                        )}
                      >
                        {article.priority}
                      </span>
                    )}

                    {/* Category Badge */}
                    {article.category && (
                      <span className="bg-white/5 border border-white/10 text-white/50 px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0">
                        {article.category}
                      </span>
                    )}

                    {/* Push Notification indicator */}
                    {article.sendPushNotification && (
                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shrink-0">
                        <IconBell size={12} />
                        Push
                      </span>
                    )}
                  </div>

                  {/* Actions Bar matching screenshot */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {/* 1. View Button */}
                    <button
                      onClick={() => setViewingArticle(article)}
                      className="size-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
                      title="View Article"
                    >
                      <IconEye size={18} />
                    </button>

                    {/* If in BIN tab: show Restore and Permanent Delete */}
                    {isBinTab ? (
                      <>
                        {/* Restore Button (PATCH /academies/academy-news/:id/restore) */}
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleRestoreFromBin(article)}
                          className="size-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shrink-0 cursor-pointer disabled:opacity-50"
                          title="Restore News from Bin"
                        >
                          {isLoadingAction ? (
                            <IconLoader2 size={16} className="animate-spin" />
                          ) : (
                            <IconRotateClockwise size={18} />
                          )}
                        </button>

                        {/* Permanent Delete Button (DELETE /academies/academy-news/:id) */}
                        <button
                          onClick={() => setPermanentDeleteArticle(article)}
                          className="size-9 flex items-center justify-center rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-all shadow-lg shadow-[#E31B23]/5 hover:shadow-[#E31B23]/20 shrink-0 cursor-pointer"
                          title="Delete Permanently"
                        >
                          <IconTrash size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* 2. Edit Button (PATCH /academies/academy-news/:id) */}
                        <button
                          onClick={() => handleOpenEditModal(article)}
                          className="size-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 cursor-pointer"
                          title="Edit News Article"
                        >
                          <IconEdit size={18} />
                        </button>

                        {/* 3. Toggle Visibility Button (PATCH /academies/academy-news/:id/toggle-visibility) */}
                        <button
                          disabled={isLoadingAction}
                          onClick={() => handleToggleVisibility(article)}
                          className={cn(
                            "size-9 flex items-center justify-center rounded-xl border transition-all shrink-0 cursor-pointer disabled:opacity-50",
                            article.visibility === "PRIVATE"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black"
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                          )}
                          title={`Toggle Visibility (Current: ${article.visibility})`}
                        >
                          {isLoadingAction ? (
                            <IconLoader2 size={16} className="animate-spin" />
                          ) : article.visibility === "PRIVATE" ? (
                            <IconLock size={18} />
                          ) : (
                            <IconWorld size={18} />
                          )}
                        </button>

                        {/* 4. Move to Bin (Soft Delete) Button (PATCH /academies/academy-news/:id/bin) */}
                        <button
                          onClick={() => setBinConfirmArticle(article)}
                          className="size-9 flex items-center justify-center rounded-xl bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] hover:bg-[#E31B23] hover:text-white transition-all shadow-lg shadow-[#E31B23]/5 hover:shadow-[#E31B23]/20 shrink-0 cursor-pointer"
                          title="Move to Bin (Soft Delete)"
                        >
                          <IconTrash size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Article Content Area */}
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* Featured Image Thumbnail (if present) */}
                  {article.featuredImage ? (
                    <div className="relative w-full md:w-56 h-36 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                      <Image
                        src={article.featuredImage}
                        alt={article.articleTitle}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : null}

                  {/* Title & Excerpt */}
                  <div className="flex flex-col gap-3 min-w-0 flex-1">
                    <h3
                      onClick={() => setViewingArticle(article)}
                      className="text-xl md:text-2xl font-black uppercase text-white font-orbitron leading-tight tracking-tight wrap-break-word hover:text-[#E31B23] transition-colors cursor-pointer"
                    >
                      {article.articleTitle}
                    </h3>
                    <p className="text-sm font-medium text-white/60 leading-relaxed max-w-3xl wrap-break-word">
                      {article.excerpt || article.fullArticle || "No description provided."}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {article.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg uppercase tracking-wider"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="pt-5 border-t border-white/5 flex flex-wrap items-center gap-4 md:gap-6 text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>Published By:</span>
                    <span className="text-white/80">{article.publishedBy || article.author || "Admin"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>• Publishing Date:</span>
                    <span className="text-white/80">
                      {article.formattedPublishDate ||
                        (article.publishDate ? new Date(article.publishDate).toLocaleDateString() : "N/A")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>• Views:</span>
                    <span className="text-white/80">{article.views ?? 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. CREATE NEWS MODAL                                                      */}
      {/* ========================================================================= */}
      <DashboardModal
        isOpen={showCreateModal}
        onClose={() => {
          if (!submittingStatus) setShowCreateModal(false);
        }}
        title="Create News Article"
        subtitle="Publish news and updates for your academy community"
        showBackButton
        onBack={() => setShowCreateModal(false)}
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              disabled={Boolean(submittingStatus)}
              onClick={() => setShowCreateModal(false)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={Boolean(submittingStatus)}
              onClick={() => handleSubmitCreate("DRAFT")}
              className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {submittingStatus === "DRAFT" ? (
                <>
                  <IconLoader2 size={16} className="animate-spin text-[#FBBF24]" />
                  <span>Saving Draft...</span>
                </>
              ) : (
                <>
                  <IconPencil size={16} className="text-white/40" />
                  <span>Save Draft</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={Boolean(submittingStatus)}
              onClick={() => handleSubmitCreate("PUBLISHED")}
              className="w-full sm:w-auto justify-center px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {submittingStatus === "PUBLISHED" ? (
                <>
                  <IconLoader2 size={16} className="animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <IconWorld size={16} />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-2">
          {/* Article Information */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconFileText size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Article Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Article Title <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Santos FC Academy Wins Regional Championship"
                  value={formData.articleTitle}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, articleTitle: e.target.value }));
                    if (formErrors.articleTitle) {
                      setFormErrors((prev) => ({ ...prev, articleTitle: undefined }));
                    }
                  }}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.articleTitle
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-white/15 focus:border-[#E31B23]"
                  )}
                />
                {formErrors.articleTitle && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {formErrors.articleTitle}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Category <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, category: e.target.value }));
                      if (formErrors.category) {
                        setFormErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                    className={cn(
                      "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none transition-all cursor-pointer",
                      formErrors.category
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-white/15 focus:border-[#E31B23]"
                    )}
                  >
                    <option value="" disabled className="bg-[#111111] text-white/40">
                      Select Category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#181818] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
                {formErrors.category && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {formErrors.category}
                  </p>
                )}
              </div>

              {/* Author */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Author <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Author name"
                  value={formData.author}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, author: e.target.value }));
                    if (formErrors.author) {
                      setFormErrors((prev) => ({ ...prev, author: undefined }));
                    }
                  }}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.author
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-white/15 focus:border-[#E31B23]"
                  )}
                />
                {formErrors.author && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {formErrors.author}
                  </p>
                )}
              </div>

              {/* Publish Date */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                    Publish Date <span className="text-[#E31B23]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const today = getTodayDateString();
                      setFormData((prev) => ({ ...prev, publishDate: today }));
                      if (formErrors.publishDate) {
                        setFormErrors((prev) => ({ ...prev, publishDate: undefined }));
                      }
                    }}
                    className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer uppercase tracking-wider"
                  >
                    Today
                  </button>
                </div>

                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    try {
                      publishDateInputRef.current?.showPicker?.();
                    } catch {}
                  }}
                >
                  <input
                    ref={publishDateInputRef}
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({ ...prev, publishDate: val }));
                      if (val && formErrors.publishDate) {
                        setFormErrors((prev) => ({ ...prev, publishDate: undefined }));
                      }
                    }}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ colorScheme: "dark" }}
                    className={cn(
                      "w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-11 text-sm text-white focus:outline-none transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100",
                      formErrors.publishDate
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-white/15 focus:border-[#E31B23]"
                    )}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        publishDateInputRef.current?.showPicker?.();
                      } catch {}
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
                    title="Open Calendar"
                  >
                    <IconCalendar size={18} className="text-[#E31B23]" />
                  </button>
                </div>

                {formErrors.publishDate && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {formErrors.publishDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconPencil size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Article Content</h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                Full Article <span className="text-[#E31B23]">*</span>
              </label>
              <textarea
                placeholder="Write the full article content here. Provide match details, highlights, tournament outcomes, or academy announcements..."
                rows={7}
                value={formData.fullArticle}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, fullArticle: e.target.value }));
                  if (formErrors.fullArticle) {
                    setFormErrors((prev) => ({ ...prev, fullArticle: undefined }));
                  }
                }}
                className={cn(
                  "w-full bg-[#111111] border rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-y custom-scrollbar",
                  formErrors.fullArticle
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-white/15 focus:border-[#E31B23]"
                )}
              />
              <div className="flex justify-between items-center text-[10px] text-white/40">
                <span>Markdown & paragraphs supported</span>
                <span>{formData.fullArticle.length} characters</span>
              </div>
              {formErrors.fullArticle && (
                <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                  <IconAlertCircle size={13} />
                  {formErrors.fullArticle}
                </p>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconUpload size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Featured Image</h3>
            </div>

            <div className="flex flex-col gap-2">
              <input
                id={createFileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              {imagePreview ? (
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/20 bg-black/60 group">
                  <Image
                    src={imagePreview}
                    alt="Featured Image Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconTrash size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-white/1",
                    isDragOver
                      ? "border-[#E31B23] bg-[#E31B23]/5"
                      : "border-white/15 hover:border-white/30 hover:bg-white/3"
                  )}
                >
                  <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <IconUpload size={28} />
                  </div>
                  <div className="text-center flex flex-col gap-1">
                    <p className="text-sm font-bold text-white/80">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      PNG, JPG, WEBP (Max 5MB) • Recommended 1200x675 (16:9)
                    </p>
                  </div>
                </div>
              )}

              {formErrors.featuredImage && (
                <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                  <IconAlertCircle size={13} />
                  {formErrors.featuredImage}
                </p>
              )}
            </div>
          </div>

          {/* Priority, Visibility & Tags */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconTag size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Classification & Visibility</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Priority <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-[#E31B23] transition-all cursor-pointer"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p} className="bg-[#181818] text-white">
                        {p}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Visibility <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData((prev) => ({ ...prev, visibility: e.target.value }))}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-[#E31B23] transition-all cursor-pointer"
                  >
                    {visibilities.map((v) => (
                      <option key={v} value={v} className="bg-[#181818] text-white">
                        {v}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., U-17, Championship, Victory"
                  value={formData.tags}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E31B23] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconBell size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Notification Settings</h3>
            </div>

            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, sendPushNotification: !prev.sendPushNotification }))
              }
              className="bg-[#111111] border border-white/15 hover:border-white/25 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer select-none"
            >
              <div className="flex flex-col gap-1 pr-4">
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  Send push notification to all users
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Users will receive an instant notification when this article is published
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors p-1 shrink-0",
                  formData.sendPushNotification ? "bg-[#E31B23]" : "bg-white/15"
                )}
              >
                <div
                  className={cn(
                    "size-4 bg-white rounded-full transition-transform",
                    formData.sendPushNotification ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardModal>

      {/* ========================================================================= */}
      {/* 2. EDIT NEWS MODAL (PATCH /academies/academy-news/:id)                   */}
      {/* ========================================================================= */}
      <DashboardModal
        isOpen={Boolean(editingArticle)}
        onClose={() => {
          if (!editSubmittingStatus) setEditingArticle(null);
        }}
        title="Edit News Article"
        subtitle={`Updating article #${editingArticle?._id?.slice(-6) || ""}`}
        showBackButton
        onBack={() => setEditingArticle(null)}
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              disabled={Boolean(editSubmittingStatus)}
              onClick={() => setEditingArticle(null)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={Boolean(editSubmittingStatus)}
              onClick={() => handleSubmitEdit("DRAFT")}
              className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {editSubmittingStatus === "DRAFT" ? (
                <>
                  <IconLoader2 size={16} className="animate-spin text-[#FBBF24]" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconPencil size={16} className="text-white/40" />
                  <span>Save as Draft</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={Boolean(editSubmittingStatus)}
              onClick={() => handleSubmitEdit("PUBLISHED")}
              className="w-full sm:w-auto justify-center px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {editSubmittingStatus === "PUBLISHED" ? (
                <>
                  <IconLoader2 size={16} className="animate-spin text-white" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <IconWorld size={16} />
                  <span>Update & Publish</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-8 py-2">
          {/* Article Information */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconFileText size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Article Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Title */}
              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Article Title <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.articleTitle}
                  onChange={(e) => {
                    setEditFormData((prev) => ({ ...prev, articleTitle: e.target.value }));
                    if (editFormErrors.articleTitle) {
                      setEditFormErrors((prev) => ({ ...prev, articleTitle: undefined }));
                    }
                  }}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    editFormErrors.articleTitle
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-white/15 focus:border-[#E31B23]"
                  )}
                />
                {editFormErrors.articleTitle && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {editFormErrors.articleTitle}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Category <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={editFormData.category}
                    onChange={(e) => {
                      setEditFormData((prev) => ({ ...prev, category: e.target.value }));
                      if (editFormErrors.category) {
                        setEditFormErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                    className={cn(
                      "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none transition-all cursor-pointer",
                      editFormErrors.category
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-white/15 focus:border-[#E31B23]"
                    )}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#181818] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
                {editFormErrors.category && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {editFormErrors.category}
                  </p>
                )}
              </div>

              {/* Author */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Author <span className="text-[#E31B23]">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.author}
                  onChange={(e) => {
                    setEditFormData((prev) => ({ ...prev, author: e.target.value }));
                    if (editFormErrors.author) {
                      setEditFormErrors((prev) => ({ ...prev, author: undefined }));
                    }
                  }}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    editFormErrors.author
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-white/15 focus:border-[#E31B23]"
                  )}
                />
                {editFormErrors.author && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {editFormErrors.author}
                  </p>
                )}
              </div>

              {/* Publish Date */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                    Publish Date <span className="text-[#E31B23]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const today = getTodayDateString();
                      setEditFormData((prev) => ({ ...prev, publishDate: today }));
                      if (editFormErrors.publishDate) {
                        setEditFormErrors((prev) => ({ ...prev, publishDate: undefined }));
                      }
                    }}
                    className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer uppercase tracking-wider"
                  >
                    Today
                  </button>
                </div>

                <div
                  className="relative cursor-pointer"
                  onClick={() => {
                    try {
                      editPublishDateInputRef.current?.showPicker?.();
                    } catch {}
                  }}
                >
                  <input
                    ref={editPublishDateInputRef}
                    type="date"
                    value={editFormData.publishDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditFormData((prev) => ({ ...prev, publishDate: val }));
                      if (val && editFormErrors.publishDate) {
                        setEditFormErrors((prev) => ({ ...prev, publishDate: undefined }));
                      }
                    }}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.();
                      } catch {}
                    }}
                    style={{ colorScheme: "dark" }}
                    className={cn(
                      "w-full bg-[#111111] border rounded-xl py-3.5 px-4 pr-11 text-sm text-white focus:outline-none transition-all cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100",
                      editFormErrors.publishDate
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-white/15 focus:border-[#E31B23]"
                    )}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        editPublishDateInputRef.current?.showPicker?.();
                      } catch {}
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
                    title="Open Calendar"
                  >
                    <IconCalendar size={18} className="text-[#E31B23]" />
                  </button>
                </div>

                {editFormErrors.publishDate && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                    <IconAlertCircle size={13} />
                    {editFormErrors.publishDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconPencil size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Article Content</h3>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                Full Article <span className="text-[#E31B23]">*</span>
              </label>
              <textarea
                placeholder="Write the full article content here..."
                rows={7}
                value={editFormData.fullArticle}
                onChange={(e) => {
                  setEditFormData((prev) => ({ ...prev, fullArticle: e.target.value }));
                  if (editFormErrors.fullArticle) {
                    setEditFormErrors((prev) => ({ ...prev, fullArticle: undefined }));
                  }
                }}
                className={cn(
                  "w-full bg-[#111111] border rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-y custom-scrollbar",
                  editFormErrors.fullArticle
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-white/15 focus:border-[#E31B23]"
                )}
              />
              <div className="flex justify-between items-center text-[10px] text-white/40">
                <span>Markdown & paragraphs supported</span>
                <span>{editFormData.fullArticle.length} characters</span>
              </div>
              {editFormErrors.fullArticle && (
                <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                  <IconAlertCircle size={13} />
                  {editFormErrors.fullArticle}
                </p>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconUpload size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Featured Image</h3>
            </div>

            <div className="flex flex-col gap-2">
              <input
                id={editFileInputId}
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleEditFileChange(e.target.files?.[0] || null)}
              />

              {editImagePreview ? (
                <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/20 bg-black/60 group">
                  <Image
                    src={editImagePreview}
                    alt="Featured Image Preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditImageFile(null);
                        setEditImagePreview(null);
                        if (editFileInputRef.current) editFileInputRef.current.value = "";
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconTrash size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsEditDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsEditDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsEditDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleEditFileChange(file);
                  }}
                  onClick={() => editFileInputRef.current?.click()}
                  className={cn(
                    "w-full border-2 border-dashed rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer bg-white/1",
                    isEditDragOver
                      ? "border-[#E31B23] bg-[#E31B23]/5"
                      : "border-white/15 hover:border-white/30 hover:bg-white/3"
                  )}
                >
                  <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <IconUpload size={28} />
                  </div>
                  <div className="text-center flex flex-col gap-1">
                    <p className="text-sm font-bold text-white/80">Click to upload new image</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      PNG, JPG, WEBP (Max 5MB) • Recommended 1200x675 (16:9)
                    </p>
                  </div>
                </div>
              )}

              {editFormErrors.featuredImage && (
                <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                  <IconAlertCircle size={13} />
                  {editFormErrors.featuredImage}
                </p>
              )}
            </div>
          </div>

          {/* Priority, Visibility & Tags */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconTag size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Classification & Visibility</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Priority */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Priority <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-[#E31B23] transition-all cursor-pointer"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p} className="bg-[#181818] text-white">
                        {p}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70 flex items-center gap-1">
                  Visibility <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={editFormData.visibility}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, visibility: e.target.value }))}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-[#E31B23] transition-all cursor-pointer"
                  >
                    {visibilities.map((v) => (
                      <option key={v} value={v} className="bg-[#181818] text-white">
                        {v}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/70">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., U-17, Championship, Victory"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#E31B23] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="flex flex-col gap-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <IconBell size={18} className="text-[#E31B23]" />
              <h3 className="text-lg font-black uppercase text-white font-orbitron">Notification Settings</h3>
            </div>

            <div
              onClick={() =>
                setEditFormData((prev) => ({ ...prev, sendPushNotification: !prev.sendPushNotification }))
              }
              className="bg-[#111111] border border-white/15 hover:border-white/25 rounded-2xl p-5 flex items-center justify-between transition-all cursor-pointer select-none"
            >
              <div className="flex flex-col gap-1 pr-4">
                <p className="text-xs font-black text-white uppercase tracking-wider">
                  Send push notification to all users
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Users will receive an instant notification about this updated news
                </p>
              </div>
              <div
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors p-1 shrink-0",
                  editFormData.sendPushNotification ? "bg-[#E31B23]" : "bg-white/15"
                )}
              >
                <div
                  className={cn(
                    "size-4 bg-white rounded-full transition-transform",
                    editFormData.sendPushNotification ? "translate-x-6" : "translate-x-0"
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardModal>

      {/* ========================================================================= */}
      {/* 3. VIEW ARTICLE DETAILS MODAL                                             */}
      {/* ========================================================================= */}
      <DashboardModal
        isOpen={Boolean(viewingArticle)}
        onClose={() => setViewingArticle(null)}
        title={viewingArticle?.articleTitle || "Article Details"}
        subtitle={`Published by ${viewingArticle?.publishedBy || viewingArticle?.author || "Admin"}`}
        showBackButton
        onBack={() => setViewingArticle(null)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setViewingArticle(null)}
              className="px-6 py-3 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {viewingArticle && (
          <div className="flex flex-col gap-6 py-2">
            {/* Featured Image */}
            {viewingArticle.featuredImage && (
              <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-white/15 bg-black/50">
                <Image
                  src={viewingArticle.featuredImage}
                  alt={viewingArticle.articleTitle}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            {/* Badges Bar */}
            <div className="flex flex-wrap gap-2.5 items-center">
              <span
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                  getStatusBadge(viewingArticle)
                )}
              >
                {viewingArticle.statusBadge?.label || viewingArticle.status}
              </span>
              <span className="bg-white/5 border border-white/15 text-white/80 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                {viewingArticle.visibility === "PRIVATE" ? <IconLock size={12} /> : <IconWorld size={12} />}
                {viewingArticle.visibilityBadge?.label || viewingArticle.visibility}
              </span>
              {viewingArticle.priority && (
                <span
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                    getPriorityStyle(viewingArticle.priority)
                  )}
                >
                  {viewingArticle.priority} Priority
                </span>
              )}
              {viewingArticle.category && (
                <span className="bg-white/5 border border-white/10 text-white/60 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {viewingArticle.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron leading-tight">
              {viewingArticle.articleTitle}
            </h2>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-white/40 border-y border-white/10 py-3">
              <div className="flex items-center gap-1.5">
                <IconUser size={15} className="text-[#E31B23]" />
                <span>Author: {viewingArticle.author || viewingArticle.publishedBy || "Admin"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={15} className="text-[#E31B23]" />
                <span>
                  Date:{" "}
                  {viewingArticle.formattedPublishDate ||
                    (viewingArticle.publishDate ? new Date(viewingArticle.publishDate).toLocaleDateString() : "N/A")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconEye size={15} className="text-[#E31B23]" />
                <span>Views: {viewingArticle.views ?? 0}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="text-white/80 leading-relaxed text-sm md:text-base whitespace-pre-line font-normal">
              {viewingArticle.fullArticle || viewingArticle.excerpt || "No content provided."}
            </div>

            {/* Tags */}
            {viewingArticle.tags && viewingArticle.tags.length > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {viewingArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold text-white/70 bg-white/5 border border-white/15 px-3 py-1.5 rounded-xl uppercase tracking-wider"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DashboardModal>

      {/* ========================================================================= */}
      {/* 4. MOVE TO BIN CONFIRMATION MODAL (PATCH /academies/academy-news/:id/bin)  */}
      {/* ========================================================================= */}
      <DashboardModal
        isOpen={Boolean(binConfirmArticle)}
        onClose={() => {
          if (!isMovingToBin) setBinConfirmArticle(null);
        }}
        title="Move to Bin"
        subtitle="Soft delete article"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              disabled={isMovingToBin}
              onClick={() => setBinConfirmArticle(null)}
              className="flex-1 px-5 py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isMovingToBin}
              onClick={handleMoveToBinConfirm}
              className="flex-1 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50"
            >
              {isMovingToBin ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Moving...</span>
                </>
              ) : (
                <>
                  <IconTrash size={16} />
                  <span>Move to Bin</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <IconTrash size={30} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-base font-black text-white uppercase font-orbitron">
              Move &ldquo;{binConfirmArticle?.articleTitle}&rdquo; to Bin?
            </h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              This news article will be moved to the Bin. You can restore it anytime or permanently delete it from the BIN tab.
            </p>
          </div>
        </div>
      </DashboardModal>

      {/* ========================================================================= */}
      {/* 5. PERMANENT DELETE MODAL (DELETE /academies/academy-news/:id)            */}
      {/* ========================================================================= */}
      <DashboardModal
        isOpen={Boolean(permanentDeleteArticle)}
        onClose={() => {
          if (!isDeletingPermanently) setPermanentDeleteArticle(null);
        }}
        title="Delete Permanently"
        subtitle="This action cannot be undone"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              disabled={isDeletingPermanently}
              onClick={() => setPermanentDeleteArticle(null)}
              className="flex-1 px-5 py-3 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isDeletingPermanently}
              onClick={handlePermanentDeleteConfirm}
              className="flex-1 px-5 py-3 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 cursor-pointer disabled:opacity-50"
            >
              {isDeletingPermanently ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconTrash size={16} />
                  <span>Delete Forever</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="size-14 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23]">
            <IconAlertCircle size={30} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-base font-black text-white uppercase font-orbitron">
              Permanently delete &ldquo;{permanentDeleteArticle?.articleTitle}&rdquo;?
            </h4>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              Are you sure you want to permanently delete this news article? This cannot be restored and will be completely removed from the database.
            </p>
          </div>
        </div>
      </DashboardModal>
    </div>
  );
};

export default AcademyNewsManagement;
