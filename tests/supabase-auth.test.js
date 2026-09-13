const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function tokenFor(userId = "user-1") {
  return `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url")}.`;
}

function makeRemote(fetchImpl) {
  const storage = new Map();
  const window = { LIFE_CONFIG: { supabaseUrl: "https://saqr.example", supabasePublishableKey: "sb_publishable_test" } };
  const context = vm.createContext({
    window,
    localStorage: { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
    fetch: fetchImpl,
    EventTarget,
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    atob,
    location: { origin: "https://life.example", pathname: "/" },
    history: { replaceState() {} },
    URLSearchParams,
    navigator: { onLine: true },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "supabase.js"), "utf8"), context);
  return window.lifeRemote;
}

test("password sign-in stores the authenticated Supabase session", async () => {
  const calls = [];
  const remote = makeRemote(async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ access_token: tokenFor(), refresh_token: "refresh-token", expires_at: Math.floor(Date.now() / 1000) + 3600 }), { status: 200 });
  });

  await remote.signInWithPassword("mehdi@example.com", "correct-password");

  assert.equal(calls[0].url, "https://saqr.example/auth/v1/token?grant_type=password");
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: "mehdi@example.com", password: "correct-password" });
  assert.equal(remote.userId(), "user-1");
});

test("password sign-in returns the server auth error without creating a session", async () => {
  const remote = makeRemote(async () => new Response(JSON.stringify({ msg: "Invalid login credentials" }), { status: 400 }));

  await assert.rejects(() => remote.signInWithPassword("mehdi@example.com", "wrong-password"), /Invalid login credentials/);
  assert.equal(remote.session(), null);
});
