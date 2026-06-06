# Module: customer
> Files: src/app/(customer)/**

## Purpose
CUSTOMER role pages: browse services, book, manage orders, profile

## Routes (URL paths — no route group prefix)
- /home — SSR: greeting, promo banner, active bookings, categories, featured services
- /services — SSR: service grid, category + sort filters
- /services/[slug] — SSR: service detail, packages, reviews, rating breakdown
- /booking — 4-step wizard: Details (house size, furniture), Schedule, Address, Confirm
- /orders — status tabs, booking list
- /orders/[id] — order detail, workers, payment, review prompt
- /profile — stats, quick links, edit form
- /notifications — list with type icons
- /search — search results
- /saved — saved services grid
- /review/[bookingId] — star rating + tags + comment

## Booking Flow
1. /services/[slug] → ServiceBookingPanel → /booking?serviceId=...
2. /booking → 4-step wizard → POST /api/bookings
3. /orders/[id] → booking detail

## Key Components
- HomeSearchBar.tsx — live search input
- ServicesFilter.tsx — category/sort filter client
- ServiceBookingPanel.tsx — sticky booking CTA
- OrdersTabs.tsx — status tab filter
- OrderActions.tsx — cancel/review buttons
- ProfileForm.tsx — user profile edit form
