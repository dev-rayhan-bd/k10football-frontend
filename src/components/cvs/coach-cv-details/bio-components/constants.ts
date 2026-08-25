/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Activity,
  Award,
  Calendar,
  GraduationCap,
  Medal,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users
} from "lucide-react";

export const ACCOMPLISHMENT_ICONS: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  target: Target,
  users: Users,
  trendingUp: TrendingUp,
  activity: Activity,
  shield: Shield,
  graduationCap: GraduationCap,
  calendar: Calendar,
  medal: Medal,
  sparkles: Sparkles,
};

export const PREDEFINED_ACCOMPLISHMENTS = [
  { text: "Led team to league, district, or tournament championships", icon: "trophy" },
  { text: "Improved team win-loss record over multiple seasons", icon: "trendingUp" },
  { text: "Developed successful training and match strategies", icon: "target" },
  { text: "Increased player performance, fitness, and discipline", icon: "activity" },
  { text: "Mentored players who advanced to professional or collegiate levels", icon: "graduationCap" },
  { text: "Built strong team culture and sportsmanship standards", icon: "users" },
  { text: "Organized effective practice sessions and development programs", icon: "calendar" },
  { text: "Recruited and retained talented athletes", icon: "medal" },
  { text: "Reduced injury rates through conditioning and safety programs", icon: "shield" },
  { text: "Managed match preparation, analysis, and tactical adjustments", icon: "sparkles" },
  { text: "Coordinated with staff, parents, and club management effectively", icon: "users" },
  { text: "Achieved promotion to higher divisions or competitive levels", icon: "trendingUp" },
  { text: "Implemented data analysis and performance tracking systems", icon: "activity" },
  { text: "Won Coach of the Year or similar recognition awards", icon: "award" },
  { text: "Successfully managed budgets, schedules, and team logistics", icon: "calendar" }
];

export const PREDEFINED_KEY_SKILLS = [
  { text: "Tactical planning and game strategy", icon: "target" },
  { text: "Player development and mentoring", icon: "users" },
  { text: "Match analysis and opponent scouting", icon: "trendingUp" },
  { text: "Training session design", icon: "calendar" },
  { text: "Offensive and defensive coordination", icon: "shield" },
  { text: "Performance evaluation", icon: "activity" },
  { text: "Fitness and conditioning knowledge", icon: "activity" },
  { text: "Injury prevention awareness", icon: "shield" },
  { text: "Sports psychology and motivation", icon: "sparkles" },
  { text: "Leadership and team management", icon: "users" },
  { text: "Communication and interpersonal skills", icon: "users" },
  { text: "Conflict resolution", icon: "star" },
  { text: "Decision-making under pressure", icon: "target" },
  { text: "Time management", icon: "calendar" },
  { text: "Goal setting and performance monitoring", icon: "trendingUp" },
  { text: "Discipline and accountability management", icon: "medal" },
  { text: "Staff coordination and delegation", icon: "users" },
  { text: "Motivational leadership", icon: "award" },
  { text: "Adaptability and resilience", icon: "sparkles" },
  { text: "Patience and professionalism", icon: "star" },
  { text: "Strong work ethic", icon: "activity" },
  { text: "Strategic thinking", icon: "target" },
  { text: "Problem-solving ability", icon: "sparkles" }
];

export const COACH_TYPES = [
  "Head Coach",
  "Assistant Coach",
  "Goalkeeping Coach",
  "Fitness Coach",
  "Youth Coach",
  "Technical Coach"
];

export const COUNTRY_CODES: Record<string, string> = {
  "afghanistan": "af", "albania": "al", "algeria": "dz", "andorra": "ad", "angola": "ao",
  "antigua and barbuda": "ag", "argentina": "ar", "armenia": "am", "australia": "au",
  "austria": "at", "azerbaijan": "az", "bahamas": "bs", "bahrain": "bh", "bangladesh": "bd",
  "barbados": "bb", "belarus": "by", "belgium": "be", "belize": "bz", "benin": "bj",
  "bhutan": "bt", "bolivia": "bo", "bosnia and herzegovina": "ba", "botswana": "bw",
  "brazil": "br", "brunei": "bn", "bulgaria": "bg", "burkina faso": "bf", "burundi": "bi",
  "cambodia": "kh", "cameroon": "cm", "canada": "ca", "cape verde": "cv",
  "central african republic": "cf", "chad": "td", "chile": "cl", "china": "cn",
  "colombia": "co", "comoros": "km", "congo": "cg", "costa rica": "cr", "croatia": "hr",
  "cuba": "cu", "cyprus": "cy", "czech republic": "cz", "denmark": "dk", "djibouti": "dj",
  "dominica": "dm", "dominican republic": "do", "ecuador": "ec", "egypt": "eg",
  "el salvador": "sv", "equatorial guinea": "gq", "eritrea": "er", "estonia": "ee",
  "ethiopia": "et", "fiji": "fj", "finland": "fi", "france": "fr", "gabon": "ga",
  "gambia": "gm", "georgia": "ge", "germany": "de", "ghana": "gh", "greece": "gr",
  "grenada": "gd", "guatemala": "gt", "guinea": "gn", "guinea-bissau": "gw",
  "guyana": "gy", "haiti": "ht", "honduras": "hn", "hungary": "hu", "iceland": "is",
  "india": "in", "indonesia": "id", "iran": "ir", "iraq": "iq", "ireland": "ie",
  "israel": "il", "italy": "it", "jamaica": "jm", "japan": "jp", "jordan": "jo",
  "kazakhstan": "kz", "kenya": "ke", "kiribati": "ki", "korea, north": "kp",
  "korea, south": "kr", "kuwait": "kw", "kyrgyzstan": "kg", "laos": "la", "latvia": "lv",
  "lebanon": "lb", "lesotho": "ls", "liberia": "lr", "libya": "ly", "liechtenstein": "li",
  "lithuania": "lt", "luxembourg": "lu", "macedonia": "mk", "madagascar": "mg",
  "malawi": "mw", "malaysia": "my", "maldives": "mv", "mali": "ml", "malta": "mt",
  "marshall islands": "mh", "mauritania": "mr", "mauritius": "mu", "mexico": "mx",
  "micronesia": "fm", "moldova": "md", "monaco": "mc", "mongolia": "mn", "montenegro": "me",
  "morocco": "ma", "mozambique": "mz", "myanmar": "mm", "namibia": "na", "nauru": "nr",
  "nepal": "np", "netherlands": "nl", "new zealand": "nz", "nicaragua": "ni",
  "niger": "ne", "nigeria": "ng", "norway": "no", "oman": "om", "pakistan": "pk",
  "palau": "pw", "panama": "pa", "papua new guinea": "pg", "paraguay": "py", "peru": "pe",
  "philippines": "ph", "poland": "pl", "portugal": "pt", "qatar": "qa", "romania": "ro",
  "russia": "ru", "rwanda": "rw", "saint kitts and nevis": "kn", "saint lucia": "lc",
  "saint vincent and the grenadines": "vc", "samoa": "ws", "san marino": "sm",
  "sao tome and principe": "st", "saudi arabia": "sa", "senegal": "sn", "serbia": "rs",
  "seychelles": "sc", "sierra leone": "sl", "singapore": "sg", "slovakia": "sk",
  "slovenia": "si", "solomon islands": "sb", "somalia": "so", "south africa": "za",
  "spain": "es", "sri lanka": "lk", "sudan": "sd", "suriname": "sr", "swaziland": "sz",
  "sweden": "se", "switzerland": "ch", "syria": "sy", "taiwan": "tw", "tajikistan": "tj",
  "tanzania": "tz", "thailand": "th", "timor-leste": "tl", "togo": "tg", "tonga": "to",
  "trinidad and tobago": "tt", "tunisia": "tn", "turkey": "tr", "turkmenistan": "tm",
  "tuvalu": "tv", "uganda": "ug", "ukraine": "ua", "united arab emirates": "ae",
  "united kingdom": "gb", "united states": "us", "uruguay": "uy", "uzbekistan": "uz",
  "vanuatu": "vu", "vatican city": "va", "venezuela": "ve", "vietnam": "vn", "yemen": "ye",
  "zambia": "zm", "zimbabwe": "zw"
};

export const ALL_COUNTRIES = Object.keys(COUNTRY_CODES).map(c =>
  c.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
).sort();

export const COACH_STYLE_GROUPS = [
  {
    label: "Tactical Philosophy",
    styles: ["Tiki-Taka", "Gegenpressing", "Counter-Attack", "Park the Bus"],
  },
  {
    label: "Man Management",
    styles: ["Motivator", "Disciplinarian", "Holistic", "Player-Centric"],
  },
  {
    label: "Strategic Focus",
    styles: [
      "Youth Development",
      "Set-Piece Specialist",
      "Defensive Solid",
      "Attack Minded",
    ],
  },
];

export const ALL_COACH_STYLES = COACH_STYLE_GROUPS.flatMap(group =>
  group.styles.map(style => ({
    id: style.toLowerCase().replace(/ /g, "-"),
    label: style
  }))
);
