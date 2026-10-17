"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, LogIn, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setAccessToken, setUser } from "@/redux/features/auth";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { setToken, setUserInfo, getUserRoleFromToken } from "@/helpers/SessionHelper";

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await login({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      }).unwrap();

      const user = res?.data?.user || res?.data;
      const token = res?.data?.accessToken;
      const decodedRole = getUserRoleFromToken(token);
      const normalizedRole = (decodedRole || user?.role || "player").toLowerCase();
      const email = user?.email || data.email;
      const fullName = user?.name || user?.fullName || "";
      const profileImg = user?.profileImg || "";

      // Store credentials and accessToken
      if (token) {
        setToken(token);
        localStorage.setItem("token", token);
      }
      setUserInfo({ fullName, email, profileImg, role: normalizedRole });

      // Sync Redux
      if (token) {
        dispatch(setAccessToken(token));
      }
      dispatch(
        setUser({
          user: {
            ...user,
            email,
            role: normalizedRole,
          },
        })
      );

      // Role-based destination
      const dashboardPath =
        normalizedRole === "academy"
          ? "/dashboard/academy/analysis"
          : `/dashboard/${normalizedRole}`;

      router.push(dashboardPath);
    } catch {
      // ErrorToast is automatically triggered in authApi onQueryStarted
    }
  };

  return (
    <div className="w-full max-w-lg bg-[#0f1312]/95 backdrop-blur-2xl border border-white/15 p-8 sm:p-10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center text-center">
      {/* Glowing Header Icon */}
      <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_-5px_rgba(0,255,98,0.4)]">
        <LogIn className="size-8" />
      </div>

      {/* Header */}
      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-heading">
        Welcome <span className="text-primary italic">Back!</span>
      </h2>
      <p className="text-zinc-300 text-xs sm:text-sm mt-2 font-normal leading-relaxed max-w-sm">
        Sign in to access your professional football dashboard.
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

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1">
              <span>Password</span>
              <span className="text-primary font-black">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:underline transition-colors tracking-wide"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", {
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-black text-black text-sm uppercase tracking-wider bg-primary hover:bg-primary/95 transition-all shadow-[0_0_25px_-5px_rgba(0,255,98,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,255,98,0.7)] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4" />
              Sign In
            </>
          )}
        </Button>

        {/* Register Link */}
        <p className="text-center text-zinc-400 text-xs sm:text-sm font-medium mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold transition-all ml-1">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
