# Outbound Webhooks for Deal Synchronization

## What is implemented

- Admin can create, list, enable/disable and delete webhook configurations.
- Deal creation emits `deal.created`.
- Deal update emits `deal.updated`.
- Payload contains event, timestamp and deal data.
- Optional API-key authentication is sent as `X-API-Key`.
- Every delivery attempt is persisted in `webhook_deliveries`.
- Failed deliveries retry with exponential backoff.
- After the configured retry limit is exhausted, the webhook is disabled.
- Admin can inspect delivery logs in the UI.
- Deal management page provides a simple way to create deals and test synchronization.

## API

### Webhooks

- `GET /api/webhooks`
- `POST /api/webhooks`
- `PUT /api/webhooks/:id`
- `PATCH /api/webhooks/:id/toggle`
- `DELETE /api/webhooks/:id`
- `GET /api/webhooks/:id/deliveries`

All webhook endpoints require an authenticated admin.

### Deals

- `GET /api/deals`
- `POST /api/deals`
- `PUT /api/deals/:id`

Deal endpoints require an authenticated admin or agent.

## Example payload

```json
{
  "event": "deal.created",
  "timestamp": "2026-09-28T10:00:00.000Z",
  "data": {
    "id": 12,
    "customer_id": 4,
    "title": "Enterprise renewal",
    "value": 50000,
    "stage": "Prospecting",
    "probability": 50
  }
}
```

## Database

Run `database/schema.sql` against MySQL to create the `deals`, `webhook_configs`, and `webhook_deliveries` tables.
