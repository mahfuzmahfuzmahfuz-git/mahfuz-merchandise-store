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

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

function LocationTracker() {
  const location = useLocation();

  useEffect(() => {
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_path: location.pathname,
    });
  }, [location.pathname]);

  return null;
}

export default function App() {
  const [consentVisible, setConsentVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      setConsentVisible(true);
    } else {
      try {
        const parsed = JSON.parse(existing);
        executeGtagUpdate(parsed.analytics, parsed.marketing);
      } catch (e) {
        // corrupted state — show banner again
        setConsentVisible(true);
      }
    }
  }, []);

  return (
    <>
      <ScrollToTop />
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
        <Footer onManageCookies={() => setConsentVisible(true)} />
      </div>
      <ConsentBanner
        visible={consentVisible}
        onClose={() => setConsentVisible(false)}
      />
    </>
  );
}
