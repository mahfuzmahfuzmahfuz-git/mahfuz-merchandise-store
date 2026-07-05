import { neon } from '@neondatabase/serverless';

// fullResults: true makes query results shape as { rows, rowCount, ... },
// matching the { rows: [...] } access pattern used by every call site.
export const sql = neon(process.env.DATABASE_URL, { fullResults: true });
