# Life OS Product and Build Plan

## 1. Product definition

Life OS is a private, installable web application for one person. It runs in a desktop browser and installs on Android as a Progressive Web App. It combines daily guidance, honest tracking, adaptive planning, and long-term evidence without becoming a complicated project-management tool.

The app does not attempt to schedule every hour. It maintains a small set of commitments, understands their importance and timing, and adapts the remaining day or week when reality changes.

## 2. Core product loop

The daily loop is:

1. Open the Today screen.
2. See the current day state and one recommended next action.
3. Complete, reschedule, reduce, or explicitly skip a commitment.
4. Log meaningful outcomes with one or two taps.
5. Close the day with a short reflection.
6. Let the system prepare a realistic tomorrow from unfinished commitments and weekly targets.

The weekly loop is:

1. Review consistency by life area.
2. Review real outcomes, not only time or checkmarks.
3. Choose fixed commitments for the coming week.
4. Set flexible targets for work that can move between days.
5. Keep, reduce, or pause experiments based on evidence.

## 3. Life areas

### Deen

- Five daily salah check-ins with status: on time, prayed late, missed, or not recorded.
- Optional congregational-prayer detail without making it part of the first release.
- One daily Quran target expressed as a hizb, fraction of a hizb, or pages.
- Quran progress can be divided across prayer anchors.
- Deen appears first in the daily flow but does not produce game points.
- Historical views show consistency privately and neutrally.

### Driving licence

- Fixed practice appointments with date, start time, and expected duration.
- Attendance status: attended, cancelled by school, rescheduled, or missed.
- Theory and practical sessions can be distinguished later.
- The weekly metric is attendance against scheduled opportunities.

### Job search

- Track opportunities through saved, preparing, applied, replied, interview, offer, rejected, and closed states.
- Each daily job action must belong to a real opportunity or a defined preparation task.
- Record role, company, route, date, link, next action, and notes.
- Weekly metrics prioritize quality applications, substantive replies, interviews, offers, and income.
- AI assistance is not counted as progress until Mehdi reviews or sends the actual work.

### Training and health

- Simple planned-session and completed-session tracking.
- Record duration and an optional short note, not a full bodybuilding database.
- Support a minimum movement action on low-capacity days.

### YouTube

- Track the production stage: idea, selected, script, recorded, editing, packaged, published.
- A session records which video moved forward and what changed.
- Metrics emphasize finished scripts, recordings, and published videos over hours spent.

### Experiments and income

- KDP and future experiments live in a bounded Experiments area.
- Each experiment has a time budget, review date, hypothesis, cost, and evidence metric.
- Income is recorded by source, amount, currency, date, and confirmed or pending status.
- Etsy remains paused unless account recovery becomes an active commitment.

## 4. Information architecture

### Today

The default screen. It contains:

- Date, current part of day, and a compact daily status.
- The next recommended action.
- Salah and Quran strip.
- Today's firm commitments.
- Flexible actions chosen from weekly targets.
- Quick-add button.
- Recovery mode when the day has fallen behind.
- Evening closeout.

### Week

- Weekly commitments arranged by day.
- Flexible target pool that can move between days.
- Capacity settings for each day: low, normal, or high.
- A preview of what the adaptive engine will protect, move, reduce, or pause.

### Journey

- GitHub-style contribution history covering the last year.
- Each square represents a day's meaningful completion, not app activity.
- Tap or hover reveals the day's domain breakdown and completed outcomes.
- Filters allow viewing all activity or one life area.
- Streaks, recovery streaks, and consistency trends appear here.

### Work

- Job pipeline and opportunity details.
- YouTube pipeline.
- Experiments and income evidence.
- These share one section because they relate to livelihood, but remain visually distinct.

### Insights

- Weekly scorecard.
- Twelve-week trends.
- Planned versus completed commitments.
- Real-world outcomes.
- Miss patterns and recovery speed.
- No vanity charts that do not support a decision.

### Settings

- Prayer calculation and location settings if automatic times are enabled.
- Quran target and preferred unit.
- Week start and time zone.
- Notification windows.
- Motion and accessibility preferences.
- Data export, backup, and account controls.

## 5. Adaptive enforcement model

Every item has one of three levels:

- Core: must remain visible and cannot silently roll away.
- Committed: attached to a chosen day or appointment.
- Flexible: can move inside the current week.

Every item also has a minimum version. A full training session might have a 20-minute movement fallback. Job work might fall back to one reviewed application or one recruiter reply. Quran targets may be divided across the remaining prayer anchors, but the target is not quietly reduced by the app.

When the plan breaks:

1. The app asks what changed: time, energy, external cancellation, avoidance, or other.
2. It preserves Core items.
3. It reschedules appointments only with explicit confirmation.
4. It moves Flexible work to days with remaining capacity.
5. It suggests minimum versions where appropriate.
6. It pauses low-priority experiments before crowding the next day.
7. It prevents an endless overdue backlog by requiring reschedule, reduce, skip, or archive decisions.

Recovery mode is a deliberate reduced plan for the remainder of a disrupted day. Returning after a miss is treated as a meaningful success.

## 6. Metrics that matter

### Daily integrity

A day receives a contribution intensity based on the proportion of that day's planned meaningful commitments completed. Opening the app, editing a task, or logging time does not increase it.

The heatmap uses four or five intensity levels and domain-colored detail on interaction. It must remain readable without relying only on color.

### Deen

- Salah recorded and on-time rates.
- Quran target completion.
- Number of days returned after a miss.

These metrics remain private and are displayed without competitive rankings or game currency.

### Licence

- Sessions attended versus scheduled.
- Current attendance streak.
- Missed sessions requiring rescheduling.

### Job search

- Relevant applications submitted.
- Reply rate.
- Interviews reached.
- Active opportunities with overdue next actions.
- Offers and confirmed income.

### Health

- Planned sessions completed.
- Weeks meeting the consistency target.
- Average recovery time after a missed session.

### YouTube

- Videos moved between meaningful stages.
- Scripts recorded.
- Videos published.
- Production cycle time.

### System health

- Commitment completion by type.
- Overplanning ratio.
- Reschedule frequency.
- Average time to recover after a missed day.
- Areas repeatedly losing to lower-priority work.

## 7. Streak and consequence philosophy

Life OS can create emotional accountability without humiliation.

- Standard streak: consecutive days meeting the selected minimum.
- Recovery streak: consecutive times Mehdi returned after a miss instead of abandoning the system.
- Weekly consistency: success across a week so one imperfect day does not erase everything.
- The companion reacts to the day's state through posture, expression, and environment.
- A missed commitment makes the environment quieter or less energetic, not hostile.
- Recovery visibly restores life to the scene.
- The app can use firm copy such as "You committed to this today" but never personal attacks or catastrophic language.

## 8. Visual direction

### Physical scene

The app is opened at a desk in the morning and briefly from a phone throughout a busy day. It should feel like a small living world that is calm enough for reflection and vivid enough to invite return.

### Illustration language

- Soft, polished 3D forms with clay-like volume.
- Rounded friendly companion with simple facial features.
- Small environmental scenes representing growth, recovery, focus, and rest.
- Strong silhouettes that remain legible at mobile sizes.
- Illustrations are stateful product feedback, not filler on every screen.
- The companion should have an original identity and must not copy an existing mascot.

### Color strategy

Use a restrained interface with a committed living-world layer. Neutral app surfaces preserve clarity while mineral teal anchors the product. Domain colors appear in the heatmap, status details, illustrations, and moments of progress. Avoid rainbow decoration where color has no meaning.

Initial palette direction in OKLCH:

```css
:root {
  --life-bg: oklch(0.985 0 0);
  --life-surface: oklch(0.955 0.008 200);
  --life-ink: oklch(0.190 0.020 200);
  --life-muted: oklch(0.470 0.025 200);
  --life-primary: oklch(0.500 0.105 200);
  --life-accent: oklch(0.780 0.170 95);
  --life-success: oklch(0.610 0.145 145);
  --life-danger: oklch(0.560 0.180 25);
}
```

Exact contrast values must be tested during implementation. Dark mode may use a pure near-black foundation with the same living colors, but the first release should perfect one theme before supporting two.

### Motion language

- Routine controls respond within 150 to 250 milliseconds.
- Completion uses a short, satisfying state transition.
- The heatmap gently fills when a day changes intensity.
- The companion uses occasional state changes, not continuous distracting movement.
- Page content is visible immediately and never waits for an entrance sequence.
- Reduced-motion mode replaces movement with instant state changes or crossfades.

## 9. Mobile and desktop behavior

### Android

- Installable PWA with app icon, splash screen, standalone display, and offline shell.
- Bottom navigation for Today, Week, Journey, Work, and More.
- One-handed quick logging.
- Large touch targets and swipe only as an optional enhancement.
- Local notification support where browser and operating-system policies permit it.

### PC

- Compact left navigation.
- Wider Today layout with the living scene beside commitments.
- Keyboard shortcuts for quick add, complete, reschedule, and search.
- Hover details complement but never replace tap or click access.

## 10. Technical architecture

### Recommended stack

- Next.js with TypeScript for the responsive web application.
- Tailwind CSS plus explicit design tokens for consistent UI styling.
- Supabase Postgres for cross-device data, authentication, and backup.
- Supabase Row Level Security restricted to the single authorized account.
- TanStack Query for server state and reliable cache invalidation.
- IndexedDB for offline reads and queued writes.
- A service worker and web manifest for PWA installation.
- Vercel for deployment.
- Motion for React for state transitions, with reduced-motion handling.
- Recharts only for metrics that genuinely need charting. The contribution grid should be a purpose-built accessible component.

This stack keeps one codebase for PC and Android. A native Android application is unnecessary unless later evidence shows a browser limitation that materially hurts daily use.

### Data safety

- Store only data needed by the product.
- Encrypt traffic in transit through the hosting and database providers.
- Apply Row Level Security to every personal table before deployment.
- Provide JSON and CSV export.
- Add automatic database backups before the app becomes the only copy of historical data.
- Never expose service-role credentials to the browser.

## 11. Core data model

- `profiles`: user preferences, locale, time zone, accessibility settings.
- `life_areas`: deen, licence, job, health, YouTube, experiments.
- `commitments`: title, area, importance, schedule, minimum version, status.
- `commitment_events`: completion, skip, reschedule, reduction, and reason history.
- `daily_checkins`: capacity, mood, day closeout, reflection.
- `salah_entries`: prayer, date, status, optional time.
- `quran_entries`: date, target, completed amount, unit.
- `driving_sessions`: schedule, duration, attendance state, note.
- `job_opportunities`: company, role, URL, stage, dates, next action.
- `job_events`: application, reply, interview, offer, rejection, follow-up.
- `training_sessions`: plan, completion, duration, fallback use.
- `content_items`: video title, stage, next action, publication URL.
- `work_sessions`: item, date, duration, outcome note.
- `experiments`: hypothesis, budget, review date, status.
- `income_entries`: source, amount, currency, date, confirmation state.
- `weekly_plans`: targets, capacity, review state.

Derived metrics should be calculated from event records rather than stored as editable totals.

## 12. Delivery phases

### Phase 0: Product and interaction design

- Confirm product contract and terminology.
- Create low-fidelity flows for Today, Week, Journey, and recovery mode.
- Define the companion's original visual identity and five core states.
- Define tokens, component states, motion rules, and responsive behavior.
- Validate the plan with realistic sample weeks before coding.

Exit condition: every core action has an understood flow on phone and desktop.

### Phase 1: Useful private MVP

- Authentication for one allow-listed account.
- Today screen.
- Weekly planning.
- Salah and Quran tracking.
- Commitments and adaptive rescheduling.
- Driving sessions.
- Training sessions.
- Basic job actions.
- Contribution heatmap.
- Installable PWA.
- Data export.

Exit condition: Mehdi can use the app as the only daily tracker for fourteen consecutive days without losing data or needing developer intervention.

### Phase 2: Work pipelines and insight

- Full job opportunity pipeline.
- YouTube production pipeline.
- Experiment and income tracking.
- Weekly review and twelve-week metrics.
- Better notifications and offline conflict handling.
- Companion state system and polished illustration integration.

Exit condition: the app distinguishes effort from outcomes and helps make weekly priority decisions.

### Phase 3: Hardening and delight

- Accessibility audit.
- Performance and low-end Android testing.
- Complete empty, loading, offline, conflict, and error states.
- Backup and restore test.
- Dark theme if still desirable.
- Refined sound or haptic-like feedback only where browser support and user preference allow.
- Production security review.

Exit condition: the PWA is dependable, fast, recoverable, and comfortable for daily use.

## 13. MVP exclusions

- Public sign-up or multiple users.
- Social feeds, leaderboards, or shared accountability.
- A native Android application.
- General AI chat or an autonomous life coach.
- Full calendar replacement.
- Detailed calorie, workout, or Quran-study databases.
- Bank integration.
- Automatic scoring of spiritual worth.
- Dozens of customization options before daily usage validates them.

## 14. Validation plan

Before calling the MVP complete, verify:

- Install and launch from Android home screen.
- Use from PC and Android with the same account and synchronized state.
- Log actions offline, reconnect, and confirm they synchronize once without duplicates.
- Complete, skip, reduce, and reschedule each commitment type.
- Cross a day and week boundary in the Africa/Casablanca time zone.
- Confirm daylight-saving changes do not shift daily records incorrectly.
- Verify heatmap totals against source events.
- Test empty and missed-week recovery states.
- Export all personal data and inspect the exported content.
- Test keyboard navigation, focus visibility, touch sizes, screen-reader labels, contrast, and reduced motion.
- Verify database policies prevent access from an unauthorized account.

## 15. First build milestone

The first vertical slice should be:

`weekly commitment -> Today recommendation -> completion or adaptation -> contribution square -> weekly review`

Implement it first with three representative commitments: Quran hizb, driving practice, and one job application. This tests the core system across a daily recurring commitment, a scheduled appointment, and an outcome-based work action before expanding every life area.
