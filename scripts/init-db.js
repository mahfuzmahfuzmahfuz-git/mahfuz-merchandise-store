// One-off setup script — creates the `users` table in the Neon Postgres database.
// Run once locally after `vercel env pull .env.local`:
//   node scripts/init-db.js

import { config } from 'dotenv';
config({ path: '.env.local' });

const { sql } = await import('../api/_lib/db.js');

async function main() {
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email))
  `;

  await sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_synthetic BOOLEAN NOT NULL DEFAULT false
  `;

  console.log('users table ready.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
