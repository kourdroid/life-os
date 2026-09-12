(function () {
  "use strict";
  const C = window.LifeCore;
  const h = C.escapeHtml;
  const NAV = [
    ["today", "⌂", "Today"], ["week", "▦", "Week"], ["journey", "◫", "Journey"],
    ["work", "▣", "Work"], ["insights", "◌", "Insights"], ["settings", "⚙", "Settings"],
  ];
  const TABLES = { commitments: "commitments", jobs: "job_opportunities", driving: "driving_sessions", training: "training_sessions", content: "content_items", experiments: "experiments", income: "income_entries" };
  const LABELS = { deen: "Deen", licence: "Licence", job: "Job", health: "Health", youtube: "YouTube", experiment: "Experiment" };
  const PRAYER_LABELS = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };
  const STATUS_LABELS = { unrecorded: "Not recorded", on_time: "On time", late: "Late", missed: "Missed" };
  let state = C.load();
  let currentDay = C.dateKey(new Date(), state.settings.timezone);
  let prayerResult = { status: "loading", timings: null };
  let prayerAbort;
  let toastTimer;
  let syncTimer;
  let installPrompt;
  let syncStatus = window.lifeRemote?.session() ? { state: "idle", detail: "Ready to sync" } : { state: "offline", detail: "Local mode" };

  C.ensureDay(state, currentDay);
  C.ensureWeek(state, currentDay);
  C.save(state);

  function dateLabel(day = currentDay, options = {}) {
    return new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: options.short ? "short" : "long", month: options.short ? "short" : "long", day: "numeric" }).format(new Date(`${day}T12:00:00Z`));
  }

  function timeLabel(value) {
    if (!value) return "No time";
    return new Intl.DateTimeFormat("en", { timeZone: state.settings.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
  }

  function money(value, currency = "USD") {
    return new Intl.NumberFormat("en", { style: "currency", currency: String(currency).trim() || "USD", maximumFractionDigits: 2 }).format(Number(value || 0));
  }

  function persist(message, sync = true) {
    C.save(state);
    if (message) toast(message);
    if (sync) scheduleSync();
  }

  function toast(message, kind = "info") {
    const element = document.querySelector("#toast");
    element.textContent = message;
    element.dataset.kind = kind;
    element.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("visible"), 3200);
  }

  function navMarkup(container) {
    container.innerHTML = NAV.map(([key, icon, label]) => `<button class="nav-button ${state.route === key ? "active" : ""}" data-route="${key}" type="button" ${state.route === key ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span></button>`).join("");
  }

  function topbar() {
    const connected = Boolean(window.lifeRemote?.session());
    return `<header class="topbar"><p class="greeting"><strong>Assalamu alaikum, ${h(state.settings.displayName)}</strong>${h(dateLabel())}</p><div class="top-actions"><button class="sync-pill ${h(syncStatus.state)}" data-action="sync" type="button" aria-label="${h(syncStatus.detail)}"><span></span>${connected ? h(syncStatus.detail) : "Local"}</button><button class="icon-button" type="button" data-action="reminder" aria-label="View real reminders">◔</button><button class="icon-button avatar" type="button" data-route="settings" aria-label="Open settings">🌱</button></div></header>`;
  }

  function pageHeading(title, copy, action = "") {
    return `<section class="page-heading"><div><h1>${h(title)}</h1><p class="lede">${h(copy)}</p></div>${action}</section>`;
  }

  function emptyState(title, copy, action = "") {
    return `<div class="empty-state"><span aria-hidden="true">○</span><div><strong>${h(title)}</strong><p>${h(copy)}</p></div>${action}</div>`;
  }

  function prayerCard() {
    const rows = C.PRAYERS.map((prayer) => {
      const entry = state.salah.find((item) => item.day === currentDay && item.prayer === prayer);
      const time = prayerResult.timings?.[prayer];
      return `<div class="prayer-row ${h(entry.status)}"><div class="prayer-name"><span class="prayer-dot" aria-hidden="true"></span><strong>${PRAYER_LABELS[prayer]}</strong><span>${time ? h(time) : "--:--"}</span></div><label class="sr-only" for="salah-${prayer}">${PRAYER_LABELS[prayer]} status</label><select id="salah-${prayer}" data-salah="${prayer}" aria-label="${PRAYER_LABELS[prayer]} status"><option value="unrecorded" ${entry.status === "unrecorded" ? "selected" : ""}>Not recorded</option><option value="on_time" ${entry.status === "on_time" ? "selected" : ""}>On time</option><option value="late" ${entry.status === "late" ? "selected" : ""}>Late</option><option value="missed" ${entry.status === "missed" ? "selected" : ""}>Missed</option></select></div>`;
    }).join("");
    const next = LifePrayer.next(prayerResult.timings, new Date(), state.settings.timezone);
    let note = "Set your city in Settings to load prayer times.";
    if (prayerResult.status === "loading") note = "Loading today's prayer times...";
    if (prayerResult.status === "error") note = "Prayer times are unavailable. Your records still work offline.";
    if (prayerResult.timings) note = `${next ? `Next: ${PRAYER_LABELS[next.prayer]} at ${next.time}` : "Today's prayer times have passed"} · ${prayerResult.method || "calculation method"}${prayerResult.status === "cached" ? " · cached" : ""}`;
    return `<section class="faith-section" aria-labelledby="salah-title"><div class="section-title"><div><h2 id="salah-title">Salah</h2><p>${h(note)}</p></div><button class="text-button" data-route="settings" type="button">Location</button></div><div class="prayer-list">${rows}</div><p class="source-note">Times from AlAdhan. Confirm with your local masjid when needed.</p></section>`;
  }

  function quranCard() {
    const entry = state.quran.find((item) => item.day === currentDay && item.unit === state.settings.quranUnit);
    const amount = Number(entry.completed_amount || 0);
    const target = Number(state.settings.quranTarget);
    const percentage = Math.min(100, Math.round((amount / target) * 100));
    return `<section class="faith-section quran-section" aria-labelledby="quran-title"><div class="section-title"><div><h2 id="quran-title">Quran</h2><p>${amount.toFixed(2)} of ${target} ${h(state.settings.quranUnit)}</p></div><strong class="progress-number">${percentage}%</strong></div><div class="progress-track" aria-label="Quran progress"><span style="width:${percentage}%"></span></div><div class="quran-actions"><button class="secondary-button" data-quran-delta="-0.25" type="button" ${amount <= 0 ? "disabled" : ""}>− ¼</button><button class="primary-button" data-quran-delta="0.25" type="button">+ ¼ hizb</button><button class="secondary-button" data-quran-set="${target}" type="button" ${amount >= target ? "disabled" : ""}>Complete target</button></div></section>`;
  }

  function taskRow(task) {
    const status = task.status || "planned";
    const resolved = status !== "planned";
    return `<article class="task-row ${h(status)}"><div class="task-main"><span class="area-icon ${h(task.area)}" aria-hidden="true">${{ deen: "☾", licence: "◆", job: "↗", health: "✦", youtube: "▶", experiment: "◇" }[task.area] || "•"}</span><div><div class="task-title-line"><strong>${h(task.title)}</strong><span class="tag ${h(task.importance)}">${h(task.importance)}</span></div><p>${h(task.detail || task.minimum_title || "No detail")}${task.duration_minutes ? ` · ${task.duration_minutes} min` : ""}${task.scheduled_for ? ` · ${h(timeLabel(task.scheduled_for))}` : ""}</p></div></div><div class="task-actions">${resolved ? `<button class="text-button" data-task-status="planned" data-id="${task.id}" type="button">Reopen</button><span class="status-label ${h(status)}">${h(status)}</span>` : `<button class="primary-button compact" data-task-status="completed" data-id="${task.id}" type="button">Done</button><button class="secondary-button compact" data-task-status="reduced" data-id="${task.id}" type="button">Minimum</button><button class="text-button" data-task-move="true" data-id="${task.id}" type="button">Move</button><button class="text-button" data-task-status="skipped" data-id="${task.id}" type="button">Skip</button>`}<button class="icon-quiet" data-remove="commitments" data-id="${task.id}" type="button" aria-label="Remove ${h(task.title)}">×</button></div></article>`;
  }

  function commitmentForm(day = currentDay) {
    return `<details class="add-drawer" id="commitment-drawer"><summary>Add a real commitment</summary><form data-form="commitment" class="form-grid"><label>Title<input name="title" maxlength="140" required placeholder="What will actually be done?" /></label><label>Area<select name="area"><option value="licence">Driving licence</option><option value="job">Job hunt</option><option value="health">Training</option><option value="youtube">YouTube</option><option value="experiment">Experiment</option><option value="deen">Deen</option></select></label><label>Importance<select name="importance"><option value="core">Core</option><option value="committed">Committed</option><option value="flexible">Flexible</option></select></label><label>Date<input name="day" type="date" value="${h(day)}" required /></label><label>Time<input name="time" type="time" value="12:00" required /></label><label>Minutes<input name="duration" type="number" min="5" max="480" step="5" placeholder="60" /></label><label class="span-2">Clear next step<input name="detail" maxlength="1000" placeholder="The visible next action" /></label><label class="span-2">Minimum version<input name="minimum" maxlength="140" placeholder="What still counts on a difficult day?" /></label><div class="form-actions span-2"><button class="primary-button" type="submit">Add commitment</button></div></form></details>`;
  }

  function forestPanel() {
    const activity = C.activityForDay(state, currentDay);
    const stage = activity.growth >= 4 ? "thriving" : activity.growth >= 2 ? "growing" : activity.growth >= 1 ? "sprout" : "quiet";
    const copy = stage === "thriving" ? "The clearing feels full today." : stage === "growing" ? "New leaves are showing." : stage === "sprout" ? "One honest action changed the day." : "The forest is quiet. Begin with one real action.";
    return `<aside class="forest-panel ${stage}" aria-label="Living forest based on real completed work"><div class="forest-image" aria-hidden="true"></div><div class="forest-copy"><span>Living world</span><h2>${h(copy)}</h2><p>${activity.growth} growth action${activity.growth === 1 ? "" : "s"} recorded today</p></div><div class="forest-light" aria-hidden="true"></div></aside>`;
  }

  function todayScreen() {
    const tasks = C.dayCommitments(state, currentDay);
    const action = C.nextAction(state, currentDay, prayerResult.timings);
    const actionButton = action.kind === "commitment" ? `<button class="primary-button" data-task-status="completed" data-id="${action.id}" type="button">Complete</button>` : action.kind === "quran" ? `<button class="primary-button" data-quran-delta="0.25" type="button">Record ¼</button>` : action.kind === "location" ? `<button class="primary-button" data-route="settings" type="button">Set location</button>` : `<button class="primary-button" data-focus-closeout type="button">Write closeout</button>`;
    const checkin = state.dailyCheckins.find((item) => item.day === currentDay);
    return `${topbar()}${pageHeading("Today", "See what is real, record what happened, and adapt without hiding it.", `<button class="secondary-button" data-action="recovery" type="button">Adapt today</button>`)}<div class="today-layout"><div class="today-primary"><section class="next-action"><div><span class="section-kicker">Next meaningful action</span><h2>${h(action.title)}</h2><p>${h(action.detail)}</p></div>${actionButton}</section><div class="deen-grid">${prayerCard()}${quranCard()}</div><section class="commitments-section"><div class="section-title"><div><h2>Today's commitments</h2><p>${tasks.length ? `${tasks.filter((item) => item.status !== "planned").length} of ${tasks.length} resolved` : "Nothing invented. Add only what is real."}</p></div></div>${tasks.length ? `<div class="task-list">${tasks.map(taskRow).join("")}</div>` : emptyState("No commitments yet", "Add driving, job, training, YouTube, or another real action when you decide it belongs today.")}${commitmentForm()}</section><section class="closeout-section"><div class="section-title"><div><h2>Honest closeout</h2><p>A sentence about what helped or got in the way.</p></div><label class="capacity-label">Capacity<select data-checkin-field="capacity"><option value="low" ${checkin.capacity === "low" ? "selected" : ""}>Low</option><option value="normal" ${checkin.capacity === "normal" ? "selected" : ""}>Normal</option><option value="high" ${checkin.capacity === "high" ? "selected" : ""}>High</option></select></label></div><textarea id="daily-closeout" data-checkin-field="closeout" maxlength="1000" placeholder="Today was...">${h(checkin.closeout || "")}</textarea></section></div><div class="today-secondary">${forestPanel()}<section class="truth-panel"><h2>Today at a glance</h2>${todayTruth()}</section></div></div>`;
  }

  function todayTruth() {
    const activity = C.activityForDay(state, currentDay);
    const quran = state.quran.find((item) => item.day === currentDay);
    const prayers = state.salah.filter((item) => item.day === currentDay && item.status !== "unrecorded");
    return `<dl class="truth-list"><div><dt>Salah recorded</dt><dd>${prayers.length}/5</dd></div><div><dt>Quran</dt><dd>${Number(quran?.completed_amount || 0).toFixed(2)} hizb</dd></div><div><dt>Commitments kept</dt><dd>${activity.keptTasks}/${activity.taskCount}</dd></div><div><dt>Capacity</dt><dd>${h(state.dailyCheckins.find((item) => item.day === currentDay)?.capacity || "normal")}</dd></div></dl>`;
  }

  function weekScreen() {
    const plan = C.ensureWeek(state, currentDay);
    const days = Array.from({ length: 7 }, (_, index) => C.addDays(plan.week_start, index));
    const columns = days.map((day) => {
      const tasks = C.dayCommitments(state, day);
      return `<section class="day-column ${day === currentDay ? "today" : ""}"><div class="day-head"><div><strong>${h(dateLabel(day, { short: true }).split(",")[0])}</strong><span>${h(day.slice(8))}</span></div>${day === currentDay ? "<em>Today</em>" : ""}</div><label class="sr-only" for="capacity-${day}">Capacity for ${day}</label><select id="capacity-${day}" data-week-capacity="${day}"><option value="low" ${plan.capacity[day] === "low" ? "selected" : ""}>Low capacity</option><option value="normal" ${plan.capacity[day] === "normal" ? "selected" : ""}>Normal capacity</option><option value="high" ${plan.capacity[day] === "high" ? "selected" : ""}>High capacity</option></select><div class="day-tasks">${tasks.length ? tasks.map((task) => `<button data-route="today" data-select-day="${day}" type="button"><span class="area-dot ${h(task.area)}"></span>${h(task.title)}</button>`).join("") : `<p>No commitments</p>`}</div></section>`;
    }).join("");
    return `${topbar()}${pageHeading("Week", "Plan around actual capacity. Empty days are allowed.")}<section class="week-section"><div class="week-grid">${columns}</div>${commitmentForm(currentDay)}</section><section class="reflection-section"><div class="section-title"><div><h2>Weekly reflection</h2><p>Saved locally when you leave the field.</p></div></div><textarea data-week-reflection maxlength="1000" placeholder="What helped? What should become smaller?">${h(plan.reflection || "")}</textarea></section>`;
  }

  function heatmap(days = 364) {
    const first = C.addDays(currentDay, -(days - 1));
    return `<div class="heatmap" role="list" aria-label="Real contribution history">${Array.from({ length: days }, (_, index) => {
      const day = C.addDays(first, index);
      const activity = C.activityForDay(state, day);
      const level = Math.min(4, activity.honest);
      const summary = activity.honest ? `${activity.honest} records` : "No activity recorded";
      return `<button class="heat level-${level}" data-select-day="${day}" data-route="today" type="button" role="listitem" aria-label="${h(dateLabel(day))}: ${summary}" title="${h(day)} · ${summary}"></button>`;
    }).join("")}</div>`;
  }

  function journeyScreen() {
    const weekStart = C.startOfWeek(currentDay, state.settings.weekStartsOn);
    const rate = C.coreRate(state, weekStart, currentDay);
    const activeDates = C.activityDates(state);
    const resolved = state.commitments.filter((item) => ["completed", "reduced"].includes(item.status)).length;
    return `${topbar()}${pageHeading("Journey", "Every square and number comes from a record you made.", `<button class="secondary-button" data-action="export" type="button">Export data</button>`)}<section class="journey-section"><div class="section-title"><div><h2>Your last 52 weeks</h2><p>Tap a day to open its record.</p></div><span class="legend"><i class="heat level-0"></i><i class="heat level-1"></i><i class="heat level-2"></i><i class="heat level-3"></i><i class="heat level-4"></i></span></div>${heatmap()}</section><section class="insight-strip"><div><strong>${C.returnStreak(state, currentDay)}</strong><span>return streak</span></div><div><strong>${rate == null ? "--" : `${rate}%`}</strong><span>core rate this week</span></div><div><strong>${resolved}</strong><span>commitments kept</span></div><div><strong>${activeDates.length}</strong><span>recorded days</span></div></section>${activeDates.length ? "" : emptyState("Your history starts empty", "The first square appears only after you record something real.")}`;
  }

  function selectOptions(values, selected) {
    return values.map((value) => `<option value="${h(value)}" ${value === selected ? "selected" : ""}>${h(value.replaceAll("_", " "))}</option>`).join("");
  }

  function recordRow(collection, record, title, subtitle, field, values) {
    return `<article class="record-row"><div><strong>${h(title)}</strong><p>${h(subtitle || "No next action")}</p></div><div class="record-actions"><select data-update-collection="${collection}" data-update-id="${record.id}" data-update-field="${field}" aria-label="Update ${h(title)}">${selectOptions(values, record[field])}</select><button class="icon-quiet" data-remove="${collection}" data-id="${record.id}" type="button" aria-label="Remove ${h(title)}">×</button></div></article>`;
  }

  function workSection(title, copy, collection, rows, form) {
    return `<section class="work-section"><div class="section-title"><div><h2>${h(title)}</h2><p>${h(copy)}</p></div></div>${rows.length ? `<div class="record-list">${rows.join("")}</div>` : emptyState(`No ${title.toLowerCase()} yet`, "Add the first real record when it exists.")}${form}</section>`;
  }

  function workForm(type, fields, button) {
    return `<details class="add-drawer"><summary>${h(button)}</summary><form class="form-grid" data-form="${type}">${fields}<div class="form-actions span-2"><button class="primary-button" type="submit">${h(button)}</button></div></form></details>`;
  }

  function workScreen() {
    const jobRows = state.jobs.filter((x) => !["closed", "rejected"].includes(x.stage)).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at))).map((item) => recordRow("jobs", item, `${item.role} · ${item.company}`, item.next_action, "stage", ["saved", "preparing", "applied", "replied", "interview", "offer", "rejected", "closed"]));
    const drivingRows = state.driving.sort((a,b)=>String(b.scheduled_for).localeCompare(String(a.scheduled_for))).map((item) => recordRow("driving", item, `${item.kind} · ${dateLabel(C.dateKey(new Date(item.scheduled_for), state.settings.timezone), { short: true })}`, `${timeLabel(item.scheduled_for)} · ${item.duration_minutes} min`, "attendance", ["scheduled", "attended", "cancelled_by_school", "rescheduled", "missed"]));
    const trainingRows = state.training.sort((a,b)=>String(b.scheduled_for).localeCompare(String(a.scheduled_for))).map((item) => recordRow("training", item, item.title, `${item.duration_minutes || "--"} min · ${item.scheduled_for ? dateLabel(C.dateKey(new Date(item.scheduled_for), state.settings.timezone), { short: true }) : "Unscheduled"}`, "status", ["planned", "completed", "minimum", "skipped"]));
    const contentRows = state.content.filter((x)=>x.stage!=="paused").sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at))).map((item) => recordRow("content", item, item.title, item.next_action, "stage", ["idea", "selected", "script", "recorded", "editing", "packaged", "published", "paused"]));
    const experimentRows = state.experiments.filter((x)=>x.status!=="stopped").map((item) => recordRow("experiments", item, item.title, `${item.time_budget_minutes} min budget · review ${item.review_on || "not set"}`, "status", ["active", "paused", "completed", "stopped"]));
    const incomeRows = state.income.sort((a,b)=>String(b.received_on).localeCompare(String(a.received_on))).map((item) => recordRow("income", item, `${money(item.amount, item.currency)} · ${item.source}`, item.received_on, "status", ["pending", "confirmed", "failed"]));
    const forms = {
      job: workForm("job", `<label>Company<input name="company" maxlength="160" required /></label><label>Role<input name="role" maxlength="160" required /></label><label>Stage<select name="stage">${selectOptions(["saved","preparing","applied","replied","interview","offer"], "saved")}</select></label><label>URL<input name="url" type="url" maxlength="2000" placeholder="https://" /></label><label class="span-2">Next action<input name="next_action" maxlength="280" /></label>`, "Add job opportunity"),
      driving: workForm("driving", `<label>Date<input name="day" type="date" value="${currentDay}" required /></label><label>Time<input name="time" type="time" value="10:00" required /></label><label>Minutes<input name="duration" type="number" min="30" max="300" value="120" required /></label><label>Kind<select name="kind">${selectOptions(["practical","theory","exam"], "practical")}</select></label>`, "Add driving session"),
      training: workForm("training", `<label>Title<input name="title" maxlength="140" value="Training" required /></label><label>Date<input name="day" type="date" value="${currentDay}" required /></label><label>Time<input name="time" type="time" value="18:00" /></label><label>Minutes<input name="duration" type="number" min="5" max="300" value="60" /></label>`, "Add training"),
      content: workForm("content", `<label>Title<input name="title" maxlength="200" required /></label><label>Stage<select name="stage">${selectOptions(["idea","selected","script","recorded","editing","packaged","published"], "idea")}</select></label><label class="span-2">Next action<input name="next_action" maxlength="280" /></label>`, "Add YouTube item"),
      experiment: workForm("experiment", `<label>Title<input name="title" maxlength="160" required /></label><label>Weekly minutes<input name="minutes" type="number" min="15" max="10080" value="120" required /></label><label class="span-2">Hypothesis<textarea name="hypothesis" maxlength="1000" required placeholder="If I do X, I expect Y because..."></textarea></label><label>Review date<input name="review_on" type="date" /></label>`, "Add bounded experiment"),
      income: workForm("income", `<label>Source<input name="source" maxlength="140" required /></label><label>Amount<input name="amount" type="number" min="0" step="0.01" required /></label><label>Currency<input name="currency" maxlength="3" value="USD" pattern="[A-Za-z]{3}" required /></label><label>Date received<input name="day" type="date" value="${currentDay}" required /></label><label>Status<select name="status">${selectOptions(["confirmed","pending","failed"], "confirmed")}</select></label>`, "Add income"),
    };
    return `${topbar()}${pageHeading("Work", "Track evidence: sessions, applications, publications, experiments, and money.")}<div class="work-stack">${workSection("Job pipeline", "A company, role, stage, and next action.", "jobs", jobRows, forms.job)}${workSection("Driving licence", "Scheduled versus attended is the truth that matters.", "driving", drivingRows, forms.driving)}${workSection("Training", "Full sessions and minimum versions both count honestly.", "training", trainingRows, forms.training)}${workSection("YouTube", "Move one real item through the pipeline.", "content", contentRows, forms.content)}${workSection("Experiments", "Bound time and money before chasing an idea.", "experiments", experimentRows, forms.experiment)}${workSection("Income", `Confirmed income against your ${money(state.settings.incomeGoal)} monthly target.`, "income", incomeRows, forms.income)}</div>`;
  }

  function insightsScreen() {
    const weekStart = C.startOfWeek(currentDay, state.settings.weekStartsOn);
    const weekDays = Array.from({length:7},(_,i)=>C.addDays(weekStart,i));
    const prayerRecorded = weekDays.reduce((sum,day)=>sum+state.salah.filter((x)=>x.day===day&&x.status!=="unrecorded").length,0);
    const quranDays = weekDays.filter((day)=>Number(state.quran.find((x)=>x.day===day)?.completed_amount||0)>=state.settings.quranTarget).length;
    const tasks = state.commitments.filter((item)=>{const day=item.scheduled_for?C.dateKey(new Date(item.scheduled_for),state.settings.timezone):"";return day>=weekStart&&day<=C.addDays(weekStart,6)&&item.status!=="archived";});
    const incomeMonth = currentDay.slice(0,7);
    const confirmedIncome = state.income.filter((x)=>x.status==="confirmed"&&x.received_on?.startsWith(incomeMonth)).reduce((sum,x)=>sum+Number(x.amount),0);
    const applications = state.jobs.filter((x)=>x.applied_at?.slice(0,10)>=weekStart || ["applied","replied","interview","offer"].includes(x.stage)).length;
    const signals = [
      [prayerRecorded, "Salah records this week"], [quranDays, "Quran targets reached"],
      [tasks.filter((x)=>["completed","reduced"].includes(x.status)).length, "Commitments kept"], [applications, "Applications in motion"],
      [money(confirmedIncome), "Confirmed this month"], [state.content.filter((x)=>x.stage==="published").length, "Published videos"],
    ];
    return `${topbar()}${pageHeading("Insights", "Only evidence from your records. No estimated streaks or invented progress.")}<section class="signal-grid">${signals.map(([value,label])=>`<div><strong>${h(value)}</strong><span>${h(label)}</span></div>`).join("")}</section><section class="question-panel"><h2>One useful question</h2><p>${tasks.length ? "Which commitment repeatedly stays planned and needs a smaller minimum version?" : "What deserves a real place in the week instead of depending on motivation?"}</p></section>`;
  }

  function settingsScreen() {
    const prayer = state.settings.prayer;
    const session = window.lifeRemote?.session();
    const locationText = prayer.latitude != null ? `Coordinates ${Number(prayer.latitude).toFixed(3)}, ${Number(prayer.longitude).toFixed(3)}` : prayer.city ? `${prayer.city}, ${prayer.country}` : "No prayer location saved";
    return `${topbar()}${pageHeading("Settings", "Your targets, prayer source, sync, and portable data.")}<div class="settings-stack"><section class="settings-section"><div class="section-title"><div><h2>Personal targets</h2><p>These values change real calculations.</p></div></div><form class="form-grid" data-form="settings"><label>Name<input name="displayName" maxlength="80" value="${h(state.settings.displayName)}" required /></label><label>Timezone<input name="timezone" maxlength="80" value="${h(state.settings.timezone)}" required /></label><label>Quran target in hizb<input name="quranTarget" type="number" min="0.25" max="60" step="0.25" value="${state.settings.quranTarget}" required /></label><label>Monthly income goal in USD<input name="incomeGoal" type="number" min="0" step="1" value="${state.settings.incomeGoal}" required /></label><div class="form-actions span-2"><button class="primary-button" type="submit">Save targets</button></div></form></section><section class="settings-section" id="prayer-location"><div class="section-title"><div><h2>Prayer times</h2><p>${h(locationText)} · Morocco calculation method by default.</p></div><span class="api-badge">AlAdhan API</span></div><form class="form-grid" data-form="prayer-location"><label>City<input name="city" maxlength="120" value="${h(prayer.city || "")}" placeholder="Your city" /></label><label>Country<input name="country" maxlength="120" value="${h(prayer.country || "Morocco")}" required /></label><label>Calculation method<select name="method"><option value="21" ${prayer.method===21?"selected":""}>Morocco</option><option value="3" ${prayer.method===3?"selected":""}>Muslim World League</option><option value="4" ${prayer.method===4?"selected":""}>Umm Al-Qura</option><option value="5" ${prayer.method===5?"selected":""}>Egyptian Authority</option></select></label><label>Asr school<select name="school"><option value="0" ${prayer.school===0?"selected":""}>Standard</option><option value="1" ${prayer.school===1?"selected":""}>Hanafi</option></select></label><div class="form-actions span-2"><button class="primary-button" type="submit">Save and load times</button><button class="secondary-button" data-action="device-location" type="button">Use this device location</button></div></form></section><section class="settings-section"><div class="section-title"><div><h2>SAQR sync</h2><p>${session ? h(syncStatus.detail) : "Sign in to sync the same records on PC and Android."}</p></div><span class="connection-dot ${session ? "connected" : ""}"></span></div>${session ? `<div class="form-actions"><button class="primary-button" data-action="sync" type="button">Sync now</button><button class="secondary-button" data-action="sign-out" type="button">Sign out on this device</button></div>` : `<form class="auth-form" data-form="magic-link"><label>Email<input name="email" type="email" required autocomplete="email" placeholder="Your SAQR Auth email" /></label><button class="primary-button" type="submit">Send sign-in link</button></form><details class="otp-box"><summary>I received a six-digit code</summary><form class="auth-form" data-form="otp"><label>Email<input name="email" type="email" required autocomplete="email" /></label><label>Code<input name="token" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required /></label><button class="primary-button" type="submit">Verify code</button></form></details>`}</section><section class="settings-section"><div class="section-title"><div><h2>Your data</h2><p>Export is complete and import validates the Life OS format.</p></div></div><div class="form-actions"><button class="primary-button" data-action="export" type="button">Export JSON</button><label class="secondary-button file-button">Import JSON<input id="import-file" type="file" accept="application/json" /></label>${installPrompt ? `<button class="secondary-button" data-action="install" type="button">Install app</button>` : ""}</div><p class="legacy-note">The old preview remains stored separately and was not imported because it contained demo records.</p></section></div>`;
  }

  function render() {
    navMarkup(document.querySelector("#desktop-nav"));
    navMarkup(document.querySelector("#mobile-nav"));
    const screens = { today: todayScreen, week: weekScreen, journey: journeyScreen, work: workScreen, insights: insightsScreen, settings: settingsScreen };
    document.querySelector("#app").innerHTML = `<div class="screen">${screens[state.route]?.() || todayScreen()}</div>`;
  }

  async function loadPrayer() {
    prayerAbort?.abort();
    prayerAbort = new AbortController();
    prayerResult = { status: "loading", timings: null };
    if (state.route === "today") render();
    prayerResult = await LifePrayer.get(currentDay, state.settings.prayer, prayerAbort.signal);
    if (state.route === "today") render();
  }

  function scheduleSync() {
    if (!window.lifeRemote?.session()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncNow, 900);
  }

  async function syncNow() {
    if (!window.lifeRemote?.session()) { toast("Sign in from Settings to sync."); return; }
    try {
      state = await window.lifeRemote.sync(state, C.mergeRemote);
      C.ensureDay(state, currentDay);
      C.save(state);
      render();
    } catch (error) { toast(error.message, "error"); }
  }

  function addRecord(collection, record, message) {
    const stamp = C.nowIso();
    state[collection].push({ id: C.uuid(), created_at: stamp, updated_at: stamp, ...record });
    persist(message);
    render();
  }

  function removeRecord(collection, id) {
    const record = state[collection].find((item) => item.id === id);
    if (!record) return;
    state[collection] = state[collection].filter((item) => item.id !== id);
    state.outbox.push({ table: TABLES[collection], id });
    persist(`${record.title || record.role || record.source || "Record"} removed.`);
    render();
  }

  function updateRecord(collection, id, field, value) {
    const record = state[collection].find((item) => item.id === id);
    if (!record) return;
    record[field] = value;
    C.touch(record);
    if (collection === "jobs" && field === "stage" && value === "applied" && !record.applied_at) record.applied_at = C.nowIso();
    if (collection === "training" && field === "status" && ["completed", "minimum"].includes(value)) record.completed_at = C.nowIso();
    persist("Record updated.");
    render();
  }

  function formValue(form, name) { return String(new FormData(form).get(name) || "").trim(); }

  function handleForm(form) {
    const type = form.dataset.form;
    const stamp = C.nowIso();
    if (type === "commitment") {
      const day = formValue(form, "day"), time = formValue(form, "time");
      addRecord("commitments", { area: formValue(form,"area"), title: formValue(form,"title"), detail: formValue(form,"detail") || null, importance: formValue(form,"importance"), scheduled_for: C.zonedDateTimeToIso(day,time,state.settings.timezone), duration_minutes: Number(formValue(form,"duration")) || null, minimum_title: formValue(form,"minimum") || null, status: "planned", recurrence: "once" }, "Commitment added to the real plan.");
    } else if (type === "job") {
      const stage = formValue(form,"stage");
      addRecord("jobs", { company: formValue(form,"company"), role: formValue(form,"role"), url: C.safeUrl(formValue(form,"url")) || null, stage, next_action: formValue(form,"next_action") || null, next_action_at: null, applied_at: stage === "applied" ? stamp : null, notes: null }, "Job opportunity added.");
    } else if (type === "driving") {
      addRecord("driving", { scheduled_for: C.zonedDateTimeToIso(formValue(form,"day"),formValue(form,"time"),state.settings.timezone), duration_minutes: Number(formValue(form,"duration")), kind: formValue(form,"kind"), attendance: "scheduled", note: null }, "Driving session added.");
    } else if (type === "training") {
      addRecord("training", { scheduled_for: C.zonedDateTimeToIso(formValue(form,"day"),formValue(form,"time") || "12:00",state.settings.timezone), completed_at: null, title: formValue(form,"title"), duration_minutes: Number(formValue(form,"duration")) || null, status: "planned", note: null }, "Training session added.");
    } else if (type === "content") {
      addRecord("content", { title: formValue(form,"title"), stage: formValue(form,"stage"), next_action: formValue(form,"next_action") || null, published_url: null }, "YouTube item added.");
    } else if (type === "experiment") {
      addRecord("experiments", { title: formValue(form,"title"), hypothesis: formValue(form,"hypothesis"), time_budget_minutes: Number(formValue(form,"minutes")), money_budget: 0, review_on: formValue(form,"review_on") || null, status: "active", evidence_note: null }, "Bounded experiment added.");
    } else if (type === "income") {
      addRecord("income", { source: formValue(form,"source"), amount: Number(formValue(form,"amount")), currency: formValue(form,"currency").toUpperCase(), received_on: formValue(form,"day"), status: formValue(form,"status"), note: null }, "Income record added.");
    } else if (type === "settings") {
      const timezone = formValue(form,"timezone");
      try { new Intl.DateTimeFormat("en", { timeZone: timezone }).format(); }
      catch { toast("Use a valid IANA timezone such as Africa/Casablanca.", "error"); return; }
      state.settings.displayName = formValue(form,"displayName");
      state.settings.timezone = timezone;
      state.settings.quranTarget = Number(formValue(form,"quranTarget"));
      state.settings.incomeGoal = Number(formValue(form,"incomeGoal"));
      state.settings.updatedAt = C.nowIso();
      currentDay = C.dateKey(new Date(), state.settings.timezone);
      C.ensureDay(state,currentDay); C.ensureWeek(state,currentDay); persist("Targets saved."); render(); loadPrayer();
    } else if (type === "prayer-location") {
      state.settings.prayer = { ...state.settings.prayer, city: formValue(form,"city"), country: formValue(form,"country"), latitude: null, longitude: null, method: Number(formValue(form,"method")), school: Number(formValue(form,"school")) };
      state.settings.updatedAt = C.nowIso();
      persist("Prayer location saved."); render(); loadPrayer();
    } else if (type === "magic-link") {
      submitMagicLink(form);
    } else if (type === "otp") {
      submitOtp(form);
    }
  }

  async function submitMagicLink(form) {
    const button = form.querySelector("button"); button.disabled = true;
    try { await window.lifeRemote.sendMagicLink(formValue(form,"email")); toast("Secure sign-in link sent. Check your email."); }
    catch (error) { toast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  async function submitOtp(form) {
    const button = form.querySelector("button"); button.disabled = true;
    try { await window.lifeRemote.verifyOtp(formValue(form,"email"),formValue(form,"token")); toast("Signed in. Syncing now."); await syncNow(); render(); }
    catch (error) { toast(error.message, "error"); }
    finally { button.disabled = false; }
  }

  function reminders() {
    const now = Date.now();
    const soon = state.commitments.filter((item) => item.status === "planned" && item.scheduled_for && new Date(item.scheduled_for).getTime() >= now - 30*60*1000 && new Date(item.scheduled_for).getTime() <= now + 90*60*1000);
    const jobs = state.jobs.filter((item) => item.next_action_at && new Date(item.next_action_at).getTime() <= now && !["closed","rejected"].includes(item.stage));
    return { soon, jobs };
  }

  function handleAction(name) {
    if (name === "sync") syncNow();
    if (name === "reminder") { const r = reminders(); toast(r.soon.length || r.jobs.length ? `${r.soon.length} commitment${r.soon.length===1?"":"s"} due soon · ${r.jobs.length} job follow-up${r.jobs.length===1?"":"s"}` : "Nothing is due in the next 90 minutes."); }
    if (name === "recovery") { document.querySelector(".commitments-section")?.scrollIntoView({ behavior:"smooth", block:"start" }); toast("Choose Minimum, Move, or Skip. The original record stays honest."); }
    if (name === "export") {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = `life-os-${currentDay}.json`; link.click(); URL.revokeObjectURL(url); toast("Complete Life OS data exported.");
    }
    if (name === "sign-out") { window.lifeRemote.signOut(); syncStatus = { state:"offline", detail:"Local mode" }; render(); toast("Signed out on this device."); }
    if (name === "device-location") {
      if (!navigator.geolocation) { toast("This browser does not provide location.", "error"); return; }
      navigator.geolocation.getCurrentPosition((position) => { state.settings.prayer.latitude = Number(position.coords.latitude.toFixed(6)); state.settings.prayer.longitude = Number(position.coords.longitude.toFixed(6)); state.settings.prayer.city = ""; state.settings.updatedAt=C.nowIso(); persist("Device location saved for prayer times."); render(); loadPrayer(); }, (error) => toast(error.message || "Location permission was not granted.", "error"), { enableHighAccuracy:false, timeout:10000, maximumAge:86400000 });
    }
    if (name === "install" && installPrompt) { installPrompt.prompt(); installPrompt.userChoice.finally(()=>{installPrompt=null;render();}); }
  }

  document.addEventListener("click", (event) => {
    const route = event.target.closest("[data-route]");
    if (route) { state.route = route.dataset.route; if (route.dataset.selectDay) { currentDay = route.dataset.selectDay; C.ensureDay(state,currentDay); } persist(null,false); render(); loadPrayer(); document.querySelector("#app").focus(); return; }
    const action = event.target.closest("[data-action]"); if (action) { handleAction(action.dataset.action); return; }
    const remove = event.target.closest("[data-remove]"); if (remove) { removeRecord(remove.dataset.remove, remove.dataset.id); return; }
    const task = event.target.closest("[data-task-status]");
    if (task) { const item = state.commitments.find((x)=>x.id===task.dataset.id); if(item){item.status=task.dataset.taskStatus;C.touch(item);persist(`Commitment ${item.status}.`);render();} return; }
    const move = event.target.closest("[data-task-move]");
    if (move) {
      const item=state.commitments.find((x)=>x.id===move.dataset.id); if(!item)return;
      const destination=window.prompt("Move to a date (YYYY-MM-DD)",currentDay);
      if(destination===null)return;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(destination)||Number.isNaN(new Date(`${destination}T12:00:00`).getTime())){toast("Use a valid date such as 2026-09-13.","error");return;}
      const time=item.scheduled_for ? new Date(item.scheduled_for).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:state.settings.timezone}) : "09:00";
      item.scheduled_for=C.zonedDateTimeToIso(destination,time,state.settings.timezone);item.status="planned";C.touch(item);persist(`Commitment moved to ${destination}.`);render();return;
    }
    const delta = event.target.closest("[data-quran-delta]");
    if (delta) { const entry=state.quran.find((x)=>x.day===currentDay&&x.unit===state.settings.quranUnit);entry.completed_amount=Math.max(0,Math.min(60,Number(entry.completed_amount)+Number(delta.dataset.quranDelta)));C.touch(entry);persist("Quran progress recorded.");render();return; }
    const set = event.target.closest("[data-quran-set]");
    if (set) { const entry=state.quran.find((x)=>x.day===currentDay&&x.unit===state.settings.quranUnit);entry.completed_amount=Number(set.dataset.quranSet);C.touch(entry);persist("Quran target recorded.");render();return; }
    if (event.target.closest("[data-focus-closeout]")) document.querySelector("#daily-closeout")?.focus();
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-salah]")) { const entry=state.salah.find((x)=>x.day===currentDay&&x.prayer===event.target.dataset.salah);entry.status=event.target.value;entry.recorded_at=C.nowIso();delete entry.placeholder;persist(`${PRAYER_LABELS[entry.prayer]}: ${STATUS_LABELS[entry.status]}.`);render(); }
    if (event.target.matches("[data-update-collection]")) updateRecord(event.target.dataset.updateCollection,event.target.dataset.updateId,event.target.dataset.updateField,event.target.value);
    if (event.target.matches("[data-week-capacity]")) { const plan=C.ensureWeek(state,currentDay);plan.capacity[event.target.dataset.weekCapacity]=event.target.value;C.touch(plan);persist("Weekly capacity saved."); }
    if (event.target.matches("[data-checkin-field]")) { const item=state.dailyCheckins.find((x)=>x.day===currentDay);item[event.target.dataset.checkinField]=event.target.value;C.touch(item);persist("Today updated."); }
    if (event.target.matches("[data-week-reflection]")) { const plan=C.ensureWeek(state,currentDay);plan.reflection=event.target.value;C.touch(plan);persist("Weekly reflection saved."); }
    if (event.target.id === "import-file" && event.target.files?.[0]) {
      const reader=new FileReader(); reader.onload=()=>{try{const raw=JSON.parse(reader.result);if(!raw||raw.version!==4)throw new Error("This is not a Life OS v4 export.");const imported=C.normalizeState(raw);state=imported;currentDay=C.dateKey(new Date(),state.settings.timezone);C.ensureDay(state,currentDay);persist("Life OS data imported.");render();loadPrayer();}catch(error){toast(error.message,"error");}};reader.readAsText(event.target.files[0]);
    }
  });

  document.addEventListener("submit", (event) => { const form=event.target.closest("form[data-form]"); if(!form)return;event.preventDefault();if(!form.reportValidity())return;handleForm(form); });

  window.lifeRemote?.addEventListener("status", (event) => { syncStatus=event.detail; const pill=document.querySelector(".sync-pill");if(pill){pill.className=`sync-pill ${syncStatus.state}`;pill.innerHTML=`<span></span>${h(syncStatus.detail)}`;} });
  window.addEventListener("online", scheduleSync);
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); installPrompt=event; if(state.route==="settings")render(); });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const actual = C.dateKey(new Date(),state.settings.timezone);
    if (actual !== currentDay) { currentDay=actual;C.ensureDay(state,currentDay);C.ensureWeek(state,currentDay);persist(null);render();loadPrayer(); }
  });

  async function boot() {
    try { const signedIn = await window.lifeRemote?.captureSessionFromUrl(); if(signedIn) await syncNow(); else if(window.lifeRemote?.session()) scheduleSync(); }
    catch (error) { toast(error.message,"error"); }
    render();
    loadPrayer();
    if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch((error)=>console.warn("Service worker:",error.message)));
  }
  boot();
})();
