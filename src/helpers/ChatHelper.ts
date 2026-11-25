export const formatMessageTime = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
};

/**
 * Group photo: the field name varies between backend responses, so accept the
 * common ones. Individual chats use the other participant's avatar.
 */
export const getConversationAvatar = (conv?: {
  type?: string;
  avatar?: string;
  user?: { avatar?: string };
  [key: string]: unknown;
} | null): string => {
  if (!conv) return "";
  if (conv.type !== "GROUP") return conv.user?.avatar || "";
  // The conversations API puts the group photo in `user.avatar` (user.role = "GROUP").
  const candidates = [
    conv.avatar,
    conv.user?.avatar,
    conv.groupAvatar,
    conv.groupImage,
    conv.image,
    conv.photo,
    conv.imageUrl,
  ];
  const found = candidates.find((v) => typeof v === "string" && v.trim() !== "");
  return (found as string) || "";
};

export const formatConversationTime =(dateString?: string): string => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return d.toLocaleDateString([], { weekday: "short" });
    }

    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
};

export const getMessageDateGroup = (dateString?: string): string => {
  if (!dateString) return "Earlier";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Earlier";

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "Earlier";
  }
};

export const getRoleBadgeStyle = (
  role?: string
): { badge: string; text: string; bg: string } => {
  const r = (role || "").toUpperCase();
  switch (r) {
    case "COACH":
      return {
        badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        text: "text-blue-400",
        bg: "bg-blue-500",
      };
    case "PARENT":
      return {
        badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        text: "text-emerald-400",
        bg: "bg-emerald-500",
      };
    case "AGENT":
      return {
        badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        text: "text-amber-400",
        bg: "bg-amber-500",
      };
    case "CLUB":
      return {
        badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        text: "text-purple-400",
        bg: "bg-purple-500",
      };
    case "ACADEMY":
      return {
        badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        text: "text-cyan-400",
        bg: "bg-cyan-500",
      };
    case "SCOUT":
      return {
        badge: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
        text: "text-pink-400",
        bg: "bg-pink-500",
      };
    case "ADMIN":
    case "SUPER_ADMIN":
      return {
        badge: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        text: "text-rose-400",
        bg: "bg-rose-500",
      };
    default:
      return {
        badge: "bg-white/10 text-white/70 border border-white/10",
        text: "text-white/70",
        bg: "bg-zinc-500",
      };
  }
};
