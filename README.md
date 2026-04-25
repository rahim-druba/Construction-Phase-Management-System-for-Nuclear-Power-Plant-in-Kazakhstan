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

### Predictive Layer — *AI Risk Forecast*

On top of the eight functions, Atomforce includes a **rule-based predictive analytics engine** that converts the operational data into three forward-looking risk scores for the next 7 days:

| Risk                  | Triggered when                                                                  | Mitigation                              |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| **Labor Shortage**    | needed > available certified workers and a task starts within 7 days            | Transfer + recruit                      |
| **Crew Fatigue**      | crew-share above the 7-consecutive-day / fatigue-70 threshold                   | Auto-rotate to mandatory rest           |
| **Schedule Delay**    | task-level workforce gap × priority × deadline-proximity score                  | Reallocate from healthy zones           |

Each prediction shows a probability %, severity color, the data basis it draws on (e.g. *"14-day staffing trend · upcoming task pipeline · certification expiry schedule"*), and a one-click **Resolve** button that visibly drops the probability — the before/after demo moment.

We deliberately do **not** claim deep learning. We claim *predictive analytics* and *rule-based decision support*, which is honest and judge-safe.

---

## The Two Pages

### 1. Executive Dashboard — *Visibility*

One screen merging every supervision view a site director needs.

- **HR Lifecycle Coverage strip** — 8 badges, one per HR function
- **KPI strip**: Total Workers · Available Today · Shortage Alerts · Fatigue Alerts · Expiring Certs
- **AI Risk Forecast** *(predictive analytics engine)* — three rule-based predictions for the next 7 days: *Labor Shortage Risk*, *Crew Fatigue Risk*, *Schedule Delay Risk*. Each row shows probability %, severity color, the data basis it draws on, and a one-click **Resolve** button that drops the probability live (e.g. 82% → 29%). One-click **Resolve All** for the demo before/after moment.
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
  - Pick a delayed zone → AI **Predicted Risks · Next 7 Days** mini-card appears (zone-level shortage / fatigue / delay probabilities)
  - Eligible movers from healthy zones, slider for headcount → live recovery-days estimate, source breakdown
  - Click **Reallocate Workers** → the zone risk index drops in place (the per-zone before/after).
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
  utils/        # workforce.js (allocation/rotation/recovery logic) · risk.js (predictive engine) · i18n.js
  components/   # …including AIRiskPanel.js
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

**Minute 1 — Dashboard (visibility + prediction)**

1. Point to the **HR Lifecycle Coverage strip** — "Eight HR functions, end to end."
2. Drop into the **AI Risk Forecast** panel:
   - "Labor shortage at 82%, crew fatigue at 74%, cable task delay at 68% — predicted for the next 7 days."
   - Click **Resolve All**. Watch the bars drop live: 82 → 29, 74 → 28, 68 → 25. Aggregate index drops in the header.
   - "Our engine moves us from reactive scheduling to predictive risk prevention."
3. Show the KPI strip + **Recruitment Pipeline** + **Onboarding** + **Kazakhstan Local Content** donut at the 80% target.

**Minute 2 — Control Center (action)**

1. **Delay Recovery** mode → click *Turbine Hall* → notice the **Predicted Risks · Next 7 Days** mini-card appear at the top.
   - Set delay = 3 days, slide workers = 8 → click **Reallocate Workers**.
   - Zone Risk Index drops in place — judges see the per-zone before/after.
2. **Shift Rotation** mode → *Flagged* filter → click **Schedule Rest** → all flip to "Rest scheduled" with 2 days off.
3. **Task Allocation** mode → *Primary Loop Pipe Welding* → **Auto-Rotate Fatigued** → **Assign Crew**. Done.

> *"Atomforce moves workforce management from reactive scheduling to predictive risk prevention. Two screens. Visibility, then action. Eight HR functions, end to end."*
