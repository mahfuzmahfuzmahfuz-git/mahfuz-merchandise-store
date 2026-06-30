import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { pushEcommerceEvent, toGA4Item, buildUserData } from '../utils/analytics';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const orderId = state?.orderId || 'ORD-UNKNOWN';
  const total = state?.total ?? 0;
  const customerName = state?.customerName || '';
  const purchasedItems = state?.purchasedItems || [];
  // customerDetails was passed from Checkout.jsx before clearCart() ran
  const customerDetails = state?.customerDetails || null;

  // GA4: purchase with Enhanced Conversions user_data.
  //
  // user_data sits at the EVENT ROOT alongside ecommerce, NOT inside it.
  // buildUserData() normalizes the raw form values (lowercase email,
  // E.164 phone) so GTM's Enhanced Conversions tag can hash and match them.
  //
  // transaction_id deduplication: GA4 will not count a second purchase if
  // the same transaction_id arrives again (e.g. user refreshes this page).
  //
  // tax and shipping are 0 — set to real values once payment is integrated.
  useEffect(() => {
    if (purchasedItems.length === 0) return;

    const eventPayload = {
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId,
        value: total,
        tax: 0,
        shipping: 0,
        currency: 'GBP',
        // No explicit index — toGA4Item reads item.index (catalog position)
        items: purchasedItems.map(item =>
          toGA4Item(item, { size: item.size, quantity: item.quantity })
        ),
      },
    };

    // Attach user_data when customer details are available.
    // Placed outside ecommerce at the root level — this is the correct
    // structure for Google Ads Enhanced Conversions via GTM.
    if (customerDetails) {
      eventPayload.user_data = buildUserData(customerDetails);
    }

    pushEcommerceEvent(eventPayload);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center" style={{ minHeight: 'calc(100vh - 56px - 88px)' }}>
      {/* Decorative line */}
      <div className="w-px h-14 bg-charcoal opacity-20 mb-10" />

      <p className="text-[11px] tracking-[0.3em] uppercase font-sans text-muted mb-4">
        Thank you{customerName ? `, ${customerName}` : ''}
      </p>

      <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">
        Order Confirmed
      </h1>

      <p className="font-sans text-[13px] text-muted max-w-sm mb-2 leading-relaxed">
        Your order has been placed and is being processed.
      </p>

      <div className="border border-[#e5e5e5] px-10 py-8 my-10 min-w-[280px]">
        <p className="text-[11px] tracking-[0.15em] uppercase font-sans text-muted mb-4">Order Details</p>
        <div className="flex justify-between mb-3">
          <span className="font-sans text-[12px] text-muted">Order ID</span>
          <span className="font-sans text-[12px] text-charcoal font-medium">{orderId}</span>
        </div>
        <div className="flex justify-between border-t border-[#e5e5e5] pt-3 mt-3">
          <span className="font-sans text-[12px] text-muted">Total Paid</span>
          <span className="font-sans text-[13px] text-charcoal font-medium">&pound;{total.toFixed(2)}</span>
        </div>
      </div>

      <p className="font-sans text-[12px] text-muted mb-10">
        A confirmation will be sent to your email address.
      </p>

      <Link
        to="/shop"
        className="text-[11px] tracking-[0.25em] uppercase font-sans text-charcoal border-b border-charcoal pb-0.5 hover:opacity-40 transition-opacity duration-300"
      >
        Continue Shopping
      </Link>

      {/* Decorative line */}
      <div className="w-px h-14 bg-charcoal opacity-20 mt-10" />
    </div>
  );
}
