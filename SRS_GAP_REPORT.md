# SocietyPilot SRS v2.0 Gap Report (Backend)

Source used: `backend/srs_v2.txt` (extracted from `SocietyPilot_SRS_v2_0.pdf`)

## Coverage Summary

- Implemented foundation:
  - 16-role enum and RBAC guards
  - Core module routing for all 10 business modules
  - OTP + JWT auth flow
  - Multi-tenant scoping via society context guards
  - Global validation pipe, response interceptor, exception filter
  - Global API prefix `/v1`
  - Global rate limiting guard (public/auth buckets)
  - Runtime state store abstraction (Redis URL supported, in-memory fallback)
  - Platform admin basics (login, society CRUD, impersonation)
- Partially implemented:
  - Finance workflows (basic billing/payment/defaulters present; advanced rules missing)
  - WhatsApp webhook endpoint (signature verification + intake present; flow engine missing)
- Not implemented (major SRS items):
  - BullMQ background jobs and async bill generation progress
  - Redis-backed OTP/refresh/session state
  - Full WhatsApp bot conversational flows + opt-in/out state
  - Expense approval workflow tiers and fund-ledger accounting
  - Document PDF generation + dispatch (email/WhatsApp)
  - Compliance/audit stack (write audit log trail, data export/delete flows)
  - ThrottlerGuard limits, Sentry/PostHog integrations, CI/CD/NFR enforcement

## Changes Made In This Pass

1. Move-out dues enforcement (SRS 13.1)
- File: `src/modules/residents/residents.service.ts`
- Added unpaid-bill check before move-out.
- Returns `422 Unprocessable Entity` when dues exist.

2. Razorpay webhook security hardening (SRS 10.2, 12)
- Files:
  - `src/modules/finance/finance.controller.ts`
  - `src/modules/finance/finance.service.ts`
- Added `x-razorpay-signature` header intake.
- Added HMAC-SHA256 signature verification using `RAZORPAY_WEBHOOK_SECRET`.
- Added idempotency guard for `payment.captured` retries based on `razorpayPaymentId`.

3. API standards and auth state hardening
- Files:
  - `src/main.ts`
  - `src/common/interceptors/transform.interceptor.ts`
  - `src/common/common.module.ts`
  - `src/common/services/runtime-store.service.ts`
  - `src/common/guards/rate-limit.guard.ts`
  - `src/modules/auth/auth.service.ts`
  - `src/app.module.ts`
- Added `/v1` global API prefix.
- Response envelope now maps paginated results into `data` + `meta`.
- Added global request throttling aligned to SRS targets (100/min public, 1000/min authenticated bucket by header presence).
- Replaced in-memory OTP/refresh token maps with shared runtime store keys (Redis-backed when `REDIS_URL` is configured; memory fallback otherwise).

4. Complaint module rule alignment improvements
- Files:
  - `src/modules/complaints/complaints.service.ts`
  - `src/modules/complaints/complaints.controller.ts`
  - `src/modules/complaints/dto/update-complaint-status.dto.ts`
- Added ticket lifecycle statuses: `ASSIGNED`, `PENDING_PARTS`.
- Enforced close-rule: only requester, Secretary, or Chairman may close.
- Anonymous complaint identity is now masked from non-privileged roles.

5. API testability via Swagger
- Files:
  - `src/main.ts`
  - `README.md`
  - `package.json` / `package-lock.json`
- Added OpenAPI docs at `/v1/docs` with JWT bearer auth support for endpoint testing.
- Added runtime toggle: `SWAGGER_ENABLED=true|false`.

6. Finance queue + webhook persistence improvements
- Files:
  - `src/modules/finance/finance.constants.ts`
  - `src/modules/finance/processors/billing.processor.ts`
  - `src/modules/finance/finance.module.ts`
  - `src/modules/finance/finance.controller.ts`
  - `src/modules/finance/finance.service.ts`
  - `src/app.module.ts`
  - `README.md`
- Added BullMQ queue wiring for bill generation (`billing` queue) with job-based async mode.
- Added status endpoint: `GET /finance/bills/generate/:jobId/status`.
- Added safe fallback: when `REDIS_URL` is absent, bill generation runs synchronously.
- Webhook now persists `payment.captured` events into `payments` (idempotent via `razorpayPaymentId`) and marks linked bill paid when `notes.billId` is present.

7. Global audit logging baseline
- Files:
  - `src/common/services/runtime-store.service.ts`
  - `src/common/services/audit-log.service.ts`
  - `src/common/interceptors/audit-log.interceptor.ts`
  - `src/common/common.module.ts`
  - `src/app.module.ts`
  - `src/modules/admin-settings/admin-settings.service.ts`
  - `src/modules/admin-settings/admin-settings.controller.ts`
  - `README.md`
- Added global write-operation audit capture (`POST`, `PUT`, `PATCH`, `DELETE`) with success/failure state.
- Added society-scoped audit log retrieval endpoint: `GET /settings/audit-logs`.
- Storage uses RuntimeStore (Redis when healthy, in-memory fallback).

8. Complaint auto-escalation baseline
- Files:
  - `src/modules/complaints/complaints.service.ts`
  - `src/modules/complaints/complaints.controller.ts`
  - `README.md`
- Added periodic escalation runner (default every 10 minutes) with env flags.
- Added rule coverage:
  - OPEN >24h -> escalation (secretary tier behavior, priority raised to HIGH)
  - ASSIGNED/IN_PROGRESS/PENDING_PARTS stale >48h -> escalation (chairman tier behavior, priority raised to CRITICAL)
- Added manual run endpoint for verification from Swagger: `POST /complaints/escalations/run`.

## Validation

- Type-check passed: `npx tsc -p tsconfig.json --noEmit`
- `nest build` could not run due to a local Windows file lock on `backend/dist` (EPERM).

## Recommended Next Execution Batches

1. Security/NFR parity
- Redis for OTP + refresh token store
- ThrottlerGuard policies (public/authenticated)
- Structured audit log for all write operations

2. Finance rule parity
- Pro-rata billing, waiver workflow, expense approval tiers, fund buckets
- Razorpay webhook -> payment persistence + receipt trigger

3. WhatsApp bot parity
- Redis session state machine
- Payment/complaint/visitor/pre-approval/SOS/help flows
- Opt-in/opt-out persistence and template dispatcher
