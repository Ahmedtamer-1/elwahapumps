# Off-site listing update checklist (PLAN.md S2-T08)

The live WordPress site currently publishes facts that don't match this
codebase's `src/lib/company.ts` (the single source of truth as of Stage 0):

| Field | Live site says | Correct value (`lib/company.ts`) |
|---|---|---|
| Phone | `+20106668553` (one digit short) | `+201066685532` |
| Email | `info@lwahapumps.com` (domain typo) | `info@elwahapumps.com` |
| Years in business | "more than 20 years" | Founded 2013 — `yearsOfService()` |
| Agencies | inconsistent counts | 12 — `AGENCY_COUNT` |

Fixing the website does not fix anywhere else these facts are published.
This is a manual checklist — it can't be scripted or verified from inside
this repository, and it needs your access to each property. Do this
**before or at cutover** (S2-T09), not after — a stale Google Business
Profile keeps showing the wrong phone number to searchers regardless of
what the website says.

## Checklist

- [ ] **Google Business Profile** — phone, website URL, hours, and the
      business description. This is usually the single highest-impact
      fix: it's what shows in Google Maps and the local pack.
- [ ] **Facebook page** (`facebook.com/elwahapumps`, linked from the
      footer and in `lib/company.ts` `SOCIAL.facebook`) — About section
      phone/email, and confirm the page is still active and owned by the
      company before `sameAs` structured data keeps pointing at it.
- [ ] **YouTube channel** (`youtube.com/@elwahapumps`, `SOCIAL.youtube`)
      — About section, same check.
- [ ] **Any Egyptian B2B directories** the company is listed on
      (industry directories, chamber of commerce, trade association
      listings, Yellow Pages–style sites) — you'll know which ones exist;
      this repo has no way to discover them. Update phone, email, and
      the founding year on each.
- [ ] **WhatsApp Business profile** (if separate from the number itself)
      — business description and hours.
- [ ] **Any print materials or business cards referencing the phone
      number or email** — not urgent for search, but worth a mental
      note while updating everything else.

## After completing this checklist

Every property listed above should show the same phone, email, and
founding year as `src/lib/company.ts`. There's no automated check for
this — it's a manual read-through of each property once updated.
