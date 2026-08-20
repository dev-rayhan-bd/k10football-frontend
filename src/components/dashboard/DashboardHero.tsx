"use client";
import Image from "next/image";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { IconPhone, IconMail, IconShieldCheck, IconCertificate } from "@tabler/icons-react";
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
}: DashboardHeroProps) => {
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
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-size-[100%_auto] bg-no-repeat bg-center opacity-50"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/20 to-transparent w-2/3" />
      {/* Standing Character */}
      {characterImgSrc && (
        <Image
          src={characterImgSrc}
          alt="Character"
          className="absolute right-16 bottom-6 h-[88%] object-contain object-right z-10 hidden lg:block"
          width={200}
          height={200}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.srcset = "";
            target.src = "/placeholder_img.jpg";
          }}
        />
      )}
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
