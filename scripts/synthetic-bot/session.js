import { buildArrival } from './channels.js';
import { randomSize, shuffledProducts } from './products.js';
import { generateIdentity } from './identity.js';
import { pickUserAgent } from './stealth.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const think = (rng, min = 800, max = 2500) => delay(min + rng() * (max - min));

async function snapshotDataLayer(page, label, log) {
  if (!log) return;
  const dataLayer = await page.evaluate(() => window.dataLayer || []).catch(() => []);
  log(label, dataLayer);
}

async function acceptConsent(page) {
  const acceptButton = page.getByRole('button', { name: 'Accept All' });
  await acceptButton.waitFor({ state: 'visible', timeout: 8000 });
  await acceptButton.click();
}

// Header nav (src/components/Header.jsx) is present on every route, so these
// work as "real click" navigation from wherever the session currently is —
// only the very first landing hit uses page.goto(), everything else is a
// client-side SPA transition like a genuine visitor would perform.
async function goToShopViaHeader(page) {
  await page.getByRole('link', { name: 'Shop', exact: true }).click();
  await page.waitForURL('**/shop', { timeout: 10000 });
}

async function goToLoginViaHeader(page) {
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.waitForURL('**/login', { timeout: 10000 });
}

async function goToCartViaHeader(page) {
  await page.getByRole('link', { name: /Bag/ }).click();
  await page.waitForURL('**/cart', { timeout: 10000 });
}

async function signUp(page, identity) {
  await goToLoginViaHeader(page);
  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.waitForURL('**/signup', { timeout: 10000 });
  await page.locator('input[name="name"]').fill(identity.name);
  await page.locator('input[name="email"]').fill(identity.email);
  await page.locator('input[name="password"]').fill(identity.password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await page.waitForURL('**/account', { timeout: 10000 });
}

async function logIn(page, account) {
  await goToLoginViaHeader(page);
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('**/account', { timeout: 10000 });
}

async function browseAndMaybeAddToCart(page, rng, { forceAddToCart = false } = {}) {
  await goToShopViaHeader(page);
  // Shuffled + distinct, so a multi-item view defaults to different products
  // rather than repeatedly landing on the same one by chance.
  const candidates = shuffledProducts(rng);
  const viewCount = Math.min(candidates.length, 1 + Math.floor(rng() * 3)); // 1-3 distinct product views
  let itemsAdded = 0;
  for (let i = 0; i < viewCount; i++) {
    const product = candidates[i];
    await think(rng);
    await page.getByRole('link', { name: product.name }).click();
    await page.waitForURL(`**/product/${product.id}`, { timeout: 10000 });
    const isLastChance = forceAddToCart && i === viewCount - 1 && itemsAdded === 0;
    const shouldAdd = isLastChance ? true : rng() < (forceAddToCart ? 0.75 : 0.6);
    if (shouldAdd) {
      const size = randomSize(product, rng);
      await page.getByRole('button', { name: size, exact: true }).click();
      await page.getByRole('button', { name: 'Add to Bag' }).click();
      await page.getByRole('button', { name: 'View Bag' }).waitFor({ timeout: 5000 });
      itemsAdded += 1;
    }
    if (i < viewCount - 1) await goToShopViaHeader(page);
  }
  return itemsAdded > 0;
}

// Occasionally buy more than one unit of an item — real baskets aren't
// always qty-1-per-line. Cart quantity steppers (src/pages/Cart.jsx) have no
// aria-label, just literal "+"/"-" text, so match on that.
async function maybeBumpQuantities(page, rng) {
  const plusButtons = page.getByRole('button', { name: '+', exact: true });
  const count = await plusButtons.count();
  if (count === 0) return;
  const bumps = Math.floor(rng() * 3); // 0-2 quantity bumps this cart visit
  for (let i = 0; i < bumps; i++) {
    const idx = Math.floor(rng() * count);
    await plusButtons.nth(idx).click();
    await think(rng, 300, 900);
  }
}

async function completeCheckout(page, identity, rng) {
  await goToCartViaHeader(page);
  await maybeBumpQuantities(page, rng);
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await page.waitForURL('**/checkout', { timeout: 10000 });
  await think(rng, 500, 1500);
  await page.locator('input[name="firstName"]').fill(identity.firstName);
  await page.locator('input[name="lastName"]').fill(identity.lastName);
  await page.locator('input[name="email"]').fill(identity.email);
  await page.locator('input[name="phone"]').fill(identity.phone);
  await page.getByRole('button', { name: 'Complete Order' }).click();
  await page.getByRole('heading', { name: 'Order Confirmed' }).waitFor({ timeout: 10000 });
}

// Non-converters drop off at a randomized funnel stage and never sign up.
async function runGuestSession(page, rng, log) {
  await snapshotDataLayer(page, 'landing', log);
  const dropoffStage = rng();
  const addedToCart = await browseAndMaybeAddToCart(page, rng);
  await snapshotDataLayer(page, 'after_browse', log);

  if (!addedToCart || dropoffStage < 0.55) {
    return; // left after browsing, with or without an add_to_cart
  }
  if (dropoffStage < 0.8) {
    await goToCartViaHeader(page);
    await snapshotDataLayer(page, 'viewed_cart_no_checkout', log);
    return;
  }
  // reached checkout but abandoned without submitting
  await goToCartViaHeader(page);
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await page.waitForURL('**/checkout', { timeout: 10000 });
  await snapshotDataLayer(page, 'abandoned_at_checkout', log);
}

// New account, first appearance. `role` decides whether this touch converts:
// single/repeat convert immediately, multi does not (it converts on return).
async function runNewSignupSession(page, rng, { role, identity, signupTiming }, log) {
  await snapshotDataLayer(page, 'landing', log);

  if (signupTiming === 'early') {
    await signUp(page, identity);
    await snapshotDataLayer(page, 'after_sign_up', log);
  }

  const shouldConvert = role !== 'multi';
  const addedToCart = await browseAndMaybeAddToCart(page, rng, { forceAddToCart: shouldConvert });
  await snapshotDataLayer(page, 'after_browse', log);

  if (signupTiming === 'late') {
    await signUp(page, identity);
    await snapshotDataLayer(page, 'after_sign_up', log);
  }

  if (shouldConvert && addedToCart) {
    await completeCheckout(page, identity, rng);
    await snapshotDataLayer(page, 'after_purchase', log);
  }
}

// Returning account, real login, always attempts to (re)purchase.
async function runReturnSession(page, rng, { account }, log) {
  await snapshotDataLayer(page, 'landing', log);
  await logIn(page, account);
  await snapshotDataLayer(page, 'after_login', log);

  const identity = {
    firstName: account.name.split(' ')[0],
    lastName: account.name.split(' ').slice(1).join(' ') || account.name,
    email: account.email,
    phone: `+447${String(Math.floor(rng() * 900000000) + 100000000)}`,
  };

  const addedToCart = await browseAndMaybeAddToCart(page, rng, { forceAddToCart: true });
  await snapshotDataLayer(page, 'after_browse', log);
  if (addedToCart) {
    await completeCheckout(page, identity, rng);
    await snapshotDataLayer(page, 'after_purchase', log);
  }
}

// Runs one full synthetic session in a fresh browser context (no storage-state
// reuse). `job` is one of:
//   { kind: 'guest', channel }
//   { kind: 'new-signup', channel, role }               -> caller must persist the returned identity into the roster
//   { kind: 'return', channel, account }
export async function runSession(browser, baseUrl, job, rng, log) {
  const context = await browser.newContext({ baseURL: baseUrl, userAgent: pickUserAgent(rng) });
  const page = await context.newPage();
  let identity = null;

  try {
    const arrival = buildArrival(baseUrl, job.channel, '/');
    await page.goto(arrival.url, arrival.gotoOptions);
    await acceptConsent(page);
    await think(rng);

    if (job.kind === 'guest') {
      await runGuestSession(page, rng, log);
    } else if (job.kind === 'new-signup') {
      identity = generateIdentity(rng);
      const signupTiming = rng() < 0.5 ? 'early' : 'late';
      await runNewSignupSession(page, rng, { role: job.role, identity, signupTiming }, log);
    } else if (job.kind === 'return') {
      await runReturnSession(page, rng, { account: job.account }, log);
    } else {
      throw new Error(`Unknown job kind: ${job.kind}`);
    }
  } finally {
    await context.close();
  }

  return { identity };
}
