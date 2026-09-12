const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../life-core.js");

test("a new day has no invented activity", () => {
  const state = C.blankState();
  C.ensureDay(state, "2026-09-12");
  const activity = C.activityForDay(state, "2026-09-12");
  assert.equal(activity.honest, 0);
  assert.equal(activity.growth, 0);
  assert.equal(activity.prayerRecords, 0);
  assert.ok(state.salah.every((entry) => entry.status === "unrecorded" && entry.placeholder));
});

test("actual Quran and task records drive growth", () => {
  const state = C.blankState();
  const day = C.ensureDay(state, "2026-09-12");
  day.quran.completed_amount = 1;
  state.commitments.push({
    id: "task-1", title: "Driving practice", importance: "core", status: "reduced",
    scheduled_for: C.zonedDateTimeToIso("2026-09-12", "09:00", state.settings.timezone), updated_at: C.nowIso(),
  });
  const activity = C.activityForDay(state, "2026-09-12");
  assert.equal(activity.honest, 2);
  assert.equal(activity.growth, 2);
  assert.equal(C.coreRate(state, "2026-09-12", "2026-09-12"), 100);
});

test("streak counts recorded days and tolerates today being empty", () => {
  const state = C.blankState();
  for (const day of ["2026-09-10", "2026-09-11"]) {
    const record = C.ensureDay(state, day).quran;
    record.completed_amount = 0.25;
  }
  C.ensureDay(state, "2026-09-12");
  assert.equal(C.returnStreak(state, "2026-09-12"), 2);
});

test("a synced real salah record beats a newer local placeholder", () => {
  const local = [{ id: "same", day: "2026-09-12", prayer: "fajr", status: "unrecorded", recorded_at: "2026-09-12T10:00:00Z", placeholder: true }];
  const remote = [{ id: "same", day: "2026-09-12", prayer: "fajr", status: "on_time", recorded_at: "2026-09-12T06:00:00Z" }];
  assert.equal(C.mergeRecords(local, remote, "recorded_at")[0].status, "on_time");
});

test("unsafe links and HTML are rejected or escaped", () => {
  assert.equal(C.safeUrl("javascript:alert(1)"), "");
  assert.equal(C.escapeHtml('<img src=x onerror="x">'), "&lt;img src=x onerror=&quot;x&quot;&gt;");
});
