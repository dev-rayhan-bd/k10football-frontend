/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Dock, ExternalLink } from "lucide-react";
import { IconFileTypePdf, IconFileTypeDoc, IconPhoto } from "@tabler/icons-react";
import { usePlayerCvView } from "./PlayerCvViewContext";

const getFileIcon = (fileType?: string) => {
  const type = (fileType || "").toLowerCase();
  if (type.includes("pdf")) return <IconFileTypePdf className="text-red-500 size-6 sm:size-8" />;
  if (type.includes("doc") || type.includes("word")) return <IconFileTypeDoc className="text-blue-500 size-6 sm:size-8" />;
  return <IconPhoto className="text-green-500 size-6 sm:size-8" />;
};

export const ViewDocSection = () => {
  const { playerData } = usePlayerCvView();
  const docs = playerData.documents || [];

  return (
    <div className="w-full mt-10 sm:mt-20 min-w-0 overflow-hidden">
      <div className="bg-cardBg border border-border/50 rounded-2xl p-6 sm:p-10 w-full min-w-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Dock size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white uppercase tracking-wider">
              Documents & Certifications
            </h2>
            <p className="text-xs text-muted-foreground">
              Official player certifications, identity papers, and medical validation.
            </p>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-black/20">
            <p className="text-xs sm:text-sm text-gray-400">
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
                    {getFileIcon(doc.fileType)}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{doc.title || "Document"}</h4>
                      <p className="text-[10px] text-gray-400">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Verified"}
                      </p>
                    </div>
                  </div>

                  {fileUrl !== "#" && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-primary hover:text-black text-gray-300 transition-colors"
                    >
                      <ExternalLink size={16} />
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
