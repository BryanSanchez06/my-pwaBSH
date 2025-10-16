import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import SplashScreen from './components/SplashScreen';
import { registerServiceWorker, isPWA, isOnline, setupOnlineStatusListener, requestNotificationPermission } from './utils/serviceWorker';
import { getAllTasks, updateTask } from './utils/indexedDB';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import './App.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // Eliminar: const [tasks, setTasks] = useState<Task[]>([]);

  // Efecto para sincronizar y borrar tareas cuando vuelva internet
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
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Request notification permission
    requestNotificationPermission();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      const allTasks = await getAllTasks();
      for (const tarea of allTasks) {
        try {
          await addDoc(collection(db, 'tareas'), tarea);
          // En lugar de eliminar la tarea local, la marcamos como sincronizada
          if (tarea.id) {
            await updateTask({ ...tarea, pendiente: false });
          }
        } catch (e) {
          console.log('Error subiendo tarea a Firebase', e);
        }
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
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

  // Nueva función para disparar push local
  const handleTestPush = async () => {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('Notificación de prueba', {
        body: 'Hola, esto es una notificación push simulada',
        icon: '/icons/icon-192x192.svg',
      });
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
          
          {/* Push Local(notificación de prueba) */}
          <div style={{position:'fixed',bottom:20,right:30,zIndex:20}}>
            <button onClick={handleTestPush} style={{padding:'0.75em 1.5em',borderRadius:24,border:0,background:'#667eea',color:'white',fontWeight:'bold',boxShadow:'0 4px 14px #0002'}}>
              🔔 Notificación de prueba
            </button>
          </div>

          {renderCurrentScreen()}
        </>
      )}
    </div>
  );
}

export default App;
