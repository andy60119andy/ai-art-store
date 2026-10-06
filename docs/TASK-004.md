# TASK-004 — Secure artwork upload

Implemented:
- Authenticated upload presign endpoint.
- Private Supabase Storage bucket definition.
- Storage RLS scoped to the user's UUID folder.
- Upload metadata persisted in public.uploads.
- Client uploader for JPG/PNG/WebP up to 20 MB.
- Completion endpoint for image dimensions.

Production note:
The application must execute supabase/storage.sql once in the target Supabase project. For stronger validation, production workers should inspect image magic bytes and dimensions before generation; browser MIME values alone are not a security boundary.