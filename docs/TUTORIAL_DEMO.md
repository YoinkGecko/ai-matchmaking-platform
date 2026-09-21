# Tutorial demo — full platform walkthrough

Load scripted data that covers **exact match**, **partial quantity**, **related-but-different product**, **over budget**, **quote required**, **uncertain delivery**, **hard reject (0%)**, and workflow statuses (**SUGGESTED → VIEWED → SHORTLISTED → ACCEPTED / REJECTED**).

## 1. Prerequisites

- Postgres with project schema (`schema.sql`, `supplierScehma.sql`, `users.sql`, `matches_schema.sql`, `admin-role.sql`).
- Backend `.env` configured (`DB_*`, `JWT_SECRET`, Redis for OTP).
- Optional for **live** matching on the open requirement: Ollama embeddings + LLM running.

## 2. Load demo data

```bash
cd backend
npm run seed:demo
```

The script is **idempotent** for `@wisdommatch.demo` accounts (re-run safely before a demo).

Copy the printed `ADMIN_EMAILS` line into `backend/.env`, then restart the API.

## 3. Demo accounts

| Role | Email |
|------|--------|
| Client | `demo.client@wisdommatch.demo` |
| Admin | `admin@wisdommatch.demo` |
| Supplier (best match) | `apex.grain@wisdommatch.demo` |
| Supplier (partial qty) | `partial.mills@wisdommatch.demo` |
| Supplier (related product) | `coastal.staples@wisdommatch.demo` |
| Supplier (over budget / late) | `premium.imports@wisdommatch.demo` |
| Supplier (quote required) | `quote.coop@wisdommatch.demo` |
| Supplier (incompatible / reject) | `forge.metals@wisdommatch.demo` |

**OTP:** Request login OTP in the UI, then read the code from your email worker or Redis:

```bash
redis-cli GET "otp:demo.client@wisdommatch.demo"
```

## 4. Suggested demo script (~15 min)

### A. Landing & auth

1. Open `/` — walk through About, Platform, Mission, Results.
2. **Log in** as **Client** with `demo.client@wisdommatch.demo`.
3. Dashboard shows **3 requirements** (MATCHED, OPEN, CONFIRMED).

### B. Client — pre-built match matrix

1. Open **Match results** on the **Basmati rice** requirement (MATCHED).
2. Show **six cards** ranked by score:
   - **ACCEPTED** — high score, exact product, full quantity, within budget, on time.
   - **SHORTLISTED** — **partial quantity** (~60% coverage).
   - **VIEWED** — **RELATED_BUT_DIFFERENT** (Sona Masoori) + **UNCERTAIN** delivery.
   - **SUGGESTED** — **OVER_BUDGET** + **LATE** delivery.
   - **SUGGESTED** — **QUOTE_REQUIRED** + partial qty + uncertain delivery.
   - **REJECTED** — **CLEAR_REJECT** / **0%** (steel vs rice).
3. Click each card — **Match detail drawer**: semantic score, product/budget/delivery blocks, supplier contact, explanations.
4. On a strong match (not 0%), use **Place order with supplier** — both parties get email; requirement moves to **CONFIRMED**.
5. Log in as the supplier — **Order requests** section shows pending orders; **Accept** or **Decline** (emails both sides again).

### C. Client — live AI pipeline (optional)

1. Open the **turmeric** requirement (OPEN) → **Run AI matching** (needs Ollama).
2. Mention **email notifications** queued for client + top suppliers.

### D. Supplier portal

1. Log in as `partial.mills@wisdommatch.demo`.
2. Show **matches** tied to their offering (partial fulfillment story).

### E. Settings

1. Client → **Settings** — edit company/phone (email locked).
2. Same for a supplier account.

### F. Admin superuser

1. Log in as `admin@wisdommatch.demo` (must be in `ADMIN_EMAILS`).
2. Tabs: users, clients, suppliers, requirements, offerings, **matches** (all statuses and budget/delivery fields).

### G. Confirmed deal

1. Back as client — open **cashew** requirement (CONFIRMED) with an **ACCEPTED** match to show later-stage status.

## 5. What each match teaches

| Match | Product | Quantity | Budget | Delivery | Status |
|-------|---------|----------|--------|----------|--------|
| Apex Grain | EXACT_MATCH | 100% | Within | On time | ACCEPTED |
| Partial Mills | CLOSE_MATCH | **60%** | Within | On time | SHORTLISTED |
| Coastal Staples | **RELATED_BUT_DIFFERENT** | 100% | Within | **Uncertain** | VIEWED |
| Premium Imports | CLOSE_MATCH | 100% | **Over** | **Late** | SUGGESTED |
| Quote Co-op | EXACT_MATCH | **55%** | **Quote required** | Uncertain | SUGGESTED |
| Forge Metals | **CLEAR_REJECT** | 0% | — | — | REJECTED |

## 6. Reset before another presentation

```bash
cd backend && npm run seed:demo
```
