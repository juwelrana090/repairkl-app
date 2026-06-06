# Module: auth
> Files: src/app/(auth)/, src/app/api/auth/**, src/lib/auth/session.ts

## Purpose
User authentication: login, register, OTP verification, password reset

## Routes
- POST /api/auth/login → bcrypt verify → JWT cookie
- POST /api/auth/register → create user + OTP (console.log stub)
- POST /api/auth/logout → delete cookie
- POST /api/auth/verify-otp → validate + mark used
- POST /api/auth/resend-otp → new OTP
- POST /api/auth/forgot-password → PASSWORD_RESET OTP
- POST /api/auth/reset-password → verify OTP + new bcrypt hash

## Session
- lib/auth/session.ts: createSession(), getSession(), clearSession()
- Cookie: shifty_token | httpOnly | 30d | secure in prod
- JWT secret: JWT_SECRET env var (min 32 chars)

## Pages
- /login — "Let's Sign You In", role-redirect on success
- /register — "Getting Started", full form
- /otp — 4-digit, countdown timer
- /forgot-password — email input
- /reset-password — 2-step: OTP + new password

## OTP System
- 4-digit numeric, 10min expiry (forgot-password: 15min)
- Types: PHONE_VERIFY, EMAIL_VERIFY, PASSWORD_RESET
- STUB: SMS delivery via console.log — replace with Twilio/BDTel

## Gotchas
- Hashing: bcrypt 12 rounds
- Email enumeration: forgot-password always returns 200
- OTP used once: usedAt timestamp
