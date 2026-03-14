# PayCargo Blueprint

Production-oriented SaaS starter for freight invoice processing, payments, cargo release automation, document management, analytics, and notifications.

## Stack

- Next.js 14 App Router
- TypeScript strict mode
- Supabase Postgres, Auth, Storage
- Tailwind CSS
- REST API routes under `/api/v1`

## Features

- Multi-tenant organization model with role-based access control
- Vendor onboarding and invoice approval workflow
- Payment orchestration with cargo release automation
- Supabase Storage document uploads
- Dashboard analytics and operational reports
- Audit logging and notification generation
- REST resources for core freight payment domains

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
cp .env.example .env.local
```

3. Set these variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Apply the migration in [supabase/migrations/202603141200_init.sql](/D:/paycargo-blueprint/supabase/migrations/202603141200_init.sql).

5. Start the app:

```bash
npm run dev
```

## API surface

- Resource CRUD: `/api/v1/{resource}`
- Analytics: `/api/v1/analytics`
- Reports: `/api/v1/reports`
- Auth helpers: `/api/v1/auth/profile`, `/api/v1/auth/sign-out`, `/api/v1/auth/callback`
- Integration stubs: `/api/v1/webhooks`, `/api/v1/integrations`

## Deployment

Deploy directly to Vercel. Add the three Supabase environment variables in the Vercel project settings and ensure the Supabase migration has been applied before the first production run.
