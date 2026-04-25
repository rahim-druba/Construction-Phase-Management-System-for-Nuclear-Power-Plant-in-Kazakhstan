# Atomforce — Workforce Command System

> *We reduced workforce management complexity into two decisions: visibility and action.*

A polished, executive-grade web app for managing labor during Nuclear Power Plant construction. Built for a 24-hour hackathon. **Two pages. One brain.**

---

## The Two Pages

### 1. Executive Dashboard — *Visibility*

One screen merging every supervision view a site director needs.

- **KPI strip**: Total Workers · Available Today · Shortage Alerts · Fatigue Alerts · Expiring Certs
- **Weekly Attendance Trend** (required vs available, 14d)
- **Workers by Discipline** (pie)
- **Zone Staffing Coverage** (bar, 8 NPP-2 zones)
- **Operational Alerts**: skill shortages · delayed/at-risk zones · cert renewals
- **Kazakhstan Local Content** donut + 80% target indicator (premium)

### 2. Workforce Control Center — *Action*

The "AI brain" page. Two modes that share one decision surface.

- **Task Allocation mode**
  - Pick a task on the left → ranked crew suggestion in the middle
  - Right panel: **Assign Crew** + **Auto-Rotate Fatigued** (swaps tired workers for rested substitutes)
- **Delay Recovery mode**
  - Pick a delayed zone → eligible movers from healthy zones
  - Slider for headcount → live recovery-days estimate, source breakdown, **Reallocate Workers** action
- **Optimize Workforce** button — runs the right action for the current mode in one click

Crew ranking factors: skill match, certification validity, fatigue score (0-100), and zone proximity.

Trilingual UI: **English / Русский / Қазақша** (top-right toggle, persisted).

---

## Tech Stack

- **Next.js 14** (Pages Router, JS)
- **Tailwind CSS 3** with a custom nuclear/atom palette and dark "executive" theme
- **Recharts** for charts
- **lucide-react** icons
- 100% frontend, deterministic seeded fake dataset (248 workers, 12 tasks, 8 zones)

## Folder Structure

```
src/
  components/   # AppShell, Sidebar, Topbar, StatCard, Pill, FatigueBar, PageHeader
  pages/
    index.js    # Executive Dashboard
    control.js  # Workforce Control Center
  data/         # workers.js · tasks.js · zones.js
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

**Minute 1 — Dashboard (visibility)**

Show: shortages strip, the delayed zones in the alerts panel, the KZ local-content donut. Mention the 80% state programme target.

**Minute 2 — Control Center (action)**

1. Switch to **Delay Recovery** mode, click **Turbine Hall**.
2. Set delay = 3 days, slide workers = 8.
3. Press **Optimize Workforce** → "1.5 days recovered, 5 workers from healthy zones, fatigue-safe, certs valid."
4. Switch back to **Task Allocation**, pick *Primary Loop Pipe Welding*. Click **Auto-Rotate Fatigued** → tired welders are swapped for rested ones in-place. Click **Assign Crew**. Done.

> "Two screens. Visibility, then action. That's construction management."
