# TASK-003 — Authentication and roles

Implemented:
- Supabase SSR browser/server clients.
- Email OTP / magic-link login.
- Auth callback.
- Session refresh middleware.
- Current user/profile helpers.
- Protected account route.
- Admin/production route guard.

Before real login:
1. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
2. Configure Supabase Auth redirect URL for /auth/callback.
3. Configure the Supabase email provider.

Security: service-role secrets are never used in browser code. Admin mutations remain server-side.