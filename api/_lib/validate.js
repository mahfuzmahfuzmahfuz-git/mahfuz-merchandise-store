const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100) {
    return 'Name is required.';
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return 'A valid email address is required.';
  }
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
}

export function validateLogin({ email, password }) {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return 'Email is required.';
  }
  if (typeof password !== 'string' || password.length === 0) {
    return 'Password is required.';
  }
  return null;
}
