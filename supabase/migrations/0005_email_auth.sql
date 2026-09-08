-- Step 2 of the roadmap: real auth. Profiles are now tied 1:1 to Supabase
-- Auth users (created via email OTP sign-in — a 6-digit code sent by
-- email, no password), instead of being looked up by phone. Phone/MoMo
-- numbers aren't collected at signup — they're requested later, at
-- checkout time, when a client actually funds an escrow.
--
-- `not valid` skips checking the existing dev-seed profiles (their ids
-- don't exist in auth.users, since they were never created through real
-- signup) but is enforced for every row inserted or updated from now on.
-- Once those seed rows are removed or replaced with real accounts, run:
--   alter table profiles validate constraint profiles_id_fkey;

alter table profiles add column if not exists email text;

alter table profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade
  not valid;
