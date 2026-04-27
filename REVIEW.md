# Review integral – Notespad

Fecha: 2026-04-27
Stack analizado: React 19.1, Vite 7.1, Tailwind 4.1, ESLint 9.

Esta review cubre **funcionamiento, UI/UX, calidad de código y testing**. Cada hallazgo lleva nivel de importancia (🔴 Crítico / 🟠 Alto / 🟡 Medio / 🟢 Bajo) y al final hay una **hoja de ruta paso a paso** ordenada por prioridad.

---

## 1. Resumen ejecutivo

Notespad es una SPA mínima que añade y borra notas en memoria. Funciona, pero arrastra varios defectos que conviene corregir antes de seguir creciendo:

- 🔴 **Bug de arquitectura** en `App.jsx` ↔ `Context.jsx`: `App` pasa `<Form/>` y `<List/>` como `children` a `Context`, pero `Context` los ignora y los vuelve a renderizar internamente. Resultado: dos `Form` y dos `List` montados en el DOM (revisado, sí ocurre).
- 🔴 **`key={note.title}`** en `List.jsx` rompe la reconciliación de React si dos notas tienen el mismo título.
- 🔴 **Sin persistencia**: al recargar, todas las notas se pierden.
- 🟠 El componente se llama `Context` pero no usa la API de Context de React; engaña al lector.
- 🟠 `console.log` filtrado en `Form.jsx`.
- 🟠 No hay tests (ni unit ni e2e).
- 🟡 UI poco accesible (botón “X” sin `aria-label`, `id=""` vacío en textarea, contraste y foco mejorables).
- 🟡 Falta validación de espacios en blanco, edición, búsqueda, contador de notas.

---

## 2. Hallazgos – Funcionamiento

### 2.1 🔴 `App.jsx` duplica Form y List

`src/App.jsx:11-15`:
```jsx
<Context>
  <Form/>
  <List/>
</Context>
```
`src/components/Context.jsx:18-27` no recibe `children`; renderiza `<Form/>` y `<List/>` por su cuenta. Los `Form`/`List` que pasa `App` quedan **montados pero desconectados** del estado, y producen dos formularios en pantalla.

**Fix recomendado:** o se hace `Context` un proveedor real y `App` consume con `useContext`, o `Context` pasa a llamarse `NotesContainer` y `App` deja de envolver hijos:
```jsx
// App.jsx
export default function App() {
  return (
    <div className="app-container">
      <NotesContainer />
    </div>
  );
}
```

### 2.2 🔴 `key={note.title}` provoca colisiones

`src/components/List.jsx:10` usa el título como `key`. Si el usuario crea dos notas con el mismo título, React reutiliza el nodo equivocado y borra/edita la nota equivocada. Cambiar por `key={note.id}`.

### 2.3 🔴 Persistencia nula

Las notas viven en `useState`. Cualquier F5 las borra. Mínimo aceptable: `localStorage` con efecto de carga/guardado:
```jsx
const [notes, setNotes] = useState(() => {
  try { return JSON.parse(localStorage.getItem('notespad:notes') ?? '[]'); }
  catch { return []; }
});
useEffect(() => {
  localStorage.setItem('notespad:notes', JSON.stringify(notes));
}, [notes]);
```

### 2.4 🟠 Validación de input

`Form.jsx:10`: `if (title && description)` acepta cadenas con solo espacios. Usar `title.trim()` y `description.trim()`. También conviene fijar `maxLength` (ej. 80 / 500) para evitar payloads gigantes en localStorage.

### 2.5 🟠 `console.log` filtrado

`Form.jsx:12` registra cada nota por consola. Eliminar antes de producción.

### 2.6 🟠 ID basado en `Date.now()`

Si dos notas se crean en el mismo tick (paste rápido, futuro import bulk) colisionan IDs. Usar `crypto.randomUUID()`.

### 2.7 🟠 Componente mal nombrado

`Context.jsx` no es un `Context`. Renombrar a `NotesContainer.jsx`. Si más adelante se quiere consumir el estado en componentes profundos, **entonces sí** introducir `NotesContext` real.

### 2.8 🟡 Falta funcionalidad básica esperable

- Editar una nota.
- Buscar / filtrar.
- Contador de notas.
- Confirmación al borrar (o undo durante 5 s).
- Orden por fecha (la nota más reciente primero).

### 2.9 🟡 Sin manejo de errores

`localStorage` puede fallar (modo privado de Safari, cuotas). Cuando se introduzca persistencia, envolver en try/catch y mostrar feedback al usuario.

---

## 3. Hallazgos – UI / UX

### 3.1 🟠 Accesibilidad

| Problema | Ubicación | Acción |
|---|---|---|
| Botón “X” sin texto accesible | `List.jsx:13-15` | Añadir `aria-label="Eliminar nota"` y `title` |
| `<textarea id="">` vacío | `Form.jsx:31` | Quitar el `id=""` o usar `htmlFor` real |
| Foco no visible en cards | `Components.css` | Añadir `focus-visible:ring` en botones |
| `lang="en"` con strings mezclados | `index.html:2` | Decidir un idioma y aplicarlo |
| Contraste “There are no notes yet” | `List.jsx:8` | Estilo explícito con buen contraste |

### 3.2 🟡 Clase Tailwind inexistente

`form-list` aplica `w-50` (`Components.css` no, pero `App.css:17` sí: `w-50` no existe en Tailwind por defecto: las claves son `w-48`, `w-52`, `w-1/2`...). Vale: probablemente Tailwind 4 lo expone como arbitrary value, pero **lo más legible** es `w-52` o `w-1/4`.

### 3.3 🟡 Layout

- `app-container` centra verticalmente todo el árbol → con muchas notas, el formulario queda fuera de la pantalla. Cambiar a `min-h-screen flex flex-col items-center pt-10` para anclar arriba.
- `form-list` no recorta texto largo; una descripción de 5 000 caracteres rompe la grilla. Añadir `max-h-40 overflow-auto` o `line-clamp-4`.
- `text-center` para descripción de notas se ve mal con texto largo. Mejor `text-left`.

### 3.4 🟡 Inconsistencia de estilos

Conviven `@apply` en CSS y utilidades inline en JSX (`List.jsx` usa `text-sky-800` directo, `Form.jsx` usa clases nominales como `form-input`). Elegir un enfoque: **recomendado** usar utilidades inline para componentes pequeños y reservar `@apply` solo para tokens reutilizables (botones, cards).

### 3.5 🟢 Detalles de marca

- Favicon sigue siendo `vite.svg`.
- `<title>` es "Notes-pad" mientras la marca es "Notespad". Unificar.
- README clonado de la plantilla Vite.

### 3.6 🟢 Mejoras de delight

- Animación al añadir/borrar (`transition` + `framer-motion` o keyframes simples).
- Modo oscuro (`dark:` de Tailwind).
- Skeleton vacío con ilustración cuando no hay notas.
- Atajos de teclado: `Ctrl+Enter` para enviar, `Esc` para limpiar.

---

## 4. Hallazgos – Calidad de código

| # | Severidad | Archivo | Problema |
|---|---|---|---|
| Q1 | 🟠 | `Context.jsx` | Imports no usados (`createContext` se importa pero no se invoca) |
| Q2 | 🟠 | `Form.jsx:12` | `console.log` |
| Q3 | 🟡 | `App.jsx:8` | Línea en blanco innecesaria |
| Q4 | 🟡 | Todo el árbol | Sin TypeScript ni PropTypes — los handlers no validan tipos |
| Q5 | 🟡 | Todo el árbol | Sin Prettier configurado, formato inconsistente |
| Q6 | 🟡 | `eslint.config.js` | Falta plugin `jsx-a11y` |
| Q7 | 🟡 | `package.json` | `private: true`, sin script `test`, `format`, `typecheck` |
| Q8 | 🟢 | `README.md` | Es la plantilla por defecto |

---

## 5. Testing — propuesta y archivos añadidos

Antes de esta review **no había ningún test**. Como parte de esta tarea se añade:

### 5.1 Unit tests con Vitest + Testing Library

Stack: `vitest` + `@testing-library/react` + `@testing-library/user-event` + `jsdom`.

Archivos creados:
- `vitest.config.js` — configura `jsdom` y `setupFiles`.
- `src/test/setup.js` — extensiones de `@testing-library/jest-dom`.
- `src/components/__tests__/Form.test.jsx` — render, validación, submit, limpieza de inputs.
- `src/components/__tests__/List.test.jsx` — estado vacío, render de notas, click de borrado.
- `src/components/__tests__/NotesContainer.test.jsx` — flujo añadir + borrar end-to-end de la lógica.

### 5.2 E2E tests con Playwright

Stack: `@playwright/test`.

Archivos creados:
- `playwright.config.js` — apunta a `vite preview` en `http://localhost:4173`.
- `e2e/notes.spec.js` — flujos: añadir nota, varias notas, borrar, persistencia tras recarga (skipped hasta implementar localStorage), validación de campos vacíos.

### 5.3 Scripts de package.json sugeridos

```jsonc
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

> Tras hacer `npm install` de las nuevas devDependencies, ejecutar `npx playwright install chromium` una vez.

---

## 6. Hoja de ruta — paso a paso por importancia

### 🔴 Bloque 1 – Crítico (hacer ya)

1. **Arreglar duplicación de `Form`/`List`**: renombrar `Context.jsx` → `NotesContainer.jsx`, eliminar imports muertos de `App.jsx`, hacer que `App` solo renderice `<NotesContainer />`.
2. **Cambiar `key` a `note.id`** en `List.jsx`.
3. **Persistencia con `localStorage`** (carga lazy + `useEffect` de guardado).
4. **`crypto.randomUUID()`** para el ID de cada nota.
5. **Eliminar `console.log`** de `Form.jsx`.
6. **Activar tests** (correr `npm install`, `npm test`, `npm run test:e2e`) y dejar la CI verde.

### 🟠 Bloque 2 – Alto

7. Validación con `trim()` + `maxLength` en título y descripción.
8. `aria-label` en el botón de borrar; quitar `id=""` vacío.
9. Plugin `eslint-plugin-jsx-a11y` y arreglar warnings.
10. Añadir Prettier + script `format`.
11. Unificar idioma (decidir entre español/inglés en UI).
12. Renombrar `<title>` a “Notespad”, actualizar favicon, reescribir `README.md`.

### 🟡 Bloque 3 – Medio

13. Edición de notas (modo edición con doble click o botón “Editar”).
14. Búsqueda/filtro (`useDeferredValue` sobre input controlado).
15. Contador y orden por fecha descendente.
16. Layout no centrado verticalmente; `line-clamp` para descripciones largas.
17. Reemplazar `w-50` por `w-52` (o token explícito).
18. Confirmación o undo al borrar (toast con timeout).

### 🟢 Bloque 4 – Bajo

19. Modo oscuro (`dark:` Tailwind + toggle persistido).
20. Animaciones de entrada/salida (Framer Motion o CSS).
21. Atajos de teclado (`Ctrl+Enter`, `Esc`).
22. PWA básica (manifest + service worker, ya que es un caso ideal).
23. Migración a TypeScript.

---

## 7. Cómo correr los nuevos tests

```bash
# 1. Instalar nuevas dependencias añadidas en package.json
npm install

# 2. Unit tests (modo watch)
npm test

# 3. Unit tests (una pasada)
npm run test:run

# 4. E2E (primero instalar el browser una sola vez)
npx playwright install chromium
npm run build
npm run test:e2e
```

---

## 8. Anexo – Métricas rápidas

- LOC fuente (sin tests): ~110.
- Componentes: 3 (`App`, `Context/NotesContainer`, `Form`, `List`).
- Cobertura actual: 0 %.
- Cobertura objetivo tras Bloque 1+2: ≥ 80 % en `components/`.
- Lighthouse estimado (móvil) hoy: A11y ~85, Best Practices ~92, Performance >95 (app es trivial). Tras accesibilidad: A11y 100.
