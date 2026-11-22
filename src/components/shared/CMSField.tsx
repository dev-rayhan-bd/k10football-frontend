/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, PencilIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CMSFieldProps {
  value: string | number;
  onUpdate: (newValue: string | number) => void;
  canEdit: boolean;
  type?: "text" | "number" | "textarea" | "select" | "date" | "combobox";
  options?: string[];
  className?: string;
  inputClassName?: string;
  label?: string;
  isNumeric?: boolean;
  editTrigger?: "click" | "doubleClick";
  hideIcon?: boolean;
  style?: React.CSSProperties;
  showEmojis?: boolean;
  noTruncate?: boolean;
  min?: number;
  max?: number;
}

const EMOJIS = ["⚽", "👀", "🎯", "🧠", "💪", "🌍", "🏆", "🔥", "⚡", "📈", "👏", "🙌", "❤️", "👍"];

const CMSField = ({
  value,
  onUpdate,
  canEdit,
  type = "text",
  options = [],
  className,
  inputClassName,
  isNumeric = false,
  editTrigger = "click",
  hideIcon = false,
  style,
  showEmojis = false,
  noTruncate = false,
  min,
  max,
}: CMSFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasTyped, setHasTyped] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const comboboxInputRef = useRef<HTMLInputElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = String(tempValue);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newValue = before + emoji + after;

    setTempValue(newValue);
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing || type !== "combobox") return;
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setTempValue(value);
        setIsEditing(false);
        setSearchTerm("");
        setHasTyped(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, type, value]);

  const handleSave = (val?: string | number) => {
    let finalVal = val !== undefined ? val : tempValue;
    if (isNumeric || type === "number") {
      let num = Number(finalVal);
      if (isNaN(num)) num = min ?? 0;
      if (min !== undefined) num = Math.max(min, num);
      if (max !== undefined) num = Math.min(max, num);
      finalVal = num;
    }
    onUpdate(finalVal);
    setIsEditing(false);
    setSearchTerm("");
    setHasTyped(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setSearchTerm("");
    setHasTyped(false);
  };

  const activeQuery = hasTyped ? searchTerm.trim().toLowerCase() : "";

  const filteredOptions = (() => {
    if (!activeQuery) return options;
    const result: string[] = [];
    let pendingHeading: string | null = null;
    for (const opt of options) {
      const isHeading = opt.startsWith("--") && opt.endsWith("--");
      if (isHeading) {
        pendingHeading = opt;
        continue;
      }
      if (opt.toLowerCase().includes(activeQuery)) {
        if (pendingHeading) {
          result.push(pendingHeading);
          pendingHeading = null;
        }
        result.push(opt);
      }
    }
    return result;
  })();

  const hasExactMatch =
    Boolean(searchTerm.trim()) &&
    options.some(
      (opt) =>
        !(opt.startsWith("--") && opt.endsWith("--")) &&
        opt.trim().toLowerCase() === searchTerm.trim().toLowerCase()
    );

  if (isEditing && canEdit) {
    if (type === "combobox") {
      return (
        <div
          ref={comboboxRef}
          className={cn("relative flex flex-col gap-1 w-full z-50", className)}
          style={style}
        >
          <div className="flex items-center gap-1.5 w-full">
            <div className="relative flex-1 min-w-28">
              <Input
                ref={comboboxInputRef}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHasTyped(true);
                }}
                onFocus={(e) => e.currentTarget.select()}
                placeholder="Search or select..."
                className={cn(
                  "h-8 text-xs bg-background border-primary/40 pr-7 w-full",
                  inputClassName
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave(searchTerm.trim());
                  if (e.key === "Escape") handleCancel();
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSearchTerm("");
                    setHasTyped(true);
                    comboboxInputRef.current?.focus();
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="size-7 text-primary hover:bg-primary/10 shrink-0"
              onClick={() => handleSave(searchTerm.trim())}
              title="Save value"
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="size-7 text-destructive hover:bg-destructive/10 shrink-0"
              onClick={handleCancel}
              title="Cancel"
            >
              <X className="size-3.5" />
            </Button>
          </div>
          <div className="absolute top-10 left-0 w-full min-w-60 max-h-64 overflow-y-auto bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl z-100">
            <div
              className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer italic border-b border-border/60"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSave("")}
            >
              (None / Clear)
            </div>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isHeading = opt.startsWith("--") && opt.endsWith("--");
                if (isHeading) {
                  return (
                    <div
                      key={`${opt}-${idx}`}
                      className="sticky top-0 px-3 py-1.5 text-[10px] font-bold text-primary bg-background/95 backdrop-blur-xs tracking-wider uppercase select-none pointer-events-none border-y border-border/50"
                    >
                      {opt.replace(/--/g, "").trim()}
                    </div>
                  );
                }
                const isSelected =
                  String(value ?? "").trim().toLowerCase() === opt.trim().toLowerCase();
                return (
                  <div
                    key={`${opt}-${idx}`}
                    className={cn(
                      "px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors text-left",
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-foreground hover:bg-primary/15"
                    )}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSave(opt)}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-primary" />}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">No matching results</div>
            )}
            {hasTyped && searchTerm.trim() && !hasExactMatch && (
              <div
                className="px-3 py-2 text-xs text-primary hover:bg-primary/15 cursor-pointer border-t border-border/60 font-medium text-left truncate"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSave(searchTerm.trim())}
              >
                Use &ldquo;{searchTerm.trim()}&rdquo;
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === "select") {
      return (
        <div className={cn("flex items-center gap-2 w-full", className)}>
          <Select
            value={String(tempValue)}
            onValueChange={(val) => handleSave(val)}
          >
            <SelectTrigger className={cn("h-8 text-xs bg-gray-800 border-primary/30 min-w-20", inputClassName)}>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              {options.map((opt) => (
                <SelectItem key={opt} value={opt} className="text-xs hover:bg-primary/20">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-2 w-full relative", className)} style={style}>
        <div className="flex items-start gap-2 w-full">
          <div className="flex-1 relative">
            {type === "textarea" ? (
              <>
                <Textarea
                  ref={textareaRef}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className={cn("text-xs bg-gray-800 border-primary/30 min-h-30 pr-10", inputClassName)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Escape") handleCancel();
                  }}
                />
                
                {/* Smile Emoji Button absolute inside the textarea */}
                {showEmojis && (
                  <div className="absolute right-2 top-2 z-30">
                    <button
                      type="button"
                      onClick={() => setShowPicker(!showPicker)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-gray-900 border border-gray-800 hover:bg-gray-700 text-white cursor-pointer active:scale-95 transition-all text-xs"
                      title="Insert Emoji"
                    >
                      😊
                    </button>
                    
                    {/* Floating Emoji Selector Panel */}
                    {showPicker && (
                      <div className="absolute right-0 top-8 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl p-2 grid grid-cols-5 gap-1 z-50 w-44">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-7 h-7 flex items-center justify-center text-base hover:bg-white/10 rounded transition-colors cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Input
                type={type}
                min={min}
                max={max}
                value={
                  type === "date" && String(tempValue).includes("/")
                    ? String(tempValue).split("/").reverse().join("-")
                    : tempValue
                }
                onChange={(e) => {
                  let val = e.target.value;
                  if (type === "date" && val.includes("-")) {
                    val = val.split("-").reverse().join("/");
                  }
                  setTempValue(val);
                }}
                className={cn("h-8 text-xs bg-gray-800 border-primary/30 min-w-20", inputClassName)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 border border-green-500/20 bg-green-500/5"
              onClick={() => handleSave()}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 bg-red-500/5"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 transition-all duration-200",
        canEdit && "cursor-pointer hover:bg-white/5 rounded px-1 -mx-1",
        className
      )}
      style={style}
      onClick={() => {
        if (canEdit && editTrigger === "click") {
          setSearchTerm(String(value ?? ""));
          setHasTyped(false);
          setTempValue(value);
          setIsEditing(true);
        }
      }}
      onDoubleClick={() => {
        if (canEdit && editTrigger === "doubleClick") {
          setSearchTerm(String(value ?? ""));
          setHasTyped(false);
          setTempValue(value);
          setIsEditing(true);
        }
      }}
    >
      <span className={cn(
        type !== "textarea" && !noTruncate && "truncate",
        type !== "textarea" && noTruncate && "whitespace-normal wrap-break-word",
        type === "textarea" && "whitespace-pre-wrap"
      )}>{value}</span>
      {canEdit && !hideIcon && (
        <PencilIcon className="h-3 w-3 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
      )}
    </div>
  );
};

export default CMSField;
