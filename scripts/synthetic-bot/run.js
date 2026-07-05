import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from 'dotenv';

import { pickChannel, channelByKey } from './channels.js';
import { loadRoster, saveRoster, getDueNewSignups, getDueReturns, markAccountCreated, markSessionCompleted } from './roster.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '..', '.env.local') });

const rng = Math.random;
const MAX_CONCURRENCY = 3;
const GUEST_TO_CONVERTER_RATIO = 3.5; // non-converter volume vs. converter (new-signup + return) volume this run

function parseArgs(argv) {
  const args = { dryRun: false, sessions: null };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg.startsWith('--sessions=')) args.sessions = parseInt(arg.split('=')[1], 10);
  }
  return args;
}

async function runPool(jobs, worker, concurrency) {
  const results = new Array(jobs.length);
  let next = 0;
  async function runNext() {
    while (next < jobs.length) {
      const i = next++;
      results[i] = await worker(jobs[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, runNext));
  return results;
}

function buildDryRunBatch(sessionCount) {
  const channelKeys = ['direct', 'organic_search', 'paid_search_nonbrand', 'paid_social_meta', 'paid_social_tiktok', 'email', 'paid_search_brand'];
  const roles = ['single', 'multi', 'repeat'];
  const jobs = [];
  for (let i = 0; i < sessionCount; i++) {
    const channel = channelByKey(channelKeys[i % channelKeys.length]);
    // alternate guest / new-signup so the dry run demonstrates both paths
    if (i % 2 === 0) {
      jobs.push({ kind: 'guest', channel });
    } else {
      jobs.push({ kind: 'new-signup', channel, role: roles[i % roles.length] });
    }
  }
  return jobs;
}

function buildLiveBatch(roster, now, batchSize) {
  const jobs = [];

  const dueReturns = getDueReturns(roster, now);
  for (const account of dueReturns) {
    if (jobs.length >= batchSize) break;
    jobs.push({ kind: 'return', channel: pickChannel(rng), account });
  }

  const remainingForSignups = Math.max(0, batchSize - jobs.length);
  const dueSignups = getDueNewSignups(roster, now, remainingForSignups);
  for (const stub of dueSignups) {
    jobs.push({ kind: 'new-signup', channel: pickChannel(rng), role: stub.role, stub });
  }

  const converterCount = jobs.length;
  const guestCount = Math.round(converterCount * GUEST_TO_CONVERTER_RATIO) || 2;
  for (let i = 0; i < guestCount; i++) {
    jobs.push({ kind: 'guest', channel: pickChannel(rng) });
  }

  return jobs;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = process.env.PRODUCTION_URL;
  if (!baseUrl) throw new Error('PRODUCTION_URL env var is required (the live site to drive).');

  const rosterPath = join(__dirname, 'state', 'roster.json');
  const roster = args.dryRun
    ? { startedAt: new Date().toISOString(), plan: [], created: [] } // throwaway, never persisted
    : await loadRoster(rosterPath, rng);

  const now = new Date();
  const batchSize = args.dryRun ? (args.sessions || 8) : 4 + Math.floor(rng() * 7); // 4-10 in live mode
  const jobs = args.dryRun ? buildDryRunBatch(batchSize) : buildLiveBatch(roster, now, batchSize);

  console.log(`[synthetic-bot] ${args.dryRun ? 'DRY RUN' : 'LIVE RUN'} — ${jobs.length} session(s) against ${baseUrl}`);
  jobs.forEach((j, i) => console.log(`  session ${i + 1}: kind=${j.kind} channel=${j.channel.key}${j.role ? ` role=${j.role}` : ''}`));

  const browser = await chromium.launch({ headless: true });
  const { runSession } = await import('./session.js');

  try {
    await runPool(jobs, async (job, i) => {
      const log = args.dryRun
        ? (label, dataLayer) => console.log(`  [session ${i + 1}] ${label}:`, JSON.stringify(dataLayer))
        : null;

      try {
        const { identity } = await runSession(browser, baseUrl, job, rng, log);

        if (!args.dryRun) {
          if (job.kind === 'new-signup' && identity) {
            markAccountCreated(roster, job.stub, { ...identity, firstTouchChannel: job.channel.key, createdAt: now }, rng);
          } else if (job.kind === 'return') {
            markSessionCompleted(roster, job.account.id, now, rng);
          }
        }
      } catch (err) {
        // One broken session (e.g. a transient nav failure) shouldn't take down the whole batch.
        console.error(`[synthetic-bot] session ${i + 1} (${job.kind}) failed:`, err.message);
      }
    }, MAX_CONCURRENCY);
  } finally {
    await browser.close();
  }

  if (!args.dryRun) {
    await saveRoster(rosterPath, roster);
    console.log(`[synthetic-bot] roster saved: ${roster.created.length} accounts created so far.`);
  } else {
    console.log('[synthetic-bot] dry run complete — roster not persisted.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
