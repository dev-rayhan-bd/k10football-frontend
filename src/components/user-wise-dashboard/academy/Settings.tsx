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
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { 
  useGetMyAcademyProfileQuery, 
  useUpdateAcademyProfileMutation 
} from "@/redux/features/academy/academyApi";
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

      {/* Notifications */}
      <SettingsSection icon={IconBell} title="Notifications">
        <div className="flex flex-col gap-4">
           {[
             { title: "New video likes", desc: "Get notified when someone likes your video" },
             { title: "Profile views", desc: "Get notified when a club views your profile" }
           ].map((notif, i) => (
             <div key={i} className="bg-black/40 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                   <h4 className="text-white font-bold text-sm">{notif.title}</h4>
                   <p className="text-white/40 text-xs">{notif.desc}</p>
                </div>
                <Switch className="data-[state=checked]:bg-red-600" />
             </div>
           ))}
        </div>
      </SettingsSection>
    </div>
  );
};

export default AcademySettings;
