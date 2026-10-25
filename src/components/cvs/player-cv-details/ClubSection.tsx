/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import CMSField from '@/components/shared/CMSField';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, Check, Info, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import club1 from '@/assets/cvs/club1.png';
import Image from 'next/image';

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const TO_YEARS = ["Present", ...YEARS];

const ClubSection = ({ editable = true }: { editable?: boolean }) => {
  const { playerData, handleUpdate, handleAddClub } = usePlayer();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingLoading, setIsAddingLoading] = useState(false);
  
  // States for new club entry
  const [newClubName, setNewClubName] = useState("");
  const [newClubLogo, setNewClubLogo] = useState<string | null>(null);
  const [newClubLogoFile, setNewClubLogoFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState(YEARS[0]);
  const [toDate, setToDate] = useState("Present");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clubCount = playerData?.clubs?.length || 0;
  const isLimitReached = clubCount >= 6;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("File size too large. Max 2MB.");
        return;
      }
      setNewClubLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewClubLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateClub = (id: string, field: string, value: string | number | object | null) => {
    const newClubs = playerData.clubs.map(club =>
      club.id === id ? { ...club, [field]: value } : club
    );
    handleUpdate("clubs", newClubs);
  };

  const removeClub = (id: string) => {
    const newClubs = playerData.clubs.filter(club => club.id !== id);
    handleUpdate("clubs", newClubs);
  };

  const addClub = async () => {
    if (!newClubName.trim()) {
      toast.error("Please enter a club name");
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
      setIsAdding(false);
      setNewClubName("");
      setNewClubLogo(null);
      setNewClubLogoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Club added successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to add club");
    } finally {
      setIsAddingLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-10 bg-cardBg rounded-xl mt-10 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-1/3 justify-center sm:justify-start">
           <Info size={14} className="text-gray-400" />
           <span className="text-xs text-gray-400">{clubCount}/6 Clubs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-center text-foreground font-heading order-1 sm:order-2 w-full sm:w-1/3">Clubs</h1>
        <div className="order-3 w-full sm:w-1/3 flex justify-center sm:justify-end">
          {editable && (
            <Button
              onClick={() => {
                if (isLimitReached) {
                  toast.error("Maximum 6 clubs allowed. Remove an entry to add a new one.");
                } else {
                  setIsAdding(true);
                }
              }}
              disabled={isLimitReached && !isAdding}
              className={cn(
                "text-black transition-all font-bold w-full sm:w-auto",
                isLimitReached ? "bg-gray-600 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
              )}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Club
            </Button>
          )}
        </div>
      </div>

      <div className="border border-border bg-black/30 rounded-2xl p-4 sm:p-8 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
          {playerData?.clubs?.map((club) => (
            <div
              key={club.id}
              className="relative border border-border cursor-pointer hover:bg-cardBg duration-300 bg-black/20 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4 group transition w-full min-w-0"
            >
              {editable && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeClub(club.id); }}
                  className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div className="shrink-0 relative group/logo">
                <div className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center overflow-hidden bg-gray-900",
                  club.color || "border-primary"
                )}>
                  <Image
                    src={(club.logo && (typeof club.logo === 'string' ? !club.logo.startsWith('bg-') : true)) ? club.logo : club1}
                    alt={club.name}
                    width={80}
                    height={80}
                    className="object-contain p-2"
                  />
                </div>
              </div>
              <div className="flex-1 w-full min-w-0 flex flex-col items-center">
                <CMSField
                  value={club.name}
                  onUpdate={(val) => updateClub(club.id, "name", val)}
                  canEdit={editable}
                  className="text-base sm:text-lg font-semibold text-foreground wrap-break-word uppercase leading-tight w-full min-w-0 flex justify-center text-center px-4"
                  inputClassName="w-full min-w-0 text-center"
                />
                <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-gray-400 mt-1 w-full min-w-0">
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
          ))}

          {isAdding && (
            <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200 w-full min-w-0">
              <div className="flex justify-between items-center w-full min-w-0">
                <span className="text-xs font-bold text-primary uppercase shrink-0">New Club Entry</span>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewClubName("");
                    setNewClubLogo(null);
                    setNewClubLogoFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 w-full min-w-0">
                {/* Logo Upload Section */}
                <div className="flex flex-col items-center gap-2 sm:gap-3 w-full min-w-0">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-gray-700 bg-black/40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                  >
                    {newClubLogo ? (
                      <Image src={newClubLogo} alt="Preview" width={80} height={80} className="object-contain p-2" />
                    ) : (
                      <Upload size={20} className="text-gray-500 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase">Club Logo</span>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 uppercase">Club Name</span>
                  <input
                    type="text"
                    placeholder="Enter club name..."
                    className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">From</span>
                    <select
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    >
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">To</span>
                    <select
                      className="w-full bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm text-white"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    >
                      {TO_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={addClub}
                  disabled={!newClubName.trim() || isAddingLoading}
                  className="w-full bg-primary text-black font-bold hover:bg-primary/90 mt-2"
                  size="sm"
                >
                  {isAddingLoading ? (
                    <span className="flex items-center gap-2">Adding...</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Confirm Add
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