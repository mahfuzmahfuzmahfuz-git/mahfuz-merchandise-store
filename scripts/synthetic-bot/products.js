// Reuses the app's actual product catalog (same source of truth the live site
// renders from) rather than a separate hardcoded copy — importing straight from
// src/ instead of scraping /shop keeps this from going stale if products change.
import { products } from '../../src/data/products.js';

export function randomProduct(rng) {
  return products[Math.floor(rng() * products.length)];
}

export function randomSize(product, rng) {
  return product.sizes[Math.floor(rng() * product.sizes.length)];
}

export { products };
