# Project Context — RepairKL App
> File: .claude/memory/context.md

## Product Overview
- **Name**: RepairKL
- **Purpose**: Malaysia's trusted home appliance repair service
- **Target Market**: Malaysia homeowners and appliance repair technicians
- **Core Services**: Fridge repair, washing machine repair, dryer repair, AC service, AC installation (5 services only)
- **Business Model**: Commission-based marketplace connecting customers with certified technicians
- **Focus**: Specialized in home appliance repair with same-day service availability

## Target Users
- **CUSTOMER**: Homeowners seeking appliance repair services
- **WORKER**: Certified appliance repair technicians
- **SUPPORT**: Customer support agents handling tickets and issues
- **ADMIN**: Platform operators managing services, users, and business operations

## Critical Requirements (Must Never Break)
1. **Authentication System**: Login, registration, OTP verification, password reset
2. **Booking Creation**: Core business functionality - service booking flow
3. **Role-Based Routing**: Proper access control for different user types
4. **Prisma Singleton**: Database connection management
5. **Session Management**: JWT-based authentication with httpOnly cookies
6. **Cookie Name**: Must use `repairkl_token` consistently across all auth files

## Current Development Status
- **Phase**: MVP Complete (public marketing + full app built)
- **State**: Production-ready core with stubbed external services
- **Testing**: Manual testing, automated tests not implemented
- **Documentation**: Comprehensive code documentation in place
- **Recent Changes**: Complete rebrand from Shifty to RepairKL (2025-06-06)

## Business Context
- **Market**: Kuala Lumpur and surrounding areas (Klang Valley)
- **Service Area**: Malaysia only, focused on urban areas
- **Payment Methods**: FPX, Touch 'n Go eWallet, GrabPay, Boost, cash, cards
- **Currency**: Malaysian Ringgit (RM)
- **Operating Hours**: 8AM-8PM daily, same-day service available

## Known Technical Debt

### High Priority (Core Functionality)
- **SMS Integration**: OTP verification uses console.log stub
  - **Current**: `console.log(otpCode)` placeholder
  - **Needed**: Twilio or Malaysian SMS gateway integration
  - **Impact**: Users cannot receive real OTP codes

- **Payment Gateway**: Payment processing is stubbed
  - **Current**: Config in .env but no actual processing
  - **Needed**: Billplz, Touch 'n Go, or GrabPay integration
  - **Impact**: No real payments can be processed

- **File Upload System**: Avatar and service images not wired
  - **Current**: Config in .env but no upload functionality
  - **Needed**: MinIO or AWS S3 integration
  - **Impact**: Technicians cannot upload certification images

### Medium Priority (Operational)
- **Worker Assignment**: Fire-and-forget without race condition guards
  - **Current**: Basic assignment logic
  - **Needed**: Proper locking mechanism or database transactions
  - **Impact**: Potential double-assignment under high load

- **Real-time Notifications**: No push notification system
  - **Current**: Database-based polling only
  - **Needed**: WebSocket or Server-Sent Events
  - **Impact**: Users don't get instant notifications

- **Search Performance**: No pagination on search endpoints
  - **Current**: Returns all results
  - **Needed**: Cursor-based or offset-based pagination
  - **Impact**: Slow performance on large datasets

### Low Priority (Enhancement)
- **Auto-assign Workers**: Basic algorithm without optimization
  - **Current**: Simple availability check
  - **Needed**: Smart matching based on skills, location, rating
  - **Impact**: Suboptimal worker assignments

## Platform Constraints

### Malaysia-Specific Requirements
- **Currency**: Malaysian Ringgit (RM)
- **Phone Format**: +60 format for Malaysia
- **Payment Methods**: FPX, Touch 'n Go, GrabPay, Boost (local gateways)
- **SMS Gateway**: Must support Malaysia numbers
- **Language**: English interface with Malaysia context

### Technical Constraints
- **Hosting**: Designed for cloud deployment (Vercel, AWS, etc.)
- **Database**: MySQL required
- **Node.js**: Node.js 20+ required for Next.js 16
- **Environment**: Production environment variables required

## Service Constraints (5 Only)
- **Fridge Repair**: All brands, same-day service available
- **Washing Machine Repair**: Top load and front load, error code diagnosis
- **Dryer Repair**: Vented and condenser dryers, heating element replacement
- **AC Service**: Basic service, chemical wash, chemical overhaul, gas top-up
- **AC Installation**: 1HP to 3HP units, piping and wiring included

## Business Logic Constraints

### Booking Flow
- **Status Transition**: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
- **Worker Assignment**: Must check availability and schedule
- **Payment Processing**: Required before service completion
- **Review System**: Only after service completion

### Role Permissions
- **CUSTOMER**: Book services, track orders, leave reviews
- **WORKER**: View assigned jobs, update status, manage earnings
- **SUPPORT**: Handle tickets, respond to customer issues
- **ADMIN**: Full platform management, user verification, content moderation

## Security Considerations

### Authentication
- **JWT**: Stateless tokens with 30-day expiration
- **Password Hashing**: bcrypt with 12 rounds minimum
- **Session Storage**: httpOnly cookies only (never localStorage)
- **Cookie Name**: `repairkl_token` (must be consistent)

### Data Protection
- **PII**: Personal information protected and encrypted
- **Payment Data**: Never stored directly (gateway handles)
- **Logs**: No sensitive data in application logs
- **HTTPS**: Required in production

## Development Philosophy

### Code Quality
- **Type Safety**: TypeScript strict mode enforced
- **Pattern Consistency**: Established patterns for common operations
- **Documentation**: Inline documentation for complex logic
- **Testing**: Manual testing currently, automated testing planned

### Architecture Principles
- **Separation of Concerns**: Clear module boundaries
- **DRY**: Don't Repeat Yourself - reusable components
- **SOLID**: Single responsibility, open/closed principles
- **Performance**: Optimize for user experience
