> ⚠️ PROJECT SCOPED: Shifty App — database operations

## /r-db push
Run: npm run db:push
Applies schema changes to PostgreSQL without migration history

## /r-db migrate
Run: npm run db:migrate
Creates and applies a migration file — use for production changes

## /r-db seed
Run: npm run db:seed
Seeds: 4 demo users, 8 categories, 6 services with packages, 2 promos, 1 banner
Accounts: customer/admin/worker/support @shifty.com / password123

## /r-db reset
Run: npm run db:reset
Drops all tables, re-applies schema, re-seeds

## /r-db studio
Run: npm run db:studio
Opens Prisma Studio at localhost:5555

## /r-db check
- Verify DATABASE_URL in .env is set correctly
- Verify PostgreSQL is running
- Run: npx prisma validate (schema check)
