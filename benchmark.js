const iters = 100000;
console.time("no-cache");
for (let i = 0; i < iters; i++) {
  new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date());
}
console.timeEnd("no-cache");

const cache = new Map();
console.time("cache");
for (let i = 0; i < iters; i++) {
  let key = "date-long";
  if (!cache.has(key)) {
    cache.set(key, new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }));
  }
  cache.get(key).format(new Date());
}
console.timeEnd("cache");
