# Content brief — what the site needs from you

> **Answered 8 September 2026 — Part 1 complete except office hours, Part 2 partially.**
> Answers are recorded inline below, marked **ANSWERED**. What is still
> outstanding is listed in [Still needed](#still-needed) at the foot of Part 2.
> The unanswered parts (3 to 8) are unchanged and still open.

This is the one document that unblocks the rest of the work. Everything asked
for here is something only El Waha can answer: a fact about the business, a
decision about how it trades, or a piece of copy in your own voice. Nothing on
this list can be derived from the code, and none of it will be invented.

**How to use it.** Fill in the blanks in place, or answer in whatever form is
easiest — a reply, a spreadsheet, a voice note. The section headings say what
each answer is for and what it is holding up, so you can answer the expensive
parts later and the cheap parts now.

**If you only have ten minutes**, answer [Part 1](#part-1--blocking-questions).
Those eleven items block work that is otherwise finished, and several are
one-word answers.

---

## Part 1 — Blocking questions

Short answers. Each one is holding up a task that is otherwise complete.

### 1.1 Which mailbox actually receives enquiries?

The site sends every contact form and quote request to **`info@elwahapumps.com`**.
The old WordPress site publishes **`info@lwahapumps.com`** — no `e` after the
`@`. One of these is a typo, but we cannot tell which from the outside, and if
the live one is the mailbox somebody actually watches, every notification the
new site sends will vanish silently.

**ANSWERED — `info@elwahapumps.com`.** The address already in the code is the
right one; the one on the old WordPress site is the typo. Nothing to change.
*(Not asked again: whether `info@lwahapumps.com` also receives mail. If it is a
live mailbox it is worth keeping an eye on until the old site is gone.)*

### 1.2 How should a new enquiry reach you?

Right now a lead is emailed. Email is easy to miss on a site visit.

**ANSWERED — email and WhatsApp, to `01066685532`** (`+201066685532`, the sales
line already on the site).

Still needed to switch WhatsApp on: it requires a **WhatsApp Business** account
and API credentials — a phone number ID and an access token from Meta. Email
notification already works; WhatsApp is built but inert until those are set.

### 1.3 Does JEE Pumps stay?

It has a brand page on the site, but it is not in your list of twelve agencies,
has no products and no catalogue. Either it is a real agency that is missing
everywhere else, or the page is left over and should go.

**ANSWERED — remove it.** Done: the brand page, its route and its dictionary
entries are gone, and `/agents/jee-pumps` now redirects to the agents index so
any existing link still lands somewhere sensible.

### 1.4 Are the Facebook and YouTube pages live and current?

The site tells search engines these are your official profiles. Pointing at a
dead or abandoned page is worse than not listing one at all.

**ANSWERED — all four confirmed.** Facebook and YouTube as listed, plus two we
did not have:

- Facebook — `https://facebook.com/elwahapumps`
- YouTube — `https://youtube.com/@elwahapumps`
- LinkedIn — `https://www.linkedin.com/company/el-waha-for-wells-services-and-pumps/`
- Instagram — `https://www.instagram.com/elwahapumps1/`

All four are now published in the structured data, so search engines and AI
assistants can tie the profiles to the company.

### 1.5 What are the real office hours?

The site currently shows **"24 hours / 7 days a week"** as the opening hours.
That is almost certainly the emergency callout line rather than the office.
Search engines publish this as your opening times, so a customer may turn up
on a Friday expecting a counter to be open.

**PARTLY ANSWERED — yes, the 24/7 line is genuine.**

**Still needed: the office / showroom hours.** These are two different facts and
the site currently publishes the 24/7 one as its *opening hours*, which is what
sends someone to a closed gate on a Friday. The 24/7 line is now labelled as
emergency support rather than opening times, but the opening times themselves
cannot be published until you say what they are.

- [ ] Office / showroom hours: ________________

### 1.6 ISO 9001 — certificate number, issuer and scope

The site claims ISO 9001 certification in five places, with no supporting
detail. A certification claim needs to be checkable.

- [ ] Certificate number: ________________
- [ ] Issuing body: ________________
- [ ] Scope as written on the certificate: ________________
- [ ] Expiry / next surveillance date: ________________
- [ ] Can you send a scan or PDF? It can be linked from the About page.

### 1.7 Head office coordinates

The map pin came from the embed on the old site. Worth confirming it lands on
your gate rather than a neighbouring plot, because this is what a driver's
phone will navigate to.

Current pin: **29.977260, 30.730303** (CPC Industrial Complex, 6th Industrial
Zone, 6th of October City).

**ANSWERED — correct as-is.** Pin confirmed at 29.977260, 30.730303. No change.

### 1.8 Do the twelve old `NSP` model pages map to current products?

The old site had a page per model. Those addresses are still indexed and people
still click them. Each currently redirects to a general category page, which is
better than an error but loses the visitor's intent.

The models: `NSP-6010`, `6017`, `6030`, `6046`, `6060`, `7077`, `7095`, `7096`,
`8112-series`, `8125`, `8160`, `10210`.

**ANSWERED, though the question may have landed differently than intended.**

Your answer: the old site is going away entirely — this build replaces it.

That is right, and it is exactly why this question matters rather than the
reverse. Taking the old site down does not remove its pages from Google, and it
does not stop people clicking links to them that already exist elsewhere. Those
twelve addresses will keep receiving visitors for months. What we control is
where each one lands.

They already redirect to the matching category page, so nobody hits an error.
The only thing still open is whether any of the twelve maps to a *specific*
product today — a visitor searching for "NSP-8125" would rather land on that
pump than on a category list.

- [ ] Leave as-is (safe, and what happens today), **or**
- [ ] `NSP-…` corresponds to today's ________________ range

### 1.9 Should Tormac submersibles be on the site?

Tormac has the largest catalogues on the site, but its submersible pumps exist
only in a side script and never made it into the catalogue, so they do not
appear anywhere a customer can find them.

**ANSWERED — add them, current stock. Done, and no copy needed after all.**
`prisma/add-tormac.ts` turned out to carry complete bilingual descriptions,
specification tables and the full diameter x power matrices — 65 pump variants
and 40 motor variants. Nothing was missing but the wiring: nothing ever ran it.

It is now called from the seed, so `prisma db seed` produces a complete
catalogue rather than leaving the site's two largest PDFs pointing at products
that did not exist.

Prices are blank on all 105 variants and show as "Price on request" until
someone enters them in `/admin/products`. That is the only outstanding piece,
and it is a job for whoever holds the Tormac price sheet.

### 1.10 Can the pump-curve data be published?

There is a dataset of 27 pump families and 926 variants — head, efficiency and
NPSH — transcribed from Kurlar's printed catalogues. Published openly it would
be genuinely useful and would attract exactly the engineers you want. But it is
Kurlar's data, and publishing it is a question for them, not for us.

**ANSWERED — yes, Kurlar are content for it to be published.** This unblocks
publishing the 27-family / 926-variant curve dataset as citable data (S3-T12).

### 1.11 Website analytics

**ANSWERED — a privacy-preserving option**, so no cookie banner.

One choice left, and it is only about cost: **Umami** can be self-hosted on the
same VPS for nothing; **Plausible** and **Fathom** are hosted, around $9–14 a
month, and nothing to maintain.

- [ ] Umami (self-hosted, free) / Plausible / Fathom

---

## Part 2 — Company and legal facts

These populate the footer, the legal pages and the machine-readable business
record that search engines and AI assistants read.

| Item | Needed for | Your answer |
|---|---|---|
| Full registered legal name (Arabic) | Legal pages, structured data | **الواحة لخدمات الآبار والطلمبات** — see the note below |
| Full registered legal name (English) | Same | **El Waha for Wells and Pumps** |
| Entity form (LLC, SAE, sole trader…) | Footer legal line | **SAE** (joint-stock) |
| Commercial register number | Footer legal line, terms | *still needed* |
| Tax card number | Same | *still needed* |
| VAT registration number, if separate | Same | *still needed* |
| Registered address, if different from the office | Legal pages | Same as the office — CPC Industrial Complex, 6th Industrial Zone, 6th of October City |

> **One thing to confirm on the Arabic name.** You wrote it as
> *الواحه لخدمات الابار والطلمبات*. It has been recorded as
> **الواحة لخدمات الآبار والطلمبات** — that is, with *ة* rather than *ه* at the
> end of الواحة, and *الآبار* rather than *الابار*. Those are the standard
> spellings and almost certainly just quick typing, but this is the registered
> legal name going onto legal pages and into structured data, so it is worth one
> look against the commercial register before it is set.
>
> The English name also changed: the site previously said *El Waha Pumps & Wells
> Services*, and now uses **El Waha for Wells and Pumps** as you gave it. The
> short trading name *El Waha Pumps* is unchanged and still used for page titles
> and link previews, where the full legal name is too long.

**Warranty terms.** The site says "factory warranty" throughout. To publish a
warranty page we need the actual terms:

- [ ] Warranty length, by product type (pumps / motors / panels / cable): ______
- [ ] What it covers, and what voids it: ________________
- [ ] Who honours it — El Waha, or the manufacturer through El Waha? ______
- [ ] Is there a written warranty document already? A scan is ideal.

**Returns and delivery**, for the terms page:

- [ ] Delivery coverage and typical lead time: ________________
- [ ] Are returns accepted? On what terms? ________________
- [ ] Payment terms offered to trade customers: ________________

---

## Still needed

Everything from Part 1 and Part 2 that is not yet settled, smallest first.

1. **Office / showroom hours** (1.5). One line. Until this arrives the site
   cannot publish opening hours at all — the 24/7 line is now correctly labelled
   as emergency support, so nothing false is being shown, but nothing useful is
   either.
2. **Which analytics tool** (1.11). Umami self-hosted and free, or Plausible /
   Fathom hosted at roughly $9–14 a month.
3. **Whether any `NSP-…` model maps to a current product** (1.8). Safe as-is;
   this only improves where those visitors land.
4. **Commercial register, tax card and VAT numbers** (Part 2). These are what the
   legal and terms pages are waiting on.
5. **Confirm the Arabic legal name spelling** (Part 2, note above).
6. **WhatsApp Business API credentials** (1.2) — phone number ID and access
   token. The notification path is built and will start working the moment they
   are set.
7. **Tormac prices** (1.9). The products are live with all 105 variants, but
   every price is blank and shows as "Price on request" until the Tormac price
   sheet is entered in `/admin/products`.
8. **ISO 9001 certificate details** (1.6) — still the one Part 1 item with no
   answer at all, and it is asserted in five places on the site.

Then Parts 3 to 8, which are the larger content pieces: the twelve
manufacturers, project proof, the questions your sales team gets asked, event
dates, Arabic terminology, and how you want the quote flow to work.

---

## Part 3 — The twelve manufacturers

You are the exclusive Egyptian agent for twelve brands. Four have a real page.
The rest are a logo and nothing else, which is the single biggest content gap on
the site: "exclusive agent for twelve manufacturers" is your strongest claim and
eight of them are currently unsubstantiated.

For **each** brand below, we need three things. Two or three sentences each is
plenty — this is not marketing copy, it is what you would tell a customer who
asked "why this brand?".

1. **What they make**, in your words.
2. **Why El Waha carries them** — what problem they solve that the others do not.
3. **The Arabic form of the brand name**, written as your customers say it.
   This one matters more than it looks: an Arabic-speaking customer searching or
   asking a voice assistant for "روفاتي" finds nothing today, because the name
   only exists on the site in Latin script.

| Brand | Has a page? | Arabic name | What they make | Why El Waha carries them |
|---|---|---|---|---|
| Kurlar | Yes | كورلار ✓ | | |
| Astral Pipes | Yes | | | |
| PMC | Yes | | | |
| Alka | Yes | | | |
| NOVO | Yes | | | |
| Tormac | Yes | تورماك ✓ | | |
| Üntel | Yes | | | |
| Panelli | **No** | | | |
| Voltson | **No** | | | |
| Rovatti | **No** | | | |
| Franklin Electric | **No** | | | |
| Aristoncavi | **No** | | | |

Also useful, per brand: the year you took the agency, and whether the agency is
exclusive for all of Egypt or a region.

---

## Part 4 — Proof

The site claims **230+ projects** and shows none of them. It lists nineteen
client logos with no story attached. A named, dated project is worth more than
any adjective, and this is the content most likely to win a tender.

### Case studies — five to ten, ideally

For each, roughly a paragraph:

- Client or, if confidential, the sector ("a poultry farm in Beheira")
- Where, and when
- What the problem was — depth, yield, existing kit that failed
- What you supplied and installed
- The outcome, with a number if you have one (metres, m³/h, kW saved, hours to commission)
- Photographs, if any exist

### The nineteen clients already on the wall

We have their logos. It would help to know, for any of them: what you supplied,
roughly when, and whether they are happy to be named as a reference.

### Testimonials

Two or three sentences from a named person at a named company beats any amount
of copy we could write. Even one is worth having.

---

## Part 5 — What your customers actually ask

The single most valuable thing on this list, and the cheapest to produce.

Ask whoever answers the phone to write down the **ten to fifteen questions they
answer most often**, in the customer's own words, along with the short answer.
Do not tidy the wording — the phrasing customers use is exactly the phrasing
search engines and AI assistants match against.

Likely candidates, to start the list:

- How deep can your pumps go?
- How do I know what size pump my well needs?
- How long does delivery take to <governorate>?
- Do you install, or only supply?
- What warranty do I get?
- Do you service pumps you did not supply?
- Can I get a pump for a solar system?
- How much does a <size> pump cost?

Answers can be one or two sentences. These become an FAQ that search engines can
quote directly.

---

## Part 6 — Events

Three events are on the site with a year and photographs, but no dates or
venues — so they cannot be published as events, only as photo galleries.

| Event | Have | Need |
|---|---|---|
| Sahara Expo 2025 | Photos, year | Exact dates, venue, stand number |
| WaterX 2025 | Photos, year | Exact dates, venue, stand number |
| Company dinner 2025 | Photos, year | Date — or confirm this is internal and should not be listed as a public event |

- [ ] Which events are you attending in the next twelve months? Listing them
      ahead of time is what makes an events page worth visiting.

---

## Part 7 — Language and copy corrections

### Arabic

The Arabic is understandable throughout, but it uses different words for the
same thing in different places, which reads as careless to a native customer and
splits search traffic. We need **one agreed term for each**, from a native
speaker who knows the trade — not a translator:

| Concept | Currently written as | Agreed term |
|---|---|---|
| Pump | طلمبة / مضخة | |
| Motor | موتور / محرك | |
| Submersible | غاطس / غاطسة | |
| Head (pressure) | ضاغط / رفع | |
| Flow rate | تصرف / معدل تدفق | |
| Cubic metres per hour | three different notations | |

One known mistranslation to confirm: submersible motor cable is currently called
**كابل بحري** ("marine cable"), which is a different product. Should it be
**كابل غاطس**?

### English

Some phrasing reads as translated. We will correct the obvious cases, but tell
us if any of it is deliberate:

- "Book Now" on a quote button — reads like a hotel. "Request a quote"?
- "Get Latest Price" — reads like a marketplace listing.
- The home page opening lines are generic and could describe any supplier.

---

## Part 8 — How you want to sell

Decisions about how the site behaves, not facts.

### 8.1 The cart

The site has a shopping cart that cannot take payment — it collects items and
hands them to WhatsApp. That is the right behaviour for quote-on-request
trading, but the word "cart" promises checkout.

- [ ] Rename it "Quote list" / "Request list"
- [ ] Leave it as a cart
- [ ] Other: ________________

### 8.2 What to ask on a quote request

Today the form asks name, phone, email, subject, message. For a pump enquiry
that usually means a second phone call to get the details. Which of these should
it ask up front?

- [ ] Company name
- [ ] Governorate
- [ ] Application (irrigation / drinking water / industrial / solar)
- [ ] Well depth
- [ ] Required flow rate
- [ ] Required head
- [ ] Quantity
- [ ] File attachment (a well report or an old pump's nameplate)

Each field added raises the quality of the enquiry and lowers the number of
people who finish the form. Our suggestion: company, governorate, application
and attachment — the four that most change your answer.

### 8.3 Pages worth adding

Tick anything you want; each needs a short piece of copy from you.

- [ ] **Become a distributor** — you have a distributor network with no way to apply
- [ ] **Tenders** — if you bid for government or agricultural tenders, a page saying so
- [ ] **Solutions by application** — irrigation, drinking water, industrial, solar
- [ ] **Pump size guides** — 4", 6", 8", 10", each linking to the selector

---

## What happens once this comes back

Roughly in this order, and each part can start as soon as its answer arrives —
nothing waits for the whole document:

| Your answer | Unblocks |
|---|---|
| 1.1, 1.2 | Lead notifications reaching a human reliably |
| 1.4, 1.5, 1.6, 1.7 | The business record search engines and AI assistants read |
| 1.3, 1.8, 1.9 | Redirects and brand pages pointing somewhere useful |
| 1.10 | Publishing the pump-curve dataset |
| Part 2 | Legal, warranty and terms pages |
| Part 3 | Eight brand pages, and Arabic brand search working at all |
| Part 4 | Case studies — the strongest tender material on the site |
| Part 5 | An FAQ that search engines can quote |
| Part 6 | Events published as events rather than photo albums |
| Part 7 | Consistent Arabic terminology |
| Part 8 | Quote flow, and any extra pages you pick |
