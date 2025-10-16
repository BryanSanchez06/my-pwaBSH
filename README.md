# GENESIS PWA — Guía rápida

Este repositorio contiene una PWA construida con React + TypeScript + Vite. Incluye manejo de tareas offline con IndexedDB, sincronización a Firebase/Firestore y notificaciones.

---

## Levantar el proyecto (Windows - cmd)

1. Abre una consola en la carpeta del proyecto (ej. `d:\pwa\my-pwaBSH`).
2. Instala dependencias:

```cmd
npm install
```

3. Inicia el servidor de desarrollo:

```cmd
npm run dev
```

4. Abre el navegador en la URL que imprima Vite (por defecto `http://localhost:5173`).

5. (Opcional) Para build/preview:

```cmd
npm run build
npm run preview
```

---

## Utilidades de IndexedDB

El proyecto expone funciones para manejar tareas en `src/utils/indexedDB.ts`:

- addTask(task) — Añade una tarea. task = { titulo, descripcion, fecha, pendiente?: boolean }
- getAllTasks() — Retorna todas las tareas almacenadas.
- updateTask(task) — Actualiza una tarea existente (por ejemplo para marcar `pendiente: false`).
- removeTask(id) — Elimina una tarea por id (uso manual; la sincronización no elimina tareas automáticamente).

Cómo usarlas desde la app (ejemplos):

```ts
import { addTask, getAllTasks, updateTask, removeTask } from './src/utils/indexedDB';

// Añadir
await addTask({ titulo: 'Comprar', descripcion: 'Leche y pan', fecha: new Date().toISOString(), pendiente: true });

// Obtener todas
const tareas = await getAllTasks();

// Marcar sincronizada
await updateTask({ ...tareas[0], pendiente: false });

// Borrar manual
await removeTask(tareas[0].id);
---

## Notificaciones y Background Sync (pruebas)

El proyecto implementa notificaciones y un flujo de sincronización offline:

- La app solicita permiso de notificaciones al montar la pantalla de tareas.
- Si añades una tarea offline, se guarda en IndexedDB con `pendiente: true`.
- Al volver online la app intenta sincronizar (la app en primer plano y/o el Service Worker pueden sincronizar).

Probar manualmente:

1. En DevTools > Application > Service Workers, confirma que el SW está registrado.
2. En DevTools > Network, selecciona `Offline`.
3. Crea una tarea desde la UI; la verás como "Pendiente".
4. Vuelve a `Online` en DevTools.
5. Observa la sincronización. Cuando termine:
   - si la app está visible, la app recibe un mensaje desde el SW y muestra una notificación (una sola);
   - si la app NO está visible, el SW mostrará una notificación.

Para mostrar una notificación manualmente desde la consola:

```js
const reg = await navigator.serviceWorker.ready;
reg.showNotification('Prueba', { body: 'Notificación de prueba', icon: '/icons/icon-192x192.svg' });
```

Notas sobre Background Sync:
- Background Sync no está soportado en todos los navegadores. La app registra un `sync` tag cuando guardas offline. Si el navegador lo soporta, el SW recibirá el evento `sync` y ejecutará la sincronización.
- El SW también contiene helpers de IndexedDB para marcar tareas como sincronizadas cuando la app no está abierta.

---

## Scripts útiles y recomendaciones

- `npm run dev` — ejecutar en desarrollo.
- `npm run build` — empaquetar para producción.
- `npm run preview` — servir el build para pruebas locales.

---
