insert into public.organizations (id, name, slug, type, base_currency, timezone)
values
  ('11111111-1111-1111-1111-111111111111', 'Blue Tide Logistics', 'blue-tide-logistics', 'shipper', 'USD', 'America/New_York')
on conflict (id) do nothing;

insert into public.terminals (organization_id, code, name, location, country)
values
  ('11111111-1111-1111-1111-111111111111', 'NYCT', 'New York Container Terminal', 'Staten Island, NY', 'US')
on conflict (code) do nothing;

insert into public.carriers (organization_id, scac, name, mode)
values
  ('11111111-1111-1111-1111-111111111111', 'MSCU', 'Mediterranean Shipping Co.', 'ocean')
on conflict (scac) do nothing;

insert into public.vendors (organization_id, vendor_code, legal_name, vendor_type, status, risk_rating)
values
  ('11111111-1111-1111-1111-111111111111', 'VEN-1001', 'Atlantic Terminal Services', 'terminal', 'active', 'medium')
on conflict (vendor_code) do nothing;
