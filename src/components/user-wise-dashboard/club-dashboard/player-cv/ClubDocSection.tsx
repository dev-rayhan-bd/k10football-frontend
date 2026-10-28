/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Dock, ExternalLink } from "lucide-react";
import { IconFileTypePdf, IconFileTypeDoc, IconPhoto } from "@tabler/icons-react";
import { useClubPlayerCv } from "./ClubPlayerCvContext";

const getFileIcon = (fileType?: string) => {
  const type = (fileType || "").toLowerCase();
  if (type.includes("pdf")) return <IconFileTypePdf className="text-destructive size-6 sm:size-8" />;
  if (type.includes("doc") || type.includes("word")) return <IconFileTypeDoc className="text-blue-500 size-6 sm:size-8" />;
  return <IconPhoto className="text-primary size-6 sm:size-8" />;
};

export const ClubDocSection = () => {
  const { playerData } = useClubPlayerCv();
  const docs = playerData.documents || [];

  return (
    <div className="w-full mt-10 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Dock size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground uppercase tracking-wider">
              Documents & Certifications
            </h2>
            <p className="text-xs text-muted-foreground">
              Official player certifications, identity papers, and medical validation.
            </p>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20">
            <p className="text-xs sm:text-sm text-muted-foreground">
              No documents or certificates uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc: any, idx: number) => {
              const fileUrl = doc.fileUrl || doc.url || "#";
              return (
                <div
                  key={doc._id || idx}
                  className="bg-black/30 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">{getFileIcon(doc.fileType || doc.type)}</div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[180px]">
                        {doc.title || doc.name || `Document ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : "Verified"}
                      </p>
                    </div>
                  </div>

                  {fileUrl !== "#" && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0 ml-2"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

