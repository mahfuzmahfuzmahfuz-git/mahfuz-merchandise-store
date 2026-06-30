import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-6 py-7 border-b border-[#e5e5e5] items-start">
      {/* Product thumbnail */}
      <div className="w-20 h-24 flex-shrink-0 bg-[#f0ede8] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div>
        <p className="font-sans text-[13px] text-charcoal mb-1">{item.name}</p>
        <p className="font-sans text-[12px] text-muted mb-1">Size: {item.size}</p>
        <p className="font-sans text-[12px] text-muted mb-4">{item.priceDisplay}</p>

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onUpdateQty(item.id, item.size, item.quantity - 1)}
            className="w-7 h-7 border border-[#e5e5e5] text-charcoal text-[13px] flex items-center justify-center hover:bg-charcoal hover:text-cream transition-colors duration-200"
          >
            &minus;
          </button>
          <span className="font-sans text-[12px] text-charcoal w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, item.size, item.quantity + 1)}
            className="w-7 h-7 border border-[#e5e5e5] text-charcoal text-[13px] flex items-center justify-center hover:bg-charcoal hover:text-cream transition-colors duration-200"
          >
            +
          </button>
        </div>
      </div>

      {/* Line total + remove */}
      <div className="text-right">
        <p className="font-sans text-[13px] text-charcoal mb-4">
          &pound;{(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={() => onRemove(item.id, item.size)}
          className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200 underline underline-offset-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-charcoal mb-4">Your bag is empty.</p>
        <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200 border-b border-muted pb-0.5">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8 border-b border-[#e5e5e5] pb-6">
        <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-2">Shopping Bag</p>
        <h1 className="font-serif text-2xl text-charcoal">Your Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
        {/* Items */}
        <div>
          {cartItems.map(item => (
            <CartItem
              key={`${item.id}-${item.size}`}
              item={item}
              onRemove={removeFromCart}
              onUpdateQty={updateQuantity}
            />
          ))}
          <div className="pt-6">
            <Link to="/shop" className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200 border-b border-[#e5e5e5] pb-0.5">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="border border-[#e5e5e5] p-8 h-fit">
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-6">Order Summary</p>

          <div className="flex justify-between mb-3">
            <span className="font-sans text-[13px] text-muted">Subtotal</span>
            <span className="font-sans text-[13px] text-charcoal">&pound;{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-6 pb-6 border-b border-[#e5e5e5]">
            <span className="font-sans text-[13px] text-muted">Shipping</span>
            <span className="font-sans text-[13px] text-muted">Calculated at checkout</span>
          </div>
          <div className="flex justify-between mb-8">
            <span className="font-sans text-[13px] text-charcoal font-medium">Total</span>
            <span className="font-sans text-[14px] text-charcoal font-medium">&pound;{cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-charcoal text-cream text-[11px] tracking-[0.25em] uppercase font-sans hover:opacity-70 transition-opacity duration-200"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
