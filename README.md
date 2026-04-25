# Atomforce — Workforce Command System

> *We reduced workforce management complexity into two decisions: visibility and action.*

A polished, executive-grade web app for managing labor during Nuclear Power Plant construction. Built for a 24-hour hackathon. **Two pages. One brain.**

---

## HR Lifecycle Coverage

The hackathon brief calls for full Human Resource management — recruitment, allocation, **rotation of labors**, training, planning, and compliance. Atomforce maps to all eight HR functions of a major NPP construction site:

| HR Function       | Where in Atomforce                                                              |
| ----------------- | ------------------------------------------------------------------------------- |
| **Recruitment**   | Dashboard → Recruitment Pipeline (open positions, applicants, time-to-fill)     |
| **Onboarding**    | Dashboard → Onboarding Tracker (recent hires + completion %)                    |
| **Allocation**    | Control Center → Task Allocation (Smart Crew suggestions ranked by 4 factors)   |
| **Rotation**      | Control Center → Shift Rotation (D/N/Off pattern, 7+ day flag, scheduled rest) |
| **Certification** | Dashboard alerts panel + Control Center cert-validity filters                   |
| **Planning**      | Dashboard KPI strip + skill-gap shortage alerts                                 |
| **Recovery**      | Control Center → Delay Recovery (re-allocation simulation with ETA)             |
| **Local Content** | Dashboard → Kazakhstan donut + 80% state-programme target                       |

The Dashboard renders an **HR Lifecycle Coverage strip** at the top so judges see all eight badges at a glance, each linking to where the function is implemented.

---

## The Two Pages

### 1. Executive Dashboard — *Visibility*

One screen merging every supervision view a site director needs.

- **HR Lifecycle Coverage strip** — 8 badges, one per HR function
- **KPI strip**: Total Workers · Available Today · Shortage Alerts · Fatigue Alerts · Expiring Certs
- **Weekly Attendance Trend** (required vs available, 14d)
- **Workers by Discipline** (pie)
- **Zone Staffing Coverage** (bar, 8 NPP-2 zones)
- **Operational Alerts**: skill shortages · delayed/at-risk zones · cert renewals
- **Recruitment Pipeline**: open reqs, applicants, time-to-fill, 12-month hiring/attrition trend, top 5 open positions
- **Onboarding Tracker**: recent hires with onboarding completion %
- **Kazakhstan Local Content** donut + 80% target indicator

### 2. Workforce Control Center — *Action*

The "AI brain" page. Three modes that share one decision surface.

- **Task Allocation mode**
  - Pick a task on the left → ranked crew suggestion in the middle (skill / cert / fatigue / proximity)
  - Right panel: **Assign Crew** + **Auto-Rotate Fatigued** (swaps tired workers for rested substitutes in-place)
- **Shift Rotation mode** *(rotation of labors)*
  - 7-day Day/Night/Off forecast for the entire workforce
  - Filter chips: All · Flagged · Day shift · Night shift · Off today · by Skill
  - Workers on duty 7+ consecutive days flagged in amber
  - Right panel: **Schedule Rest** for all flagged workers (forces 2 days off in their plan)
- **Delay Recovery mode**
  - Pick a delayed zone → eligible movers from healthy zones
  - Slider for headcount → live recovery-days estimate, source breakdown, **Reallocate Workers**
- **Optimize Workforce** button — runs the right action for the current mode in one click

Trilingual UI: **English / Русский / Қазақша** (top-right toggle, persisted).

---

## Tech Stack

- **Next.js 14** (Pages Router, JS)
- **Tailwind CSS 3** with a custom nuclear/atom palette and dark "executive" theme
- **Recharts** for charts
- **lucide-react** icons
- 100% frontend, deterministic seeded fake dataset (248 workers, 12 tasks, 8 zones, 8 open reqs, 6 onboarding records)

## Folder Structure

```
src/
  components/   # AppShell, Sidebar, Topbar, StatCard, Pill, FatigueBar, PageHeader
  pages/
    index.js    # Executive Dashboard
    control.js  # Workforce Control Center
  data/         # workers.js · tasks.js · zones.js · recruitment.js
  utils/        # workforce.js (allocation/rotation/recovery logic) · i18n.js
  styles/       # Global Tailwind + theme
```

## Run It

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

---

## 2-Minute Demo Script

**Minute 1 — Dashboard (visibility, full HR lifecycle)**

1. Point to the **HR Lifecycle Coverage strip** — "We address all eight HR functions of an NPP site, end to end."
2. Show the KPI strip → shortages → delayed zones panel.
3. Scroll to the **Recruitment Pipeline** — "8 open requisitions, 142 applicants, 13-day average time-to-fill, with the local-vs-foreign sourcing mix already aligned to the state programme."
4. Show the **Onboarding tracker** — "Six new hires in the last 30 days, completion percentages live."
5. End on the **Kazakhstan Local Content** donut at the 80% target.

**Minute 2 — Control Center (action)**

1. **Shift Rotation** mode → click *Flagged* filter → "12 workers exceed the 7-day limit." Click **Schedule Rest** → all flip to "Rest scheduled" with 2 days off in their plan.
2. **Delay Recovery** mode → click *Turbine Hall* → set delay = 3 days, slide workers = 8 → "1.5 days recovered, fatigue-safe, certs valid."
3. **Task Allocation** mode → pick *Primary Loop Pipe Welding* → click **Auto-Rotate Fatigued** → click **Assign Crew**. Done.

> "Two screens. Visibility, then action. Eight HR functions, end to end."
