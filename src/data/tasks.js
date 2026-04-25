// Active and upcoming tasks across the NPP-2 site.
// "needed" = headcount required, "skill" must match worker.skill, "zoneId" matches zones.
export const TASKS = [
  { id: "T-101", title: "Primary Loop Pipe Welding",      skill: "Welder",          needed: 8,  zoneId: "TH",  priority: "critical", deadlineDays: 4 },
  { id: "T-102", title: "Reactor Vessel Rebar Tying",     skill: "Rebar Fitter",    needed: 12, zoneId: "RB",  priority: "high",     deadlineDays: 7 },
  { id: "T-103", title: "Cable Tray Installation",        skill: "Electrician",     needed: 6,  zoneId: "SY",  priority: "high",     deadlineDays: 5 },
  { id: "T-104", title: "Containment Concrete Pour",      skill: "Concrete Worker", needed: 14, zoneId: "RB",  priority: "critical", deadlineDays: 3 },
  { id: "T-105", title: "Crane Lift — Steam Generator",   skill: "Crane Operator",  needed: 3,  zoneId: "TH",  priority: "critical", deadlineDays: 2 },
  { id: "T-106", title: "Scaffolding for Dome Lining",    skill: "Scaffolder",      needed: 10, zoneId: "RB",  priority: "medium",   deadlineDays: 9 },
  { id: "T-107", title: "NDT Weld Inspection (Sector 4)", skill: "Inspector (NDT)", needed: 4,  zoneId: "TH",  priority: "high",     deadlineDays: 6 },
  { id: "T-108", title: "Control Room Cabling",           skill: "I&C Technician",  needed: 5,  zoneId: "CR",  priority: "high",     deadlineDays: 8 },
  { id: "T-109", title: "HVAC Duct Mounting",             skill: "HVAC Technician", needed: 4,  zoneId: "AB",  priority: "medium",   deadlineDays: 10 },
  { id: "T-110", title: "Grounding Grid Install",         skill: "Electrician",     needed: 5,  zoneId: "EM",  priority: "medium",   deadlineDays: 11 },
  { id: "T-111", title: "Pipe Spool Fit-up",              skill: "Pipefitter",      needed: 7,  zoneId: "AB",  priority: "high",     deadlineDays: 5 },
  { id: "T-112", title: "Site Safety Walkdown",           skill: "Safety Officer",  needed: 3,  zoneId: "RB",  priority: "high",     deadlineDays: 1 },
];
