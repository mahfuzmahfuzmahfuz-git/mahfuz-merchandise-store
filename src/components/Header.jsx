import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cartCount } = useCart();
  const { pathname } = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-[11px] tracking-[0.15em] uppercase font-sans transition-opacity duration-200 hover:opacity-50 ${
        pathname === to ? 'opacity-100' : 'opacity-70'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6] border-b border-[#e5e5e5]">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left nav */}
        <nav className="flex items-center gap-8">
          {navLink('/shop', 'Shop')}
        </nav>

        {/* Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-serif text-[15px] tracking-[0.05em] text-charcoal hover:opacity-60 transition-opacity duration-200 whitespace-nowrap">
            Mahfuz Merchandise Store
          </span>
        </Link>

        {/* Right nav */}
        <nav className="flex items-center gap-8">
          <Link
            to="/cart"
            className="text-[11px] tracking-[0.15em] uppercase font-sans transition-opacity duration-200 hover:opacity-50 opacity-70 relative"
          >
            Bag
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] font-sans bg-charcoal text-cream w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
