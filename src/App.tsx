import React, { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SplashScreen from './components/SplashScreen';
import { registerServiceWorker, isPWA, isOnline, setupOnlineStatusListener } from './utils/serviceWorker';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);

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
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (screen: string) => {
    setCurrentScreen(screen);
    console.log('Navigating to:', screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigation} />;
      default:
        return <HomeScreen onNavigate={handleNavigation} />;
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
          
          {renderCurrentScreen()}
        </>
      )}
    </div>
  );
}

export default App;
