---
name: Up — Private Beats Library
description: Per-user private library of beat .zip files or external links, stored in beats-files bucket, RLS-locked, no public listing.
type: feature
---
- Route: `/up`. Sidebar link "Up" with FileArchive icon — visible only when logged in.
- Table `public.user_beats` (user_id, name, cover_url, external_url, storage_path, size_bytes). RLS: each user can SELECT/INSERT/UPDATE/DELETE only their own rows.
- Storage bucket `beats-files` is PRIVATE. RLS on storage.objects: owner only, paths must start with `{auth.uid()}/`. Downloads via short-lived (5min) signed URLs.
- Beat covers go in the existing public `covers` bucket under `{user_id}/beat-*.jpg`.
- Form fields in order: cover (with crop), name (auto from .zip filename), file upload OR external link. Size detected from File API.
- No audio player; this is just storage + download/edit/delete.
