-- DEV-ONLY row level security.
--
-- RLS is ON for every table (so nothing is ever silently unprotected), but
-- the policies here allow full access to anyone holding the anon key.
-- That's only acceptable because there is no real login yet (phone/OTP auth
-- is still mocked in the frontend) and this project has no real user data
-- in it.
--
-- This file MUST be replaced before real users sign in. Once Supabase Auth
-- is wired up and profiles.id references auth.users(id), drop these
-- policies and apply ../rls-production-ready.sql instead.

alter table profiles          enable row level security;
alter table payout_methods    enable row level security;
alter table categories        enable row level security;
alter table gigs              enable row level security;
alter table swipes            enable row level security;
alter table orders            enable row level security;
alter table reels             enable row level security;
alter table messages          enable row level security;
alter table notifications     enable row level security;
alter table kyc_submissions   enable row level security;
alter table payouts           enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles', 'payout_methods', 'categories', 'gigs', 'swipes',
      'orders', 'reels', 'messages', 'notifications', 'kyc_submissions', 'payouts'
    ])
  loop
    execute format(
      'create policy "dev_allow_all_%1$s" on %1$s for all using (true) with check (true);',
      t
    );
  end loop;
end $$;
