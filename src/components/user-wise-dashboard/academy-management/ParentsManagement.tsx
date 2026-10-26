"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconSearch,
  IconPlus,
  IconChevronDown,
  IconMessage,
  IconTrash,
  IconLoader2,
  IconPencil,
  IconAlertCircle,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBuilding,
  IconCheck,
  IconX,
  IconUsers,
  IconFileText,
  IconBriefcase,
  IconRefresh,
  IconShirt,
  IconUserCheck,
  IconChevronLeft,
  IconChevronRight,
  IconSend,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetAcademyParentsQuery,
  useCreateAcademyParentMutation,
  useUpdateAcademyParentMutation,
  useDeleteAcademyParentMutation,
  useGetAcademyCoachAndPlayersQuery,
} from "@/redux/features/academy/academyApi";
import { useGetPlayersQuery } from "@/redux/features/player/playerApi";
import {
  IAcademyParentItem,
  ICreateAcademyParentPayload,
  IUpdateAcademyParentPayload,
} from "@/types/academy.type";

const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Guardian",
  "Step-Father",
  "Step-Mother",
  "Grandparent",
  "Uncle",
  "Aunt",
  "Other",
];

interface FormValues {
  firstName: string;
  lastName: string;
  relationship: string;
  occupation: string;
  email: string;
  primaryPhone: string;
  alternatePhone: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  occupation?: string;
  email?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  notes?: string;
  linkedPlayerIds?: string;
}

const initialFormValues: FormValues = {
  firstName: "",
  lastName: "",
  relationship: "Father",
  occupation: "",
  email: "",
  primaryPhone: "",
  alternatePhone: "",
  streetAddress: "",
  city: "",
  zipCode: "",
  notes: "",
};

export const ParentsManagement = () => {
  // Search & Filter State
  const [searchInput, setSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);

  // Debounce search input to query API with searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Modals State
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingParent, setEditingParent] = useState<IAcademyParentItem | null>(null);
  const [parentToDelete, setParentToDelete] = useState<IAcademyParentItem | null>(null);
  const [messagingParent, setMessagingParent] = useState<IAcademyParentItem | null>(null);
  const [messageText, setMessageText] = useState<string>("");
  const [viewingPlayersParent, setViewingPlayersParent] = useState<IAcademyParentItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<FormValues>(initialFormValues);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerModalSearch, setPlayerModalSearch] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});

  // RTK Query Hooks
  const {
    data: parentsData,
    isLoading: isParentsLoading,
    isFetching: isParentsFetching,
    refetch: refetchParents,
  } = useGetAcademyParentsQuery({
    searchTerm: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  const { data: coachAndPlayersData, isLoading: isRosterLoading } =
    useGetAcademyCoachAndPlayersQuery();
  const { data: playersResponse } = useGetPlayersQuery({});

  const [createParent, { isLoading: isCreating }] = useCreateAcademyParentMutation();
  const [updateParent, { isLoading: isUpdating }] = useUpdateAcademyParentMutation();
  const [deleteParent, { isLoading: isDeleting }] = useDeleteAcademyParentMutation();

  const isSaving = isCreating || isUpdating;

  // Extract parents list and statistics
  const parentsList: IAcademyParentItem[] = parentsData?.data?.parents || [];
  const stats = parentsData?.data?.stats;
  const paginationMeta = parentsData?.data?.pagination || parentsData?.data?.meta;
  const totalPages = paginationMeta?.totalPages || 1;
  const totalCount = paginationMeta?.total ?? parentsList.length;

  // Combine available players from academy roster and general player list
  const availablePlayers = useMemo(() => {
    const map = new Map<
      string,
      {
        _id: string;
        fullName: string;
        position: string;
        avatar: string;
        teamName?: string;
        age?: string | number;
      }
    >();

    // 1. Players from academy teams
    if (coachAndPlayersData?.data?.teams) {
      coachAndPlayersData.data.teams.forEach((t) => {
        if (Array.isArray(t.playerIds)) {
          t.playerIds.forEach((p) => {
            if (p && p._id) {
              map.set(p._id, {
                _id: p._id,
                fullName: p.fullName || "Player",
                position: p.position || "N/A",
                avatar: p.profileImage || "/placeholder_img.jpg",
                teamName: t.teamName,
                age: p.age,
              });
            }
          });
        }
      });
    }

    // 2. Extra players from general players query
    if (Array.isArray(playersResponse?.data)) {
      playersResponse.data.forEach((p: {
        _id?: string;
        id?: string;
        fullName?: string;
        name?: string;
        position?: string;
        profileImage?: string;
        playerImage?: string;
        teamName?: string;
        userId?: { name?: string; avatar?: string };
      }) => {
        const id = p._id || p.id;
        if (id && !map.has(id)) {
          map.set(id, {
            _id: id,
            fullName: p.fullName || p.name || p.userId?.name || "Player",
            position: p.position || "N/A",
            avatar:
              p.profileImage ||
              p.playerImage ||
              p.userId?.avatar ||
              "/placeholder_img.jpg",
            teamName: p.teamName,
          });
        }
      });
    }

    // 3. Keep previously linked players from the parent being edited
    if (editingParent?.linkedPlayers) {
      editingParent.linkedPlayers.forEach((lp) => {
        const pid = lp._id || lp.id;
        if (pid && !map.has(pid)) {
          map.set(pid, {
            _id: pid,
            fullName: lp.name || "Player",
            position: lp.position || "N/A",
            avatar: lp.avatar || "/placeholder_img.jpg",
            teamName: lp.teamName,
            age: lp.age || lp.ageValue,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [coachAndPlayersData, playersResponse, editingParent]);

  // Filter available players inside modal
  const filteredModalPlayers = useMemo(() => {
    if (!playerModalSearch.trim()) return availablePlayers;
    const q = playerModalSearch.toLowerCase();
    return availablePlayers.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        (p.teamName && p.teamName.toLowerCase().includes(q))
    );
  }, [availablePlayers, playerModalSearch]);

  // Filter displayed parents by status dropdown if not ALL
  const displayedParents = useMemo(() => {
    if (statusFilter === "ALL") return parentsList;
    return parentsList.filter(
      (p) => (p.status || "ACTIVE").toUpperCase() === statusFilter.toUpperCase()
    );
  }, [parentsList, statusFilter]);

  // Open Add Parent Modal
  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData(initialFormValues);
    setSelectedPlayerIds([]);
    setErrors({});
    setPlayerModalSearch("");
    setShowFormModal(true);
  };

  // Open Edit Parent Modal
  const handleOpenEdit = (parent: IAcademyParentItem) => {
    setEditingParent(parent);
    setFormData({
      firstName: parent.firstName || "",
      lastName: parent.lastName || "",
      relationship: parent.relationship || "Father",
      occupation: parent.occupation || "",
      email: parent.email || "",
      primaryPhone: parent.primaryPhone || parent.phone || "",
      alternatePhone: parent.alternatePhone || "",
      streetAddress: parent.streetAddress || parent.address || "",
      city: parent.city || "",
      zipCode: parent.zipCode || "",
      notes: parent.notes || "",
    });

    const playerIds = parent.linkedPlayers
      ? parent.linkedPlayers.map((p) => p._id || p.id).filter(Boolean) as string[]
      : [];
    setSelectedPlayerIds(playerIds);
    setErrors({});
    setPlayerModalSearch("");
    setShowFormModal(true);
  };

  // Handle Input Change and clear field error
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Toggle Player selection
  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      const updated = prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId];
      if (updated.length > 0 && errors.linkedPlayerIds) {
        setErrors((err) => ({ ...err, linkedPlayerIds: undefined }));
      }
      return updated;
    });
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.relationship || formData.relationship === "Select an option") {
      newErrors.relationship = "Please select a relationship type";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "Primary phone number is required";
    } else if (formData.primaryPhone.trim().length < 6) {
      newErrors.primaryPhone = "Please enter a valid phone number";
    }

    // Address validation
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = "Street address is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP/Postal code is required";
    }

    // Linked players validation
    if (selectedPlayerIds.length === 0) {
      newErrors.linkedPlayerIds = "Please select at least one linked player";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler for Add & Edit
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the form errors before submitting");
      return;
    }

    try {
      if (editingParent) {
        // PATCH update
        const parentId = editingParent._id || editingParent.id;
        if (!parentId) {
          toast.error("Parent ID is missing");
          return;
        }

        const updatePayload: IUpdateAcademyParentPayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          relationship: formData.relationship.trim(),
          occupation: formData.occupation.trim() || undefined,
          email: formData.email.trim() || undefined,
          primaryPhone: formData.primaryPhone.trim(),
          alternatePhone: formData.alternatePhone.trim() || undefined,
          streetAddress: formData.streetAddress.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
          linkedPlayerIds: selectedPlayerIds,
          notes: formData.notes.trim() || undefined,
        };

        await updateParent({ parentId, data: updatePayload }).unwrap();
      } else {
        // POST create
        const createPayload: ICreateAcademyParentPayload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          relationship: formData.relationship.trim(),
          occupation: formData.occupation.trim() || undefined,
          email: formData.email.trim(),
          primaryPhone: formData.primaryPhone.trim(),
          alternatePhone: formData.alternatePhone.trim() || undefined,
          streetAddress: formData.streetAddress.trim(),
          city: formData.city.trim(),
          zipCode: formData.zipCode.trim(),
          linkedPlayerIds: selectedPlayerIds,
          notes: formData.notes.trim() || undefined,
        };

        await createParent(createPayload).unwrap();
      }

      setShowFormModal(false);
      setEditingParent(null);
      setFormData(initialFormValues);
      setSelectedPlayerIds([]);
      setErrors({});
    } catch {
      // Toast notifications are handled automatically by onQueryStarted in academyApi
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!parentToDelete) return;
    const parentId = parentToDelete._id || parentToDelete.id;
    if (!parentId) return;

    try {
      await deleteParent(parentId).unwrap();
      setParentToDelete(null);
    } catch {
      // Handled in onQueryStarted
    }
  };

  // Send Message
  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message before sending");
      return;
    }
    toast.success(
      `Message dispatched to ${messagingParent?.firstName || "Parent"} (${messagingParent?.email})`
    );
    setMessageText("");
    setMessagingParent(null);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none break-words">
              Parents
            </h1>
            <span className="size-2.5 rounded-full bg-[#E31B23] animate-pulse" />
          </div>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Manage parent information and communication
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          disabled={isSaving}
          className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/25 cursor-pointer font-bold disabled:opacity-50 shrink-0 group active:scale-[0.98]"
        >
          <IconPlus size={20} className="group-hover:rotate-90 transition-transform duration-200" />
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest font-orbitron">
            Add New Parent
          </span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-white/20 transition-all">
            <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider">
              Total Parents
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-orbitron">
                {stats.totalParents ?? parentsList.length}
              </span>
              <IconUsers size={16} className="text-[#E31B23]" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-white/20 transition-all">
            <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider">
              Linked Players
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-orbitron">
                {stats.totalLinkedPlayers ?? 0}
              </span>
              <IconShirt size={16} className="text-[#00FF62]" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-white/20 transition-all">
            <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider">
              With Linked Players
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-orbitron">
                {stats.parentsWithLinkedPlayers ?? 0}
              </span>
              <IconUserCheck size={16} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-lg hover:border-white/20 transition-all">
            <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-wider">
              Unlinked Parents
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-orbitron">
                {stats.parentsWithoutLinkedPlayers ?? 0}
              </span>
              <span className="text-[10px] font-bold text-white/40">Unassigned</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-[#111111] rounded-3xl border border-white/15 p-4 flex flex-col sm:flex-row gap-3 shadow-xl">
        <div className="relative flex-1 min-w-0">
          <IconSearch
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors",
              isParentsFetching ? "text-[#E31B23] animate-spin" : "text-white/30"
            )}
          />
          <input
            type="text"
            placeholder="Search parents by name, email, or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-white/5 border border-white/15 rounded-2xl py-3 pl-12 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              title="Clear search"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => refetchParents()}
          title="Refresh parents list"
          className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold shrink-0 cursor-pointer"
        >
          <IconRefresh size={18} className={isParentsFetching ? "animate-spin text-[#E31B23]" : ""} />
          <span className="text-xs uppercase tracking-wider">Refresh</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111111] rounded-3xl md:rounded-4xl border border-white/15 p-4 md:p-8 flex flex-col gap-6 shadow-2xl w-full max-w-full">
        {/* Table Top Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron">
              All Parents ({totalCount})
            </h2>
            {isParentsFetching && (
              <span className="text-xs text-[#E31B23] font-bold flex items-center gap-1.5 animate-pulse">
                <IconLoader2 size={13} className="animate-spin" />
                Updating...
              </span>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 transition-all cursor-pointer appearance-none"
            >
              <option value="ALL" className="bg-[#111111] text-white">
                All Status
              </option>
              <option value="ACTIVE" className="bg-[#111111] text-white">
                Active
              </option>
              <option value="INACTIVE" className="bg-[#111111] text-white">
                Inactive
              </option>
            </select>
            <IconChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
            />
          </div>
        </div>

        {/* Parents Table */}
        <div className="rounded-2xl border border-white/15 overflow-x-auto w-full custom-scrollbar">
          <table className="w-full min-w-200 text-left border-collapse">
            <thead>
              <tr className="border-b border-white/15 bg-white/2">
                <th className="py-4 sm:py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15">
                  Parent Name
                </th>
                <th className="py-4 sm:py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Email
                </th>
                <th className="py-4 sm:py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Phone
                </th>
                <th className="py-4 sm:py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 border-r border-white/15 text-center">
                  Linked Players
                </th>
                <th className="py-4 sm:py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/80 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isParentsLoading ? (
                // Skeleton loading rows
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`parent-skeleton-${idx}`} className="border-b border-white/10 animate-pulse">
                    <td className="py-5 px-6 border-r border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="size-11 rounded-full bg-white/10 shrink-0 shimmer" />
                        <div className="flex flex-col gap-2">
                          <div className="h-4 w-36 bg-white/10 rounded shimmer" />
                          <div className="h-3 w-20 bg-white/5 rounded shimmer" />
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-40 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-28 bg-white/10 rounded mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 border-r border-white/10 text-center">
                      <div className="h-6 w-32 bg-white/10 rounded-full mx-auto shimmer" />
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="h-9 w-28 bg-white/10 rounded-xl mx-auto shimmer" />
                    </td>
                  </tr>
                ))
              ) : displayedParents.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                        <IconUsers size={30} />
                      </div>
                      <p className="text-base font-bold text-white">No Parent Records Found</p>
                      <p className="text-xs text-white/50 max-w-sm">
                        {debouncedSearch
                          ? `No parent matches "${debouncedSearch}". Try searching for another name, email, or phone number.`
                          : "No parents registered in the academy yet. Click '+ Add New Parent' to register one."}
                      </p>
                      <button
                        onClick={handleOpenAdd}
                        className="mt-3 px-5 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#E31B23]/20"
                      >
                        <IconPlus size={16} />
                        <span>Add First Parent</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedParents.map((p, index) => {
                  const parentFullName =
                    p.name ||
                    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                    "Academy Parent";
                  const avatarUrl =
                    p.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      parentFullName
                    )}&background=1f1f1f&color=fff`;

                  return (
                    <tr
                      key={p._id || p.id || index}
                      className={cn(
                        "hover:bg-white/2 transition-colors group",
                        index !== displayedParents.length - 1 && "border-b border-white/15"
                      )}
                    >
                      {/* Parent Name & Avatar */}
                      <td className="py-5 px-6 border-r border-white/15">
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#1A1A1A] relative">
                            <Image
                              width={44}
                              height={44}
                              src={avatarUrl}
                              alt={parentFullName}
                              unoptimized
                              className="size-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.srcset = "";
                                target.src = "/placeholder_img.jpg";
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white whitespace-nowrap">
                                {parentFullName}
                              </span>
                              {p.relationship && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E31B23]/15 text-[#E31B23] border border-[#E31B23]/30">
                                  {p.relationship}
                                </span>
                              )}
                            </div>
                            {p.occupation && (
                              <span className="text-[11px] font-medium text-white/40 truncate">
                                {p.occupation}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-5 px-6 border-r border-white/15 text-sm font-medium text-white/70 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <IconMail size={15} className="text-white/40 shrink-0" />
                          <span className="truncate max-w-xs">{p.email || "—"}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-5 px-6 border-r border-white/15 text-sm font-medium text-white/70 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <IconPhone size={15} className="text-white/40 shrink-0" />
                          <span className="whitespace-nowrap">
                            {p.primaryPhone || p.phone || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Linked Players */}
                      <td className="py-5 px-6 border-r border-white/15 text-center">
                        {p.linkedPlayers && p.linkedPlayers.length > 0 ? (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => setViewingPlayersParent(p)}
                              className="inline-flex items-center gap-2 bg-white/5 hover:bg-[#E31B23]/15 border border-white/15 hover:border-[#E31B23]/40 rounded-xl px-3.5 py-2 text-xs font-bold text-white transition-all cursor-pointer group shadow-sm active:scale-95"
                              title="Click to view linked players"
                            >
                              <IconEye
                                size={16}
                                className="text-[#00FF62] group-hover:text-[#E31B23] transition-colors"
                              />
                              <span>
                                {p.linkedPlayers.length === 1
                                  ? p.linkedPlayers[0].name
                                  : `${p.linkedPlayers.length} Linked Players`}
                              </span>
                              {p.linkedPlayers.length === 1 && p.linkedPlayers[0].position && (
                                <span className="text-[10px] font-black text-[#00FF62]">
                                  ({p.linkedPlayers[0].position})
                                </span>
                              )}
                              {p.linkedPlayers.length > 1 && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white/10 text-white/70 group-hover:bg-[#E31B23]/25 group-hover:text-white transition-all">
                                  View
                                </span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40 italic">No players linked</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Message Button */}
                          <button
                            onClick={() => {
                              setMessagingParent(p);
                              setMessageText("");
                            }}
                            className="h-9 px-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer font-bold active:scale-95"
                            title="Send Message"
                          >
                            <IconMessage size={16} className="text-[#00FF62]" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                              Message
                            </span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="size-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer font-bold active:scale-95"
                            title="Edit Parent"
                          >
                            <IconPencil size={16} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setParentToDelete(p)}
                            className="size-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer font-bold active:scale-95"
                            title="Delete Parent"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">
              Showing Page {page} of {totalPages} ({totalCount} total parents)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <IconChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={`page-btn-${pNum}`}
                      onClick={() => setPage(pNum)}
                      className={cn(
                        "size-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        page === pNum
                          ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/30"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Parent Modal (Register Form Styled) */}
      <DashboardModal
        isOpen={showFormModal}
        onClose={() => {
          if (!isSaving) {
            setShowFormModal(false);
          }
        }}
        title={editingParent ? "Edit Parent Information" : "Register New Parent / Guardian"}
        subtitle={
          editingParent
            ? "Update parent guardian details and linked academy players"
            : "Complete the registration form to create and link a parent account"
        }
        showBackButton
        maxWidth="max-w-4xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 w-full">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/25 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>{editingParent ? "Updating Parent..." : "Registering..."}</span>
                </>
              ) : (
                <>
                  {editingParent ? <IconCheck size={18} /> : <IconPlus size={18} />}
                  <span>{editingParent ? "Save Changes" : "Register Parent"}</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-4">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Personal Information
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>First Name</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Robert"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.firstName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.firstName}</span>
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Last Name</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Silva"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.lastName
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.lastName}</span>
                  </p>
                )}
              </div>

              {/* Relationship */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Relationship</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-10 py-3.5 rounded-xl border bg-[#161a18] text-white font-medium text-sm appearance-none focus:outline-none transition-all shadow-inner cursor-pointer",
                      errors.relationship
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  >
                    {RELATIONSHIP_OPTIONS.map((rel) => (
                      <option key={rel} value={rel} className="bg-[#161a18] text-white">
                        {rel}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  />
                </div>
                {errors.relationship && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.relationship}</span>
                  </p>
                )}
              </div>

              {/* Occupation */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Occupation (Optional)
                </label>
                <div className="relative group">
                  <IconBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                    placeholder="e.g. Civil Engineer / Architect"
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT INFORMATION */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Contact Information
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. parent@example.com"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Primary Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Primary Phone</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="primaryPhone"
                    value={formData.primaryPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 234-5678"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.primaryPhone
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.primaryPhone && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.primaryPhone}</span>
                  </p>
                )}
              </div>

              {/* Alternate Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Alternate Phone (Optional)
                </label>
                <div className="relative group">
                  <IconPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 876-5432"
                    disabled={isSaving}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: RESIDENTIAL ADDRESS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Residential Address
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Street Address */}
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Street Address</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    placeholder="e.g. 123 Oak Street, Apt 4B"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.streetAddress
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.streetAddress && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.streetAddress}</span>
                  </p>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>City</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Springfield"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.city
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.city}</span>
                  </p>
                )}
              </div>

              {/* ZIP / Postal Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>ZIP / Postal Code</span>
                  <span className="text-[#E31B23] font-black">*</span>
                </label>
                <div className="relative group">
                  <IconMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 10001"
                    disabled={isSaving}
                    className={cn(
                      "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner",
                      errors.zipCode
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                    )}
                  />
                </div>
                {errors.zipCode && (
                  <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                    <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                    <span>{errors.zipCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: LINKED PLAYERS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Linked Academy Players
                </h3>
                <span className="text-[#E31B23] font-black">*</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
                Select player(s) this parent/guardian is responsible for
              </p>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white">
                {selectedPlayerIds.length} player{selectedPlayerIds.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            {/* Modal Player Search Bar */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search academy players by name, position or team..."
                value={playerModalSearch}
                onChange={(e) => setPlayerModalSearch(e.target.value)}
                className="w-full bg-[#161a18] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
              />
            </div>

            {/* Error Message for Linked Players */}
            {errors.linkedPlayerIds && (
              <p className="text-red-500 text-xs font-bold tracking-wide flex items-center gap-1.5 -mt-1">
                <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                <span>{errors.linkedPlayerIds}</span>
              </p>
            )}

            {/* Players List */}
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 pr-2 custom-scrollbar rounded-2xl border",
                errors.linkedPlayerIds ? "border-red-500/40" : "border-white/10"
              )}
            >
              {isRosterLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`modal-player-skel-${idx}`}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center gap-3"
                  >
                    <div className="size-4 bg-white/10 rounded" />
                    <div className="size-10 rounded-full bg-white/10" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 w-28 bg-white/10 rounded" />
                      <div className="h-2.5 w-16 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredModalPlayers.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-white/40 font-medium">
                  {playerModalSearch
                    ? `No academy player matches "${playerModalSearch}"`
                    : "No academy players available to link."}
                </div>
              ) : (
                filteredModalPlayers.map((player) => {
                  const isSelected = selectedPlayerIds.includes(player._id);

                  return (
                    <div
                      key={player._id}
                      onClick={() => {
                        if (!isSaving) {
                          handleTogglePlayer(player._id);
                        }
                      }}
                      className={cn(
                        "rounded-xl p-3 flex items-center gap-3 border transition-all cursor-pointer group select-none",
                        isSelected
                          ? "bg-[#E31B23]/15 border-[#E31B23] shadow-md shadow-[#E31B23]/10"
                          : "bg-[#161a18] border-white/15 hover:border-white/30"
                      )}
                    >
                      <div
                        className={cn(
                          "size-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                          isSelected
                            ? "bg-[#E31B23] border-[#E31B23] text-white"
                            : "border-white/20 bg-white/5 group-hover:border-white/40"
                        )}
                      >
                        {isSelected && <IconCheck size={14} className="stroke-[3]" />}
                      </div>

                      <div className="size-10 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#111111]">
                        <Image
                          src={player.avatar || "/placeholder_img.jpg"}
                          alt={player.fullName}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "";
                            target.src = "/placeholder_img.jpg";
                          }}
                        />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-white truncate">
                          {player.fullName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-white/50">
                          <span className="font-bold text-[#00FF62] uppercase tracking-wider">
                            {player.position}
                          </span>
                          {player.teamName && (
                            <>
                              <span>•</span>
                              <span className="truncate">{player.teamName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 5: ADDITIONAL NOTES */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Additional Notes
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Notes &amp; Communication Preferences (Optional)
              </label>
              <div className="relative group">
                <IconFileText className="absolute left-3.5 top-4 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Available for weekend matches only. Prefers WhatsApp notifications for urgent updates..."
                  disabled={isSaving}
                  className="w-full h-24 pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20 transition-all shadow-inner resize-none custom-scrollbar"
                />
              </div>
            </div>
          </div>
        </form>
      </DashboardModal>

      {/* Delete Parent Confirmation Modal */}
      <DashboardModal
        isOpen={Boolean(parentToDelete)}
        onClose={() => {
          if (!isDeleting) {
            setParentToDelete(null);
          }
        }}
        title="Confirm Parent Deletion"
        subtitle="This action will remove the parent record from the academy database"
        maxWidth="max-w-lg"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <button
              onClick={() => setParentToDelete(null)}
              disabled={isDeleting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconTrash size={16} />
                  <span>Delete Parent</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <IconAlertCircle size={28} className="shrink-0 text-red-500" />
            <div className="text-xs">
              <p className="font-bold text-white text-sm">
                Delete &ldquo;
                {parentToDelete?.name ||
                  `${parentToDelete?.firstName || ""} ${parentToDelete?.lastName || ""}`.trim()}
                &rdquo;?
              </p>
              <p className="mt-1 text-white/70">
                Are you sure you want to permanently delete this parent? They will be unlinked from
                all players and lose portal access.
              </p>
            </div>
          </div>
        </div>
      </DashboardModal>

      {/* Quick Message Modal */}
      <DashboardModal
        isOpen={Boolean(messagingParent)}
        onClose={() => setMessagingParent(null)}
        title={`Message ${messagingParent?.firstName || "Parent"}`}
        subtitle={`Send an update or notification to ${messagingParent?.email || "this parent"}`}
        maxWidth="max-w-lg"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <button
              onClick={() => setMessagingParent(null)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer"
            >
              <IconSend size={16} />
              <span>Send Message</span>
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Message Content
            </label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message, tournament update, or practice reminder here..."
              rows={4}
              className="w-full bg-[#161a18] border border-white/15 rounded-xl p-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all resize-none"
            />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <IconMail size={14} className="text-[#00FF62]" />
            <span>
              Notification will be delivered to: <strong>{messagingParent?.email}</strong>
            </span>
          </div>
        </div>
      </DashboardModal>

      {/* View Linked Players Modal */}
      <DashboardModal
        isOpen={Boolean(viewingPlayersParent)}
        onClose={() => setViewingPlayersParent(null)}
        title={`Linked Players (${viewingPlayersParent?.linkedPlayers?.length || 0})`}
        subtitle={`Parent: ${
          viewingPlayersParent?.name ||
          `${viewingPlayersParent?.firstName || ""} ${viewingPlayersParent?.lastName || ""}`.trim() ||
          "Parent"
        } • ${viewingPlayersParent?.relationship || "Guardian"}`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex justify-end w-full">
            <button
              onClick={() => setViewingPlayersParent(null)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {viewingPlayersParent?.linkedPlayers?.map((player, idx) => (
              <div
                key={player._id || player.id || idx}
                className="bg-[#161a18] border border-white/15 hover:border-white/30 rounded-2xl p-4 flex items-center gap-3.5 transition-all shadow-md group"
              >
                <div className="size-12 rounded-full overflow-hidden border border-white/20 shrink-0 bg-[#111111] relative">
                  <Image
                    src={player.avatar || "/placeholder_img.jpg"}
                    alt={player.name || "Player"}
                    width={48}
                    height={48}
                    unoptimized
                    className="size-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = "";
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-black text-white truncate">
                      {player.name || "Player"}
                    </span>
                    {player.position && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#00FF62]/15 text-[#00FF62] border border-[#00FF62]/30 shrink-0">
                        {player.position}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/50 mt-1 flex-wrap">
                    {player.teamName && (
                      <span className="font-semibold text-white/80">
                        {player.teamName}
                      </span>
                    )}
                    {(player.age || player.ageValue) && (
                      <>
                        <span>•</span>
                        <span>{player.age || `${player.ageValue} yrs`}</span>
                      </>
                    )}
                  </div>

                  {player.relationshipType && (
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">
                      Relationship: {player.relationshipType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DashboardModal>
    </div>
  );
};

export default ParentsManagement;