/* eslint-disable react-hooks/incompatible-library */
"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  IconUser, 
  IconLock, 
  IconBell,
  IconLoader2,
  IconDeviceFloppy
} from "@tabler/icons-react";
import { 
  SettingsSection, 
  SettingsInput, 
  SettingsToggle 
} from "@/components/dashboard/DashboardSettingsElements";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { 
  useGetMyCoachProfileQuery, 
  useUpdateMyCoachProfileMutation 
} from "@/redux/features/coach/coachApi";
import { WarningToast } from "@/helpers/ValidationHelper";

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
        <SettingsSection title="Notifications" icon={<IconBell size={20} />}>
          <div className="flex flex-col gap-4">
            <SettingsToggle 
              title="New video likes" 
              description="Get notified when someone likes your video" 
              defaultChecked 
            />
            <SettingsToggle 
              title="Profile views" 
              description="Get notified when a club views your profile" 
              defaultChecked 
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

export default Settings;
