/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, KeyRound, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForgotPasswordResetMutation } from "@/redux/features/auth/authApi";

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [resetPassword, { isLoading: isResetting }] = useForgotPasswordResetMutation();

  const [userEmail, setUserEmail] = useState(emailParam);
  const [resetToken, setResetToken] = useState(tokenParam);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setUserEmail(emailParam);
    } else if (typeof window !== "undefined") {
      const cachedEmail = sessionStorage.getItem("forgotEmail");
      if (cachedEmail) setUserEmail(cachedEmail);
    }

    if (tokenParam) {
      setResetToken(tokenParam);
    } else if (typeof window !== "undefined") {
      const cachedToken = sessionStorage.getItem("resetToken");
      if (cachedToken) setResetToken(cachedToken);
    }
  }, [emailParam, tokenParam]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword({
        token: resetToken,
        email: userEmail,
        password: data.newPassword,
        newPassword: data.newPassword,
      }).unwrap();

      toast.success("Password reset successfully! Please sign in.");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("resetToken");
        sessionStorage.removeItem("forgotEmail");
      }

      router.push("/login");
    } catch {
      // ErrorToast is automatically handled by authApi onQueryStarted
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
      {/* Glowing Key Icon */}
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_-5px_rgba(0,255,98,0.4)]">
        <KeyRound className="size-8" />
      </div>

      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
        Create <span className="text-primary italic">New Password</span>
      </h2>
      <p className="text-zinc-300 text-xs sm:text-sm mt-2 font-normal leading-relaxed max-w-sm">
        Your new password must be different from previous passwords.
      </p>

      {/* Email Indicator Badge */}
      {userEmail && (
        <div className="mt-3">
          <Badge className="bg-primary/15 text-primary border border-primary/30 font-bold tracking-wider text-[11px] px-3 py-1">
            {userEmail}
          </Badge>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 mt-8 text-left">
        {/* New Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>New Password</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              {...register("newPassword", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Confirm Password</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password Helper Hint */}
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium pt-0.5">
          <ShieldCheck className="size-4 text-primary" />
          <span>Must be at least 6 characters</span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isResetting}
          className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {isResetting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Reset & Save Password
            </>
          )}
        </Button>

        {/* Back Link */}
        <Link
          href="/login"
          className="text-zinc-400 hover:text-white text-xs uppercase tracking-wider font-bold transition-colors mt-2 cursor-pointer text-center block"
        >
          ← Back to Sign In
        </Link>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm">Loading reset form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
