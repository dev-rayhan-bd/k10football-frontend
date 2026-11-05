/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  IconUser, 
  IconLock, 
  IconBell, 
  IconUpload,
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconLoader2
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { cn } from "@/lib/utils";

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsSection = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-6 sm:gap-8 min-w-0 overflow-hidden w-full">
    <div className="flex items-start sm:items-center gap-3 min-w-0 shrink-0">
      <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
        <Icon size={22} />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word w-full">{title}</h2>
    </div>
    {children}
  </div>
);

const SettingField = ({ label, value, type = "text", placeholder, icon: Icon }: any) => (
  <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 w-full">
    <Label className="text-white/70 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">{label}</Label>
    <div className="relative">
      <Input 
        type={type} 
        defaultValue={value} 
        placeholder={placeholder}
        className="bg-black/40 border-white/20 h-12 sm:h-14 rounded-xl px-4 sm:px-6 text-xs sm:text-sm text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0" 
      />
      {Icon && <Icon size={18} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/20" />}
    </div>
  </div>
);

const SettingPasswordField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    placeholder?: string;
    error?: string;
  } & React.ComponentProps<"input">
>(({ label, placeholder = "••••••••••••", error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 w-full">
      <Label className="text-white/70 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
        <span>{label}</span>
      </Label>
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className={cn(
            "bg-black/40 border-white/20 h-12 sm:h-14 rounded-xl pl-4 sm:pl-6 pr-12 text-xs sm:text-sm text-white/90 placeholder:text-white/20 focus:border-red-500/50 transition-all w-full min-w-0",
            error && "border-destructive focus:border-destructive"
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-destructive text-[11px] sm:text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
});
SettingPasswordField.displayName = "SettingPasswordField";

const SuperAdminSettings = () => {
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

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
      // Toast notifications handled by authApi onQueryStarted
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-10 p-4 sm:p-6 lg:p-8 pb-10 sm:pb-20 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="shrink-0 w-full min-w-0">
        <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron uppercase tracking-tight truncate">Settings</h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">Manage platform configuration</p>
      </div>

      {/* Super Admin Information */}
      <SettingsSection icon={IconUser} title="Super Admin Information">
        <div className="flex flex-col xl:flex-row gap-6 sm:gap-10 w-full min-w-0">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 min-w-0 w-full">
            <SettingField label="Super Admin Name" value="K10 Football" />
            <SettingField label="Contact" value="+55 11 9999-8888" />
            <SettingField label="Default Language" value="English" icon={IconChevronDown} />
            <SettingField label="Email" value="support@k10football.com" />
          </div>
          
          <div className="w-full xl:w-95 flex flex-col gap-1.5 sm:gap-2 shrink-0">
            <Label className="text-white/70 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">Upload Cover Photo</Label>
            <div className="border-2 border-dashed border-white/10 rounded-2xl sm:rounded-4xl h-37.5 sm:h-50 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-white/2 hover:bg-white/5 transition-all cursor-pointer group w-full min-w-0">
              <div className="size-8 sm:size-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                <IconUpload className="size-4 sm:size-5" />
              </div>
              <p className="text-white/40 text-[10px] sm:text-xs font-medium group-hover:text-white transition-colors">Upload image</p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection icon={IconLock} title="Security">
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4 sm:gap-6 w-full min-w-0">
          <SettingPasswordField
            label="Current Password"
            placeholder="••••••••••••"
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
          <SettingPasswordField
            label="New Password"
            placeholder="••••••••••••"
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
          <SettingPasswordField
            label="Confirm New Password"
            placeholder="••••••••••••"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === getPasswordValues("newPassword") || "Passwords do not match",
            })}
          />
          <div className="flex justify-start sm:justify-end pt-2">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-[#1A1A1A] border border-white/20 hover:bg-white/10 h-10 sm:h-12 px-6 sm:px-8 rounded-xl text-white text-xs sm:text-sm font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <>
                  <IconLoader2 className="size-4 animate-spin text-red-500" />
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

      {/* Notifications */}
      <SettingsSection icon={IconBell} title="Notifications">
        <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
          {[
            { title: "New User Registration", desc: "Allow new users to register" },
            { title: "Game Report Submissions", desc: "Enable game report creation" },
            { title: "Pending Approvals", desc: "Alert when action needed" },
            { title: "Payment Notifications", desc: "Notify on transactions" }
          ].map((notif, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex justify-between items-center gap-4 w-full min-w-0">
              <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                <h4 className="text-white font-bold text-xs sm:text-sm truncate">{notif.title}</h4>
                <p className="text-white/40 text-[9px] sm:text-xs truncate">{notif.desc}</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-red-600 shrink-0" />
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
};

export default SuperAdminSettings;
