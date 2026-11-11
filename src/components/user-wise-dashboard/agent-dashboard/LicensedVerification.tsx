"use client";

import React, { useState, useRef } from "react";
import {
  IconCircleCheck,
  IconShieldCheck,
  IconFileDescription,
  IconUpload,
  IconEye,
  IconAlertCircle,
  IconLoader2,
  IconRefresh,
  IconAlertTriangle,
  IconX,
} from "@tabler/icons-react";
import {
  useGetAgentLicenseVerificationQuery,
  useUpdateAgentProfileMutation,
} from "@/redux/features/agent/agentApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 mb-6 text-white">
    <IconCircleCheck className="text-green-500 size-5" />
    <h2 className="text-lg font-bold font-orbitron">{title}</h2>
  </div>
);

const defaultUploadSlots = [
  {
    fileKey: "licenseCertificateDocument",
    title: "License Certificate",
    description: "PDF, JPG, PNG",
  },
  {
    fileKey: "identityDocument",
    title: "National ID / Passport",
    description: "PDF, JPG, PNG",
  },
  {
    fileKey: "associationMembershipDocument",
    title: "Association Membership",
    description: "PDF, JPG, PNG",
  },
];

const AgentVerification = () => {
  // Query: GET {{baseUrl}}/agents/license-verification
  const {
    data: verificationResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAgentLicenseVerificationQuery();

  // Mutation: PATCH {{baseUrl}}/agents/agent-profile
  const [updateProfile] = useUpdateAgentProfileMutation();

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const verificationData = verificationResponse?.data;
  const documents = verificationData?.documents || [];

  const normStatus = (verificationData?.status || "PENDING").toUpperCase();

  const handleFileSelect = (fileKey: string, file: File | null) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [fileKey]: file }));
  };

  const handleClearSelected = (fileKey: string) => {
    setSelectedFiles((prev) => {
      const copy = { ...prev };
      delete copy[fileKey];
      return copy;
    });
    if (fileInputRefs.current[fileKey]) {
      fileInputRefs.current[fileKey]!.value = "";
    }
  };

  const handleUpload = async (fileKey: string) => {
    const file = selectedFiles[fileKey];
    if (!file) return;

    setUploadingKey(fileKey);
    try {
      const formData = new FormData();
      formData.append(fileKey, file);

      await updateProfile(formData).unwrap();
      handleClearSelected(fileKey);
      refetch();
    } catch {
      // Handled by RTK mutation onQueryStarted
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="p-2 md:p-6 flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wide mb-1">
          Licensed Verification
        </h1>
        <p className="text-gray-400 text-sm font-medium">
          Manage your agent verification and licensing
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          {/* Status Skeleton */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-white/10" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-40 rounded bg-white/10" />
                <div className="h-3.5 w-60 rounded bg-white/5" />
              </div>
            </div>
            <div className="h-8 w-24 rounded-full bg-white/10" />
          </div>

          {/* Documents Card Skeleton */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
            <div className="h-6 w-48 rounded bg-white/10 mb-2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-18 rounded-xl bg-white/5 border border-white/10"
              />
            ))}
          </div>

          {/* Upload Card Skeleton */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
            <div className="h-6 w-56 rounded bg-white/10 mb-2" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-18 rounded-xl bg-white/5 border border-dashed border-white/10"
              />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-white/10 rounded-2xl bg-white/2">
          <IconAlertTriangle className="size-8 text-destructive" />
          <p className="text-sm font-bold text-destructive">
            Failed to load verification documents
          </p>
          <Button
            type="button"
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
          >
            <IconRefresh size={14} className="mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Verification Status Card */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "size-12 rounded-full border flex items-center justify-center shrink-0",
                  normStatus === "APPROVED"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : normStatus === "PENDING"
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                    : normStatus === "REJECTED"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : "border-white/10 bg-white/5 text-white"
                )}
              >
                <IconShieldCheck size={24} stroke={1.5} />
              </div>
              <div>
                <h3 className="text-white font-bold font-orbitron text-lg">
                  Verification Status
                </h3>
                <p className="text-gray-400 text-sm">
                  {verificationData?.message ||
                    (normStatus === "APPROVED"
                      ? "Your account is currently verified"
                      : "Your verification documents are currently under review")}
                </p>
              </div>
            </div>

            <div
              className={cn(
                "px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                normStatus === "APPROVED" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
                normStatus === "PENDING" &&
                  "border-orange-500/40 bg-orange-500/10 text-orange-400",
                normStatus === "REJECTED" &&
                  "border-red-500/40 bg-red-500/10 text-red-400",
                normStatus !== "APPROVED" &&
                  normStatus !== "PENDING" &&
                  normStatus !== "REJECTED" &&
                  "border-white/10 bg-white/5 text-white"
              )}
            >
              {normStatus === "APPROVED" && <IconShieldCheck size={14} />}
              {normStatus === "PENDING" && <IconAlertCircle size={14} />}
              {verificationData?.statusLabel || verificationData?.status || "Under Review"}
            </div>
          </div>

          {/* Verification Documents List */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader title="Verification Documents" />

            <div className="flex flex-col gap-4">
              {documents.length > 0 ? (
                documents.map((doc, idx) => {
                  const isApproved =
                    (doc.status || "").toUpperCase() === "APPROVED";
                  const isRejected =
                    (doc.status || "").toUpperCase() === "REJECTED";
                  const isPending =
                    (doc.status || "").toUpperCase() === "PENDING";
                  const uploadedDate = doc.uploadedAt
                    ? new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not uploaded";

                  return (
                    <div
                      key={doc.fileKey || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/[0.02] transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                          <IconFileDescription
                            className="text-[#E31B23]"
                            size={24}
                            stroke={1.5}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium text-sm truncate">
                            {doc.title}
                          </h4>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Uploaded: {uploadedDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <IconEye size={14} />
                            View
                          </a>
                        )}

                        <span
                          className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-bold border",
                            isApproved &&
                              "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                            isPending &&
                              "border-orange-500/30 bg-orange-500/10 text-orange-400",
                            isRejected &&
                              "border-red-500/30 bg-red-500/10 text-red-400",
                            !isApproved &&
                              !isPending &&
                              !isRejected &&
                              "border-white/10 bg-white/5 text-white"
                          )}
                        >
                          {doc.statusLabel || doc.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No verification documents uploaded yet.
                </p>
              )}
            </div>
          </div>

          {/* Upload Additional Documents */}
          <div className="bg-[#111111] border border-white/15 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <SectionHeader title="Upload Additional Documents" />

            <div className="flex flex-col gap-4">
              {defaultUploadSlots.map((slot) => {
                const selectedFile = selectedFiles[slot.fileKey];
                const isCurrentlyUploading = uploadingKey === slot.fileKey;

                return (
                  <div
                    key={slot.fileKey}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.02] transition-colors gap-4"
                  >
                    <input
                      ref={(el) => {
                        fileInputRefs.current[slot.fileKey] = el;
                      }}
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) =>
                        handleFileSelect(
                          slot.fileKey,
                          e.target.files?.[0] || null
                        )
                      }
                      className="hidden"
                    />

                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                        <IconUpload
                          className="text-gray-400"
                          size={24}
                          stroke={1.5}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-sm truncate">
                          {slot.title}
                        </h4>
                        {selectedFile ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[#E31B23] text-xs font-semibold truncate max-w-xs">
                              {selectedFile.name} (
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                            </span>
                            <button
                              type="button"
                              onClick={() => handleClearSelected(slot.fileKey)}
                              className="text-gray-400 hover:text-white"
                            >
                              <IconX size={12} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs mt-0.5">
                            {slot.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {selectedFile ? (
                        <Button
                          type="button"
                          disabled={isCurrentlyUploading}
                          onClick={() => handleUpload(slot.fileKey)}
                          className="px-5 py-2 rounded-full bg-[#E31B23] hover:bg-[#C2181F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#E31B23]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCurrentlyUploading ? (
                            <>
                              <IconLoader2 className="animate-spin size-3.5" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <IconUpload size={14} />
                              <span>Upload File</span>
                            </>
                          )}
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRefs.current[slot.fileKey]?.click()
                          }
                          className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors w-fit sm:w-auto cursor-pointer"
                        >
                          Choose File
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentVerification;
