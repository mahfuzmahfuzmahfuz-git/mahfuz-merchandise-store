const FIRST_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Charlie', 'Drew', 'Harper', 'Rowan', 'Elliot', 'Finley', 'Reese'];
const LAST_NAMES = ['Bennett', 'Carter', 'Dawson', 'Ellis', 'Foster', 'Grant', 'Hayes', 'Irwin', 'Jensen', 'Kerr', 'Lowry', 'Marsh', 'Nash', 'Osborn', 'Pratt'];

// All synthetic identities use this domain so they can be filtered out of any
// real reporting later (see api/auth/signup.js `is_synthetic` derivation).
const SYNTHETIC_EMAIL_DOMAIN = 'synthetic.mahfuzmerch.test';

function randomFrom(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function randomToken(rng, length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += chars[Math.floor(rng() * chars.length)];
  return out;
}

export function generateIdentity(rng) {
  const firstName = randomFrom(FIRST_NAMES, rng);
  const lastName = randomFrom(LAST_NAMES, rng);
  const token = randomToken(rng);
  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${token}@${SYNTHETIC_EMAIL_DOMAIN}`,
    password: `Synth-${randomToken(rng, 10)}!1`,
    phone: `+447${String(Math.floor(rng() * 900000000) + 100000000)}`,
  };
}

export { SYNTHETIC_EMAIL_DOMAIN };
