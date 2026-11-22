/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  IconBuildingCommunity, 
  IconLock, 
  IconCreditCard,
  IconBell,
  IconCalendar,
  IconLoader2,
  IconDeviceFloppy
} from "@tabler/icons-react";
import { 
  SettingsSection, 
  SettingsInput, 
  SettingsToggle 
} from "@/components/dashboard/DashboardSettingsElements";
import NotificationSettingsCard from "@/components/notifications/NotificationSettingsCard";
import { Button } from "@/components/ui/button";
import { 
  useGetClubProfileQuery, 
  useUpdateClubProfileMutation 
} from "@/redux/features/club/clubApi";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ClubSettings = () => {
  // Query API: GET {{baseUrl}}/clubs/club-profile
  const { data: profileResponse, isLoading: isProfileLoading, isFetching } = useGetClubProfileQuery();
  const [updateClubProfile, { isLoading: isUpdatingProfile }] = useUpdateClubProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const profileData = profileResponse?.data;

  // Form states: Club Information
  const [clubName, setClubName] = useState("");
  const [dateOfEstablishment, setDateOfEstablishment] = useState("");
  const [nationality, setNationality] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState("");
  const [email, setEmail] = useState("");

  // Security Form (react-hook-form identical to Player Dashboard)
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    getValues: getPasswordValues,
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

  // Sync API data to form fields
  useEffect(() => {
    if (profileData) {
      setClubName(profileData.clubName || profileData.name || "");
      setDateOfEstablishment(
        profileData.dateOfEstablishment !== undefined && profileData.dateOfEstablishment !== null
          ? String(profileData.dateOfEstablishment)
          : profileData.establishedYear !== undefined && profileData.establishedYear !== null
          ? String(profileData.establishedYear)
          : ""
      );
      setNationality(profileData.clubCountry || profileData.country || "");
      setContact(profileData.contact || profileData.contactPhone || profileData.userId?.phone || "");
      setCategory(
        profileData.clubLeague ||
        profileData.league ||
        profileData.clubType ||
        profileData.bannerInfo?.category ||
        ""
      );
      setEmail(profileData.email || profileData.contactEmail || profileData.userId?.email || "");
    }
  }, [profileData]);

  // Handle Save Club Information
  const handleSaveClubInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      // Preserve existing profile data and merge updated fields
      const dataPayload = {
        clubName,
        name: clubName,
        clubCountry: nationality,
        country: nationality,
        clubLeague: category,
        league: category,
        dateOfEstablishment,
        establishedYear: dateOfEstablishment ? Number(dateOfEstablishment) || dateOfEstablishment : undefined,
        contact,
        contactPhone: contact,
        description: profileData?.description || profileData?.aboutClub?.description || "",
        visionAndMission: profileData?.visionAndMission || profileData?.aboutClub?.visionAndMission || "",
        achievements: profileData?.achievements || [],
        officialWebsite: profileData?.officialWebsite || profileData?.verification?.officialWebsite || "",
        footballAssociation: profileData?.footballAssociation || profileData?.verification?.footballAssociation || "",
        authorizedRepresentativeName:
          profileData?.authorizedRepresentativeName ||
          profileData?.verification?.authorizedRepresentativeName ||
          "",
        authorizedRepresentativeJobTitle:
          profileData?.authorizedRepresentativeJobTitle ||
          profileData?.verification?.authorizedRepresentativeJobTitle ||
          "",
      };

      formData.append("data", JSON.stringify(dataPayload));
      await updateClubProfile(formData).unwrap();
    } catch {
      // Toast notifications handled by clubApi onQueryStarted
    }
  };

  // Handle Password Submit (like Player Dashboard)
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
      // Toast notifications handled by authApi onQueryStarted without triggering Next.js dev overlay
    }
  };

  // Skeleton loading state
  if (isProfileLoading) {
    return (
      <div className="flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 min-w-0 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>
        <div className="h-72 w-full bg-white/5 rounded-2xl" />
        <div className="h-64 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const activePlanName = profileData?.tier || profileData?.activeStatus || "ACTIVE CLUB";

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-8 md:pb-12 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Settings</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Manage your club account and preferences</p>
        </div>
        {isFetching && !isProfileLoading && (
          <div className="flex items-center gap-2 text-xs text-white/50">
            <IconLoader2 className="animate-spin size-4 text-[#E31B23]" />
            <span>Syncing settings...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Section 1: Club Information */}
        <SettingsSection title="Club Information" icon={<IconBuildingCommunity size={20} />}>
          <form onSubmit={handleSaveClubInfo} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <SettingsInput 
                label="Club Name" 
                placeholder="e.g. Bashundhara Kings"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
              <SettingsInput 
                label="Date of Establishment" 
                placeholder="e.g. 2026"
                icon={<IconCalendar className="size-4.5" />}
                value={dateOfEstablishment}
                onChange={(e) => setDateOfEstablishment(e.target.value)}
              />
              <SettingsInput 
                label="Nationality" 
                placeholder="e.g. Bangladesh" 
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
              <SettingsInput 
                label="Contact" 
                placeholder="e.g. +8801733333333" 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <SettingsInput 
                label="Club Category" 
                placeholder="e.g. BPL (Premier League)" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              {/* Email field is disabled and readOnly per requirement */}
              <SettingsInput 
                label="Email" 
                placeholder="club@example.com" 
                value={email}
                disabled={true}
                readOnly={true}
                className="opacity-75"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#E31B23] text-white text-xs font-black uppercase tracking-widest hover:bg-[#C1161D] transition-all shadow-[0_10px_30px_rgba(227,27,35,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingProfile ? (
                  <>
                    <IconLoader2 className="animate-spin size-4" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="size-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </SettingsSection>

        {/* Section 2: Security / Password Change (Identical to Player Dashboard) */}
        <SettingsSection title="Security" icon={<IconLock size={20} />}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="max-w-2xl flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-5">
              <SettingsInput 
                label="Current Password" 
                type="password" 
                placeholder="••••••••"
                required
                error={passwordErrors.oldPassword?.message}
                {...registerPassword("oldPassword", {
                  required: "Current password is required",
                  minLength: {
                    value: 6,
                    message: "Current password must be at least 6 characters",
                  },
                  onChange: () => {
                    if (getPasswordValues("newPassword")) {
                      triggerPassword("newPassword");
                    }
                  },
                })}
              />
              <SettingsInput 
                label="New Password" 
                type="password" 
                placeholder="•••••••• (min 6 characters)"
                required
                error={passwordErrors.newPassword?.message}
                {...registerPassword("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                  validate: (value) =>
                    value !== getPasswordValues("oldPassword") ||
                    "New password cannot be the same as current password",
                  onChange: () => {
                    if (getPasswordValues("confirmPassword")) {
                      triggerPassword("confirmPassword");
                    }
                  },
                })}
              />
              <SettingsInput 
                label="Confirm New Password" 
                type="password" 
                placeholder="••••••••"
                required
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) =>
                    value === getPasswordValues("newPassword") || "Passwords do not match",
                })}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-8 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <IconLock className="size-4" />
                    <span>Update Password</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Section 3: Billing & Subscription */}
        <SettingsSection title="Billing & Subscription" icon={<IconCreditCard size={20} />}>
          <div className="flex flex-col gap-6">
            <div className="p-4 sm:p-6 rounded-xl border border-white/10 bg-white/2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex flex-col sm:flex-row sm:items-center">
                    {activePlanName} <span className="text-gray-500 font-medium sm:ml-2">($150/month)</span>
                  </h4>
                </div>
                <button 
                  type="button"
                  onClick={() => toast.info("Subscription management will open shortly")}
                  className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-lg bg-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/20 transition-all border border-white/10 whitespace-nowrap"
                >
                  Change Plan
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-widest">Next billing date</span>
                  <span className="text-white font-bold italic">July 15, 2026</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-widest">Payment method</span>
                  <span className="text-white font-bold italic">•••• 4242</span>
                </div>
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => toast.info("Payment method update will open shortly")}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/20 transition-all border border-white/10 self-start"
            >
              Update Payment Method
            </button>
          </div>
        </SettingsSection>

        {/* Section 4: Notifications */}
        <NotificationSettingsCard className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10!" />
      </div>
    </div>
  );
};

export default ClubSettings;
