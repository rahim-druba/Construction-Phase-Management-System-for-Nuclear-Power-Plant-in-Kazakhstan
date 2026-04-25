// Generated, deterministic fake roster for NPP-2 construction site.
// Mix of Kazakh, Russian, and a few foreign-contractor names for realism.
// daysWorked = consecutive days on the current rotation
// shift = "day" | "night" | "off"
// cert.expiresInDays = days until primary certificate expires (negative = expired)

const FIRST_KZ_M = ["Aibek","Dauren","Yerlan","Nurlan","Bauyrzhan","Kanat","Marat","Talgat","Aslan","Yerzhan","Beibit","Olzhas","Sayat","Arman","Galymzhan","Berik","Daniyar","Kuanysh","Murat","Rustem","Serik","Timur","Yermek","Zhandos","Madi","Sultan","Adil","Bakhyt","Daulet","Alikhan"];
const FIRST_KZ_F = ["Aigerim","Dana","Aliya","Madina","Saltanat","Zarina","Aizhan","Karina","Gulnara","Asel","Botagoz","Dinara"];
const FIRST_RU_M = ["Sergey","Ivan","Andrey","Dmitry","Mikhail","Pavel","Vladimir","Alexey","Ruslan","Igor","Konstantin","Nikolay","Anton","Maxim","Roman"];
const FIRST_RU_F = ["Olga","Elena","Natalia","Irina","Anna","Tatiana"];
const LAST_KZ = ["Nurmagambetov","Tokayev","Iskakov","Akhmetov","Suleimenov","Mukanov","Bekov","Zhumagulov","Omarov","Sagintayev","Kasymov","Yesenov","Tashenov","Abenov","Kenzhebek","Serikbay","Aitkulov","Bektemirov","Toleubek","Karimov"];
const LAST_RU = ["Petrov","Sidorov","Volkov","Smirnov","Kuznetsov","Popov","Vasiliev","Sokolov","Lebedev","Novikov","Morozov","Pavlov"];
const LAST_FOREIGN = [
  ["Ismail","Demir"],["Mehmet","Yılmaz"],["Hyun-woo","Kim"],["Wei","Chen"],["Anil","Sharma"],["Hassan","Al-Mansouri"]
];

const SKILLS = [
  { name: "Welder",          discipline: "Mechanical", cert: "Weld License (6G)" },
  { name: "Pipefitter",      discipline: "Mechanical", cert: "Pressure Pipe Cert" },
  { name: "Electrician",     discipline: "Electrical", cert: "HV Electrical License" },
  { name: "Crane Operator",  discipline: "Mechanical", cert: "Crane Permit" },
  { name: "Concrete Worker", discipline: "Civil",      cert: "Heavy Lift Safety" },
  { name: "Rebar Fitter",    discipline: "Civil",      cert: "Site Safety Cert" },
  { name: "Scaffolder",      discipline: "Civil",      cert: "Working at Heights" },
  { name: "Inspector (NDT)", discipline: "Safety",     cert: "ASNT Level II" },
  { name: "I&C Technician",  discipline: "I&C",        cert: "Instrumentation Cert" },
  { name: "HVAC Technician", discipline: "Mechanical", cert: "HVAC Certification" },
  { name: "Safety Officer",  discipline: "Safety",     cert: "Radiation Safety" },
  { name: "Foreman",         discipline: "Civil",      cert: "Site Supervisor" },
];

const ZONE_IDS = ["RB","TH","CT","AB","SY","CR","SF","EM"];

// Tiny seeded PRNG so results are stable across SSR/CSR
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260425);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (a, b) => Math.floor(rand() * (b - a + 1)) + a;

function makeName() {
  const r = rand();
  if (r < 0.55) {
    // Kazakh
    const m = rand() < 0.85;
    const first = pick(m ? FIRST_KZ_M : FIRST_KZ_F);
    const last = pick(LAST_KZ);
    return { full: `${first} ${last}`, origin: "local" };
  } else if (r < 0.88) {
    // Russian
    const m = rand() < 0.8;
    const first = pick(m ? FIRST_RU_M : FIRST_RU_F);
    const last = pick(LAST_RU);
    return { full: `${first} ${last}`, origin: "local" };
  }
  // Foreign contractor
  const [f, l] = pick(LAST_FOREIGN);
  return { full: `${f} ${l}`, origin: "foreign" };
}

function makeWorker(i) {
  const skill = pick(SKILLS);
  const { full, origin } = makeName();
  const zone = pick(ZONE_IDS);
  const daysWorked = randInt(0, 12);
  const shiftRoll = rand();
  const shift = shiftRoll < 0.5 ? "day" : shiftRoll < 0.85 ? "night" : "off";
  const available = shift !== "off" && rand() < 0.8;

  // Certificate expiry — bias a portion to be expiring or expired for realism
  const certRoll = rand();
  let expiresInDays;
  if (certRoll < 0.08) expiresInDays = randInt(-30, -1);     // expired
  else if (certRoll < 0.25) expiresInDays = randInt(0, 30);   // expiring soon
  else if (certRoll < 0.5) expiresInDays = randInt(31, 120);  // expiring in <4mo
  else expiresInDays = randInt(121, 720);                     // valid

  const certStatus =
    expiresInDays < 0 ? "expired" :
    expiresInDays <= 30 ? "expiring" :
    "valid";

  // Fatigue score 0..100 derived from consecutive days + shift type
  const baseFatigue = Math.min(100, daysWorked * 8 + (shift === "night" ? 15 : 0));
  const fatigue = Math.max(0, Math.min(100, baseFatigue + randInt(-8, 8)));

  return {
    id: i + 1,
    employeeId: `KZ-${(10000 + i).toString()}`,
    name: full,
    origin,
    skill: skill.name,
    discipline: skill.discipline,
    zone,
    available,
    shift,            // "day" | "night" | "off"
    daysWorked,
    fatigue,
    cert: {
      name: skill.cert,
      status: certStatus,    // "valid" | "expiring" | "expired"
      expiresInDays,
    },
    yearsExperience: randInt(1, 22),
  };
}

const TOTAL = 248;
export const WORKERS = Array.from({ length: TOTAL }, (_, i) => makeWorker(i));

export const SKILL_LIST = SKILLS.map((s) => s.name);
