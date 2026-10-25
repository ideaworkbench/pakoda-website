# Pakoda early-access website

A single landing page for **Pakoda**, a conversational commerce platform for small businesses, made by IWB (Idea Work Bench). Both calls to action ("Join the list" and "Get early access") open one early-access registration form in a modal. Registrations are stored in Supabase; the site is hosted on Vercel.

Figma is the source of truth: file `dIu9eFJ6OTeKil8z3roeY0`. The build is compared with it pixel by pixel (see [Tests](#tests)).

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4.2 (App Router), TypeScript strict, statically rendered page |
| UI | Untitled UI React v7 + Tailwind CSS 4, React Aria Components |
| Forms | React Hook Form + Zod: one schema for the browser and the server |
| Backend | A Next.js Server Action writes to Supabase Postgres with the secret key, on the server only |
| Migrations | Supabase CLI, in `supabase/migrations/` |
| Tests | Vitest (unit, integration), Playwright in Chromium (end-to-end, visual), pixelmatch (Figma comparison) |
| Hosting | Vercel |

All dependency versions are pinned exactly. New packages are added at the newest stable release that is at least 14 days old (measured in UTC from the npm publish time).

## Prerequisites

- Node.js 24 (LTS) and npm. The repository uses `package-lock.json`; install with `npm ci`.
- Docker Desktop, running. Local Supabase needs about 5–8 GB of disk for its images.
- Supabase CLI (`brew install supabase/tap/supabase`). It is not a project dependency.

## First-time setup

```sh
npm ci
npx playwright install chromium   # only needed for end-to-end and visual tests
supabase start                    # starts local Supabase in Docker
supabase db reset                 # applies supabase/migrations to the local database
cp .env.example .env.local
```

Fill in `.env.local` from the output of `supabase status`:

| Variable | Value for local development |
| --- | --- |
| `SUPABASE_URL` | `API_URL`, normally `http://127.0.0.1:54321` |
| `SUPABASE_SECRET_KEY` | `SECRET_KEY`, starting `sb_secret_` |

`.env.local` is git-ignored. Never commit, paste or log the secret key.

## Running locally

```sh
npm run dev      # development server on http://localhost:3000
npm run build    # production build
npm run start    # serves the production build
```

Local Supabase Studio, for looking at the table, is at `http://127.0.0.1:54323` while `supabase start` is running.

## Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `SUPABASE_URL` | Server only | The Supabase project URL. |
| `SUPABASE_SECRET_KEY` | Server only | A secret key (`sb_secret_…`). It bypasses row level security, so it must never reach the browser. Legacy `service_role` keys are rejected. |

Both are validated with Zod in `src/lib/env.ts` the first time the server needs them; an invalid deployment fails on its first submission with an error that names the variable but not its value. Nothing Supabase-related is prefixed `NEXT_PUBLIC_`.

## Database and migrations

The schema lives in `supabase/migrations/`. One table, `public.early_access_registrations`, with:

- check constraints that mirror the form rules (a unit test checks the form's option lists against them),
- a unique index on `lower(email)`, so duplicates are detected regardless of letter case,
- row level security on with no policies, and all table privileges revoked from `anon` and `authenticated` as a second barrier: the publishable key can neither read nor write; only the server's secret key can.

### Local

```sh
supabase migration new <name>   # creates an empty migration file to write
supabase db reset               # rebuilds the local database from all migrations
```

### Remote (production)

Changing the remote database affects the live site. Do it deliberately, with approval.

```sh
supabase login
supabase link --project-ref <project-ref>   # the pakoda-website project
supabase migration list                     # compare local and remote migrations
supabase db push --dry-run                  # shows what would be applied
supabase db push                            # applies it
```

## Tests

Unit tests run on their own. Integration, end-to-end and visual tests need local Supabase running and `.env.local` filled in.

```sh
npm run test:unit          # Vitest: schema, mobile number, submit rule, result mapping, option lists vs migration
npm run test:integration   # Vitest against local Supabase: inserts, duplicates, honeypot, consent, RLS
npm run test:e2e           # Playwright (Chromium): every acceptance criterion, including the visual comparison
npm run visual:report      # rewrites tests/visual/report.md from the latest screenshots
npm run typecheck          # type-checks the app, tests, scripts and configs
npm run lint               # must report zero warnings
```

`npm run test:e2e` builds the site and serves it on port 3100 (or reuses a server already there). Tests create and delete their own rows, using `@pakoda.com` test addresses.

### Visual comparison with Figma

- `tests/visual/figma/` holds 1× exports of every Figma node in the brief. Re-export them whenever Figma changes, keeping the file names.
- The visual spec captures the same screens, compares them with pixelmatch (threshold 0.1, anti-aliasing filtered) and fails above **0.5%** filtered mismatch for full 1470/1728 frames and **1.0%** for card-only captures, where text rendering differences between Figma and Chrome weigh more.
- On card frames, Figma's canvas colour outside the card (#1E1E1E within ±3) is not compared.
- Masks cover only states Figma draws but the real form cannot show; each one is listed with its reason in `scripts/compare-with-figma.ts` and in the report.
- One accepted exception: `result-already-on-the-list` at 1.057%, explained in the report.
- `tests/visual/report.md` has the latest scores; `tests/visual/side-by-side/` has Figma | build | diff images for card screens.
- `tests/visual/baselines/` holds Playwright regression baselines. After an intended visual change, update them with `npx playwright test tests/e2e/visual.spec.ts --update-snapshots` and review the diff before committing.

## Deploying to Vercel

1. Apply the migrations to the production Supabase project (see [Remote](#remote-production)).
2. In Vercel, import the GitHub repository `ideaworkbench/pakoda-website`. Vercel detects Next.js; keep the default build command (`npm run build`) and install command (`npm ci` via the lockfile).
3. In **Project Settings → Environment Variables**, add both variables for **Production** and **Preview**:
   - `SUPABASE_URL`: the project URL from the Supabase dashboard.
   - `SUPABASE_SECRET_KEY`: from Supabase dashboard → **Settings → API Keys** → secret key (`sb_secret_…`).
4. Deploy. Check the page, then submit one test registration and remove it in the Supabase dashboard.

Preview deployments use the same variables, so **they write to the same production Supabase project**. Delete any test rows made from a preview.

## Project structure

```
src/app/                         layout (Inter, metadata), page, global styles, favicon
src/styles/theme.css             Untitled UI v7 tokens; values that differ in the Pakoda Figma file are overridden and marked
src/assets/icons/                Figma icons and 1px lines as React components
src/components/landing/          header, hero image, hero content, scaled stage, wide-viewport lines
src/components/early-access/     provider, dialog, form, fields, selects, result views
src/components/base/             Untitled UI components (with Figma corrections marked in comments)
src/lib/early-access/            schema, mobile-number rules, submit rule, result mapping, server action
src/lib/supabase/server-client.ts
src/lib/env.ts
public/brand/                    logos and the hero photo (Figma's crop, AVIF at 1× and 2×)
supabase/                        CLI config and migrations
scripts/compare-with-figma.ts    pixelmatch comparison and report
tests/                           unit, integration, e2e, visual references, baselines and report
```

## Layout notes

- At 1470px wide the page is Figma frame `1-96` exactly. Below 1470px the whole 1470 × 900 composition is scaled down in CSS only (`min(1, tan(atan2(100cqw, 1470px)))`). Above 1470px the block stays at design size, centred, with 1px guide lines (frame `1-119`).
- The modal renders outside the scaled stage, so it is always drawn at Figma size. It closes only through x-close or "Done".

## Deferred

Out of scope for this release, not built:

- **Tablet and mobile layouts.** Below about 1000px wide the scaled page makes small text very small.
- **Submission-failed state** (design and copy). Interim behaviour: on any error the form returns to its default state with every value kept and the button enabled again; the server logs the error code and message; no message is shown. Marked `TODO(deferred)` in `src/components/early-access/early-access-provider.tsx`.
- **Privacy Policy page and the link to it.** "Privacy Policy." is styled as in Figma but is plain text.
