/* eslint-disable @next/next/no-img-element */
"use client";
import ChatAvatar from "./ChatAvatar";

import React, { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconSearch,
  IconUser,
  IconUsers,
  IconCamera,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { useGetContactsQuery } from "@/redux/features/chat/chatApi";
import { IContact } from "@/types/chat.type";
import { getRoleBadgeStyle } from "@/helpers/ChatHelper";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIndividual: (participantId: string) => void;
  onCreateGroup: (name: string, participantIds: string[], avatar?: string) => void;
  onUploadAttachment: (file: File) => Promise<{ url: string }>;
}

const ROLE_TABS = [
  { label: "All", value: "ALL" },
  { label: "Parents", value: "PARENTS" },
  { label: "Coaches", value: "COACHES" },
  { label: "Agents", value: "AGENTS" },
  { label: "Clubs", value: "CLUBS" },
  { label: "Academies", value: "ACADEMIES" },
];

export const NewChatModal = ({
  isOpen,
  onClose,
  onSelectIndividual,
  onCreateGroup,
  onUploadAttachment,
}: NewChatModalProps) => {
  const [activeTab, setActiveTab] = useState<"individual" | "group">("individual");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Group creation state
  const [groupName, setGroupName] = useState("");
  const [groupAvatarUrl, setGroupAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch contacts
  const { data: contactsResponse, isLoading: isLoadingContacts } = useGetContactsQuery(
    {
      role: selectedRole === "ALL" ? undefined : selectedRole,
      search: searchQuery.trim() || undefined,
      page: 1,
      limit: 50,
    },
    { skip: !isOpen }
  );

  const contacts: IContact[] = useMemo(() => {
    return contactsResponse?.data || [];
  }, [contactsResponse]);

  const handleToggleSelectContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const res = await onUploadAttachment(file);
      if (res?.url) {
        setGroupAvatarUrl(res.url);
        toast.success("Group avatar uploaded");
      }
    } catch {
      toast.error("Failed to upload group avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleStartIndividual = (contact: IContact) => {
    const contactId = contact._id || contact.id;
    if (!contactId) return;
    onSelectIndividual(contactId);
    onClose();
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedContactIds.length < 2) {
      toast.error("Please select at least 2 participants for a group chat");
      return;
    }

    onCreateGroup(trimmedName, selectedContactIds, groupAvatarUrl || undefined);
    onClose();
    // Reset state
    setGroupName("");
    setGroupAvatarUrl("");
    setSelectedContactIds([]);
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedContactIds([]);
    setGroupName("");
    setGroupAvatarUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl p-0 bg-[#121212] border-white/10 text-white overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-5 pb-3 border-b border-white/10">
          <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Start a Conversation
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "individual" | "group")}
          className="w-full flex-1 flex flex-col min-h-0"
        >
          <div className="px-5 pt-3">
            <TabsList className="w-full grid grid-cols-2 bg-white/5 p-1 rounded-xl">
              <TabsTrigger
                value="individual"
                className="rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-[#E31B23] data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
              >
                <IconUser size={16} />
                Direct Message
              </TabsTrigger>
              <TabsTrigger
                value="group"
                className="rounded-lg py-2 text-xs font-semibold data-[state=active]:bg-[#E31B23] data-[state=active]:text-white transition-all flex items-center justify-center gap-2"
              >
                <IconUsers size={16} />
                Create Group
              </TabsTrigger>
            </TabsList>
          </div>

          {/* INDIVIDUAL CHAT TAB */}
          <TabsContent value="individual" className="flex-1 flex flex-col min-h-0 m-0 p-5 pt-3 gap-3">
            {/* Search input */}
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <Input
                type="text"
                placeholder="Search by name, email, or club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>

            {/* Role Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {ROLE_TABS.map((roleTab) => {
                const isSelected = selectedRole === roleTab.value;
                return (
                  <button
                    key={roleTab.value}
                    type="button"
                    onClick={() => setSelectedRole(roleTab.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors",
                      isSelected
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {roleTab.label}
                  </button>
                );
              })}
            </div>

            {/* Contacts List */}
            <ScrollArea className="flex-1 min-h-[280px] max-h-[380px] pr-2">
              {isLoadingContacts ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/40">
                  <IconLoader2 className="animate-spin" size={24} />
                  <span className="text-xs">Loading contacts...</span>
                </div>
              ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-1 text-center">
                  <p className="text-sm font-medium text-white/70">No contacts found</p>
                  <p className="text-xs text-white/40">
                    Try searching with another name or filter by a different role.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {contacts.map((contact) => {
                    const contactId = contact._id || contact.id || "";
                    if (!contactId) return null;
                    const roleStyle = getRoleBadgeStyle(contact.role);
                    return (
                      <button
                        key={contactId}
                        type="button"
                        onClick={() => handleStartIndividual(contact)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <ChatAvatar src={contact.avatar} name={contact.name} className="size-10 text-sm" />
                            {contact.isOnline && (
                              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#121212]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white truncate">
                                {contact.fullName || contact.name}
                              </span>
                              <Badge className={cn("text-[9px] px-1.5 py-0 h-4 font-bold uppercase", roleStyle.badge)}>
                                {contact.role}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/40 truncate">
                              {contact.club ? `${contact.club} • ` : ""}
                              {contact.email || "Platform Member"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-[#E31B23] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pl-2">
                          Message →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* GROUP CHAT TAB */}
          <TabsContent value="group" className="flex-1 flex flex-col min-h-0 m-0 p-5 pt-3 gap-4">
            <form onSubmit={handleCreateGroupSubmit} className="flex flex-col gap-4 flex-1 min-h-0">
              {/* Group Name & Avatar input */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="size-14 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-white/40 transition-colors flex flex-col items-center justify-center cursor-pointer shrink-0 relative overflow-hidden group"
                >
                  {isUploadingAvatar ? (
                    <IconLoader2 className="animate-spin text-white/60" size={20} />
                  ) : groupAvatarUrl ? (
                    <img
                      src={groupAvatarUrl}
                      alt="Group Avatar"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-white/40 group-hover:text-white/70">
                      <IconCamera size={18} />
                      <span className="text-[9px] font-bold mt-0.5">Icon</span>
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter Group Name (e.g. U16 Coaching Staff)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                    required
                  />
                  <p className="text-[11px] text-white/40 mt-1">
                    Select at least 2 members to start a group conversation.
                  </p>
                </div>
              </div>

              {/* Search contacts for group */}
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <Input
                  type="text"
                  placeholder="Filter contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-lg"
                />
              </div>

              {/* Selected Count Indicator */}
              <div className="flex items-center justify-between text-xs text-white/60 px-1">
                <span>Select Participants:</span>
                <span className="font-semibold text-white">
                  {selectedContactIds.length} selected
                </span>
              </div>

              {/* Multi-select Contacts List */}
              <ScrollArea className="flex-1 min-h-[200px] max-h-[260px] pr-2">
                {isLoadingContacts ? (
                  <div className="flex flex-col items-center justify-center h-36 gap-2 text-white/40">
                    <IconLoader2 className="animate-spin" size={20} />
                    <span className="text-xs">Loading contacts...</span>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-36 text-center text-xs text-white/40">
                    No contacts found
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {contacts.map((contact) => {
                      const contactId = contact._id || contact.id || "";
                      if (!contactId) return null;
                      const isChecked = selectedContactIds.includes(contactId);
                      const roleStyle = getRoleBadgeStyle(contact.role);
                      return (
                        <div
                          key={contactId}
                          onClick={() => handleToggleSelectContact(contactId)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none",
                            isChecked ? "bg-white/[0.09] border border-white/20" : "bg-white/[0.02] hover:bg-white/[0.05]"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => handleToggleSelectContact(contactId)}
                              className="border-white/30 data-[state=checked]:bg-[#E31B23] data-[state=checked]:border-[#E31B23]"
                            />
                            <div className="size-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                              <ChatAvatar src={contact.avatar} name={contact.name} className="size-full text-xs border-0" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-white truncate block">
                                {contact.fullName || contact.name}
                              </span>
                              <Badge className={cn("text-[8px] px-1 py-0 h-3.5 font-bold uppercase", roleStyle.badge)}>
                                {contact.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Submit Group Button */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={selectedContactIds.length < 2 || !groupName.trim() || isUploadingAvatar}
                  className="bg-[#E31B23] hover:bg-[#C2181F] text-white font-bold text-xs uppercase tracking-wider px-5 rounded-xl disabled:opacity-40"
                >
                  <IconCheck size={16} />
                  Create Group ({selectedContactIds.length})
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
