"use client"

import React from "react"
import {
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  Info,
  Loader2,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors={false}
      closeButton={true}
      duration={3500}
      className="toaster group"
      icons={{
        success: (
          <div className="size-7 rounded-full bg-[#00FF62]/15 border border-[#00FF62]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,255,98,0.3)]">
            <CheckCircle2 className="size-4 text-[#00FF62] stroke-[2.5]" />
          </div>
        ),
        error: (
          <div className="size-7 rounded-full bg-[#FF1010]/15 border border-[#FF1010]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,16,16,0.3)]">
            <AlertCircle className="size-4 text-[#FF4D4D] stroke-[2.5]" />
          </div>
        ),
        warning: (
          <div className="size-7 rounded-full bg-[#FDC700]/15 border border-[#FDC700]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(253,199,0,0.3)]">
            <TriangleAlert className="size-4 text-[#FDC700] stroke-[2.5]" />
          </div>
        ),
        info: (
          <div className="size-7 rounded-full bg-[#29C0F2]/15 border border-[#29C0F2]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(41,192,242,0.3)]">
            <Info className="size-4 text-[#29C0F2] stroke-[2.5]" />
          </div>
        ),
        loading: (
          <div className="size-7 rounded-full bg-[#00FF62]/15 border border-[#00FF62]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,255,98,0.25)]">
            <Loader2 className="size-4 text-[#00FF62] animate-spin stroke-[2.5]" />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast font-sans rounded-2xl border border-white/10 bg-[#141414]/95 backdrop-blur-xl text-white shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-4 flex items-center gap-3 w-full",
          title: "text-[13px] sm:text-sm font-semibold tracking-wide text-white leading-snug",
          description: "text-xs text-gray-400 mt-0.5 leading-normal",
          actionButton:
            "bg-[#00FF62] hover:bg-[#00CD4F] text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
          cancelButton:
            "bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
          closeButton:
            "!bg-[#222222] !border-white/10 !text-gray-400 hover:!text-white hover:!bg-[#333333] !transition-all !rounded-full !size-6",
          success:
            "!border-l-4 !border-l-[#00FF62] !border-white/10 !bg-gradient-to-r !from-[#0b1c11] !via-[#141414] !to-[#141414] shadow-[0_8px_30px_rgba(0,255,98,0.15)]",
          error:
            "!border-l-4 !border-l-[#FF1010] !border-white/10 !bg-gradient-to-r !from-[#240e11] !via-[#141414] !to-[#141414] shadow-[0_8px_30px_rgba(255,16,16,0.2)]",
          warning:
            "!border-l-4 !border-l-[#FDC700] !border-white/10 !bg-gradient-to-r !from-[#251f0c] !via-[#141414] !to-[#141414] shadow-[0_8px_30px_rgba(253,199,0,0.15)]",
          info:
            "!border-l-4 !border-l-[#29C0F2] !border-white/10 !bg-gradient-to-r !from-[#0c1a24] !via-[#141414] !to-[#141414] shadow-[0_8px_30px_rgba(41,192,242,0.15)]",
        },
      }}
      style={
        {
          "--normal-bg": "#141414",
          "--normal-text": "#ffffff",
          "--normal-border": "rgba(255, 255, 255, 0.12)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
