# semana4-js
#  Gestión de Productos — Semana 4 JavaScript

Aplicación web desarrollada como proyecto integrador del **Módulo 3 - Semana 4** del curso de JavaScript. Combina manipulación del DOM, persistencia con Local Storage y comunicación con una API REST simulada mediante Fetch API.

---

##  Tecnologías utilizadas

- HTML5 + CSS3
- JavaScript ES6+ (sin frameworks)
- [JSON Server](https://github.com/typicode/json-server) como API REST simulada

---

##  Estructura del proyecto

```
semana4-js-main/
├── index.html   # Estructura y estilos de la interfaz
├── app.js       # Toda la lógica de la aplicación
├── db.json      # Base de datos simulada para JSON Server
└── README.md    # Este archivo
```

---

## ⚙️ Cómo ejecutar el proyecto

### 1. Instalar JSON Server (solo la primera vez)

```bash
npm install -g json-server
```

### 2. Iniciar la API simulada

Desde la carpeta del proyecto:

```bash
npx json-server --watch db.json --port 3001
```

La API quedará disponible en: `http://localhost:3001/productos`

### 3. Abrir la aplicación

Abre `index.html` en tu navegador. Se recomienda usar la extensión **Live Server** en VS Code para evitar problemas de CORS.

---

## ✅ Tareas implementadas

### TASK 1 — Estructura del proyecto
- Archivos `index.html` y `app.js` correctamente enlazados.
- Formulario con campos: nombre, precio y descripción.
- Lista `<ul>` donde se renderizan los productos.
- Botón para sincronizar con la API.
- Código comentado por secciones con nomenclatura camelCase.

### TASK 2 — Captura e interacción con el usuario
- Captura de datos mediante inputs del DOM.
- Validación de campos: nombre requerido, precio mayor a 0 y numérico.
- Mensajes dinámicos de éxito, error e información en el DOM y en consola.

### TASK 3 — Manipulación dinámica del DOM
- Elementos `<li>` creados dinámicamente con `document.createElement()`.
- Inserción con `appendChild()`.
- Eliminación con `removeChild()` usando un `Map` para localizar el nodo directamente.
- Botones "Editar" y "Eliminar" en cada elemento de la lista.

### TASK 4 — Persistencia en Local Storage
- Array global `productos[]` sincronizado con `localStorage.setItem()`.
- Recuperación automática al cargar la página con `localStorage.getItem()`.
- Los datos persisten entre sesiones del navegador.

### TASK 5 — Integración con Fetch API
- **GET** — Obtiene todos los productos del servidor al sincronizar.
- **POST** — Envía un nuevo producto al servidor al agregarlo.
- **PUT** — Actualiza un producto existente en el servidor al editarlo.
- **DELETE** — Elimina un producto del servidor.
- Todas las operaciones usan `async/await` con `try/catch` para manejo de errores.

### TASK 6 — Validaciones y pruebas
- Función `ejecutarPruebas()` que corre automáticamente al iniciar la app.
- Evidencias en consola:
  - Estado del DOM antes y después de una operación.
  - Contenido del Local Storage.
  - Demostración del `Set` (sin duplicados) y del `Map` (nodos registrados).
  - Resultado de la conexión con la API.

---

##  Estructuras de datos utilizadas

| Estructura | Uso en el proyecto |
|---|---|
| `Array` | `productos[]` — almacena la lista de productos en memoria |
| `Object` | Cada producto `{ id, nombre, precio, descripcion }` |
| `Set` | `categoriasSet` — categorías únicas sin duplicados |
| `Map` | `nodosPorId` — asocia cada ID con su nodo `<li>` en el DOM |

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/productos` | Obtener todos los productos |
| POST | `/productos` | Crear un nuevo producto |
| PUT | `/productos/:id` | Actualizar un producto |
| DELETE | `/productos/:id` | Eliminar un producto |

---

## 🧪 Cómo ver las evidencias (TASK 6)

1. Abre las herramientas de desarrollador del navegador (`F12`).
2. Ve a la pestaña **Console**.
3. Recarga la página.
4. Verás el grupo `=== TASK 6: PRUEBAS Y EVIDENCIAS ===` con todos los logs.
5. En la pestaña **Application → Local Storage** puedes ver los datos guardados.

---

## 👤 Autor
HECTOR CARVAJAL

