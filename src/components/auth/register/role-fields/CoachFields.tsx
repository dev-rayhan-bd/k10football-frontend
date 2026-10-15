import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Award, ChevronDown } from "lucide-react";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface CoachFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const CoachFields: FC<CoachFieldsProps> = ({ register, errors, selectedRole }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Years of Experience</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="number"
              placeholder="e.g. 8"
              {...register("experience", {
                required: selectedRole === "COACH" ? "Years of experience is required" : false
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.experience && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.experience.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Coaching License Level</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative">
            <select
              {...register("license")}
              className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
            >
              <option value="UEFA Pro License" className="bg-[#111514] text-white">UEFA Pro License</option>
              <option value="UEFA A License" className="bg-[#111514] text-white">UEFA A License</option>
              <option value="UEFA B License" className="bg-[#111514] text-white">UEFA B License</option>
              <option value="AFC / BFF License" className="bg-[#111514] text-white">AFC / BFF License</option>
              <option value="Grassroots / C License" className="bg-[#111514] text-white">Grassroots / C License</option>
              <option value="No Official License" className="bg-[#111514] text-white">No Official License</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
          <span>Preferred Formation</span>
          <span className="text-primary font-black">*</span>
        </label>
        <div className="relative">
          <select
            {...register("formation")}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
          >
            <option value="4-3-3 (Attack-focused)" className="bg-[#111514] text-white">4-3-3 (Attack-focused)</option>
            <option value="3-5-2 (Wingbacks control)" className="bg-[#111514] text-white">3-5-2 (Wingbacks control)</option>
            <option value="4-4-2 (Standard flat)" className="bg-[#111514] text-white">4-4-2 (Standard flat)</option>
            <option value="4-2-3-1 (Modern possession)" className="bg-[#111514] text-white">4-2-3-1 (Modern possession)</option>
            <option value="4-3-3 (Holding midfielder)" className="bg-[#111514] text-white">4-3-3 (Holding midfielder)</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default CoachFields;
