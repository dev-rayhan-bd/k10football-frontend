import { FC } from "react";
import Link from "next/link";
import { ROLES_INFO, RoleType } from "@/types/auth.type";

interface RoleSelectionStepProps {
  onSelectRole: (role: RoleType) => void;
}

const RoleSelectionStep: FC<RoleSelectionStepProps> = ({ onSelectRole }) => {
  return (
    <div className="w-full text-center flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/90 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mx-auto">
          Get Started
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight font-heading">
          Select Your <span className="text-primary italic">Role</span>
        </h1>
        <p className="text-zinc-300 text-sm max-w-md mx-auto font-normal">
          Choose your profile type to configure the platform for your football career.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        {ROLES_INFO.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="relative p-6 rounded-2xl border bg-[#111514]/90 backdrop-blur-md text-left hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-56 shadow-lg border-white/10 hover:border-primary/50 cursor-pointer"
            >
              <div className="flex flex-col gap-4">
                <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all text-primary">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                    {role.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed font-normal">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-widest font-black text-right w-full text-primary/80 group-hover:text-primary transition-colors mt-4 flex items-center justify-end gap-1">
                Select & Continue &rarr;
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-zinc-400 text-sm font-medium pt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-bold transition-all ml-1">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default RoleSelectionStep;
