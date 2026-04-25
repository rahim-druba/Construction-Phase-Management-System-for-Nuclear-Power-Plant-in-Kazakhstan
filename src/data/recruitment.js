// Active recruitment / hiring pipeline for NPP-2 site staffing.
// Realistic mix of open vacancies driven by site demand, with sourcing data
// (local Kazakhstan vs. foreign contractor) and time-to-fill estimates.

export const OPEN_POSITIONS = [
  { id: "P-01", role: "Welder",          discipline: "Mechanical", needed: 6,  applicants: 18, daysOpen: 9,  urgency: "critical", source: "local",   manager: "T. Akhmetov" },
  { id: "P-02", role: "Crane Operator",  discipline: "Mechanical", needed: 2,  applicants: 5,  daysOpen: 14, urgency: "critical", source: "foreign", manager: "S. Petrov" },
  { id: "P-03", role: "Electrician",     discipline: "Electrical", needed: 4,  applicants: 22, daysOpen: 7,  urgency: "high",     source: "local",   manager: "A. Iskakov" },
  { id: "P-04", role: "I&C Technician",  discipline: "I&C",        needed: 3,  applicants: 11, daysOpen: 21, urgency: "high",     source: "mixed",   manager: "Y. Kim" },
  { id: "P-05", role: "Concrete Worker", discipline: "Civil",      needed: 12, applicants: 47, daysOpen: 4,  urgency: "medium",   source: "local",   manager: "B. Suleimenov" },
  { id: "P-06", role: "Inspector (NDT)", discipline: "Safety",     needed: 2,  applicants: 4,  daysOpen: 30, urgency: "high",     source: "foreign", manager: "M. Yılmaz" },
  { id: "P-07", role: "Scaffolder",      discipline: "Civil",      needed: 8,  applicants: 26, daysOpen: 6,  urgency: "medium",   source: "local",   manager: "T. Akhmetov" },
  { id: "P-08", role: "HVAC Technician", discipline: "Mechanical", needed: 3,  applicants: 9,  daysOpen: 12, urgency: "medium",   source: "mixed",   manager: "S. Petrov" },
];

// Recently onboarded workers — last 30 days
export const RECENT_HIRES = [
  { name: "Aibek Nurmagambetov",  role: "Welder",          startedDaysAgo: 3,  origin: "local",   onboardingPct: 35 },
  { name: "Hyun-woo Kim",         role: "I&C Technician",  startedDaysAgo: 6,  origin: "foreign", onboardingPct: 60 },
  { name: "Madina Bekova",        role: "Safety Officer",  startedDaysAgo: 8,  origin: "local",   onboardingPct: 70 },
  { name: "Sergey Volkov",        role: "Pipefitter",      startedDaysAgo: 11, origin: "local",   onboardingPct: 80 },
  { name: "Olzhas Sagintayev",    role: "Concrete Worker", startedDaysAgo: 14, origin: "local",   onboardingPct: 90 },
  { name: "Hassan Al-Mansouri",   role: "Crane Operator",  startedDaysAgo: 21, origin: "foreign", onboardingPct: 100 },
];

// 12-month hiring trend — synthetic but plausible
export const HIRING_TREND = [
  { month: "May", hired: 8,  attrited: 2 },
  { month: "Jun", hired: 12, attrited: 3 },
  { month: "Jul", hired: 15, attrited: 4 },
  { month: "Aug", hired: 22, attrited: 5 },
  { month: "Sep", hired: 18, attrited: 6 },
  { month: "Oct", hired: 24, attrited: 4 },
  { month: "Nov", hired: 19, attrited: 7 },
  { month: "Dec", hired: 11, attrited: 5 },
  { month: "Jan", hired: 14, attrited: 6 },
  { month: "Feb", hired: 21, attrited: 4 },
  { month: "Mar", hired: 28, attrited: 3 },
  { month: "Apr", hired: 17, attrited: 5 },
];
