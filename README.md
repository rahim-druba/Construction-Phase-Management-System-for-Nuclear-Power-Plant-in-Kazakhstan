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

### Predictive Layer — *This Week's Risk Forecast*

On top of the eight HR functions, the Dashboard carries a **rule-based forecast panel** written for a site manager, not a data scientist. It surfaces the three issues most likely to cause a schedule slip or safety incident in the next 7 days, and ships with a one-click fix per row.

| Risk                  | Triggered when                                                                  | Recommended action                      |
| --------------------- | ------------------------------------------------------------------------------- | --------------------------------------- |
| **Labor Shortage**    | upcoming task needs more certified workers than the live roster can supply      | Move workers in from a healthy zone     |
| **Crew Fatigue**      | a worker has been on duty 7+ consecutive days, or fatigue index ≥ 70            | Rotate flagged workers to 2-day rest    |
| **Schedule Delay**    | task workforce gap × priority × deadline-proximity score above threshold        | Reallocate workers from healthy zones   |

Each row shows:
- A plain-English headline (e.g. *"Reactor Building short 2 Concrete Workers in 3 days"*)
- A **Likelihood · 7-day** score (0–100%) and a **Low / Medium / High / Critical** word, so the number isn't ambiguous
- A one-line foreman-style recommendation (e.g. *"Move 2 Concrete Workers from Auxiliary Building"*)
- A single **Resolve** button — clicking it drops the score visibly (e.g. 82% → 29%) and the headline strikes through. Click **Undo** to revert. This is the demo before/after moment.

The header explains the metric in plain words:
> *Each score is the likelihood the issue causes a schedule slip or safety incident within 7 days. Built from the live task pipeline, fatigue thresholds, and certification expiry.*

We deliberately do **not** claim deep learning. We say *rule-based decision support*, which is honest and judge-safe.

---

## The Two Pages

### 1. Executive Dashboard — *Visibility*

One screen merging every supervision view a site director needs.

- **HR Lifecycle Coverage strip** — 8 badges, one per HR function
- **KPI strip**: Total Workers · Available Today · Shortage Alerts · Fatigue Alerts · Expiring Certs
- **This Week's Risk Forecast** — rule-based predictions for the next 7 days, written for a site manager. Three rows: *Labor Shortage*, *Crew Fatigue*, *Schedule Delay*. Each row carries:
  - the issue in one sentence (e.g. *"Reactor Building short 2 Concrete Workers in 3 days"*)
  - the recommended action in one sentence (e.g. *"Move 2 Concrete Workers from Auxiliary Building"*)
  - a **Likelihood · 7-day** score (0–100%) with a **Low / Medium / High / Critical** word so the number is never ambiguous
  - a single **Resolve** button that drops the score live (e.g. 82% → 29%) — the before/after demo moment. **Undo** restores it.
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
  - Pick a delayed zone → an inline **Likelihood next 7 days** strip appears for that zone (Shortage / Fatigue / Delay percentages, with the same explanation as the dashboard panel).
  - Eligible movers from healthy zones, slider for headcount → live recovery-days estimate, source breakdown.
  - Click **Reallocate Workers** → the zone scores drop in place with `(was 72%)` next to the new value — the per-zone before/after.
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
  components/   # AppShell, Sidebar, Topbar, StatCard, Pill, FatigueBar,
                # PageHeader, AIRiskPanel (forecast card)
  pages/
    index.js    # Executive Dashboard (KPIs · forecast · recruitment · onboarding · KZ%)
    control.js  # Workforce Control Center (Allocate / Rotate / Recover)
  data/         # workers.js · tasks.js · zones.js · recruitment.js
  utils/
    workforce.js # crew allocation, rotation, recovery logic
    risk.js      # rule-based predictive engine (shortage / fatigue / delay)
    i18n.js      # EN / RU / KZ translations
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

1. Point to the **HR Lifecycle Coverage strip** — *"Eight HR functions, end to end."*
2. Drop into **This Week's Risk Forecast**:
   - Read the header line out loud: *"Each score is the likelihood the issue causes a schedule slip or safety incident within 7 days."*
   - Read the three rows the way a site manager would: *"Reactor Building short 2 Concrete Workers — 62% high. 102 workers past the 7-day shift limit — 90% critical. Containment Pour likely to slip 2.5 days — 64% high."*
   - Click **Resolve** on each row. The score drops in place with `was 82%` next to the new number, the headline strikes through, the recommendation flips to past-tense ("Moved 2 from Auxiliary Building"), and the *open issues* counter at the top decrements. *"Three problems, three actions, fixed before the morning huddle."*
3. Show the KPI strip + **Recruitment Pipeline** + **Onboarding** + **Kazakhstan Local Content** donut at the 80% target.

**Minute 2 — Control Center (action)**

1. **Delay Recovery** mode → click *Turbine Hall* → an inline strip at the top reads *"Likelihood next 7 days · Turbine Hall — Shortage 72% · Fatigue 41% · Delay 68%"*.
   - Set delay = 3 days, slide workers = 8 → click **Reallocate Workers**.
   - The strip refreshes live: *"Shortage 32% (was 72%) · Delay 25% (was 68%)"* — judges see the per-zone before/after.
2. **Shift Rotation** mode → *Flagged* filter → click **Schedule Rest** → all flip to "Rest scheduled" with 2 days off.
3. **Task Allocation** mode → *Primary Loop Pipe Welding* → **Auto-Rotate Fatigued** → **Assign Crew**. Done.

> *"Atomforce moves workforce management from reactive scheduling to predictive risk prevention. Two screens. Visibility, then action. Eight HR functions, end to end."*
