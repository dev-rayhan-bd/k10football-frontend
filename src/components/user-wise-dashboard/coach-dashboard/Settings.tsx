/* eslint-disable react-hooks/incompatible-library */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  IconUser, 
  IconLock, 
  IconBell,
  IconLoader2,
  IconDeviceFloppy,
  IconBuildingBank,
  IconCreditCard,
  IconCheck,
  IconAlertCircle,
  IconRefresh,
  IconArrowUpRight,
  IconShieldCheck,
  IconCoins,
  IconWallet,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  SettingsSection, 
  SettingsInput, 
  SettingsToggle 
} from "@/components/dashboard/DashboardSettingsElements";
import NotificationSettingsCard from "@/components/notifications/NotificationSettingsCard";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { 
  useGetMyCoachProfileQuery, 
  useUpdateMyCoachProfileMutation,
  useGetCoachStripeStatusQuery,
  useConnectCoachStripeMutation,
} from "@/redux/features/coach/coachApi";
import { WarningToast, SuccessToast, ErrorToast } from "@/helpers/ValidationHelper";

interface PersonalInfoFormValues {
  fullName: string;
  email: string;
  phone: string;
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  // 1. Coach Profile API: Fetch coach profile from GET /coaches/me
  const { data: coachProfileResponse, isLoading: isProfileLoading } = useGetMyCoachProfileQuery();
  const [updateCoachProfile, { isLoading: isUpdatingProfile }] = useUpdateMyCoachProfileMutation();
  const profileData = coachProfileResponse?.data;

  // 2. Change Password API
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // 3. Coach Stripe Connect Payout API
  const { 
    data: stripeStatusResponse, 
    isLoading: isStripeLoading,
    isFetching: isStripeFetching,
    refetch: refetchStripeStatus 
  } = useGetCoachStripeStatusQuery();
  const [connectCoachStripe, { isLoading: isConnectingStripe }] = useConnectCoachStripeMutation();
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
      const res = await connectCoachStripe().unwrap();
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

  // Personal Information Form
  const {
    register: registerPersonalInfo,
    handleSubmit: handlePersonalInfoSubmit,
    reset: resetPersonalInfo,
    watch: watchPersonalInfo,
    formState: { errors: personalInfoErrors },
  } = useForm<PersonalInfoFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  // Security Form
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

  // Track initial values to check for changes
  const initialFullName = profileData?.fullName || profileData?.userId?.name || "";
  const initialEmail = profileData?.userId?.email || profileData?.contact?.email || "";
  const initialPhone = profileData?.userId?.phone || profileData?.contact?.phone || "";

  // Populate Personal Information Form when profileData arrives
  useEffect(() => {
    if (profileData) {
      resetPersonalInfo({
        fullName: initialFullName,
        email: initialEmail,
        phone: initialPhone,
      });
    }
  }, [profileData, initialFullName, initialEmail, initialPhone, resetPersonalInfo]);

  const watchedFullName = watchPersonalInfo("fullName") ?? "";
  const watchedPhone = watchPersonalInfo("phone") ?? "";

  const hasChanges = Boolean(
    profileData &&
    (
      watchedFullName.trim() !== initialFullName.trim() ||
      watchedPhone.trim() !== initialPhone.trim()
    )
  );

  const onPersonalInfoSubmit = async (data: PersonalInfoFormValues) => {
    if (isUpdatingProfile) return;

    if (!hasChanges) {
      WarningToast("No changes detected to save");
      return;
    }

    // Prepare update payload
    const payload: Record<string, unknown> = {};

    if (data.fullName.trim() !== initialFullName.trim()) {
      payload.fullName = data.fullName.trim();
      payload.personalInformation = {
        fullName: data.fullName.trim(),
      };
    }

    if (data.phone.trim() !== initialPhone.trim()) {
      payload.phone = data.phone.trim();
      payload.contact = {
        phone: data.phone.trim(),
        email: data.email,
      };
    }

    try {
      await updateCoachProfile(payload).unwrap();
    } catch {
      // Error handled by onQueryStarted toast notification
    }
  };

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
      // Error handled by authApi toast notification
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase leading-none">
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Personal Information */}
        <SettingsSection 
          title="Personal Information" 
          icon={<IconUser size={20} />}
          className="relative"
        >
          {isProfileLoading && !profileData && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-xl sm:rounded-2xl z-10">
              <div className="flex items-center gap-2 text-foreground text-xs font-bold">
                <IconLoader2 className="size-5 animate-spin text-primary" /> Loading personal information...
              </div>
            </div>
          )}

          <form onSubmit={handlePersonalInfoSubmit(onPersonalInfoSubmit)} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <SettingsInput 
                label="Full Name" 
                placeholder="Coach Full Name" 
                required
                error={personalInfoErrors.fullName?.message}
                {...registerPersonalInfo("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters",
                  },
                })}
              />

              <SettingsInput 
                label="Phone" 
                placeholder="+1 201 555 0123" 
                error={personalInfoErrors.phone?.message}
                {...registerPersonalInfo("phone")}
              />

              <SettingsInput 
                label="Email" 
                type="email"
                placeholder="coach@example.com" 
                disabled
                className="md:col-span-2"
                {...registerPersonalInfo("email")}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile || !hasChanges}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="size-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* Payout Account (Stripe Connect) */}
        <SettingsSection 
          title="Payout Account (Stripe Connect)" 
          icon={<IconBuildingBank size={20} />}
          className="relative"
        >
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
            <div className="flex flex-col gap-6">
              {/* Account Status Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">Account Status:</span>
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
                      <Badge variant="outline" className="bg-white/5 text-muted-foreground border-white/10 flex items-center gap-1.5 font-orbitron text-[10px] tracking-wider uppercase">
                        <IconAlertCircle className="size-3" />
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stripeData?.message || (isStripeConnected
                      ? "Your Stripe Connect account is configured to receive automatic bank payouts."
                      : "Connect your Stripe account to receive automated commission payouts directly to your bank account.")}
                  </p>
                </div>

                {/* Status action / Refresh */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => refetchStripeStatus()}
                    disabled={isStripeFetching}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/10 transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh payout status"
                  >
                    <IconRefresh className={cn("size-4", isStripeFetching && "animate-spin text-primary")} />
                  </button>

                  <button
                    type="button"
                    onClick={handleConnectStripe}
                    disabled={isConnectingStripe || isRedirecting}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
                  </button>
                </div>
              </div>

              {/* Account Details & Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-orbitron">
                    Stripe Account ID
                  </span>
                  <div className="flex items-center gap-2">
                    <IconShieldCheck className={cn("size-4", stripeAccountId ? "text-[#00FF62]" : "text-muted-foreground")} />
                    <span className="text-xs font-mono font-bold text-foreground truncate">
                      {stripeAccountId || "Not Generated Yet"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-orbitron">
                    Bank Transfers / Payouts
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", isPayoutsEnabled ? "bg-[#00FF62]" : "bg-muted-foreground")} />
                    <span className="text-xs font-bold text-foreground">
                      {isPayoutsEnabled ? "Enabled (Direct Bank Transfers Active)" : "Disabled (Pending Setup)"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-orbitron">
                    Verification & KYC
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", stripeData?.detailsSubmitted ? "bg-[#00FF62]" : "bg-amber-400")} />
                    <span className="text-xs font-bold text-foreground">
                      {stripeData?.detailsSubmitted ? "Details Submitted & Verified" : "Onboarding Incomplete"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Overview / Payout Summary Cards */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground font-orbitron">
                  Commission & Payout Overview
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Commission */}
                  <div className="bg-linear-to-b from-white/4 to-white/1 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Total Commission
                      </span>
                      <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <IconCoins className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-orbitron text-foreground">
                      £{payoutSummary?.totalEarnedCommission ?? 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Lifetime earned commission
                    </span>
                  </div>

                  {/* Total Transferred */}
                  <div className="bg-linear-to-b from-[#00FF62]/5 to-transparent border border-[#00FF62]/20 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Transferred to Bank
                      </span>
                      <div className="size-7 rounded-lg bg-[#00FF62]/10 text-[#00FF62] flex items-center justify-center">
                        <IconBuildingBank className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-orbitron text-[#00FF62]">
                      £{payoutSummary?.totalTransferredAmount ?? 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {payoutSummary?.transferredCount ?? 0} payouts successfully processed
                    </span>
                  </div>

                  {/* Pending Transfers */}
                  <div className="bg-linear-to-b from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Pending Transfers
                      </span>
                      <div className="size-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <IconWallet className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-orbitron text-amber-400">
                      £{payoutSummary?.pendingTransferAmount ?? 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {payoutSummary?.pendingTransferCount ?? 0} transfers in processing queue
                    </span>
                  </div>

                  {/* Charges & Status */}
                  <div className="bg-linear-to-b from-white/4 to-white/1 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Charges & Processing
                      </span>
                      <div className="size-7 rounded-lg bg-white/10 text-foreground flex items-center justify-center">
                        <IconCreditCard className="size-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black font-orbitron text-foreground">
                      {stripeData?.chargesEnabled ? "Active" : "Standard"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Direct Stripe charge capability
                    </span>
                  </div>
                </div>
              </div>

              {/* Informational Guidance Banner */}
              <div className="bg-white/2 border border-white/5 rounded-xl p-4 flex items-start gap-3">
                <IconShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Payouts are handled securely by <strong>Stripe Connect</strong>. When you click &quot;Connect with Stripe&quot;, you will be safely redirected to Stripe&apos;s hosted onboarding flow to verify your identity and specify your bank account details. Once verified, all commission payouts are deposited automatically to your bank account.
                </p>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={<IconLock size={20} />}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-6">
            <SettingsInput
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              required
              error={passwordErrors.oldPassword?.message}
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
            <SettingsInput
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              required
              error={passwordErrors.newPassword?.message}
              {...registerPassword("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "New password must be at least 6 characters",
                },
                validate: (value) =>
                  value !== watchPassword("oldPassword") ||
                  "New password cannot be the same as current password",
                onChange: () => {
                  if (watchPassword("confirmPassword")) {
                    triggerPassword("confirmPassword");
                  }
                },
              })}
            />
            <SettingsInput
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              required
              error={passwordErrors.confirmPassword?.message}
              {...registerPassword("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === watchPassword("newPassword") || "Passwords do not match",
              })}
            />
            
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isChangingPassword ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </SettingsSection>

        {/* Notifications */}
        <NotificationSettingsCard className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10!" />
      </div>
    </div>
  );
};

export default Settings;
