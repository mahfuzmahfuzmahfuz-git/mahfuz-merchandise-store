import { useState } from 'react';

const STORAGE_KEY = 'mahfuz_consent_state';

function executeGtagUpdate(analyticsGranted, marketingGranted) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
  });
}

export default function ConsentBanner({ visible, onClose }) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const save = (analyticsVal, marketingVal) => {
    executeGtagUpdate(analyticsVal, marketingVal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      strictlyNecessary: true,
      analytics: analyticsVal,
      marketing: marketingVal,
      timestamp: new Date().toISOString(),
    }));
    onClose();
  };

  const acceptAll = () => save(true, true);
  const rejectAll = () => save(false, false);
  const savePreferences = () => save(analytics, marketing);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FAF9F6] border-t border-[#e5e5e5] shadow-lg">
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Text */}
          <div className="flex-1">
            <p className="font-serif text-[14px] text-charcoal mb-1 tracking-wide">Cookie Preferences</p>
            <p className="text-[12px] text-muted font-sans leading-relaxed max-w-2xl">
              We use cookies to enhance your browsing experience and analyse site traffic. You can manage your preferences below.
            </p>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6 mt-4">
              {/* Strictly Necessary */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-4 bg-charcoal rounded-full relative opacity-50 cursor-not-allowed">
                  <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5" />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted">Strictly Necessary</span>
              </div>

              {/* Analytics */}
              <button onClick={() => setAnalytics(v => !v)} className="flex items-center gap-2 group">
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${analytics ? 'bg-charcoal' : 'bg-[#d5d5d5]'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${analytics ? 'right-0.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted group-hover:text-charcoal transition-colors duration-200">Analytics</span>
              </button>

              {/* Marketing */}
              <button onClick={() => setMarketing(v => !v)} className="flex items-center gap-2 group">
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${marketing ? 'bg-charcoal' : 'bg-[#d5d5d5]'}`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all duration-200 ${marketing ? 'right-0.5' : 'left-0.5'}`} />
                </div>
                <span className="text-[11px] tracking-[0.1em] uppercase font-sans text-muted group-hover:text-charcoal transition-colors duration-200">Marketing</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
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

export { STORAGE_KEY, executeGtagUpdate };
