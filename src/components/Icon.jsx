import {
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Bookmark,
  Briefcase,
  CalendarClock,
  Camera,
  Captions,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clapperboard,
  Clock,
  CodeXml,
  FileCheck,
  HandCoins,
  IdCard,
  ImageIcon,
  ImageUp,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  PackageCheck,
  Palette,
  Pin,
  PinOff,
  Play,
  Plus,
  Receipt,
  RefreshCw,
  Repeat,
  RotateCcw,
  ScanFace,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Tag,
  Timer,
  Trash2,
  TrendingUp,
  UserRound,
  Video,
  Volume2,
  VolumeX,
  Wallet,
  X,
  Zap,
} from "lucide-react";

// lucide-react doesn't ship brand/social marks — hand-drawn here so the
// footer's Instagram/TikTok links don't need a second icon library.
function InstagramIcon({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 16, style, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
      <path d="M16.5 2c.3 1.9 1.5 3.5 3.3 4.2.6.3 1.3.4 2 .5v3.2c-1.8-.1-3.5-.6-5-1.6v6.5c0 3.4-2.8 6.2-6.2 6.2S4.4 18.2 4.4 14.8c0-3.4 2.8-6.2 6.2-6.2.3 0 .6 0 .9.1v3.3c-.3-.1-.6-.1-.9-.1a2.9 2.9 0 1 0 2.9 2.9V2h3z" />
    </svg>
  );
}

const registry = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  "arrow-down-left": ArrowDownLeft,
  "arrow-down-to-line": ArrowDownToLine,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  "badge-check": BadgeCheck,
  bell: Bell,
  bookmark: Bookmark,
  briefcase: Briefcase,
  "calendar-clock": CalendarClock,
  camera: Camera,
  captions: Captions,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-dot": CircleDot,
  clapperboard: Clapperboard,
  clock: Clock,
  "code-xml": CodeXml,
  "file-check": FileCheck,
  "hand-coins": HandCoins,
  "id-card": IdCard,
  image: ImageIcon,
  "image-up": ImageUp,
  inbox: Inbox,
  "layout-dashboard": LayoutDashboard,
  lock: Lock,
  "log-out": LogOut,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  mic: Mic,
  monitor: Monitor,
  moon: Moon,
  "package-check": PackageCheck,
  palette: Palette,
  pin: Pin,
  "pin-off": PinOff,
  play: Play,
  plus: Plus,
  receipt: Receipt,
  "refresh-cw": RefreshCw,
  repeat: Repeat,
  "rotate-ccw": RotateCcw,
  "scan-face": ScanFace,
  search: Search,
  send: Send,
  settings: Settings,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  star: Star,
  sun: Sun,
  tag: Tag,
  timer: Timer,
  "trash-2": Trash2,
  "trending-up": TrendingUp,
  "user-round": UserRound,
  video: Video,
  "volume-2": Volume2,
  "volume-x": VolumeX,
  wallet: Wallet,
  x: X,
  zap: Zap,
};

// "material-symbols:star-rounded" in the design is a single filled rounded
// star used only for ratings — approximated here with lucide's Star filled,
// since the exact glyph isn't load-bearing.
export default function Icon({ icon, size = 16, className = "", style, ...rest }) {
  const name = (icon || "").replace(/^lucide:/, "").replace(/^material-symbols:star-rounded$/, "star");
  const Cmp = registry[name];
  if (!Cmp) return null;
  const filled = icon === "material-symbols:star-rounded";
  return (
    <Cmp
      size={size}
      className={className}
      strokeWidth={2}
      style={style}
      fill={filled ? "currentColor" : "none"}
      {...rest}
    />
  );
}
