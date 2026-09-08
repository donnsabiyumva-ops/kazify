export const STACK_DEPTH = 1;

export const cats = ["Photography", "Video Editing", "Art", "Web Development", "Event Planning", "MC/Artist", "Social Media Marketing"];
export const catIcons = {
  Photography: "camera",
  "Video Editing": "clapperboard",
  Art: "palette",
  "Web Development": "code-xml",
  "Event Planning": "calendar-clock",
  "MC/Artist": "mic",
  "Social Media Marketing": "megaphone",
};

export const sellerNav = [
  { name: "Dashboard", icon: "layout-dashboard" },
  { name: "My Services", icon: "clapperboard" },
  { name: "Orders", icon: "inbox" },
  { name: "Earnings", icon: "wallet" },
];

export const reelActionsSeed = [
  { label: "Record", icon: "circle-dot", msg: "Camera opens for a fresh take" },
  { label: "Add caption", icon: "captions", msg: "Auto-captions generated" },
  { label: "Set gig price", icon: "tag", msg: "Gig price attached to service" },
  { label: "Schedule", icon: "calendar-clock", msg: "Service scheduled for 6pm" },
];

export const prefDefs = [
  { key: "autoRelease", label: "Auto-release escrow on approval", hint: "Funds move the moment you accept delivery." },
  { key: "digest", label: "Weekly shortlist digest", hint: "New services matching your saved filters." },
];

export const windowDefs = ["Instant", "3 days", "7 days"];

export const methodDefs = [
  { key: "mtn", name: "MTN Mobile Money", short: "MTN", msisdn: "+256 77 •• 4192" },
  { key: "airtel", name: "Airtel Money", short: "AIR", msisdn: "+256 70 •• 8630" },
];

export const idTypeDefs = ["National ID", "Passport", "Driver licence"];
export const idDocDefs = [
  { key: "docFront", label: "ID front", icon: "id-card" },
  { key: "docBack", label: "Selfie with ID", icon: "scan-face" },
];

export const intentDefs = [
  { key: "client", label: "Hire creators", hint: "Swipe services, shortlist, pay through escrow.", icon: "hand-coins" },
  { key: "freelancer", label: "Sell my work", hint: "Post services, take fixed-price gigs, get paid to MoMo.", icon: "briefcase" },
  { key: "both", label: "Both", hint: "Start in hiring mode, selling unlocked after your first service.", icon: "repeat" },
];

export const rolesDefs = [
  { key: "client", label: "Hiring", icon: "hand-coins" },
  { key: "freelancer", label: "Selling", icon: "briefcase" },
];

export const facetsDefs = [
  { key: "hiring", label: "Hiring", icon: "hand-coins" },
  { key: "selling", label: "Selling", icon: "briefcase" },
];

