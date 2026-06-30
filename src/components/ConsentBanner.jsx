import { useState } from 'react';

// localStorage key used to persist the user's consent choices across sessions.
// Deleting this key (DevTools → Application → Local Storage) resets the banner
// to its first-visit state on the next page load.
const STORAGE_KEY = 'mahfuz_consent_state';

// Fires a Consent Mode v2 'update' command to Google's tag layer.
// Must be called BEFORE saving to localStorage so GTM picks up the new state
// before any tags fire on the same interaction. Skips silently in environments
// where GTM hasn't loaded yet (e.g. dev server without GTM injected).
function executeGtagUpdate(analyticsGranted, marketingGranted) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    // Controls GA4 and other analytics tags
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    // Controls Google Ads conversion + remarketing tags
    ad_storage: marketingGranted ? 'granted' : 'denied',
    // Controls whether user data can be sent to Google for ad measurement
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    // Controls personalised ad targeting
    ad_personalization: marketingGranted ? 'granted' : 'denied',
  });
}

// Props:
//   visible   — controls whether the banner renders (managed by App.jsx)
//   onClose   — called after any save action; App.jsx sets visible=false
export default function ConsentBanner({ visible, onClose }) {
  // Toggle state for the two user-controlled categories.
  // Strictly Necessary is always true and has no toggle.
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Central save handler — always runs gtag update first, then persists to
  // localStorage, then closes the banner. Order matters: gtag must fire before
  // any subsequent tag calls that might be triggered by the close/re-render.
  const save = (analyticsVal, marketingVal) => {
    executeGtagUpdate(analyticsVal, marketingVal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      strictlyNecessary: true,
      analytics: analyticsVal,
      marketing: marketingVal,
      timestamp: new Date().toISOString(), // stored so you can audit consent age if needed
    }));
    onClose();
  };

  // Button handlers — each maps to a specific consent combination
  const acceptAll = () => save(true, true);
  const rejectAll = () => save(false, false);
  const savePreferences = () => save(analytics, marketing); // respects current toggle state

  // Don't render anything if the banner isn't active — keeps DOM clean
  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF9F6] border-t border-[#e5e5e5] shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">

          {/* Left — description text + category toggles */}
          <div className="flex-1">
            <p className="font-serif text-[14px] text-charcoal mb-1 tracking-wide">Cookie Preferences</p>
            <p className="text-[12px] text-muted font-sans leading-relaxed max-w-2xl">
              We use cookies to enhance your browsing experience and analyse site traffic. You can manage your preferences below.
            </p>

            {/* Cookie category toggles */}
            <div className="flex flex-wrap items-center gap-6 mt-4">

              {/* Strictly Necessary — always on, intentionally non-interactive */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 bg-charcoal rounded-full relative opacity-50 cursor-not-allowed">
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted">Strictly Necessary</span>
              </div>

              {/* Analytics toggle — maps to analytics_storage in gtag */}
              <button onClick={() => setAnalytics(v => !v)} className="flex items-center gap-2 group">
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${analytics ? 'bg-charcoal' : 'bg-[#d5d5d5]'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${analytics ? 'right-0.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted group-hover:text-charcoal transition-colors duration-200">Analytics</span>
              </button>

              {/* Marketing toggle — maps to ad_storage, ad_user_data, ad_personalization in gtag */}
              <button onClick={() => setMarketing(v => !v)} className="flex items-center gap-2 group">
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${marketing ? 'bg-charcoal' : 'bg-[#d5d5d5]'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${marketing ? 'right-0.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted group-hover:text-charcoal transition-colors duration-200">Marketing</span>
              </button>
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-col gap-2 md:items-end min-w-[160px]">
            <button
              onClick={acceptAll}
              className="w-full md:w-auto px-6 py-2.5 bg-charcoal text-cream text-[11px] tracking-[0.15em] uppercase font-sans hover:opacity-70 transition-opacity duration-200"
            >
              Accept All
            </button>
            <button
              onClick={rejectAll}
              className="w-full md:w-auto px-6 py-2.5 border border-[#e5e5e5] text-charcoal text-[11px] tracking-[0.15em] uppercase font-sans hover:opacity-50 transition-opacity duration-200"
            >
              Reject All
            </button>
            <button
              onClick={savePreferences}
              className="w-full md:w-auto px-6 py-2.5 text-[11px] tracking-[0.15em] uppercase font-sans text-muted hover:text-charcoal transition-colors duration-200 underline underline-offset-2"
            >
              Save Preferences
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// STORAGE_KEY exported so App.jsx can read/watch the same key without hardcoding it.
// executeGtagUpdate exported so App.jsx can reinforce consent state on mount.
export { STORAGE_KEY, executeGtagUpdate };
