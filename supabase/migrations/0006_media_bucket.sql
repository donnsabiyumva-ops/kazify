-- Public storage bucket for freelancer photos/videos (gig clips, reel
-- videos/slideshow images, profile photos). Public so the app can render
-- <video>/<img> tags directly with the stored object's URL, no signed
-- URLs or auth headers needed.
--
-- Dev-mode policy: same wide-open philosophy as 0002_dev_rls.sql — fine
-- while there's no real user-owned-content model yet, must be tightened
-- (uploads scoped to auth.uid()) before real users can upload their own.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "dev_allow_all_media" on storage.objects
  for all using (bucket_id = 'media') with check (bucket_id = 'media');
