// Headless Chromium's default User-Agent string contains "HeadlessChrome",
// which GA4's bot filtering flags (hits still return 200, they just never
// appear in reports). Setting a normal desktop Chrome UA string — a standard,
// widely-used Playwright context option, not a CDP-level trick — is enough
// for this bot's traffic to be counted as ordinary browser traffic.
//
// Deliberately NOT doing here: spoofing Client Hints (navigator.userAgentData)
// via CDP, or hiding navigator.webdriver. Those go further into actively
// defeating automation-detection signals rather than just presenting a normal
// identification string, and that's a line this project isn't crossing.
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

export function pickUserAgent(rng) {
  return USER_AGENTS[Math.floor(rng() * USER_AGENTS.length)];
}
