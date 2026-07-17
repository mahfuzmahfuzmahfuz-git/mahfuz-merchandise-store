import { sql } from '../_lib/db.js';

const ORDER_NOT_FOUND_MESSAGE = 'No matching order found for that ID and email.';
const UNAUTHORIZED_MESSAGE = 'Unauthorized.';

// POST /api/orders/lookup
// Called by the ElevenLabs agent's `check_order_status` webhook tool.
// Body: { order_id: string, email: string }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Shared-secret check so only your agent can hit this endpoint.
  // Set AGENT_WEBHOOK_SECRET in Vercel env vars, and put the same value
  // in the Webhook tool's headers in ElevenLabs as x-webhook-secret.
  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.AGENT_WEBHOOK_SECRET) {
    return res.status(401).json({ error: UNAUTHORIZED_MESSAGE });
  }

  const { order_id, email } = req.body || {};

  if (!order_id || !email) {
    return res.status(400).json({ error: 'order_id and email are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // ADJUST: table/column names below to match your real orders schema.
    const result = await sql`
      SELECT id, status, items, total, created_at, estimated_delivery
      FROM orders
      WHERE id = ${order_id} AND LOWER(email) = ${normalizedEmail}
    `;
    const order = result.rows[0];

    if (!order) {
      return res.status(404).json({ found: false, message: ORDER_NOT_FOUND_MESSAGE });
    }

    return res.status(200).json({
      found: true,
      order_id: order.id,
      status: order.status,
      items: order.items,
      total: order.total,
      placed_on: order.created_at,
      estimated_delivery: order.estimated_delivery,
    });
  } catch (err) {
    console.error('order lookup error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}