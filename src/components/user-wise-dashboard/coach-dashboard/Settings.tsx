"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { 
  IconUser, 
  IconLock, 
  IconBell,
  IconLoader2
} from "@tabler/icons-react";
import { 
  SettingsSection, 
  SettingsInput, 
  SettingsToggle 
} from "@/components/dashboard/DashboardSettingsElements";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

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
      // Error handled by authApi toast notification
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Settings</h1>
        <p className="text-gray-500 text-sm mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <SettingsSection title="Personal Information" icon={<IconUser size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <SettingsInput label="Full Name" placeholder="John Doe" />
            <SettingsInput label="Date Of Birth" placeholder="01/01/1975" isDate />
            <SettingsInput label="Email" placeholder="john.doe@k10football.com" />
            <SettingsInput label="Phone" placeholder="+44 7700 900000" />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={<IconLock size={20} />}>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
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
          <div className="space-y-4">
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
