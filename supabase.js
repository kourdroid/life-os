(function () {
  "use strict";
  const config = window.LIFE_CONFIG || {};
  const SESSION_KEY = "life-os-supabase-session-v2";
  const LEGACY_SESSION_KEY = "life-os-supabase-session";
  const TABLE_MAP = {
    daily_checkins: "dailyCheckins", salah_entries: "salah", quran_entries: "quran", commitments: "commitments",
    weekly_plans: "weeklyPlans", driving_sessions: "driving", job_opportunities: "jobs", training_sessions: "training",
    content_items: "content", experiments: "experiments", income_entries: "income",
  };
  const ALLOWED_COLUMNS = {
    daily_checkins: ["id", "day", "capacity", "mood", "closeout", "created_at", "updated_at"],
    salah_entries: ["id", "day", "prayer", "status", "recorded_at"],
    quran_entries: ["id", "day", "completed_amount", "unit", "note", "created_at", "updated_at"],
    commitments: ["id", "weekly_plan_id", "area", "title", "detail", "importance", "scheduled_for", "duration_minutes", "minimum_title", "status", "recurrence", "created_at", "updated_at"],
    weekly_plans: ["id", "week_start", "capacity", "reflection", "created_at", "updated_at"],
    driving_sessions: ["id", "scheduled_for", "duration_minutes", "kind", "attendance", "note", "created_at", "updated_at"],
    job_opportunities: ["id", "company", "role", "url", "stage", "next_action", "next_action_at", "applied_at", "notes", "created_at", "updated_at"],
    training_sessions: ["id", "scheduled_for", "completed_at", "title", "duration_minutes", "status", "note", "created_at", "updated_at"],
    content_items: ["id", "title", "stage", "next_action", "published_url", "created_at", "updated_at"],
    experiments: ["id", "title", "hypothesis", "time_budget_minutes", "money_budget", "review_on", "status", "evidence_note", "created_at", "updated_at"],
    income_entries: ["id", "source", "amount", "currency", "received_on", "status", "note", "created_at", "updated_at"],
  };

  function pick(record, columns) {
    return Object.fromEntries(columns.filter((key) => record[key] !== undefined).map((key) => [key, record[key] === "" ? null : record[key]]));
  }

  function parseJwt(token) {
    try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
    catch { return null; }
  }

  class LifeRemote extends EventTarget {
    constructor() { super(); this.active = false; }
    configured() { return Boolean(config.supabaseUrl && config.supabasePublishableKey); }
    session() {
      try {
        const current=localStorage.getItem(SESSION_KEY), legacy=localStorage.getItem(LEGACY_SESSION_KEY);
        if(!current&&legacy){localStorage.setItem(SESSION_KEY,legacy);return JSON.parse(legacy);}
        return JSON.parse(current||"null");
      } catch { return null; }
    }
    userId() { return parseJwt(this.session()?.access_token)?.sub || null; }
    status(detail, state = "idle") { this.dispatchEvent(new CustomEvent("status", { detail: { detail, state } })); }

    saveSession(session) {
      if (!session?.access_token) return;
      const claims = parseJwt(session.access_token);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, expires_at: session.expires_at || claims?.exp || 0 }));
    }

    async captureSessionFromUrl() {
      const hash = new URLSearchParams(location.hash.slice(1));
      const query = new URLSearchParams(location.search);
      const accessToken = hash.get("access_token");
      if (accessToken) {
        this.saveSession({ access_token: accessToken, refresh_token: hash.get("refresh_token"), expires_in: Number(hash.get("expires_in") || 3600), token_type: hash.get("token_type") || "bearer" });
        history.replaceState({}, document.title, location.pathname);
        return true;
      }
      const tokenHash = query.get("token_hash");
      if (tokenHash) {
        const data = await this.authRequest("/verify", { token_hash: tokenHash, type: query.get("type") || "email" });
        this.saveSession(data);
        history.replaceState({}, document.title, location.pathname);
        return true;
      }
      return false;
    }

    async authRequest(path, body) {
      if (!this.configured()) throw new Error("Supabase is not configured on this device.");
      const response = await fetch(`${config.supabaseUrl}/auth/v1${path}`, {
        method: "POST", headers: { apikey: config.supabasePublishableKey, "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.msg || data.message || data.error_description || `Authentication failed (${response.status}).`);
      return data;
    }

    async signInWithPassword(email, password) {
      const session = await this.authRequest("/token?grant_type=password", { email, password });
      this.saveSession(session);
      return session;
    }

    async signUpWithPassword(email, password) {
      const result = await this.authRequest("/signup", { email, password, options: { email_redirect_to: `${location.origin}${location.pathname}` } });
      if (result.session) this.saveSession(result.session);
      return result;
    }

    async refreshIfNeeded() {
      const session = this.session();
      if (!session) return null;
      const expiresAt = Number(session.expires_at || parseJwt(session.access_token)?.exp || 0);
      if (expiresAt * 1000 > Date.now() + 60_000) return session;
      if (!session.refresh_token) { this.signOut(); throw new Error("Your session expired. Sign in again."); }
      const refreshed = await this.authRequest("/token?grant_type=refresh_token", { refresh_token: session.refresh_token });
      this.saveSession(refreshed);
      return refreshed;
    }

    signOut() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(LEGACY_SESSION_KEY); this.status("Local mode", "offline"); }

    async request(table, options = {}) {
      await this.refreshIfNeeded();
      const session = this.session();
      if (!this.configured() || !session?.access_token) throw new Error("Sign in before syncing.");
      const response = await fetch(`${config.supabaseUrl}/rest/v1/${table}${options.query || ""}`, {
        method: options.method || "GET",
        headers: {
          apikey: config.supabasePublishableKey, Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json", "Content-Profile": "life", "Accept-Profile": "life",
          Prefer: options.prefer || "return=representation",
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      const text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }
      if (!response.ok) {
        if (response.status === 401) this.signOut();
        throw new Error(data?.message || data?.hint || `Sync failed (${response.status}).`);
      }
      return data;
    }

    async pullAll() {
      const tables = ["profiles", ...Object.keys(TABLE_MAP)];
      const pairs = await Promise.all(tables.map(async (table) => [table, await this.request(table, { query: "?select=*" })]));
      return Object.fromEntries(pairs);
    }

    async flushDeletes(state) {
      const pending = [...state.outbox];
      for (const entry of pending) {
        await this.request(entry.table, { method: "DELETE", query: `?id=eq.${encodeURIComponent(entry.id)}`, prefer: "return=minimal" });
        state.outbox = state.outbox.filter((item) => item !== entry);
      }
    }

    async pushProfile(state) {
      const userId = this.userId();
      if (!userId) throw new Error("The signed-in session has no user id.");
      const prayer = state.settings.prayer;
      const profile = {
        user_id: userId, display_name: state.settings.displayName, timezone: state.settings.timezone,
        week_starts_on: state.settings.weekStartsOn, quran_daily_target: state.settings.quranTarget,
        quran_target_unit: state.settings.quranUnit, income_goal: state.settings.incomeGoal,
        prayer_city: prayer.city || null, prayer_country: prayer.country || null,
        prayer_latitude: prayer.latitude, prayer_longitude: prayer.longitude,
        prayer_method: prayer.method || 21, prayer_school: prayer.school || 0,
        updated_at: state.settings.updatedAt,
      };
      await this.request("profiles", { method: "POST", query: "?on_conflict=user_id", body: profile, prefer: "resolution=merge-duplicates,return=minimal" });
    }

    async pushAll(state) {
      await this.pushProfile(state);
      for (const [table, key] of Object.entries(TABLE_MAP)) {
        const source = table === "salah_entries" ? state[key].filter((record) => !record.placeholder) : state[key];
        const rows = source.map((record) => pick(record, ALLOWED_COLUMNS[table]));
        if (!rows.length) continue;
        await this.request(table, { method: "POST", query: "?on_conflict=id", body: rows, prefer: "resolution=merge-duplicates,return=minimal" });
      }
    }

    async sync(state, mergeRemote) {
      if (this.active) return state;
      this.active = true;
      this.status("Syncing with SAQR", "syncing");
      try {
        await this.flushDeletes(state);
        const remote = await this.pullAll();
        const merged = mergeRemote(state, remote);
        await this.pushAll(merged);
        this.status("Synced just now", "synced");
        return merged;
      } catch (error) {
        this.status(error.message, navigator.onLine ? "error" : "offline");
        throw error;
      } finally { this.active = false; }
    }
  }

  window.lifeRemote = new LifeRemote();
})();
