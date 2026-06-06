# Database Context

> Auto-updated by AI agents. Always read before any DB-related task.

## Provider

- Engine: MySQL
- Host: localhost
- Port: 3306
- DB Name: repairkl_db
- Schema: public

## Connection String Format

DATABASE_URL="mysql://root:password@localhost:3306/repairkl_db"

## ORM

- Prisma (schema at prisma/schema.prisma)
- Migrations: npx prisma db push (dev) | npx prisma migrate deploy (prod)

## Demo Users

- customer@repairkl.com / password123 (CUSTOMER)
- admin@repairkl.com / password123 (ADMIN)
- worker@repairkl.com / password123 (WORKER)
- support@repairkl.com / password123 (SUPPORT)

## Services (5 only)

- Fridge Repair (from RM60)
- Washing Machine Repair (from RM60)
- Dryer Repair (from RM60)
- Air-Conditioner Service (from RM80)
- Air-Conditioner Installation (from RM350)

## Migration History

- [2025-06-06] Rebrand to RepairKL + service categories replaced
- [2025-06-05] Initial setup with MySQL
