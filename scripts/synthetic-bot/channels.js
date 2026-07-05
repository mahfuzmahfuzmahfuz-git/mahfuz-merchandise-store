// Channel weighting: see plan doc for the reasoning behind each number.
// Direct/organic carry no UTM params (organic sets a referer instead); all
// paid + email channels carry UTM params and no referer override.
export const CHANNELS = [
  { key: 'direct', weight: 22, utm: null, referer: null },
  { key: 'organic_search', weight: 20, utm: null, referer: 'https://www.google.com/' },
  { key: 'paid_search_nonbrand', weight: 16, utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'nonbrand' }, referer: null },
  { key: 'paid_social_meta', weight: 13, utm: { utm_source: 'facebook', utm_medium: 'paid_social', utm_campaign: 'prospecting' }, referer: null },
  { key: 'paid_social_tiktok', weight: 10, utm: { utm_source: 'tiktok', utm_medium: 'paid_social', utm_campaign: 'prospecting' }, referer: null },
  { key: 'email', weight: 11, utm: { utm_source: 'email', utm_medium: 'email', utm_campaign: 'newsletter' }, referer: null },
  { key: 'paid_search_brand', weight: 8, utm: { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'brand' }, referer: null },
];

const TOTAL_WEIGHT = CHANNELS.reduce((sum, c) => sum + c.weight, 0);

// rng: () => number in [0, 1) — pass a seeded/deterministic fn in tests, Math.random() in prod.
export function pickChannel(rng) {
  let roll = rng() * TOTAL_WEIGHT;
  for (const channel of CHANNELS) {
    if (roll < channel.weight) return channel;
    roll -= channel.weight;
  }
  return CHANNELS[CHANNELS.length - 1];
}

export function channelByKey(key) {
  const found = CHANNELS.find((c) => c.key === key);
  if (!found) throw new Error(`Unknown channel key: ${key}`);
  return found;
}

// Builds the landing URL + navigation options (referer) for a given channel.
export function buildArrival(baseUrl, channel, path = '/') {
  const url = new URL(path, baseUrl);
  if (channel.utm) {
    for (const [k, v] of Object.entries(channel.utm)) url.searchParams.set(k, v);
  }
  return {
    url: url.toString(),
    gotoOptions: channel.referer ? { referer: channel.referer } : {},
  };
}
