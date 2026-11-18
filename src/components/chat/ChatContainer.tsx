/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatConversationItem } from "./ChatConversationItem";
import { ChatMessageItem } from "./ChatMessageItem";
import { NewChatModal } from "./NewChatModal";
import { ImageViewerModal } from "./ImageViewerModal";
import { getMessageDateGroup, getRoleBadgeStyle } from "@/helpers/ChatHelper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  IconSearch,
  IconPlus,
  IconChevronLeft,
  IconSend,
  IconPhoto,
  IconLoader2,
  IconX,
  IconUsers,
  IconArrowDown,
  IconMessageDots,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatContainerProps {
  title?: string;
  subtitle?: string;
}

export const ChatContainer = ({
  title = "Chat",
  subtitle = "Real-time communication & messaging",
}: ChatContainerProps) => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    activeTypingUsers,
    isLoadingConversations,
    isLoadingMessages,
    selectConversation,
    closeConversation,
    sendMessage,
    uploadAttachment,
    handleTyping,
    handleStopTyping,
    startIndividualConversation,
    startGroupConversation,
  } = useChat();

  // Local UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageViewportRef = useRef<HTMLDivElement>(null);

  // Filter conversations by search input
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase().trim();
    return conversations.filter((conv) => {
      const name = conv.type === "GROUP" ? conv.name : conv.user?.name || conv.user?.fullName;
      const lastMsg = conv.lastMessage || "";
      const email = conv.user?.email || "";
      const role = conv.user?.role || "";
      return (
        name?.toLowerCase().includes(query) ||
        lastMsg.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        role.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery]);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll listener to detect if user has scrolled up
  const handleScroll = () => {
    if (!messageViewportRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageViewportRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollBottomPill(!isNearBottom);
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (!showScrollBottomPill) {
      scrollToBottom("auto");
    }
  }, [activeMessages.length, showScrollBottomPill]);

  // When active conversation changes, scroll to bottom
  useEffect(() => {
    if (activeConversationId) {
      scrollToBottom("auto");
    }
  }, [activeConversationId]);

  // Group active messages by date
  const groupedMessages = useMemo(() => {
    const groups: { dateGroup: string; items: typeof activeMessages }[] = [];
    let currentDateGroup = "";

    activeMessages.forEach((msg) => {
      const groupName = getMessageDateGroup(msg.createdAt);
      if (groupName !== currentDateGroup) {
        currentDateGroup = groupName;
        groups.push({ dateGroup: groupName, items: [msg] });
      } else {
        groups[groups.length - 1].items.push(msg);
      }
    });

    return groups;
  }, [activeMessages]);

  // Image Upload handler
  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setIsUploadingImage(true);
      const res = await uploadAttachment(file);
      if (res?.url) {
        setStagedImageUrl(res.url);
      }
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Send message submit
  const handleSendMessageSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !stagedImageUrl) return;

    const textToSend = inputText;
    const imageToSend = stagedImageUrl || undefined;

    // Reset input fields immediately
    setInputText("");
    setStagedImageUrl(null);

    await sendMessage(textToSend, imageToSend);
    scrollToBottom("smooth");
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageSubmit();
    }
  };

  // Textarea change handler with typing event
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    handleTyping();
  };

  const isGroup = activeConversation?.type === "GROUP";
  const activeUser = activeConversation?.user;
  const activeTitle = isGroup
    ? activeConversation.name || "Group Chat"
    : activeUser?.fullName || activeUser?.name || "Member";
  const activeAvatar = isGroup ? activeConversation?.avatar : activeUser?.avatar;
  const isUserOnline = !isGroup && Boolean(activeUser?.isOnline);
  const roleStyle = getRoleBadgeStyle(activeUser?.role);

  return (
    <div className="flex flex-col gap-5 h-[calc(100vh-110px)] lg:h-[calc(100vh-130px)] w-full max-w-full overflow-hidden select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight">
            {title}
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-0.5">
            {subtitle}
          </p>
        </div>
        <Button
          onClick={() => setIsNewChatModalOpen(true)}
          className="bg-[#E31B23] hover:bg-[#C2181F] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-[#E31B23]/20 transition-all cursor-pointer"
        >
          <IconPlus size={16} />
          New Chat
        </Button>
      </div>

      {/* Main split-pane container */}
      <div className="flex flex-1 min-h-0 bg-[#0E0E0E] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {/* LEFT SIDEBAR: Conversations List */}
        <div
          className={cn(
            "w-full lg:w-[340px] shrink-0 border-r border-white/10 flex flex-col bg-[#111111]",
            activeConversationId ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Sidebar Search Bar */}
          <div className="p-3.5 border-b border-white/10">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-white/20 transition-all"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1 min-h-0">
            {isLoadingConversations && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-white/40">
                <IconLoader2 className="animate-spin" size={24} />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-center p-4">
                <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                  <IconMessageDots size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/70">No conversations yet</p>
                  <p className="text-xs text-white/40 mt-1 max-w-[200px]">
                    Click &quot;New Chat&quot; above to find contacts and start messaging.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="border-white/10 text-xs text-white hover:bg-white/10 rounded-xl"
                >
                  <IconPlus size={14} className="mr-1" />
                  Start Conversation
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const convId = conv._id || conv.id;
                const isActive = activeConversationId === convId;
                return (
                  <ChatConversationItem
                    key={convId}
                    conversation={conv}
                    isActive={isActive}
                    onClick={() => selectConversation(convId, conv)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Active Chat or Empty State */}
        <div
          className={cn(
            "flex-1 flex-col min-w-0 bg-[#0A0A0A]",
            activeConversationId ? "flex" : "hidden lg:flex"
          )}
        >
          {activeConversationId ? (
            <>
              {/* CHAT HEADER */}
              <div className="h-16 px-4 md:px-6 border-b border-white/10 flex items-center justify-between bg-[#111111]/90 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={closeConversation}
                    className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <IconChevronLeft size={20} />
                  </button>

                  {/* Active Participant / Group Avatar */}
                  <div className="relative shrink-0">
                    {activeAvatar ? (
                      <img
                        src={activeAvatar}
                        alt={activeTitle}
                        className="size-10 rounded-full object-cover border border-white/10"
                      />
                    ) : isGroup ? (
                      <div className="size-10 rounded-full bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white">
                        <IconUsers size={18} />
                      </div>
                    ) : (
                      <div className="size-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/80">
                        {activeTitle.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isUserOnline && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111111]" />
                    )}
                  </div>

                  {/* Active Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white truncate">
                        {activeTitle}
                      </h2>
                      {!isGroup && activeUser?.role && (
                        <Badge className={cn("text-[8px] px-1.5 py-0 h-4 font-bold uppercase", roleStyle.badge)}>
                          {activeUser.role}
                        </Badge>
                      )}
                      {isGroup && (
                        <Badge className="text-[8px] px-1.5 py-0 h-4 font-bold uppercase bg-white/10 text-white/80 border border-white/10">
                          Group Chat
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-white/40 truncate">
                      {isGroup
                        ? `${activeConversation?.participants?.length || activeConversation?.participantIds?.length || 2} members`
                        : isUserOnline
                        ? "Active now"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>

              {/* MESSAGES VIEWPORT */}
              <div
                ref={messageViewportRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col min-h-0 relative"
              >
                {isLoadingMessages && activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center my-auto gap-2 text-white/40">
                    <IconLoader2 className="animate-spin" size={24} />
                    <span className="text-xs">Loading message history...</span>
                  </div>
                ) : activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center my-auto gap-2 text-center p-6 text-white/40">
                    <div className="size-12 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                      <IconMessageDots size={24} />
                    </div>
                    <p className="text-sm font-semibold text-white/60">No messages yet</p>
                    <p className="text-xs text-white/30">
                      Say hello to start the conversation!
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.dateGroup} className="flex flex-col">
                      {/* Date Divider Badge */}
                      <div className="flex items-center justify-center my-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/5 text-white/50 border border-white/5 shadow-xs">
                          {group.dateGroup}
                        </span>
                      </div>

                      {/* Group's Messages */}
                      {group.items.map((msg) => (
                        <ChatMessageItem
                          key={msg._id || msg.id}
                          message={msg}
                          isGroupChat={isGroup}
                          onImageClick={(url) => setPreviewImageUrl(url)}
                        />
                      ))}
                    </div>
                  ))
                )}

                {/* Typing Indicator */}
                {activeTypingUsers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 px-2 text-xs text-white/50 animate-pulse">
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#E31B23]" />
                      <span className="size-1.5 rounded-full bg-[#E31B23]" />
                      <span className="size-1.5 rounded-full bg-[#E31B23]" />
                    </span>
                    <span>
                      {activeTypingUsers.map((u) => u.name).join(", ")}{" "}
                      {activeTypingUsers.length === 1 ? "is" : "are"} typing...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Floating Scroll to Bottom Button */}
              {showScrollBottomPill && (
                <div className="relative">
                  <button
                    onClick={() => scrollToBottom("smooth")}
                    className="absolute -top-12 right-6 bg-[#E31B23] hover:bg-[#C2181F] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1 transition-all z-20"
                  >
                    <IconArrowDown size={14} />
                    <span>New message</span>
                  </button>
                </div>
              )}

              {/* STAGED IMAGE PREVIEW (IF ATTACHED) */}
              {stagedImageUrl && (
                <div className="px-4 py-2 bg-[#121212] border-t border-white/10 flex items-center gap-3">
                  <div className="relative size-16 rounded-xl overflow-hidden border border-white/20 group">
                    <img
                      src={stagedImageUrl}
                      alt="Staged attachment"
                      className="size-full object-cover"
                    />
                    <button
                      onClick={() => setStagedImageUrl(null)}
                      className="absolute top-1 right-1 size-5 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-colors"
                      title="Remove image"
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-white/60">
                    <span className="text-white font-medium block">Image attached</span>
                    <span>Ready to send with your message</span>
                  </div>
                </div>
              )}

              {/* INPUT BAR */}
              <div className="p-3 md:p-4 bg-[#111111] border-t border-white/10">
                <form
                  onSubmit={handleSendMessageSubmit}
                  className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-white/20 transition-all"
                >
                  {/* Image Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0 disabled:opacity-40"
                    title="Attach image"
                  >
                    {isUploadingImage ? (
                      <IconLoader2 size={18} className="animate-spin text-white" />
                    ) : (
                      <IconPhoto size={18} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelectImage}
                    className="hidden"
                  />

                  {/* Textarea */}
                  <Textarea
                    placeholder="Type your message... (Shift+Enter for new line)"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleStopTyping}
                    rows={1}
                    className="flex-1 bg-transparent border-0 text-white placeholder:text-white/30 text-sm resize-none focus-visible:ring-0 min-h-[36px] max-h-32 p-1.5"
                  />

                  {/* Send Button */}
                  <Button
                    type="submit"
                    disabled={(!inputText.trim() && !stagedImageUrl) || isUploadingImage}
                    className="bg-[#E31B23] hover:bg-[#C2181F] text-white size-9 p-0 rounded-xl shrink-0 disabled:opacity-30 transition-all"
                  >
                    <IconSend size={16} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            // EMPTY STATE WHEN NO ACTIVE CHAT
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="size-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
                <IconMessageDots size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Select a conversation
              </h3>
              <p className="text-xs text-white/40 max-w-sm mb-6 leading-relaxed">
                Choose an existing conversation from the sidebar or start a new chat with parents, coaches, agents, or clubs.
              </p>
              <Button
                onClick={() => setIsNewChatModalOpen(true)}
                className="bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-[#E31B23]/20"
              >
                <IconPlus size={16} />
                Start New Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectIndividual={startIndividualConversation}
        onCreateGroup={startGroupConversation}
        onUploadAttachment={uploadAttachment}
      />

      {/* Image Preview Lightbox Modal */}
      <ImageViewerModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
};
export default ChatContainer;
