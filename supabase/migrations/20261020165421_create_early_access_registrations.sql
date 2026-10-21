create table public.early_access_registrations (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null check (char_length(full_name) between 1 and 100),
  business_name     text not null check (char_length(business_name) between 1 and 150),
  business_type     text not null check (business_type in ('grocery','supermarket','restaurant','others')),
  mobile_number     text check (mobile_number ~ '^\+91[0-9]{10}$'),
  email             text not null check (char_length(email) <= 254),
  order_channels    text[] not null default '{}'
                    check (order_channels <@ array['phone_calls','walk_in','chat_apps','delivery_apps','other']::text[]),
  consent_given     boolean not null check (consent_given = true),
  consent_given_at  timestamptz not null,
  created_at        timestamptz not null default now()
);

-- Duplicate detection is case-insensitive: Hello@x.com and hello@x.com are the same person.
create unique index early_access_registrations_email_unique
  on public.early_access_registrations (lower(email));

-- Only the server (secret key, which bypasses RLS) may read or write.
-- RLS on with no policies means the publishable key can do nothing.
alter table public.early_access_registrations enable row level security;
