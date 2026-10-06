# TASK-005 — AI generation architecture

Implemented:
- Provider-agnostic AI image generation interface.
- Curated art style registry.
- Authenticated generation-job creation API.
- Generation job status API.
- Generation page foundation.

Important:
The repository deliberately does NOT fake a successful AI result. A real provider must be configured with AI_PROVIDER_API_KEY and a concrete adapter. The worker should call the adapter, store the output privately, then create artwork/artwork_versions records.

Next production work:
- Select/configure the actual image-generation provider.
- Add async worker/queue.
- Add output storage and signed URLs.
- Add retry/idempotency and credit accounting.