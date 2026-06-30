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

export function pushEcommerceEvent(eventData) {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object
  window.dataLayer.push(eventData);
}

// Maps an internal product/cart-item object to a GA4-compliant items entry.
//
// Parameters accepted via opts:
//   size     — mapped to item_variant (the selected size, e.g. "M")
//   quantity — defaults to 1; set to actual qty for cart events
//   index    — zero-based position in the list (required for view_item_list)
//
// Custom item-scoped parameters (in_stock, is_limited_edition) are only
// appended when explicitly defined on the product. This keeps the items array
// clean for products that don't carry these fields. To surface these in GA4
// reports, register them as custom dimensions under Admin > Custom definitions.
export function toGA4Item(product, { size, quantity = 1, index = 0 } = {}) {
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
