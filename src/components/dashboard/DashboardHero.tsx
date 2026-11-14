"use client";
import Image from "next/image";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import { IconPhone, IconMail, IconShieldCheck, IconCertificate, IconCamera, IconLoader2 } from "@tabler/icons-react";

interface DashboardHeroProps {
  backgroundImage: string;
  rating?: number;
  badgeText?: string;
  title: string;
  subtitle?: string;
  details?: {
    icon?: React.ReactNode;
    text: string;
  }[];
  contacts?: {
    type: "phone" | "email" | "club" | "license";
    label: string;
    value: string;
  }[];
  characterImage?: any;
  logoImage?: string;
  isLoading?: boolean;
  onCoverUpload?: (file: File) => void | Promise<void>;
  isUploadingCover?: boolean;
}

const DashboardHero = ({
  backgroundImage,
  rating,
  badgeText,
  title,
  subtitle,
  details,
  contacts,
  characterImage,
  logoImage,
  isLoading,
  onCoverUpload,
  isUploadingCover,
}: DashboardHeroProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const characterImgSrc = characterImage
    ? (typeof characterImage === "string" ? characterImage : (characterImage.src || ""))
    : "";
  const getIcon = (type: string) => {
    switch (type) {
      case "phone": return <IconPhone size={22} />;
      case "email": return <IconMail size={22} />;
      case "club": return <IconShieldCheck size={22} />;
      case "license": return <IconCertificate size={22} />;
      default: return <IconMail size={22} />;
    }
  };
  return (
    <div className="relative rounded-3xl overflow-hidden min-h-125 border border-white/20 bg-[#0D0D0D] group flex flex-col justify-center">
      {/* Background Image / Skeleton */}
      {isLoading ? (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center">
          <div className="text-white/20 text-sm font-semibold tracking-wider uppercase animate-pulse">
            Loading...
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center opacity-70 sm:opacity-80 transition-opacity duration-500"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Dark gradients for text readability */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/40 to-transparent w-full sm:w-2/3" />
      <div className="absolute inset-0 bg-linear-to-t from-[#0D0D0D] via-black/50 to-transparent sm:hidden" />

      {/* Change Cover Button */}
      {onCoverUpload && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 print:hidden">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingCover || isLoading}
            className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/20 hover:border-white/40 transition-all shadow-xl cursor-pointer disabled:opacity-50"
          >
            {isUploadingCover ? (
              <>
                <IconLoader2 className="size-4 animate-spin text-[#E31B23]" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <IconCamera className="size-4 text-white" />
                <span>Change Cover</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onCoverUpload(file);
                e.target.value = "";
              }
            }}
          />
        </div>
      )}

      {/* Standing Character / Skeleton */}
      {isLoading ? (
        <div className="absolute right-6 lg:right-16 bottom-0 h-[75%] sm:h-[80%] lg:h-[88%] w-48 sm:w-64 rounded-2xl bg-white/5 animate-pulse z-10 hidden sm:block" />
      ) : characterImgSrc ? (
        <Image
          src={characterImgSrc}
          alt="Character"
          className="absolute right-0 lg:right-16 bottom-0 lg:bottom-6 h-[75%] sm:h-[80%] lg:h-[88%] w-[60%] sm:w-[50%] lg:w-auto object-contain object-right-bottom z-10 opacity-50 lg:opacity-100 pointer-events-none"
          width={400}
          height={600}
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.srcset = "";
            target.src = "/placeholder_img.jpg";
          }}
        />
      ) : null}
      <div className="relative p-6 sm:p-8 md:p-12 w-full flex flex-col gap-6 sm:gap-8 z-20 min-w-0">
        <div className="space-y-6">
          {/* Logo Image */}
          {logoImage && (
            <div className="mb-4">
              <Image
                src={logoImage}
                alt="Club Logo"
                className="w-24 h-auto object-contain"
                width={200}
                height={200}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.srcset = "";
                  target.src = "/placeholder_img.jpg";
                }}
              />
            </div>
          )}
          {/* Rating Circle */}
          {rating && (
            <div className="w-24 h-24 rounded-full border-4 border-[#E31B23] flex items-center justify-center bg-black/50 backdrop-blur-md shadow-[0_0_30px_rgba(227,27,35,0.2)]">
              <span className="text-4xl font-black text-white italic">{rating}</span>
            </div>
          )}
          <div className="space-y-4">
            {badgeText && (
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase w-fit tracking-[0.2em]">
                {badgeText}
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-none italic truncate">
                {title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-white font-bold text-xs sm:text-sm">
                <span className="text-[#E31B23]">{subtitle}</span>
                {details && details.map((detail, index) => (
                  <React.Fragment key={index}>
                    <span className="text-white/20 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/60">
                      {detail.icon}
                      <span>{detail.text}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        {contacts && contacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-6 max-w-3xl pt-6 sm:pt-8 border-t border-white/10 min-w-0">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white/40 shrink-0">
                  {getIcon(contact.type)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest truncate">
                    {contact.label}
                  </p>
                  <p className="text-white text-base font-bold break-all sm:break-normal">
                    {contact.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default DashboardHero;
