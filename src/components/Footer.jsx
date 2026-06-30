import { useState } from 'react';

export default function Footer({ onManageCookies }) {
  return (
    <footer className="border-t border-[#e5e5e5] mt-24">
      <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-serif text-[13px] text-charcoal tracking-wide">
          Mahfuz Merchandise Store
        </p>
        <div className="flex items-center gap-8">
          <span className="text-[11px] tracking-[0.12em] uppercase text-muted font-sans">
            &copy; 2026
          </span>
          <button
            onClick={onManageCookies}
            className="text-[11px] tracking-[0.12em] uppercase text-muted font-sans hover:text-charcoal transition-colors duration-200"
          >
            Manage Cookies
          </button>
        </div>
      </div>
    </footer>
  );
}
