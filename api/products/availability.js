import { sql } from '../_lib/db.js';

const UNAUTHORIZED_MESSAGE = 'Unauthorized.';

// POST /api/products/availability
// Called by the ElevenLabs agent's `check_product_availability` webhook tool.
// Body: { product_name: string, size?: string }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secret = req.headers['x-webhook-secret'];
  if (!secret || secret !== process.env.AGENT_WEBHOOK_SECRET) {
    return res.status(401).json({ error: UNAUTHORIZED_MESSAGE });
  }

  const { product_name, size } = req.body || {};

  if (!product_name) {
    return res.status(400).json({ error: 'product_name is required.' });
  }

  try {
    // ADJUST: table/column names below to match your real products schema.
    const result = await sql`
      SELECT name, price, sizes, stock
      FROM products
      WHERE LOWER(name) LIKE LOWER(${'%' + product_name + '%'})
      LIMIT 3
    `;

    if (result.rows.length === 0) {
      return res.status(200).json({ found: false, message: 'No matching product found.' });
    }

    const products = result.rows.map((p) => ({
      name: p.name,
      price: p.price,
      available_sizes: p.sizes,
      in_stock: size ? (p.sizes || []).includes(size) : p.stock > 0,
    }));

    return res.status(200).json({ found: true, products });
  } catch (err) {
    console.error('product availability error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}