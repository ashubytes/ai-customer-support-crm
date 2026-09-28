import axios from 'axios';
import { pool } from '../config/db';

export type DealWebhookEvent = 'deal.created' | 'deal.updated';

export interface DealPayload {
  id: number;
  customer_id: number;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface WebhookConfig {
  id: number;
  endpoint_url: string;
  api_key?: string | null;
  deal_created: number | boolean;
  deal_updated: number | boolean;
  max_retries: number;
  is_active: number | boolean;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function triggerDealWebhook(event: DealWebhookEvent, deal: DealPayload): Promise<void> {
  const [rows] = await pool.query(
    `SELECT id, endpoint_url, api_key, deal_created, deal_updated, max_retries, is_active
     FROM webhook_configs
     WHERE is_active = 1`
  );

  const webhooks = rows as WebhookConfig[];

  await Promise.all(
    webhooks.map(async (webhook) => {
      const enabled = event === 'deal.created' ? Boolean(webhook.deal_created) : Boolean(webhook.deal_updated);
      if (!enabled) return;
      await deliverWebhook(webhook, event, deal);
    })
  );
}

async function deliverWebhook(
  webhook: WebhookConfig,
  event: DealWebhookEvent,
  deal: DealPayload
): Promise<void> {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data: deal,
  };

  const maxRetries = Math.max(0, Number(webhook.max_retries || 0));
  const maxAttempts = maxRetries + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Customer-Support-CRM-Webhook/1.0',
      };

      if (webhook.api_key) {
        headers['X-API-Key'] = webhook.api_key;
      }

      const response = await axios.post(webhook.endpoint_url, payload, {
        headers,
        timeout: 10000,
        validateStatus: () => true,
      });

      const success = response.status >= 200 && response.status < 300;

      await pool.query(
        `INSERT INTO webhook_deliveries
         (webhook_id, deal_id, event_type, request_payload, response_status,
          response_body, attempt_number, status, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          webhook.id,
          deal.id,
          event,
          JSON.stringify(payload),
          response.status,
          safeJson(response.data),
          attempt,
          success ? 'success' : attempt < maxAttempts ? 'retrying' : 'failed',
          success ? null : `Webhook returned HTTP ${response.status}`,
        ]
      );

      if (success) return;
    } catch (error: any) {
      const errorMessage = error?.message || 'Webhook request failed';

      await pool.query(
        `INSERT INTO webhook_deliveries
         (webhook_id, deal_id, event_type, request_payload, response_status,
          response_body, attempt_number, status, error_message)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          webhook.id,
          deal.id,
          event,
          JSON.stringify(payload),
          error?.response?.status || null,
          safeJson(error?.response?.data),
          attempt,
          attempt < maxAttempts ? 'retrying' : 'failed',
          errorMessage,
        ]
      );
    }

    if (attempt < maxAttempts) {
      await sleep(Math.min(30000, 1000 * 2 ** (attempt - 1)));
    }
  }

  await pool.query(
    `UPDATE webhook_configs SET is_active = 0 WHERE id = ?`,
    [webhook.id]
  );
}

function safeJson(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
