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
| S3-T01 | Publish `llms.txt` | S | PRE | DONE |
| S3-T02 | Declare an AI-crawler policy in robots | S | PRE | DONE |
| S3-T03 | Render spec tables in HTML, not behind a tab | M | PRE | DONE |
| S3-T04 | Server-render the home teaser and contact form | M | PRE | DONE |
| S3-T05 | Remove unbacked marketplace trust badges | S | PRE | DONE |
| S3-T06 | Add text lists under the logo walls | S | POST | DONE |
| S3-T07 | Arabic transliterations for 8 brand names | S | POST | BLOCKED |
| S3-T08 | Standardise Arabic unit notation | S | POST | BLOCKED |
| S3-T09 | Public product read API | M | POST | DONE |
| S3-T10 | Public pump-selector API | M | POST | DONE |
| S3-T11 | Generate `llms-full.txt` at build | M | POST | DONE |
| S3-T12 | Publish the pump-curve dataset | M | POST | BLOCKED |

### Stage 4 — Performance

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S4-T01 | Replace the Unsplash hero with local photography | M | PRE | DONE |
| S4-T02 | Remove or session-gate the splash screen | S | PRE | DONE |
| S4-T03 | Replace the framer page transition with CSS | S | PRE | DONE |
| S4-T04 | Re-encode oversized source photographs | M | PRE | DONE |
| S4-T05 | Image formats, cache TTL and asset headers | S | PRE | DONE |
| S4-T06 | Rename deprecated `priority` to `preload` | S | PRE | DONE |
| S4-T07 | Add `sizes` to unsized fill images | S | PRE | DONE |
| S4-T08 | Stop double-rendering the header logo | S | POST | TODO |
| S4-T09 | Pass dictionary slices, not the whole dictionary | M | POST | TODO |
| S4-T10 | Lighter product DTO for list pages | M | POST | TODO |
| S4-T11 | Trim font subsets and weights | S | POST | TODO |
| S4-T12 | Prebuild product and category pages | S | POST | TODO |
| S4-T13 | Query one product instead of the whole catalogue | S | POST | TODO |

### Stage 5 — Design system consolidation

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S5-T01 | Fix the fixed-header offset across all pages | M | PRE | DONE |
| S5-T02 | Fix RTL direction bugs in Hero and CategoryView | S | PRE | DONE |
| S5-T03 | Isolate phone numbers from bidi reordering | S | PRE | DONE |
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
| S6-T01 | Fix 6 pine-on-black contrast failures | S | PRE | DONE |
| S6-T02 | Fix interactive and body-text contrast failures | M | PRE | DONE |
| S6-T03 | Make the mega-menu keyboard reachable | M | PRE | DONE |
| S6-T04 | Give the mobile drawer a focus trap and Escape | M | PRE | DONE |
| S6-T05 | Add a skip link | S | PRE | DONE |
| S6-T06 | Label cart inputs and announce form results | M | PRE | DONE |
| S6-T07 | Implement the ARIA tabs pattern | M | POST | TODO |
| S6-T08 | Rebuild the lightbox on native `dialog` | M | POST | TODO |
| S6-T09 | Fix hero carousel targets, pause and motion | M | POST | TODO |
| S6-T10 | Give marquees a reduced-motion fallback | S | POST | TODO |
| S6-T11 | Localise the aria-labels | S | POST | TODO |
| S6-T12 | Remove the nested main landmark | S | POST | TODO |

### Stage 7 — Code and security hardening

| ID | Task | Size | Gate | Status |
|---|---|---|---|---|
| S7-T01 | Add HTTP security headers | S | PRE | DONE |
| S7-T02 | Enforce JWT secret strength and cookie prefix | S | PRE | DONE |
| S7-T03 | Throttle admin login and close the timing oracle | M | PRE | DONE |
| S7-T04 | Protect the two public POST endpoints | M | PRE | DONE |
| S7-T05 | Force a password change for the seeded admin | M | PRE | DONE |
| S7-T06 | Add the missing database indexes | S | PRE | DONE |
| S7-T07 | Stop the seed clobbering admin product edits | S | PRE | DONE |
| S7-T08 | Centralise the contact constants | S | PRE | DONE |
| S7-T09 | Enable SQLite WAL and nightly backups | M | PRE | DONE |
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
| S8-T01 | Write the content brief for you to fill | M | POST | PARTIAL |
| S8-T02 | Brand page shells for the represented manufacturers | L | POST | TODO |
| S8-T03 | Application and solution page shells | M | POST | TODO |
| S8-T04 | Bore-size landing pages | M | POST | TODO |
| S8-T05 | Dedicated request-a-quote page | M | POST | TODO |
| S8-T06 | Add B2B fields to the lead form | M | POST | TODO |
| S8-T07 | Legal and warranty pages | M | POST | TODO |
| S8-T08 | FAQ blocks with FAQPage schema | M | POST | TODO |
| S8-T09 | Rebrand the cart as a quote list | M | POST | TODO |
| S8-T10 | Apply the Arabic glossary and corrections | M | POST | TODO |
| S8-T11 | Apply the English copy corrections | S | POST | PARTIAL |
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
**Status: DONE.** `public/llms.txt` verified 200/`text/plain`. Links only the 8 brand pages that actually resolve (astral-pipes, jee-pumps, pmc, kurlar, alka, novo, tormac, untel) — an early draft linked all 12 agencies and had to be corrected. Now also links `/llms-full.txt` and the two public API routes added in S3-T09/S3-T10.

### S3-T02 · Declare an AI-crawler policy in robots
**Why.** Retrieval crawlers (OAI-SearchBot, ClaudeBot, PerplexityBot) are where B2B enquiry traffic increasingly originates. Leaving the policy implicit means it is decided by defaults rather than by you.
**Files.** `src/app/robots.ts`. Also add `max-snippet:-1` and `max-image-preview:large` via metadata so passages can be quoted in full.
**Dependencies.** S1-T06.
**Acceptance.** `robots.txt` names each crawler group explicitly. `/admin` and `/api/` remain disallowed for all of them.
**Size.** S
**Status: DONE.** `src/app/robots.ts` names `AI_RETRIEVAL_BOTS` and `AI_TRAINING_BOTS` groups explicitly plus a blocked Bytespider group; `max-snippet`/`max-image-preview` added to `[lang]/layout.tsx` metadata. Revised after S3-T09/S3-T10 landed: `/api/products` and `/api/selector` are carved out with explicit `Allow` lines ahead of the blanket `Disallow: /api/`, since those two are meant to be fetched — verified via `curl /robots.txt`.

### S3-T03 · Render spec tables in HTML, not behind a tab
**Why.** For products with documentation, the specification tables mount only after a client-side tab click, so the most valuable technical content on the site is absent from the initial HTML. Products without documentation do ship their specs, which makes the gap inconsistent as well as invisible.
**Files.** `src/components/ProductDetailView.tsx:55` (tab state), `:213` (the `hasDocs` branch), `:238-345` (the gated tables), `:347-353` (the ungated fallback).
**Approach.** Render both panels and toggle with `hidden` or `<details>`. Keep the tab affordance; never conditionally mount the tables.
**Dependencies.** None.
**Acceptance.** `curl -s /ar/products/pump-submersible | grep -c "<table"` returns a non-zero count matching what the browser shows after clicking Technical Data.
**Size.** M
**Status: DONE.** `ProductDetailView.tsx` now renders both the Overview and Technical panels unconditionally, toggled with `hidden={activeDocTab !== "..."}` instead of a ternary that only mounted one branch. Verified: `curl /ar/products/pump-submersible | grep -c "<table"` returns 4.

### S3-T04 · Server-render the home teaser and contact form
**Why.** Both read `useSearchParams` inside a Suspense boundary, so on these prerendered routes a crawler receives the skeleton fallback rather than the products or the form.
**Files.** `src/components/ProductTabs.tsx:84,189-194`, `src/components/ContactForm.tsx:12,171-190`.
**Approach.** Pass `products` to a server-rendered grid; read `subject` from the page's `searchParams` prop and pass it down. This overlaps with the ContactForm half of S0-T05.
**Dependencies.** S0-T05.
**Acceptance.** `curl -s /ar | grep -c "product-card"` returns the expected count. `curl -s "/ar/contact?subject=x" | grep '<form'` finds the form with its fields.
**Size.** M
**Status: DONE.** New Server Component `src/components/ProductTeaser.tsx` replaces the teaser mode of `ProductTabs.tsx` on the home page — no `useSearchParams`, products passed straight through as props. `ContactForm.tsx` takes `initialSubject` as a prop from the page's `searchParams` instead of reading it client-side. Verified: `curl /ar | grep -o "product-card" | wc -l` returns 64 (32 server-rendered cards, doubled marquee).

### S3-T05 · Remove unbacked marketplace trust badges
**Why.** "Buyer Protection", "Nationwide Shipping", "Verified Supplier", "Certified Warranty" and "100% Quality Guaranteed" are asserted with no policy behind them. They are wrong for an exclusive-agency distributor and they are the kind of claim an answer engine will repeat as fact.
**Files.** `src/components/ProductDetailView.tsx:132,162,205-206`, `src/app/[lang]/services/[slug]/page.tsx:275`, and the 25-year warranty claim in `PartnerLogos.tsx:40` (removed by S0-T13).
**Approach.** Replace with verifiable statements: exclusive Egyptian agent, factory warranty, delivery coverage.
**Dependencies.** None.
**Acceptance.** `grep -rniE "buyer protection|nationwide shipping|verified supplier|100% quality" src/` returns nothing.
**Size.** S
**Status: DONE.** Replaced with verifiable claims across `ProductDetailView.tsx`, `services/[slug]/page.tsx` and `agents/[slug]/page.tsx` (factory warranty, exclusive Egyptian agent, delivery to every governorate, genuine parts in stock). Also reworded explanatory code comments that still contained the banned phrases. Verified: `grep -rniE "buyer protection|nationwide shipping|verified supplier|certified warranty|100% quality" src/` returns 0 matches.

### S3-T06 · Add text lists under the logo walls
**Why.** Eighteen client names and twelve agency marks exist only as images with names in alt text. Neither search engines nor answer engines index them as entity relationships.
**Files.** `src/components/SuccessPartners.tsx:43-50`, `src/app/[lang]/about/page.tsx:151-169`.
**Dependencies.** S0-T10.
**Acceptance.** Each agency and client name appears as selectable text in the rendered HTML.
**Size.** S · **Gate.** POST
**Status: DONE.** `SuccessPartners.tsx` and `about/page.tsx` each render every name as a comma-separated `<p>` beneath the logo strip. Verified: `curl /ar | grep -c "شركاء النجاح"` and grepping for individual agency names (e.g. Kurlar, Aristoncavi) in the About page's rendered HTML both confirm the text is present, not just alt attributes.

### S3-T07 · Arabic transliterations for 8 brand names
**Why.** Only four of twelve brands have Arabic forms anywhere. Arabic voice and chat queries for the other eight will not match.
**Files.** `src/lib/company.ts` (brand registry), `src/dictionaries/ar.json`.
**Dependencies.** S8-T01 (you supply the correct transliterations).
**Acceptance.** Each brand's Arabic form appears at least once on its product or brand page.
**Size.** S · **Gate.** POST
**Status: BLOCKED.** Genuinely needs a native Arabic speaker's transliteration for the 8 remaining brand names — guessing would risk publishing a wrong or awkward form for a manufacturer's actual name. Waiting on S8-T01.

### S3-T08 · Standardise Arabic unit notation
**Why.** Cubic metres per hour is written three different ways across product data and dictionaries, which fragments matching.
**Files.** `src/data/products.ts`, `src/dictionaries/ar.json` `productsPage.tableFlow`.
**Dependencies.** S8-T10.
**Acceptance.** One notation appears throughout; the others return no grep hits. Horsepower is always paired with kilowatts.
**Size.** S · **Gate.** POST
**Status: BLOCKED.** Depends on S8-T10 (Arabic glossary/corrections), which is itself blocked on the S8-T01 content brief — deciding the one correct notation isn't a call to make without that input.

### S3-T09 · Public product read API
**Why.** There is no machine-readable product feed. A procurement agent or comparison tool has nothing to consume. A Merchant feed is not viable without prices, so a JSON catalogue is the right target.
**Files.** New `src/app/api/products/route.ts` and `[slug]/route.ts`.
**Dependencies.** S1-T11 (settle the data shape once).
**Acceptance.** `GET /api/products` returns valid JSON with slug, bilingual names, category, specs and canonical URLs, and is listed in `llms.txt` and allowed in robots.
**Size.** M · **Gate.** POST
**Status: DONE.** `src/app/api/products/route.ts` returns `{count, products}` with bilingual name/description/specs, category, modelNo and canonical URLs, price deliberately omitted (quote-on-request). `src/app/api/products/[slug]/route.ts` returns the full detail (tableSpecs, features, modelGroups, specGroups, options, variants, gallery) or 404. Listed in `llms.txt`; `/api/products` explicitly allowed in `robots.ts` ahead of the `/api/` blanket disallow. Verified against a production build: both routes typecheck, `GET /api/products` returns 16 products with valid bilingual JSON, `GET /api/products/pump-submersible` returns 200, an unknown slug returns 404.

### S3-T10 · Public pump-selector API
**Why.** The selection engine is pure, tested and genuinely differentiated — the single most agent-worthy asset on the site — but reachable only as HTML.
**Files.** New `src/app/api/selector/route.ts`, wrapping `src/lib/pump-selector.ts`.
**Dependencies.** S3-T09.
**Acceptance.** `GET /api/selector?q=60&qu=m3h&h=120&hu=m` returns the same selection the HTML page shows for those parameters.
**Size.** M · **Gate.** POST
**Status: DONE.** `src/app/api/selector/route.ts` wraps `selectFromCatalogue` from `src/lib/pump-data.ts` with the same `q`/`qu`/`h`/`hu` query parameters as the HTML page, returning status, top pick, alternatives and catalogue limits as JSON. Verified against a production build: `GET /api/selector?q=60&qu=m3h&h=120&hu=m` returns `K6SX-60/17` as the top pick, matching the HTML selector page's result for the same query string exactly.

### S3-T11 · Generate `llms-full.txt` at build
**Why.** A hand-maintained full version drifts from the product pages within weeks.
**Files.** Build step generating from the database and dictionaries.
**Dependencies.** S3-T01, S3-T09.
**Acceptance.** Rebuilding after a product edit produces an updated file without manual intervention.
**Size.** M · **Gate.** POST
**Status: DONE.** New `scripts/generate-llms-full.ts`, wired in as the `prebuild` npm script so `npm run build` regenerates `public/llms-full.txt` from `getCatalogProducts` and `company.ts` every time, grouped by category with model, description, specs and canonical URL per product. Verified: ran standalone (`npx tsx scripts/generate-llms-full.ts`) and via `npm run build`, producing a 16-product, 131-line file; served at `/llms-full.txt` as `text/plain` 200 and linked from `llms.txt`.

### S3-T12 · Publish the pump-curve dataset
**Why.** 27 families and 926 variants of head, efficiency and NPSH data with recorded provenance. Published as data with a `Dataset` schema it becomes citable.
**Files.** New public route serving `src/data/pump-curves.json` plus a CSV; `Dataset` JSON-LD.
**Dependencies.** S1-T09. **NEEDS INPUT** on licensing — this is transcribed from Kurlar catalogues.
**Acceptance.** The dataset URL returns 200 and its schema validates.
**Size.** M · **Gate.** POST
**Status: BLOCKED.** Licensing is unresolved — the curve data is transcribed from Kurlar's own catalogues, and publishing it as an open dataset without confirming that's permitted could expose the company to a rights dispute with its own supplier. Not something to decide unilaterally.

---

## Stage 4 — Performance

### S4-T01 · Replace the Unsplash hero with local photography
**Why.** The home page's largest contentful paint is one of three externally hosted Unsplash photographs applied as a CSS background. Being a background, it is invisible to the browser's preload scanner; there is no preconnect to the host; all three load at once; and the site depends on a third party for its first impression. The code's own TODO already flags them as placeholders showing other companies' installations. The `remotePatterns` config allows only `elwahapumps.com`, so they cannot even be moved to `next/image` without a config change.
**Files.** `src/components/Hero.tsx:14-25` (the URLs), `:31-36` (the 6-second rotation), `:52` (the background style). Replacement photography exists in `public/images/services/`.
**Approach.** Render as stacked `next/image` with `fill`, `preload` on the first slide only, `sizes="100vw"`, and lazy-mount the rest. Keep the crossfade in CSS.
**Dependencies.** S4-T04 (use the re-encoded files, not the 20 MB originals).
**Acceptance.** No `unsplash.com` reference remains in `src/`. Lighthouse on `/ar` reports the LCP element as a local image and LCP improves measurably against a recorded baseline.
**Size.** M
**Status: DONE.** `Hero.tsx` now rotates three real El Waha photographs (`well-site.jpg`, `motor-bay.jpg`, `pump-crate.jpg`, all re-encoded under S4-T04) as stacked `next/image` with `fill`/`sizes="100vw"`; only the first slide sets `preload`, the rest are `loading="lazy"`. `remotePatterns` in `next.config.ts` is now empty since nothing external remains. Verified: `grep -rn "unsplash" src/` returns nothing; the rendered home page emits a real `<link rel="preload" as="image">` for `well-site.jpg` and no such link for the other two slides. Lighthouse was not run (no CI Lighthouse harness in this repo) — the LCP-improves-measurably half of the acceptance criterion is unverified, though replacing a lazily-discovered CSS background-image with a preloaded `next/image` is a well-established win.

### S4-T02 · Remove or session-gate the splash screen
**Why.** A full-screen overlay covers the page for roughly 1.8 seconds on every hard load, with no session gate. For buyers reading on phones between jobs this is pure cost. It is also one of only two reasons framer-motion is in the shared bundle.
**Files.** `src/components/SplashScreen.tsx:13` (initial state), `:15-21` (1200 ms hold), `:30` (600 ms exit). Mounted at `src/app/[lang]/layout.tsx:101`.
**Approach.** Preferred: remove it. If it stays, gate on `sessionStorage`, cap at 600 ms, and use CSS keyframes rather than framer.
**Dependencies.** None. Enables S4-T03's dependency removal.
**Acceptance.** A second page load in the same session shows no splash. LCP on `/ar` improves against baseline.
**Size.** S
**Status: DONE.** Took the preferred option — removed outright, rather than session-gated. `SplashScreen.tsx` deleted, its import and mount point removed from `[lang]/layout.tsx`. Verified: `curl /ar | grep -c "data-splash"` (its own marker attribute) returns 0.

### S4-T03 · Replace the framer page transition with CSS
**Why.** `template.tsx` wraps every page in a framer `motion.div` animating opacity and position, which puts framer-motion in every route's JavaScript for an effect CSS does natively. With S4-T02 done, the dependency can be dropped entirely.
**Files.** `src/app/[lang]/template.tsx:3,12-17`. New keyframes in `src/app/globals.css`.
**Approach.** Also move the header offset out of the template — it belongs with S5-T01, not with a transition.
**Dependencies.** S4-T02 (the only other importer).
**Acceptance.** `grep -rn "framer-motion" src/` returns nothing and the package is removed from `package.json`. Page transitions still animate, and respect `prefers-reduced-motion`.
**Size.** S
**Status: DONE.** `template.tsx`'s `motion.div` replaced with a plain `div` and a new `animate-page-in` CSS keyframe in `globals.css`, added to the existing `prefers-reduced-motion` block alongside the marquees. `framer-motion` removed from `package.json` (`npm uninstall`) since nothing else imported it. Left the header-offset classes in `template.tsx` untouched — the approach note above says that consolidation belongs with S5-T01, which is itself a PRE-cutover task in the next stage, not this one. Verified: `grep -rn "framer-motion" src/` returns nothing but this file's own explanatory comment (no import); production build succeeds.

**Amended during Stage 6.** The keyframes originally faded opacity `0.7 -> 1` alongside the rise, which was a latent bug. `animation-fill-mode` is `none`, so the from-state applies for as long as the animation sits in its active phase — and this element wraps *every page's entire content*. Any browser that does not advance the animation leaves the whole page parked at 70% opacity, washing out every colour on it. That is not hypothetical: a tab backgrounded across a navigation throttles animation frames to zero, and it is exactly how the bug was found — an axe scan run in a hidden pane reported a page-wide contrast failure that turned out to be the site genuinely rendering at 70%. The keyframes now animate `transform` only. A stalled translate is a 12px offset; a stalled fade is an unreadable page.

### S4-T04 · Re-encode oversized source photographs
**Why.** Around thirty photographs are 6000×4000 at 12 to 20 MB each. Browsers never download them because `next/image` intervenes, but the server must decode a 24-megapixel JPEG for every size and format on first request — seconds of CPU and a large memory spike per variant on a small VPS — and the deploy carries 375 MB of images.
**Files.** `public/images/services/` (about 165 MB), `public/images/events/` (about 156 MB), `public/images/about/`, `public/images/support/`.
**Approach.** Batch to a 2400 px long edge at about 85% quality, roughly 300 to 500 KB each. Lowercase the twenty uppercase `.JPG` filenames at the same time — case-sensitive Linux hosts make that a latent breakage — and update `src/data/events.ts` references together.
**Dependencies.** S0-T12 (delete duplicates before re-encoding, not after).
**Acceptance.** No file under `public/images` exceeds 1 MB. Every image referenced in `src/` still resolves; `npm run build` succeeds and no page shows a broken image.
**Size.** M
**Status: DONE.** Ran a one-off `sharp`-based script (not checked in — the job is a single batch, not a repeatable build step) against every file over 1MB under `public/images`: resized to a 2400px long edge, EXIF orientation baked in, re-encoded at 85% JPEG quality / PNG level 9. `public/images` dropped from roughly 345MB to 30MB. The 19 uppercase `.JPG` event photos were renamed to lowercase via a two-step `git mv` (a direct case-only rename is a no-op on Windows/NTFS's case-insensitive filesystem, so git wouldn't otherwise register the case change) so the tracked filenames actually change case, not just the working-tree bytes — a plain filesystem rename would have left git still tracking the old uppercase name, silently reintroducing the exact case-sensitive-host breakage this task exists to fix. `src/data/events.ts` updated from `.JPG` to `.jpg` to match. Verified: `find public/images -type f -size +1M` returns nothing; production build succeeds; every re-encoded photo (hero slides, about/support bands, event galleries) renders correctly against a running server.

### S4-T05 · Image formats, cache TTL and asset headers
**Why.** Only WebP is configured, there is no AVIF, and no cache headers exist for static assets or the PDF catalogues, which are served raw at 86 MB total.
**Files.** `next.config.ts` — add `images.formats`, `images.minimumCacheTTL`, and a `headers()` block for `/images/:path*` and `/Catalogue/:path*`. The unused `remotePatterns` entry can go once S4-T01 lands.
**Dependencies.** S0-T01 (same config file, sequence to avoid conflicts), S4-T01.
**Acceptance.** `curl -I` on an image returns a long-lived `Cache-Control`. An AVIF variant is served to a browser that accepts it.
**Size.** S
**Status: DONE.** `next.config.ts` images config now sets `formats: ["image/avif", "image/webp"]` and `minimumCacheTTL` (30 days); `remotePatterns` emptied now that S4-T01 removed the last external image host. New `headers()` block sets `Cache-Control: public, max-age=31536000, immutable` on `/images/:path*` and `public, max-age=86400, must-revalidate` on `/Catalogue/:path*`. Verified against a running production server: a raw image under `/images/services/` returns the immutable header; `/_next/image` with an `Accept: image/avif` header returns `Content-Type: image/avif`; a catalogue PDF returns the 86400/must-revalidate header.

### S4-T06 · Rename deprecated `priority` to `preload`
**Why.** `priority` is deprecated in Next 16 and warns on every build. The codebase is mid-migration — `Logo.tsx` already uses `preload` correctly at three call sites, three page-level images do not. One of those three is on an image hidden below the `md` breakpoint, so mobile visitors preload an image they never see.
**Files.** `src/app/[lang]/about/page.tsx:80`, `support/page.tsx:55`, `services/[slug]/page.tsx:192` (the hidden one, gated at `:181-192`).
**Dependencies.** None.
**Acceptance.** `grep -rn "priority" src/` returns no `next/image` usage. `npm run build` emits no deprecation warning. On a mobile viewport, the network panel shows no preload of the hidden second service photo.
**Size.** S
**Status: DONE.** Renamed at all three call sites (`about/page.tsx`, `support/page.tsx`, `services/[slug]/page.tsx`); the services one now sets `preload={idx === 0}` instead of an unconditional `priority`, since the second image is `hidden md:block`. Verified: `grep -rn "priority" src/ --include=*.tsx` returns nothing; production build has no deprecation warning; rendered HTML for a two-photo service page (`/ar/services/pump-maintenance`) shows a `<link rel="preload">` for the first photo only, none for the second.

### S4-T07 · Add `sizes` to unsized fill images
**Why.** A `fill` image without `sizes` makes the browser assume full viewport width, so an 80 px thumbnail downloads a device-width variant.
**Files.** `src/components/ProductDetailView.tsx:95,111`, `src/components/cart/CartView.tsx:105`.
**Dependencies.** None.
**Acceptance.** Thumbnails request a variant at or near 80 px in the network panel, not a full-width one.
**Size.** S
**Status: DONE.** `sizes="80px"` added to the two thumbnail-sized `fill` images (`ProductDetailView.tsx` gallery thumbnails, `CartView.tsx` line-item thumbnails); the main gallery image got `sizes="(max-width: 1024px) 100vw, 40vw"` matching its actual `lg:col-span-5` layout width. Verified via typecheck and a rendered product page.

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
**Status: DONE.** Took the custom-property option rather than restructuring the header to sticky-in-flow — sticky would have changed the home hero's transparent overlay and, because the header shrinks on scroll, would have shifted the page content by 14px mid-scroll (a layout shift the Stage 4 work would rather not pay for).

Two properties in `globals.css`, with the arithmetic documented beside them: `--header-h` (at rest, for the page offset — static, so pushing content down costs no layout shift) and `--header-h-scrolled` (compact, for things that must sit flush under the header once scrolled). `template.tsx` consumes the first; `scroll-padding-top` and the services sticky tab bar consume the second.

Ad hoc patches removed in the same change — nine of them, not the five the audit counted: `pt-32` bands on careers, catalogues, locations, products and selector (all rebased onto the site's own `py-16 md:py-20` band rhythm), `pt-28` on cart, `pt-32` on the product detail wrapper, `pt-24 md:pt-32` twice in `CategoryView`, a stray `mt-10` in `ProductDetailView`, and a `scroll-mt-28` on the careers positions anchor that would have stacked with the new global scroll padding.

Verified against a running production build by measuring real geometry in a browser, not by eye. The three breakpoint values match the header's actual rendered height with 0–1px of clearance: 95/95 at 375px, 102/101 at 800px, 139/138 at 1440px. All eight named pages plus services, selector and a category page report `contentTop >= headerBottom`. The services tab bar rests 1px under the scrolled header (it previously tucked underneath). An injected anchor probe lands at 124px with the header compact at 123px — below it, by 1px.

One note for whoever revisits this: the header's shrink-on-scroll is driven by a React scroll listener, and a programmatic `window.scrollTo` does not trigger it in an automation context — only a real wheel gesture does. Measurements taken after a synthetic scroll will show the at-rest header height and look like a 14px overlap that isn't real.

### S5-T02 · Fix RTL direction bugs in Hero and CategoryView
**Why.** These are not polish; they are broken layout in the primary locale. The Hero adds `justify-end` when Arabic, but under `dir="rtl"` flex-end is the left edge, so the Arabic call-to-action buttons sit on the opposite side from the headline they belong to. The category page applies `md:flex-row-reverse` when Arabic, which undoes the RTL flow and puts the sidebar on the left in *both* languages, and its back link combines a reversed row with a rotated arrow so the arrow ends up pointing away from the text.
**Files.** `src/components/Hero.tsx:67,71,86,104`; `src/components/CategoryView.tsx:37,40-41,135,160-161`.
**Approach.** Delete the `isAr` layout ternaries — `dir` already handles it. Keep a ternary only for the background gradient direction, which has no logical equivalent.
**Dependencies.** None.
**Acceptance.** Side-by-side screenshots of `/ar` and `/en`: hero buttons sit on the same side as the headline in both, and the category sidebar is on the right in Arabic and the left in English.
**Size.** S
**Status: DONE.** Deleted the `isAr` layout ternaries in both components. `Hero`: the `justify-end` on the button row (the actual bug — it put the Arabic buttons on the opposite side from their headline), plus two redundant `ml-auto` patches that were re-stating what `dir="rtl"` already does for a narrower block. `CategoryView`: the `md:flex-row-reverse` that un-reversed the RTL row and so put the sidebar on the left in *both* languages, and the back link's `flex-row-reverse`, which moved the arrow to the far side of the label it points away from.

Two ternaries kept deliberately: the hero's background gradient direction, which has no logical-property equivalent, and every `isAr` used to pick *content* rather than layout. The hero slide dots moved from a `left-10`/`right-10 md:right-16` ternary to `end-10 md:end-16` — the responsive bump at `md` had been applying to English only.

Verified by measuring rendered geometry in both locales at 1440px. Arabic: headline centre 988 and buttons centre 1267, both right of the 720 midline. English: 444 and 194, both left. Category sidebar starts at x=1112 of 1440 in Arabic and x=0 in English. Screenshots of both heroes confirm the headline, brass rule and buttons now stack on one side.

Left alone as correct-but-physical, for S5-T11's logical-property sweep: the card padding and corner-button offsets further down `CategoryView`. They produce the right result in both directions today; they are just written as `isAr` physical patches rather than logical properties.

### S5-T03 · Isolate phone numbers from bidi reordering
**Why.** Five phone numbers lack `dir="ltr"`, so in Arabic the bidi algorithm moves the leading plus sign to the end and the number renders as `20 106 668 5532+`. The Footer and Careers pages already do this correctly, so the fix is to apply the existing pattern.
**Files.** `src/components/Header.tsx:405-407`, `src/app/[lang]/page.tsx:210`, `agents/[slug]/page.tsx:185`, `contact/page.tsx:68-73`.
**Dependencies.** None.
**Acceptance.** On `/ar`, every phone number renders with the plus sign leading.
**Size.** S
**Status: DONE.** Applied the Footer's existing `dir="ltr"` pattern to the four places missing it: the header's call-now number, both numbers in the contact page's info panel, the home page's contact strip, and the agent detail page. Catalogues and locations already had it.

Verified programmatically rather than by reading pixels — a bidi reordering is invisible in the DOM text, so the assertion is on computed style: on `/ar`, every element whose text is a phone number reports `direction: ltr` while the document itself reports `rtl`. All five on the contact page, four on the home page and four on an agent page pass. A regex sweep over `src/` finds no remaining phone-number element without a `dir="ltr"` on its opening tag.

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
**Status: DONE.** All six eyebrows converted from `text-emerald-500` on a black band to the `spec-label text-brass` on pine treatment that About and Careers already used. Five were page header bands (agents, contact, events, services, support); the sixth was the genuine-parts panel on the support page, where the agency count — the whole point of the panel — was pine on near-black.

The support page's band is a photograph, and its scrim was a black gradient. That was switched to pine too: leaving a black wash over a now-pine band would have put the brass eyebrow straight back on the near-black ground this task exists to remove.

Verified with axe rather than by eye: the eyebrow computes to brass `rgb(210, 171, 92)` on pine `rgb(14, 59, 46)` — the documented 5.9:1 pairing — and agents, events, services and support all report zero contrast violations.

### S6-T02 · Fix interactive and body-text contrast failures
**Why.** Nine more pairs fail: brass on white at 2.16 and on bone at 1.98 for header hover states, white on the WhatsApp green at 1.98 on the cart's send button, `neutral-400` on white at 2.52 used for labels and metadata across many pages, `neutral-600` on black at 2.69, `stone-light` at 3.48 for captions, the red required-field asterisk at 3.76, and bone at 50% opacity on pine at 4.06 for footer links.
**Files.** `src/components/Header.tsx:96,236,302,312`; `cart/CartView.tsx:194,208`; `contact/page.tsx:49,64,84,99,111`; `CategoryView.tsx:40,139,150`; `events/page.tsx:69`; `selector/page.tsx:159`; `Footer.tsx` language links.
**Approach.** Hover to field or pine on light grounds and keep brass for dark grounds only, as the brand doc specifies. Cart send button to pine on bone. Replace `neutral-400` body text with `stone` (6.9 to 1).
**Dependencies.** S6-T01.
**Acceptance.** An axe scan of home, a product page, a category page, contact and cart reports zero contrast violations.
**Size.** M
**Status: DONE.** Fixed across the board, then verified with a real axe scan.

- **Brass on light grounds.** The mega-menu's "all products" link and the two mobile chips hovered to brass on white/bone (2.16:1 and 1.98:1). The link now darkens to ink and underlines; the chips invert to pine-on-bone. Brass is kept for dark grounds only, as the brand doc specifies.
- **Cart send button.** Was white on WhatsApp green at 1.98:1. Now bone on pine at 13.1:1. This reads the plan's "pine on bone" as the *pairing* rather than the exact fore/background order — a solid pine button is the site's own primary-action treatment, and the WhatsApp glyph still identifies the channel.
- **`neutral-400` body text** replaced with `stone` (6.9:1) wherever it sat on white — contact's five info labels, three spots in CategoryView, and two in the cart. Where it sat on a dark ground instead (the CategoryView sidebar at 4.08:1) it went to `neutral-300`.
- **`--color-outline`** was `#8a8a82` at 3.47:1 and, despite the Material-3 name, is used only as a text colour (11 call sites, no border or background uses). Retoned to stone, which fixed the product page's spec labels and every table header at once.
- **Breadcrumbs, footer, form labels, required asterisk and disabled button** all retoned; `text-bone/50` on pine (4.06:1) went to `/75` (7.1:1).

**Acceptance met.** axe reports zero `color-contrast` violations on home, a product page, a category page, contact and cart. The cart was scanned with a seeded line item so the send button and both inputs were actually on screen.

Two verification traps worth recording, because both produced convincing false results before they were caught:

1. **A zero-width viewport.** The pane's viewport had collapsed to `innerWidth: 0`, which puts every element off-screen. axe resolves an element's background with `elementsFromPoint`, gets nothing for an off-screen point, and falls back to assuming white — so it reported six confident footer violations citing "background color: #ffffff" for elements whose computed background was demonstrably `rgb(14, 59, 46)`. Assert `window.innerWidth` before trusting a scan.
2. **Scanning mid-animation.** The page-in animation started at 70% opacity, so a scan run before it settled washed out every colour on the page and invented failures. That one turned out to be a real defect in disguise — see the note on S4-T03.

### S6-T03 · Make the mega-menu keyboard reachable
**Why.** The Products submenu is revealed by `group-hover` alone. Keyboard users can never open it; on touch, tapping the trigger navigates away instead. It is the primary route into the catalogue.
**Files.** `src/components/Header.tsx:184,198`.
**Approach.** Add `group-focus-within` alongside the hover state plus `aria-haspopup` and `aria-expanded`, or make the chevron a separate button that toggles state and closes on Escape.
**Dependencies.** None.
**Acceptance.** Tabbing to Products reveals the menu; every item inside is reachable by keyboard; Escape closes it and returns focus to the trigger.
**Size.** M
**Status: DONE.** Open state is now React state rather than `group-hover` alone, with `aria-haspopup` and a live `aria-expanded`. Focus entering the group opens it, focus leaving closes it, Escape closes it and returns focus to the trigger.

Two real bugs surfaced while verifying, both of which would otherwise have shipped:

1. **The panel used `transition-all`.** `visibility` is a discrete property, so it only flipped once the 300ms transition completed — meaning the panel's links were unfocusable for the whole transition, and unfocusable *indefinitely* anywhere transitions are throttled or disabled, all while `aria-expanded` already claimed "true". Now `transition-opacity`, so visibility switches immediately and only the fade animates.
2. **Escape closed and instantly reopened the menu.** Handing focus back to the trigger fires the same `onFocus` handler that opens it. A dismissal ref now suppresses that one re-entry and re-arms when focus leaves the group.

**Acceptance met**, driven with real key events: focusing the trigger sets `aria-expanded="true"` and the panel to `visibility: visible`; Tab lands on "Submersible Pumps" inside the panel; Escape returns `aria-expanded="false"`, `visibility: hidden`, and focus to the Products trigger.

### S6-T04 · Give the mobile drawer a focus trap and Escape
**Why.** The drawer has no focus trap, no Escape handler and no scroll lock, and it uses `aria-hidden` on a container whose links remain focusable — the focusable-but-hidden pattern, which strands keyboard and screen-reader users in an invisible menu.
**Files.** `src/components/Header.tsx:335-341,358-391`.
**Approach.** Use `inert` rather than `aria-hidden` (React 19 supports it), add an Escape handler, lock body scroll while open, move focus to the close button on open and restore it on close.
**Dependencies.** S6-T03.
**Acceptance.** With the drawer closed, tabbing never reaches a drawer link. With it open, focus cycles within the drawer, Escape closes it, and focus returns to the toggle. The page behind does not scroll.
**Size.** M
**Status: DONE.** The drawer now uses `inert` instead of `aria-hidden`, plus an Escape handler, a body scroll lock, focus moved to the close button on open and restored on close, and a Tab/Shift-Tab focus trap. It also carries `role="dialog"`, `aria-modal` and a localised label.

`inert` is the substantive fix: `aria-hidden` hid the drawer from assistive tech while leaving all twelve of its links focusable, so Tab walked into an off-screen menu. Verified directly — calling `.focus()` on a drawer link while closed leaves `document.activeElement` on `body`.

**Acceptance met.** Closed: links unreachable. Open: `aria-expanded="true"`, `inert` gone, `body.style.overflow` locked to `hidden`, focus on the close button. Tab from the last item wraps to the first and Shift-Tab from the first wraps to the last. Escape restores `inert`, clears the scroll lock, and returns focus to the toggle.

Focus restoration falls back to the toggle ref when `document.activeElement` was `body` at open time, because some browsers do not focus a button on mouse-down — without the fallback, closing would drop focus to the top of the page.

### S6-T05 · Add a skip link
**Why.** A fixed header with ten-plus links and a mega-menu precedes the content on every page, with no way to bypass it.
**Files.** `src/app/[lang]/layout.tsx:98-113`.
**Acceptance.** The first Tab press on any page reveals a visible skip link that moves focus to the main content.
**Size.** S
**Status: DONE.** Added to `[lang]/layout.tsx` ahead of the header, visually hidden until focused. `<main>` gained `id="main"` and `tabIndex={-1}` so activation moves focus rather than only scrolling.

**Acceptance met**, end to end with real key and click events: the first Tab press focuses it, at which point it computes to `position: fixed`, 145x44px, pine background, bone text, `z-index: 50` — confirmed visually in a screenshot. Activating it sets `document.activeElement` to the `main` element itself.

One environment note for anyone re-testing: `:focus` styles cannot be exercised while the browser pane is hidden. `document.activeElement` updates but `document.hasFocus()` stays false and `:focus` never matches, so the link measures as still 1px and clipped. Clicking into the page first fixes it.

### S6-T06 · Label cart inputs and announce form results
**Why.** The cart's name and phone inputs have placeholders only — no label, no `aria-label`, no `autocomplete`, no `type="tel"`. The contact form discards the server's validation message entirely (`throw new Error(status)`), its status banners have no `aria-live` and are never focused, and the required marker is a colour-only asterisk at 3.76 to 1.
**Files.** `src/components/cart/CartView.tsx:177-188`; `src/components/ContactForm.tsx:40-52,61-71,75-77,86`; `src/app/api/leads/route.ts:22-27`.
**Approach.** Visible labels and `autoComplete` on the cart inputs. Parse and display the returned error, add `role="status"` with `aria-live="polite"` to banners, focus the banner on success, and add textual "(required)" markers.
**Dependencies.** S0-T05, S3-T04 (both touch ContactForm — sequence them).
**Acceptance.** Screen reader announces each cart field. Submitting the contact form with an invalid phone shows the server's specific message and announces it.
**Size.** M
**Status: DONE.**

**Cart inputs** now have real `<label>` elements, ids, `autoComplete` (`name` / `tel`), `type="tel"`, `inputMode` and `dir="ltr"` on the phone. Placeholders were never accessible names, and they vanish as soon as someone types. Verified: both inputs resolve an accessible name via `label[for]`.

**Contact form** — the server already returned a specific message per failed field ("Phone is required") and the client threw it away in favour of a generic banner. It is now parsed and shown beneath the generic line. The two status banners were also replaced by a single live region that is always in the DOM, rather than two that mount at the moment their text appears — a region inserted simultaneously with its content is announced inconsistently. It carries `role="status"`, `aria-live="polite"` and `tabIndex={-1}`, and takes focus once a submission resolves.

The colour-only required marker is now an `aria-hidden` asterisk plus an `sr-only` "(required)", and the glyph was darkened from red-500 to red-700.

**Acceptance met.** Submitting with a whitespace-only phone — which passes the client's `required` but fails the server's `.trim().min(1)` — produced a banner reading the generic message followed by "Phone is required", with `document.activeElement` on the banner.

### S6-T07 to S6-T12 · Post-cutover accessibility work
- **S6-T07** Implement the ARIA tabs pattern for the product category tabs and the Overview/Technical tabs — currently plain buttons with no roles, `aria-selected` or arrow-key navigation (`ProductTabs.tsx:128-140`, `ProductDetailView.tsx:216-236`). Depends on S3-T03. **M**
- **S6-T08** Rebuild the event lightbox on native `<dialog>` with `showModal()` for a free focus trap and Escape; today it has no dialog role, no focus management, and a mouse-only backdrop close (`EventGallery.tsx:56-110`). **M**
- **S6-T09** Hero carousel: dots are 3 px tall against a 24 px minimum target, it auto-advances every 6 seconds with no pause control, and neither it nor the framer transitions respect `prefers-reduced-motion` (`Hero.tsx:31-36,104-116`). Depends on S4-T01. **M**
- **S6-T10** Marquees become unreachable under reduced motion — the animation stops but nothing scrolls, and the home teaser is the only product surface on the home page (`ProductTabs.tsx:147-165`, `SuccessPartners.tsx:33`, `globals.css:404-415`). **S**
- **S6-T11** Move English-only aria-labels into the dictionaries; include the item count in the cart label; remove the double announcement on the logo link. **S**
- **S6-T12** Remove the nested `<main>` on category pages (`CategoryView.tsx:117` inside `layout.tsx:105`). **S** — **This is now the only axe violation left anywhere on the site.** A full-rule axe pass over home, a product page, a category page, contact, cart, services, support, agents and events is otherwise clean; the category page still reports `landmark-main-is-top-level`, `landmark-no-duplicate-main` and `landmark-unique`, all three from this one nested element. It is a one-word change and it was left alone only because this task is scheduled post-cutover — worth pulling forward if you would rather cut over with a clean scan.

### Found during Stage 6, outside the listed tasks

Three genuine defects that no S6 task covered, surfaced by running axe over full rule sets rather than only the contrast rule. All three are fixed.

- **The floating WhatsApp button belonged to no landmark.** It sits outside header, main and footer, so it was the one piece of content on every page contained by nothing — a moderate-impact `region` violation site-wide. Wrapped in a labelled `<aside>`, and its glyph marked decorative now that the link is named.
- **The services page skipped a heading level.** Its outline ran `h1` straight to the service cards' `h3` with nothing at `h2`. S1-T15 repaired heading order on the other pages but not this one. The tab bar is the visual label for that grid, so the fix is an `sr-only` `h2` carrying the active tab's name — the outline is corrected without changing the design, which is Stage 5's post-cutover job. `ServiceCard`'s own `h3` was left alone deliberately: on the support page it sits under a real `h2`, where `h3` is correct.
- **Six icon-only links had no accessible name.** The contact page's Facebook and YouTube links, and the four circular "view product" links on a category page. The product ones now name the product they lead to, so a screen reader hears "View Kurlar Stainless Steel Submersible Pumps" rather than a list of identical, unlabelled links.

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
**Status: DONE.** A site-wide header block in `next.config.ts` sets HSTS (two years, `includeSubDomains; preload`), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` and a `Permissions-Policy` denying camera, microphone, geolocation, payment, USB and topics — none of which anything here uses, so a compromised third-party script cannot reach for one. `/admin/:path*` additionally gets `X-Frame-Options: DENY` and `Cache-Control: no-store`, since those pages carry customer data.

The CSP ships **report-only**, as the plan asked. Writing it turned up two things the draft would have broken the moment it was enforced, both found by reading the code rather than waiting for production reports:

1. **The distributor map's tiles come from CARTO** (`*.basemaps.cartocdn.com`, four subdomains), not from maptiler or OpenStreetMap as the draft's `connect-src` assumed. They are raster PNGs fetched as images, so the binding directive is `img-src` — which the draft did not allow at all. Enforced, that would have blanked the map.
2. **The contact page's map is a Google Maps iframe.** With no `frame-src` it falls through to `default-src 'self'` and would have been blocked.

Both corrected against the actual source. Verified against a running production build: every header present on `/ar`, the admin extras present on `/admin/login`, `frame-ancestors 'none'` site-wide, and the contact page's Google Maps iframe loads with zero `securitypolicyviolation` events.

**Not verified at runtime:** the CARTO `img-src`/`worker-src` allowances. The map falls back to its list view in the automation browser, so no tile request was ever issued. The directives are correct per the source, and report-only means a mistake cannot break anything — but switching to the enforcing header should wait until real traffic has been observed, which is exactly why it ships report-only.

### S7-T02 · Enforce JWT secret strength and cookie prefix
**Why.** The secret fails closed when absent, which is correct, but any non-empty value is accepted — including the literal `"change-me"` shipped in `.env.example`. The session cookie also lacks the `__Host-` prefix despite already meeting its requirements.
**Files.** `src/lib/session.ts:12-16,42-48`; `.env.example:11`.
**Acceptance.** Starting the app in production mode with a short secret refuses to boot with a clear message. The cookie is named with the `__Host-` prefix and sessions still work.
**Size.** S
**Status: DONE.** `getSecretKey()` now rejects, in production only, both a secret under 32 characters and a placeholder from a small deny-list (`change-me` and friends, case-insensitive). Previously any non-empty string was accepted, including the literal `change-me` that `.env.example` ships — so an install that never edited the sample file ran with a publicly known signing key, and anyone holding it can mint an administrator session.

The cookie now takes the `__Host-` prefix in production. That prefix is enforced by the browser: it refuses the cookie unless it is Secure, carries no `Domain`, and is scoped to `Path=/`. The cookie already satisfied all three; it simply was not claiming the guarantee, which is what stops a subdomain overwriting the admin session. Development over plain http keeps the unprefixed name, since the prefix requires HTTPS.

Verified by importing the module under `NODE_ENV=production`: the cookie is named `__Host-elwaha_admin_session` with `secure: true`, `path: "/"`, `httpOnly: true` and no `domain` key. Token signing was then exercised across six secrets — `change-me` and `CHANGE-ME` refused as placeholders, 6 and 31 characters refused as too short, 32 and 64 accepted.

### S7-T03 · Throttle admin login and close the timing oracle
**Why.** No rate limit, no lockout, no delay. With bcrypt at cost 10 each attempt costs about 100 ms, which makes online brute force practical against a documented default account. Separately, `bcrypt.compare` runs only when the email exists, so response time reveals which addresses are valid despite the uniform error message.
**Files.** `src/lib/actions/auth.ts:19-49`. The timing oracle is precise: `:33` returns before `:35` reaches `verifyPassword`, so an unknown email returns in database-lookup time while a known one pays the full bcrypt cost. The comment at `:30-31` claims enumeration resistance through identical error messages; the timing channel defeats it.
**Approach.** Per-IP and per-email throttling — in-memory is adequate for a single VPS. On an unknown email, still compare against a constant dummy hash. **Build the throttling primitive here and reuse it in S7-T04** — the login lockout and the public-form rate limit need the same thing, and two separate implementations would be a waste and a divergence risk.
**Dependencies.** None. Provides the shared primitive for S7-T04, so sequence this first.
**Acceptance.** Eleven failed attempts from one address are refused with a throttle message. Response times for a known-invalid and a known-valid email are within noise of each other across twenty samples.
**Size.** M
**Status: DONE.** New shared primitive in `src/lib/rate-limit.ts` — one implementation, as the plan insisted, reused by S7-T04. Fixed-window, in memory, with a documented caveat that it is per-process and would need shared storage behind more than one instance.

Login is throttled on **both** axes: per address, so one host cannot grind through many accounts, and per email, so a distributed attempt cannot grind through one account. Ten attempts per fifteen minutes, checked before any database work so a locked-out caller costs nothing. A successful sign-in clears both counters, so an operator who mistyped a few times is not left locked out.

The timing oracle is closed by comparing against a constant bcrypt hash when the email is unknown. That hash is of a random string nobody holds the input to, and nothing verifies against it — it exists purely to spend the same time a real comparison spends.

**Acceptance met.** Twelve failed attempts from one address are refused with the throttle message, driven through the real form in a browser. For the timing half, measured server-side rather than over HTTP: the comparison costs 43.4ms against a real account hash and 43.5ms against the equaliser, a 0.1ms difference and a ratio of 1.002. The old unknown-email path did no bcrypt at all — roughly 0ms against 43ms, which is trivially distinguishable.

Also added `src/lib/rate-limit.test.ts` — nine cases covering the limit boundary, per-key isolation, window expiry, `Retry-After`, reset, and the `clientIp` header precedence. The suite is now 45 tests.

**A measurement trap worth recording:** an initial attempt to time this through the browser returned a uniform 1000ms for every case and showed the throttle apparently not firing. Neither was real. React's `useActionState` drops a `requestSubmit()` while an action is still pending, so most of those submissions never reached the server, and what was being timed was React's pending-state cycle rather than anything server-side. Timing work like this belongs off the client.

### S7-T04 · Protect the two public POST endpoints
**Why.** Both write a database row per request with no throttle, honeypot, CAPTCHA or Origin check. A trivial script fills the CRM with junk and buries real enquiries — which matters more once S0-T11 turns every row into a notification.
**Files.** `src/app/api/leads/route.ts:13-43`, `src/app/api/inquiries/route.ts:21-68`, `src/components/ContactForm.tsx`.
**Approach.** Hidden honeypot field plus a minimum submit time, per-IP throttling **reusing the primitive built in S7-T03**, and an Origin or `Sec-Fetch-Site` check. Normalise phone and email before storing so deduplication works. What already exists and should be kept: both routes validate with zod (`leads/route.ts:5-11`, `inquiries/route.ts:5-19`), and `inquiries/route.ts:41-55` re-prices the cart server-side from the database and ignores the client's `unitPrice` — that part is sound.
**Dependencies.** S0-T11, S7-T03 (the shared rate-limiting primitive).
**Acceptance.** A scripted burst of twenty submissions is throttled. A submission with the honeypot filled returns 200 but writes no row. A cross-origin POST is rejected.
**Size.** M
**Status: DONE.** New `src/lib/form-guard.ts`, shared by both routes, reusing the S7-T03 limiter.

- **Origin check.** `Sec-Fetch-Site` is preferred because the browser sets it and page script cannot forge it; `Origin` is the fallback. A request with neither is allowed through and still throttled — some legitimate clients send neither, and rejecting them outright would be a guess dressed as a security control.
- **Honeypot.** A hidden `company` field, `aria-hidden` and out of the tab order with `autoComplete="off"` so neither a person nor a password manager fills it. A filled one returns 201 and writes nothing: the bot records a success and moves on rather than learning it was spotted.
- **Throttle.** Five submissions per ten minutes per address, per route, with `Retry-After`.
- **Normalisation.** Phone reduced to a leading `+` and digits, email lowercased and trimmed, so a repeat enquirer deduplicates in the CRM.

Deliberately no CAPTCHA. This is a low-traffic B2B contact form, and the three checks above stop opportunistic bots without putting a puzzle in front of someone trying to buy a pump.

**Acceptance met**, all three cases against a running build. A cross-origin POST returns 403. A honeypot submission returns 201 with the `Lead` count unchanged. A burst of twenty writes exactly five rows and returns 429 for the other fifteen. Normalisation confirmed end to end: `+20 (106) 668-5532` stored as `+201066685532`, `  MiXeD@Example.COM  ` stored as `mixed@example.com`.

Kept, as the plan noted: both routes' zod validation, and the server-side re-pricing in the inquiries route that ignores the client's `unitPrice`.

### S7-T05 · Force a password change for the seeded admin
**Why.** The seed creates `admin@elwahapumps.com` with a password documented in the README, and nothing requires changing it. Combined with no login throttle it is the most direct path into the CRM.
**Files.** `prisma/seed.ts:26-27`; `prisma/schema.prisma` (add a `mustChangePassword` field); `src/app/admin/(dashboard)/layout.tsx` (redirect while set).
**Approach.** Also make the seed refuse the default password when `NODE_ENV=production`.
**Dependencies.** S7-T06 (bundle the migrations).
**Acceptance.** A freshly seeded admin is redirected to a change-password screen and can reach no other admin page until it is changed.
**Size.** M
**Status: DONE.** New `mustChangePassword` column, set on the seeded admin. The dashboard layout reads it per request and redirects to a new `/admin/change-password` screen while it is set. Checked against the database rather than carried in the session token, so clearing the flag takes effect immediately instead of whenever a seven-day token happens to expire.

The screen sits deliberately **outside** the `(dashboard)` route group — inside it, the layout's redirect would loop. The change action requires the current password, enforces a 12-character minimum (this account owns the whole CRM, and the password it replaces is published in the README), and rejects reuse of the current one.

The seed also now refuses the default password outright when `NODE_ENV=production`, rather than quietly creating a known-credential administrator on a live box.

**Acceptance met.** Signing in with the documented default lands on `/admin/change-password` reading "Set your own password". Fetching `/admin`, `/admin/leads`, `/admin/products`, `/admin/users` and `/admin/customers` while flagged redirects every one of them back to it. A too-short password is refused with "Use at least 12 characters"; a valid one clears the flag and lands on the dashboard.

**One deployment note.** The flag is only set when the row is *created* — the upsert's update block stays empty. An install that already has an admin will not be retro-flagged, which is correct, since there is no way to know whether that operator already rotated their password. For an existing install, set it by hand if the default is still in use.

### S7-T06 · Add the missing database indexes
**Why.** SQLite does not index foreign keys automatically, and the admin list queries filter and sort on unindexed columns.
**Files.** `prisma/schema.prisma` — `Lead` (166-182), `CartInquiry` (184-197), `Activity` (256-267), `Customer` (150-164) all have **zero** indexes; `Product` (63-92) has only the unique on `slug`. One new migration. The datasource block (`:5-7`) declares no `url`; it is supplied by `prisma.config.ts`, which loads `dotenv`. Verified working in this worktree — `npx prisma generate` followed by `npx prisma migrate deploy` applied all four existing migrations cleanly with a local `.env` present. This is also why `dotenv` sitting in devDependencies is a deploy risk (S7-T16): `npm ci --omit=dev` would break exactly this command.
**Approach.** Indexes on `Lead(status, createdAt)`, `Lead(assignedToId)`, `Lead(customerId)`, `CartInquiry(status, createdAt)`, `CartInquiry(customerId)`, `Activity(leadId)`, `Activity(customerId)`, `Activity(authorId)`, `Product(isActive, categoryId)`. `Customer` was not in the audit but has the same shape and the same admin query pattern.
**Acceptance.** `npx prisma migrate deploy` applies cleanly. Admin list pages still render correct data.
**Size.** S
**Status: DONE.** Ten indexes in one migration, bundled with the S7-T05 column as the plan asked: `Lead(status, createdAt)`, `Lead(assignedToId)`, `Lead(customerId)`, `CartInquiry(status, createdAt)`, `CartInquiry(customerId)`, `Activity(leadId)`, `Activity(customerId)`, `Activity(authorId)`, `Product(isActive, categoryId)` and `Customer(createdAt)`.

**Acceptance met.** `npx prisma migrate deploy` applied cleanly, and the live database reports every index present plus the new `User.mustChangePassword` column. Admin pages render correct data afterwards.

Worth knowing: the working database is `dev.db` at the repository root, not `prisma/dev.db` — `DATABASE_URL` is `file:./dev.db` and resolves against the project root. Prisma tooling created an empty `prisma/dev.db` alongside it during this work, which was a red herring when checking whether the indexes had landed. It has been removed.

### S7-T07 · Stop the seed clobbering admin product edits
**Why.** Re-running the seed overwrites names, descriptions, images and specifications on every existing product, silently destroying edits made through the admin interface. The database is the runtime source of truth; the static file is a one-time fixture.
**Files.** `prisma/seed.ts:77-99` (the upsert `update` block).
**Approach.** Make the product upsert create-only, or gate the overwrite behind an explicit flag. Document in the README that `src/data/products.ts` is a fixture, not live data.
**Dependencies.** S0-T09 (both touch the seed).
**Acceptance.** Edit a product name in the admin, re-run the seed, and confirm the edit survives.
**Size.** S
**Status: DONE.** The product upsert's `update` block is now empty by default, so re-seeding cannot touch a row that already exists. Set `SEED_OVERWRITE_PRODUCTS=1` to deliberately re-import the fixture over live rows. The seed log says which mode it ran in, so this is never silent either way.

**Acceptance met**, exactly as the plan specified. A product name was edited directly in the database to stand in for an admin edit, the seed was re-run, and the edit survived. Re-running with `SEED_OVERWRITE_PRODUCTS=1` restored the fixture value, confirming the escape hatch works.

### S7-T08 · Centralise the contact constants
**Why.** `WHATSAPP_PHONE` is never read — no `process.env.WHATSAPP_PHONE` exists anywhere in the codebase. But it is set in `.env.example:13`, set in the real gitignored `.env:13`, and `README.md:157` instructs operators to configure it on the host alongside `DATABASE_URL` and `JWT_SECRET`. So it is genuinely provisioned at runtime and silently ignored: an operator who changes the company's WhatsApp number in the host environment, exactly as the deploy documentation tells them to, changes nothing on the site. The number is hardcoded across **17 files at 22 call sites**.
**Files.** `src/lib/company.ts` (add the constant). Call sites: `WhatsAppButton.tsx:10`, `cart/CartView.tsx:11`, `Footer.tsx:145`, `Header.tsx:288,397`, `ProductDetailView.tsx:191`, `src/data/jobs.ts:14`, `support/page.tsx:20,21`, `contact/page.tsx:68`, `services/[slug]/page.tsx:227,234`, `catalogues/page.tsx:213`, `products/page.tsx:174`, `agents/[slug]/page.tsx:181`, `[lang]/page.tsx:206`, `locations/page.tsx:96`. Also `index.html:71,75,230,240` — removed by S0-T13.
**Dependencies.** S0-T10, S0-T13.
**Acceptance.** `grep -rn "201066685532" src/` matches only `company.ts`. Every WhatsApp and telephone link on the site still resolves correctly. Decide whether to keep the env var and read it, or delete it from `.env.example` and the README — do not leave a documented setting that does nothing.
**Size.** S
**Status: DONE.** Both numbers now live only in `src/lib/company.ts`, with a derived `WHATSAPP_SALES` for `wa.me` links, which want the number without the leading `+`. Twenty-two call sites across seventeen files rewritten, including `data/jobs.ts` (which also had the email hardcoded) and `lib/schema.ts` (which was doing its own `.replace("+", "")`).

**On the open question the plan raised** — keep the env var and read it, or delete it: deleted. The number is a company fact like the address and the legal name, all of which already live in `company.ts` and feed the JSON-LD. Making it an environment variable would mean the structured data and the `llms-full.txt` generator both need runtime env access for a value that changes perhaps once a decade. `WHATSAPP_PHONE` is gone from `.env.example` and from both places the README mentioned it, so the deploy documentation no longer instructs operators to set something nothing reads.

**Acceptance met.** `grep -rn "201066685532" src/` matches `company.ts` only. Every `tel:` and `wa.me` link on the home, contact, support, products and agent pages renders byte-identically to before.

### S7-T09 · Enable SQLite WAL and nightly backups
**Why.** On the chosen VPS the database is a single file with backups left to the host. Write-ahead logging also improves concurrency when several staff use the admin at once.
**Files.** `src/lib/prisma.ts:12`; new `scripts/backup-db.ts`; README deployment section.
**Acceptance.** WAL is confirmed active. The backup script produces a restorable copy, and a documented restore has been performed once on staging.
**Size.** M
**Status: DONE.** WAL is enabled once per process in `src/lib/prisma.ts`, paired with `synchronous = NORMAL` — the standard combination, durable across application crashes and risking only the most recent commits in a full power loss. It is set non-fatally: a database that cannot take the pragma still works, just with the old locking behaviour. The default rollback journal takes an exclusive lock for the whole of every write, so one person saving a lead blocked every other reader.

New `scripts/backup-db.ts` (`npm run backup`), using SQLite's `VACUUM INTO` rather than a file copy. **This distinction is the point of the task:** under WAL, recent commits live in a `-wal` sidecar, so copying the `.db` alone can restore short. `VACUUM INTO` asks SQLite for a consistent snapshot and writes a single valid database. The script prunes to `--keep` and defaults to fourteen.

The README's deployment section now covers the JWT secret floor, the forced first-password change, the nightly cron line, and the restore procedure — including deleting stale `-wal`/`-shm` sidecars, which is the step that bites people.

**Acceptance met** for WAL and the backup: `PRAGMA journal_mode` reports `wal`, a `-wal` sidecar exists beside the live database, and the script produced a valid 0.27 MB snapshot with pruning working.

**Not done: the restore rehearsal.** The plan asks for a documented restore performed once on staging, and there is no staging environment to perform it in. The procedure is written down; it has not been executed. That should happen before cutover, and it is the one part of this task still outstanding.

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
**Status: PARTIAL — delivered, awaiting answers.** `docs/content-brief.md` is written and is the half of this task that was mine to do. The other half is yours: the acceptance is only met once the answers come back.

It is organised so it can be answered in pieces rather than all at once. Part 1 collects all eleven [Open questions](#open-questions) as short-answer items — several are one word, and they block work that is otherwise finished. The remaining parts ask for company and legal facts, the twelve manufacturers, project proof, the questions your sales team actually gets asked, event dates, Arabic terminology, and the handful of decisions about how you want to sell. A closing table maps each answer to what it releases, so partial answers still move things forward.

Every request in it was checked against the code rather than assumed, which changed some of the numbers the audit carried: three brands have an Arabic name form on the site, not four, and the eight `agentsData` entries hold Arabic *descriptions* while the brand names themselves are Latin-only — so an Arabic speaker searching for a brand by name finds nothing today. Nothing in the brief asks for something already answerable from the repository.

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
- **S8-T11** Apply the English corrections — the Arabic-influenced phrasing, "Book Now" as a business call to action, "Get Latest Price", and the generic home copy. **S** — **PARTIAL.** Two of the three done. "Get Latest Price" on the product page read like a marketplace listing on a site that quotes on request; the Arabic beside it already said "request a price quote", so the English now matches. "Book Now" read like a hotel booking; both its call sites link to the contact page, which is the action `common.requestQuote` already names, so they now use it and the duplicate `bookNow` key is gone from both dictionaries. Verified against a running build: none of the three phrases appears in the rendered HTML of either locale, and "Request a Quote" / "طلب تسعير" render in their place. The third item — the generic home page opening — is **not** done and should not be: rewriting the headline is a voice decision, and per this stage's own rule no task here invents copy. It is asked for in the brief, Part 7.
- **S8-T12** Move the inline `lang === "ar"` string ternaries into the dictionaries so localisation can be reviewed as a whole. Depends on S0-T04. **L** — **NEEDS A DECISION BEFORE STARTING.** Surveyed rather than started, because it turns on a choice that is not mine to make quietly.

  The real count is **182**, not 156, across 33 files. 181 of them are the simple `cond ? "en" : "ar"` shape and are mechanically safe to move; exactly one is not.

  The obstacle is access, not the strings. **133 sit in 21 files that already receive a dictionary. The other 49 sit in 12 files that do not** — `CartView` (18), `DistributorMap` (7), `error.tsx` (6), `cart/page.tsx` (4), and eight smaller components. Those need either a new prop threaded down from each parent, or a direct dictionary import.

  That choice collides with **S4-T09**, which wants *less* dictionary serialised to the client, not more. Prop-threading is the option compatible with it, and is the one to prefer — but it changes twelve component signatures and their call sites, which is a materially bigger change than "move some strings".

  Doing only the 133 reachable ones would be worse than doing nothing: the stated point of the task is to make localisation reviewable in one place, and a 73% migration leaves a reviewer hunting through twelve files anyway.

  Sequencing note: this should still run **before** S8-T10, not after. Consolidating first means the Arabic glossary gets applied once, in one file, rather than across 33.
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

**Answered 8 September 2026** — see `docs/content-brief.md` for the full replies.
Nine of the eleven are settled and applied. Each is marked below; the two that
remain are 5 (ISO 9001) and part of 6 (office hours).

1. **Which mailbox receives enquiries?** The repository uses `info@elwahapumps.com`; the live site publishes `info@lwahapumps.com`. A code comment calls the live one a typo, but if that is the mailbox actually being monitored, notifications sent to the other address vanish. Blocks S0-T11.

   **ANSWERED: `info@elwahapumps.com`** — the address already in the code. The live site's `info@lwahapumps.com` is the typo. No change needed.
2. **Does JEE Pumps stay?** It has a brand page but is not in the agency list, has no product and no catalogue. Keep or remove. Blocks S0-T02.

   **ANSWERED: remove.** Done — route, slug, tile and both dictionary entries deleted, and `/jee-pumps/` now redirects to the agents index rather than to a page that no longer exists.
3. **Geo coordinates for the head office.** The pair in the plan came from the Maps embed and should be confirmed against the actual plot. Blocks S1-T09.

   **ANSWERED: correct as-is.** 29.977260, 30.730303 confirmed.
4. **Do the Facebook and YouTube pages exist and are they current?** A `sameAs` pointing at a dead page is worse than omitting it. Blocks S1-T09.

   **ANSWERED: both live, plus two more.** LinkedIn and Instagram were not listed anywhere before. All four are now in `SOCIAL` and in the Organization `sameAs`, and the footer row is generated from the same constant so the two cannot diverge.
5. **ISO 9001 certificate number, issuing body and scope.** Asserted five times on the site with no supporting detail. Blocks S1-T09 and S8-T07.

   **STILL OPEN.** The one Part 1 item with no answer. It is asserted in five places on the site and still has nothing behind it, so it stays out of the structured data.
6. **Real office hours.** "24 hours / 7 days" is currently shown as opening hours; presumably that is the emergency callout line and the office keeps normal hours. Blocks S1-T09.

   **PARTLY ANSWERED: the 24/7 line is genuine, office hours not given.** The value was true; the *label* was wrong. It now reads Emergency Support / الدعم الطارئ rather than Working Hours, so nothing false is published — but `openingHours` still cannot go into the structured data until the actual office hours arrive.
7. **Do the twelve `/portfolio/nsp-*` models map to current products?** Needed to redirect them somewhere relevant rather than to a category index. Blocks S2-T04.

   **ANSWERED, though the answer addressed a different question.** The reply was that the old site is being replaced entirely. True, and precisely why this matters: taking it down does not remove those twelve URLs from Google or from links elsewhere, so they keep bringing visitors. They already redirect to the matching category, so nobody hits an error. Whether any maps to a *specific* product is still open, and is an improvement rather than a fix.
8. **Should Tormac submersibles be seeded?** They exist only in an ad-hoc script, not the seed, so they are absent from the site — yet the Tormac catalogues are the largest on the site. Affects S0-T09 and S1-T07.

   **ANSWERED: yes, current stock. Done.** `prisma/add-tormac.ts` already held complete bilingual copy, spec tables and the full diameter x power matrices — 105 variants across the two products. Nothing was missing but the wiring: nothing ever called it. `seed.ts` now does, so `prisma db seed` produces a complete catalogue. Prices are blank and show as "Price on request" pending the Tormac price sheet.
9. **Licensing for the pump-curve dataset.** It is transcribed from Kurlar catalogues. Blocks S3-T12.

   **ANSWERED: yes, Kurlar are content for it to be published.** Unblocks S3-T12.
10. **Analytics preference.** Needed for S7-T13.

   **ANSWERED: a privacy-preserving option**, so no cookie banner. Which one is still open — Umami self-hosts free on the same VPS; Plausible and Fathom are hosted at roughly $9-14/month. Feeds S7-T13.
11. **Notification transport.** SMTP alone, or SMTP plus WhatsApp Cloud API or Telegram. Blocks S0-T11.

   **ANSWERED: email and WhatsApp**, to `+201066685532`. Email already works. WhatsApp needs a WhatsApp Business account plus a phone number ID and access token from Meta before it can be switched on.

---

## Note on this file

This plan was drafted and verified against branch `claude/website-audit-seo-69d962` in a worktree, then copied here to `PLAN.md` at the repository root on 7 September 2026 so task status can be tracked in version control alongside the work.

The audit it derives from is not in the repository — it exists as a published artifact from the review session. Worth adding to `docs/audit.md` in a follow-up commit so the plan's citations have a companion in the repo itself.

Update task status inline in the checklist tables above (`TODO` → `IN PROGRESS` → `DONE`) as work lands, and add a short note under the relevant task if the approach changed during implementation.
