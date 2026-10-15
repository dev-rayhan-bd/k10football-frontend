import { FC } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import { RegisterFormData, RoleType } from "@/types/auth.type";

interface ParentFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  selectedRole: RoleType;
}

const ParentFields: FC<ParentFieldsProps> = ({ register, errors, selectedRole }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
            <span>Linked Child Name</span>
            <span className="text-primary font-black">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Marcus Silva"
            {...register("childName", {
              required: selectedRole === "PARENT" ? "Child's name is required" : false
            })}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
          {errors.childName && (
            <p className="text-red-400 text-xs font-bold tracking-wide mt-1">
              {errors.childName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
            Linked Child Email (Optional)
          </label>
          <input
            type="email"
            placeholder="e.g. marcus@example.com"
            {...register("childEmail")}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white placeholder:text-zinc-400 font-medium text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
          Relationship
        </label>
        <div className="relative">
          <select
            {...register("relationship")}
            className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-[#161a18] text-white text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner appearance-none cursor-pointer"
          >
            <option value="Father" className="bg-[#111514] text-white">Father</option>
            <option value="Mother" className="bg-[#111514] text-white">Mother</option>
            <option value="Guardian" className="bg-[#111514] text-white">Legal Guardian</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ParentFields;
