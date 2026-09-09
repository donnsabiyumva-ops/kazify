-- Reviews: a client rates the seller once an order is approved. One review
-- per order (order_id is unique), and profiles.rating is kept as a live
-- average via trigger rather than computed ad hoc in the client — so it
-- stays correct no matter which app/session writes a review.

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null unique references orders(id) on delete cascade,
  seller_id   uuid not null references profiles(id) on delete cascade,
  client_id   uuid not null references profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

create index reviews_seller_id_idx on reviews(seller_id);

alter table reviews enable row level security;
create policy "dev_allow_all_reviews" on reviews for all using (true) with check (true);

create or replace function refresh_seller_rating() returns trigger as $$
begin
  update profiles
  set rating = (
    select round(avg(rating)::numeric, 1) from reviews where seller_id = coalesce(new.seller_id, old.seller_id)
  )
  where id = coalesce(new.seller_id, old.seller_id);
  return null;
end;
$$ language plpgsql;

create trigger reviews_after_change
after insert or update or delete on reviews
for each row execute function refresh_seller_rating();
