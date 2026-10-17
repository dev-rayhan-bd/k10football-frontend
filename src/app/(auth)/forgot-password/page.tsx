"use client";

import { useRouter } from "next/navigation";
import { Loader2, Mail, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useForgotPasswordSendOtpMutation } from "@/redux/features/auth/authApi";

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [forgotPasswordSendOtp, { isLoading }] = useForgotPasswordSendOtpMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPasswordSendOtp({ email: data.email }).unwrap();
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forgotEmail", data.email);
      }
      router.push(`/verify-forgot-otp?email=${encodeURIComponent(data.email)}`);
    } catch {
      // ErrorToast handled automatically in authApi onQueryStarted
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
      {/* Glowing Mail Icon */}
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_-5px_rgba(0,255,98,0.4)]">
        <Mail className="size-8" />
      </div>

      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
        Forgot <span className="text-primary italic">Password?</span>
      </h2>
      <p className="text-zinc-300 text-xs sm:text-sm mt-2 font-normal leading-relaxed max-w-sm">
        Enter your registered email address and we&apos;ll send you a 6-digit verification code to reset your password.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5 mt-8 text-left">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. player@gmail.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending Code...
            </>
          ) : (
            <>
              <SendHorizontal className="size-4" />
              Send Reset Code
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

export default ForgotPasswordPage;
