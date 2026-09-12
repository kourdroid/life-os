# Life OS

A light, local-first personal system for salah, Quran, commitments, driving licence practice, job hunting, training, YouTube, experiments, and income.

## What is real

- Prayer times come from the AlAdhan API and remain blank until a real city or device location is saved.
- Salah, Quran, commitments, work pipelines, income, streaks, insights, and the contribution history use stored records only.
- The app works offline after the first load and keeps local data in the browser.
- Optional email sign-in syncs records through the `life` schema in the SAQR Supabase project with row-level security.
- Export and import provide a portable JSON backup.

## Run locally

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`.

## Verify

```powershell
npm run check
npm test
```

`config.js` contains only the browser-safe Supabase URL and publishable key. Never place a service-role key in browser code.
