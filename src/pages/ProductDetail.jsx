import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../data/products';
import { useCart } from '../context/CartContext';
import { pushEcommerceEvent, toGA4Item } from '../utils/analytics';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  // GA4: view_item — fires when a product detail page loads or when the user
  // navigates between product routes (e.g. /product/1 → /product/2) without
  // a full page reload. Keyed on product.id so it re-fires on product change.
  useEffect(() => {
    if (!product) return;
    pushEcommerceEvent({
      event: 'view_item',
      ecommerce: {
        currency: 'GBP',
        value: product.price,
        items: [toGA4Item(product)],
      },
    });
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-charcoal mb-4">Product not found.</p>
        <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200 border-b border-muted pb-0.5">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setError(true);
      return;
    }

    // GA4: add_to_cart — fired before updating app state so GTM captures the
    // event even if a subsequent re-render were to change the selected size.
    // quantity is always 1 here because the PDP has no qty selector.
    pushEcommerceEvent({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'GBP',
        value: product.price * 1,
        items: [toGA4Item(product, { size: selectedSize, quantity: 1 })],
      },
    });

    addToCart(product, selectedSize);
    setAdded(true);
    setError(false);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="mb-10">
        <Link to="/shop" className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200">
          &larr; Shop
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#e5e5e5]">
        {/* Product image */}
        <div className="relative bg-[#f0ede8]" style={{ minHeight: '520px' }}>
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Product info */}
        <div className="p-10 md:p-14 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#e5e5e5]">
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-3">
            Mahfuz Merchandise Store
          </p>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-4 leading-snug">
            {product.name}
          </h1>
          <p className="font-sans text-[15px] text-charcoal mb-8">
            {product.priceDisplay}
          </p>

          <p className="text-[13px] font-sans text-muted leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Details list */}
          <ul className="mb-10 space-y-1.5 border-t border-[#e5e5e5] pt-6">
            {product.details.map(detail => (
              <li key={detail} className="flex items-center gap-2 text-[12px] font-sans text-muted">
                <span className="w-1 h-1 rounded-full bg-muted inline-block opacity-60" />
                {detail}
              </li>
            ))}
          </ul>

          {/* Size selector */}
          <div className="mb-6">
            <p className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted mb-3">
              Select Size {error && <span className="text-red-500 normal-case tracking-normal">&mdash; Please select a size</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setError(false); }}
                  className={`w-12 h-10 text-[11px] tracking-[0.1em] font-sans border transition-colors duration-200 ${
                    selectedSize === size
                      ? 'bg-charcoal text-cream border-charcoal'
                      : 'bg-transparent text-charcoal border-[#e5e5e5] hover:border-charcoal'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 text-[11px] tracking-[0.25em] uppercase font-sans transition-opacity duration-200 ${
              added
                ? 'bg-[#4A5C4B] text-cream opacity-100'
                : 'bg-charcoal text-cream hover:opacity-70'
            }`}
          >
            {added ? 'Added to Bag' : 'Add to Bag'}
          </button>

          {/* View bag */}
          {added && (
            <button
              onClick={() => navigate('/cart')}
              className="mt-3 w-full py-3.5 text-[11px] tracking-[0.25em] uppercase font-sans border border-[#e5e5e5] text-charcoal hover:opacity-50 transition-opacity duration-200"
            >
              View Bag
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
