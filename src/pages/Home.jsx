import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative w-full" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Full-bleed hero */}
      <div
        className="w-full flex flex-col items-center justify-center text-center"
        style={{
          minHeight: 'calc(100vh - 56px)',
          background: 'linear-gradient(160deg, #E8E2D9 0%, #D5C9BB 40%, #C4B5A0 100%)',
        }}
      >
        {/* Decorative top line */}
        <div className="w-px h-16 bg-charcoal opacity-20 mb-10" />

        <p className="text-[11px] tracking-[0.3em] uppercase font-sans text-muted mb-6">
          New Collection — 2026
        </p>

        <h1 className="font-serif text-5xl md:text-7xl text-charcoal leading-tight mb-8 px-6">
          Mahfuz<br />Merchandise
        </h1>

        <p className="text-[12px] tracking-[0.15em] font-sans text-muted mb-14 max-w-xs px-6 leading-relaxed">
          Premium essentials crafted with purpose.<br />
          Understated. Enduring.
        </p>

        <Link
          to="/shop"
          className="text-[11px] tracking-[0.25em] uppercase font-sans text-charcoal border-b border-charcoal pb-0.5 hover:opacity-40 transition-opacity duration-300"
        >
          Shop Collection
        </Link>

        {/* Decorative bottom line */}
        <div className="w-px h-16 bg-charcoal opacity-20 mt-10" />
      </div>
    </div>
  );
}
