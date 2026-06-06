# Module: components
> Files: src/components/**

## UI Components (src/components/ui/)
- Button.tsx — variants: primary/secondary/outline/ghost/danger | sizes: sm/md/lg | loading state
- Input.tsx — floating label, error/success/hint, prefix/suffix
- index.tsx — StatusBadge, Badge, RatingStars (interactive), Toaster (showToast), Modal, EmptyState, Skeleton, ConfirmDialog
- Toaster.tsx — re-export wrapper

## Layout Components (src/components/layout/)
- Navbar.tsx — sticky, role-based nav, notifications bell, avatar dropdown, mobile hamburger
- PanelSidebar.tsx — collapsible sidebar for ADMIN/WORKER/SUPPORT with role-specific colors

## Shared Cards (src/components/shared/Cards.tsx)
- ServiceCard — service grid card with rating, price, category badge
- BookingCard — booking list item with status badge
- WorkerCard — worker profile card with rating and verify status
- CategoryCard — category icon card
- StatCard — KPI card with icon, value, change indicator

## Marketing Components (src/components/marketing/)
- PublicNav.tsx — sticky, transparent→white on scroll, mobile hamburger
- PublicFooter.tsx — rich footer with links, newsletter, contact info, CTA band
- MarketingHome.tsx — full landing page component (SSR)
