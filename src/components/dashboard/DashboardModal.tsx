"use client";

import React, { useEffect } from "react";
import { IconX, IconArrowLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
}

const DashboardModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  showBackButton,
  onBack,
  children,
  footer,
  maxWidth = "max-w-5xl",
  closeOnOutsideClick = false,
}: DashboardModalProps) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnOutsideClick) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto cursor-default"
      onClick={closeOnOutsideClick ? onClose : undefined}
    >
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal Container with clearly visible, prominent border and distinct dark surface */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full",
          maxWidth,
          "h-full max-h-[92vh] bg-[#0E0E0E] rounded-[28px] sm:rounded-[36px] md:rounded-[40px]",
          // Sharp, visible, premium border and layered glow shadow
          "border-2 border-white/25 sm:border-2 sm:border-white/30",
          "shadow-[0_0_60px_-10px_rgba(255,255,255,0.15),0_25px_60px_-12px_rgba(0,0,0,0.95)]",
          "flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default"
        )}
      >
        {/* Header */}
        <div className="p-5 sm:p-7 md:p-8 pb-4 md:pb-5 flex items-start justify-between gap-4 border-b border-white/15 bg-[#121212]/50">
          <div className="flex items-start gap-3 sm:gap-4">
            {showBackButton && (
              <button
                type="button"
                onClick={onBack || onClose}
                className="size-9 sm:size-10 bg-white/5 hover:bg-white/10 border border-white/15 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all shrink-0 cursor-pointer"
                title="Back"
              >
                <IconArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-tight wrap-break-word">
                {title}
              </h2>
              {subtitle && (
                <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] sm:text-[11px] mt-1.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-9 sm:size-10 bg-white/5 hover:bg-white/10 border border-white/15 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all shrink-0 cursor-pointer active:scale-95"
            title="Close modal"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 md:p-8 pt-4 md:pt-6 custom-scrollbar min-w-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-6 md:p-8 border-t border-white/15 bg-[#0A0A0A]/80 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardModal;
