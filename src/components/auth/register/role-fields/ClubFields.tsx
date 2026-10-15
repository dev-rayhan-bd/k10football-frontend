import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface ClubFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const ClubFields: FC<ClubFieldsProps> = ({ register, errors, selectedRole }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Club Name</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Bashundhara Kings"
            {...register("clubName", {
              required: selectedRole === "CLUB" ? "Club name is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.clubName && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.clubName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Your Title</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chief Scout / Director"
            {...register("title", {
              required: selectedRole === "CLUB" ? "Title is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.title && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.title.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>League Tier</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Premier League"
            {...register("leagueTier", {
              required: selectedRole === "CLUB" ? "League tier is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.leagueTier && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.leagueTier.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Country</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. England"
            {...register("country", {
              required: selectedRole === "CLUB" ? "Country is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.country && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubFields;
