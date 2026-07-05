import bcrypt from 'bcryptjs';
import { sql } from '../_lib/db.js';
import { validateSignup } from '../_lib/validate.js';
import { signSession, setSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body || {};

  const validationError = validateSignup({ name, email, password });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const isSynthetic = normalizedEmail.endsWith('@synthetic.mahfuzmerch.test');

  try {
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${normalizedEmail}
    `;
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const inserted = await sql`
      INSERT INTO users (email, password_hash, name, is_synthetic)
      VALUES (${normalizedEmail}, ${passwordHash}, ${trimmedName}, ${isSynthetic})
      RETURNING id, name, email
    `;
    const user = inserted.rows[0];

    const token = signSession(user);
    setSessionCookie(res, token);

    return res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    console.error('signup error', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
