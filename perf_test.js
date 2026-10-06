const n = 10000;
console.time("no-cache");
for (let i = 0; i < n; i++) {
  new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date());
}
console.timeEnd("no-cache");

const f = new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
console.time("cache");
for (let i = 0; i < n; i++) {
  f.format(new Date());
}
console.timeEnd("cache");
