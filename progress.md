# Progress — Adibasi Tarzan Club website management

_Last updated: 2 Nov 2026_

## Status at a glance

| Area | State |
|---|---|
| Folder split into `client/` + `server/` | ✅ Done |
| Server (Node + Express 5 + MongoDB + Cloudinary) | ✅ Built, 30/30 tests passing |
| Admin panel at `/admin` | ✅ Built, tested in a real Chrome browser (desktop + phone) |
| Public site reads live content from the API | ✅ Done, looks identical to before |
| Image pipeline (WebP, crop, focus point) | ✅ Done (tested with local storage) |
| YouTube videos (paste link → embed) | ✅ Done |
| Security audit (`npm audit`) | ✅ 0 vulnerabilities in both folders |
| README with setup table | ✅ `README.md` |
| Git commit | ✅ Pushed to `main` (latest `cfc9634`) |
| Render API | ✅ Live (Node 22, env vars set, Cloudinary keys added — shared account, folder `atc`) |
| `api.` DNS | ⏳ Custom domain added in Render; CNAME `api` at domain provider still to add |
| Seed + owner login | ⏳ Not done |
| Vercel `VITE_API_URL` | ⏳ Add only after `api.` health check works |

---

## What was built

### Server (`server/`)
- `src/content/schemas.js` — **single source of truth** for every editable thing (fields, labels, help text, validation rules). DB models, validation and admin forms are all generated from it.
- `src/content/validate.js` — checks every save, plain-English errors per field, safe links only (no `javascript:`).
- `src/content/bundle.js` — builds the public content JSON (`/api/public/content`), cached in memory, ETag/304.
- `src/services/images.js` — sharp: real-image check, auto-rotate, strip EXIF/GPS, max 2560px, WebP q86, blur preview + main colour.
- `src/services/storage.js` — Cloudinary in production; local `server/uploads` fallback for development. Crops stored as % and applied via URL (non-destructive). News get a 1200×630 share image.
- `src/services/rebuild.js` — calls the Vercel Deploy Hook ~3 min after the last edit (max wait 15 min), survives restarts.
- `src/services/passwords.js` (scrypt), `sessions.js` (httpOnly JWT cookie), `audit.js` (activity log), `youtube.js` (link parsing + oEmbed title).
- `src/routes/` — `auth.js`, `public.js`, `admin/` (collections, singles, media, translations, users, dashboard, website refresh, YouTube lookup).
- `src/middleware/` — auth (owner/editor, forced password change), security (origin/CSRF check, `$`-key stripping, rate limits), error handler.
- `src/scripts/` — `seed.js`, `create-admin.js`, `reset-password.js`, `check-setup.js`.
- `test/api.test.js` — 30 end-to-end tests on in-memory MongoDB.

### Editable sections in the admin
- **Website content:** News, Matches (score → moves to Results), Club Events, Videos (YouTube), Gallery (bulk upload, albums)
- **People:** Players (optional photo, squad: first team / youth / veterans, home slider), Committee (optional photo)
- **Home page:** Stories, Events & Tickets cards, Explore the Club cards, Partners & Sponsors (logos on home, footer, contact)
- **Club information:** Honours, History timeline, FAQs (club / membership), Membership plans, Teams
- **Settings:** Club details (address, contact, socials, announcement bar), Page banners & photos (every page hero + fixed home/club photos)
- **Tools:** Photo library, Translations (Hindi/Bengali for admin content), Activity log, People & access (owner only), Help & tips, My account

### Client (`client/`)
- `src/content/` — `store.js` (`useContent()` / `getContent()`), `load.js` (API → saved `content.json` → defaults), `image.js` (srcset, `{w}` URLs).
- `src/data/defaults.js` — old `club.js` turned into starting content (used by seed + fallback). `src/data/nav.js` — navigation (stays in code).
- All pages/components switched from hardcoded data to `useContent()`. New: player/committee/event photos, gallery albums + video grid (click-to-play, youtube-nocookie), partner logos, youth/veterans squads.
- `src/seo/meta.js` — reads live content; articles get their own share image.
- `scripts/prerender.js` — fetches content from the API at build; **stops the build** if the API is configured but unreachable (old site stays live).
- `src/admin/` — the whole admin panel (separate bundle via `admin.html`, router basename `/admin`).
- `vercel.json` — `/admin/*` rewrite, `noindex` on admin.

### Other changes
- Upgraded react-router 6 → 7 and vite 5 → 7 (fixed audit issues incl. a high-severity open redirect).
- `dist/` removed from git (Vercel builds it). Root `.gitignore`, `package.json` (helper scripts), `render.yaml` added.
- New interface phrases added to `src/i18n/hi.js` and `bn.js`.

---

## Testing done
- `cd server && npm test` → 30/30 pass (seed script, login lockout, cross-site blocking, WebP + EXIF removal, crop/focus, slug clashes, edit conflicts, photo-in-use protection, permissions, translations).
- Two real-browser passes (Chrome, headless) against a live seeded server: sign-in, add news with upload → crop → focus → save, story live on public site, validation errors, unsaved-changes guard, match score → Hindi results page, bulk upload of 3 gallery photos, YouTube title auto-fill + click-to-play, translations save, adding an editor (temporary password), phone layouts.
- Client build prerenders all pages (EN/HI/BN), no missing-translation warnings.

### Not tested yet (needs real accounts)
- Real Cloudinary uploads/URLs (format follows Cloudinary docs) — after setup run `npm run check` and upload one test photo.
- Vercel deploy + Deploy Hook, Render deploy, cookies across `www.` → `api.` subdomain.

---

## Next steps (manual setup — full detail in `README.md`)

| # | Where | Do | Value → where |
|---|---|---|---|
| 1 | MongoDB Atlas | Free M0, Mumbai, DB user, network `0.0.0.0/0` | `MONGODB_URI` → Render + `server/.env` |
| 2 | Cloudinary | Free account; keep "Strict transformations" off | `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` → Render |
| 3 | Render | New → Blueprint → repo (`render.yaml`); Starter $7/mo (free sleeps) | API address |
| 4 | DNS | CNAME `api` → Render host; add custom domain in Render | `https://api.adibasitarzanclub.in` |
| 5 | Render env | `CLIENT_URL=https://www.adibasitarzanclub.in`, `CORS_ORIGINS=https://adibasitarzanclub.in`, `PUBLIC_URL=https://api.adibasitarzanclub.in` | — |
| 6 | Local | `cd server` → `.env` → `npm install`, `npm run seed`, `npm run create-admin`, `npm run check` | Owner login |
| 7 | Vercel | Root dir `client`, `VITE_API_URL=https://api.adibasitarzanclub.in`, Node 22, domain | Live site |
| 8 | Vercel Deploy Hook | Settings → Git → Deploy Hooks (branch `main`) | `DEPLOY_HOOK_URL` → Render |
| 9 | `/admin` | People & access → add the client | Handover |
| 10 | YouTube | Club uploads videos (Public/Unlisted) | — |
| 11 | Search Console (optional) | Submit `/sitemap.xml` | — |

Also to do:
- [ ] Review the changes and commit (no commit made yet).
- [ ] After going live: upload a real photo, add a real YouTube video, check a WhatsApp link preview of a news story.
- [ ] Replace SAMPLE content (squad names, committee, fixtures) through the admin.

## Client request — 2 Nov 2026 (built, not committed)
- **Our Legacy** (admin: Club information → Our Legacy): “Beyond the Game” section about the 35+ year Married vs Unmarried match at Sera/Dashami (Dussehra). Full section on the Club page (`/club#legacy`, new tab), short version on the home page. Optional year-by-year results list. Can be switched off.
- **Notice Board** (admin: Website content → Notice Board): upload official letters, tournament invitations and the club calendar as PDF (≤10 MB) or as a photo. Shown on the home page under the Calendar (latest 3), and in full at `/schedule?tab=notices`. Newest Calendar item also gets a “Club calendar” button in the home Calendar strip. Nav links added.
- Server: new `file` field type, `FileAsset` model, `POST /api/admin/files` (real-PDF check), PDFs on Cloudinary under `atc/documents` (first-page preview) or `server/uploads` locally. 32/32 tests.
- ⚠️ Cloudinary: switch on *Settings → Security → Allow delivery of PDF and ZIP files* (shared account), otherwise PDFs won’t open.
- Legacy default text is from the client’s WhatsApp message; photo is a SAMPLE placeholder.

## Possible later additions (not built)
- Editable site-wide share image (og:image) and page SEO descriptions in the admin.
- Content Security Policy header for the site/admin (needs the final API domain).
- Email-based "forgot password" (currently the owner resets passwords, or `npm run reset-password`).
- Soft-delete "bin" with restore (currently: Hide is the safe option, delete is permanent).

---

## Quick commands
```bash
# Local development
cd server && npm run dev        # API on :4000 (needs server/.env)
cd client && npm run dev        # site :3000, admin :3000/admin

# Server tools (in server/)
npm test                        # 30 API tests
npm run check                   # verify DB, Cloudinary, settings
npm run seed                    # fill empty DB (-- --force to reset content)
npm run create-admin            # owner account
npm run reset-password -- --email someone@example.com
```

## Key decisions (and why)
- **Focus point + `object-fit: cover`** instead of fixed top/centre/bottom — the same photo is shown in many frame shapes; the focus point stays visible in all. 9 quick presets kept for speed.
- **Non-destructive crops** — originals stay on Cloudinary; re-crop any time.
- **API on `api.` subdomain** (not `*.onrender.com`) — keeps sign-in cookies first-party so Safari/iPhone logins work.
- **Prerender + live fetch** — Google sees full pages; visitors see edits instantly; site survives API downtime.
- **Admin strings in English** with a Translations screen, rather than three fields per input — simpler for a non-technical editor.
