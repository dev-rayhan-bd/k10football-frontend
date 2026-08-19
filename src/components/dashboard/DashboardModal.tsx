import React from "react";
import { IconX } from "@tabler/icons-react";

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
}

const DashboardModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-5xl",
}: DashboardModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} h-full max-h-[90vh] bg-[#000000] rounded-[40px] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300`}>

        {/* Header */}
        <div className="p-5 sm:p-8 md:p-10 pb-4 md:pb-6 flex items-start justify-between gap-4 md:gap-6 border-b border-white/5">
          <div className="flex items-start gap-4 md:gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight wrap-break-word">
                {title}
              </h2>
              {subtitle && (
                <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] sm:text-[11px] mt-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all shrink-0"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 pt-4 md:pt-6 custom-scrollbar min-w-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-5 sm:p-8 md:p-10 border-t border-white/5 bg-black/50 backdrop-blur-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardModal;
