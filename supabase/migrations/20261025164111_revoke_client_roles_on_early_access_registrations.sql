-- Defence in depth on top of RLS: the roles behind the publishable key (anon) and signed-in
-- users (authenticated) get no privileges on the table at all, so even a policy added by
-- mistake later could not expose it. The server uses the secret key (service_role).
revoke all on table public.early_access_registrations from anon, authenticated;
