"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { useCoach } from "@/hooks/useCoach";
import CMSField from "@/components/shared/CMSField";
import { cn } from "@/lib/utils";
import { Plus, Trash2, X, Check, Info, Upload, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePlayerStats } from "@/components/cvs/player-cv-details/FullEditablePage";
import {
  useAddCoachClubMutation,
  useUpdateCoachClubMutation,
  useDeleteCoachClubMutation,
} from "@/redux/features/coach/coachApi";

import clubImage from "@/assets/cvs/club1.png";

const YEARS = Array.from({ length: 30 }, (_, i) => String(new Date().getFullYear() - i));
const TO_YEARS = ["Present", ...YEARS];

interface EditingClubState {
  id: string;
  clubName: string;
  fromDate: string;
  toDate: string;
  logoPreview: string | null;
  logoFile: File | null;
}

const CoachClubsSection = ({ editable = true }: { editable?: boolean }) => {
  const { coachData } = useCoach();
  const { role } = usePlayerStats() || { role: "player" };

  const canEdit = !!(editable && (role === "coach" || role === "admin" || role === "super_admin" || !role));

  const [addCoachClub, { isLoading: isAddingClub }] = useAddCoachClubMutation();
  const [updateCoachClub, { isLoading: isUpdatingClub }] = useUpdateCoachClubMutation();
  const [deleteCoachClub] = useDeleteCoachClubMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);

  // States for new club entry
  const [newClubName, setNewClubName] = useState("");
  const [newClubLogo, setNewClubLogo] = useState<string | null>(null);
  const [newClubLogoFile, setNewClubLogoFile] = useState<File | null>(null);
  const [fromDate, setFromDate] = useState(YEARS[0]);
  const [toDate, setToDate] = useState("Present");

  // State for edit modal
  const [editingClub, setEditingClub] = useState<EditingClubState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const clubs = coachData?.clubs || [];
  const clubCount = clubs.length;
  const isLimitReached = clubCount >= 6;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
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

  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size too large. Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingClub((prev) =>
          prev
            ? {
                ...prev,
                logoFile: file,
                logoPreview: reader.result as string,
              }
            : null
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Club via POST /coaches/me/clubs
  const handleAddClub = async () => {
    if (!newClubName.trim()) {
      toast.error("Please enter a club name");
      return;
    }
    if (isLimitReached) {
      toast.error("Maximum 6 clubs allowed");
      return;
    }

    try {
      const formData = new FormData();
      if (newClubLogoFile) {
        formData.append("image", newClubLogoFile);
      }
      const payload = {
        clubName: newClubName.trim(),
        period: `${fromDate} - ${toDate}`,
        isCurrent: toDate === "Present",
      };
      formData.append("data", JSON.stringify(payload));

      await addCoachClub(formData).unwrap();

      // Reset state
      setIsAdding(false);
      setNewClubName("");
      setNewClubLogo(null);
      setNewClubLogoFile(null);
      setFromDate(YEARS[0]);
      setToDate("Present");
    } catch {
      // Error toast is handled by coachApi onQueryStarted
    }
  };

  // Delete Club via DELETE /coaches/me/clubs/:clubId
  const handleDeleteClub = async (id: string) => {
    try {
      setDeletingClubId(id);
      await deleteCoachClub(id).unwrap();
    } catch {
      // Error toast is handled by coachApi onQueryStarted
    } finally {
      setDeletingClubId(null);
    }
  };

  // Quick Inline CMSField update via PATCH /coaches/me/clubs/:clubId
  const handleInlineUpdate = async (
    club: { id: string; _id?: string; name: string; from: string; to: string },
    field: "name" | "from" | "to",
    value: string | number | object | null
  ) => {
    const clubId = club._id || club.id;
    if (!clubId) return;

    const updatedName = field === "name" ? String(value || "") : club.name;
    const updatedFrom = field === "from" ? String(value || "") : club.from;
    const updatedTo = field === "to" ? String(value || "") : club.to;

    try {
      const payload = {
        clubName: updatedName,
        period: `${updatedFrom} - ${updatedTo}`,
        isCurrent: updatedTo === "Present",
      };
      await updateCoachClub({ clubId, data: payload }).unwrap();
    } catch {
      // Error toast is handled by coachApi onQueryStarted
    }
  };

  // Open Edit Modal for a Club
  const handleOpenEdit = (club: {
    id: string;
    _id?: string;
    name: string;
    from: string;
    to: string;
    logo?: unknown;
  }) => {
    const logoStr =
      typeof club.logo === "string" && !club.logo.startsWith("bg-")
        ? club.logo
        : null;

    setEditingClub({
      id: club._id || club.id,
      clubName: club.name,
      fromDate: club.from || YEARS[0],
      toDate: club.to || "Present",
      logoPreview: logoStr,
      logoFile: null,
    });
  };

  // Save Edit via PATCH /coaches/me/clubs/:clubId
  const handleSaveEdit = async () => {
    if (!editingClub) return;
    if (!editingClub.clubName.trim()) {
      toast.error("Please enter a club name");
      return;
    }

    try {
      const formData = new FormData();
      if (editingClub.logoFile) {
        formData.append("image", editingClub.logoFile);
      }
      const payload = {
        clubName: editingClub.clubName.trim(),
        period: `${editingClub.fromDate} - ${editingClub.toDate}`,
        isCurrent: editingClub.toDate === "Present",
      };
      formData.append("data", JSON.stringify(payload));

      await updateCoachClub({ clubId: editingClub.id, data: formData }).unwrap();
      setEditingClub(null);
    } catch {
      // Error toast is handled by coachApi onQueryStarted
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-10 py-10 bg-cardBg rounded-xl mt-10 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 w-full min-w-0">
        <div className="flex items-center gap-2 order-2 sm:order-1 w-full sm:w-1/3 justify-center sm:justify-start">
          <Info className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
            {clubCount}/6 Clubs
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-light text-center text-foreground font-heading order-1 sm:order-2 w-full sm:w-1/3">
          Clubs
        </h1>
        <div className="order-3 w-full sm:w-1/3 flex justify-center sm:justify-end">
          {canEdit ? (
            <Button
              onClick={() => {
                if (isLimitReached) {
                  toast.error("Maximum 6 clubs allowed. Remove an entry to add a new one.");
                } else {
                  setIsAdding(true);
                }
              }}
              disabled={(isLimitReached && !isAdding) || isAddingClub}
              className={cn(
                "transition-all font-bold w-full sm:w-auto",
                isLimitReached ? "cursor-not-allowed opacity-60" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
              size="sm"
            >
              <Plus className="size-4 mr-2" /> Add Club
            </Button>
          ) : (
            <div className="w-8 sm:w-24 shrink-0" />
          )}
        </div>
      </div>

      <div className="border border-border bg-black/30 rounded-2xl p-4 sm:p-8 w-full min-w-0">
        {clubs.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <p className="text-sm text-muted-foreground">No clubs added yet.</p>
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="mt-2"
              >
                <Plus className="size-4 mr-2" /> Add your first club
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
            {clubs.map((club) => {
              const clubId = club._id || club.id;
              const isDeletingThis = deletingClubId === clubId;

              return (
                <div
                  key={clubId}
                  className={cn(
                    "relative border border-border duration-300 bg-black/20 rounded-lg p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4 group transition w-full min-w-0",
                    isDeletingThis && "opacity-50 pointer-events-none"
                  )}
                >
                  {canEdit && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(club);
                        }}
                        title="Edit Club"
                        className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-white/5 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClub(clubId);
                        }}
                        disabled={isDeletingThis}
                        title="Delete Club"
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="size-3.5 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="shrink-0 relative group/logo">
                    <div
                      className={cn(
                        "size-16 sm:size-20 rounded-full border-2 flex items-center justify-center overflow-hidden bg-black/50 border-primary"
                      )}
                    >
                      <Image
                        src={
                          club.logo &&
                          typeof club.logo === "string" &&
                          !club.logo.startsWith("bg-")
                            ? club.logo
                            : clubImage
                        }
                        alt={club.name || "Club Logo"}
                        width={80}
                        height={80}
                        className="object-contain p-2"
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full min-w-0 flex flex-col items-center">
                    <CMSField
                      value={club.name}
                      onUpdate={(val) => handleInlineUpdate(club, "name", val)}
                      canEdit={canEdit}
                      className="text-base sm:text-lg font-semibold text-foreground wrap-break-word uppercase leading-tight w-full min-w-0 flex justify-center text-center px-4"
                      inputClassName="w-full min-w-0 text-center"
                    />
                    <div className="flex flex-wrap items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground mt-1 w-full min-w-0">
                      <CMSField
                        value={club.from}
                        onUpdate={(val) => handleInlineUpdate(club, "from", val)}
                        canEdit={canEdit}
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
                        onUpdate={(val) => handleInlineUpdate(club, "to", val)}
                        canEdit={canEdit}
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

            {/* Add New Club Card */}
            {isAdding && (
              <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200 w-full min-w-0">
                <div className="flex justify-between items-center w-full min-w-0">
                  <span className="text-xs font-bold text-primary uppercase shrink-0">
                    New Club Entry
                  </span>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewClubLogo(null);
                      setNewClubLogoFile(null);
                      setNewClubName("");
                    }}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Logo Upload Section */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="size-20 rounded-full border-2 border-dashed border-border bg-black/40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    >
                      {newClubLogo ? (
                        <Image
                          src={newClubLogo}
                          alt="Preview"
                          width={80}
                          height={80}
                          className="object-contain p-2"
                        />
                      ) : (
                        <Upload className="size-6 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Club Logo
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Club Name
                    </span>
                    <input
                      type="text"
                      placeholder="Enter club name..."
                      className="w-full bg-black/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                      value={newClubName}
                      onChange={(e) => setNewClubName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        From
                      </span>
                      <select
                        className="w-full bg-black/50 border border-border rounded px-2 py-1 text-sm text-foreground"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y} className="bg-background text-foreground">
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        To
                      </span>
                      <select
                        className="w-full bg-black/50 border border-border rounded px-2 py-1 text-sm text-foreground"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      >
                        {TO_YEARS.map((y) => (
                          <option key={y} value={y} className="bg-background text-foreground">
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleAddClub}
                    disabled={!newClubName.trim() || isAddingClub}
                    className="w-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 mt-2"
                    size="sm"
                  >
                    {isAddingClub ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="size-4 mr-2" />
                    )}
                    Confirm Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Club Dialog */}
      <Dialog open={!!editingClub} onOpenChange={(open) => !open && setEditingClub(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading uppercase text-foreground">
              Edit Club
            </DialogTitle>
          </DialogHeader>

          {editingClub && (
            <div className="flex flex-col gap-4 py-2">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="size-20 rounded-full border-2 border-dashed border-border bg-black/40 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
                >
                  {editingClub.logoPreview ? (
                    <Image
                      src={editingClub.logoPreview}
                      alt="Logo Preview"
                      width={80}
                      height={80}
                      className="object-contain p-2"
                    />
                  ) : (
                    <Upload className="size-6 text-muted-foreground" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase">
                  Change Club Logo
                </span>
                <input
                  type="file"
                  ref={editFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleEditLogoUpload}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground uppercase font-medium">
                  Club Name
                </label>
                <input
                  type="text"
                  placeholder="Enter club name..."
                  className="w-full bg-black/50 border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                  value={editingClub.clubName}
                  onChange={(e) =>
                    setEditingClub((prev) =>
                      prev ? { ...prev, clubName: e.target.value } : null
                    )
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground uppercase font-medium">
                    From Year
                  </label>
                  <select
                    className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground"
                    value={editingClub.fromDate}
                    onChange={(e) =>
                      setEditingClub((prev) =>
                        prev ? { ...prev, fromDate: e.target.value } : null
                      )
                    }
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-background text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground uppercase font-medium">
                    To Year
                  </label>
                  <select
                    className="w-full bg-black/50 border border-border rounded px-2 py-1.5 text-sm text-foreground"
                    value={editingClub.toDate}
                    onChange={(e) =>
                      setEditingClub((prev) =>
                        prev ? { ...prev, toDate: e.target.value } : null
                      )
                    }
                  >
                    {TO_YEARS.map((y) => (
                      <option key={y} value={y} className="bg-background text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingClub(null)}
                  disabled={isUpdatingClub}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editingClub.clubName.trim() || isUpdatingClub}
                  className="bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                >
                  {isUpdatingClub ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="size-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachClubsSection;
