// ─── GA4 Ecommerce DataLayer Utilities ───────────────────────────────────────
//
// All ecommerce events go through pushEcommerceEvent() rather than calling
// window.dataLayer.push() directly. This enforces two rules from Google's GTM
// ecommerce guide:
//
//  1. The ecommerce: null reset must precede every ecommerce event so that
//     GTM doesn't bleed parameters from the previous event into the new one.
//     In an SPA this is critical — there is no real page load to reset state.
//
//  2. The window safety guard prevents crashes during SSR/pre-rendering or
//     in environments where GTM hasn't injected itself yet (e.g. dev with
//     ad-blocker, Lighthouse audits, unit tests).

// ─── Enhanced Conversions — User Data Utilities ───────────────────────────────
//
// Google Ads Enhanced Conversions require a user_data object at the ROOT of the
// event payload (not inside ecommerce). These utilities normalize raw form values
// to the exact format Google mandates before they are pushed to the dataLayer.
//
// user_data must never be hashed here — GTM's Enhanced Conversions tag handles
// SHA-256 hashing automatically. Push plain, normalized PII only.

// Strips formatting characters and converts a phone number to E.164 format.
// E.164 requires a leading +, full country code, and no spaces or punctuation.
// Examples:
//   "07123 456789"    → "+447123456789"  (UK local format)
//   "+44 7123 456789" → "+447123456789"  (already has country code, has spaces)
//   "447123456789"    → "+447123456789"  (digits only, no +)
function normalizePhone(raw) {
  // Strip spaces, dashes, and parentheses first
  let cleaned = raw.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('0')) {
    // UK local format (07xxx) — swap leading 0 for +44
    return '+44' + cleaned.slice(1);
  }
  if (cleaned.startsWith('+')) {
    // Already in E.164 or international format — return as-is
    return cleaned;
  }
  if (cleaned.startsWith('44')) {
    // Country code present but missing the + prefix
    return '+' + cleaned;
  }
  // Unknown format — assume UK and prepend +44 as a safe fallback
  return '+44' + cleaned;
}

// Builds a Google-mandated user_data object from raw checkout form values.
// Keys must match exactly: email_address, phone_number, and the address sub-keys.
// Only fields the store actually collects are included — omitting uncollected
// fields (city, region, postal_code) is correct; sending empty strings is not.
export function buildUserData({ firstName, lastName, email, phone }) {
  return {
    email_address: email.trim().toLowerCase(),
    phone_number: normalizePhone(phone.trim()),
    address: {
      first_name: firstName.trim().toLowerCase(),
      last_name: lastName.trim().toLowerCase(),
      country: 'gb', // hardcoded — this store ships within the UK only
    },
  };
}

export function pushEcommerceEvent(eventData) {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object
  window.dataLayer.push(eventData);
}

// Maps an internal product/cart-item object to a GA4-compliant items entry.
//
// Parameters accepted via opts:
//   size          — mapped to item_variant (the selected size, e.g. "M")
//   quantity      — defaults to 1; set to actual qty for cart events
//   index         — explicit override for the GA4 item position; only pass this
//                   from view_item_list where the list position matters. For all
//                   other events (view_item, add_to_cart, cart, checkout, purchase)
//                   omit it — the function reads product.index instead, which is
//                   the catalog position stored on the product object in products.js.
//                   This keeps the index value consistent throughout the funnel.
//
// Custom item-scoped parameters (in_stock, is_limited_edition) are conditionally
// appended when defined on the product. Cart items carry these too because
// CartContext spreads the full product object via { ...product, size, quantity }.
// Register them as item-scoped custom dimensions in GA4 Admin > Custom definitions.
export function toGA4Item(product, { size, quantity = 1, index: explicitIndex } = {}) {
  // Prefer an explicitly passed index (e.g. list position on PLP).
  // Fall back to the catalog index stored on the product itself so that
  // view_item, add_to_cart, and all cart/checkout/purchase events
  // consistently report the same position as view_item_list did.
  const index = explicitIndex !== undefined ? explicitIndex : (product.index ?? 0);

  const item = {
    item_id: String(product.id),
    item_name: product.name,
    item_brand: 'Mahfuz Merchandise',
    item_category: 'Apparel',
    price: product.price,
    quantity,
    index,
  };

  // item_variant carries the selected size — only set when a size is known
  if (size) item.item_variant = size;

  // Custom item-scoped parameters — conditionally included so products that
  // don't define these fields don't pollute the items array with undefined values
  if (product.in_stock !== undefined) item.in_stock = product.in_stock;
  if (product.is_limited_edition !== undefined) item.is_limited_edition = product.is_limited_edition;

  return item;
}
