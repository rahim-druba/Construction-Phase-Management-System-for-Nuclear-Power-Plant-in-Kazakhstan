// NPP-2 construction zones (canonical names used across the app)
export const ZONES = [
  { id: "RB",  name: "Reactor Building",     discipline: "Civil",      progress: 62, status: "on-track" },
  { id: "TH",  name: "Turbine Hall",         discipline: "Mechanical", progress: 48, status: "delayed" },
  { id: "CT",  name: "Cooling Tower",        discipline: "Civil",      progress: 81, status: "on-track" },
  { id: "AB",  name: "Auxiliary Building",   discipline: "Mechanical", progress: 70, status: "on-track" },
  { id: "SY",  name: "Switchyard",           discipline: "Electrical", progress: 55, status: "at-risk" },
  { id: "CR",  name: "Control Room",         discipline: "I&C",        progress: 38, status: "delayed" },
  { id: "SF",  name: "Spent Fuel Pool",      discipline: "Civil",      progress: 90, status: "complete" },
  { id: "EM",  name: "Emergency Diesel",     discipline: "Electrical", progress: 65, status: "on-track" },
];

export const DISCIPLINES = ["Civil", "Mechanical", "Electrical", "I&C", "Safety"];
