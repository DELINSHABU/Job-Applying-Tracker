import { useState, useEffect, useCallback } from 'react';

const UPDATE_DISMISSED_KEY = 'pwa_update_dismissed';

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => void) | null>(null);

  const dismissUpdate = useCallback(() => {
    localStorage.setItem(UPDATE_DISMISSED_KEY, Date.now().toString());
    setUpdateAvailable(false);
    console.log('PWA: Update dismissed');
  }, []);

  const forceUpdateAvailable = useCallback(() => {
    console.log('PWA: Forcing update prompt to show');
    setUpdateAvailable(true);
  }, []);

  const checkForUpdate = useCallback(() => {
    console.log('PWA: Manual check for update triggered');
    
    localStorage.removeItem(UPDATE_DISMISSED_KEY);
    setUpdateAvailable(false);
    
    if (updateSW) {
      updateSW();
      console.log('PWA: Update check triggered');
    } else {
      console.warn('PWA: No service worker available for update check');
      setTimeout(() => setUpdateAvailable(true), 500);
    }
  }, [updateSW]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
      console.log('PWA: beforeinstallprompt event fired');
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      console.log('PWA: App installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let swInstance: (() => void) | null = null;

    const initSW = async () => {
      try {
        console.log('PWA: Initializing service worker...');
        const { registerSW } = await import('virtual:pwa-register');
        
        const sw = registerSW({
          onNeedRefresh() {
            console.log('PWA: New content available, need refresh');
            setUpdateAvailable(true);
          },
          onOfflineReady() {
            console.log('PWA: App ready to work offline');
            setOfflineReady(true);
          },
        });
        
        swInstance = sw;
        setUpdateSW(() => sw);
        console.log('PWA: Service worker registered successfully');
      } catch (e) {
        console.warn('PWA: Failed to register service worker:', e);
      }
    };

    initSW();

    return () => {
      if (swInstance) {
        console.log('PWA: Cleaning up service worker');
      }
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`PWA: User response to install prompt: ${outcome}`);

    setInstallPrompt(null);
    setIsInstallable(false);
  };

  const handleUpdateNow = useCallback(() => {
    console.log('PWA: Update Now clicked, reloading...');
    if (updateSW) {
      updateSW();
    }
    setUpdateAvailable(false);
    
    setTimeout(() => {
      console.log('PWA: Forcing page reload...');
      window.location.reload();
    }, 500);
  }, [updateSW]);

  return {
    isInstallable,
    isStandalone,
    installApp,
    updateAvailable,
    updateNow: handleUpdateNow,
    checkForUpdate,
    dismissUpdate,
    forceUpdateAvailable,
    offlineReady,
    setOfflineReady,
  };
}
