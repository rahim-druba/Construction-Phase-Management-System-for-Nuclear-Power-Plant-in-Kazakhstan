# Atomforce — NPP Workforce Intelligence Dashboard

A polished, executive-grade web app for managing labor during nuclear power plant construction. Built for a 24-hour hackathon.

## Modules

1. **Operations Dashboard** — KPIs, staffing trend, zone coverage, discipline mix, critical alerts
2. **Workforce Roster** — searchable, filterable table of every worker on site
3. **Smart Crew Allocation** — auto-suggests the best crew for any task, ranked by fatigue, certification, and zone proximity
4. **Shift / Rotation Planner** — 7-day rotation forecast, auto-flags workers with 7+ consecutive days
5. **Certification Tracker** — alerts for expired and expiring (≤30 days) certificates, with renewal pipeline
6. **Workforce Gap Analysis** — required vs available by discipline and skill, plus Kazakhstan local-content chart (premium)
7. **Delay Recovery Simulator** — pick a delayed zone, model worker re-allocation from healthy zones, see schedule impact

Trilingual UI: **English / Русский / Қазақша** (toggle in the top-right).

## Tech Stack

- **Next.js 14** (Pages Router, JS)
- **Tailwind CSS 3**
- **Recharts** for charts
- **lucide-react** icons
- 100% frontend, fake JSON dataset baked into `src/data/`

## Folder Structure

```
src/
  components/   # AppShell, Sidebar, Topbar, StatCard, Pill, FatigueBar, PageHeader
  pages/        # Next.js routes (one per module)
  data/         # Fake datasets: workers, tasks, zones
  utils/        # Allocation logic, i18n, helpers
  styles/       # Global Tailwind + theme
```

## Run It

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Build for production:

```bash
npm run build
npm start
```

## Demo Script (2 minutes)

1. **Dashboard** — point to "Skill Shortages = 3" and the delayed zones panel
2. **Smart Allocation** — pick "Primary Loop Pipe Welding" (8 welders), click *Assign 8*. Show that the panel ranks by fatigue + cert + in-zone proximity
3. **Rotation Planner** — filter to *Flagged*, click *Auto-rotate flagged* — fatigue alerts resolve into scheduled rest
4. **Delay Recovery** — pick Turbine Hall, set delay = 3 days, slide workers to move = 8, run simulation — see "1.0 days recovered"
5. **Gap Analysis** — show the Kazakhstan local content donut at 80%+ — answers state programme requirements
