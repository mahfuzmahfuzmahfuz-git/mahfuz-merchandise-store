import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

// Role mix reasoning: see plan doc. 35 accounts total, staggered creation
// across the first ~5 days so first-touch dates aren't all on day 0.
const ROLE_PLAN = [
  ...Array(15).fill('single'), // sign up + purchase same session, done
  ...Array(12).fill('multi'), // 2 sessions: touch 1 (browse/cart), return to purchase
  ...Array(8).fill('repeat'), // targets 3 sessions/orders; window may only allow 2 — that's expected, not a bug
];

const ROLE_CONFIG = {
  single: { maxSessions: 1, gapDaysMin: 0, gapDaysMax: 0 },
  multi: { maxSessions: 2, gapDaysMin: 2, gapDaysMax: 4 },
  repeat: { maxSessions: 3, gapDaysMin: 2, gapDaysMax: 3 },
};

const DAY_MS = 24 * 60 * 60 * 1000;

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function loadRoster(path, rng) {
  let roster;
  try {
    roster = JSON.parse(await readFile(path, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    roster = null;
  }

  if (!roster) {
    const roles = shuffle(ROLE_PLAN, rng);
    roster = {
      startedAt: new Date().toISOString(),
      plan: roles.map((role, i) => ({
        id: `synth-${String(i + 1).padStart(3, '0')}`,
        role,
        // staggered across the first ~5 days so accounts don't all appear on day 0
        dayOffset: Math.floor(rng() * 5),
      })),
      created: [],
    };
  }
  return roster;
}

export async function saveRoster(path, roster) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(roster, null, 2));
}

// Plan stubs whose scheduled first-touch day has arrived and haven't been created yet.
export function getDueNewSignups(roster, now, limit) {
  const daysSinceStart = (now - new Date(roster.startedAt)) / DAY_MS;
  const createdIds = new Set(roster.created.map((a) => a.id));
  return roster.plan
    .filter((stub) => !createdIds.has(stub.id) && stub.dayOffset <= daysSinceStart)
    .slice(0, limit);
}

// Created accounts whose next scheduled return session is due and not yet done.
export function getDueReturns(roster, now) {
  return roster.created.filter((a) => !a.done && new Date(a.nextSessionDueAt) <= now);
}

export function markAccountCreated(roster, stub, { email, password, name, firstTouchChannel, createdAt }, rng = Math.random) {
  const config = ROLE_CONFIG[stub.role];
  const account = {
    id: stub.id,
    role: stub.role,
    email,
    password,
    name,
    firstTouchChannel,
    createdAt: createdAt.toISOString(),
    sessionsCompleted: 1,
    maxSessions: config.maxSessions,
    done: config.maxSessions <= 1,
    nextSessionDueAt: config.maxSessions > 1
      ? new Date(createdAt.getTime() + gapMs(config, rng)).toISOString()
      : null,
  };
  roster.created.push(account);
  return account;
}

export function markSessionCompleted(roster, accountId, now, rng) {
  const account = roster.created.find((a) => a.id === accountId);
  if (!account) return;
  account.sessionsCompleted += 1;
  if (account.sessionsCompleted >= account.maxSessions) {
    account.done = true;
    account.nextSessionDueAt = null;
  } else {
    const config = ROLE_CONFIG[account.role];
    account.nextSessionDueAt = new Date(now.getTime() + gapMs(config, rng)).toISOString();
  }
}

function gapMs(config, rng = Math.random) {
  const days = config.gapDaysMin + rng() * (config.gapDaysMax - config.gapDaysMin);
  return days * DAY_MS;
}
