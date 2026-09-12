(function () {
  "use strict";
  const CACHE_KEY = "life-os-prayer-cache-v1";
  const NAMES = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "Asr", maghrib: "Maghrib", isha: "Isha" };

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); }
    catch { return {}; }
  }

  function cacheKey(day, location) {
    return [day, location.latitude ?? "", location.longitude ?? "", location.city || "", location.country || "", location.method || 21, location.school || 0].join("|");
  }

  function cleanTime(value) { return String(value || "").match(/^\d{1,2}:\d{2}/)?.[0] || ""; }

  async function get(day, location, signal) {
    const hasCoords = location.latitude !== null && location.latitude !== "" && location.longitude !== null && location.longitude !== "" && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));
    const hasCity = Boolean(location.city?.trim() && location.country?.trim());
    if (!hasCoords && !hasCity) return { status: "needs-location", timings: null };
    const key = cacheKey(day, location);
    const cache = readCache();
    const date = day.split("-").reverse().join("-");
    const params = new URLSearchParams({ method: String(location.method || 21), school: String(location.school || 0) });
    let endpoint;
    if (hasCoords) {
      params.set("latitude", String(location.latitude));
      params.set("longitude", String(location.longitude));
      endpoint = `https://api.aladhan.com/v1/timings/${date}?${params}`;
    } else {
      params.set("city", location.city.trim());
      params.set("country", location.country.trim());
      endpoint = `https://api.aladhan.com/v1/timingsByCity/${date}?${params}`;
    }
    try {
      const response = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Prayer service returned ${response.status}`);
      const payload = await response.json();
      if (payload.code !== 200 || !payload.data?.timings) throw new Error("Prayer service returned an invalid response");
      const timings = Object.fromEntries(Object.entries(NAMES).map(([keyName, apiName]) => [keyName, cleanTime(payload.data.timings[apiName])]));
      const result = { status: "ready", timings, timezone: payload.data.meta?.timezone || "", method: payload.data.meta?.method?.name || "", location: `${location.city || "Current location"}${location.country ? `, ${location.country}` : ""}`, fetchedAt: new Date().toISOString() };
      cache[key] = result;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      return result;
    } catch (error) {
      if (cache[key]) return { ...cache[key], status: "cached", warning: "Offline prayer times" };
      return { status: "error", timings: null, error: error.message };
    }
  }

  function next(timings, now = new Date(), timezone = "Africa/Casablanca") {
    if (!timings) return null;
    const current = LifeCore.timeKey(now, timezone);
    const upcoming = LifeCore.PRAYERS.find((prayer) => timings[prayer] && timings[prayer] >= current);
    return upcoming ? { prayer: upcoming, time: timings[upcoming] } : null;
  }

  window.LifePrayer = { get, next, names: NAMES };
})();
