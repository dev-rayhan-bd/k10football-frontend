/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  IconCreditCard,
  IconUser,
  IconLock,
  IconBell,
  IconLoader2,
  IconDeviceFloppy,
  IconRefresh,
  IconAlertTriangle,
} from "@tabler/icons-react";
import {
  SettingsSection,
  SettingsInput,
} from "@/components/dashboard/DashboardSettingsElements";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  useGetAgentProfileQuery,
  useUpdateAgentProfileMutation,
} from "@/redux/features/agent/agentApi";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";
import NotificationSettingsCard from "@/components/notifications/NotificationSettingsCard";

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AgentSettings = () => {
  // Query: GET {{baseUrl}}/agents/agent-profile
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError,
    refetch,
  } = useGetAgentProfileQuery();

  // Mutations
  const [updateAgentProfile, { isLoading: isUpdatingProfile }] =
    useUpdateAgentProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const profileData = profileResponse?.data;

  // Form states: Personal Information
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Notification states
  const [notifyNewPlayers, setNotifyNewPlayers] = useState(true);
  const [notifyProfileUpdates, setNotifyProfileUpdates] = useState(true);
  const [notifyShared, setNotifyShared] = useState(true);

  // Security Form
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

  // Sync profile data to form fields
  useEffect(() => {
    if (profileData) {
      setFullName(
        profileData.personalInformation?.fullName ||
          profileData.fullName ||
          profileData.name ||
          profileData.userId?.name ||
          ""
      );

      const rawDob =
        profileData.personalInformation?.dateOfBirth ||
        profileData.dateOfBirth;
      if (rawDob) {
        setDob(new Date(rawDob).toISOString().split("T")[0]);
      } else {
        setDob("");
      }

      setEmail(
        profileData.personalInformation?.email ||
          profileData.email ||
          profileData.userId?.email ||
          ""
      );

      setPhone(
        profileData.personalInformation?.contact ||
          profileData.contact ||
          profileData.phone ||
          profileData.userId?.phone ||
          ""
      );
    }
  }, [profileData]);

  // Handle Save Personal Information
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const dataPayload = {
        fullName,
        dateOfBirth: dob || null,
        contact: phone,
        phone,
      };

      formData.append("data", JSON.stringify(dataPayload));
      await updateAgentProfile(formData).unwrap();
    } catch {
      // Handled by updateAgentProfile mutation toast
    }
  };

  // Handle Password Submit
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
      // Handled by authApi toast
    }
  };

  const currentTier =
    profileData?.tier ||
    profileData?.currentTier ||
    profileData?.headerCard?.tier ||
    "ACTIVE AGENT";

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
          Settings
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Manage your account and preferences
        </p>
      </div>

      {isProfileLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
            >
              <div className="h-6 w-52 rounded bg-white/10" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-11 rounded-xl bg-white/5" />
                <div className="h-11 rounded-xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">
            Failed to load settings
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
      ) : (
        <>
          {/* Section 1: Billing & Subscription */}
          <SettingsSection
            title="Billing & Subscription"
            icon={<IconCreditCard size={20} stroke={1.5} />}
          >
            <div className="flex flex-col gap-6">
              <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-white/10">
                  <div>
                    <h3 className="text-white font-semibold">{currentTier}</h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Professional Agent · £99/month
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      toast.info("Subscription plan management will open shortly")
                    }
                    className="bg-white/10 border border-white/5 text-white hover:bg-white/20 rounded-full h-8 text-xs px-5 cursor-pointer"
                  >
                    Change Plan
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-medium">
                      Next billing date
                    </span>
                    <span className="text-white text-xs font-medium">
                      July 15, 2025
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs font-medium">
                      Payment method
                    </span>
                    <span className="text-white text-xs font-medium">
                      •••• 4242
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={() =>
                  toast.info("Payment method update modal will open shortly")
                }
                className="self-start bg-white/5 border border-white/10 text-white hover:bg-white/10 h-10 px-5 rounded-lg text-xs font-medium cursor-pointer"
              >
                Update Payment Method
              </Button>
            </div>
          </SettingsSection>

          {/* Section 2: Personal Information */}
          <SettingsSection
            title="Personal Information"
            icon={<IconUser size={20} stroke={1.5} />}
          >
            <form onSubmit={handleSavePersonalInfo} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                />

                <SettingsInput
                  label="Date Of Birth"
                  isDate
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />

                <SettingsInput
                  label="Email"
                  value={email}
                  disabled
                  readOnly
                  placeholder="Email Address"
                />

                <SettingsInput
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider px-8 h-11 flex items-center justify-center gap-2 font-orbitron cursor-pointer transition-all shadow-lg shadow-[#E31B23]/20 disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy className="size-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </SettingsSection>

          {/* Section 3: Security (Change Password) */}
          <SettingsSection
            title="Security"
            icon={<IconLock size={20} stroke={1.5} />}
          >
            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="flex flex-col gap-5 max-w-2xl"
            >
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
                    message: "New password must be at least 6 characters",
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
                    value === getPasswordValues("newPassword") ||
                    "Passwords do not match",
                })}
              />

              <div className="pt-2">
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

          {/* Section 4: Notifications */}
          <NotificationSettingsCard className="rounded-[30px]! sm:rounded-[40px]! p-6! sm:p-10!" />
        </>
      )}
    </div>
  );
};

export default AgentSettings;
