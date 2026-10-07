# Google Business Profile — Setup & Ranking Playbook

The GBP is usually the **single biggest local-SEO lever** for an appliance
repair business ("fridge repair near me" searches come from Maps, not the
classic web index). This playbook covers setup and the ongoing cadence.

The website side is already built and dormant — it activates the moment you
fill the env vars in `.env` (see "Wire-up" at the bottom). No code changes.

---

## 1. Create / claim the profile

1. Go to <https://business.google.com> → Add business.
2. **Name:** `RepairKL` — exactly as it appears on the site (`site.ts`
   `SITE.name`). No keyword stuffing ("RepairKL Fridge Repair KL") — Google
   filters names that don't match the signage/brand.
3. **Primary category:** `Appliance repair service`. This is the
   highest-weight field for ranking — pick it, don't invent one.
4. **Secondary categories:** `Refrigerator repair service`,
   `Air conditioning repair service`, `Washing machine repair service` (add
   only ones you genuinely offer).

## 2. NAP — keep it identical everywhere

Name / Address / Phone must match the website character-for-character.
The website's source of truth is `src/lib/seo/site.ts`:

| Field | Value on site |
|---|---|
| Name | RepairKL |
| Phone | +60 11-5580 4809 (from `@/lib/whatsapp`, override: `NEXT_PUBLIC_CONTACT_PHONE`) |
| Address | Kuala Lumpur (area-level — service business) |
| Hours | Sat–Thu 8:00–22:00 · Fri 10:00–18:00 (see §4) |

⚠️ **Verify before publishing:** the site currently shows **Sat–Thu
8AM–10PM** with Friday 10AM–6PM. Confirm these are your real hours with
operations, then set identical hours in GBP. If they change, update GBP +
`site.ts` (`SITE.openingHours`) + the contact page in the same release.

Since RepairKL serves customers at their homes, set it up as a **service-area
business**: clear the address, add service areas (below), keep the phone.

## 3. Service areas

Add (GBP → Address & service area → Service area):

- Kuala Lumpur
- Petaling Jaya
- Subang Jaya
- Shah Alam
- Cheras
- Ampang
- Puchong

These mirror `SITE.areasServed` in `site.ts`. Keep the two lists in sync —
Google cross-checks coverage claims.

## 4. Hours

Set the weekly schedule to match the site exactly (Sat–Thu 8–22, Fri 10–18).
If you offer emergency/after-hours support via WhatsApp, mention it in the
description — don't mark yourself 24/7 unless you truly answer at 3AM.

## 5. Photos (10 minimum, ideally 20+)

Upload real photos, never stock:

- Logo + cover photo (branded, 1200×630-ish cover)
- 5–10 job photos: technician at work, before/after coils, installed AC
  units — **geo-tagged on-site shots rank best**
- Team photo, van/branding if any

Cadence: add 2–4 fresh job photos per month. Profiles that go stale decay.

## 6. Products & Services section

Mirror the 5 on-site services with starting prices:

| Service | From |
|---|---|
| Fridge Repair | RM60 |
| Washing Machine Repair | RM60 |
| Dryer Repair | RM60 |
| Air-Conditioner Service | RM80 |
| Air-Conditioner Installation | RM350 |

Add a short description per service (1–2 sentences, reuse the intro copy from
`src/lib/serviceContent.ts`). Prices must match the site.

## 7. Q&A seeding

Ask (and answer from the owner account) the top real questions:

- "Do you service my area?" → list KL + Selangor areas
- "How much is a washing machine repair?" → from RM60, free quote on
  inspection
- "Same-day repair available?" → yes for bookings before 4PM
- "Do you provide warranty?" → per-service warranty terms

## 8. Reviews — the ranking engine

- **Ask every happy customer.** Use the WhatsApp template below right after a
  job is marked completed.
- Reply to **every** review (thank-yous for 5★; calm, factual, take-it-inline
  for negatives).
- Never incentivize or buy reviews — Google suspends profiles for it.

WhatsApp review-request template:

> Hi {name}, thanks for choosing RepairKL today! 🙏
> If our technician {worker_name} did a great job with your {service_name},
> would you mind leaving us a quick Google review? It takes 30 seconds and
> helps neighbours in KL find us:
> {review_link}
> Any issue at all, reply here first — we'll make it right.

The `{review_link}` is the value of `NEXT_PUBLIC_GBP_REVIEW_URL` (GBP →
**Ask for reviews** button copies it).

## 9. Google Posts cadence

Minimum: 1 post/week (they expire from prominence after ~a week):

- **Offer posts**: seasonal promos (CNY AC servicing, Raya pre-checkup)
- **Update posts**: "5 signs your fridge compressor is failing" tips
- Tie posts to the matching service page URL — local citation + traffic

## 10. Wire-up: connect the profile to the website

Fill these in `.env` (all optional, dormant-until-set — see `.env.example`):

```
NEXT_PUBLIC_GBP_URL="https://maps.app.goo.gl/…"          # profile link
NEXT_PUBLIC_GBP_REVIEW_URL="https://g.page/r/…/review"   # Ask-for-reviews link
NEXT_PUBLIC_GBP_PLACE_ID="ChIJ…"                          # for the /contact map
```

Then redeploy. What activates automatically:

| Feature | Where |
|---|---|
| Live Google map embed on `/contact` | place id → `q=place_id:…&output=embed` iframe |
| "Find us on Google" link in footer | profile URL |
| JSON-LD `sameAs` includes the GBP profile | Organization/LocalBusiness schema |
| "Leave a Google review" CTA on completed orders | review URL on `/orders/[id]` |

**Finding the place id:** open the listing in Google Maps → share/copy link,
or use <https://developers.google.com/maps/documentation/places/web-service/place-id>.
The profile URL + review link are both copy-paste buttons inside the GBP
dashboard.

## 11. Monthly checklist (10 min)

- [ ] 2–4 new job photos uploaded
- [ ] 1+ Google Post published
- [ ] All new reviews answered
- [ ] Review asks sent for the month's completed jobs
- [ ] Hours/holidays updated (public holidays!)
- [ ] NAP still identical to `site.ts` (phone, hours, service areas)
