import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-animation">
            <div className="logo-icon">PWA</div>
          </div>
        </div>
        
        <h1 className="splash-title">GENESIS App</h1>
        <p className="splash-subtitle">Una PWA Progresiva</p>
        
        <div className="loading-container">
          <div className="loading-bar">
            <div 
              className="loading-progress" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-text">Cargando...</p>
        </div>
        
        <div className="splash-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span>Rapida</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Responsivo</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span>Seguro</span>
          </div>
        </div>
      </div>
      
      <div className="splash-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default SplashScreen;

