# Deployment Preparation

This document prepares Xipra Technology for production deployment. **Nothing has
been deployed** — this is the checklist and configuration to run through when you
are ready.

## 1. Prerequisites already in place

- Database: Supabase PostgreSQL (cloud-hosted, already live).
- Storage: Supabase Storage buckets (already provisioned — see §4).
- The app is a standard Next.js 15 server app (`next build` + `next start`), so it
  runs on any Node ≥ 18 host, or Vercel.

## 2. Environment variables

Copy `.env.example` to `.env` on the target environment and fill in real values.
**Never commit `.env`** — it is already gitignored.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase session pooler connection string (see comment in `.env.example`). |
| `SUPABASE_URL` | ✅ | Your Supabase project URL. |
| `SUPABASE_SECRET_KEY` | ✅ | **Server-only** service-role key. Rotate if it was ever shared/committed. |
| `SUPABASE_PUBLISHABLE_KEY` | recommended | Public key, safe to expose; currently unused client-side but kept for future use. |
| `JWT_SECRET` | ✅ | Generate a long random value (`openssl rand -base64 48`). Rotating it logs out all admins. |
| `JWT_EXPIRES_IN` | optional | Default `7d`. |
| `AUTH_COOKIE_NAME` | optional | Default `xipra_admin_session`. |
| `ADMIN_SEED_NAME/EMAIL/PASSWORD` | first deploy only | Used once by `npm run db:seed`. Change the password immediately after first login. |
| `NEXT_PUBLIC_APP_URL` | ✅ | The real public URL (e.g. `https://xipratechnology.com`) — used to build certificate QR codes and canonical/OG metadata. **Must be correct before issuing certificates in production.** |
| `MAX_UPLOAD_SIZE_MB` | optional | Default `10`. |
| `SMTP_HOST/PORT/SECURE/USER/PASS/FROM` | optional | Leave blank to skip email sending (forms still store data — see §5). |
| `MAIL_COMPANY_INTERNSHIP` / `MAIL_COMPANY_CONTACT` | optional | Where form notifications are delivered. |
| `COMPANY_*` | optional | Fallbacks for email templates; the live values now come from Site Settings in the admin panel. |

## 3. Build & start

```bash
npm install          # runs `prisma generate` automatically (postinstall)
npm run db:migrate    # applies all Prisma migrations to the target database
npm run db:seed       # first deploy only — creates the SUPER_ADMIN account
npm run build          # production build (output: "standalone" in next.config.ts)
npm run start          # starts the production server
```

`npm run start` runs `next start`, which serves the regular `.next` build
output directly — no extra bundling step needed. (An earlier draft of this
config set `output: "standalone"` for smaller container images, but that mode
requires launching `node .next/standalone/server.js` instead of `next start`
and manually copying `public/` and `.next/static` alongside it; it was
reverted here so the documented `npm run start` flow keeps working as-is. If
you want the standalone bundle for a Docker deployment, re-add
`output: "standalone"` to `next.config.ts` and switch the start command
accordingly.)

## 4. Storage buckets

Buckets are created once with:

```bash
npm run storage:setup
```

This is idempotent — safe to re-run. It (re)applies the bucket policies (public/
private, allowed MIME types, size limit) defined in `scripts/supabase-buckets.ts`.

## 5. SMTP

SMTP is entirely environment-driven (`src/lib/email/mailer.ts`). With
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` unset, `isEmailConfigured()` returns false and
`sendMail()` skips sending without throwing — contact/internship submissions still
validate and save to the database. Filling in real SMTP credentials later requires
**no code changes**; email sending activates automatically on next request.

## 6. Performance & optimization already configured

- **Image optimization**: `next/image` everywhere with `images.formats:
  ["image/avif", "image/webp"]` and Supabase/Unsplash allow-listed via
  `remotePatterns`.
- **Compression**: `compress: true` (gzip/brotli on `next start`).
- **Caching**: sensitive routes (certificate files, admin APIs) are explicitly
  `no-store`; the CSP/security headers in `next.config.ts` apply globally via
  `headers()`.
- **Smaller runtime footprint**: `poweredByHeader: false`; connection-pooled SMTP
  transport (`src/lib/email/mailer.ts`) avoids a fresh TLS handshake per email;
  `getSiteSettings()` is deduped per-request via React `cache()`.
- **Database**: all list endpoints are paginated; indexes exist on the columns
  used for search/status filtering (see `prisma/schema.prisma`).
- **Rate limiting**: in-memory, per-IP/per-admin (`src/lib/rate-limit.ts`). Fine
  for a single instance; swap for Redis/Upstash if you scale horizontally (the
  `enforceRateLimit()` call sites do not need to change).

## 7. Security headers already configured

`next.config.ts` → `headers()` applies to every route:
`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy`, a `Content-Security-Policy`, and (production only)
`Strict-Transport-Security`. Review the CSP in `next.config.ts` if you add a new
third-party script/embed — it will need to be allow-listed there.

## 8. Recommended platform settings (Vercel example)

- Framework preset: Next.js (auto-detected).
- Build command: `npm run build` (the `postinstall` hook handles `prisma generate`).
- Node version: 18.x or later.
- Add all §2 environment variables in the project's Environment Variables settings
  (Production + Preview as needed).
- Since the database and storage are already on Supabase, no additional infra is
  required — just environment variables.

## 9. Post-deploy checklist

- [ ] Log in with the seeded admin account and change the password immediately
      (Settings do not currently expose a password-change UI — update it directly
      via a new `prisma db seed` run with a new `ADMIN_SEED_PASSWORD`, or a
      one-off script, before real users interact with the admin panel).
- [ ] Confirm `NEXT_PUBLIC_APP_URL` matches the real production domain — certificate
      QR codes encode this URL.
- [ ] Verify a real certificate: create one, upload a PDF, scan the QR, confirm
      preview/download/print.
- [ ] Fill in Site Settings (company info, phones, emails, social links, favicon,
      logo) and SEO fields.
- [ ] Configure SMTP and send a test contact-form submission.
- [ ] Rotate `SUPABASE_SECRET_KEY` and the database password if they were ever
      shared outside of `.env`.

## 10. What is intentionally NOT done here

Per the task scope, this repository is **prepared** for deployment but has not
been deployed, and no hosting-platform project (Vercel, etc.) has been created or
configured on your behalf.
