import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { Flame, Cloud, Database, Download, RotateCcw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const Header: React.FC = () => {
  const { isCloudConnected, resetDatabase, toasts } = usePOS();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install this POS app on mobile: Open your browser menu (⋮ or Share) and tap "Add to Home Screen"');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {/* Toast Notification Banner */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-md pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border text-sm font-medium flex items-center justify-between transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-zinc-900/90 border-brand-orange/40 text-orange-200'
            }`}
          >
            <span>{toast.message}</span>
            <span className="text-xs opacity-60 ml-2">●</span>
          </div>
        ))}
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F1115]/95 backdrop-blur-md border-b border-[#222631] px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-glow-orange/40 flex-shrink-0">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                  SHREE YASH
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange border border-brand-orange/30">
                  HOTEL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                POS &bull; Inventory &bull; Analytics
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install PWA Button */}
            <button
              onClick={handleInstallClick}
              title="Install App on Home Screen"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-300 hover:text-white text-xs font-semibold transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-brand-orange" />
              <span className="hidden xs:inline">App</span>
            </button>

            {/* Cloud / Local DB Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                isCloudConnected
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800/90 border-zinc-700/60 text-zinc-300'
              }`}
              title={
                isCloudConnected
                  ? 'Connected to Supabase PostgreSQL'
                  : 'Operating in High-Speed Offline LocalStorage mode'
              }
            >
              {isCloudConnected ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Supabase</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline DB</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </>
              )}
            </div>

            {/* Reset Defaults button */}
            <button
              onClick={resetDatabase}
              title="Reset Demo Data to Defaults"
              className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
