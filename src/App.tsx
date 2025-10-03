import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SplashScreen from './components/SplashScreen';
import { registerServiceWorker, isPWA, isOnline, setupOnlineStatusListener } from './utils/serviceWorker';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    registerServiceWorker();

    // Check if app is installed as PWA
    setIsAppInstalled(isPWA());

    // Set up online status listeners
    setupOnlineStatusListener(
      () => setIsOnlineStatus(true),
      () => setIsOnlineStatus(false)
    );

    // Set initial online status
    setIsOnlineStatus(isOnline());

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen);
    console.log('Navigating to:', screen);
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install prompt outcome:', outcome);
      setDeferredPrompt(null);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigate={handleNavigation} 
            onInstall={handleInstallApp}
            showInstallButton={!isAppInstalled && !!deferredPrompt}
          />
        );
      default:
        return (
          <HomeScreen 
            onNavigate={handleNavigation} 
            onInstall={handleInstallApp}
            showInstallButton={!isAppInstalled && !!deferredPrompt}
          />
        );
    }
  };

  return (
    <div className="app">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <>
          {/* Online/Offline Status Indicator */}
          {!isOnlineStatus && (
            <div className="offline-indicator">
              <span>📡 Modo sin internet</span>
            </div>
          )}
          
          {/* PWA Install Banner */}
          {!isAppInstalled && deferredPrompt && (
            <div className="install-banner">
              <div className="install-content">
                <span>📱 Instala esta app para una mejor experiencia</span>
                <button 
                  className="install-btn"
                  onClick={handleInstallApp}
                >
                  Instalar App
                </button>
              </div>
            </div>
          )}
          
          {renderCurrentScreen()}
        </>
      )}
    </div>
  );
}

export default App;
