# Fee Management

The fee module uses the existing school tenant, user, student, course, and academic-year records. Money is stored as integer INR paise. Student fee accounts keep a copy of the structure lines and installments from the time they are assigned, so later structure edits affect future assignments only.

## Database setup

Run the API migration after deploying the new fee schemas:

```sh
cd srmsapi/server
npm run migrate
```

Fee collection, concession, refund, payment confirmation, and audit writes use MongoDB transactions. Configure MongoDB as a replica set (`DB_REPLICA_SET=rs0` for the provided Docker Compose service). For a separately managed MongoDB, enable a replica set and set `DB_REPLICA_SET` to its configured name. A standalone MongoDB server cannot execute these operations atomically.

The migration creates school-scoped fee type, structure, assignment, payment, receipt, provider-reference, idempotency, and audit indexes.

## Online payments

Razorpay is optional. To enable live online checkout, configure the following API-only environment variables:

```env
PAYMENT_GATEWAY_PROVIDER=razorpay
RAZORPAY_KEY_ID=<Razorpay key ID>
RAZORPAY_KEY_SECRET=<Razorpay key secret>
RAZORPAY_WEBHOOK_SECRET=<webhook signing secret>
```

Then configure the school's online payment toggle in Super Admin and set the webhook URL to `https://<school-host>/api/student/payments/webhook`. Subscribe to `payment.captured`, `payment.failed`, `refund.processed`, and `refund.failed`. The server creates one-hour orders and marks balances paid only after a valid signed webhook. A failed payment attempt keeps the order open for retries; closing checkout keeps its reservation until provider order expiry is confirmed. Students can use **Check status** to refresh the provider state. Online refunds are submitted through the provider API and reduce the balance only after a valid refund webhook.

No gateway credentials are included in this repository. The UI reports readiness from server configuration and does not expose key secrets. Manual refunds remain auditable ledger entries for the school's finance team to record after the funds have been returned.

## School fee routes

School fee routes are available at `/api/fees` through the school host API proxy (the Express routes mount at `/fees`):

- `GET/POST/PATCH /types` — fee categories.
- `GET/POST/PATCH /structures` — class/course and academic-year structures with installment schedules.
- `POST /assignments` — assign a structure to selected students or its full class.
- `POST /parent-access` — provision a parent login linked to selected students.
- `GET /accounts`, `GET /accounts/:id` — account list and student statement.
- `POST /accounts/:id/collections`, `POST /accounts/:id/adjustments` — manual collection and audited adjustments.
- `GET /payments`, `POST /payments/:id/refunds`, `GET /payments/:id/receipt` — transaction history, refund ledger entries, and confirmed receipts.
- `GET /dashboard`, `GET /reports`, `GET /reports/export.csv`, `GET /audit` — school-scoped reporting, current-page CSV export, and audit history.
- `GET /online-settings` — readiness information for the current school.

Student and linked parent requests use `/api/student/fees`; parent logins use the shared Student Portal and can only access children linked to their account.

## Verification

Backend financial math, tenant scoping, portal authorization, and webhook signature checks run with `npm test` in `srmsapi/server`. Frontend builds are run in each portal using its existing npm build script.
