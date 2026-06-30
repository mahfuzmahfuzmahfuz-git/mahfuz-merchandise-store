import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import { pushEcommerceEvent, toGA4Item } from '../utils/analytics';

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block border-r border-b border-[#e5e5e5] last:border-r-0">
      {/* Product image */}
      <div className="relative overflow-hidden bg-[#f0ede8]" style={{ paddingBottom: '125%' }}>
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
        />
      </div>

      {/* Product info */}
      <div className="px-4 py-4 border-t border-[#e5e5e5]">
        <p className="text-[12px] font-sans text-charcoal leading-snug mb-1 group-hover:opacity-60 transition-opacity duration-200">
          {product.name}
        </p>
        <p className="text-[12px] font-sans text-muted">
          {product.priceDisplay}
        </p>
      </div>
    </Link>
  );
}

export default function Shop() {
  // GA4: view_item_list — fires once when the product listing page mounts.
  // The empty dependency array is intentional: we only want one event per page
  // load, not one per render. Products are static so there's no risk of stale data.
  useEffect(() => {
    pushEcommerceEvent({
      event: 'view_item_list',
      ecommerce: {
        currency: 'GBP',
        item_list_id: 'the_collection',
        item_list_name: 'The Collection',
        // Map all visible products to GA4 items; index = position in the grid
        items: products.map((product, index) => toGA4Item(product, { index })),
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-10 border-b border-[#e5e5e5] pb-6">
        <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-2">
          All Products
        </p>
        <h1 className="font-serif text-2xl text-charcoal">The Collection</h1>
      </div>

      {/* Product grid — 3-up on desktop, 2-up on tablet, 1-up on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#e5e5e5]">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Item count */}
      <div className="mt-8 text-center">
        <p className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted">
          {products.length} Items
        </p>
      </div>
    </div>
  );
}
