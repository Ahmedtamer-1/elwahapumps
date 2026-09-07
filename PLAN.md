# El Waha Pumps — Remediation Plan

## Context

The El Waha Pumps site has been rebuilt in Next 16.2.10 / React 19.2 / Tailwind 4 / Prisma 7 + SQLite on branch `claude/website-audit-seo-69d962`. **It is not deployed.** `elwahapumps.com` still serves the old WordPress/Yoast site.

That single fact sets the strategy. This is not incremental patching of a live site — it is a one-shot cutover where the domain's existing search equity either transfers or is lost. A six-specialist audit found the engineering core sound (correct Next 16 conventions, defence-in-depth admin auth, a tested pump-selection engine, a documented brand system) but the entire discovery layer absent: no sitemap, no robots file, no canonical or hreflang, no structured data, one shared page title across 16 of 18 pages, and no redirect map for the 61 indexed WordPress URLs.

Every audit claim below was re-verified against the working tree on 7 September 2026. Corrections to the audit are recorded in [Audit corrections](#audit-corrections).

**Goal:** a safe cutover, then sustained improvement on the live site.

### Decisions taken

| Decision | Choice | Consequence for this plan |
|---|---|---|
| Cutover date | Not fixed | Sequenced by dependency and payoff. A **Cutover Gate** is defined after Stage 2; Stages 3–7 are split into pre- and post-gate tasks. |
| Hosting | Node VPS (per README) | SQLite stays. No Postgres migration task. Adds WAL mode, backups, and process-manager tasks. |
| Content authoring | You supply the copy | Stage 8 builds page shells and schema with content slots, plus a content checklist for you to fill. No task invents factual claims. |
| Design consolidation | Full, but after cutover | Stage 5 splits: targeted breakage fixes pre-gate, full component migration post-gate. |

### How to read this

- **Gate** column: `PRE` = required before the domain switch. `POST` = after. `GATE` = the cutover itself.
- **Size**: S ≈ under an hour · M ≈ half a day · L ≈ two days or more.
- Every task is atomic. Acceptance criteria are the exact command or check to run.
- Tasks marked **NEEDS INPUT** are blocked on a decision from you — see [Open questions](#open-questions).

---

## Checklist

### Stage 0 — Launch blockers

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S0-T01 | Allow `quality={95}` in image config | S | PRE | DONE |
| S0-T02 | Fix 3 brand links returning 404 | M | PRE | DONE |
| S0-T03 | Fix 3 TypeScript errors in the test file | S | PRE | DONE |
| S0-T04 | Replace 7 `dict: any` with a typed Dictionary | M | PRE | DONE |
| S0-T05 | Fix 4 remaining lint errors | S | PRE | DONE |
| S0-T06 | Fix `hasLocale` prototype-chain bug | S | PRE | DONE |
| S0-T07 | Add not-found, error and global-not-found pages | M | PRE | DONE |
| S0-T08 | Delete dummy retail filters from category pages | S | PRE | DONE |
| S0-T09 | Seed the `surface-pumps` category | S | PRE | DONE |
| S0-T10 | Resolve contradictory company facts | S | PRE | DONE |
| S0-T11 | Notify a human when a lead arrives | M | PRE | DONE |
| S0-T12 | Delete the unreferenced 162 MB image folder | S | PRE | DONE |
| S0-T13 | Delete Vite scaffold and dead components | S | PRE | DONE |
| S0-T14 | Add npm scripts and CI | S | PRE | DONE |

### Stage 1 — Discovery layer

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S1-T01 | Add `metadataBase` and site-wide Open Graph defaults | S | PRE | DONE |
| S1-T02 | Build the `seo.ts` canonical + hreflang helper | M | PRE | DONE |
| S1-T03 | Page metadata for the 8 static routes | M | PRE | DONE |
| S1-T04 | Page metadata for the 8 dynamic routes | M | PRE | DONE |
| S1-T05 | Fix the selector and cart metadata | S | PRE | DONE |
| S1-T06 | Add `robots.ts` | S | PRE | DONE |
| S1-T07 | Add `sitemap.ts` with locale alternates | M | PRE | DONE |
| S1-T08 | Mark cart and selector results noindex | S | PRE | DONE |
| S1-T09 | Organization + LocalBusiness + WebSite JSON-LD | M | PRE | DONE |
| S1-T10 | Breadcrumb component + BreadcrumbList JSON-LD | M | PRE | DONE |
| S1-T11 | Product / ProductGroup JSON-LD | M | PRE | DONE |
| S1-T12 | Event and JobPosting JSON-LD | M | POST | PARTIAL — JobPosting shipped; Event schema still blocked on real dates (S8-T01) |
| S1-T13 | Open Graph image route | M | PRE | DONE |
| S1-T14 | Icons, manifest and theme colour | S | PRE | DONE |
| S1-T15 | Repair heading hierarchy | M | PRE | DONE |
| S1-T16 | Canonicalise `?tab=` and `?subject=` variants | S | PRE | DONE |

### Stage 2 — Migration safety

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S2-T01 | Freeze a verified inventory of live URLs | S | PRE | DONE |
| S2-T02 | Redirect map — Latin-slug pages | M | PRE | DONE |
| S2-T03 | Redirect map — Arabic percent-encoded slugs | M | PRE | DONE |
| S2-T04 | Redirect map — 12 `/portfolio/nsp-*` pages | S | PRE | DONE — routed to the pumps category (conservative fallback); confirm with the user whether any should point at a specific product |
| S2-T05 | Change the root redirect to 308 | S | PRE | DONE |
| S2-T06 | Redirect the legacy Yoast sitemap URLs | S | PRE | DONE |
| S2-T07 | Write the post-cutover redirect verification script | M | PRE | DONE — 68/68 legacy URLs pass locally |
| S2-T08 | Off-site listing update checklist | S | GATE | PARTIAL — checklist written (docs/off-site-listings-checklist.md); the actual off-site updates need your access to each property |
| S2-T09 | **CUTOVER** — switch DNS and verify | M | GATE | BLOCKED — requires your action (DNS/hosting access); all PRE work it depends on is done |

### Stage 3 — AI-search readiness

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S3-T01 | Publish `llms.txt` | S | PRE | TODO |
| S3-T02 | Declare an AI-crawler policy in robots | S | PRE | TODO |
| S3-T03 | Render spec tables in HTML, not behind a tab | M | PRE | TODO |
| S3-T04 | Server-render the home teaser and contact form | M | PRE | TODO |
| S3-T05 | Remove unbacked marketplace trust badges | S | PRE | TODO |
| S3-T06 | Add text lists under the logo walls | S | POST | TODO |
| S3-T07 | Arabic transliterations for 8 brand names | S | POST | TODO |
| S3-T08 | Standardise Arabic unit notation | S | POST | TODO |
| S3-T09 | Public product read API | M | POST | TODO |
| S3-T10 | Public pump-selector API | M | POST | TODO |
| S3-T11 | Generate `llms-full.txt` at build | M | POST | TODO |
| S3-T12 | Publish the pump-curve dataset | M | POST | TODO |

### Stage 4 — Performance

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S4-T01 | Replace the Unsplash hero with local photography | M | PRE | TODO |
| S4-T02 | Remove or session-gate the splash screen | S | PRE | TODO |
| S4-T03 | Replace the framer page transition with CSS | S | PRE | TODO |
| S4-T04 | Re-encode oversized source photographs | M | PRE | TODO |
| S4-T05 | Image formats, cache TTL and asset headers | S | PRE | TODO |
| S4-T06 | Rename deprecated `priority` to `preload` | S | PRE | TODO |
| S4-T07 | Add `sizes` to unsized fill images | S | PRE | TODO |
| S4-T08 | Stop double-rendering the header logo | S | POST | TODO |
| S4-T09 | Pass dictionary slices, not the whole dictionary | M | POST | TODO |
| S4-T10 | Lighter product DTO for list pages | M | POST | TODO |
| S4-T11 | Trim font subsets and weights | S | POST | TODO |
| S4-T12 | Prebuild product and category pages | S | POST | TODO |
| S4-T13 | Query one product instead of the whole catalogue | S | POST | TODO |

### Stage 5 — Design system consolidation

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S5-T01 | Fix the fixed-header offset across all pages | M | PRE | TODO |
| S5-T02 | Fix RTL direction bugs in Hero and CategoryView | S | PRE | TODO |
| S5-T03 | Isolate phone numbers from bidi reordering | S | PRE | TODO |
| S5-T04 | Build the shared component primitives | L | POST | TODO |
| S5-T05 | Migrate the home page | M | POST | TODO |
| S5-T06 | Rebuild the product detail page | L | POST | TODO |
| S5-T07 | Migrate the category view | M | POST | TODO |
| S5-T08 | Migrate cart and contact | M | POST | TODO |
| S5-T09 | Migrate services, events, agents and support | L | POST | TODO |
| S5-T10 | Re-skin the pump selector | M | POST | TODO |
| S5-T11 | Convert physical to logical direction utilities | M | POST | TODO |
| S5-T12 | Delete the Material-3 aliases and legacy palette | M | POST | TODO |
| S5-T13 | Restructure primary navigation | M | POST | TODO |
| S5-T14 | Standardise type scale and container widths | M | POST | TODO |

### Stage 6 — Accessibility

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S6-T01 | Fix 6 pine-on-black contrast failures | S | PRE | TODO |
| S6-T02 | Fix interactive and body-text contrast failures | M | PRE | TODO |
| S6-T03 | Make the mega-menu keyboard reachable | M | PRE | TODO |
| S6-T04 | Give the mobile drawer a focus trap and Escape | M | PRE | TODO |
| S6-T05 | Add a skip link | S | PRE | TODO |
| S6-T06 | Label cart inputs and announce form results | M | PRE | TODO |
| S6-T07 | Implement the ARIA tabs pattern | M | POST | TODO |
| S6-T08 | Rebuild the lightbox on native `dialog` | M | POST | TODO |
| S6-T09 | Fix hero carousel targets, pause and motion | M | POST | TODO |
| S6-T10 | Give marquees a reduced-motion fallback | S | POST | TODO |
| S6-T11 | Localise the aria-labels | S | POST | TODO |
| S6-T12 | Remove the nested main landmark | S | POST | TODO |

### Stage 7 — Code and security hardening

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S7-T01 | Add HTTP security headers | S | PRE | TODO |
| S7-T02 | Enforce JWT secret strength and cookie prefix | S | PRE | TODO |
| S7-T03 | Throttle admin login and close the timing oracle | M | PRE | TODO |
| S7-T04 | Protect the two public POST endpoints | M | PRE | TODO |
| S7-T05 | Force a password change for the seeded admin | M | PRE | TODO |
| S7-T06 | Add the missing database indexes | S | PRE | TODO |
| S7-T07 | Stop the seed clobbering admin product edits | S | PRE | TODO |
| S7-T08 | Centralise the contact constants | S | PRE | TODO |
| S7-T09 | Enable SQLite WAL and nightly backups | M | PRE | TODO |
| S7-T10 | Make sessions revocable | M | POST | TODO |
| S7-T11 | Standardise the server-action error contract | M | POST | TODO |
| S7-T12 | Paginate and search the admin lists | M | POST | TODO |
| S7-T13 | Add error and request instrumentation | M | POST | TODO |
| S7-T14 | Validate cart state read from localStorage | S | POST | TODO |
| S7-T15 | Validate admin-entered image URLs | S | POST | TODO |
| S7-T16 | Resolve dependency placement and engines | S | POST | TODO |

### Stage 8 — Content and conversion

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S8-T01 | Write the content brief for you to fill | M | POST | TODO |
| S8-T02 | Brand page shells for the represented manufacturers | L | POST | TODO |
| S8-T03 | Application and solution page shells | M | POST | TODO |
| S8-T04 | Bore-size landing pages | M | POST | TODO |
| S8-T05 | Dedicated request-a-quote page | M | POST | TODO |
| S8-T06 | Add B2B fields to the lead form | M | POST | TODO |
| S8-T07 | Legal and warranty pages | M | POST | TODO |
| S8-T08 | FAQ blocks with FAQPage schema | M | POST | TODO |
| S8-T09 | Rebrand the cart as a quote list | M | POST | TODO |
| S8-T10 | Apply the Arabic glossary and corrections | M | POST | TODO |
| S8-T11 | Apply the English copy corrections | S | POST | TODO |
| S8-T12 | Move 156 inline strings into the dictionaries | L | POST | TODO |
| S8-T13 | Case studies and projects section | L | POST | TODO |
| S8-T14 | Tender and distributor-application pages | M | POST | TODO |

**Totals:** 119 tasks. 61 required before cutover, 1 is the cutover, 57 after.

---

## Stage 0 — Launch blockers

Things that are broken, ship broken, or make the deploy unsafe. Nothing else starts until this stage is green.

### S0-T01 · Allow `quality={95}` in image config
**Why it matters.** Next 16 rejects any `quality` value not listed in `images.qualities`, which defaults to `[75]`, and returns HTTP 400. Five components request quality 95, so every brand mark, partner logo, agency logo and catalogue cover fails to render in a production build. Development does not show this.
**Files.** `next.config.ts` (no `images.qualities` key today). Call sites: `src/app/[lang]/about/page.tsx:163`, `src/app/[lang]/catalogues/page.tsx:50`, `src/app/[lang]/products/page.tsx:131`, `src/components/PartnerLogos.tsx:110`, `src/components/SuccessPartners.tsx:48`. Enforcement at `node_modules/next/dist/server/image-optimizer.js:654-661`.
**Dependencies.** None.
**Acceptance.** `npm run build && npm start`, then `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/image?url=%2Fimages%2Fbrand%2Fkurlar-mark.png&w=256&q=95"` returns `200`, not `400`.
**Size.** S

### S0-T02 · Fix 3 brand links returning 404
**Why it matters.** The Products page renders seven brand tiles linking to `/{lang}/agents/{id}`, but the agents route knows only five slugs and calls `notFound()` for the rest. Novo, Tormac and Üntel are hard 404s from a primary navigation surface. Conversely `jee-pumps` has a page but no tile, and is not in the agency list at all.
**Files.** `src/app/[lang]/products/page.tsx:41-49` (ids: astral-pipes, pmc, kurlar, alka, novo, tormac, untel), `:117` (the link). `src/app/[lang]/agents/[slug]/page.tsx:11` (slugs: astral-pipes, jee-pumps, pmc, kurlar, alka), `:13-24` generateStaticParams, `:29-31` and `:36-38` the two `notFound()` calls. Source of truth: `src/lib/company.ts` `AGENCIES`.
**Approach.** Derive both the tile list and `agentSlugs` from `AGENCIES` so they cannot diverge again. Where a brand has no dictionary entry in `agentsData`, either add a minimal entry or drop the tile — do not leave a link to a `notFound()`.
**Dependencies.** None. Note the JEE Pumps question in [Open questions](#open-questions).
**Acceptance.** `npm run build` succeeds, then for each of `novo`, `tormac`, `untel`, `astral-pipes`, `pmc`, `kurlar`, `alka`: `curl -s -o /dev/null -w "%{http_code} "` against `/ar/agents/<slug>` returns `200`. No link on `/ar/products` resolves to a 404.
**Size.** M

### S0-T03 · Fix 3 TypeScript errors in the test file
**Why it matters.** `tsc --noEmit` fails, so no CI gate can be added and type regressions cannot be caught. All three errors are in test fixtures, not production code.
**Files.** `src/lib/pump-selector.test.ts:34` (import path ends in `.ts` without `allowImportingTsExtensions`), `:396` and `:397` (two `KmMotor` fixtures missing `voltage`, `rpm`, `currentA`, `startingCurrentA` and four more fields).
**Dependencies.** None.
**Acceptance.** `npx tsc --noEmit` exits 0 with no output. `npx tsx --test src/lib/pump-selector.test.ts` still reports 36 passing, 0 failing.
**Size.** S

### S0-T04 · Replace 7 `dict: any` with a typed Dictionary
**Why it matters.** Seven of the eleven lint errors are `@typescript-eslint/no-explicit-any` on the dictionary prop. Beyond the lint gate, `any` means a renamed or missing dictionary key fails silently at runtime in one locale only — the exact class of bug a bilingual site cannot afford.
**Files.** `src/components/CategoryView.tsx:20`, `ContactForm.tsx:8`, `Footer.tsx:8`, `Header.tsx:12`, `ProductDetailView.tsx:17`, `ProductTabs.tsx:15`, `ServiceCard.tsx:26` (`props: any`). Also the cast at `src/app/[lang]/selector/page.tsx:48`. Add the exported type in `src/app/[lang]/dictionaries.ts`.
**Approach.** Export `type Dictionary = Awaited<ReturnType<typeof getDictionary>>` and narrow each component to the slice it uses (`Dictionary["contactPage"]` rather than the whole object) — this also sets up S4-T09.
**Dependencies.** None.
**Acceptance.** `npx eslint .` reports zero `no-explicit-any` errors. `npx tsc --noEmit` exits 0.
**Size.** M

### S0-T05 · Fix 4 remaining lint errors
**Why it matters.** Three are React Compiler correctness errors, not style. Writing a ref during render and calling setState synchronously in an effect both cause cascading renders and stale values; the compiler flags them because they are real.
**Files.** `src/components/DistributorMap.tsx:176` (ref written during render), `:185` (setState in effect body); `src/components/ContactForm.tsx:26` (setState in effect reading `searchParams`); `src/app/[lang]/services/page.tsx:30` (`prefer-const`). Also remove the stale disable directive at `DistributorMap.tsx:227`.
**Approach.** For ContactForm, take `subject` as a prop from the server page instead of reading it in an effect — this also delivers part of S3-T04.
**Dependencies.** None.
**Acceptance.** `npx eslint .` exits 0 with zero errors. Warnings may remain; note the count.
**Size.** S

### S0-T06 · Fix `hasLocale` prototype-chain bug
**Why it matters.** `locale in dictionaries` walks the prototype chain, so `/constructor`, `/toString`, `/valueOf` and `/__proto__` all pass the locale guard. `getDictionary` then calls `dictionaries["constructor"]()`, which returns `{}`, and the page renders with an empty dictionary instead of 404ing. That is a soft 404 — an indexable, empty, near-duplicate page for any prototype key a crawler tries.
**Files.** `src/app/[lang]/dictionaries.ts:8-9`. Guard consumed at `src/app/[lang]/layout.tsx:89-90`.
**Dependencies.** None.
**Acceptance.** With the dev server running, `/constructor`, `/toString` and `/__proto__` each return HTTP 404. `/ar` and `/en` still return 200.
**Size.** S

### S0-T07 · Add not-found, error and global-not-found pages
**Why it matters.** `notFound()` is called from at least six places and there is no `not-found.tsx` anywhere, so every 404 renders Next's bare English default with no header, footer, locale or route back into the site. There is also no error boundary, so any unhandled Prisma error in the 24 server actions without try/catch shows a raw error page. The app has two root layouts (public and admin), which is precisely the case Next's docs say needs `global-not-found`.
**Files.** New: `src/app/[lang]/not-found.tsx`, `src/app/[lang]/error.tsx`, `src/app/global-not-found.tsx`, `src/app/admin/(dashboard)/error.tsx`. Optionally `src/app/[lang]/[...rest]/page.tsx` calling `notFound()` so unmatched paths inside a locale are caught.
**Dependencies.** S0-T06 (so the locale guard actually reaches these).
**Acceptance.** `/ar/does-not-exist` returns 404 **and** renders the site header, footer and Arabic copy. `/en/products/nonexistent-slug` likewise. Response status is genuinely 404, verified with `curl -I`.
**Size.** M

### S0-T08 · Delete dummy retail filters from category pages
**Why it matters.** Every category page ships placeholder filters copied from a design mock: an "Online Shopping" group listing **Cairo Sales, Sharaf DG and Ehab Center**, a Color group, and a "Shop Now" badge. These name third-party retailers as sales channels for an exclusive-agency B2B distributor. A search engine or answer engine reading the page will state that El Waha sells through Sharaf DG. The Brand checkboxes beside them are also uncontrolled — no `checked`, no `onChange` — and `selectedBrands` is declared at line 25 and never read anywhere in the codebase.
**Files.** `src/components/CategoryView.tsx:62-64` (Shop Now badge), `:78-86` (dead Brand checkboxes), `:90` (the "Dummy Filters" comment), `:94` (retailer list), `:103-105` (Color filter), `:25` (dead state).
**Approach.** Delete the dummy groups outright. Either wire the Brand filter to real filtering or remove it too — do not leave a control that does nothing. Real brand data needs a `brand` field; today `:31` guesses it from `modelNo.split(" ")[0]`, which yields "KP", "8E" and "H07VVH6-F" as brand names.
**Dependencies.** None.
**Acceptance.** `grep -rn "Sharaf DG\|Ehab Center\|Cairo Sales\|Shop Now" src/` returns nothing. Any filter control still rendered visibly changes the product list when used.
**Size.** S

### S0-T09 · Seed the `surface-pumps` category
**Why it matters.** `PRODUCT_CATEGORIES` includes `surface-pumps`, but the seed creates only six categories and skips any product whose category has no row. Two products — the Rovatti and Tormac surface pumps — are silently dropped with a console warning and never appear on the site in any environment. Worse than a missing product: the category is **linked from the header navigation** (`Header.tsx:147`) and has its own category image, so visitors reach an empty page from the main menu. Dictionary entries for both products already exist in `en.json:159,164` and `ar.json:159,164` — only the seed's category list is short.
**Files.** `prisma/seed.ts:14-21` (six slugs, no `surface-pumps`), `:61-65` (the skip). `src/data/categories.ts:9-17` (the seven-slug source of truth). Affected products at `src/data/products.ts:365-366` and `:407-408`.
**Dependencies.** None.
**Acceptance.** After `npx prisma db seed`, `/ar/products/category/surface-pumps` returns 200 and lists both products, and both product detail pages return 200.
**Size.** S

### S0-T10 · Resolve contradictory company facts
**Why it matters.** The About page headline says "Two Decades of Deep-Well Engineering" directly above a subtitle saying "since 2013" — thirteen years. The agency count is hardcoded as eleven in six places while `AGENCY_COUNT` is 12, and the Support page prints both within a few lines of each other. Two different Arabic company names appear. These are the facts a B2B buyer checks first, and they will end up in the meta description and in any structured data built in Stage 1, so they must be right before that work starts.
**Files.** `src/dictionaries/en.json` and `ar.json` `aboutPage.title` (Two Decades), and keys at `:39`, `:276`, `:314` (eleven). `src/lib/company.ts:12` `FOUNDED = 2013`, `:27-28` `AGENCY_COUNT = 12`. `src/app/[lang]/layout.tsx:77-78`, `src/components/Footer.tsx:53-54`, `src/app/[lang]/about/page.tsx:33`, `src/app/[lang]/support/page.tsx:180-182`. Arabic name conflict at `src/components/ProductDetailView.tsx:159` and `src/app/[lang]/about/page.tsx:76` versus `ar.json:28`.
**Approach.** Interpolate `AGENCY_COUNT` and a `yearsOfService()` helper into the dictionary strings via placeholders. Never hardcode either number again.
**Dependencies.** None. Blocks S1-T09.
**Acceptance.** `grep -rniE "two decades|عقدان|eleven|إحدى عشرة" src/` returns nothing. The agency count rendered on `/ar`, `/en`, `/ar/about` and `/ar/support` matches `AGENCY_COUNT` in all four places.
**Size.** S

### S0-T11 · Notify a human when a lead arrives
**Why it matters.** Both public forms write a row to SQLite and stop. There is no email, no WhatsApp message, no webhook anywhere in the repository. A lead is seen only if a staff member happens to open `/admin/leads`. Launching a lead-generation site where leads are invisible is the single most expensive defect in this list.
**Files.** `src/app/api/leads/route.ts:31-41`, `src/app/api/inquiries/route.ts:21-68`. Contact constants in `src/lib/company.ts`.
**Approach.** Simplest reliable option on a VPS is SMTP to the company mailbox plus an optional WhatsApp Cloud API or Telegram push. Send after the DB write, never block the response on it, and log failures. **NEEDS INPUT** — see [Open questions](#open-questions) on which mailbox actually receives mail.
**Dependencies.** S0-T10 (correct contact facts).
**Acceptance.** Submitting the contact form on a staging build results in both a new `Lead` row **and** a received notification. Forcing the notification transport to fail still returns HTTP 200 to the visitor and still persists the lead.
**Size.** M

### S0-T12 · Delete the unreferenced 162 MB image folder
**Why it matters.** `public/website image/` holds 19 files totalling 162 MB that are byte-identical duplicates of files already in `public/images/services/`, and nothing in `src/` references the folder. It ships in every deploy and sits in git history.
**Files.** `public/website image/` (whole directory).
**Approach.** Confirm each file has a match under `public/images/` before deleting. Keep the originals outside the repository or in an untracked `raw/` folder if they are the masters for future crops.
**Dependencies.** None.
**Acceptance.** `grep -rF "website image" src/` returns nothing before deletion. After deletion `npm run build` succeeds and `du -sh public` drops by roughly 162 MB.
**Size.** S

### S0-T13 · Delete Vite scaffold and dead components
**Why it matters.** Nine files from the pre-Next scaffold are still tracked, including a complete old static site at the repository root. ESLint lints them, and `index.html` loads Google Fonts from a CDN, which confuses anyone reading the repo. `PartnerLogos.tsx` is imported nowhere yet contains a 25-year warranty claim and the same broken brand links as S0-T02.
**Files.** `index.html`, `main.js`, `style.css`, `src/main.js`, `src/counter.js`, `src/style.css`, `src/assets/vite.svg`, `src/assets/javascript.svg`, `src/assets/hero.png`, `src/components/PartnerLogos.tsx`. Also the duplicate `public/Catalogue/voltson.pdf`.
**Dependencies.** S0-T02 (confirm PartnerLogos is not being revived as the fix).
**Acceptance.** `npm run build` succeeds and `npx eslint .` exits 0 after removal. `git status` shows only the intended deletions.
**Size.** S

### S0-T14 · Add npm scripts and CI
**Why it matters.** A test suite exists and passes but no `test` script runs it, there is no `typecheck` script, and no CI. Every fix in this plan is unprotected against regression until this lands.
**Files.** `package.json:5-10`. New `.github/workflows/ci.yml`.
**Approach.** Scripts: `test` (`tsx --test`), `typecheck` (`tsc --noEmit`), `lint`. Workflow runs install, `prisma generate`, lint, typecheck, test, build with a throwaway `DATABASE_URL` and `JWT_SECRET`.
**Dependencies.** S0-T03, S0-T04, S0-T05 — CI must be green the day it is added or it will be ignored.
**Acceptance.** `npm run lint && npm run typecheck && npm test && npm run build` all pass locally. The workflow passes on a pushed branch.
**Size.** S

---

## Stage 1 — Discovery layer

Sixteen of eighteen pages currently share one title and one description. Nothing declares a canonical URL, a language alternate, a sitemap or an entity. This stage is what makes the cutover survivable.

### S1-T01 · Add `metadataBase` and site-wide Open Graph defaults
**Why.** Without `metadataBase` every relative Open Graph and canonical URL resolves incorrectly, so later tasks silently produce broken absolute URLs. WhatsApp is this business's main sharing channel and shared links currently preview with no image or title.
**Files.** `src/app/[lang]/layout.tsx:59-83` (returns only title, description, icons today).
**Dependencies.** S0-T10.
**Acceptance.** `curl -s http://localhost:3000/ar | grep -E 'og:|twitter:'` shows `og:title`, `og:description`, `og:locale` (`ar_EG`), `og:site_name` and `twitter:card`.
**Size.** S

### S1-T02 · Build the `seo.ts` canonical + hreflang helper
**Why.** Two full copies of the site exist at `/ar` and `/en` with no signal about their relationship, so they compete with each other. Repeating the alternates object in 18 files guarantees drift; one helper keeps it to a single line per page.
**Files.** New `src/lib/seo.ts`. Consumed by every page in S1-T03 and S1-T04.
**Approach.** Export a function taking a path and returning `alternates: { canonical, languages: { ar, en, "x-default" } }` with `x-default` pointing at the Arabic route, since Arabic is the primary locale and the root redirects there.
**Dependencies.** S1-T01.
**Acceptance.** Unit-callable: given `/products/pump-submersible` and locale `ar` it returns the three expected absolute URLs. Rendered on any page, `curl` shows one `rel="canonical"` and three `rel="alternate" hreflang` tags.
**Size.** M

### S1-T03 · Page metadata for the 8 static routes
**Why.** Home, about, products, contact, catalogues, careers, locations and support all inherit the same title. They are indistinguishable in search results and cannibalise each other.
**Files.** `src/app/[lang]/page.tsx`, `about/page.tsx`, `products/page.tsx`, `contact/page.tsx`, `catalogues/page.tsx`, `careers/page.tsx`, `locations/page.tsx`, `support/page.tsx`.
**Approach.** Titles and descriptions already exist in the dictionaries (`dict.aboutPage.title`, `dict.productsPage.title` and so on). Keep the title under 60 characters before the template suffix — the Arabic suffix alone is 36 characters, so shorten the template in `layout.tsx:65-68` first.
**Dependencies.** S1-T02.
**Acceptance.** For each of the 16 URLs (8 pages × 2 locales), the `<title>` is unique across the set and the description is non-empty and locale-correct. A script that fetches all 16 and asserts no duplicate titles passes.
**Size.** M

### S1-T04 · Page metadata for the 8 dynamic routes
**Why.** Product, category, service, agent and event detail pages are the pages that should rank for specific queries, and they currently carry the site-wide title.
**Files.** `products/[slug]/page.tsx`, `products/category/[category]/page.tsx`, `services/page.tsx`, `services/[slug]/page.tsx`, `agents/page.tsx`, `agents/[slug]/page.tsx`, `events/page.tsx`, `events/[slug]/page.tsx`.
**Approach.** Sources: `product.title`/`product.desc` from `getCatalogProduct` (`src/lib/products.ts:227`), `categoryLabel(dict, category)`, `dict.servicesData[slug]`, `dict.agentsData[slug]`, `dict.eventsData[slug]`.
**Dependencies.** S1-T02, S0-T02 (agent slugs must be settled first).
**Acceptance.** Every product, category, service, agent and event URL in both locales returns a unique title containing the item name. No page returns the layout default.
**Size.** M

### S1-T05 · Fix the selector and cart metadata
**Why.** The selector exports a hardcoded English title, `"Pump Selector | El Waha Pumps"`, which is served on the Arabic route and gets the layout suffix appended, producing a doubled brand name. The cart sets a title only.
**Files.** `src/app/[lang]/selector/page.tsx:23-25`, `src/app/[lang]/cart/page.tsx:9-12`.
**Dependencies.** S1-T02.
**Acceptance.** `/ar/selector` has an Arabic title with the brand name appearing once. `/en/selector` likewise in English.
**Size.** S

### S1-T06 · Add `robots.ts`
**Why.** Nothing currently tells a crawler where the sitemap is or keeps it out of `/admin`, `/api` and `/cart`. The admin login page and its `?next=` parameter variants are fetchable.
**Files.** New `src/app/robots.ts`.
**Approach.** Allow `/`, disallow `/admin`, `/api/`, `/*/cart`, declare the sitemap. AI-crawler policy is a separate task (S3-T02) so the two can be reviewed independently.
**Dependencies.** S1-T07 for the sitemap URL to be real.
**Acceptance.** `curl http://localhost:3000/robots.txt` returns the expected directives and a reachable `Sitemap:` line.
**Size.** S

### S1-T07 · Add `sitemap.ts` with locale alternates
**Why.** Dynamic product, category, service, agent and event pages have no discovery path at all. On a fresh domain-content pairing after cutover, this is how Google finds the new URL scheme quickly.
**Files.** New `src/app/sitemap.ts`. Data sources: `src/data/categories.ts` (7 categories), `getCatalogProducts()`, `src/data/events.ts` (3 events), `serviceSlugs` in `services/[slug]/page.tsx:12-21` (8 services), `agentSlugs`.
**Approach.** Emit both locales for every entry with `alternates.languages` so the sitemap itself carries hreflang. Exclude `/cart`, selector result URLs, `/admin`, `/api`. Match the layout's 60-second revalidate.
**Dependencies.** S1-T02, S0-T02, S0-T09 (surface-pumps must exist or it will be missing from the sitemap).
**Acceptance.** `curl http://localhost:3000/sitemap.xml` validates as XML and contains every product, category, service, agent and event URL in both locales. Count matches a manual count of routes. No `/admin`, `/api` or `/cart` URL appears.
**Size.** M

### S1-T08 · Mark cart and selector results noindex
**Why.** The cart is indexable, and the selector accepts arbitrary flow and head parameters, generating an unbounded space of indexable near-duplicate URLs.
**Files.** `src/app/[lang]/cart/page.tsx`, `src/app/[lang]/selector/page.tsx:29,47`.
**Approach.** `robots: { index: false, follow: true }` on cart. On the selector, noindex only when search parameters are present, and canonicalise to the bare `/selector`.
**Dependencies.** S1-T05.
**Acceptance.** `/ar/cart` and `/ar/selector?q=50&h=100` both emit `<meta name="robots" content="noindex">`. Bare `/ar/selector` does not.
**Size.** S

### S1-T09 · Organization + LocalBusiness + WebSite JSON-LD
**Why.** The WordPress site currently emits a Yoast schema graph. Without this the migration *loses* structured data rather than gaining it, and there is no machine-readable statement of who this company is, where it is, or what it sells.
**Files.** New `src/lib/schema.ts`. Rendered in `src/app/[lang]/layout.tsx`. Data from `src/lib/company.ts`.
**Approach.** Include legal name in both languages, address, geo, both phones, email, `areaServed`, `contactPoint` for sales, `hasCredential` for ISO 9001, and `brand` entries for the represented manufacturers. **NEEDS INPUT** on geo coordinates, social handles and the ISO certificate details — omit any field you cannot verify rather than guessing. A `sameAs` pointing at a dead page is worse than no `sameAs`.
**Dependencies.** S0-T10, S1-T01.
**Acceptance.** The rendered page contains one `application/ld+json` block that passes Google's Rich Results Test with no errors, and every fact in it matches `company.ts`.
**Size.** M

### S1-T10 · Breadcrumb component + BreadcrumbList JSON-LD
**Why.** There are no breadcrumbs anywhere, and a product page has no link to its own category — the only upward link is a "Back to X" button. This hurts both crawl paths and buyer navigation.
**Files.** New shared breadcrumb component. Applied to `products/[slug]`, `products/category/[category]`, `services/[slug]`, `agents/[slug]`, `events/[slug]`. `product.category` is available at `src/lib/products.ts:125`.
**Dependencies.** S1-T09.
**Acceptance.** Each detail page shows a visible breadcrumb and emits matching `BreadcrumbList` JSON-LD that validates. Clicking each crumb reaches a 200 page.
**Size.** M

### S1-T11 · Product / ProductGroup JSON-LD
**Why.** Product pages are the commercial surface. Without Product schema they cannot appear as rich results, and answer engines have no structured statement of specifications, brand or availability.
**Files.** `src/app/[lang]/products/[slug]/page.tsx`, extending `src/lib/schema.ts`. Variant data from `prisma/schema.prisma:63-148`.
**Approach.** `ProductGroup` with `hasVariant` where variants exist, plain `Product` otherwise. Omit `price` — this business quotes on request — but include `availability` and `seller`. **Blocker:** `sku` is null on every product; populate it with the manufacturer model code first or omit the field.
**Dependencies.** S1-T09, S1-T10.
**Acceptance.** A product page with variants and one without both validate in the Rich Results Test with zero errors. No fabricated price appears.
**Size.** M

### S1-T12 · Event and JobPosting JSON-LD
**Why.** Jobs already carry every field `JobPosting` needs. Events cannot be marked up until dates are added, which is a content task.
**Files.** `src/app/[lang]/events/[slug]/page.tsx`, `careers/page.tsx`. Job model at `prisma/schema.prisma:229-254`; event data at `src/data/events.ts` (currently has `year` only, no dates or venue).
**Dependencies.** S1-T09; events blocked on S8-T01 supplying dates.
**Acceptance.** A live job posting validates as `JobPosting`. Event schema ships only once real dates exist.
**Size.** M · **Gate.** POST

### S1-T13 · Open Graph image route
**Why.** Links shared on WhatsApp — the primary channel here — currently preview with no image.
**Files.** New `src/app/[lang]/opengraph-image.tsx`; per-product override using `product.gallery[0]`.
**Dependencies.** S1-T01.
**Acceptance.** `curl -I` on the generated image route returns 200 with an image content type. A product URL pasted into a link preview tool shows the product image, title and description.
**Size.** M

### S1-T14 · Icons, manifest and theme colour
**Why.** No manifest, no apple icon, no theme colour, and the favicon is declared twice — once by file convention and again in the metadata object.
**Files.** `src/app/[lang]/layout.tsx:79-81` (remove the duplicate). New `src/app/apple-icon.png`, `src/app/manifest.ts`, and a `viewport` export with `themeColor` `#0e3b2e`.
**Dependencies.** None.
**Acceptance.** `/manifest.webmanifest` returns valid JSON. The page emits one favicon link and a `theme-color` meta.
**Size.** S

### S1-T15 · Repair heading hierarchy
**Why.** Six `<h3>` elements in the mega-menu appear before every page's `<h1>`. The product page runs h1 → h4 → h3 → h2. The category page wraps its h1 around decorative block elements, which is invalid HTML.
**Files.** `src/components/Header.tsx:207` (mega-menu heads → `<p>`/`<span>`), `ProductDetailView.tsx:130,159,241,349`, `CategoryView.tsx:46-51`, `ProductTabs.tsx:45`, `Footer.tsx:210`, `contact/page.tsx:38`, `events/page.tsx:66`, `agents/page.tsx:59,62`.
**Dependencies.** None.
**Acceptance.** Every page has exactly one `<h1>` and no skipped heading level, verified by an axe or HTML-validator pass on home, a product page, a category page and contact.
**Size.** M

### S1-T16 · Canonicalise `?tab=` and `?subject=` variants
**Why.** `/services` is linked as three different `?tab=` URLs from the home page and its own tab bar, and `?subject=` variants of `/contact` are linked from every product, agent and service page. Each is a crawlable duplicate.
**Files.** `src/app/[lang]/services/page.tsx:8,13,64-85`, `src/app/[lang]/page.tsx:45,71`, `ProductDetailView.tsx:183-184`, `products/page.tsx:165`, `agents/[slug]/page.tsx:170`, `services/[slug]/page.tsx:299`.
**Approach.** Canonical to the parameter-free URL. Consider moving the services tabs to client-side filtering so the crawlable variants stop existing — that also makes `/services` static, which is S4-T12's concern.
**Dependencies.** S1-T02.
**Acceptance.** `/ar/services?tab=supply` emits a canonical pointing at `/ar/services`. Same for `?subject=` on contact.
**Size.** S

---

## Stage 2 — Migration safety

The old site has 61 indexed content URLs in a completely different scheme, including Arabic percent-encoded slugs. Every one of them 404s on the new build today.

### S2-T01 · Freeze a verified inventory of live URLs
**Why.** The redirect map must be built from what is actually indexed today, not from a snapshot taken two days ago. Anything missed becomes a permanent 404 with no way to notice.
**Files.** New `scripts/legacy-urls.txt` (checked in as the source of truth for S2-T02 to S2-T04).
**Approach.** Re-fetch `https://elwahapumps.com/sitemap_index.xml` and every child sitemap, decode the percent-encoding, exclude the Elementor template URLs (`/header/`, `/footer/`, `/ct-mega-menu/`), and record the result. Cross-check against Google Search Console's indexed-pages export if you have access — the sitemap may not list everything Google holds.
**Dependencies.** None. Blocks S2-T02, S2-T03, S2-T04.
**Acceptance.** The file lists every content URL with a proposed target. Count is recorded. Each URL returns 200 on the live WordPress site at the time of capture.
**Size.** S

### S2-T02 · Redirect map — Latin-slug pages
**Why.** These are the straightforward ones: `/about-us/`, `/contact-us/`, `/our-team/`, `/services/`, `/blog/`, `/pmc/`, `/astral-pipes/`, `/jee-pumps/`, `/alka-thurst-bearing/`, `/portfolio/`, `/service/`.
**Files.** `next.config.ts` `redirects()` — currently holds one redirect, for the renamed thrust-bearings category.
**Approach.** Permanent 308s to the Arabic locale, since Arabic is the primary locale and the old site's default language was Arabic.
**Dependencies.** S2-T01, S0-T02 (agent slugs must be final).
**Acceptance.** For each old path, `curl -I http://localhost:3000<path>` returns 308 with a `Location` whose target returns 200.
**Size.** M

### S2-T03 · Redirect map — Arabic percent-encoded slugs
**Why.** Roughly 30 of the 61 URLs have Arabic slugs, including the main product and service category pages. These carry real traffic and are the highest-risk part of the migration.
**Files.** `next.config.ts` `redirects()`.
**Approach.** **Encoding is the trap here.** Next matches on the decoded pathname in some positions and the raw one in others; the source pattern must be written and then tested against a real percent-encoded request, not assumed. Test each one individually. If `redirects()` proves unreliable for these, fall back to handling them in `src/proxy.ts` — but note its matcher is currently `["/", "/admin/:path*"]` and would need widening, which adds per-request cost on every route.
**Dependencies.** S2-T01, S2-T02.
**Acceptance.** `curl -I` against the **percent-encoded** form of each Arabic URL (exactly as it appears in the sitemap) returns 308 to a 200 target. Verified individually, not spot-checked.
**Size.** M

### S2-T04 · Redirect map — 12 `/portfolio/nsp-*` pages
**Why.** Twelve model-specific portfolio pages exist (`nsp-6010`, `6017`, `6030`, `6046`, `6060`, `7077`, `7095`, `7096`, `8112-series`, `8125`, `8160`, `10210`). These are model numbers and likely attract specific searches.
**Files.** `next.config.ts` `redirects()`.
**Approach.** Map each to the nearest real product page rather than dumping all twelve on the category index — a redirect to a relevant page preserves more value than one to a generic list. **NEEDS INPUT** on whether these NSP models map to current Kurlar KP variants.
**Dependencies.** S2-T01.
**Acceptance.** Each of the twelve returns 308 to a 200 product or category page. No two redirect to a page that does not mention the model family.
**Size.** S

### S2-T05 · Change the root redirect to 308
**Why.** `/` currently 307s — temporary — to `/ar`, telling search engines not to transfer signals to the target. For a permanent locale default this should be 308.
**Files.** `src/proxy.ts:22-24`.
**Acceptance.** `curl -I http://localhost:3000/` returns 308 with `Location: /ar`.
**Size.** S

### S2-T06 · Redirect the legacy Yoast sitemap URLs
**Why.** `/sitemap_index.xml` and the child sitemaps are what Google currently polls. Keeping them pointing at the new sitemap speeds rediscovery.
**Files.** `next.config.ts` `redirects()`.
**Acceptance.** `/sitemap_index.xml` 308s to `/sitemap.xml`, which returns 200 valid XML.
**Size.** S

### S2-T07 · Write the post-cutover redirect verification script
**Why.** The redirect map is only correct if it is tested against the real deployment. Doing this by hand across 61 URLs guarantees misses.
**Files.** New `scripts/verify-redirects.mjs`, reading `scripts/legacy-urls.txt`.
**Approach.** For every legacy URL, assert a 308 and then assert the target returns 200. Report a table of failures. Run it against staging before cutover and against production immediately after.
**Dependencies.** S2-T01 to S2-T06.
**Acceptance.** The script runs against a local production build and reports 0 failures across all recorded URLs.
**Size.** M

### S2-T08 · Off-site listing update checklist
**Why.** The live WordPress site publishes a phone number missing a digit, the email typo `info@lwahapumps.com`, and "more than 20 years". Those errors are what search engines and language models currently hold about this company. Fixing the site does not fix the Google Business Profile, Facebook or directory listings.
**Files.** Documentation only — no code.
**Approach.** A checklist covering Google Business Profile, Facebook, YouTube, and any Egyptian B2B directories, each updated to the verified phone, email, address and founding year.
**Dependencies.** S0-T10.
**Acceptance.** Every listed property shows the same NAP as `src/lib/company.ts`.
**Size.** S · **Gate.** GATE

### S2-T09 · CUTOVER — switch DNS and verify
**Why.** This is the gate itself.
**Approach.** Before switching: full production build, `verify-redirects.mjs` green against staging, sitemap and robots reachable, Search Console property prepared for the new structure. After switching: re-run the redirect script against production, submit the new sitemap, request indexing for the top pages, and watch Search Console coverage daily for two weeks.
**Dependencies.** Every PRE task.
**Acceptance.** `scripts/verify-redirects.mjs` reports 0 failures against the live domain. `https://elwahapumps.com/robots.txt` and `/sitemap.xml` both return 200. `/ar` returns 200. Search Console reports no spike in 404s after seven days.
**Size.** M · **Gate.** GATE

---

## Stage 3 — AI-search readiness

Answer engines need a stable entity, facts in the initial HTML, and something to act on. Tasks S3-T01 to S3-T05 are cheap and belong before cutover; the API and dataset work follows.

### S3-T01 · Publish `llms.txt`
**Why.** A single machine-readable summary of who the company is, what it sells, and how to order. Costs almost nothing and is the canonical entry point retrieval systems increasingly look for.
**Files.** New `public/llms.txt`.
**Dependencies.** S0-T10.
**Acceptance.** `curl https://<host>/llms.txt` returns 200 as `text/plain`, and every fact in it matches `company.ts`.
**Size.** S

### S3-T02 · Declare an AI-crawler policy in robots
**Why.** Retrieval crawlers (OAI-SearchBot, ClaudeBot, PerplexityBot) are where B2B enquiry traffic increasingly originates. Leaving the policy implicit means it is decided by defaults rather than by you.
**Files.** `src/app/robots.ts`. Also add `max-snippet:-1` and `max-image-preview:large` via metadata so passages can be quoted in full.
**Dependencies.** S1-T06.
**Acceptance.** `robots.txt` names each crawler group explicitly. `/admin` and `/api/` remain disallowed for all of them.
**Size.** S

### S3-T03 · Render spec tables in HTML, not behind a tab
**Why.** For products with documentation, the specification tables mount only after a client-side tab click, so the most valuable technical content on the site is absent from the initial HTML. Products without documentation do ship their specs, which makes the gap inconsistent as well as invisible.
**Files.** `src/components/ProductDetailView.tsx:55` (tab state), `:213` (the `hasDocs` branch), `:238-345` (the gated tables), `:347-353` (the ungated fallback).
**Approach.** Render both panels and toggle with `hidden` or `<details>`. Keep the tab affordance; never conditionally mount the tables.
**Dependencies.** None.
**Acceptance.** `curl -s /ar/products/pump-submersible | grep -c "<table"` returns a non-zero count matching what the browser shows after clicking Technical Data.
**Size.** M

### S3-T04 · Server-render the home teaser and contact form
**Why.** Both read `useSearchParams` inside a Suspense boundary, so on these prerendered routes a crawler receives the skeleton fallback rather than the products or the form.
**Files.** `src/components/ProductTabs.tsx:84,189-194`, `src/components/ContactForm.tsx:12,171-190`.
**Approach.** Pass `products` to a server-rendered grid; read `subject` from the page's `searchParams` prop and pass it down. This overlaps with the ContactForm half of S0-T05.
**Dependencies.** S0-T05.
**Acceptance.** `curl -s /ar | grep -c "product-card"` returns the expected count. `curl -s "/ar/contact?subject=x" | grep '<form'` finds the form with its fields.
**Size.** M

### S3-T05 · Remove unbacked marketplace trust badges
**Why.** "Buyer Protection", "Nationwide Shipping", "Verified Supplier", "Certified Warranty" and "100% Quality Guaranteed" are asserted with no policy behind them. They are wrong for an exclusive-agency distributor and they are the kind of claim an answer engine will repeat as fact.
**Files.** `src/components/ProductDetailView.tsx:132,162,205-206`, `src/app/[lang]/services/[slug]/page.tsx:275`, and the 25-year warranty claim in `PartnerLogos.tsx:40` (removed by S0-T13).
**Approach.** Replace with verifiable statements: exclusive Egyptian agent, factory warranty, delivery coverage.
**Dependencies.** None.
**Acceptance.** `grep -rniE "buyer protection|nationwide shipping|verified supplier|100% quality" src/` returns nothing.
**Size.** S

### S3-T06 · Add text lists under the logo walls
**Why.** Eighteen client names and twelve agency marks exist only as images with names in alt text. Neither search engines nor answer engines index them as entity relationships.
**Files.** `src/components/SuccessPartners.tsx:43-50`, `src/app/[lang]/about/page.tsx:151-169`.
**Dependencies.** S0-T10.
**Acceptance.** Each agency and client name appears as selectable text in the rendered HTML.
**Size.** S · **Gate.** POST

### S3-T07 · Arabic transliterations for 8 brand names
**Why.** Only four of twelve brands have Arabic forms anywhere. Arabic voice and chat queries for the other eight will not match.
**Files.** `src/lib/company.ts` (brand registry), `src/dictionaries/ar.json`.
**Dependencies.** S8-T01 (you supply the correct transliterations).
**Acceptance.** Each brand's Arabic form appears at least once on its product or brand page.
**Size.** S · **Gate.** POST

### S3-T08 · Standardise Arabic unit notation
**Why.** Cubic metres per hour is written three different ways across product data and dictionaries, which fragments matching.
**Files.** `src/data/products.ts`, `src/dictionaries/ar.json` `productsPage.tableFlow`.
**Dependencies.** S8-T10.
**Acceptance.** One notation appears throughout; the others return no grep hits. Horsepower is always paired with kilowatts.
**Size.** S · **Gate.** POST

### S3-T09 · Public product read API
**Why.** There is no machine-readable product feed. A procurement agent or comparison tool has nothing to consume. A Merchant feed is not viable without prices, so a JSON catalogue is the right target.
**Files.** New `src/app/api/products/route.ts` and `[slug]/route.ts`.
**Dependencies.** S1-T11 (settle the data shape once).
**Acceptance.** `GET /api/products` returns valid JSON with slug, bilingual names, category, specs and canonical URLs, and is listed in `llms.txt` and allowed in robots.
**Size.** M · **Gate.** POST

### S3-T10 · Public pump-selector API
**Why.** The selection engine is pure, tested and genuinely differentiated — the single most agent-worthy asset on the site — but reachable only as HTML.
**Files.** New `src/app/api/selector/route.ts`, wrapping `src/lib/pump-selector.ts`.
**Dependencies.** S3-T09.
**Acceptance.** `GET /api/selector?q=60&qu=m3h&h=120&hu=m` returns the same selection the HTML page shows for those parameters.
**Size.** M · **Gate.** POST

### S3-T11 · Generate `llms-full.txt` at build
**Why.** A hand-maintained full version drifts from the product pages within weeks.
**Files.** Build step generating from the database and dictionaries.
**Dependencies.** S3-T01, S3-T09.
**Acceptance.** Rebuilding after a product edit produces an updated file without manual intervention.
**Size.** M · **Gate.** POST

### S3-T12 · Publish the pump-curve dataset
**Why.** 27 families and 926 variants of head, efficiency and NPSH data with recorded provenance. Published as data with a `Dataset` schema it becomes citable.
**Files.** New public route serving `src/data/pump-curves.json` plus a CSV; `Dataset` JSON-LD.
**Dependencies.** S1-T09. **NEEDS INPUT** on licensing — this is transcribed from Kurlar catalogues.
**Acceptance.** The dataset URL returns 200 and its schema validates.
**Size.** M · **Gate.** POST

---

## Stage 4 — Performance

### S4-T01 · Replace the Unsplash hero with local photography
**Why.** The home page's largest contentful paint is one of three externally hosted Unsplash photographs applied as a CSS background. Being a background, it is invisible to the browser's preload scanner; there is no preconnect to the host; all three load at once; and the site depends on a third party for its first impression. The code's own TODO already flags them as placeholders showing other companies' installations. The `remotePatterns` config allows only `elwahapumps.com`, so they cannot even be moved to `next/image` without a config change.
**Files.** `src/components/Hero.tsx:14-25` (the URLs), `:31-36` (the 6-second rotation), `:52` (the background style). Replacement photography exists in `public/images/services/`.
**Approach.** Render as stacked `next/image` with `fill`, `preload` on the first slide only, `sizes="100vw"`, and lazy-mount the rest. Keep the crossfade in CSS.
**Dependencies.** S4-T04 (use the re-encoded files, not the 20 MB originals).
**Acceptance.** No `unsplash.com` reference remains in `src/`. Lighthouse on `/ar` reports the LCP element as a local image and LCP improves measurably against a recorded baseline.
**Size.** M

### S4-T02 · Remove or session-gate the splash screen
**Why.** A full-screen overlay covers the page for roughly 1.8 seconds on every hard load, with no session gate. For buyers reading on phones between jobs this is pure cost. It is also one of only two reasons framer-motion is in the shared bundle.
**Files.** `src/components/SplashScreen.tsx:13` (initial state), `:15-21` (1200 ms hold), `:30` (600 ms exit). Mounted at `src/app/[lang]/layout.tsx:101`.
**Approach.** Preferred: remove it. If it stays, gate on `sessionStorage`, cap at 600 ms, and use CSS keyframes rather than framer.
**Dependencies.** None. Enables S4-T03's dependency removal.
**Acceptance.** A second page load in the same session shows no splash. LCP on `/ar` improves against baseline.
**Size.** S

### S4-T03 · Replace the framer page transition with CSS
**Why.** `template.tsx` wraps every page in a framer `motion.div` animating opacity and position, which puts framer-motion in every route's JavaScript for an effect CSS does natively. With S4-T02 done, the dependency can be dropped entirely.
**Files.** `src/app/[lang]/template.tsx:3,12-17`. New keyframes in `src/app/globals.css`.
**Approach.** Also move the header offset out of the template — it belongs with S5-T01, not with a transition.
**Dependencies.** S4-T02 (the only other importer).
**Acceptance.** `grep -rn "framer-motion" src/` returns nothing and the package is removed from `package.json`. Page transitions still animate, and respect `prefers-reduced-motion`.
**Size.** S

### S4-T04 · Re-encode oversized source photographs
**Why.** Around thirty photographs are 6000×4000 at 12 to 20 MB each. Browsers never download them because `next/image` intervenes, but the server must decode a 24-megapixel JPEG for every size and format on first request — seconds of CPU and a large memory spike per variant on a small VPS — and the deploy carries 375 MB of images.
**Files.** `public/images/services/` (about 165 MB), `public/images/events/` (about 156 MB), `public/images/about/`, `public/images/support/`.
**Approach.** Batch to a 2400 px long edge at about 85% quality, roughly 300 to 500 KB each. Lowercase the twenty uppercase `.JPG` filenames at the same time — case-sensitive Linux hosts make that a latent breakage — and update `src/data/events.ts` references together.
**Dependencies.** S0-T12 (delete duplicates before re-encoding, not after).
**Acceptance.** No file under `public/images` exceeds 1 MB. Every image referenced in `src/` still resolves; `npm run build` succeeds and no page shows a broken image.
**Size.** M

### S4-T05 · Image formats, cache TTL and asset headers
**Why.** Only WebP is configured, there is no AVIF, and no cache headers exist for static assets or the PDF catalogues, which are served raw at 86 MB total.
**Files.** `next.config.ts` — add `images.formats`, `images.minimumCacheTTL`, and a `headers()` block for `/images/:path*` and `/Catalogue/:path*`. The unused `remotePatterns` entry can go once S4-T01 lands.
**Dependencies.** S0-T01 (same config file, sequence to avoid conflicts), S4-T01.
**Acceptance.** `curl -I` on an image returns a long-lived `Cache-Control`. An AVIF variant is served to a browser that accepts it.
**Size.** S

### S4-T06 · Rename deprecated `priority` to `preload`
**Why.** `priority` is deprecated in Next 16 and warns on every build. The codebase is mid-migration — `Logo.tsx` already uses `preload` correctly at three call sites, three page-level images do not. One of those three is on an image hidden below the `md` breakpoint, so mobile visitors preload an image they never see.
**Files.** `src/app/[lang]/about/page.tsx:80`, `support/page.tsx:55`, `services/[slug]/page.tsx:192` (the hidden one, gated at `:181-192`).
**Dependencies.** None.
**Acceptance.** `grep -rn "priority" src/` returns no `next/image` usage. `npm run build` emits no deprecation warning. On a mobile viewport, the network panel shows no preload of the hidden second service photo.
**Size.** S

### S4-T07 · Add `sizes` to unsized fill images
**Why.** A `fill` image without `sizes` makes the browser assume full viewport width, so an 80 px thumbnail downloads a device-width variant.
**Files.** `src/components/ProductDetailView.tsx:95,111`, `src/components/cart/CartView.tsx:105`.
**Dependencies.** None.
**Acceptance.** Thumbnails request a variant at or near 80 px in the network panel, not a full-width one.
**Size.** S

### S4-T08 to S4-T13 · Post-cutover performance work
- **S4-T08** Stop double-rendering the header logo — `Header.tsx:117-121` renders it twice behind `display:none` wrappers, so both download, while a 19 KB SVG of the same mark sits unused at `public/images/brand/elwaha-mark.svg`. **S**
- **S4-T09** Pass dictionary slices — the full 43 KB Arabic dictionary is serialised into every page's payload via `dict` props (`layout.tsx:102` and four components). Depends on S0-T04. **M**
- **S4-T10** Lighter product DTO for list pages — the home teaser ships full variant rows and specs for every product and renders them twice for the marquee (`ProductTabs.tsx:159`, `lib/products.ts:166-206`). **M**
- **S4-T11** Trim font subsets — about ten woff2 files preload; Plex Arabic carries a redundant Latin subset that Archivo already covers (`layout.tsx:20-39`). **S**
- **S4-T12** Prebuild product and category pages with `generateStaticParams` so first visitors do not trigger a cold regeneration; make `/services` static by moving tab filtering client-side. **S**
- **S4-T13** Query one product instead of the whole catalogue — `getCatalogProduct` loads everything then filters in JavaScript (`lib/products.ts:214-241`); the header mega-menu does the same on every render. **S**

---

## Stage 5 — Design system consolidation

`globals.css` documents a real system — five brand colours with approved pairings and their contrast ratios, a type scale with an Arabic uplift, mono spec labels, square corners. Header, Footer, About, Careers, Catalogues and Locations follow it. The home page, product detail, category view and selector use three other idioms. Measured across `src/`: 508 `neutral-`, 232 `emerald-`, 30 `sky-`, 41 `rounded-xl`, 26 `rounded-2xl`, 12 `rounded-3xl` against 111 `pine`, 106 `bone`, 65 `brass` — legacy outweighs brand roughly 2.7 to 1.

Per your decision, only breakage fixes ship before cutover; the migration follows.

### S5-T01 · Fix the fixed-header offset across all pages
**Why.** The fixed header is roughly 136 px tall on desktop, but non-home pages are offset by only 72 to 80 px, so the top of every inner page header band sits behind the header. Five pages patch this ad hoc with different values; three do not patch it at all.
**Files.** `src/app/[lang]/template.tsx:16` (the offset), `src/components/Header.tsx:85-118`, `src/components/Logo.tsx:26,74`, `src/app/globals.css:207` (`scroll-padding-top`), `src/app/[lang]/services/page.tsx:62` (sticky tab bar with a hardcoded top). Ad hoc patches: `products/page.tsx:57`, `careers/page.tsx:182`, `catalogues/page.tsx:122`, `cart/page.tsx:20`, `ProductDetailView.tsx:85`. Unpatched: `about/page.tsx:43`, `contact/page.tsx:17`, `events/page.tsx:19`.
**Approach.** Either make the header sticky in flow on non-home pages so no offset is needed, or expose a `--header-h` custom property consumed by the template, the scroll padding and the sticky bar. Remove all ad hoc patches in the same change.
**Dependencies.** S4-T03 (both touch `template.tsx`).
**Acceptance.** At 1440 px and at 375 px, the top of the header band is fully visible on about, contact, events, products, careers, catalogues, cart and a product page. Anchor links land below the header, not behind it.
**Size.** M

### S5-T02 · Fix RTL direction bugs in Hero and CategoryView
**Why.** These are not polish; they are broken layout in the primary locale. The Hero adds `justify-end` when Arabic, but under `dir="rtl"` flex-end is the left edge, so the Arabic call-to-action buttons sit on the opposite side from the headline they belong to. The category page applies `md:flex-row-reverse` when Arabic, which undoes the RTL flow and puts the sidebar on the left in *both* languages, and its back link combines a reversed row with a rotated arrow so the arrow ends up pointing away from the text.
**Files.** `src/components/Hero.tsx:67,71,86,104`; `src/components/CategoryView.tsx:37,40-41,135,160-161`.
**Approach.** Delete the `isAr` layout ternaries — `dir` already handles it. Keep a ternary only for the background gradient direction, which has no logical equivalent.
**Dependencies.** None.
**Acceptance.** Side-by-side screenshots of `/ar` and `/en`: hero buttons sit on the same side as the headline in both, and the category sidebar is on the right in Arabic and the left in English.
**Size.** S

### S5-T03 · Isolate phone numbers from bidi reordering
**Why.** Five phone numbers lack `dir="ltr"`, so in Arabic the bidi algorithm moves the leading plus sign to the end and the number renders as `20 106 668 5532+`. The Footer and Careers pages already do this correctly, so the fix is to apply the existing pattern.
**Files.** `src/components/Header.tsx:405-407`, `src/app/[lang]/page.tsx:210`, `agents/[slug]/page.tsx:185`, `contact/page.tsx:68-73`.
**Dependencies.** None.
**Acceptance.** On `/ar`, every phone number renders with the plus sign leading.
**Size.** S

### S5-T04 to S5-T14 · Post-cutover consolidation
- **S5-T04** Build the primitives: `Button` (replacing eight distinct primary-button recipes), `Card`, `PageBand`, `SectionHead`, `SpecPlate`, all on brand tokens. **L**
- **S5-T05** Migrate the home page — currently emerald rounded buttons inside pine sections, plus two different eyebrow styles. **M**
- **S5-T06** Rebuild the product detail page: spec plate first (model, brand, flow, head, horsepower, catalogue), one primary "Request a quote" and one secondary call action, replacing the marketplace layout. Depends on S5-T04, S6-T07. **L**
- **S5-T07** Migrate the category view, including a real brand facet. Depends on S0-T08. **M**
- **S5-T08** Migrate cart and contact. **M**
- **S5-T09** Migrate services, events, agents and support. **L**
- **S5-T10** Re-skin the selector from its black-and-sky-blue idiom into brand colours, including the hard-coded chart hexes in `PerformanceChart.tsx:128-181`. **M**
- **S5-T11** Convert 31 physical-direction utilities across 11 files to logical properties, which removes 29 `rtl:` patch classes. Depends on S5-T02. **M**
- **S5-T12** Delete the Material-3 aliases and the emerald, neutral and sky utilities once nothing uses them. Depends on S5-T05 to S5-T10. **M**
- **S5-T13** Restructure navigation — Services and Contact are absent from the primary nav, "Local Dealer" points at brand pages while the distributor map lives under Locations, and one concept is called Agents, Agencies, Partners, Brands and Distributors in different places. Add the unused lockup wordmark. **M**
- **S5-T14** Standardise the type scale and container widths; replace 19 uses of `font-black` (Archivo loads only to 800, so 900 is synthesised) and raise sub-11 px text. **M**

---

## Stage 6 — Accessibility

### S6-T01 · Fix 6 pine-on-black contrast failures
**Why.** `globals.css:61` remaps `--color-emerald-500` to the pine hex as a migration shim. Six page header bands set `text-emerald-500` on a black background, so the eyebrow text renders pine on black at about 1.6 to 1 — effectively invisible. The brand documentation at `globals.css:48` already forbids green on green; this is its side effect.
**Files.** `src/app/[lang]/agents/page.tsx:27`, `contact/page.tsx:19`, `events/page.tsx:21`, `services/page.tsx:49`, `support/page.tsx:61` and `:179` (on neutral-900).
**Approach.** Replace these black bands with the pine band and brass spec-label treatment that About and Careers already use — one pattern, six call sites.
**Dependencies.** None.
**Acceptance.** Each of the six eyebrows measures at least 4.5 to 1 against its background in browser devtools.
**Size.** S

### S6-T02 · Fix interactive and body-text contrast failures
**Why.** Nine more pairs fail: brass on white at 2.16 and on bone at 1.98 for header hover states, white on the WhatsApp green at 1.98 on the cart's send button, `neutral-400` on white at 2.52 used for labels and metadata across many pages, `neutral-600` on black at 2.69, `stone-light` at 3.48 for captions, the red required-field asterisk at 3.76, and bone at 50% opacity on pine at 4.06 for footer links.
**Files.** `src/components/Header.tsx:96,236,302,312`; `cart/CartView.tsx:194,208`; `contact/page.tsx:49,64,84,99,111`; `CategoryView.tsx:40,139,150`; `events/page.tsx:69`; `selector/page.tsx:159`; `Footer.tsx` language links.
**Approach.** Hover to field or pine on light grounds and keep brass for dark grounds only, as the brand doc specifies. Cart send button to pine on bone. Replace `neutral-400` body text with `stone` (6.9 to 1).
**Dependencies.** S6-T01.
**Acceptance.** An axe scan of home, a product page, a category page, contact and cart reports zero contrast violations.
**Size.** M

### S6-T03 · Make the mega-menu keyboard reachable
**Why.** The Products submenu is revealed by `group-hover` alone. Keyboard users can never open it; on touch, tapping the trigger navigates away instead. It is the primary route into the catalogue.
**Files.** `src/components/Header.tsx:184,198`.
**Approach.** Add `group-focus-within` alongside the hover state plus `aria-haspopup` and `aria-expanded`, or make the chevron a separate button that toggles state and closes on Escape.
**Dependencies.** None.
**Acceptance.** Tabbing to Products reveals the menu; every item inside is reachable by keyboard; Escape closes it and returns focus to the trigger.
**Size.** M

### S6-T04 · Give the mobile drawer a focus trap and Escape
**Why.** The drawer has no focus trap, no Escape handler and no scroll lock, and it uses `aria-hidden` on a container whose links remain focusable — the focusable-but-hidden pattern, which strands keyboard and screen-reader users in an invisible menu.
**Files.** `src/components/Header.tsx:335-341,358-391`.
**Approach.** Use `inert` rather than `aria-hidden` (React 19 supports it), add an Escape handler, lock body scroll while open, move focus to the close button on open and restore it on close.
**Dependencies.** S6-T03.
**Acceptance.** With the drawer closed, tabbing never reaches a drawer link. With it open, focus cycles within the drawer, Escape closes it, and focus returns to the toggle. The page behind does not scroll.
**Size.** M

### S6-T05 · Add a skip link
**Why.** A fixed header with ten-plus links and a mega-menu precedes the content on every page, with no way to bypass it.
**Files.** `src/app/[lang]/layout.tsx:98-113`.
**Acceptance.** The first Tab press on any page reveals a visible skip link that moves focus to the main content.
**Size.** S

### S6-T06 · Label cart inputs and announce form results
**Why.** The cart's name and phone inputs have placeholders only — no label, no `aria-label`, no `autocomplete`, no `type="tel"`. The contact form discards the server's validation message entirely (`throw new Error(status)`), its status banners have no `aria-live` and are never focused, and the required marker is a colour-only asterisk at 3.76 to 1.
**Files.** `src/components/cart/CartView.tsx:177-188`; `src/components/ContactForm.tsx:40-52,61-71,75-77,86`; `src/app/api/leads/route.ts:22-27`.
**Approach.** Visible labels and `autoComplete` on the cart inputs. Parse and display the returned error, add `role="status"` with `aria-live="polite"` to banners, focus the banner on success, and add textual "(required)" markers.
**Dependencies.** S0-T05, S3-T04 (both touch ContactForm — sequence them).
**Acceptance.** Screen reader announces each cart field. Submitting the contact form with an invalid phone shows the server's specific message and announces it.
**Size.** M

### S6-T07 to S6-T12 · Post-cutover accessibility work
- **S6-T07** Implement the ARIA tabs pattern for the product category tabs and the Overview/Technical tabs — currently plain buttons with no roles, `aria-selected` or arrow-key navigation (`ProductTabs.tsx:128-140`, `ProductDetailView.tsx:216-236`). Depends on S3-T03. **M**
- **S6-T08** Rebuild the event lightbox on native `<dialog>` with `showModal()` for a free focus trap and Escape; today it has no dialog role, no focus management, and a mouse-only backdrop close (`EventGallery.tsx:56-110`). **M**
- **S6-T09** Hero carousel: dots are 3 px tall against a 24 px minimum target, it auto-advances every 6 seconds with no pause control, and neither it nor the framer transitions respect `prefers-reduced-motion` (`Hero.tsx:31-36,104-116`). Depends on S4-T01. **M**
- **S6-T10** Marquees become unreachable under reduced motion — the animation stops but nothing scrolls, and the home teaser is the only product surface on the home page (`ProductTabs.tsx:147-165`, `SuccessPartners.tsx:33`, `globals.css:404-415`). **S**
- **S6-T11** Move English-only aria-labels into the dictionaries; include the item count in the cart label; remove the double announcement on the logo link. **S**
- **S6-T12** Remove the nested `<main>` on category pages (`CategoryView.tsx:117` inside `layout.tsx:105`). **S**

---

## Stage 7 — Code and security hardening

The authorization model is genuinely good: all seventeen admin pages and all twenty-four mutating server actions independently re-check the session, inputs are validated with zod, there is no raw SQL and no `dangerouslySetInnerHTML`. What is missing is everything an attacker or a spam bot tries first.

### S7-T01 · Add HTTP security headers
**Why.** `next.config.ts` has no `headers()` at all: no HSTS, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`, no frame protection on the admin area.
**Files.** `next.config.ts`.
**Approach.** Start with HSTS, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `frame-ancestors 'none'` on `/admin/:path*`. Introduce a Content Security Policy in report-only mode first — maplibre needs `worker-src blob:` and `img-src data: blob:`.
**Dependencies.** S0-T01, S4-T05 (same file).
**Acceptance.** `curl -I https://<host>/` shows each header. The admin area cannot be framed. Nothing in the console breaks under the report-only policy.
**Size.** S

### S7-T02 · Enforce JWT secret strength and cookie prefix
**Why.** The secret fails closed when absent, which is correct, but any non-empty value is accepted — including the literal `"change-me"` shipped in `.env.example`. The session cookie also lacks the `__Host-` prefix despite already meeting its requirements.
**Files.** `src/lib/session.ts:12-16,42-48`; `.env.example:11`.
**Acceptance.** Starting the app in production mode with a short secret refuses to boot with a clear message. The cookie is named with the `__Host-` prefix and sessions still work.
**Size.** S

### S7-T03 · Throttle admin login and close the timing oracle
**Why.** No rate limit, no lockout, no delay. With bcrypt at cost 10 each attempt costs about 100 ms, which makes online brute force practical against a documented default account. Separately, `bcrypt.compare` runs only when the email exists, so response time reveals which addresses are valid despite the uniform error message.
**Files.** `src/lib/actions/auth.ts:19-49`. The timing oracle is precise: `:33` returns before `:35` reaches `verifyPassword`, so an unknown email returns in database-lookup time while a known one pays the full bcrypt cost. The comment at `:30-31` claims enumeration resistance through identical error messages; the timing channel defeats it.
**Approach.** Per-IP and per-email throttling — in-memory is adequate for a single VPS. On an unknown email, still compare against a constant dummy hash. **Build the throttling primitive here and reuse it in S7-T04** — the login lockout and the public-form rate limit need the same thing, and two separate implementations would be a waste and a divergence risk.
**Dependencies.** None. Provides the shared primitive for S7-T04, so sequence this first.
**Acceptance.** Eleven failed attempts from one address are refused with a throttle message. Response times for a known-invalid and a known-valid email are within noise of each other across twenty samples.
**Size.** M

### S7-T04 · Protect the two public POST endpoints
**Why.** Both write a database row per request with no throttle, honeypot, CAPTCHA or Origin check. A trivial script fills the CRM with junk and buries real enquiries — which matters more once S0-T11 turns every row into a notification.
**Files.** `src/app/api/leads/route.ts:13-43`, `src/app/api/inquiries/route.ts:21-68`, `src/components/ContactForm.tsx`.
**Approach.** Hidden honeypot field plus a minimum submit time, per-IP throttling **reusing the primitive built in S7-T03**, and an Origin or `Sec-Fetch-Site` check. Normalise phone and email before storing so deduplication works. What already exists and should be kept: both routes validate with zod (`leads/route.ts:5-11`, `inquiries/route.ts:5-19`), and `inquiries/route.ts:41-55` re-prices the cart server-side from the database and ignores the client's `unitPrice` — that part is sound.
**Dependencies.** S0-T11, S7-T03 (the shared rate-limiting primitive).
**Acceptance.** A scripted burst of twenty submissions is throttled. A submission with the honeypot filled returns 200 but writes no row. A cross-origin POST is rejected.
**Size.** M

### S7-T05 · Force a password change for the seeded admin
**Why.** The seed creates `admin@elwahapumps.com` with a password documented in the README, and nothing requires changing it. Combined with no login throttle it is the most direct path into the CRM.
**Files.** `prisma/seed.ts:26-27`; `prisma/schema.prisma` (add a `mustChangePassword` field); `src/app/admin/(dashboard)/layout.tsx` (redirect while set).
**Approach.** Also make the seed refuse the default password when `NODE_ENV=production`.
**Dependencies.** S7-T06 (bundle the migrations).
**Acceptance.** A freshly seeded admin is redirected to a change-password screen and can reach no other admin page until it is changed.
**Size.** M

### S7-T06 · Add the missing database indexes
**Why.** SQLite does not index foreign keys automatically, and the admin list queries filter and sort on unindexed columns.
**Files.** `prisma/schema.prisma` — `Lead` (166-182), `CartInquiry` (184-197), `Activity` (256-267), `Customer` (150-164) all have **zero** indexes; `Product` (63-92) has only the unique on `slug`. One new migration. The datasource block (`:5-7`) declares no `url`; it is supplied by `prisma.config.ts`, which loads `dotenv`. Verified working in this worktree — `npx prisma generate` followed by `npx prisma migrate deploy` applied all four existing migrations cleanly with a local `.env` present. This is also why `dotenv` sitting in devDependencies is a deploy risk (S7-T16): `npm ci --omit=dev` would break exactly this command.
**Approach.** Indexes on `Lead(status, createdAt)`, `Lead(assignedToId)`, `Lead(customerId)`, `CartInquiry(status, createdAt)`, `CartInquiry(customerId)`, `Activity(leadId)`, `Activity(customerId)`, `Activity(authorId)`, `Product(isActive, categoryId)`. `Customer` was not in the audit but has the same shape and the same admin query pattern.
**Acceptance.** `npx prisma migrate deploy` applies cleanly. Admin list pages still render correct data.
**Size.** S

### S7-T07 · Stop the seed clobbering admin product edits
**Why.** Re-running the seed overwrites names, descriptions, images and specifications on every existing product, silently destroying edits made through the admin interface. The database is the runtime source of truth; the static file is a one-time fixture.
**Files.** `prisma/seed.ts:77-99` (the upsert `update` block).
**Approach.** Make the product upsert create-only, or gate the overwrite behind an explicit flag. Document in the README that `src/data/products.ts` is a fixture, not live data.
**Dependencies.** S0-T09 (both touch the seed).
**Acceptance.** Edit a product name in the admin, re-run the seed, and confirm the edit survives.
**Size.** S

### S7-T08 · Centralise the contact constants
**Why.** `WHATSAPP_PHONE` is never read — no `process.env.WHATSAPP_PHONE` exists anywhere in the codebase. But it is set in `.env.example:13`, set in the real gitignored `.env:13`, and `README.md:157` instructs operators to configure it on the host alongside `DATABASE_URL` and `JWT_SECRET`. So it is genuinely provisioned at runtime and silently ignored: an operator who changes the company's WhatsApp number in the host environment, exactly as the deploy documentation tells them to, changes nothing on the site. The number is hardcoded across **17 files at 22 call sites**.
**Files.** `src/lib/company.ts` (add the constant). Call sites: `WhatsAppButton.tsx:10`, `cart/CartView.tsx:11`, `Footer.tsx:145`, `Header.tsx:288,397`, `ProductDetailView.tsx:191`, `src/data/jobs.ts:14`, `support/page.tsx:20,21`, `contact/page.tsx:68`, `services/[slug]/page.tsx:227,234`, `catalogues/page.tsx:213`, `products/page.tsx:174`, `agents/[slug]/page.tsx:181`, `[lang]/page.tsx:206`, `locations/page.tsx:96`. Also `index.html:71,75,230,240` — removed by S0-T13.
**Dependencies.** S0-T10, S0-T13.
**Acceptance.** `grep -rn "201066685532" src/` matches only `company.ts`. Every WhatsApp and telephone link on the site still resolves correctly. Decide whether to keep the env var and read it, or delete it from `.env.example` and the README — do not leave a documented setting that does nothing.
**Size.** S

### S7-T09 · Enable SQLite WAL and nightly backups
**Why.** On the chosen VPS the database is a single file with backups left to the host. Write-ahead logging also improves concurrency when several staff use the admin at once.
**Files.** `src/lib/prisma.ts:12`; new `scripts/backup-db.ts`; README deployment section.
**Acceptance.** WAL is confirmed active. The backup script produces a restorable copy, and a documented restore has been performed once on staging.
**Size.** M

### S7-T10 to S7-T16 · Post-cutover hardening
- **S7-T10** Make sessions revocable — seven-day stateless tokens survive logout, password reset and account deletion, so a removed staff member keeps access for up to a week. Add a `sessionVersion` checked per request and shorten the lifetime. **M**
- **S7-T11** Standardise the server-action error contract — thirteen void actions return silently on invalid input so the admin sees nothing, and `assignLead` does not validate its user id, turning a bad value into a 500. **M**
- **S7-T12** Paginate and search the admin lists — all three cap at 200 rows with no pagination, so records beyond that become invisible. **M**
- **S7-T13** Add instrumentation — no server logging, no error reporting, no health endpoint, no analytics. Add `instrumentation.ts` with `onRequestError`, a health route, and a privacy-respecting analytics script. **M**
- **S7-T14** Validate cart state from localStorage — `cartStore.read` checks only that the value is an array, so a malformed entry reaches React and can crash the cart page. **S**
- **S7-T15** Validate admin-entered image URLs — free-text paths with a host outside `remotePatterns` make `next/image` throw, and with no error boundary the product page 500s. Depends on S0-T07. **S**
- **S7-T16** Resolve dependency placement — `dotenv` is a dev dependency but `prisma.config.ts` needs it at deploy time, so `npm ci --omit=dev` breaks migrations; remove the redundant `@types/bcryptjs`; align `@types/node` with the required Node 24 and add an `engines` field. **S**

---

## Stage 8 — Content and conversion

You supply the copy. Every task here builds the structure, the schema and the content slots, then hands you a brief. **No task in this stage invents a factual claim about the business.**

### S8-T01 · Write the content brief for you to fill
**Why.** Everything else in this stage is blocked on copy, facts and decisions only you hold. One brief collected up front avoids fourteen separate interruptions.
**Approach.** A single document requesting: brand descriptions and Arabic transliterations for the represented manufacturers; event dates and venues; ISO certificate number, body and scope; commercial register and tax numbers; the legal entity form; real office hours; warranty terms; five to ten project case studies; the FAQ questions your sales team actually gets; and confirmation of which mailbox receives enquiries.
**Acceptance.** The brief is delivered and every [Open question](#open-questions) below has an answer.
**Size.** M

### S8-T02 to S8-T14 · Structure work, unblocked by the brief
- **S8-T02** Brand page shells for the represented manufacturers, generated from one registry so the tile list, the route slugs and the schema cannot diverge again. Today four brands have pages, one of them (JEE Pumps) is not an agency at all, and Aristoncavi has no copy anywhere. Depends on S0-T02, S8-T01. **L**
- **S8-T03** Application and solution page shells — agricultural irrigation, drinking water, industrial, solar pumping. Eighteen named farm clients and lead-free certification copy exist with no page to hold them. **M**
- **S8-T04** Bore-size landing pages (4, 6, 8 and 10 inch) wired to the selector — the highest-intent query, and the data already exists in the model groups. **M**
- **S8-T05** A dedicated request-a-quote page, replacing the generic contact form reached with a `?subject=` parameter. **M**
- **S8-T06** Add B2B fields to the lead form — company, governorate, application, well depth and yield, quantity, optional attachment. Depends on S0-T11, S7-T04. **M**
- **S8-T07** Legal and warranty pages: privacy, terms, warranty, plus a footer legal line with the entity form and registration numbers. Depends on S8-T01. **M**
- **S8-T08** FAQ blocks with `FAQPage` schema on home, products, selector and support. Depends on S8-T01, S1-T09. **M**
- **S8-T09** Rebrand the cart as a quote list and settle on one primary call to action per page — the product page currently offers four competing actions. Depends on S5-T06. **M**
- **S8-T10** Apply the Arabic glossary and corrections: one term each for pump, motor, submersible, head and flow; fix the three nominative-plural errors; correct the mistranslation of submersible motor cable as marine cable. Depends on S8-T01. **M**
- **S8-T11** Apply the English corrections — the Arabic-influenced phrasing, "Book Now" as a business call to action, "Get Latest Price", and the generic home copy. **S**
- **S8-T12** Move 156 inline `lang === "ar"` string ternaries into the dictionaries so localisation can be reviewed as a whole. Depends on S0-T04. **L**
- **S8-T13** Case studies and projects section — "230+ projects" is claimed and none are shown. Depends on S8-T01. **L**
- **S8-T14** Tender and become-a-distributor pages. Depends on S8-T01. **M**

---

## Verification

**Per task.** Each task's acceptance criterion is the command to run. Nothing is marked DONE without it passing.

**Per stage.**
```bash
npm run lint && npm run typecheck && npm test && npm run build
```
plus a manual pass over `/ar` and `/en` for home, a product page, a category page, contact and cart.

**Before the cutover gate.**
1. `npm run build` clean, no deprecation warnings.
2. `node scripts/verify-redirects.mjs --target=<staging>` reports zero failures.
3. `curl` every route in both locales; assert unique titles and one canonical each.
4. Sitemap validates and its URL count matches a manual route count.
5. Rich Results Test passes on the home page, a product page and a category page.
6. Lighthouse on `/ar` mobile: record the scores as the baseline to beat.
7. axe scan on five representative pages: zero critical violations.
8. Submit both public forms and confirm a notification arrives.
9. Sign in to the admin, confirm the forced password change, confirm throttling.

**After cutover.** Re-run the redirect script against production, submit the sitemap, and watch Search Console coverage daily for two weeks. A rise in 404s means a URL was missed in S2-T01.

---

## Audit corrections

Verified against the working tree on 7 September 2026. Everything material in the audit holds; five points needed refinement.

1. **Route count.** The audit said 19 routes with 16 lacking metadata. There are **18** `page.tsx` files under `src/app/[lang]`; 16 have no metadata and the 2 that do carry only a title. The plan uses 18.
2. **The `hasLocale` bug is worse than described, in a different way.** The audit predicted a 500. It actually renders the page with an **empty dictionary** — a soft 404, which is worse for search: an indexable, near-empty, near-duplicate page for every prototype key. Raises the priority of S0-T06.
3. **The `priority` deprecation is partly already fixed.** `Logo.tsx` uses `preload` correctly at three call sites; only three page-level images still use the deprecated prop. The codebase is mid-migration, not untouched.
4. **Spec-table gating is conditional.** Tables are client-gated only when `hasDocs` is true; products without documentation render their specs in the initial HTML. The inconsistency is itself worth fixing, but the scope is smaller than stated.
5. **The category Brand filter is worse than described.** The audit noted `selectedBrands` was never read. The checkboxes are also fully uncontrolled — no `checked`, no `onChange` — so the control is inert in both directions.

**Not in the audit, found during verification:**

- The proxy matcher is `["/", "/admin/:path*"]`, so it will not see the legacy WordPress paths. The redirect map must live in `next.config.ts`; widening the matcher instead would add per-request cost on every route. This shapes S2-T03.
- The empty `surface-pumps` category is **linked from the header navigation** (`Header.tsx:147`), so the missing seed row produces a dead-end page reachable from the main menu, not just an unreachable product. Raises S0-T09 from tidy-up to a visible defect.
- `Customer` has no indexes either — not mentioned in the audit, same shape and query pattern as `Lead`. Added to S7-T06.
- The About page interpolates `AGENCY_COUNT` correctly at `:33`, printing "12" a few hundred pixels from a paragraph reading "eleven" (`aboutPage.p3`). The contradiction is visible on a single screen.
- `layout.tsx:74-75` carries a comment claiming the metadata description is kept in sync with `company.ts`. It is not. Worth deleting the comment along with the hardcoded number in S0-T10.
- The phone number is hardcoded in 17 files at 22 sites, not the ~18 the audit estimated. The audit also understated the consequence: `README.md:157` tells operators to set `WHATSAPP_PHONE` on the host, and the real `.env` does set it, so the deploy documentation actively misleads. Changing the number where the docs say to change it has no effect.
- The login lockout (S7-T03) and the public-form rate limit (S7-T04) need the same primitive. The plan now sequences S7-T03 first and has S7-T04 reuse it, rather than treating them as independent.

---

## Open questions

Answer these before the stages that depend on them; several block Stage 1.

1. **Which mailbox receives enquiries?** The repository uses `info@elwahapumps.com`; the live site publishes `info@lwahapumps.com`. A code comment calls the live one a typo, but if that is the mailbox actually being monitored, notifications sent to the other address vanish. Blocks S0-T11.
2. **Does JEE Pumps stay?** It has a brand page but is not in the agency list, has no product and no catalogue. Keep or remove. Blocks S0-T02.
3. **Geo coordinates for the head office.** The pair in the plan came from the Maps embed and should be confirmed against the actual plot. Blocks S1-T09.
4. **Do the Facebook and YouTube pages exist and are they current?** A `sameAs` pointing at a dead page is worse than omitting it. Blocks S1-T09.
5. **ISO 9001 certificate number, issuing body and scope.** Asserted five times on the site with no supporting detail. Blocks S1-T09 and S8-T07.
6. **Real office hours.** "24 hours / 7 days" is currently shown as opening hours; presumably that is the emergency callout line and the office keeps normal hours. Blocks S1-T09.
7. **Do the twelve `/portfolio/nsp-*` models map to current products?** Needed to redirect them somewhere relevant rather than to a category index. Blocks S2-T04.
8. **Should Tormac submersibles be seeded?** They exist only in an ad-hoc script, not the seed, so they are absent from the site — yet the Tormac catalogues are the largest on the site. Affects S0-T09 and S1-T07.
9. **Licensing for the pump-curve dataset.** It is transcribed from Kurlar catalogues. Blocks S3-T12.
10. **Analytics preference.** Needed for S7-T13.
11. **Notification transport.** SMTP alone, or SMTP plus WhatsApp Cloud API or Telegram. Blocks S0-T11.

---

## Note on this file

This plan was drafted and verified against branch `claude/website-audit-seo-69d962` in a worktree, then copied here to `PLAN.md` at the repository root on 7 September 2026 so task status can be tracked in version control alongside the work.

The audit it derives from is not in the repository — it exists as a published artifact from the review session. Worth adding to `docs/audit.md` in a follow-up commit so the plan's citations have a companion in the repo itself.

Update task status inline in the checklist tables above (`TODO` → `IN PROGRESS` → `DONE`) as work lands, and add a short note under the relevant task if the approach changed during implementation.
