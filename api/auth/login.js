import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { validateLogin } from '../_lib/validate.js';
import { signSession, setSessionCookie } from '../_lib/auth.js';

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  const validationError = validateLogin({ email, password });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await sql`
      SELECT id, name, email, password_hash FROM users WHERE LOWER(email) = ${normalizedEmail}
    `;
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: INVALID_CREDENTIALS_MESSAGE });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: INVALID_CREDENTIALS_MESSAGE });
    }

    const token = signSession(user);
    setSessionCookie(res, token);

    return res.status(200).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
