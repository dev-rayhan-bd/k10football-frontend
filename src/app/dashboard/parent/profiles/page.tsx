"use client";

import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconBallFootball,
  IconAward,
  IconShield,
  IconPencil,
  IconChevronDown,
  IconRefresh,
  IconAlertTriangle,
  IconLoader2,
  IconUserOff,
} from "@tabler/icons-react";
import {
  useGetMyChildrenQuery,
  useUpdateChildProfileMutation,
} from "@/redux/features/parent/parentApi";
import { ILinkedChild } from "@/types/parent.type";
import { cn } from "@/lib/utils";

interface ChildProfileForm {
  fullName: string;
  dob: string;
  height: number | string;
  weight: number | string;
  position: string;
  preferredFoot: string;
  academyLocation: string;
}

const standardPositions = [
  "Center Back (CB)",
  "Forward / Striker",
  "Forward",
  "Striker",
  "Midfielder",
  "Defender",
  "Goalkeeper",
  "Left Wing (LW)",
  "Right Wing (RW)",
  "Attacking Midfielder (CAM)",
  "Defensive Midfielder (CDM)",
  "Full Back (LB/RB)",
];

const formatForDateInput = (val?: string | null): string => {
  if (!val) return "";
  try {
    if (val.includes("T")) {
      return val.split("T")[0];
    }
    return val;
  } catch {
    return "";
  }
};

const getTierBadgeStyle = (tier?: string) => {
  const t = (tier || "BRONZE").toUpperCase();
  switch (t) {
    case "GOLD":
      return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    case "SILVER":
      return "bg-slate-300/10 border-slate-300/30 text-slate-300";
    case "BRONZE":
    default:
      return "bg-amber-600/10 border-amber-600/30 text-amber-500";
  }
};

const ManageChildProfile = () => {
  // Query: GET {{baseUrl}}/parents/my-children
  const {
    data: childrenResponse,
    isLoading,
    isError,
    refetch,
  } = useGetMyChildrenQuery();

  const [updateChildProfile, { isLoading: isUpdating }] =
    useUpdateChildProfileMutation();

  const children: ILinkedChild[] = childrenResponse?.data || [];

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Safely pick currently selected child
  const activeIndex =
    selectedIndex < children.length ? selectedIndex : 0;
  const selectedChild: ILinkedChild | undefined = children[activeIndex];

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChildProfileForm>({
    defaultValues: {
      fullName: "",
      dob: "",
      height: "",
      weight: "",
      position: "Center Back (CB)",
      preferredFoot: "RIGHT",
      academyLocation: "",
    },
  });

  // Sync selectedChild into form whenever selection or data updates
  useEffect(() => {
    if (selectedChild) {
      reset({
        fullName: selectedChild.fullName || "",
        dob: formatForDateInput(selectedChild.dateOfBirth),
        height: selectedChild.height ?? "",
        weight: selectedChild.weight ?? "",
        position: selectedChild.position || "Center Back (CB)",
        preferredFoot: (selectedChild.preferredFoot || "RIGHT").toUpperCase(),
        academyLocation:
          selectedChild.academyLocation || selectedChild.academy || "",
      });
    }
  }, [selectedChild, reset]);

  const onSubmit = async (formData: ChildProfileForm) => {
    if (!selectedChild) return;
    const childId = selectedChild.childPlayerId || selectedChild.linkId;

    const payload = {
      fullName: formData.fullName,
      dateOfBirth: formData.dob ? new Date(formData.dob).toISOString() : null,
      height: Number(formData.height) || undefined,
      weight: Number(formData.weight) || undefined,
      preferredFoot: formData.preferredFoot,
      position: formData.position,
      academyLocation: formData.academyLocation,
      academy: formData.academyLocation,
    };

    try {
      await updateChildProfile({
        childPlayerId: childId,
        data: payload,
      }).unwrap();
      setIsEditing(false);
      refetch();
    } catch {
      // Optimistic UX or fallback
      setIsEditing(false);
    }
  };

  // Compile unique position options including child's current position
  const childPosition = selectedChild?.position;
  const positionOptions = useMemo(() => {
    const list = [...standardPositions];
    if (childPosition && !list.includes(childPosition)) {
      list.unshift(childPosition);
    }
    return list;
  }, [childPosition]);

  const isVerified = Boolean(
    selectedChild?.isCvVerified ||
      selectedChild?.isVerified ||
      selectedChild?.isVerifiedByCoach
  );

  const cvTier = (selectedChild?.cvTier || "BRONZE").toUpperCase();
  const coachName =
    selectedChild?.coachesAssigned ||
    selectedChild?.coachName ||
    selectedChild?.assignedCoach?.name ||
    "—";

  const academyName =
    selectedChild?.academy ||
    selectedChild?.academyLocation ||
    selectedChild?.currentClub ||
    "—";

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12 min-w-0">
      {/* Header with Title and Child Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            Child <span className="text-[#00FF62] italic">Profiles</span>
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
            Manage your children&apos;s details, CV stats, and positions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          {/* Child Selector Dropdown if multiple children */}
          {children.length > 1 && (
            <div className="relative">
              <select
                value={activeIndex}
                onChange={(e) => {
                  setSelectedIndex(Number(e.target.value));
                  setIsEditing(false);
                }}
                className="appearance-none bg-white/5 border border-white/10 hover:border-white/25 text-white rounded-xl px-4 py-2.5 pr-10 text-xs font-bold font-orbitron cursor-pointer focus:outline-none focus:border-[#00FF62]/50 transition-all"
              >
                {children.map((child, idx) => (
                  <option
                    key={child.childPlayerId || child.linkId || idx}
                    value={idx}
                    className="bg-[#111111] text-white"
                  >
                    {child.fullName} ({child.position})
                  </option>
                ))}
              </select>
              <IconChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {!isEditing && children.length > 0 && (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
            >
              <IconPencil size={16} />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          {/* Left Card Skeleton */}
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-8 rounded-3xl flex flex-col items-center gap-6">
            <div className="size-32 rounded-full bg-white/10" />
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="h-6 w-44 rounded bg-white/10" />
              <div className="h-3 w-24 rounded bg-white/5" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-full bg-white/10" />
              <div className="h-6 w-24 rounded-full bg-white/10" />
            </div>
            <div className="w-full border-t border-white/5 pt-6 flex flex-col gap-4">
              <div className="h-4 w-3/4 rounded bg-white/5" />
              <div className="h-4 w-2/3 rounded bg-white/5" />
            </div>
          </div>

          {/* Right Card Skeleton */}
          <div className="lg:col-span-2 bg-[#0D0D0D]/60 border border-white/10 p-8 rounded-3xl flex flex-col gap-6">
            <div className="h-6 w-40 rounded bg-white/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-11 rounded-xl bg-white/5" />
              <div className="h-11 rounded-xl bg-white/5" />
            </div>
          </div>
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">
            Failed to load child profiles
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
      ) : children.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-white/10 rounded-2xl bg-white/1">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <IconUserOff size={28} />
          </div>
          <p className="text-base font-bold text-white uppercase tracking-wider font-orbitron">
            No Linked Children Found
          </p>
          <p className="text-xs text-white/40 max-w-sm">
            There are currently no child athlete profiles linked to your parent account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Card: Profile Overview & Badges */}
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-8 rounded-3xl shadow-xl flex flex-col gap-6 items-center text-center">
            {/* Avatar with Verification / Award Icon */}
            <div className="relative">
              <div className="relative size-32 rounded-full overflow-hidden border-4 border-[#00FF62]/20 bg-white/5 shrink-0">
                <Image
                  src={selectedChild?.profileImage || "/placeholder_img.jpg"}
                  alt={selectedChild?.fullName || "Child Avatar"}
                  fill
                  sizes="128px"
                  unoptimized
                  className="object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/placeholder_img.jpg";
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 size-8 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-[#0A0A0A] text-black shadow-md">
                <IconAward size={18} />
              </span>
            </div>

            {/* Name & Position */}
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-white font-orbitron tracking-wide">
                {selectedChild?.fullName}
              </h2>
              <p className="text-xs text-[#00FF62] font-bold uppercase tracking-widest">
                {selectedChild?.position}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                className={cn(
                  "border font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider",
                  getTierBadgeStyle(cvTier)
                )}
              >
                {cvTier} PROFILE
              </Badge>

              {isVerified ? (
                <Badge className="bg-green-500/10 border-green-500/30 text-green-400 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  VERIFIED CV
                </Badge>
              ) : (
                <Badge className="bg-white/5 border-white/10 text-white/50 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  PENDING VERIFICATION
                </Badge>
              )}
            </div>

            {/* Academy & Coach Information */}
            <div className="w-full border-t border-white/5 pt-6 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IconBallFootball size={18} className="text-[#00FF62] shrink-0" />
                <span className="truncate">
                  Academy:{" "}
                  <strong className="text-white font-medium">{academyName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <IconShield size={18} className="text-[#00FF62] shrink-0" />
                <span className="truncate">
                  Coaches Assigned:{" "}
                  <strong className="text-white font-medium">{coachName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Card: Profile Details Form */}
          <div className="lg:col-span-2 bg-[#0D0D0D]/60 border border-white/10 p-8 rounded-3xl shadow-xl min-w-0 flex flex-col gap-6">
            <h2 className="text-xl font-black uppercase text-white font-orbitron tracking-wide">
              {isEditing ? "Edit Profile Info" : "PROFILE DETAILS"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Row 1: Full Name & DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    {...register("fullName", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    {...register("dob")}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed scheme-dark font-medium"
                  />
                </div>
              </div>

              {/* Row 2: Height, Weight, Preferred Foot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    {...register("height")}
                    placeholder="180"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    {...register("weight")}
                    placeholder="75"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Preferred Foot
                  </label>
                  <select
                    disabled={!isEditing}
                    {...register("preferredFoot")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
                  >
                    <option value="RIGHT" className="bg-[#111111] text-white">
                      Right Foot
                    </option>
                    <option value="LEFT" className="bg-[#111111] text-white">
                      Left Foot
                    </option>
                    <option value="BOTH" className="bg-[#111111] text-white">
                      Both Feet
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 3: Position & Academy Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Position
                  </label>
                  <select
                    disabled={!isEditing}
                    {...register("position")}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium cursor-pointer"
                  >
                    {positionOptions.map((pos) => (
                      <option
                        key={pos}
                        value={pos}
                        className="bg-[#111111] text-white"
                      >
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                    Academy Location
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    {...register("academyLocation")}
                    placeholder="Academy Location"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#00FF62]/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Actions Footer when Editing */}
              {isEditing && (
                <div className="flex items-center gap-4 pt-6 mt-4 justify-end border-t border-white/5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (selectedChild) {
                        reset({
                          fullName: selectedChild.fullName || "",
                          dob: formatForDateInput(selectedChild.dateOfBirth),
                          height: selectedChild.height ?? "",
                          weight: selectedChild.weight ?? "",
                          position: selectedChild.position || "Center Back (CB)",
                          preferredFoot: (selectedChild.preferredFoot || "RIGHT").toUpperCase(),
                          academyLocation:
                            selectedChild.academyLocation ||
                            selectedChild.academy ||
                            "",
                        });
                      }
                    }}
                    className="h-11 px-6 rounded-xl border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUpdating}
                    className="h-11 bg-[#E31B23] hover:bg-[#C2181F] text-white px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#E31B23]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting || isUpdating ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageChildProfile;
