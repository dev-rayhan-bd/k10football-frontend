"use client";
import React, { useState } from "react";
import { IconCalendar, IconLock } from "@tabler/icons-react";

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection = ({ title, icon, children, className = "" }: SettingsSectionProps) => (
  <div className={`p-4 sm:p-8 rounded-xl sm:rounded-2xl border border-white/20 bg-[#0D0D0D] ${className}`}>
    <div className="flex items-center gap-3 mb-6 sm:mb-8">
      <div className="p-1.5 sm:p-2 rounded-lg bg-[#E31B23]/10 text-[#E31B23]">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-black text-white italic uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

import { Eye, EyeOff } from "lucide-react";

export interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  type?: string;
  isDate?: boolean;
  icon?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  className?: string;
  inputClassName?: string;
  error?: string;
  showPasswordToggle?: boolean;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsInput = React.forwardRef<HTMLInputElement, SettingsInputProps>(({
  label,
  placeholder,
  type = "text",
  isDate,
  icon,
  value,
  defaultValue,
  disabled,
  readOnly,
  name,
  className = "",
  inputClassName = "",
  error,
  showPasswordToggle = true,
  required,
  onChange,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);

  const setRefs = (element: HTMLInputElement | null) => {
    dateInputRef.current = element;
    if (typeof ref === "function") {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  const isPassword = type === "password";
  const inputType = isDate ? "date" : (isPassword ? (showPassword ? "text" : "password") : type);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] sm:text-[11px] text-gray-400 uppercase font-black tracking-widest font-orbitron flex items-center justify-between">
        <span>{label}</span>
        {required && <span className="text-[#E31B23] font-bold text-xs">*</span>}
      </label>
      <div className="relative">
        <input
          ref={setRefs}
          type={inputType}
          name={name}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-11 sm:h-12 bg-white/2 border ${
            error 
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" 
              : "border-white/25 hover:border-white/40 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]/40"
          } disabled:cursor-not-allowed disabled:text-gray-200 disabled:bg-white/[0.03] disabled:border-white/20 disabled:hover:border-white/20 disabled:focus:border-white/20 disabled:focus:ring-0 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-bold text-white focus:outline-none placeholder:text-gray-600 transition-all ${
            isPassword ? "pr-11" : ""
          } ${
            isDate
              ? "[color-scheme:dark] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full"
              : ""
          } ${inputClassName}`}
          {...props}
        />
        {isDate && !icon && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => dateInputRef.current?.showPicker?.()}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <IconCalendar size={18} />
          </button>
        )}
        {isPassword && showPasswordToggle && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {disabled && !icon && !isDate && !isPassword && (
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <IconLock size={16} />
          </div>
        )}
        {icon && (
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-400 text-xs font-bold tracking-wide mt-1 animate-in fade-in duration-200">
          {error}
        </p>
      )}
    </div>
  );
});
SettingsInput.displayName = "SettingsInput";

interface SettingsToggleProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
  onToggle?: (checked: boolean) => void;
}

export const SettingsToggle = ({ title, description, defaultChecked, onToggle }: SettingsToggleProps) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  const handleToggle = () => {
    const newState = !checked;
    setChecked(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl border border-white/10 bg-white/2 flex items-center justify-between group hover:border-[#E31B23]/20 transition-all">
      <div className="pr-4">
        <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">{title}</h4>
        <p className="text-[10px] sm:text-xs text-gray-500">{description}</p>
      </div>
      <button 
        onClick={handleToggle}
        className={`w-9 sm:w-11 h-5 sm:h-6 shrink-0 rounded-full relative transition-all duration-300 ${checked ? 'bg-[#E31B23]' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 sm:top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${checked ? 'right-0.5 sm:right-1' : 'left-0.5 sm:left-1'}`} />
      </button>
    </div>
  );
};
