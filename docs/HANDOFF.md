# Handoff — El Waha Pumps site

For whoever picks this up next, human or model. Written 8 September 2026.

Read this before touching anything. The repository layout has one trap in it
that will destroy work if you get it wrong, and it is described first for that
reason.

---

## 1. Read this first — the folder trap

There are two working directories, and **one lives inside the other**:

```
D:\project el waha\elwahapumps-Main (1)\elwahapumps-Main\        ← main checkout
├── .git\                                                        ← the ONLY git repository
└── .claude\worktrees\website-audit-seo-69d962\                  ← git worktree, all recent work
```

The worktree has no repository of its own. Its `.git` is a file pointing back at
`…\elwahapumps-Main\.git\worktrees\…`. Consequences:

- **Deleting the main checkout deletes everything**, including the worktree
  nested inside it and all 16 commits of history. There is no second copy.
- The two directories share branches, refs and stashes. `git stash` in one
  affects the other.
- Never run `git worktree remove` or delete `.claude/worktrees/` until the work
  has been checked out in the main folder and verified.

The user asked about deleting one of the folders. The answer is **no** — the
right move is to consolidate into the main checkout (§7).

---

## 2. Where the work is

| Branch | What it holds | State |
|---|---|---|
| `merge/design-system` | **Everything.** Eight stages of remediation + the user's design pass, merged. | Current, 16 commits ahead of `Main` |
| `design-system-pass` | Snapshot of the user's 77 uncommitted design files, taken before any merge | Safety net, verified byte-identical to their working tree |
| `Main` | State before any of this work | Untouched, at `0826c73 edit logos` |

The **main checkout is still sitting on `Main`** with the user's 77 files
uncommitted in its working tree. Those same files are preserved on
`design-system-pass`, so they cannot be lost, but the main checkout has never
received any of the eight stages.

To see the real site: run the dev/prod server **from the worktree**, not the main
folder. Running from the main folder shows the pre-work site, which caused
genuine confusion once already.

---

## 3. What the work was

The live site is still the old WordPress build; this repo is the replacement and
has **not been deployed**. So the goal was a safe cutover, not incremental
patching. `PLAN.md` (repo root) is the source of truth: 119 tasks across nine
stages, each with a why, files, acceptance criteria and a status.

Current tally: **68 DONE, 2 PARTIAL, 3 BLOCKED, 42 TODO.**

Every pre-cutover task is done. All 42 TODOs are explicitly post-cutover work.

| Stage | Subject | State |
|---|---|---|
| 0 | Launch blockers | Done |
| 1 | Discovery layer (metadata, sitemap, robots, JSON-LD) | Done |
| 2 | Migration safety (68 legacy redirects) | Done except the cutover itself |
| 3 | AI-search readiness | Done; 3 blocked on user input |
| 4 | Performance | Pre-cutover done; 6 post-cutover TODO |
| 5 | Design system | Pre-cutover done; superseded in part by the user's own design pass |
| 6 | Accessibility | Pre-cutover done; 6 post-cutover TODO |
| 7 | Security and data hardening | Pre-cutover done; 7 post-cutover TODO |
| 8 | Content and conversion | Mostly blocked on copy from the user |

---

## 4. The merge — what won, and why

The user had done an independent "Deep Oasis" design-system pass (77 files,
uncommitted) while the eight stages were being built. Both forked from
`0826c73`. They overlapped on 31 files, 25 of which conflicted.

**Resolution rule: the eight-stage branch was the base, and the design was
applied on top.** The design delta is largely mechanical token substitution; the
stage delta is structural (migrations, API routes, security, tests). Re-applying
the mechanical one was the safer direction.

**Taken from the design pass:** the `PageHeader` component and its six
adoptions, the services tab bar, the rebuilt product detail page, About, home
and selector, `ServiceCard`, the Aristoncavi rename, the new `home` dictionary
block, and 391 grey / 149 radius / 39 shadow token swaps. Their
`src/lib/design-system.test.ts` is now a permanent guard and passes.

**Kept from the stages,** because the design pass predated them and would have
reverted them — 19 items, all verified present afterwards. The largest was page
metadata: none of their pages export `generateMetadata`, so every route would
have fallen back to the site-wide title and lost its canonical and hreflang.
Also the skip link, JSON-LD, mega-menu keyboard access, drawer focus trap,
contact-form live region and honeypot, labelled cart inputs, always-rendered
spec tables, the server-rendered home teaser, `?subject=` wiring, `--header-h`,
and the deletions of the dummy retailer filters and JEE Pumps.

**Merged rather than picked:** the dictionaries. Their new keys were taken onto
the stage base, which keeps the `{count}` placeholders — their version hardcodes
"Twelve", which is the drift `AGENCY_COUNT` exists to prevent.

Six defects in the design pass were fixed during the merge: brass on white at
2.16:1, a duplicate breadcrumb landmark on product pages, heading-order breaks on
three pages, a dangling `hover:` class, a reintroduced `dict: any`, and
`stone-light` at 3.47:1 on the selector.

---

## 5. Two traps that cost real time — do not repeat them

**`prisma.config.ts` does not run the seed through a shell.** Chaining with
`&&` silently executes only the first command; the seed reports success having
done half the work. `prisma/seed.ts` now imports and calls `addTormac()`
directly. Verified by deleting rows and re-seeding.

**The seed is create-only (S7-T07), so fixture changes do not reach existing
rows.** This is deliberate — it stops a re-seed destroying edits made in
`/admin` — but it means a legitimate rename in `src/data/products.ts` or the
dictionaries silently does not apply. This bit the user: the Aristoncavi cable
rename was correct in every source file and the site kept showing the old
product. The seed now compares each row against the fixture and names any that
differ, with the command to apply them:

```bash
SEED_OVERWRITE_PRODUCTS=1 npx prisma db seed
```

Anyone changing product content in source must know this.

---

## 6. Verification — what to run, and what "good" looks like

```bash
npm run lint          # 0 errors, 8 pre-existing unused-import warnings
npm run typecheck     # clean
npm test              # 50 pass (36 pump-selector, 14 rate-limit/clientIp)
npx tsx --test src/lib/design-system.test.ts   # 5 pass — the design guard
npm run build         # clean; prebuild regenerates public/llms-full.txt
```

Against a running server (`PORT=3001 npm start` from the worktree):

```bash
node scripts/verify-redirects.mjs --target=http://localhost:3001   # 68/68
```

**Do not trust a passing build alone.** Several real defects in this work only
appeared at runtime — a client-component `not-found.tsx` that silently failed to
register, JSON-LD missing its `type` attribute, Next's redirect matching
requiring percent-encoded sources. Start a server and check the rendered HTML.

Accessibility is checked by loading axe-core in the browser. Current state: zero
violations on home (both locales), about, agents, contact, services, support,
cart, selector and a product page. The category page still reports three landmark
rules from its nested `<main>` — that is S6-T12, scheduled post-cutover, and is
the only known violation on the site.

**Two testing traps.** A zero-width viewport makes axe resolve every background
as white and invent contrast violations — assert `window.innerWidth` first. And
`:focus` styles never match while the browser pane is hidden, so focus tests must
click into the page first.

---

## 7. The immediate next step

Consolidate into the main checkout so there is one folder. The user has asked for
this. Suggested order, verifying between steps:

1. In the main checkout, confirm `design-system-pass` still matches its working
   tree (it did at handoff — compare `git write-tree` with a temporary index
   against `design-system-pass^{tree}`).
2. Check out `merge/design-system` in the main checkout. The 77 uncommitted files
   are safe on the snapshot branch, so this is recoverable.
3. Verify the site runs from the main folder — build, serve, spot-check.
4. Only then remove the worktree with `git worktree remove`.

Do not delete any directory by hand.

---

## 8. What is blocked, and on whom

**On the user — the cutover (S2-T09).** Needs DNS and hosting access. Every
pre-cutover task it depends on is done. There is also a restore rehearsal to do
once on staging (S7-T09) before trusting the backup script.

**On the user — content.** `docs/content-brief.md` was answered for most of
Part 1 and some of Part 2. Still outstanding, smallest first:

1. Office / showroom hours — the site cannot publish opening hours until this
   arrives (the 24/7 line is now correctly labelled emergency support)
2. Which analytics tool — Umami self-hosted, or Plausible / Fathom
3. Whether any `NSP-…` model maps to a current product (safe as-is)
4. Commercial register, tax card and VAT numbers — legal pages wait on these
5. Confirmation of the Arabic legal-name spelling against the commercial
   register (recorded as `الواحة لخدمات الآبار والطلمبات`, supplied without
   full orthography)
6. WhatsApp Business API credentials — the notification path is built and inert
7. Tormac prices — 105 variants live, all showing "Price on request"
8. **ISO 9001 certificate number, issuer and scope** — still the only Part 1
   item with no answer at all, and it is asserted in five places on the site

Parts 3 to 8 of the brief are untouched: the twelve manufacturers, project case
studies, the FAQ, event dates, Arabic terminology, and the quote-flow decisions.

**Blocked on a decision, not on data — S8-T12.** Moving 182 inline
`lang === "ar"` strings into the dictionaries. 181 are mechanically safe; the
obstacle is that 49 sit in 12 components that cannot reach a dictionary, so they
need either prop-threading or a direct import — and that choice collides with
S4-T09, which wants *less* dictionary serialised to the client. Doing only the
reachable 133 would be worse than nothing. Full measurements are in `PLAN.md`.

---

## 9. Conventions worth keeping

- **`PLAN.md` is the ledger.** Update task status as work lands, and record what
  was actually done and verified — not just "done". It is kept in sync between
  the worktree and the main checkout by copying.
- **Never invent a fact about the business.** Stage 8's rule, and it held: no
  claim, certificate number, warranty term or brand description was written
  without the company supplying it. Ask via the brief instead.
- **Flag rather than guess.** Where something could not be verified — dataset
  licensing, Arabic transliterations, NSP model mapping — it was marked BLOCKED
  with the reason, not filled in speculatively.
- **Commit messages carry the why**, including what was tried and rejected. The
  two seed traps in §5 are documented in their commits.
