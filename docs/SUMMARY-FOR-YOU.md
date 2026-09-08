# What happened, in plain terms

A summary of the work on the El Waha Pumps site. Written 8 September 2026.

No jargon where I can avoid it. If you only read one section, read the first.

---

## ⚠️ Do not delete either folder

You asked which folder to keep so you could delete the other. **The answer is
that you cannot delete either one**, and here is why.

The new work lives in a folder that sits *inside* your main project folder:

```
D:\project el waha\elwahapumps-Main (1)\elwahapumps-Main\     ← your main folder
└── .claude\worktrees\website-audit-seo-69d962\               ← the new work, inside it
```

More importantly, the entire project history — every version of every file ever
saved — is stored **only** in the main folder. The inner folder has no copy of
its own; it reads from the main one.

So deleting the main folder would delete both, and all the history with it.
There is no backup anywhere else.

**What to do instead:** move the finished work *into* the main folder, then
delete the inner one. That leaves you with a single folder containing
everything, which is what you wanted. It is about ten minutes of careful work
and I can do it whenever you say — just ask.

Nothing is lost right now. Your 77 design files are still sitting in the main
folder exactly as you left them, and I also saved a separate copy of them under
the name `design-system-pass` in case anything ever goes wrong.

---

## What the job was

Your new site was built but never put online — `elwahapumps.com` still shows the
old WordPress site. So the work was not about patching a live site. It was about
making sure that when you do switch over, nothing breaks and nothing that Google
already knows about your business gets lost.

A full audit found the engineering underneath was sound, but almost everything
that makes a site *findable* was missing: no sitemap, no page titles (16 of 18
pages shared one title), nothing telling Google the Arabic and English versions
are the same site, and no redirects for the 61 old addresses people still click.

That became a plan of 119 numbered jobs, in `PLAN.md`, worked through in nine
stages.

---

## Where things stand

**68 jobs finished. 42 left, and all 42 are deliberately for after you go
live.** Every job that needed doing *before* the switch is done.

Here is what each stage did, in ordinary terms.

**Things that were broken.** Three brand pages returned "page not found" from
your own menu. Two products never appeared on the site at all because of a
missing line in a setup file. Every category page listed "Sharaf DG", "Ehab
Center" and "Cairo Sales" as places to buy your pumps — copied from a design
mock, and exactly the sort of thing a search engine will repeat as fact about an
exclusive-agency distributor. A 162 MB folder of duplicate photos was shipping
with every deploy. And most seriously: **contact form enquiries were saved to
the database and nobody was told** — no email, no message, nothing. A lead was
only seen if someone happened to open the admin panel.

**Being found.** Every page now has its own title and description, tells Google
how the Arabic and English versions relate, and carries machine-readable
business details — your address, phone numbers, the twelve agencies, your social
profiles. Sitemap and robots file added. Product pages describe themselves in a
format that can appear as a rich search result.

**The move from the old site.** All 61 old addresses now redirect to the right
new page — verified 68 times over, automatically. Two things about how Next.js
handles redirects were genuinely surprising and only found by testing against a
running server, not by reading documentation.

**Being quotable by AI assistants.** A summary file assistants look for, a
stated policy on which AI crawlers may read the site, and two data endpoints so
a procurement tool can read your catalogue directly. Your pump selector is now
available as data too — it is the most distinctive thing on the site and it was
only reachable by clicking through a form.

**Speed.** The homepage was loading three stock photographs of *other
companies'* installations from an external service. Replaced with your own
photography. About 345 MB of oversized photos re-compressed down to 30 MB —
nobody was downloading those, but your server was decoding a 24-megapixel file
every time someone loaded a page. The animation library was removed entirely.

**Layout.** Your fixed header is between 95 and 139 pixels tall depending on
screen size, but pages were only leaving 72 to 80 pixels of room — so the top of
most pages was hidden behind it. Five pages hid this with patches, three did not
and were visibly broken. Also fixed: on the Arabic site, the buttons in the
homepage banner sat on the opposite side from the headline they belonged to, the
category sidebar appeared on the wrong side in *both* languages, and phone
numbers displayed as `20 106 668 5532+` with the plus sign at the wrong end.

**Accessibility.** Six page headings were dark green on black — effectively
invisible. The products menu could not be opened with a keyboard at all, which
is the main route into your catalogue. The mobile menu could be tabbed into
while invisible. Added a skip link, labelled the cart fields properly, and made
the contact form actually show the specific error the server sends back instead
of a generic message.

**Security.** No security headers at all. The admin login had no limit on
attempts, so passwords could be guessed automatically, and its response time
revealed which email addresses were real. The published default admin password
stayed valid forever. The contact form could be spammed without limit. All
fixed, plus database indexes, a proper backup script, and the admin account now
forced to change its password on first sign-in.

---

## Your design work

While the above was happening, you were doing your own design pass — 77 files,
the shared page-header component, removing rounded corners and shadows, and a
test that enforces the brand rules.

Both sets of work started from the same point and overlapped on 31 files.

**Your design is now merged in and kept.** Your page headers, the rebuilt
product page, the services tabs, the new homepage, and your design test — which
now runs as a permanent guard so the design cannot quietly drift back.

The one thing to know: your versions were written *before* the fixes above, so
taking them as-is would have silently undone 19 of them. Every one was checked
and put back. Your design also had six small problems of its own, which I fixed
while merging — gold text on white that was unreadable, a duplicated breadcrumb,
and some heading-order issues.

**The Aristoncavi cable** you asked about is now correct — name, description,
photo and the eight cross-sections. Your files were always right; the problem
was that the setup script deliberately does not overwrite existing products (so
it cannot destroy your admin edits), which meant your rename never reached the
database and nothing said so. It now warns you when that happens.

---

## What is waiting on you

**The switch itself.** Everything is ready. Changing the DNS needs your hosting
access. Before that, please restore one database backup on a test setup — an
untested backup is a guess.

**Eight pieces of information** (in `docs/content-brief.md`, smallest first):

1. Office / showroom hours — the site cannot publish opening times without them
2. Which analytics tool — Umami is free and self-hosted; Plausible and Fathom
   are about $9–14 a month
3. Whether any old `NSP-` model matches a current product (safe as-is)
4. Commercial register, tax card and VAT numbers — the legal pages need these
5. Confirm the Arabic legal name spelling against your commercial register
6. WhatsApp Business credentials — the alerts are built and waiting
7. Tormac prices — 105 sizes are live showing "Price on request"
8. **ISO 9001 certificate number, issuer and scope** — the only question with no
   answer at all, and it is claimed in five places on the site

**Bigger content pieces, still open:** descriptions and Arabic names for the
twelve manufacturers (eight have a logo and nothing else), five to ten project
case studies, the questions your sales team actually gets asked, event dates,
and agreeing one Arabic term for each of pump, motor, submersible, head and
flow — the site currently uses several.

---

## Honest notes

A few things worth saying plainly.

**I was wrong once and corrected it.** I told you the Tormac products needed
descriptions written. They did not — the file already had complete bilingual
copy. Nothing had ever run it. Corrected in the brief.

**One thing I deliberately did not do.** Rewriting your homepage headline is a
decision about your voice, not a technical fix, so I left it and asked instead.

**One decision I stopped and left to you.** Consolidating 182 bilingual text
snippets into the translation files would make the Arabic reviewable in one
place — but 49 of them sit in components that would need restructuring, and that
choice conflicts with a separate performance goal. Doing half would be worse
than doing none. The measurements are in `PLAN.md`.

**Where to look.** `PLAN.md` is the full task list with status. `docs/HANDOFF.md`
is the technical handover for a new session. `docs/content-brief.md` holds your
answers and what is still needed.
