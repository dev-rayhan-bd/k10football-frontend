import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Calendar, Ruler, Weight, Building2, ChevronDown } from "lucide-react";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface PlayerFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const PlayerFields: FC<PlayerFieldsProps> = ({ register, errors }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Date of Birth</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="date"
              {...register("dob", {
                required: "Date of birth is required"
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner [color-scheme:dark]"
            />
          </div>
          {errors.dob && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.dob.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Position
          </label>
          <div className="relative">
            <select
              {...register("position")}
              className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
            >
              <option value="Forward" className="bg-[#111514] text-white">Forward</option>
              <option value="Midfielder" className="bg-[#111514] text-white">Midfielder</option>
              <option value="Defender" className="bg-[#111514] text-white">Defender</option>
              <option value="Goalkeeper" className="bg-[#111514] text-white">Goalkeeper</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Height (cm)</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="number"
              placeholder="e.g. 178"
              {...register("height", {
                required: "Height is required",
                validate: (val) => (Number(val) > 0) || "Height is required"
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.height && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.height.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Weight (kg)</span>
            <span className="text-primary font-black">*</span>
          </label>
          <div className="relative group">
            <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="number"
              placeholder="e.g. 70"
              {...register("weight", {
                required: "Weight is required",
                validate: (val) => (Number(val) > 0) || "Weight is required"
              })}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
          </div>
          {errors.weight && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.weight.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
          <span>Current Club / Academy</span>
          <span className="text-primary font-black">*</span>
        </label>
        <div className="relative group">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="e.g. Abahani Youth Academy, or N/A"
            {...register("currentClub", {
              required: "Current club is required",
              validate: (val) =>
                (typeof val === "string" && val.trim().length > 0) || "Current club is required"
            })}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
        {errors.currentClub && (
          <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
            {errors.currentClub.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PlayerFields;
