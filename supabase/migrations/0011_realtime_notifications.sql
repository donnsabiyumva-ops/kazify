-- Enables Supabase Realtime (postgres_changes) for the notifications
-- table, so a live in-app popup can appear the instant a new notification
-- is inserted, instead of only showing up after the next reload or bell
-- click. RLS still applies to realtime delivery — notifications_owner_select
-- (0010) already scopes it to auth.uid() = profile_id, so this doesn't
-- widen what anyone can see, only how fast they find out about it.
do $$
begin
  alter publication supabase_realtime add table notifications;
exception
  when duplicate_object then null; -- already added — nothing to do
end $$;
