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

// Distinct, randomly-ordered products for a session — avoids the same
// product being "browsed" repeatedly by chance, so multi-item views default
// to different products rather than just different sizes of one product.
export function shuffledProducts(rng) {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { products };
