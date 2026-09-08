# El Waha Pumps Website Rebuild

A fast, modern, and responsive B2B industrial website for **El Waha Pumps** (شركة الواحة لخدمات الآبار والطلمبات), rebuilt using Next.js (App Router), TypeScript, and Tailwind CSS.

## Features
- **Multi-language Support (RTL/LTR)**: Primary Arabic (RTL) and secondary English (LTR) with dynamic URL routing (`/ar` and `/en`) and a custom path-preserving language switcher.
- **Performance Optimized**: Incremental Static Regeneration (60s window) plus on-demand revalidation, optimized Google Fonts, and native CSS animations instead of heavy slider plugins.
- **E-commerce**: Database-backed product catalogue with prices and stock, a localStorage cart, and WhatsApp checkout (no online payment — sales confirm final pricing).
- **CRM + Admin Dashboard**: Protected `/admin` area for leads, customers, cart inquiries, products, and staff accounts.
- **Clean Structure**: 100% type-safe components.

---

## Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment variables
Create a `.env` file in the project root:
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="a-long-random-string"       # REQUIRED — see security note below
```
Generate a strong secret with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Set up the database
Create the schema and load the catalogue plus the first admin account:
```bash
npx prisma migrate dev
npx prisma db seed
```
The seed creates an admin user. Override the defaults with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, otherwise it uses:

| Field | Value |
|---|---|
| Email | `admin@elwahapumps.com` |
| Password | `ChangeMe123!` |

> **Change this password immediately** — sign in at `/admin`, then add your real staff accounts under **Staff** and remove the seeded one.

### 4. Run Development Server
```bash
npm run dev
```
Public site at `http://localhost:3000`, dashboard at `http://localhost:3000/admin`.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## Admin Dashboard

`/admin` is protected by a signed httpOnly session cookie. `src/proxy.ts` redirects
signed-out visitors, and **every admin page and server action independently
re-checks the session** via `requireUser()` / `requireAdmin()` — per Next.js
guidance, proxy alone is never treated as the authorization boundary.

| Page | What it does |
|---|---|
| `/admin` | KPI tiles (new leads, open leads, cart inquiries, customers) + 12-week lead trend |
| `/admin/leads` | Contact-form submissions; filter by status, assign owners, add notes, convert to customer |
| `/admin/inquiries` | Carts visitors sent via WhatsApp, with the itemised list and estimate |
| `/admin/customers` | Customer records with a linked lead/inquiry history and activity timeline |
| `/admin/products` | Catalogue CRUD — prices, stock, images, visibility |
| `/admin/users` | Staff accounts (ADMIN role only) |

**Roles**: `STAFF` can use everything except staff-account management; `ADMIN` can do everything.

---

## How Products Work Now

Products live in the **database**, not in `src/data/products.ts`. That file is now
only the seed source and the shared TypeScript types — editing it has no effect on
a running site. Use `/admin/products` instead.

The rich technical content the site already had (variant groups, model tables,
spec tables, feature lists) is preserved verbatim in the `Product.specs` JSON
column and is re-rendered unchanged. The admin form edits the commercial fields
(price, stock, images, description, summary chips); the deep spec tables remain
seeded data and are untouched when you save.

**Pricing**: leave the price blank and the product shows "Price on request" /
"السعر عند الطلب". Cart totals are always **re-priced server-side** from the
catalogue, so a tampered localStorage cart cannot change what gets recorded.

---

## Pump Selector (`/ar/selector`, `/en/selector`)

A duty-point pump selector over the Kurlar range — the customer enters flow and
head, and gets a ranked shortlist with performance curves, a datasheet and a
motor choice.

**How selection works.** A pump is a candidate only if it *reaches* the required
head at the required flow; delivering 95% of it lifts nothing. Candidates are then
ranked by the efficiency the catalogue publishes for them **at that duty point**,
because that is what sets the customer's electricity bill. Head fit breaks ties.
Head overshoot is capped at +30%, relaxed only if nothing fits.

**Where the numbers come from.**

| Quantity | Source |
|---|---|
| Head | The printed variant tables — `scripts/extract_pump_curves.py` |
| Efficiency, NPSH, recommended-flow band | The drawn curves on the chart pages — `scripts/extract_chart_curves.py` |
| Shaft power | Derived: `rho*g*Q*H / eta`. The catalogues plot no power curve |
| Motor electrical data and dimensions | The per-bore motor data sheets (pp. 40/42/44/46) |

Efficiency is traced out of the PDF's **vector geometry** and mapped back through
the printed axes, because it is never tabulated. Two details there are load-bearing:
the flow axis unit is decided by testing the traced efficiency peak against the
family's nominal flow (the KSX pages label that axis `l/s` while printing m³/h on
it), and efficiency is `null` outside the range the catalogue actually draws rather
than clamped — a 200 m³/h pump must not claim its best-point efficiency at 60 m³/h,
or it wins the ranking and puts a 10" pump down a 6" well.

**Regenerating the data** (only needed when Kurlar publish a new catalogue):

```bash
python scripts/extract_pump_curves.py     # writes src/data/*.json
node scripts/verify-pump-curves.mjs       # must exit 0 before the data is used
node --test src/lib/pump-selector.test.ts
```

`verify-pump-curves.mjs` asserts physical invariants, not style: efficiency peaks
at the model's nominal flow, NPSH rises with flow, motor length and weight rise
with power, and `sqrt(3)*V*I*cos(phi)*eta` reproduces each motor's rated kW. Misprints in
the catalogues are repaired through `scripts/pump-curve-corrections.json`, which
asserts the value it is overwriting so a re-issued catalogue cannot be silently
rewritten with a stale fix.

**Implementation.** `src/lib/pump-selector.ts` is the engine — pure functions, no
data and no React, so `node --test` runs it directly. `src/lib/pump-data.ts` binds
it to the JSON. The page is a **server component with a plain GET form**: no client
JavaScript, the ~600 KB dataset never reaches the browser, and every selection is a
shareable URL (`?q=100&qu=m3h&h=150&hu=m&pick=…&motor=…`).

---

## Deploying to Hostinger

This is no longer a static export — it needs a **Node.js server** (`npm run start`),
not shared PHP hosting. Use Hostinger's Node.js hosting or a VPS.

1. Set `DATABASE_URL` and `JWT_SECRET` in the host's environment.
   **Do not reuse the development `JWT_SECRET`.** Anyone with it can forge an admin
   session. In production the app refuses to start if it is shorter than 32 characters
   or left at a placeholder such as `change-me`. Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
2. Run `npx prisma migrate deploy` (not `migrate dev`) on the server.
3. Run `npm run build`, then start with `npm run start`.
4. The SQLite file must live on **persistent disk** and be included in your backups —
   it holds all leads and customer data. Never commit it; `*.db` is gitignored.
5. **Sign in once and set a real admin password.** The seeded account is created with
   the password below and flagged `mustChangePassword`, so it is redirected to a
   change-password screen and can reach nothing else until you replace it. Seeding
   with the default password is refused outright when `NODE_ENV=production`.

### Database durability

The app enables SQLite **WAL** on startup, so readers are not blocked while a write is
in flight. WAL keeps recent commits in a `-wal` sidecar next to the `.db` file, which
means **a plain `cp` of the `.db` alone can restore short**. Use the backup script,
which asks SQLite for a consistent snapshot via `VACUUM INTO`:

```bash
npm run backup -- --out=/srv/backups/elwaha --keep=14
```

Cron it nightly:

```bash
15 3 * * * cd /srv/elwaha && npm run backup -- --out=/srv/backups/elwaha >> /var/log/elwaha-backup.log 2>&1
```

To restore: stop the app, put the chosen backup file in place of the live `.db`,
delete any stale `-wal` and `-shm` sidecars beside it, and start the app.
**Do this once on staging before you need it** — an untested backup is a guess.

**Scaling note**: SQLite is a good fit for one server. If you ever run multiple
instances, switch `prisma/schema.prisma` to `provider = "postgresql"` and swap the
adapter in `src/lib/prisma.ts` — no application code changes. Note that the login
throttle and public-form rate limiter (`src/lib/rate-limit.ts`) are per-process and
in-memory, so they would need moving to shared storage at the same time.

---

## How to Add or Modify Content (Zero-Layout-Code Maintenance)

All pages are data-driven. You can add, edit, or remove products, services, and agent brands simply by updating the translation dictionaries and list arrays. No layout code modifications are needed.

### 1. Adding/Modifying a Service
Service details are dynamically compiled for pages like `/ar/services/[slug]` and `/en/services/[slug]`.

1. **Add Translations**:
   Open `src/dictionaries/ar.json` and `src/dictionaries/en.json`. Add a new service entry inside the `"servicesData"` block:
   ```json
   // in ar.json
   "servicesData": {
     "my-new-service": {
       "title": "عنوان الخدمة الجديدة",
       "short": "وصف مختصر للخدمة يظهر في الشبكة.",
       "desc": "الوصف التفصيلي الكامل للخدمة يظهر في صفحة التفاصيل..."
     }
   }
   ```
   Add the exact same key structure with English translations inside `en.json`.

2. **Register the Service**:
   Open `src/app/[lang]/services/[slug]/page.tsx` and add your service slug (`"my-new-service"`) to the `serviceSlugs` array:
   ```typescript
   const serviceSlugs = [
     "pump-supply",
     // ...
     "my-new-service" // Add your slug here
   ];
   ```
   - If it is a **Supply** service, register its slug in `supplyServiceIds` inside:
     - `src/app/[lang]/page.tsx`
     - `src/app/[lang]/services/page.tsx`
     - `src/app/[lang]/services/[slug]/page.tsx` (in the `isSupply` condition).
   - If it is a **Maintenance** service, register its slug in `maintenanceServiceIds` inside the same files.

---

### 2. Adding/Modifying a Product

> **This no longer involves code.** Products moved to the database — sign in and use
> **`/admin/products`**. Editing `src/data/products.ts` or the `productsData` block in
> the dictionaries has **no effect** on a running site.

In `/admin/products` → **New product**, fill in:

| Field | Notes |
|---|---|
| Name (English / Arabic) | Both required — they drive the two locales |
| URL slug | Lowercase and dashes; becomes `/en/products/your-slug` |
| Category | One of the six existing categories |
| Price / Currency | Leave price blank for "Price on request" |
| Stock | Blank means "not tracked" (always shows In Stock) |
| Image URLs | One per line, e.g. `/images/products/pump-kurlar.png` (put files in `public/images/products/`) |
| Spec chips | Short highlights on the product card, one per line |
| Visible | Uncheck to pull it from the public site without deleting it |

Changes appear on the public site immediately. New categories still require a
database row — add one in `prisma/seed.ts` and re-run `npx prisma db seed`.

---

### 3. Adding/Modifying an Agent (Brand Partner)
Brand pages are compiled dynamically at `/agents/[slug]`.

1. **Add Translations**:
   Add the brand entry inside the `"agentsData"` block in `ar.json` and `en.json`:
   ```json
   "agentsData": {
     "brand-slug": {
       "name": "اسم الماركة التجارية",
       "title": "التصنيف الرئيسي (مثال: محركات كهروميكانيكية)",
       "desc": "شرح تفصيلي للعلامة التجارية وحجم شراكتنا..."
     }
   }
   ```

2. **Register the Agent**:
   Open `src/app/[lang]/agents/[slug]/page.tsx` and `src/app/[lang]/agents/page.tsx` and append the slug (e.g. `"brand-slug"`) to the respective `agentSlugs` or `agents` arrays.
   
3. **Register Product Lines**:
   In `src/app/[lang]/agents/[slug]/page.tsx`, define the brand's product lines list in `productLinesMap` for both languages:
   ```typescript
   "brand-slug": lang === "ar"
     ? [
         "خط المنتجات الأول",
         "خط المنتجات الثاني",
       ]
     : [
         "First Product Line",
         "Second Product Line",
       ]
   ```
