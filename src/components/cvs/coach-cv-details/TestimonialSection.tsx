/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Star, Plus, Trash2, Pencil, Quote, Upload, X } from "lucide-react";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ErrorToast } from "@/helpers/ValidationHelper";
import {
  useGetMyCoachTestimonialsQuery,
  useCreateCoachTestimonialMutation,
  useUpdateCoachTestimonialMutation,
  useDeleteCoachTestimonialMutation,
} from "@/redux/features/coach/coachApi";
import { ICoachTestimonial } from "@/types/coach.type";
import { useCoach } from "@/hooks/useCoach";

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    authorName: "Emanuel",
    authorRole: "Assistant Coach",
    rating: 5,
    comment: "Working with this coach changed everything for our team. Skills that felt impossible now look effortless.",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    authorName: "Dylan Hodges",
    authorRole: "Head Coach of the club",
    rating: 5,
    comment: "The coach improved our squad faster than we expected. Progress that used to take months now shows within days.",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    authorName: "Madonna",
    authorRole: "Youth Academy Director",
    rating: 5,
    comment: "Our players develop twice as fast under this coach. What once felt confusing is now clear and structured.",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    authorName: "Iris Barrows",
    authorRole: "Professional Scout",
    rating: 5,
    comment: "This coach unlocked a new level in my son's game. Techniques that took ages to grasp now make perfect sense.",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53a8c9c0c0d0?w=400&h=400&fit=crop",
  },
  {
    id: 5,
    authorName: "Jitzsche",
    authorRole: "National Data Engineer",
    rating: 5,
    comment: "Simplified learning for our players. Skills that took forever to pick up now come quickly.",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
  {
    id: 6,
    authorName: "Elliott",
    authorRole: "Senior Tactics Executive",
    rating: 5,
    comment: "The coach has simplified learning for our players. Skills that took forever to pick up now come quickly.",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: 7,
    authorName: "Evelyn Pollich",
    authorRole: "Strategist",
    rating: 5,
    comment: "Our team grows rapidly with this coach. Drills that used to drain the boys now boost their confidence.",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  },
  {
    id: 8,
    authorName: "Shanelle",
    authorRole: "Coordinator",
    rating: 5,
    comment: "The coach brought discipline and clarity. Progress that was slow before now happens session after session.",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    id: 9,
    authorName: "Aletha",
    authorRole: "Assistant",
    rating: 5,
    comment: "This coach helps players improve. Techniques that took repeated practice now look natural.",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53a8c9c0c0d0?w=400&h=400&fit=crop",
  },
];

interface FormState {
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
}

const initialFormState: FormState = {
  authorName: "",
  authorRole: "",
  rating: 5,
  comment: "",
};

const TestimonialSection = ({ editable = false }: { editable?: boolean }) => {
  const { isViewingSpecificCoach } = useCoach();
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("token") || localStorage.getItem("accessToken"));

  const { data: testimonialsResponse, isLoading } = useGetMyCoachTestimonialsQuery(
    undefined,
    { skip: !hasToken || isViewingSpecificCoach }
  );

  const canEdit = editable && !isViewingSpecificCoach;

  const [createTestimonial, { isLoading: isCreating }] = useCreateCoachTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateCoachTestimonialMutation();
  const [deleteTestimonial, { isLoading: isDeleting }] = useDeleteCoachTestimonialMutation();

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(initialFormState);
  const [addAvatarFile, setAddAvatarFile] = useState<File | null>(null);
  const [addAvatarPreview, setAddAvatarPreview] = useState<string>("");
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<FormState>(initialFormState);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string>("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  const apiTestimonials = testimonialsResponse?.data || [];
  const testimonials = apiTestimonials.length > 0 ? apiTestimonials : DEFAULT_TESTIMONIALS;

  const resetAddForm = () => {
    setAddForm(initialFormState);
    setAddAvatarFile(null);
    setAddAvatarPreview("");
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditForm({
      authorName: item.authorName || item.name || "",
      authorRole: item.authorRole || item.role || "",
      rating: item.rating ?? 5,
      comment: item.comment || item.text || "",
    });
    setEditAvatarFile(null);
    setEditAvatarPreview(item.authorAvatar || item.avatar || "");
    setIsEditOpen(true);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "add" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      ErrorToast("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      ErrorToast("Image size must be less than 5MB.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    if (type === "add") {
      setAddAvatarFile(file);
      setAddAvatarPreview(previewUrl);
    } else {
      setEditAvatarFile(file);
      setEditAvatarPreview(previewUrl);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = addForm.authorName.trim();
    const trimmedComment = addForm.comment.trim();

    if (!trimmedName) {
      ErrorToast("Please enter the author's name.");
      return;
    }
    if (!trimmedComment) {
      ErrorToast("Please enter the testimonial comment.");
      return;
    }

    try {
      const formData = new FormData();
      if (addAvatarFile) {
        formData.append("authorAvatar", addAvatarFile);
      }
      formData.append(
        "data",
        JSON.stringify({
          authorName: trimmedName,
          authorRole: addForm.authorRole.trim() || "Coach",
          rating: Number(addForm.rating) || 5,
          comment: trimmedComment,
        })
      );

      await createTestimonial(formData).unwrap();
      resetAddForm();
      setIsAddOpen(false);
    } catch (err) {
      console.error("Failed to create testimonial:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const testimonialId = editingItem._id;
    if (!testimonialId) {
      ErrorToast("Cannot update sample testimonial. Please add a new one.");
      return;
    }

    const trimmedName = editForm.authorName.trim();
    const trimmedComment = editForm.comment.trim();

    if (!trimmedName) {
      ErrorToast("Please enter the author's name.");
      return;
    }
    if (!trimmedComment) {
      ErrorToast("Please enter the testimonial comment.");
      return;
    }

    try {
      const formData = new FormData();
      if (editAvatarFile) {
        formData.append("authorAvatar", editAvatarFile);
      }
      formData.append(
        "data",
        JSON.stringify({
          authorName: trimmedName,
          authorRole: editForm.authorRole.trim() || "Coach",
          rating: Number(editForm.rating) || 5,
          comment: trimmedComment,
        })
      );

      await updateTestimonial({ testimonialId, formData }).unwrap();
      setIsEditOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to update testimonial:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const testimonialId = itemToDelete._id;
    if (!testimonialId) {
      ErrorToast("Sample testimonials cannot be deleted.");
      setItemToDelete(null);
      return;
    }

    try {
      await deleteTestimonial(testimonialId).unwrap();
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
    }
  };

  const StarRating = ({ rating = 5 }: { rating?: number }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < rating
              ? "fill-green-500 text-green-500"
              : "fill-white/10 text-white/20"
          )}
        />
      ))}
    </div>
  );

  const TestimonialCard = ({ testimonial }: { testimonial: any }) => {
    const name = testimonial.authorName || testimonial.name || "Anonymous";
    const role = testimonial.authorRole || testimonial.role || "Coach";
    const text = testimonial.comment || testimonial.text || "";
    const avatar = testimonial.authorAvatar || testimonial.avatar || "/placeholder_img.jpg";
    const rating = testimonial.rating ?? 5;
    const isRealItem = Boolean(testimonial._id);

    return (
      <div className="bg-[#121212] border border-white/10 hover:border-white/25 rounded-2xl p-6 min-w-[320px] max-w-[380px] shrink-0 group relative overflow-hidden transition-all duration-300">
        {canEdit && isRealItem && (
          <div className="flex items-center gap-1.5 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={() => handleOpenEdit(testimonial)}
              title="Edit Testimonial"
              className="size-7 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setItemToDelete(testimonial)}
              title="Delete Testimonial"
              className="size-7 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-start gap-4 mb-4">
          <div className="size-14 rounded-full overflow-hidden border border-white/15 shrink-0 bg-white/5 relative">
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="56px"
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.srcset = "";
                target.src = "/placeholder_img.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <p className="text-white font-bold text-sm truncate">{name}</p>
            <p className="text-gray-400 text-xs truncate mt-0.5">{role}</p>
            <div className="mt-2">
              <StarRating rating={rating} />
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed relative z-0 italic line-clamp-4">
          <Quote className="size-3 inline-block mr-1 text-[#E31B23] opacity-80 -mt-1" />
          {text}
        </p>
      </div>
    );
  };

  const halfLength = Math.max(1, Math.ceil(testimonials.length / 2));
  const rowOne = testimonials.slice(0, halfLength);
  const rowTwo = testimonials.slice(halfLength);

  return (
    <div className="bg-black py-20 w-full min-w-0 overflow-hidden">
      <div className={canEdit ? "container mx-auto" : "w-full"}>
        {/* Title Area */}
        <div className="flex flex-col items-center mb-14 gap-3 text-center">
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-wide uppercase italic">
            Testimonials
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md">
            Reviews and recommendations from players, club directors, and colleagues
          </p>

          {canEdit && (
            <Button
              type="button"
              onClick={handleOpenAdd}
              className="mt-3 bg-white/5 hover:bg-white/10 text-white border border-white/15 gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs h-auto font-orbitron transition-all cursor-pointer"
            >
              <Plus className="size-4 text-[#E31B23]" /> Add Testimonial
            </Button>
          )}
        </div>

        {/* Loading state indicator */}
        {isLoading && apiTestimonials.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <IconLoader2 className="size-8 text-[#E31B23] animate-spin" />
          </div>
        ) : (
          <>
            {/* First Marquee Row */}
            <div className="mb-6">
              <Marquee
                gradient
                gradientColor="#000000"
                gradientWidth={60}
                pauseOnHover
                speed={35}
              >
                {rowOne.map((testimonial: any, idx: number) => (
                  <div key={testimonial._id || testimonial.id || `row1-${idx}`} className="mr-6">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </Marquee>
            </div>

            {/* Second Marquee Row */}
            {rowTwo.length > 0 && (
              <div>
                <Marquee
                  gradient
                  gradientColor="#000000"
                  gradientWidth={60}
                  pauseOnHover
                  speed={35}
                  direction="right"
                >
                  {rowTwo.map((testimonial: any, idx: number) => (
                    <div key={testimonial._id || testimonial.id || `row2-${idx}`} className="mr-6">
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))}
                </Marquee>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => !isCreating && setIsAddOpen(open)}>
        <DialogContent className="bg-[#161616] border-2 border-white/20 text-white rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
          <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/10">
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase italic tracking-tight font-orbitron text-white">
              Add <span className="text-[#E31B23]">Testimonial</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Add a new review, scout assessment, or endorsement to your coaching profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-5 mt-2">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-orbitron">
                Author Avatar
              </Label>
              <div
                onClick={() => addFileInputRef.current?.click()}
                className="relative group size-20 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/20 hover:border-[#E31B23] transition-all flex items-center justify-center bg-white/5"
              >
                {addAvatarPreview ? (
                  <Image
                    src={addAvatarPreview}
                    alt="Avatar Preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <Upload className="size-6 text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[9px] text-white font-bold uppercase tracking-widest font-orbitron">
                    Upload
                  </span>
                </div>
              </div>
              <input
                ref={addFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "add")}
                className="hidden"
                disabled={isCreating}
              />
              <p className="text-[10px] text-gray-500">Max 5MB (JPG, PNG, WEBP)</p>
            </div>

            {/* Author Name */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="add-author-name"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-author-name"
                value={addForm.authorName}
                onChange={(e) => setAddForm({ ...addForm, authorName: e.target.value })}
                placeholder="e.g. Emanuel"
                disabled={isCreating}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
              />
            </div>

            {/* Author Role */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="add-author-role"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Role / Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-author-role"
                value={addForm.authorRole}
                onChange={(e) => setAddForm({ ...addForm, authorRole: e.target.value })}
                placeholder="e.g. Assistant Coach, Academy Director"
                disabled={isCreating}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
              />
            </div>

            {/* Rating Stars */}
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                Rating <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, rating: star })}
                    className="p-1 text-white/40 hover:text-green-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-6",
                        star <= addForm.rating
                          ? "fill-green-500 text-green-500"
                          : "fill-white/10 text-white/20"
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-300 ml-2 font-orbitron">
                  {addForm.rating} / 5
                </span>
              </div>
            </div>

            {/* Testimony Comment */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="add-comment"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Their Testimony <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="add-comment"
                value={addForm.comment}
                onChange={(e) => setAddForm({ ...addForm, comment: e.target.value })}
                placeholder="Enter their evaluation, remarks, or endorsement..."
                disabled={isCreating}
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40 resize-none p-3"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                disabled={isCreating}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !addForm.authorName.trim() || !addForm.comment.trim()}
                className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-6 h-10 flex items-center gap-2 cursor-pointer font-orbitron disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Adding...
                  </>
                ) : (
                  "Add Testimonial"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => !isUpdating && setIsEditOpen(open)}>
        <DialogContent className="bg-[#161616] border-2 border-white/20 text-white rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto backdrop-blur-2xl">
          <DialogHeader className="text-left flex flex-col gap-1 pb-3 border-b border-white/10">
            <DialogTitle className="text-xl sm:text-2xl font-black uppercase italic tracking-tight font-orbitron text-white">
              Edit <span className="text-[#E31B23]">Testimonial</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Update the testimonial details, rating, or author avatar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-5 mt-2">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 font-orbitron">
                Author Avatar
              </Label>
              <div
                onClick={() => editFileInputRef.current?.click()}
                className="relative group size-20 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-white/20 hover:border-[#E31B23] transition-all flex items-center justify-center bg-white/5"
              >
                {editAvatarPreview ? (
                  <Image
                    src={editAvatarPreview}
                    alt="Avatar Preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <Upload className="size-6 text-gray-400 group-hover:text-[#E31B23] transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[9px] text-white font-bold uppercase tracking-widest font-orbitron">
                    Change
                  </span>
                </div>
              </div>
              <input
                ref={editFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "edit")}
                className="hidden"
                disabled={isUpdating}
              />
              <p className="text-[10px] text-gray-500">Click to change photo (Max 5MB)</p>
            </div>

            {/* Author Name */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="edit-author-name"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-author-name"
                value={editForm.authorName}
                onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                placeholder="e.g. Emanuel"
                disabled={isUpdating}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
              />
            </div>

            {/* Author Role */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="edit-author-role"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Role / Designation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-author-role"
                value={editForm.authorRole}
                onChange={(e) => setEditForm({ ...editForm, authorRole: e.target.value })}
                placeholder="e.g. Assistant Coach"
                disabled={isUpdating}
                className="h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40"
              />
            </div>

            {/* Rating Stars */}
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron">
                Rating <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, rating: star })}
                    className="p-1 text-white/40 hover:text-green-500 transition-colors cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-6",
                        star <= editForm.rating
                          ? "fill-green-500 text-green-500"
                          : "fill-white/10 text-white/20"
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-300 ml-2 font-orbitron">
                  {editForm.rating} / 5
                </span>
              </div>
            </div>

            {/* Testimony Comment */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="edit-comment"
                className="text-[11px] font-bold text-gray-400 uppercase tracking-widest font-orbitron"
              >
                Their Testimony <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-comment"
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                placeholder="Enter their evaluation, remarks, or endorsement..."
                disabled={isUpdating}
                rows={4}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:border-[#E31B23] focus-visible:ring-[#E31B23]/40 resize-none p-3"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isUpdating}
                className="border-white/10 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editForm.authorName.trim() || !editForm.comment.trim()}
                className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-6 h-10 flex items-center gap-2 cursor-pointer font-orbitron disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="bg-[#161616] border-2 border-white/20 text-white rounded-3xl p-6 sm:p-8 max-w-md backdrop-blur-2xl">
          <DialogHeader className="text-left flex flex-col gap-1 pb-2 border-b border-white/10">
            <DialogTitle className="text-lg sm:text-xl font-bold font-orbitron uppercase text-white">
              Delete Testimonial
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Are you sure you want to delete the testimonial by &quot;
              {itemToDelete?.authorName || itemToDelete?.name || "this author"}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-row justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
              className="border-white/15 bg-transparent text-gray-300 hover:bg-white/10 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl font-bold uppercase tracking-wider text-xs px-5 h-10 flex items-center gap-2 cursor-pointer font-orbitron"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestimonialSection;
