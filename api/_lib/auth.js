import jwt from 'jsonwebtoken';
import { parse, serialize } from 'cookie';

const COOKIE_NAME = 'mahfuz_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function signSession(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: MAX_AGE_SECONDS,
  });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function setSessionCookie(res, token) {
  const cookieStr = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.VERCEL_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  res.setHeader('Set-Cookie', cookieStr);
}

export function clearSessionCookie(res) {
  const cookieStr = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.VERCEL_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  res.setHeader('Set-Cookie', cookieStr);
}

export function getSessionFromRequest(req) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySession(token);
}
