/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  IconUser,
  IconLock,
  IconBell,
  IconDeviceFloppy,
  IconLoader2
} from "@tabler/icons-react";
import {
  SettingsSection,
  SettingsInput,
  SettingsToggle
} from "@/components/dashboard/DashboardSettingsElements";
import { Button } from "@/components/ui/button";
import NotificationSettingsCard from "@/components/notifications/NotificationSettingsCard";
import {
  useGetMyPlayerProfileQuery,
  useUpdateMyPlayerProfileMutation
} from "@/redux/features/player/playerApi";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { ErrorToast, WarningToast } from "@/helpers/ValidationHelper";

interface PersonalInfoFormValues {
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
}

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PlayerSettings = () => {
  // Fetch current player profile data
  const { data: profileResponse, isLoading: isProfileLoading } = useGetMyPlayerProfileQuery();
  const [updateMyPlayerProfile, { isLoading: isUpdatingProfile }] = useUpdateMyPlayerProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  // Personal Information Form (react-hook-form)
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    watch: watchProfile,
    formState: { errors: profileErrors },
  } = useForm<PersonalInfoFormValues>({
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  const watchedFullName = watchProfile("fullName") ?? "";
  const watchedDateOfBirth = watchProfile("dateOfBirth") ?? "";
  const watchedPhone = watchProfile("phone") ?? "";

  // Initial loaded values from API
  const initialFullName = profileResponse?.data?.fullName ?? "";
  const initialDateOfBirth = profileResponse?.data?.dateOfBirth ? profileResponse.data.dateOfBirth.slice(0, 10) : "";
  const initialPhone = profileResponse?.data?.phone ?? "";

  // Check if user made any actual modifications
  const hasChanges = Boolean(
    profileResponse?.data &&
    (
      watchedFullName.trim() !== initialFullName.trim() ||
      watchedDateOfBirth !== initialDateOfBirth ||
      watchedPhone.trim() !== initialPhone.trim()
    )
  );

  // Security Form (react-hook-form like login form)
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

  // Sync state from API data
  useEffect(() => {
    if (profileResponse?.data) {
      const p = profileResponse.data;
      resetProfileForm({
        fullName: p.fullName || "",
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
        email: p.email || "",
        phone: p.phone || "",
      });
    }
  }, [profileResponse, resetProfileForm]);

  const onProfileSubmit = (data: PersonalInfoFormValues) => {
    if (isUpdatingProfile) {
      return;
    }

    if (!hasChanges) {
      WarningToast("No changes detected to save");
      return;
    }

    // Prepare payload with only modified fields
    const payload: Record<string, any> = {};

    if (data.fullName.trim() !== initialFullName.trim()) {
      payload.fullName = data.fullName.trim();
    }

    if (data.dateOfBirth !== initialDateOfBirth) {
      payload.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined;
    }

    if (data.phone.trim() !== initialPhone.trim()) {
      payload.phone = data.phone.trim();
    }

    if (Object.keys(payload).length === 0) {
      WarningToast("No changes detected to save");
      return;
    }

      updateMyPlayerProfile(payload)
 
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
      // Handled by authApi onQueryStarted toast notifications
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading leading-none">
          Settings
        </h1>
        <p className="text-gray-400 text-sm sm:text-base md:text-lg font-light tracking-tight">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Personal Information */}
        <SettingsSection
          title="Personal Information"
          icon={<IconUser size={20} />}
          className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10! relative"
        >
          {isProfileLoading && !profileResponse && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-[30px] sm:rounded-[40px] z-10">
              <div className="flex items-center gap-2 text-white font-orbitron text-xs">
                <IconLoader2 className="size-5 animate-spin text-[#E31B23]" /> Loading profile...
              </div>
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              <SettingsInput
                label="Full Name"
                placeholder="Player Name"
                required
                error={profileErrors.fullName?.message}
                {...registerProfile("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters",
                  },
                })}
              />
              <SettingsInput
                label="Date Of Birth"
                isDate
                placeholder="YYYY-MM-DD"
                error={profileErrors.dateOfBirth?.message}
                {...registerProfile("dateOfBirth", {
                  validate: (value) => {
                    if (!value) return true;
                    const d = new Date(value);
                    if (isNaN(d.getTime())) return "Invalid date";
                    if (d > new Date()) return "Date of birth cannot be in the future";
                    return true;
                  },
                })}
              />
              <SettingsInput
                label="Email"
                type="email"
                placeholder="player@k10football.com"
                disabled={true}
                readOnly={true}
                error={profileErrors.email?.message}
                {...registerProfile("email")}
              />
              <SettingsInput
                label="Phone"
                placeholder="+44 7700 900000"
                error={profileErrors.phone?.message}
                {...registerProfile("phone", {
                  pattern: {
                    value: /^[0-9+\-()\s]*$/,
                    message: "Please enter a valid phone number",
                  },
                })}
              />
            </div>

            {/* Save Changes Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400">
                {hasChanges ? (
                  <span className="text-yellow-400 font-semibold">• You have unsaved profile changes</span>
                ) : (
                  "All personal profile information is up to date."
                )}
              </p>
              <Button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-8 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
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
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          title="Security"
          icon={<IconLock size={20} />}
          className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10!"
        >
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="w-full flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-5">
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
                    message: "Password must be at least 6 characters",
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
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-8 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <IconLock className="size-4" /> Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </SettingsSection>

        {/* Notifications */}
        <NotificationSettingsCard className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10!" />
      </div>
    </div>
  );
};

export default PlayerSettings;
