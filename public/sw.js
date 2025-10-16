// Service Worker for PWA
const CACHE_NAME = 'pwa-app-v1';
const STATIC_CACHE_NAME = 'pwa-static-v1';
const DYNAMIC_CACHE_NAME = 'pwa-dynamic-v1';

// App Shell files to cache immediately
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/App.css',
  '/src/index.css',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(APP_SHELL_FILES);
      })
      .then(() => {
        console.log('Service Worker: App shell cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Cache First para assets del App Shell
    if (isAppShellAsset(request)) {
      return await cacheFirstStrategy(request);
    }
    // Stale While Revalidate para imágenes
    if (isImageRequest(request)) {
      return await staleWhileRevalidateStrategy(request);
    }
    // Network First para APIs
    if (isApiRequest(request)) {
      return await networkFirstStrategy(request);
    }
    // Stale While Revalidate para HTML
    if (isHtmlRequest(request)) {
      return await staleWhileRevalidateStrategy(request);
    }
    // Default
    return await networkFirstStrategy(request);
    
  } catch (error) {
    console.error('Service Worker: Fetch error', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage();
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a generic offline response
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First Strategy - for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy - for HTML pages
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.hostname !== location.hostname;
}

function isHtmlRequest(request) {
  return request.headers.get('accept').includes('text/html');
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const offlineResponse = await cache.match('/');
  if (offlineResponse) {
    return offlineResponse;
  }
  return new Response(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>GENESIS - Offline</title>
      <style>
        body { font-family: system-ui,sans-serif; background: linear-gradient(135deg,#667eea,#4ecdc4); color:white; display:flex;align-items:center;justify-content:center; height:100vh; margin:0; }
        .offline-content { text-align:center; background:rgba(0,0,0,0.3); padding:2rem 2.5rem; border-radius:1.5rem; box-shadow:0 6px 24px #0005; }
        img { width:72px; margin-bottom:1rem; }
        button { background:#fff; color:#226; border:none; border-radius:99px; padding:.7em 2em; font-size:1.1rem; margin-top:1.6rem; cursor:pointer; }
        h1 { font-size:2rem; margin-bottom:.8em; letter-spacing:1px; }
      </style>
    </head>
    <body>
      <div class="offline-content">
        <img src="/icons/icon-192x192.svg" alt="Offline"/>
        <h1>¡Estás sin conexión!</h1>
        <p>La app funciona offline, pero algunas funciones requieren internet.<br>Vuelve a conectar y pulsa recargar para sincronizar.</p>
        <button onclick="location.reload()">Recargar</button>
      </div>
    </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

// --- IndexedDB helpers dentro del SW para tareas offline ----
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('offline-tasks-db', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getAllTasks() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const req = tx.objectStore('tasks').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function removeTask(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    tx.objectStore('tasks').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
// --- END IndexedDB helpers ----

async function doBackgroundSync() {
  console.log('Service Worker: Performing background sync');
  try {
    const tasks = await getAllTasks();
    if (!tasks.length) {
      console.log('SW Sync: No hay tareas offline para sincronizar.');
      return;
    }
    for (const t of tasks) {
      // Simulación: "enviar" al backend (puedes reemplazar por fetch real)
      await new Promise(res => setTimeout(res, 500));
      console.log('SW Sync: Enviando tarea (simulado):', t);
      // Si fuera real: await fetch('/api/tareas', {method: 'POST', body: JSON.stringify(t), headers: {'Content-Type': 'application/json'}})
      await removeTask(t.id);
      console.log('SW Sync: Tarea eliminada tras sincronización:', t.id);
    }
    // (Opcional) Notificación después de sincronizar
    self.registration.showNotification('GENESIS', {
      body: '👍 Tareas offline sincronizadas',
      icon: '/icons/icon-192x192.svg'
    });
  } catch (e) {
    console.error('SW Sync: Error en la sincronización offline', e);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificacion de GENESIS',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('GENESIS', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Nuevos helpers para distinguir imágenes y App Shell assets
function isAppShellAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css)$/);
}
function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/);
}

