// One-off setup script — creates and seeds a demo `orders` table.
// Run once locally after `vercel env pull .env.local`:
//   node scripts/init-orders.js

import { config } from 'dotenv';
config({ path: '.env.local' });

const { sql } = await import('../api/_lib/db.js');

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      status TEXT NOT NULL,
      items JSONB NOT NULL,
      total NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      estimated_delivery DATE
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS orders_email_lower_idx ON orders (LOWER(email))
  `;

  await sql`
    INSERT INTO orders (id, email, status, items, total, created_at, estimated_delivery)
    VALUES
      ('ORD100001', 'test@test.com', 'shipped', '["Washed Ringer Tee (M)"]', 95.00, now() - interval '3 days', now() + interval '2 days'),
      ('ORD100002', 'test@test.com', 'processing', '["Script Paneled Rugby (L)"]', 255.00, now() - interval '1 day', now() + interval '5 days'),
      ('ORD100003', 'demo@example.com', 'delivered', '["Long-Sleeve Rally Tee (S)"]', 170.00, now() - interval '10 days', now() - interval '5 days')
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('orders table ready with demo data.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});