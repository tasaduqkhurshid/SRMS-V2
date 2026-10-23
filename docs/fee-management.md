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

The gateway catalog contains Razorpay, Cashfree Payments, and PhonePe Payment Gateway. Only Razorpay Standard Checkout is integrated; the other catalog entries stay unavailable. Each school supplies its own Razorpay Key ID, Key Secret, and webhook secret in **Fees → Payment Gateways**. Super Admin can disable Razorpay for the platform. Schools must save and validate credentials before enabling the gateway. Legacy global Razorpay environment variables are no longer used for fee collections.

Set `PAYMENT_CREDENTIALS_ENCRYPTION_KEY` on the API server to a base64 encoded 32-byte key or a 64-character hexadecimal key. Generate one with `openssl rand -base64 32`, keep it in the deployment secret store, and back it up securely: changing or losing it makes existing encrypted merchant secrets unreadable. The API fails closed when the key is missing or invalid. Do not commit this key. The gateway's Sandbox mode requires a Razorpay Test Key ID (`rzp_test_…`); live credentials are rejected in test mode.

Point each school's Razorpay webhook endpoint to `https://<school-host>/api/student/payments/webhook` and configure the same webhook secret saved in that school's gateway configuration. Subscribe to `payment.captured`, `payment.failed`, `refund.processed`, and `refund.failed`. Webhooks resolve the school configuration from the referenced local transaction, then verify using its secret. The server marks balances paid only after a valid signed webhook. Failed payment attempts keep the order available for retries; a checkout dismissal keeps its reservation until provider expiry is verified. Online refunds are submitted through the original school's provider credentials and reduce balances only after a valid refund webhook.

The School Portal lets schools allow UPI, cards, net banking, and wallets individually; the selected groups are passed to Razorpay Standard Checkout. Razorpay does not allow this integration to restrict individual UPI apps such as Google Pay or PhonePe, or separate credit and debit cards. Method availability still depends on the merchant account. See [Razorpay's Standard Checkout method configuration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/sample-code). Existing global keys are not copied to schools; configure each merchant account individually. Historical fee transactions are retained.

When the gateway is enabled in Sandbox mode and its test credentials are validated, the School Portal exposes a dedicated test page. It creates a ₹1.00 test-mode order, opens Razorpay Checkout, then verifies the signed payment response and captured provider payment server-side. It does not create a fee ledger transaction or alter student balances. Successful tests are recorded in the school fee audit log.


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
- `GET /payment-gateways`, `PUT /payment-gateways/:code`, `PATCH /payment-gateways/:code/enabled`, `POST /payment-gateways/:code/validate`, `POST /payment-gateways/:code/reset-inherited`, `DELETE /payment-gateways/:code` — safe school-scoped gateway management. Secrets are write-only and omitted from responses.
- Super Admin: `GET /api/admin/payment-gateways`, `PATCH /api/admin/payment-gateways/:code` — catalog availability; `GET /api/admin/schools/:id/payment-gateways` and `PUT /api/admin/schools/:id/payment-gateways/:code` — seeder-mapped school gateway configuration.

Student and linked parent requests use `/api/student/fees`; parent logins use the shared Student Portal and can only access children linked to their account.

## Verification

Backend financial math, tenant scoping, portal authorization, and webhook signature checks run with `npm test` in `srmsapi/server`. Frontend builds are run in each portal using its existing npm build script.
