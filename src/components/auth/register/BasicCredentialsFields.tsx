import { FC, useState } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { RegisterFormData, phoneRegex } from "@/types/auth.type";

export { phoneRegex };

interface BasicCredentialsFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  passwordVal?: string;
}

const BasicCredentialsFields: FC<BasicCredentialsFieldsProps> = ({
  register,
  errors,
  passwordVal
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const phoneRegister = register("phone", {
    required: "Phone number is required",
    pattern: {
      value: phoneRegex,
      message: "Invalid phone number format"
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
            Basic Credentials
          </h3>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
          <span>Full Name</span>
          <span className="text-primary font-black">*</span>
        </label>
        <div className="relative group">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. Alex Ferguson"
            {...register("fullName", { required: "Full name is required" })}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
        {errors.fullName && (
          <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Email Address</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. coach@k10football.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Phone Number</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="tel"
              placeholder="e.g. +880171111111"
              {...phoneRegister}
              onChange={(e) => {
                const sanitized = e.target.value
                  .replace(/[^\d+]/g, "")
                  .replace(/(?!^)\+/g, "");
                e.target.value = sanitized;
                phoneRegister.onChange(e);
              }}
              onKeyDown={(e) => {
                const allowedKeys = [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                  "Home",
                  "End",
                  "Enter"
                ];
                if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                  return;
                }
                if (e.key === "+") {
                  const input = e.currentTarget;
                  if (input.selectionStart === 0 && !input.value.includes("+")) {
                    return;
                  }
                  e.preventDefault();
                  return;
                }
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.phone && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Password</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters required" }
              })}
              className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Confirm Password</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) => value === passwordVal || "Passwords do not match"
              })}
              className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
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
      </div>
    </div>
  );
};

export default BasicCredentialsFields;
