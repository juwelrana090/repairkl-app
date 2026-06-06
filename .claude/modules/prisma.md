# Module: prisma
> Files: prisma/schema.prisma, prisma/seed.ts, src/lib/prisma.ts

## Models (20)
User, UserAddress, OtpCode, Worker, WorkerSchedule, WorkerEarning,
ServiceCategory, Service, ServicePackage, Booking, BookingDetail,
BookingWorker, Payment, Review, SupportTicket, TicketMessage,
Notification, SavedService, Promotion, Banner

## Enums (7)
UserRole: CUSTOMER | WORKER | SUPPORT | ADMIN
BookingStatus: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
PaymentStatus: PENDING | PAID | FAILED | REFUNDED
OtpType: PHONE_VERIFY | EMAIL_VERIFY | PASSWORD_RESET
NotificationType: BOOKING_CONFIRMED | BOOKING_CANCELLED | WORKER_ASSIGNED | SERVICE_STARTED | SERVICE_COMPLETED | PAYMENT_RECEIVED | REVIEW_REMINDER | PROMOTION | SUPPORT_REPLY | SYSTEM
TicketStatus: OPEN | IN_PROGRESS | RESOLVED | CLOSED
TicketPriority: LOW | MEDIUM | HIGH | URGENT

## Singleton Pattern (CRITICAL)
```ts
// src/lib/prisma.ts
declare global { var __prisma: PrismaClient | undefined; }
function getPrismaClient(): PrismaClient {
  if (!global.__prisma) global.__prisma = new PrismaClient();
  return global.__prisma;
}
export const prisma = getPrismaClient();
```

## Demo Seed Data
- customer@shifty.com / password123 (CUSTOMER)
- admin@shifty.com / password123 (ADMIN)
- worker@shifty.com / password123 (WORKER)
- support@shifty.com / password123 (SUPPORT)
- 8 categories, 6 services with packages, 2 promo codes (FIRST40, SHIFTY15)
