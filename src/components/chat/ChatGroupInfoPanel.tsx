/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconAlertCircle,
  IconCamera,
  IconCrown,
  IconLoader2,
  IconPencil,
  IconPhotoX,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/redux/hooks/hooks";
import {
  useDeleteConversationMutation,
  useGetConversationDetailsQuery,
  useUpdateConversationMutation,
} from "@/redux/features/chat/chatApi";
import { patchConversation } from "@/redux/features/chat/chatSlice";
import { getRoleBadgeStyle } from "@/helpers/ChatHelper";
import type { IConversationMember } from "@/types/chat.type";
import { cn } from "@/lib/utils";
import ChatAvatar from "./ChatAvatar";

const apiMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || fallback;

const MemberRow = ({ member }: { member: IConversationMember }) => {
  const roleStyle = getRoleBadgeStyle(member.userRole);
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-white/5">
      <div className="relative shrink-0">
        <ChatAvatar src={member.avatar} name={member.name} className="size-10 text-sm" />
        {member.isOnline && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111111]" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-bold text-white">{member.name || "Member"}</span>
          {member.isMe && <span className="shrink-0 text-[11px] font-semibold text-white/40">(You)</span>}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {member.userRole && (
            <Badge className={cn("h-4 px-1.5 py-0 text-[8px] font-bold uppercase", roleStyle.badge)}>
              {member.userRole}
            </Badge>
          )}
          {member.isAdmin && (
            <Badge className="h-4 gap-0.5 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[8px] font-bold uppercase text-amber-400">
              <IconCrown className="size-2.5" /> Admin
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

interface GroupInfoBodyProps {
  conversationId: string;
  onDeleted: (conversationId: string) => void;
}

const GroupInfoBody = ({ conversationId, onDeleted }: GroupInfoBodyProps) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = useGetConversationDetailsQuery(conversationId);
  const [updateConversation, { isLoading: isSaving }] = useUpdateConversationMutation();
  const [deleteConversation, { isLoading: isDeleting }] = useDeleteConversationMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Free the preview's object URL when it is replaced or the panel closes.
  useEffect(
    () => () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview]
  );

  const details = data?.data;
  const isGroup = details?.type === "GROUP";
  const canEdit = Boolean(isGroup && details?.permissions?.canEdit);
  const canDelete = Boolean(isGroup && details?.permissions?.canDelete);
  const groupName = details?.name || "Group Chat";
  const shownAvatar = avatarPreview || (removeAvatar ? "" : details?.avatar || "");

  const startEditing = () => {
    setNameDraft(details?.name || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
  };

  const handlePickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (!isEditing) startEditing();
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const trimmedName = nameDraft.trim();
  const nameChanged = isEditing && trimmedName !== (details?.name || "");
  const nameInvalid = isEditing && (trimmedName.length < 1 || trimmedName.length > 100);
  const hasChanges = Boolean(avatarFile) || removeAvatar || nameChanged;

  const handleSave = async () => {
    if (!hasChanges || nameInvalid || isSaving) return;
    const body = new FormData();
    if (avatarFile) body.append("avatar", avatarFile);
    else if (removeAvatar) body.append("removeAvatar", "true");
    if (nameChanged) body.append("name", trimmedName);
    try {
      const res = await updateConversation({ conversationId, body }).unwrap();
      const updated = res?.data;
      dispatch(
        patchConversation({
          conversationId,
          name: updated?.name ?? (nameChanged ? trimmedName : undefined),
          avatar: updated ? updated.avatar ?? "" : undefined,
          membersCount: updated?.membersCount,
        })
      );
      toast.success(res?.message || "Group updated");
      cancelEditing();
    } catch (err) {
      toast.error(apiMessage(err, "Failed to update the group"));
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      const res = await deleteConversation(conversationId).unwrap();
      toast.success(res?.message || "Group deleted");
      setConfirmDelete(false);
      onDeleted(conversationId);
    } catch (err) {
      toast.error(apiMessage(err, "Failed to delete the group"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-white/40">
        <IconLoader2 className="animate-spin" size={24} />
        <span className="text-xs">Loading group info...</span>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <IconAlertCircle className="size-7 text-destructive" />
        <p className="text-sm text-white/70">{apiMessage(error, "Could not load the group info.")}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5 custom-scrollbar">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <button
              type="button"
              disabled={!canEdit || isSaving}
              onClick={() => fileInputRef.current?.click()}
              title={canEdit ? "Change group image" : undefined}
              className={cn("group relative rounded-full", canEdit && "cursor-pointer")}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="New group image" className="size-24 rounded-full object-cover" />
              ) : (
                <ChatAvatar src={shownAvatar} name={groupName} isGroup={isGroup} className="size-24 text-2xl" />
              )}
              {canEdit && (
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <IconCamera className="size-6" />
                </span>
              )}
            </button>
            {canEdit && (
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePickAvatar} className="hidden" />
            )}
          </div>

          {isEditing ? (
            <div className="flex w-full flex-col gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={100}
                placeholder="Group name"
                className="border-white/10 bg-white/5 text-center text-white"
              />
              {nameInvalid && <p className="text-[11px] text-destructive">Name must be 1–100 characters.</p>}
              {(details.avatar || avatarFile) && !removeAvatar && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                    setRemoveAvatar(true);
                  }}
                  className="mx-auto flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-white/50 hover:text-white"
                >
                  <IconPhotoX className="size-3.5" /> Remove image
                </button>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 gap-2"
                  onClick={handleSave}
                  disabled={!hasChanges || nameInvalid || isSaving}
                >
                  {isSaving && <IconLoader2 className="size-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <h3 className="break-words text-lg font-black text-white">{groupName}</h3>
              <p className="text-xs text-white/40">
                {isGroup ? "Group" : "Direct chat"} · {details.membersCount} members
              </p>
            </div>
          )}
        </div>

        {/* Members (server order: admins first, then by name) */}
        <div className="flex flex-col gap-1">
          <span className="px-2 text-[10px] font-black uppercase tracking-widest text-white/40">
            Members ({details.membersCount})
          </span>
          {details.members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      </div>

      {(canEdit || canDelete) && !isEditing && (
        <div className="flex flex-col gap-2 border-t border-white/10 p-4">
          {canEdit && (
            <Button type="button" variant="outline" className="gap-2" onClick={startEditing}>
              <IconPencil className="size-4" /> Edit group
            </Button>
          )}
          {canDelete && (
            <Button type="button" variant="destructive" className="gap-2" onClick={() => setConfirmDelete(true)}>
              <IconTrash className="size-4" /> Delete group
            </Button>
          )}
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={(open) => !open && !isDeleting && setConfirmDelete(false)}>
        <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconTrash className="size-5 text-destructive" /> Delete group
            </DialogTitle>
            <DialogDescription>
              Delete this group for everyone? All messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
              {isDeleting && <IconLoader2 className="size-4 animate-spin" />}
              Delete for everyone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ChatGroupInfoPanelProps {
  conversationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after this user deleted the group (close the chat window). */
  onDeleted: (conversationId: string) => void;
}

/** Right-side panel: group members, and (admins only) edit image/name or delete the group. */
export const ChatGroupInfoPanel = ({ conversationId, open, onOpenChange, onDeleted }: ChatGroupInfoPanelProps) => (
  <Sheet open={open && Boolean(conversationId)} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="flex w-full flex-col gap-0 border-white/10 bg-[#111111] p-0 text-white sm:max-w-sm">
      <SheetHeader className="border-b border-white/10 p-4">
        <SheetTitle className="text-white">Group info</SheetTitle>
        <SheetDescription className="sr-only">Members and group settings</SheetDescription>
      </SheetHeader>
      {/* Mounted per open/conversation, so edits never leak between groups. */}
      {open && conversationId && (
        <GroupInfoBody
          key={conversationId}
          conversationId={conversationId}
          onDeleted={onDeleted}
        />
      )}
    </SheetContent>
  </Sheet>
);

export default ChatGroupInfoPanel;
