# FrameArto public-flow implementation status

Reviewed on 2026-10-07. This project implements corresponding public flows; it does not contain FrameArto's private source code, database, authentication credentials, or payment integration.

## Available frontend

- Photo/art comparison homepage, animated style carousel, FAQ and production flow.
- Two expanded navigation menus, 79-style shop with subject filters, 79 style detail pages and local photo/email form.
- A 12-style comparison tool with up to three shortlisted references.
- Gift/occasion collections, contact, portrait lookup, journal overview, about, example stories and policy/affiliate information pages.
- Existing room/frame preview and a dedicated large-format planner. Printable width is 120 cm; long dimension, finishing, framing, shipping and price require a production quote.

Reference images are examples, not generated customer results. Customer-stories content is explicitly illustrative. Journal cards lead to guides; the reference site's entire article archive has not been recreated. Text is adapted to this business; the reference's prices, delivery promises, reviews, company identity and refund guarantees are not this store's terms. Mobile layouts exist in CSS, but must be tested on real devices before launch.

## Server implementation

- Authenticated upload preparation with private signed Storage uploads; actual bytes are decoded and checked for format, dimensions, size and hash.
- Source images are normalized and metadata removed before the configured image provider is called.
- Per-user idempotency, atomic task claims, transactional result/version creation and owner-only status lookup.
- 79 server-side style configurations plus compatibility with existing legacy style keys. Configurations have not been evaluated against a live model.
- Customer support requests stored for owner/admin access; no outgoing support email is configured.
- Checkout and ECPay callback return `503 PAYMENTS_DISABLED` unconditionally.

## Required service setup

Production had no environment variables when inspected. No live upload, login, AI call or database mutation was verified.

1. Connect the store's own Supabase project and configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in the appropriate Vercel environment. Never expose the service role key in public variables.
2. Apply migrations in order to a test database first. `0011_generation_integrity.sql` aborts if existing jobs have duplicate result versions; resolve those records explicitly. It has not been applied to a live database by this change.
3. Check private `artwork-uploads` bucket policies, upload size limit (20 MB), email authentication settings and permitted callback URLs against `NEXT_PUBLIC_APP_URL`.
4. Configure `OPENAI_API_KEY` (or the existing `AI_PROVIDER_API_KEY`), an explicitly supported `OPENAI_IMAGE_MODEL`, and `OPENAI_IMAGE_SIZE`. Check provider pricing/limits before live evaluation.
5. Validate one complete authenticated flow in a test environment: upload, verification, generation, status, private artwork, repeated submission, failed task and cross-user access denial. Check support-request ownership too.
6. Keep payment routes disabled; payment credentials alone do not enable checkout.

## Operational limits

Processing uses Next.js `after()` with a 300-second function limit, not a durable job queue. The database task persists, but a terminated invocation is not automatically resumed. A queued task can be dispatched through its owner-authenticated `/process` endpoint; stale tasks are marked failed on status lookup. There is no automatic provider retry, avoiding unrequested paid regeneration.

The initial internal limits are ten tasks per user per Taipei calendar day and two recent concurrent tasks. Failed tasks count toward this quota. A generated object left behind by a failed database commit requires reconciliation; orphan cleanup and durable dispatch/recovery remain launch work. Support-request throttling is a basic count check, not an atomic abuse-prevention system.

Unit coverage checks image parsing/metadata removal, request fingerprints, style mappings and payment disabling. It does not establish live SQL race behavior, service configuration, print quality, 4K output or end-to-end correctness.
