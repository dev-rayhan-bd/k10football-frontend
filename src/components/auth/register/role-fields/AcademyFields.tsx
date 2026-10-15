import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface AcademyFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const AcademyFields: FC<AcademyFieldsProps> = ({ register, errors, selectedRole }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
          <span>Academy Name</span>
          <span className="text-primary font-black">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Kings Football Academy"
          {...register("academyName", {
            required: selectedRole === "ACADEMY" ? "Academy name is required" : false
          })}
          className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
        />
        {errors.academyName && (
          <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
            {errors.academyName.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Location (City, Country)</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Dhaka, Bangladesh"
            {...register("location", {
              required: selectedRole === "ACADEMY" ? "Location is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.location && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.location.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Registration / License ID</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. REG-109283"
            {...register("registrationId", {
              required: selectedRole === "ACADEMY" ? "Registration ID is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.registrationId && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.registrationId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Estimated Academy Size
        </label>
        <div className="relative">
          <select
            {...register("estimatedAcademySize")}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
          >
            <option value="Under 50 Players" className="bg-[#111514] text-white">Under 50 Players</option>
            <option value="50 - 100 Players" className="bg-[#111514] text-white">50 - 100 Players</option>
            <option value="100 - 200 Players" className="bg-[#111514] text-white">100 - 200 Players</option>
            <option value="200+ Players" className="bg-[#111514] text-white">More than 200 Players</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default AcademyFields;
