"use client";

import React from "react";
import Image from "next/image";
import { IconLoader2, IconShield } from "@tabler/icons-react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { cn } from "@/lib/utils";

// Small shared building blocks for the Extra Events management screens.

export const SectionCard = ({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("bg-[#111111] border border-white/10 rounded-4xl p-5 md:p-8 flex flex-col gap-6 min-w-0", className)}>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron tracking-tight">{title}</h2>
        {subtitle && <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white/40">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
    {children}
  </section>
);

export const Pill = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 px-3 py-1 rounded-xl border text-[9px] md:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
      className
    )}
  >
    {children}
  </span>
);

type BtnVariant = "primary" | "ghost" | "danger" | "success";
const btnStyles: Record<BtnVariant, string> = {
  primary: "bg-[#E31B23] hover:bg-[#C2181F] text-white shadow-lg shadow-[#E31B23]/20 border-transparent",
  ghost: "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10",
  danger: "bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30",
  success: "bg-[#00FF62]/10 hover:bg-[#00FF62]/20 text-[#00FF62] border-[#00FF62]/30",
};

export const ActionButton = ({
  variant = "ghost",
  loading,
  icon,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  loading?: boolean;
  icon?: React.ReactNode;
}) => (
  <button
    type="button"
    {...props}
    disabled={props.disabled || loading}
    className={cn(
      "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
      btnStyles[variant],
      className
    )}
  >
    {loading ? <IconLoader2 size={16} className="animate-spin shrink-0" /> : icon}
    <span className="truncate">{children}</span>
  </button>
);

export const ClubLogo = ({
  logo,
  name,
  className,
}: {
  logo: { url?: string; svg?: string };
  name?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "size-9 shrink-0 rounded-xl bg-[#161616] border border-white/10 overflow-hidden flex items-center justify-center text-white/40 relative",
      className
    )}
  >
    {logo.url ? (
      <Image fill src={logo.url} alt={name || "Club logo"} className="object-contain p-1" />
    ) : logo.svg ? (
      <div className="size-full p-1" dangerouslySetInnerHTML={{ __html: logo.svg }} />
    ) : (
      <IconShield size={18} />
    )}
  </div>
);

export const EmptyState = ({ icon, title, text }: { icon: React.ReactNode; title: string; text?: string }) => (
  <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-4 rounded-3xl border border-dashed border-white/10 bg-white/2">
    <div className="size-14 rounded-full bg-white/5 flex items-center justify-center text-white/40">{icon}</div>
    <h3 className="text-sm font-black uppercase text-white font-orbitron">{title}</h3>
    {text && <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider max-w-md">{text}</p>}
  </div>
);

export const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading,
  onConfirm,
  extra,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: BtnVariant;
  loading?: boolean;
  onConfirm: () => void;
  extra?: React.ReactNode;
}) => (
  <DashboardModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    maxWidth="max-w-lg"
    closeOnOutsideClick
    footer={
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <ActionButton onClick={onClose}>Cancel</ActionButton>
        <ActionButton variant={confirmVariant} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </ActionButton>
      </div>
    }
  >
    <div className="flex flex-col gap-4 text-sm text-white/70 leading-relaxed">
      {message}
      {extra}
    </div>
  </DashboardModal>
);

export const fieldClass =
  "w-full bg-[#111111] border border-white/15 rounded-xl py-3 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all";
export const labelClass = "text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1";

export const Field = ({
  label,
  required,
  children,
  className,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) => (
  <div className={cn("flex flex-col gap-2 min-w-0", className)}>
    <label className={labelClass}>
      {label} {required && <span className="text-[#E31B23]">*</span>}
    </label>
    {children}
    {hint && <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{hint}</p>}
  </div>
);
