# Adibasi Tarzan Club — website & website management

```
atc/
├── client/   The public website (React + Vite, prerendered for Google) and the admin panel at /admin
└── server/   The website management API (Node.js + Express + MongoDB, photos on Cloudinary)
```

The club's office-bearers manage **everything visible on the website** from
`https://www.adibasitarzanclub.in/admin`, in plain English and from a phone or computer:
news, matches and results, events, YouTube videos, gallery, players, committee, stories,
home-page cards, partners, honours, history, FAQs, membership plans, club details, every
page banner, and the Hindi/Bengali translations of all of it.

---

## Manual setup — do these once, in this order

| # | Where | What to do | Value you get → where it goes |
|---|-------|-----------|-------------------------------|
| 1 | **MongoDB Atlas** (mongodb.com/atlas) | Create a free **M0** cluster, region **Mumbai (ap-south-1)**. *Database Access* → add user `atc-admin` with a strong password, role *Read and write to any database*. *Network Access* → add `0.0.0.0/0` (Render has no fixed IP). *Connect → Drivers* → copy the string, replace `<password>`, add `/atc` before `?`. | `MONGODB_URI` → Render (server) and your local `server/.env` |
| 2 | **Cloudinary** (cloudinary.com, free plan) | Sign up → *Dashboard* shows Cloud name, API Key, API Secret. Leave *Settings → Security → Strict transformations* **off** (the site asks for photo sizes on the fly). Switch **on** *Settings → Security → Allow delivery of PDF and ZIP files* (needed for the Notice Board PDFs — new accounts block PDFs by default). | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` → Render |
| 3 | **Render** (render.com) | *New → Blueprint* → pick this GitHub repo (uses `render.yaml`). Plan **Starter ($7/mo)** keeps it always awake; *Free* works but sleeps after 15 min idle (first admin load then takes ~1 min). Fill in the secrets it asks for. `JWT_SECRET` is generated for you. | Render gives an address like `atc-api.onrender.com` |
| 4 | **Domain DNS** (where `adibasitarzanclub.in` is registered) | Add a **CNAME** record `api` → `atc-api.onrender.com`. In Render → *Settings → Custom Domains* add `api.adibasitarzanclub.in` (HTTPS is automatic). | API address: `https://api.adibasitarzanclub.in` |
| 5 | **Render → Environment** | `CLIENT_URL` = `https://www.adibasitarzanclub.in` · `CORS_ORIGINS` = `https://adibasitarzanclub.in` (the non-www address, plus any Vercel preview URL you want to test admin on) · `PUBLIC_URL` = `https://api.adibasitarzanclub.in` | Save → Render redeploys |
| 6 | **Your computer** (once) | `cd server && npm install`, copy `.env.example` to `.env`, paste the **same** `MONGODB_URI` and Cloudinary keys, then run `npm run seed` (copies the current website content into the database) and `npm run create-admin` (your owner login). Finish with `npm run check`; every line should show ✓. | An owner account for `/admin` |
| 7 | **Vercel** (vercel.com) | Import the repo. *Root Directory* = `client`. *Environment Variables* → `VITE_API_URL` = `https://api.adibasitarzanclub.in`. Node.js version 22. Add the domain `www.adibasitarzanclub.in` (+ redirect the apex to it). Deploy. | The live website, reading content from the API |
| 8 | **Vercel → Settings → Git → Deploy Hooks** | Create a hook named `content` for branch `main`, copy the URL. | `DEPLOY_HOOK_URL` → Render. Google's copy of the site then refreshes ~3 min after each round of edits. |
| 9 | **The admin panel** | Sign in at `/admin` → *People & access* → *Add a person* for your client (Owner or Editor). Give them the temporary password shown; they choose their own on first sign-in. | Client can manage the site |
| 10 | **YouTube** | The club uploads videos to its channel (Public or Unlisted), then pastes the link in *Videos*. Nothing to configure. | — |
| 11 | *(Optional)* **Google Search Console** | Verify the domain and submit `https://www.adibasitarzanclub.in/sitemap.xml`. | Faster indexing |

**Costs:** Atlas M0 free · Cloudinary free (25 monthly credits, plenty for a club) · Vercel Hobby free · Render Starter $7/month (or free with sleeping).

---

## How it works

```
 Admin (/admin) ──edits──▶  API (server/)  ──stores──▶ MongoDB (text, settings, photo details)
                               │   └──────uploads────▶ Cloudinary (the photo files)
                               │
 Visitor ──opens page──▶ Website (Vercel) ──reads /api/public/content──▶ API  → changes show immediately
                               ▲
                               └── rebuilt ~3 min after edits (Deploy Hook) → Google, WhatsApp previews, AI bots
```

* **One file describes every editable thing:** `server/src/content/schemas.js`. The database
  models, the validation of every save, and the admin forms are all generated from it. Add a
  field there and it appears in the panel, is checked, stored and sent to the website.
* **The website never breaks if the API is down:** pages are prerendered with the latest
  content at build time, and the browser falls back to the saved `content.json`, then to the
  built-in defaults (`client/src/data/defaults.js`, which is also what `npm run seed` loads).
* **The build refuses to publish sample content:** if `VITE_API_URL` is set but the API can't
  be reached, the Vercel build stops and the previous version stays live.

### Photos

Every upload is checked from its contents (not its name), turned upright, stripped of hidden
data (GPS location, camera serials), shrunk to at most 2560 px and saved as **WebP at quality
86** — visually identical, typically 85–95% smaller. Large phone photos are also shrunk in the
browser before upload, so uploading on mobile data is quick.

**Crop and focus point are never baked in.** The original stays on Cloudinary; the crop and a
*focus point* are stored with each use of the photo. The admin taps the most important spot
(usually a face) and sees live previews for wide banners, cards, squares and phone screens.
The website then fills every frame with `object-fit: cover` and keeps the focus point in view
(`object-position`). This is better than fixed "top / centre / bottom" choices, which only
work for one frame shape. The nine quick-position buttons are still there for speed. Each
screen downloads only the size it needs (`srcset`, AVIF/WebP via Cloudinary `f_auto`), and a
tiny blurred preview shows while it loads. News stories automatically get a 1200×630 JPEG for
WhatsApp/Facebook previews.

### Videos

Videos stay on YouTube. The admin pastes any YouTube link (watch, youtu.be, Shorts, live,
with or without `?si=`); the title is filled in automatically. On the website only the
thumbnail loads; the player (`youtube-nocookie.com`) is loaded when someone presses play.

---

## Security

* Passwords hashed with **scrypt**; sessions in an `httpOnly`, `Secure`, `SameSite` cookie
  (never readable by scripts); sessions end on password change, deactivation, or
  "Sign out everywhere".
* Every change must come from the site's own origin (cross-site request forgery guard), plus
  strict CORS allow-list. Login rate limit (20 per 15 min per connection) and account lock
  after 8 wrong passwords. Same message for unknown email and wrong password.
* Owner / Editor roles; temporary passwords must be replaced on first sign-in; there is always
  at least one owner.
* Every input is validated against `schemas.js`; unknown fields and `$`/`.` keys are dropped;
  links can only be `https://`, `mailto:`, `tel:` or site paths (no `javascript:`).
* Uploads: real image check, SVG refused, pixel-bomb limit, size limit, small batches.
* Optimistic locking: if two people edit the same thing, the older save is stopped instead
  of silently overwriting.
* Photos in use, teams used in matches, and the club's own team can't be deleted.
  "Hide" is offered everywhere as the safe alternative.
* Activity log of who changed what (kept one year). Helmet security headers, `noindex` on
  `/admin`, errors never leak internals.
* `npm audit` reports **0 vulnerabilities** in both folders.

---

## Working on it locally

```bash
# 1. API (needs a MongoDB URI in server/.env — Atlas or a local MongoDB)
cd server
cp .env.example .env        # fill MONGODB_URI; leave Cloudinary empty to store photos in server/uploads
npm install
npm run seed                # first time only
npm run create-admin        # first time only
npm run dev                 # http://localhost:4000

# 2. Website + admin (second terminal)
cd client
npm install
npm run dev                 # http://localhost:3000  and  http://localhost:3000/admin
```

| Command (in `server/`) | What it does |
|---|---|
| `npm test` | 30 end-to-end API tests on a temporary in-memory MongoDB (login, security, uploads, crops, validation, conflicts, permissions) |
| `npm run check` | Checks the database, Cloudinary keys and settings, and prints ✓ / ✖ |
| `npm run seed` | Fills an **empty** database with the starting content (`-- --force` wipes content and starts again; people and photos are kept) |
| `npm run create-admin` | Creates an owner account |
| `npm run reset-password -- --email someone@example.com` | Sets a new password and unlocks an account |

| Command (in `client/`) | What it does |
|---|---|
| `npm run dev` | Website and admin with live reload; `/api` is forwarded to `localhost:4000` |
| `npm run build` | Builds the site, prerenders every page in English, Hindi and Bengali, writes `sitemap.xml`, `llms.txt` and `content.json` |

### Adding something new to the admin

1. Add the field (or a whole new section) to `server/src/content/schemas.js`.
2. Send it to the website in `server/src/content/bundle.js`.
3. Use it in the React component through `useContent()`.
4. Add its starting value to `client/src/data/defaults.js` (and the seed mapping in `server/src/scripts/seed.js`).
