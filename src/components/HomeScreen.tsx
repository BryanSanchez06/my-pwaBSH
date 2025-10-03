import React from 'react';
import './HomeScreen.css';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="home-screen">
      {/* Desktop Layout */}
      <div className="desktop-layout">
        <header className="desktop-header">
          <div className="desktop-nav">
            <div className="nav-logo">
              <div className="logo-icon">PWA</div>
              <span className="logo-text">Mi primer PWA</span>
            </div>
            <nav className="desktop-menu">
              <a href="#features" className="nav-link">Actualizaciones</a>
              <a href="#about" className="nav-link">Acerca de nosotros</a>
              <a href="#contact" className="nav-link">Contacto</a>
            </nav>
          </div>
        </header>

        <main className="desktop-main">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                <span className="title-line">Una PWA</span>
                <span className="title-line">Progresiva</span>
                <span className="title-line">Y bonita</span>
              </h1>
              <p className="hero-description">
                Ola profe mire mi primera PWA
              </p>
              <div className="hero-buttons">
                <button className="btn-hero-primary" onClick={() => onNavigate?.('demo')}>
                  <span className="btn-icon">⚡</span>
                  Empieza ahora
                </button>
                <button className="btn-hero-secondary" onClick={() => onNavigate?.('about')}>
                  <span className="btn-icon">📖</span>
                  Aprende mas
                </button>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <div className="card-icon">🚀</div>
                <span>Rapida</span>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">📱</div>
                <span>Movil</span>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🔒</div>
                  <span>Segura</span>
              </div>
            </div>
          </div>

          <section className="features-section">
            <h2 className="section-title">Caracteristicas clave</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h3>Velocidad</h3>
                <p>Rendimiento optimizado con carga instantánea</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h3>Movilidad primero</h3>
                <p>Diseñado para dispositivos móviles con diseño responsivo</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h3>Segura</h3>
                <p>Cifrado HTTPS y manejo seguro de datos</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌐</div>
                <h3>Listo sin conexión</h3>
                <p>Funciona sin conexión a Internet</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-layout">
        <header className="mobile-header">
          <div className="mobile-logo">
            <div className="logo-icon">PWA</div>
          </div>
          <h1 className="mobile-title">GENESIS App</h1>
        </header>

        <main className="mobile-content">
          <div className="mobile-hero">
            <div className="hero-icon">📱</div>
            <h2 className="mobile-hero-title">Una PWA</h2>
            <p className="mobile-hero-text">Rapida, confiable, y funciona sin internet</p>
          </div>

          <div className="mobile-features">
            <div className="mobile-feature-card" onClick={() => onNavigate?.('features')}>
              <div className="mobile-feature-icon">⚡</div>
              <div className="mobile-feature-content">
                <h3>Carga rapida</h3>
                <p>Optimizado para velocidad</p>
              </div>
            </div>
            
            <div className="mobile-feature-card" onClick={() => onNavigate?.('offline')}>
              <div className="mobile-feature-icon">🌐</div>
              <div className="mobile-feature-content">
                <h3>Listo sin internet</h3>
                <p>Funciona sin internet</p>
              </div>
            </div>
            
            <div className="mobile-feature-card" onClick={() => onNavigate?.('install')}>
              <div className="mobile-feature-icon">📲</div>
              <div className="mobile-feature-content">
                <h3>Instalable</h3>
                <p>Instala como una app nativa</p>
              </div>
            </div>
          </div>

          <div className="mobile-actions">
            <button className="mobile-btn-primary" onClick={() => onNavigate?.('demo')}>
              Prueba Demo
            </button>
            <button className="mobile-btn-secondary" onClick={() => onNavigate?.('about')}>
              Aprende mas
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeScreen;
