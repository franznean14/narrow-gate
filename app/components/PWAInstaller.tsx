'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was just installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-center gap-4 animate-in slide-in-from-bottom-10 max-w-md">
      <Download size={24} className="flex-shrink-0" />
      <div className="flex-1">
        <div className="font-bold text-sm">Install Lampstand</div>
        <div className="text-xs opacity-90">Add to home screen for quick access</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="bg-white text-amber-700 font-bold px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors text-sm"
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

