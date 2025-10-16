import React from 'react';
import './HomeScreen.css';
import { useEffect, useState } from 'react';
import { addTask, getAllTasks, updateTask } from '../utils/indexedDB';
import type { Task } from '../utils/indexedDB';
import { registerBackgroundSync, requestNotificationPermission } from '../utils/serviceWorker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface HomeScreenProps {
  onNavigate?: (screen: string) => void;
  onInstall?: () => void;
  showInstallButton?: boolean;
}

// Función para guardar la tarea en Firebase o IndexedDB según el estado de la red
async function guardarUniversal(task: Omit<Task, 'id'|'pendiente'>) {
  if (navigator.onLine) {
    try {
      await addDoc(collection(db, 'tareas'), task);
      notificar('Tarea agregada', '¡La tarea fue registrada exitosamente!');
      // También guardarla en local marcado como no pendiente
      await addTask({ ...task, pendiente: false });
      return;
    } catch {
      // Si falla el guardado remoto, guardar offline pendiente
      await addTask({ ...task, pendiente: true });
    }
  } else {
    await addTask({ ...task, pendiente: true });
  }
}

// Nueva función: notificar
function notificar(titulo: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(titulo, { body, icon: '/icons/icon-192x192.svg' });
  }
}

// Sincronizar tareas pendientes
async function sincronizarPendientes(setTasks: (tasks: Task[]) => void) {
  const all = await getAllTasks();
  const pendientes = all.filter(t => t.pendiente);
  if (pendientes.length === 0) return;
  for (const tarea of pendientes) {
    try {
      await addDoc(collection(db, 'tareas'), {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fecha: tarea.fecha
      });
      // Marcar como sincronizada en IndexedDB usando update
      await updateTask({ ...tarea, pendiente: false });
    } catch {
      // Si falla, sigue pendiente
    }
  }
  const actualizadas = await getAllTasks();
  setTasks(actualizadas);
  notificar('Tareas sincronizadas', 'Las tareas pendientes se han sincronizado.');
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, onInstall, showInstallButton }) => {
  // Estado local para formulario y listado
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);


  // Cargar tareas al montar y escuchar evento online
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const all = await getAllTasks();
      setTasks(all);
      setLoading(false);
    }
    cargar();

    // Solicitar permiso de notificaciones
    requestNotificationPermission().then(() => {});

    // Escuchar evento online para sincronizar
    const syncHandler = () => sincronizarPendientes(setTasks);
    window.addEventListener('online', syncHandler);
    return () => window.removeEventListener('online', syncHandler);
  }, [guardando]);

  // Listener de mensajes del Service Worker en un efecto separado para evitar registros múltiples
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = async (ev: MessageEvent) => {
      try {
        const data = ev.data;
        if (data && data.type === 'sync-complete') {
          setTasks(await getAllTasks());
          notificar('Sincronización completa', 'Las tareas pendientes fueron sincronizadas.');
        }
      } catch {
        // ignore
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // Agregar nueva tarea
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const nueva = { titulo, descripcion, fecha: new Date().toISOString() };
    await guardarUniversal(nueva);
    setTitulo('');
    setDescripcion('');
    setGuardando(false);
    if (!navigator.onLine) {
      registerBackgroundSync('background-sync');
    }
    setLoading(true);
    setTasks(await getAllTasks());
    setLoading(false);
  };

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
                {showInstallButton && (
                  <button className="btn-hero-install" onClick={onInstall}>
                    <span className="btn-icon">📱</span>
                    Instalar App
                  </button>
                )}
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

          <section className="tasks-section" style={{margin:"2rem 0"}}>
            <h2>📝 Lista de Tareas Offline</h2>
            <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:8,maxWidth:320}}>
              <input required placeholder="Título" value={titulo} onChange={e=>setTitulo(e.target.value)} />
              <textarea required placeholder="Descripción" value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={2} />
              <button type="submit" disabled={guardando}>{guardando?"Guardando...":"Guardar tarea"}</button>
            </form>
            <div style={{marginTop:16}}>
              {loading ? <span>Cargando...</span> :
                (tasks.length === 0 ? <span>No hay tareas guardadas.</span> :
                  <ul style={{padding:0,listStyle:'none'}}>
                    {tasks.map(t => (
                      <li key={t.id} style={{border:'1px solid #eee',marginBottom:8,padding:8,borderRadius:6,background: t.pendiente ? '#FF0000' : '#000000'}}>
                        <b>{t.titulo}</b> {t.pendiente && <span style={{color:'#ffffff',marginLeft:8}} title="Sincronizará cuando haya internet">(Pendiente ⏳)</span>}
                        <br />
                        <small>{t.descripcion}</small><br />
                        <small>{new Date(t.fecha).toLocaleString()}</small>
                      </li>
                    ))}
                  </ul>
                )}
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
            {showInstallButton && (
              <button className="mobile-btn-install" onClick={onInstall}>
                📱 Instalar App
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeScreen;
