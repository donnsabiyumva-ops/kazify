-- Marks featured/showcase profiles (added to give the marketplace content
-- while it has few real users) as non-hireable, so clients can't message
-- or hire someone who isn't a real account able to respond/deliver.

alter table profiles add column if not exists is_demo boolean not null default false;
