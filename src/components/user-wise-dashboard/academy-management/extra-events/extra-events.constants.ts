/* eslint-disable @typescript-eslint/no-explicit-any */

export const TOURNAMENT_PRESET_LOGOS = [
  {
    id: "preset-cup",
    name: "Champions Cup",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5 Z" fill="#111111" stroke="#FDC700" stroke-width="4"/>
      <path d="M35 30 H65 V35 C65 45 58 52 50 52 C42 52 35 45 35 35 V30 Z" fill="#FDC700"/>
      <path d="M47 52 H53 V68 H47 V52 Z" fill="#FDC700"/>
      <path d="M30 72 H70 V77 H30 V72 Z" fill="#FDC700"/>
      <circle cx="50" cy="40" r="4" fill="#111111"/>
      <path d="M30 32 C25 32 25 42 30 42 H35 V32 H30 Z" stroke="#FDC700" stroke-width="2" fill="none"/>
      <path d="M70 32 C75 32 75 42 70 42 H65 V32 H70 Z" stroke="#FDC700" stroke-width="2" fill="none"/>
    </svg>`
  },
  {
    id: "preset-shield",
    name: "Elite League",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 15 H85 V45 C85 70 50 90 50 90 C50 90 15 70 15 45 V15 Z" fill="#111111" stroke="#0077FF" stroke-width="4"/>
      <path d="M30 35 L50 20 L70 35 V50 C70 65 50 78 50 78 C50 78 30 65 30 50 V35 Z" fill="#0077FF" opacity="0.2"/>
      <circle cx="50" cy="48" r="15" stroke="#0077FF" stroke-width="3" fill="none"/>
      <path d="M42 48 L48 54 L58 42" stroke="#00FF62" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: "preset-grass",
    name: "Grassroots Cup",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#111111" stroke="#00FF62" stroke-width="4"/>
      <path d="M50 15 C55 35 75 50 75 50 C75 50 55 65 50 85 C45 65 25 50 25 50 C25 50 45 35 50 15 Z" fill="#00FF62" opacity="0.3"/>
      <circle cx="50" cy="50" r="10" stroke="#FFF" stroke-width="2"/>
      <path d="M50 20 V80 M20 50 H80" stroke="#FFF" stroke-width="1" stroke-dasharray="2 2"/>
    </svg>`
  },
  {
    id: "preset-star",
    name: "Academy Premier",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L92 36 L76 86 L24 86 L8 36 Z" fill="#111111" stroke="#FF1010" stroke-width="4"/>
      <path d="M50 20 L58 38 H78 L62 50 L68 68 L50 56 L32 68 L38 50 L22 38 H42 L50 20 Z" fill="#FF1010"/>
    </svg>`
  }
];

export const CLUB_PRESET_LOGOS = [
  {
    id: "club-badge-1",
    name: "Red Devils Academy",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#FF1010" opacity="0.1" stroke="#FF1010" stroke-width="4"/>
      <path d="M35 40 Q50 30 65 40 V55 Q50 70 35 55 Z" fill="#FF1010"/>
      <circle cx="43" cy="46" r="3" fill="#FFF"/>
      <circle cx="57" cy="46" r="3" fill="#FFF"/>
      <path d="M45 52 Q50 56 55 52" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "club-badge-2",
    name: "Blue Tigers FC",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#0077FF" opacity="0.1" stroke="#0077FF" stroke-width="4"/>
      <path d="M30 45 C35 35 45 35 50 40 C55 35 65 35 70 45 C70 60 50 75 50 75 C50 75 30 60 30 45 Z" fill="#0077FF"/>
      <path d="M40 43 L45 47 L40 51" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
      <path d="M60 43 L55 47 L60 51" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "club-badge-3",
    name: "Green Hawks Academy",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#00FF62" opacity="0.1" stroke="#00FF62" stroke-width="4"/>
      <path d="M50 25 L70 45 H30 L50 25 Z" fill="#00FF62"/>
      <path d="M30 50 L50 70 L70 50 H30 Z" fill="#00FF62"/>
    </svg>`
  },
  {
    id: "club-badge-4",
    name: "Yellow Hornets FC",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 5 L85 20 V55 C85 75 50 92 50 92 C50 92 15 75 15 55 V20 Z" fill="#FDC700" opacity="0.1" stroke="#FDC700" stroke-width="4"/>
      <circle cx="50" cy="48" r="18" fill="#FDC700"/>
      <path d="M40 45 H60 M40 51 H60 M45 57 H55" stroke="#111" stroke-width="3"/>
    </svg>`
  }
];

export const TIME_OPTIONS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM",
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
];

export const events = [
  {
    id: 1,
    title: "Summer Training Camp",
    date: "15-20 February 2026",
    fee: "£250",
    enrolled: "32/40",
    status: "Open",
    group: "Group A",
    ageGroup: "U-14",
    targetGroup: "Academy Players Only"
  },
  {
    id: 2,
    title: "Tournament Registration",
    date: "5 March 2026",
    fee: "£180",
    enrolled: "24/30",
    status: "Open",
    group: "Group B",
    ageGroup: "U-16",
    targetGroup: "All Members & Families"
  },
  {
    id: 3,
    title: "Skills Workshop",
    date: "30 January 2026",
    fee: "£75",
    enrolled: "18/20",
    status: "Closing Soon",
    group: "Group C",
    ageGroup: "U-12",
    targetGroup: "Academy Players Only"
  },
  {
    id: 4,
    title: "Skills Workshop",
    date: "30 January 2026",
    fee: "£75",
    enrolled: "18/20",
    status: "Closing Soon",
    group: "Group D",
    ageGroup: "U-10",
    targetGroup: "Academy Players Only"
  }
];

export const getStoredEvents = () => {
  if (typeof window === "undefined") return events;
  const stored = localStorage.getItem("k10_extra_events");
  if (!stored) {
    localStorage.setItem("k10_extra_events", JSON.stringify(events));
    return events;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return events;
  }
};

export const saveStoredEvents = (newEvents: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("k10_extra_events", JSON.stringify(newEvents));
  }
};

/**
 * Parses time strings like "09:00 AM", "04:30 PM", or "16:00" into total minutes from midnight.
 * Returns -1 if invalid or empty.
 */
export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return -1;
  const cleanStr = timeStr.trim();

  // Check 12-hour AM/PM format (e.g. "09:00 AM" or "4:30 pm")
  const match12 = cleanStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const ampm = match12[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Check 24-hour format (e.g. "09:00" or "16:30")
  const match24 = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return -1;
};

/**
 * Formats time string to 12-hour AM/PM format
 */
export const formatTo12Hour = (timeStr: string) => {
  if (!timeStr) return "";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;
  const minute = minuteStr || "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour ? hour : 12;
  const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
  return `${formattedHour}:${minute} ${ampm}`;
};
