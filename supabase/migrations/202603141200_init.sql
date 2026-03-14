create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'shipper',
  base_currency text not null default 'USD',
  timezone text not null default 'UTC',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  email text not null unique,
  full_name text not null,
  role text not null default 'viewer',
  phone text,
  job_title text,
  status text not null default 'invited',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.terminals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null unique,
  name text not null,
  location text not null,
  country text not null,
  status text not null default 'active',
  contact_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scac text not null unique,
  name text not null,
  mode text not null,
  status text not null default 'active',
  contact_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  carrier_id uuid references public.carriers(id) on delete set null,
  origin text not null,
  destination text not null,
  route_code text not null unique,
  mode text not null,
  average_transit_days integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_code text not null unique,
  legal_name text not null,
  vendor_type text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text not null default 'onboarding',
  risk_rating text not null default 'medium',
  payment_terms_days integer not null default 15,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  carrier_id uuid references public.carriers(id) on delete set null,
  terminal_id uuid references public.terminals(id) on delete set null,
  route_id uuid references public.routes(id) on delete set null,
  shipment_number text not null unique,
  mode text not null,
  origin_port text not null,
  destination_port text not null,
  status text not null default 'draft',
  release_status text not null default 'pending_payment',
  departure_at timestamptz,
  arrival_at timestamptz,
  released_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.containers (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  container_number text not null unique,
  size_type text not null,
  status text not null default 'awaiting_payment',
  demurrage_fee numeric(14, 2) not null default 0,
  detention_fee numeric(14, 2) not null default 0,
  release_code text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cargo (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  container_id uuid references public.containers(id) on delete set null,
  description text not null,
  commodity_code text,
  weight_kg numeric(14, 2) not null default 0,
  package_count integer not null default 0,
  hazardous boolean not null default false,
  status text not null default 'booked',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  method_type text not null,
  provider text not null,
  brand text,
  last4 text,
  expiry_month integer,
  expiry_year integer,
  is_default boolean not null default false,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  bank_name text not null,
  account_last4 text not null,
  currency text not null default 'USD',
  is_default boolean not null default false,
  routing_hint text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  shipment_id uuid references public.shipments(id) on delete set null,
  container_id uuid references public.containers(id) on delete set null,
  invoice_number text not null unique,
  currency text not null default 'USD',
  subtotal_amount numeric(14, 2) not null default 0,
  tax_amount numeric(14, 2) not null default 0,
  fee_amount numeric(14, 2) not null default 0,
  total_amount numeric(14, 2) not null,
  status text not null default 'pending',
  approval_status text not null default 'draft',
  due_date date,
  submitted_by uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  paid_at timestamptz,
  fraud_score numeric(5, 2) not null default 0,
  extracted_data jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  bank_account_id uuid references public.bank_accounts(id) on delete set null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  approval_stage text not null default 'submitted',
  initiated_by uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  processed_at timestamptz,
  settlement_reference text,
  release_triggered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  transaction_type text not null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status text not null default 'pending',
  processor_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  shipment_id uuid references public.shipments(id) on delete set null,
  container_id uuid references public.containers(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  name text not null,
  document_type text not null,
  storage_bucket text not null default 'documents',
  storage_path text not null,
  mime_type text,
  size_bytes bigint not null default 0,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb not null default '{}'::jsonb,
  after_data jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18, 8) not null,
  effective_date date not null,
  source text not null default 'manual',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (base_currency, quote_currency, effective_date)
);

create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  shipment_id uuid references public.shipments(id) on delete set null,
  record_type text not null,
  status text not null default 'pending',
  expires_at timestamptz,
  notes text,
  score numeric(5, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.credit_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  credit_limit numeric(14, 2) not null default 0,
  available_credit numeric(14, 2) not null default 0,
  risk_band text not null default 'standard',
  score integer not null default 650,
  days_sales_outstanding integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  type text not null,
  title text not null,
  message text not null,
  status text not null default 'unread',
  channel text not null default 'in_app',
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz
);

create table if not exists public.disputes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  raised_by uuid references public.users(id) on delete set null,
  status text not null default 'open',
  reason text not null,
  resolution_notes text,
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  shipment_id uuid references public.shipments(id) on delete set null,
  container_id uuid references public.containers(id) on delete set null,
  fee_type text not null,
  description text not null,
  amount numeric(14, 2) not null,
  currency text not null default 'USD',
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  carrier_id uuid references public.carriers(id) on delete set null,
  terminal_id uuid references public.terminals(id) on delete set null,
  contract_number text not null unique,
  start_date date not null,
  end_date date,
  status text not null default 'draft',
  payment_terms jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.release_cargo_on_paid_payment()
returns trigger
language plpgsql
as $$
declare
  linked_shipment uuid;
begin
  if new.status = 'paid' and coalesce(old.status, '') <> 'paid' then
    update public.invoices
    set status = 'paid',
        paid_at = coalesce(new.processed_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = new.invoice_id;

    select shipment_id into linked_shipment
    from public.invoices
    where id = new.invoice_id;

    if linked_shipment is not null then
      update public.shipments
      set status = 'released',
          release_status = 'released',
          released_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = linked_shipment;

      update public.containers
      set status = 'released',
          updated_at = timezone('utc', now())
      where shipment_id = linked_shipment;

      update public.cargo
      set status = 'released',
          updated_at = timezone('utc', now())
      where shipment_id = linked_shipment;
    end if;
  end if;

  return new;
end;
$$;

create trigger trigger_release_cargo_on_paid_payment
after update on public.payments
for each row
execute function public.release_cargo_on_paid_payment();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.create_profile_for_new_user();

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select organization_id
  from public.users
  where id = auth.uid()
  limit 1;
$$;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.vendors enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.containers enable row level security;
alter table public.cargo enable row level security;
alter table public.transactions enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.compliance_records enable row level security;
alter table public.credit_profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.disputes enable row level security;
alter table public.terminals enable row level security;
alter table public.carriers enable row level security;
alter table public.routes enable row level security;
alter table public.fees enable row level security;
alter table public.contracts enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.payment_methods enable row level security;

create policy "org scoped select" on public.organizations
for select using (id = public.current_org_id());

create policy "org scoped users" on public.users
for all using (organization_id = public.current_org_id())
with check (organization_id = public.current_org_id());

create policy "org scoped memberships" on public.organization_memberships
for all using (organization_id = public.current_org_id())
with check (organization_id = public.current_org_id());

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'vendors',
    'invoices',
    'payments',
    'shipments',
    'transactions',
    'documents',
    'audit_logs',
    'compliance_records',
    'credit_profiles',
    'notifications',
    'disputes',
    'terminals',
    'carriers',
    'routes',
    'fees',
    'contracts',
    'bank_accounts',
    'payment_methods'
  ]
  loop
    execute format(
      'create policy "org scoped %1$s" on public.%1$s for all using (organization_id = public.current_org_id()) with check (organization_id = public.current_org_id());',
      table_name
    );
  end loop;
end
$$;

create policy "shipment access via org" on public.containers
for all using (
  exists (
    select 1 from public.shipments
    where public.shipments.id = containers.shipment_id
      and public.shipments.organization_id = public.current_org_id()
  )
)
with check (
  exists (
    select 1 from public.shipments
    where public.shipments.id = containers.shipment_id
      and public.shipments.organization_id = public.current_org_id()
  )
);

create policy "cargo access via shipment" on public.cargo
for all using (
  exists (
    select 1 from public.shipments
    where public.shipments.id = cargo.shipment_id
      and public.shipments.organization_id = public.current_org_id()
  )
)
with check (
  exists (
    select 1 from public.shipments
    where public.shipments.id = cargo.shipment_id
      and public.shipments.organization_id = public.current_org_id()
  )
);

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger organization_memberships_set_updated_at before update on public.organization_memberships for each row execute function public.set_updated_at();
create trigger terminals_set_updated_at before update on public.terminals for each row execute function public.set_updated_at();
create trigger carriers_set_updated_at before update on public.carriers for each row execute function public.set_updated_at();
create trigger routes_set_updated_at before update on public.routes for each row execute function public.set_updated_at();
create trigger vendors_set_updated_at before update on public.vendors for each row execute function public.set_updated_at();
create trigger shipments_set_updated_at before update on public.shipments for each row execute function public.set_updated_at();
create trigger containers_set_updated_at before update on public.containers for each row execute function public.set_updated_at();
create trigger cargo_set_updated_at before update on public.cargo for each row execute function public.set_updated_at();
create trigger payment_methods_set_updated_at before update on public.payment_methods for each row execute function public.set_updated_at();
create trigger bank_accounts_set_updated_at before update on public.bank_accounts for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
create trigger exchange_rates_set_updated_at before update on public.exchange_rates for each row execute function public.set_updated_at();
create trigger compliance_records_set_updated_at before update on public.compliance_records for each row execute function public.set_updated_at();
create trigger credit_profiles_set_updated_at before update on public.credit_profiles for each row execute function public.set_updated_at();
create trigger disputes_set_updated_at before update on public.disputes for each row execute function public.set_updated_at();
create trigger fees_set_updated_at before update on public.fees for each row execute function public.set_updated_at();
create trigger contracts_set_updated_at before update on public.contracts for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "authenticated document uploads" on storage.objects
for insert to authenticated
with check (bucket_id = 'documents');

create policy "authenticated document reads" on storage.objects
for select to authenticated
using (bucket_id = 'documents');
