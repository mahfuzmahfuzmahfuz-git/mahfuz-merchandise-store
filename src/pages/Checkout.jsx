import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pushEcommerceEvent, toGA4Item, buildUserData } from '../utils/analytics';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const finalTotal = cartTotal;

    // Snapshot cartItems BEFORE clearCart() — once the cart is cleared the
    // data is gone from context and can't be recovered for the purchase event.
    const purchasedItems = [...cartItems];

    // GA4: begin_checkout with Enhanced Conversions user_data.
    //
    // Fired here (on form submit) rather than on component mount because the
    // form is empty at mount time — user_data requires actual PII values.
    // user_data sits at the EVENT ROOT alongside ecommerce, NOT inside it.
    // buildUserData() normalizes email to lowercase and phone to E.164 format.
    pushEcommerceEvent({
      event: 'begin_checkout',
      user_data: buildUserData(form),
      ecommerce: {
        currency: 'GBP',
        value: finalTotal,
        // No explicit index — toGA4Item reads item.index (catalog position)
        items: purchasedItems.map(item =>
          toGA4Item(item, { size: item.size, quantity: item.quantity })
        ),
      },
    });

    clearCart();
    navigate('/order-confirmation', {
      state: {
        orderId,
        total: finalTotal,
        customerName: form.firstName,
        purchasedItems,
        // Pass raw form values so OrderConfirmation can build user_data for
        // the purchase event. Normalization happens there via buildUserData().
        customerDetails: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
        },
      },
    });
  };

  const inputClass = "w-full border-b border-[#e5e5e5] bg-transparent py-3 text-[13px] font-sans text-charcoal placeholder-muted focus:outline-none focus:border-charcoal transition-colors duration-200";
  const labelClass = "block text-[11px] tracking-[0.15em] uppercase font-sans text-muted mb-2";

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10 border-b border-[#e5e5e5] pb-6">
        <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-2">Checkout</p>
        <h1 className="font-serif text-2xl text-charcoal">Complete Your Order</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-8">Contact Information</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className={inputClass}
            />
          </div>

          <div className="mb-12">
            <label className={labelClass}>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+44 7000 000000"
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-charcoal text-cream text-[11px] tracking-[0.25em] uppercase font-sans hover:opacity-70 transition-opacity duration-200"
          >
            Complete Order
          </button>
        </form>

        {/* Order summary */}
        <div className="border border-[#e5e5e5] p-8 h-fit">
          <p className="text-[11px] tracking-[0.2em] uppercase font-sans text-muted mb-6">Order Summary</p>
          {cartItems.map(item => (
            <div key={`${item.id}-${item.size}`} className="flex justify-between mb-3">
              <span className="font-sans text-[12px] text-muted pr-4">
                {item.name} &times; {item.quantity}
                <span className="block text-[11px]">Size: {item.size}</span>
              </span>
              <span className="font-sans text-[12px] text-charcoal whitespace-nowrap">
                &pound;{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-[#e5e5e5] pt-4 mt-4 flex justify-between">
            <span className="font-sans text-[13px] text-charcoal">Total</span>
            <span className="font-sans text-[14px] text-charcoal font-medium">&pound;{cartTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
