import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ConsentBanner from './components/ConsentBanner';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import { STORAGE_KEY, executeGtagUpdate } from './components/ConsentBanner';

// Ensure dataLayer exists before GTM loads — GTM appends to this array.
// Defined here as a safety net; index.html also initialises it before the GTM snippet.
window.dataLayer = window.dataLayer || [];

// Tracks React Router location changes and pushes a virtual page view to GTM.
// This is needed because React is a SPA — the browser never does a real page
// load between routes, so GTM wouldn't fire its page view trigger automatically.
function LocationTracker() {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: location.pathname,
    });
  }, [location.pathname]);

  return null; // purely a side-effect component, renders nothing
}

export default function App() {
  // Controls whether the consent banner is shown. Starts false so there's no
  // flash of the banner before localStorage is checked on mount.
  const [consentVisible, setConsentVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);

    if (!existing) {
      // No saved consent — first-time visitor. Show the banner.
      setConsentVisible(true);
    } else {
      try {
        const parsed = JSON.parse(existing);
        // Returning visitor — reinforce the saved consent state into gtag's
        // in-memory layer. This is necessary because React Router navigations
        // don't reload the page, so the index.html consent initialisation
        // only runs once. Without this, the gtag state could be stale after
        // a full browser refresh on a non-root route.
        executeGtagUpdate(parsed.analytics, parsed.marketing);
      } catch (e) {
        // Corrupted or unreadable saved state — treat as a new visitor
        // and show the banner so they can set fresh preferences.
        setConsentVisible(true);
      }
    }
  }, []);

  return (
    <>
      {/* Scrolls to top whenever the route changes */}
      <ScrollToTop />
      {/* Pushes virtual_page_view events to GTM on every route change */}
      <LocationTracker />

      <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
          </Routes>
        </main>
        {/* onManageCookies re-shows the banner without clearing localStorage,
            so the user can update preferences without losing their saved state */}
        <Footer onManageCookies={() => setConsentVisible(true)} />
      </div>

      {/* Banner renders outside the main layout so it overlays everything */}
      <ConsentBanner
        visible={consentVisible}
        onClose={() => setConsentVisible(false)}
      />
    </>
  );
}
