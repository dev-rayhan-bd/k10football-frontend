/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { 
  IconSchool, 
  IconLock, 
  IconCreditCard, 
  IconBell, 
  IconCalendar, 
  IconCircleCheck, 
  IconEye, 
  IconEyeOff, 
  IconLoader2,
  IconDeviceFloppy,
  IconBuildingBank,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconArrowUpRight,
  IconShieldCheck,
  IconCoins,
  IconWallet,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationSettingsCard } from "@/components/notifications/NotificationSettingsCard";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import {
  useGetMyAcademyProfileQuery,
  useUpdateAcademyProfileMutation,
  useGetAcademyStripeStatusQuery,
  useConnectAcademyStripeMutation,
  useUpdateAcademyFeeSettingsMutation,
} from "@/redux/features/academy/academyApi";
import { Switch } from "@/components/ui/switch";
import { WarningToast, SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";
import { cn } from "@/lib/utils";

interface AcademyInfoFormValues {
  name: string;
  establishedDate: string;
  nationality: string;
  contact: string;
  category: string;
  email: string;
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsSection = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-6 md:p-10 flex flex-col gap-6 md:gap-8 min-w-0 w-full max-w-full overflow-hidden">
    <div className="flex items-center gap-3">
       <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
          <Icon size={22} />
       </div>
       <h2 className="text-lg md:text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate">{title}</h2>
    </div>
    {children}
  </div>
);

const AcademySettings = () => {
  // Academy Profile API hooks
  const { data: profileResponse, isLoading: isProfileLoading, isFetching } = useGetMyAcademyProfileQuery();
  const [updateAcademyProfile, { isLoading: isUpdatingProfile }] = useUpdateAcademyProfileMutation();
  const profileData = profileResponse?.data;

  // Change Password API hook
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fee Settings state
  const [feeEnabled, setFeeEnabled] = useState(false);
  const [feeAmount, setFeeAmount] = useState("");
  const [feeTitle, setFeeTitle] = useState("");
  const [updateAcademyFeeSettings, { isLoading: isSavingFeeSettings }] = useUpdateAcademyFeeSettingsMutation();

  // Academy Stripe Connect Payout API hooks
  const { 
    data: stripeStatusResponse, 
    isLoading: isStripeLoading,
    isFetching: isStripeFetching,
    refetch: refetchStripeStatus 
  } = useGetAcademyStripeStatusQuery();
  const [connectAcademyStripe, { isLoading: isConnectingStripe }] = useConnectAcademyStripeMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const stripeData = stripeStatusResponse?.data;
  const isStripeConnected = Boolean(stripeData?.isConnected);
  const isPayoutsEnabled = Boolean(stripeData?.payoutsEnabled);
  const stripeAccountId = stripeData?.stripeAccountId;
  const accountStatus = stripeData?.accountStatus || (isStripeConnected ? "CONNECTED" : "NOT_CONNECTED");
  const payoutSummary = stripeData?.payoutSummary;

  // Handle returnUrl / refreshUrl query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("connect_status");
      if (statusParam === "return") {
        SuccessToast("Returned from Stripe onboarding! Updating your payout status...");
        refetchStripeStatus();
      } else if (statusParam === "refresh") {
        WarningToast("Stripe session was refreshed. You can continue onboarding anytime.");
        refetchStripeStatus();
      }
    }
  }, [refetchStripeStatus]);

  const handleConnectStripe = async () => {
    if (isConnectingStripe || isRedirecting) return;
    try {
      setIsRedirecting(true);
      const res = await connectAcademyStripe().unwrap();
      const onboardingUrl = res?.data?.onboardingUrl || res?.onboardingUrl;
      if (onboardingUrl) {
        SuccessToast("Redirecting to Stripe Connect onboarding...");
        window.location.href = onboardingUrl;
      } else {
        setIsRedirecting(false);
        ErrorToast("Onboarding link not provided by server");
      }
    } catch {
      setIsRedirecting(false);
    }
  };

  // Academy Information Form
  const {
    register: registerAcademyInfo,
    handleSubmit: handleAcademyInfoSubmit,
    reset: resetAcademyInfo,
    formState: { errors: academyInfoErrors, isDirty: isAcademyInfoDirty },
  } = useForm<AcademyInfoFormValues>({
    defaultValues: {
      name: "",
      establishedDate: "",
      nationality: "",
      contact: "",
      category: "",
      email: "",
    },
    mode: "onChange",
  });

  // Populate Fee Settings when profile data arrives
  useEffect(() => {
    if (profileData) {
      const fs = profileData.feeSettings;
      setFeeEnabled(fs?.monthlyFeeEnabled ?? profileData.monthlyFeeEnabled ?? false);
      setFeeAmount(String(fs?.monthlyTrainingFee ?? profileData.monthlyTrainingFee ?? ""));
      setFeeTitle(fs?.monthlyFeeTitle ?? profileData.monthlyFeeTitle ?? "");
    }
  }, [profileData]);

  // Populate Academy Information form when profile data arrives
  useEffect(() => {
    if (profileData) {
      resetAcademyInfo({
        name: profileData.name || profileData.academyName || profileData.clubName || "",
        establishedDate:
          profileData.dateOfEstablishmentFormatted ||
          profileData.dateOfEstablishment ||
          profileData.establishedDate ||
          (profileData.foundedYear ? String(profileData.foundedYear) : ""),
        nationality:
          profileData.nationality ||
          profileData.location ||
          (profileData.city && profileData.country ? `${profileData.city}, ${profileData.country}` : "") ||
          profileData.country ||
          "",
        contact: profileData.contact || profileData.contactPhone || profileData.userId?.phone || "",
        category: profileData.academyCategory || profileData.category || profileData.estimatedAcademySize || "",
        email: profileData.email || profileData.contactEmail || profileData.userId?.email || "",
      });
    }
  }, [profileData, resetAcademyInfo]);

  // Submit Academy Information
  const onAcademyInfoSubmit = async (data: AcademyInfoFormValues) => {
    try {
      const formData = new FormData();
      const payload = {
        name: data.name.trim(),
        nationality: data.nationality.trim(),
        category: data.category.trim(),
        establishedDate: data.establishedDate.trim(),
        contact: data.contact.trim(),
        email: profileData?.email || data.email,
        description: profileData?.aboutAcademy?.description || profileData?.description || "",
        visionAndMission: profileData?.aboutAcademy?.visionAndMission || profileData?.visionAndMission || "",
        trainingPhilosophy: profileData?.aboutAcademy?.trainingPhilosophy || profileData?.trainingPhilosophy || "",
      };

      formData.append("data", JSON.stringify(payload));
      await updateAcademyProfile(formData).unwrap();
    } catch {
      // Toast notifications handled by academyApi onQueryStarted
    }
  };

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    watch: watchPassword,
    trigger: triggerPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onPasswordSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();

      resetPasswordForm();
    } catch {
      // Error notifications handled by authApi onQueryStarted toast notifications
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-10 md:pb-20 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">Settings</h1>
          <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">Manage your account and preferences</p>
        </div>
        {isFetching && !isProfileLoading && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <IconLoader2 className="animate-spin size-4 text-[#E31B23]" />
            <span>Syncing profile...</span>
          </div>
        )}
      </div>

      {/* Academy Information */}
      <SettingsSection icon={IconSchool} title="Academy Information">
        <form onSubmit={handleAcademyInfoSubmit(onAcademyInfoSubmit)} className="flex flex-col gap-6 w-full min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 min-w-0 w-full">
            {/* Academy Name */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                Academy Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="e.g. Santos FC Academy"
                  disabled={isProfileLoading}
                  className={cn(
                    "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                    academyInfoErrors.name && "border-red-500 focus:border-red-500"
                  )}
                  {...registerAcademyInfo("name", {
                    required: "Academy name is required",
                    minLength: {
                      value: 2,
                      message: "Academy name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {academyInfoErrors.name && (
                <p className="text-xs text-red-500 font-medium">{academyInfoErrors.name.message}</p>
              )}
            </div>

            {/* Date of Founded */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                Date of Founded <span className="text-red-500">*</span>
              </Label>
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="e.g. 01/01/2018"
                  disabled={isProfileLoading}
                  className={cn(
                    "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 pr-12 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                    academyInfoErrors.establishedDate && "border-red-500 focus:border-red-500"
                  )}
                  {...registerAcademyInfo("establishedDate", {
                    required: "Date of founded is required",
                  })}
                />
                <IconCalendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
              {academyInfoErrors.establishedDate && (
                <p className="text-xs text-red-500 font-medium">{academyInfoErrors.establishedDate.message}</p>
              )}
            </div>

            {/* Nationality */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                Nationality <span className="text-red-500">*</span>
              </Label>
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="e.g. São Paulo, Brazil"
                  disabled={isProfileLoading}
                  className={cn(
                    "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                    academyInfoErrors.nationality && "border-red-500 focus:border-red-500"
                  )}
                  {...registerAcademyInfo("nationality", {
                    required: "Nationality is required",
                  })}
                />
              </div>
              {academyInfoErrors.nationality && (
                <p className="text-xs text-red-500 font-medium">{academyInfoErrors.nationality.message}</p>
              )}
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                Contact <span className="text-red-500">*</span>
              </Label>
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="e.g. +55 11 9999-8888"
                  disabled={isProfileLoading}
                  className={cn(
                    "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                    academyInfoErrors.contact && "border-red-500 focus:border-red-500"
                  )}
                  {...registerAcademyInfo("contact", {
                    required: "Contact number is required",
                    pattern: {
                      value: /^[+]?[0-9\s\-()]{7,20}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                />
              </div>
              {academyInfoErrors.contact && (
                <p className="text-xs text-red-500 font-medium">{academyInfoErrors.contact.message}</p>
              )}
            </div>

            {/* Academy Category */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                Academy Category <span className="text-red-500">*</span>
              </Label>
              <div className="relative w-full">
                <Input 
                  type="text" 
                  placeholder="e.g. Premier League Academy"
                  disabled={isProfileLoading}
                  className={cn(
                    "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                    academyInfoErrors.category && "border-red-500 focus:border-red-500"
                  )}
                  {...registerAcademyInfo("category", {
                    required: "Academy category is required",
                  })}
                />
              </div>
              {academyInfoErrors.category && (
                <p className="text-xs text-red-500 font-medium">{academyInfoErrors.category.message}</p>
              )}
            </div>

            {/* Email - Disabled & Read-only per requirements */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
              <div className="flex items-center justify-between">
                <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                  Email
                </Label>
                <span className="text-[10px] text-white/40 font-medium">Read-only</span>
              </div>
              <div className="relative w-full">
                <Input 
                  type="email" 
                  placeholder="e.g. academy@example.com"
                  disabled={true}
                  readOnly={true}
                  className="bg-black/20 border-white/10 h-14 rounded-xl px-4 md:px-6 text-white/50 placeholder:text-white/20 cursor-not-allowed opacity-75 w-full min-w-0" 
                  {...registerAcademyInfo("email")}
                />
              </div>
            </div>
          </div>

          {/* Action Bar with Save Changes button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50">
              {isAcademyInfoDirty ? (
                <span className="text-amber-400 font-semibold">• You have unsaved profile changes</span>
              ) : (
                "All academy profile information is up to date."
              )}
            </p>
            <Button
              type="submit"
              disabled={isUpdatingProfile || isProfileLoading}
              className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-8 h-12 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
            >
              {isUpdatingProfile ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </SettingsSection>

      {/* Payout Account (Stripe Connect) */}
      <SettingsSection icon={IconBuildingBank} title="Payout Account (Stripe Connect)">
        {isStripeLoading && !stripeData ? (
          <div className="flex flex-col gap-4 py-4 animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40 bg-white/10" />
                <Skeleton className="h-4 w-72 bg-white/5" />
              </div>
              <Skeleton className="h-8 w-28 bg-white/10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 bg-white/5 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full min-w-0">
            {/* Account Status Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white">Account Status:</span>
                  {isStripeConnected && isPayoutsEnabled ? (
                    <Badge variant="default" className="bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/30 flex items-center gap-1.5 font-orbitron text-[10px] tracking-wider uppercase">
                      <IconCheck className="size-3" />
                      Connected & Active
                    </Badge>
                  ) : accountStatus === "PENDING" || (isStripeConnected && !isPayoutsEnabled) ? (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 font-orbitron text-[10px] tracking-wider uppercase">
                      <IconAlertCircle className="size-3" />
                      Action Required (Pending Verification)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 flex items-center gap-1.5 font-orbitron text-[10px] tracking-wider uppercase">
                      <IconAlertCircle className="size-3" />
                      Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-white/60">
                  {stripeData?.message || (isStripeConnected
                    ? "Your academy Stripe Connect account is verified to receive automatic tournament fees and student payouts."
                    : "Connect your Stripe account to receive automated registration fees and payouts directly to your academy bank account.")}
                </p>
              </div>

              {/* Status action / Refresh */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => refetchStripeStatus()}
                  disabled={isStripeFetching}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                  title="Refresh payout status"
                >
                  <IconRefresh className={cn("size-4", isStripeFetching && "animate-spin text-[#E31B23]")} />
                </button>

                <Button
                  type="button"
                  onClick={handleConnectStripe}
                  disabled={isConnectingStripe || isRedirecting}
                  className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-6 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
                >
                  {isConnectingStripe || isRedirecting ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      Redirecting to Stripe...
                    </>
                  ) : isStripeConnected ? (
                    <>
                      <IconArrowUpRight className="size-4" />
                      Update Payout Account
                    </>
                  ) : (
                    <>
                      <IconArrowUpRight className="size-4" />
                      Connect with Stripe
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Account Details & Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                  Stripe Account ID
                </span>
                <div className="flex items-center gap-2">
                  <IconShieldCheck className={cn("size-4", stripeAccountId ? "text-[#00FF62]" : "text-white/40")} />
                  <span className="text-xs font-mono font-bold text-white truncate">
                    {stripeAccountId || "Not Generated Yet"}
                  </span>
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                  Bank Transfers / Payouts
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", isPayoutsEnabled ? "bg-[#00FF62]" : "bg-white/40")} />
                  <span className="text-xs font-bold text-white">
                    {isPayoutsEnabled ? "Enabled (Direct Bank Transfers Active)" : "Disabled (Pending Setup)"}
                  </span>
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                  Verification & KYC
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", stripeData?.detailsSubmitted ? "bg-[#00FF62]" : "bg-amber-400")} />
                  <span className="text-xs font-bold text-white">
                    {stripeData?.detailsSubmitted ? "Details Submitted & Verified" : "Onboarding Incomplete"}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Overview / Payout Summary Cards */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-orbitron">
                Commission & Payout Overview
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Commission */}
                <div className="bg-linear-to-b from-white/4 to-white/1 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Total Commission
                    </span>
                    <div className="size-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                      <IconCoins className="size-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-white">
                    £{payoutSummary?.totalEarnedCommission ?? 0}
                  </div>
                  <span className="text-[10px] text-white/40">
                    Lifetime earned academy earnings
                  </span>
                </div>

                {/* Total Transferred */}
                <div className="bg-linear-to-b from-[#00FF62]/5 to-transparent border border-[#00FF62]/20 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Transferred to Bank
                    </span>
                    <div className="size-7 rounded-lg bg-[#00FF62]/10 text-[#00FF62] flex items-center justify-center">
                      <IconBuildingBank className="size-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-[#00FF62]">
                    £{payoutSummary?.totalTransferredAmount ?? 0}
                  </div>
                  <span className="text-[10px] text-white/40">
                    {payoutSummary?.transferredCount ?? 0} payouts successfully processed
                  </span>
                </div>

                {/* Pending Transfers */}
                <div className="bg-linear-to-b from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Pending Transfers
                    </span>
                    <div className="size-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <IconWallet className="size-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-amber-400">
                    £{payoutSummary?.pendingTransferAmount ?? 0}
                  </div>
                  <span className="text-[10px] text-white/40">
                    {payoutSummary?.pendingTransferCount ?? 0} transfers in processing queue
                  </span>
                </div>

                {/* Charges & Status */}
                <div className="bg-linear-to-b from-white/4 to-white/1 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      Charges & Processing
                    </span>
                    <div className="size-7 rounded-lg bg-white/10 text-white flex items-center justify-center">
                      <IconCreditCard className="size-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black font-orbitron text-white">
                    {stripeData?.chargesEnabled ? "Active" : "Standard"}
                  </div>
                  <span className="text-[10px] text-white/40">
                    Direct Stripe charge capability
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Guidance Banner */}
            <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-start gap-3">
              <IconShieldCheck className="size-5 text-[#E31B23] shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed">
                Payouts are handled securely by <strong>Stripe Connect</strong>. When you click &quot;Connect with Stripe&quot;, you will be safely redirected to Stripe&apos;s hosted onboarding flow to verify your academy details and specify your bank account. Once verified, tournament fees and payouts are deposited automatically to your academy bank account.
              </p>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* Security */}
      <SettingsSection icon={IconLock} title="Security">
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-6 max-w-full">
          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
              Current Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative w-full">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={cn(
                  "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 pr-12 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                  passwordErrors.oldPassword && "border-red-500 focus:border-red-500"
                )}
                {...registerPassword("oldPassword", {
                  required: "Current password is required",
                  minLength: {
                    value: 6,
                    message: "Current password must be at least 6 characters",
                  },
                  onChange: () => {
                    if (watchPassword("newPassword")) {
                      triggerPassword("newPassword");
                    }
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showCurrentPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
            {passwordErrors.oldPassword && (
              <p className="text-xs text-red-500 font-medium">{passwordErrors.oldPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative w-full">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={cn(
                  "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 pr-12 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                  passwordErrors.newPassword && "border-red-500 focus:border-red-500"
                )}
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  validate: (val) =>
                    val !== watchPassword("oldPassword") ||
                    "New password cannot be the same as current password",
                  onChange: () => {
                    if (watchPassword("confirmPassword")) {
                      triggerPassword("confirmPassword");
                    }
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showNewPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="text-xs text-red-500 font-medium">{passwordErrors.newPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0 w-full">
            <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
              Confirm New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative w-full">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                className={cn(
                  "bg-black/40 border-white/20 h-14 rounded-xl px-4 md:px-6 pr-12 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
                  passwordErrors.confirmPassword && "border-red-500 focus:border-red-500"
                )}
                {...registerPassword("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (val) =>
                    val === watchPassword("newPassword") || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">{passwordErrors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-[#1A1A1A] border border-white/20 hover:bg-white/10 h-12 px-8 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isChangingPassword ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </SettingsSection>

      {/* Billing & Subscription */}
      <SettingsSection icon={IconCreditCard} title="Billing & Subscription">
        <div className="flex flex-col gap-6 w-full min-w-0">
           <div className="bg-black/40 border border-white/10 rounded-4xl p-6 md:p-8 flex flex-col gap-6 relative min-w-0">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                 <div>
                    <h3 className="text-lg md:text-xl font-black text-white font-orbitron uppercase">
                      {profileData?.plan?.tier === "ELITE" || profileData?.currentPlan === "ELITE" ? "Elite Plan" : "Free Plan"}
                    </h3>
                    <p className="text-white/40 text-sm font-medium mt-1">
                      {profileData?.plan?.tier === "ELITE" || profileData?.currentPlan === "ELITE" ? "$89 per month" : "Free Tier"}
                    </p>
                 </div>
                 <Link href="/dashboard/academy/management/my-subscription">
                   <Button variant="outline" className="w-full sm:w-auto bg-white/5 border-white/10 h-10 px-6 rounded-xl text-white/80 font-bold text-xs hover:bg-white/10 shrink-0 cursor-pointer">
                      Change Plan
                   </Button>
                 </Link>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-4 sm:gap-0">
                 <div className="flex flex-col gap-1">
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-wider">Plan Status</p>
                    <p className="text-white/80 font-medium">
                      {profileData?.tier || profileData?.activeStatus || "ACTIVE CLUB"}
                    </p>
                 </div>
                 <div className="flex flex-col gap-1 sm:text-right">
                    <p className="text-white/40 font-bold uppercase text-[10px] tracking-wider">Payment method</p>
                    <p className="text-white/80 font-medium flex items-center sm:justify-end gap-2">
                       •••• 4242 <IconCircleCheck size={16} className="text-emerald-500 shrink-0" />
                    </p>
                 </div>
              </div>
           </div>
           <div className="pt-2">
              <Link href="/dashboard/academy/management/my-subscription">
                <Button variant="outline" className="w-full sm:w-auto bg-transparent border-white/20 h-12 px-8 rounded-xl text-white/80 font-bold hover:bg-white/5 transition-all cursor-pointer">
                   Update Payment Method
                </Button>
              </Link>
           </div>
        </div>
      </SettingsSection>

      {/* Fee Settings */}
      <SettingsSection icon={IconCoins} title="Fee Settings">
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-white">Auto-generate monthly training fee invoices</span>
              <span className="text-xs text-white/40 leading-relaxed max-w-sm">
                When enabled, monthly training fee invoices are automatically generated for enrolled players.
              </span>
            </div>
            <Switch
              checked={feeEnabled}
              onCheckedChange={setFeeEnabled}
              className="shrink-0 mt-0.5"
            />
          </div>

          {feeEnabled && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                  Monthly Fee Amount (USD)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="e.g. 150"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="bg-black/40 border-white/20 h-12 rounded-xl px-4 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full max-w-xs"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-white/70 text-[11px] font-bold uppercase tracking-wider">
                  Invoice Title
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Monthly Training Fee – January 2026"
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="bg-black/40 border-white/20 h-12 rounded-xl px-4 text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full max-w-sm"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="button"
              disabled={isSavingFeeSettings}
              onClick={async () => {
                try {
                  await updateAcademyFeeSettings({
                    monthlyFeeEnabled: feeEnabled,
                    ...(feeEnabled && feeAmount ? { monthlyTrainingFee: Number(feeAmount) } : {}),
                    ...(feeEnabled && feeTitle.trim() ? { monthlyFeeTitle: feeTitle.trim() } : {}),
                  }).unwrap();
                } catch {
                  // Toast handled by API
                }
              }}
              className="bg-[#1A1A1A] border border-white/20 hover:bg-white/10 h-12 px-8 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSavingFeeSettings ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" /> Save Fee Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection icon={IconBell} title="Notifications">
        <NotificationSettingsCard showHeader={false} />
      </SettingsSection>
    </div>
  );
};

export default AcademySettings;
