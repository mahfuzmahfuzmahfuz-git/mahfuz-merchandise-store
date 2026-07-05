import { sql } from '../_lib/db.js';
import { getSessionFromRequest } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = getSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const result = await sql`
      SELECT id, name, email FROM users WHERE id = ${session.sub}
    `;
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.status(200).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
