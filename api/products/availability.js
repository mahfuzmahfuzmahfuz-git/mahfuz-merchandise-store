import { products } from '../../src/data/products.js';

const UNAUTHORIZED_MESSAGE = 'Unauthorized.';

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

  const query = product_name.trim().toLowerCase();
  const matches = products.filter((p) => p.name.toLowerCase().includes(query));

  if (matches.length === 0) {
    return res.status(200).json({ found: false, message: 'No matching product found.' });
  }

  const results = matches.map((p) => ({
    name: p.name,
    price: p.priceDisplay,
    available_sizes: p.sizes,
    size_available: size ? p.sizes.includes(size) : undefined,
    in_stock: p.in_stock !== undefined ? p.in_stock : true,
    limited_edition: !!p.is_limited_edition,
  }));

  return res.status(200).json({ found: true, products: results });
}