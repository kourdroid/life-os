const n = 10000;
let start = performance.now();
for (let i=0; i<n; i++) {
  new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date());
}
console.log("Uncached:", performance.now() - start);

start = performance.now();
const formatter = new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
for (let i=0; i<n; i++) {
  formatter.format(new Date());
}
console.log("Cached:", performance.now() - start);
