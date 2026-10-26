/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import CMSField from '@/components/shared/CMSField';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, Check, Info, Upload, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import club1 from '@/assets/cvs/club1.png';
import Image from 'next/image';

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const TO_YEARS = ["Present", ...YEARS];

const getValidLogoSrc = (logo: any): string | null => {
  if (!logo) return null;
  if (typeof logo === 'string') {
    const trimmed = logo.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }
  }
  return null;
};

const ClubSection = ({ editable = true }: { editable?: boolean }) => {
  const { playerData, handleAddClub, handleDeleteClub, handleUpdateClub } = usePlayer();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // States for new club entry
  const [newClubName, setNewClubName] = useState("");
  const [newClubLogo, setNewClubLogo] = useState<string | null>(null);
  const [newClubLogoFile, setNewClubLogoFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState(YEARS[0]);
  const [toDate, setToDate] = useState("Present");
  const [logoError, setLogoError] = useState(false);
  const [nameError, setNameError] = useState(false);

  // States for editing club entry
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [editingClubName, setEditingClubName] = useState("");
  const [editingClubLogo, setEditingClubLogo] = useState<string | null>(null);
  const [editingClubLogoFile, setEditingClubLogoFile] = useState<File | null>(null);
  const [editingFromDate, setEditingFromDate] = useState(YEARS[0]);
  const [editingToDate, setEditingToDate] = useState("Present");
  const [isUpdatingLoading, setIsUpdatingLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const clubCount = playerData?.clubs?.length || 0;
  const isLimitReached = clubCount >= 6;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large. Max 2MB.");
        return;
      }
      setNewClubLogoFile(file);
      setLogoError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClubLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large. Max 2MB.");
        return;
      }
      setEditingClubLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingClubLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditClub = (club: any) => {
    setEditingClubId(club.id);
    setEditingClubName(club.name || "");
    setEditingFromDate(club.from || YEARS[0]);
    setEditingToDate(club.to || "Present");
    setEditingClubLogo(getValidLogoSrc(club.logo));
    setEditingClubLogoFile(null);
    setIsAdding(false);
  };

  const cancelEditClub = () => {
    setEditingClubId(null);
    setEditingClubName("");
    setEditingClubLogo(null);
    setEditingClubLogoFile(null);
  };

  const saveEditClub = async () => {
    if (!editingClubName.trim()) {
      toast.error("Please enter a club name");
      return;
    }

    const targetClub = playerData?.clubs?.find((c) => c.id === editingClubId || c._id === editingClubId);
    if (!targetClub) return;

    const clubId = targetClub._id || targetClub.id;
    if (!clubId || clubId.length < 12) {
      toast.error("Cannot update mock club. Please add a real club.");
      return;
    }

    try {
      setIsUpdatingLoading(true);
      await handleUpdateClub({
        clubId,
        name: editingClubName.trim(),
        from: editingFromDate,
        to: editingToDate,
        logoFile: editingClubLogoFile,
      });
      cancelEditClub();
    } catch {
      // Error toast is handled centrally by playerApi mutation
    } finally {
      setIsUpdatingLoading(false);
    }
  };

  const updateClub = async (id: string, field: string, value: string | number | object | null) => {
    const targetClub = playerData?.clubs?.find((c) => c.id === id || c._id === id);
    if (!targetClub) return;

    const clubId = targetClub._id || targetClub.id;
    if (!clubId || clubId.length < 12) {
      toast.error("Cannot update mock club. Please add a real club first.");
      return;
    }

    const name = field === "name" ? String(value) : targetClub.name;
    const from = field === "from" ? String(value) : targetClub.from;
    const to = field === "to" ? String(value) : targetClub.to;
    const logoFile = field === "logoFile" && value instanceof File ? value : null;

    try {
      await handleUpdateClub({
        clubId,
        name,
        from,
        to,
        logoFile,
      });
    } catch {
      // Error toast is handled centrally by playerApi mutation
    }
  };

  const removeClub = async (id: string) => {
    const targetClub = playerData?.clubs?.find((c) => c.id === id || c._id === id);
    const clubId = targetClub?._id || targetClub?.id || id;
    if (!clubId || clubId.length < 12) {
      toast.error("Cannot delete mock club.");
      return;
    }

    try {
      setDeletingId(id);
      await handleDeleteClub(clubId);
    } catch {
      // Error toast is handled centrally by playerApi mutation
    } finally {
      setDeletingId(null);
    }
  };

  const cancelAddClub = () => {
    setIsAdding(false);
    setNewClubName("");
    setNewClubLogo(null);
    setNewClubLogoFile(null);
    setLogoError(false);
    setNameError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addClub = async () => {
    let hasError = false;

    if (!newClubLogoFile && !newClubLogo) {
      setLogoError(true);
      toast.error("Club logo is required");
      hasError = true;
    }

    if (!newClubName.trim()) {
      setNameError(true);
      if (!hasError) {
        toast.error("Please enter a club name");
      }
      hasError = true;
    }

    if (hasError) {
      return;
    }

    if (isLimitReached) {
      toast.error("Maximum 6 clubs allowed");
      return;
    }

    try {
      setIsAddingLoading(true);
      await handleAddClub({
        name: newClubName.trim(),
        from: fromDate,
        to: toDate,
        logoFile: newClubLogoFile,
        previewLogo: newClubLogo,
      });

      // Reset state
      cancelAddClub();
    } catch {
      // Error toast is handled centrally by playerApi mutation
    } finally {
      setIsAddingLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-10 bg-cardBg rounded-xl mt-10 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-1/3 justify-center sm:justify-start">
          <Info size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{clubCount}/6 Clubs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-center text-foreground font-heading order-1 sm:order-2 w-full sm:w-1/3">
          Clubs
        </h1>
        <div className="order-3 w-full sm:w-1/3 flex justify-center sm:justify-end">
          {editable && (
            <Button
              onClick={() => {
                if (isLimitReached) {
                  toast.error("Maximum 6 clubs allowed. Remove an entry to add a new one.");
                } else {
                  cancelEditClub();
                  cancelAddClub();
                  setIsAdding(true);
                }
              }}
              disabled={isLimitReached && !isAdding}
              className={cn(
                "transition-all font-bold w-full sm:w-auto",
                isLimitReached ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              size="sm"
            >
              <Plus className="size-4 mr-2" /> Add Club
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border bg-black/30 rounded-2xl p-4 sm:p-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
          {playerData?.clubs?.map((club) => {
            if (editingClubId === club.id) {
              return (
                <div
                  key={club.id}
                  className="border-2 border-primary/60 bg-primary/5 rounded-lg p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200 w-full min-w-0"
                >
                  <div className="flex justify-between items-center w-full min-w-0">
                    <span className="text-xs font-bold text-primary uppercase shrink-0">Edit Club</span>
                    <button
                      onClick={cancelEditClub}
                      className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      title="Cancel edit"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 w-full min-w-0">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center gap-2 sm:gap-3 w-full min-w-0">
                      <div
                        onClick={() => editFileInputRef.current?.click()}
                        className="size-16 sm:size-20 rounded-full border-2 border-dashed border-primary/40 hover:border-primary bg-black/40 flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative group/editlogo"
                        title="Click to change logo"
                      >
                        {getValidLogoSrc(editingClubLogo) ? (
                          <Image
                            src={getValidLogoSrc(editingClubLogo)!}
                            alt="Preview"
                            width={80}
                            height={80}
                            unoptimized
                            className="size-full object-contain p-2"
                          />
                        ) : (
                          <Upload size={20} className="text-muted-foreground sm:size-6" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/editlogo:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload size={16} className="text-white" />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">Change Club Logo</span>
                      <input
                        type="file"
                        ref={editFileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleEditLogoUpload}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase">Club Name</span>
                      <input
                        type="text"
                        placeholder="Enter club name..."
                        className="w-full bg-black/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        value={editingClubName}
                        onChange={(e) => setEditingClubName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase">From</span>
                        <select
                          className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                          value={editingFromDate}
                          onChange={(e) => setEditingFromDate(e.target.value)}
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y} className="bg-gray-900 text-foreground">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase">To</span>
                        <select
                          className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                          value={editingToDate}
                          onChange={(e) => setEditingToDate(e.target.value)}
                        >
                          {TO_YEARS.map((y) => (
                            <option key={y} value={y} className="bg-gray-900 text-foreground">
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        type="button"
                        onClick={cancelEditClub}
                        variant="outline"
                        size="sm"
                        className="w-1/2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={saveEditClub}
                        disabled={!editingClubName.trim() || isUpdatingLoading}
                        className="w-1/2 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                        size="sm"
                      >
                        {isUpdatingLoading ? (
                          <span className="flex items-center gap-2">Updating...</span>
                        ) : (
                          <>
                            <Check className="size-4 mr-1.5" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={club.id}
                className="relative border border-border cursor-pointer hover:bg-cardBg duration-300 bg-black/20 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4 group transition w-full min-w-0"
              >
                {editable && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditClub(club);
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded hover:bg-white/5"
                      title="Edit club"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeClub(club.id);
                      }}
                      disabled={deletingId === club.id}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-white/5 disabled:opacity-50"
                      title="Delete club"
                    >
                      <Trash2 size={14} className={cn(deletingId === club.id && "animate-spin")} />
                    </button>
                  </div>
                )}

                <div className="shrink-0 relative group/logo">
                  <div
                    onClick={() => {
                      if (editable) {
                        const input = document.getElementById(`club-logo-${club.id}`) as HTMLInputElement;
                        input?.click();
                      }
                    }}
                    className={cn(
                      "size-16 sm:size-20 rounded-full border-2 flex items-center justify-center overflow-hidden bg-gray-900 relative",
                      editable && "cursor-pointer hover:border-primary/80 transition-colors",
                      club.color || "border-primary"
                    )}
                    title={editable ? "Click to change club logo" : undefined}
                  >
                    <Image
                      src={getValidLogoSrc(club.logo) || club1}
                      alt={club.name}
                      width={80}
                      height={80}
                      unoptimized={Boolean(typeof club.logo === "string" && (club.logo.startsWith("data:") || club.logo.startsWith("blob:")))}
                      className="object-contain p-2"
                    />
                    {editable && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  {editable && (
                    <input
                      id={`club-logo-${club.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("File size too large. Max 2MB.");
                            return;
                          }
                          updateClub(club.id, "logoFile", file);
                        }
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 w-full min-w-0 flex flex-col items-center">
                  <CMSField
                    value={club.name}
                    onUpdate={(val) => updateClub(club.id, "name", val)}
                    canEdit={editable}
                    className="text-base sm:text-lg font-semibold text-foreground wrap-break-word uppercase leading-tight w-full min-w-0 flex justify-center text-center px-4"
                    inputClassName="w-full min-w-0 text-center"
                  />
                  <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1 w-full min-w-0">
                    <CMSField
                      value={club.from}
                      onUpdate={(val) => updateClub(club.id, "from", val)}
                      canEdit={editable}
                      type="combobox"
                      options={YEARS}
                      editTrigger="doubleClick"
                      hideIcon={true}
                      className="w-14 sm:w-16 min-w-0"
                      inputClassName="truncate min-w-0"
                    />
                    <span className="shrink-0">-</span>
                    <CMSField
                      value={club.to}
                      onUpdate={(val) => updateClub(club.id, "to", val)}
                      canEdit={editable}
                      type="combobox"
                      options={TO_YEARS}
                      editTrigger="doubleClick"
                      hideIcon={true}
                      className="w-16 sm:w-20 min-w-0"
                      inputClassName="truncate min-w-0"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {isAdding && (
            <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200 w-full min-w-0">
              <div className="flex justify-between items-center w-full min-w-0">
                <span className="text-xs font-bold text-primary uppercase shrink-0">New Club Entry</span>
                <button
                  onClick={cancelAddClub}
                  className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4 w-full min-w-0">
                {/* Logo Upload Section */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 w-full min-w-0">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "size-16 sm:size-20 rounded-full border-2 border-dashed bg-black/40 flex items-center justify-center cursor-pointer transition-colors overflow-hidden relative group/newlogo",
                      logoError
                        ? "border-destructive bg-destructive/10 hover:border-destructive"
                        : "border-border hover:border-primary"
                    )}
                    title="Click to upload club logo (Required)"
                  >
                    {getValidLogoSrc(newClubLogo) ? (
                      <Image
                        src={getValidLogoSrc(newClubLogo)!}
                        alt="Preview"
                        width={80}
                        height={80}
                        unoptimized
                        className="size-full object-contain p-2"
                      />
                    ) : (
                      <Upload
                        size={20}
                        className={cn(
                          "sm:size-6 transition-colors",
                          logoError ? "text-destructive" : "text-muted-foreground"
                        )}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/newlogo:opacity-100 flex items-center justify-center transition-opacity">
                      <Upload size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        "text-[10px] uppercase font-medium",
                        logoError ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      Club Logo <span className="text-destructive">*</span>
                    </span>
                    {logoError && (
                      <span className="text-[11px] text-destructive font-medium">
                        Club logo image is required
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    Club Name <span className="text-destructive">*</span>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter club name..."
                    className={cn(
                      "w-full bg-black/50 border rounded px-3 py-2 text-sm text-foreground focus:outline-none transition-colors",
                      nameError
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    )}
                    value={newClubName}
                    onChange={(e) => {
                      setNewClubName(e.target.value);
                      if (nameError && e.target.value.trim()) {
                        setNameError(false);
                      }
                    }}
                  />
                  {nameError && (
                    <span className="text-[11px] text-destructive font-medium">
                      Club name is required
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">From</span>
                    <select
                      className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y} className="bg-gray-900 text-foreground">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">To</span>
                    <select
                      className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    >
                      {TO_YEARS.map((y) => (
                        <option key={y} value={y} className="bg-gray-900 text-foreground">
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={addClub}
                  disabled={isAddingLoading}
                  className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 mt-2"
                  size="sm"
                >
                  {isAddingLoading ? (
                    <span className="flex items-center gap-2">Adding...</span>
                  ) : (
                    <>
                      <Check className="size-4 mr-2" /> Confirm Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubSection;