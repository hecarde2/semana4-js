
// 1. VARIABLES GLOBALES Y CONFIGURACIÓN

/**
 * URL base de la API simulada (JSON Server).
 "npx json-server --watch db.json --port 3001" en la terminal.
 */
const API_URL = 'http://localhost:3001/productos';

let productos = [];

/** Clave utilizada para guardar datos en Local Storage */
const STORAGE_KEY = 'productos_app';


const categoriasSet = new Set(['Electrónica', 'Accesorios', 'Periféricos', 'Software']);
const nodosPorId    = new Map();  // Map<id, HTMLElement>




const formulario      = document.getElementById('formulario');
const inputNombre     = document.getElementById('nombre');
const inputPrecio     = document.getElementById('precio');
const inputDescripcion = document.getElementById('descripcion');


const btnAgregar    = document.getElementById('btnAgregar');
const btnSincronizar = document.getElementById('btnSincronizar');

const listaProductos    = document.getElementById('listaProductos');
const mensajeDiv        = document.getElementById('mensaje');
const totalProductosSpan = document.getElementById('totalProductos');
const valorTotalSpan    = document.getElementById('valorTotal');


// 3. FUNCIONES DE VALIDACIÓN

/**
 * TASK 2 - Valida los campos del formulario antes de procesar.
 * @returns {{ valido: boolean, errores: string[] }}
 */
function validarFormulario() {
    const errores = [];

    // El nombre no puede estar vacío
    if (!inputNombre.value.trim()) {
        errores.push('El nombre del producto es requerido');
    }

   
    if (!inputPrecio.value || parseFloat(inputPrecio.value) <= 0) {
        errores.push('El precio debe ser mayor a 0');
    }

    // El precio debe ser numérico
    if (isNaN(parseFloat(inputPrecio.value))) {
        errores.push('El precio debe ser un número válido');
    }

    return { valido: errores.length === 0, errores };
}

/**
 * Comprueba si ya existe un producto con el mismo nombre (case-insensitive).
 */
function productoExiste(nombre) {
    return productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
}

// ==========================================
// 4. FUNCIONES DE MENSAJES
// ==========================================

/**
Muestra un mensaje de retroalimentación en el DOM y en consola.

 */
function mostrarMensaje(texto, tipo = 'info', duracion = 3000) {
    console.log(`[${tipo.toUpperCase()}] ${texto}`);

    mensajeDiv.classList.remove('success', 'error', 'info');
    mensajeDiv.classList.add(tipo);
    mensajeDiv.textContent = texto;
    mensajeDiv.style.display = 'block';

    if (duracion > 0) {
        setTimeout(() => { mensajeDiv.style.display = 'none'; }, duracion);
    }
}

// ==========================================
// 5. FUNCIONES DE LOCAL STORAGE
// ==========================================

/**
 * TASK 4 - Persiste el array `productos` en Local Storage.
 */
function guardarEnLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
        console.log('✓ Datos guardados en Local Storage');
        // TASK 6 - Evidencia del contenido guardado
        console.log('[Local Storage] Contenido actual:', localStorage.getItem(STORAGE_KEY));
    } catch (error) {
        console.error('Error al guardar en Local Storage:', error);
        mostrarMensaje('Error al guardar los datos', 'error');
    }
}

/**
 * TASK 4 - Carga los productos desde Local Storage al iniciar la app.
 * @returns {boolean} true si se encontraron datos previos
 */
function cargarDelLocalStorage() {
    try {
        const datosGuardados = localStorage.getItem(STORAGE_KEY);
        if (datosGuardados) {
            productos = JSON.parse(datosGuardados);
            console.log('✓ Datos recuperados de Local Storage:', productos);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al leer Local Storage:', error);
        productos = [];
        return false;
    }
}


// FUNCIONES DE MANIPULACIÓN DEL DOM


/**
 *  Crea un elemento <li> para un producto y lo añade con appendChild().
 * Registra el nodo en el Map `nodosPorId` para poder eliminarlo con removeChild().
 
 */
function crearNodoProducto(producto, index) {
    // Crear elemento <li> dinámicamente
    const li = document.createElement('li');

    // Construir estructura interna con createElement
    const divInfo = document.createElement('div');
    divInfo.className = 'product-info';

    const divNombre = document.createElement('div');
    divNombre.className = 'product-name';
    divNombre.textContent = producto.nombre;

    const divPrecio = document.createElement('div');
    divPrecio.className = 'product-price';
    divPrecio.textContent = `Precio: $${parseFloat(producto.precio).toFixed(2)}`;

    divInfo.appendChild(divNombre);
    divInfo.appendChild(divPrecio);

    if (producto.descripcion) {
        const divDesc = document.createElement('div');
        divDesc.className = 'product-description';
        divDesc.textContent = `📝 ${producto.descripcion}`;
        divInfo.appendChild(divDesc);
    }

    // Botones de acción
    const divAcciones = document.createElement('div');
    divAcciones.className = 'actions';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'edit-btn';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarProducto(index));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'delete-btn';
    btnEliminar.textContent = 'Eliminar';
    // TASK 3 - El listener llama a la función que usa removeChild()
    btnEliminar.addEventListener('click', () => eliminarProductoDom(producto.id, index));

    divAcciones.appendChild(btnEditar);
    divAcciones.appendChild(btnEliminar);

    li.appendChild(divInfo);
    li.appendChild(divAcciones);

    // Insertar en la lista usando appendChild()
    listaProductos.appendChild(li);

    // Registrar nodo en el Map para uso posterior con removeChild()
    nodosPorId.set(producto.id, li);
}

/**
 * TASK 3 - Renderiza todos los productos del array en el DOM.
 * Limpia la lista antes de volver a pintar.
 */
function renderizarProductos() {
    // Vaciar el Map de nodos antes de re-renderizar
    nodosPorId.clear();
    listaProductos.innerHTML = '';

    if (productos.length === 0) {
        const liVacio = document.createElement('li');
        liVacio.className = 'empty-message';
        liVacio.textContent = 'No hay productos registrados';
        listaProductos.appendChild(liVacio);
        actualizarEstadisticas();
        return;
    }

    // Crear y añadir cada nodo con appendChild()
    productos.forEach((producto, index) => crearNodoProducto(producto, index));
    actualizarEstadisticas();

    // TASK 6 - Evidencia: mostrar estado del DOM en consola
    console.log('[DOM] Productos renderizados:', listaProductos.children.length);
}

/**
 * Actualiza los contadores de estadísticas en la cabecera.
 */
function actualizarEstadisticas() {
    totalProductosSpan.textContent = productos.length;
    const valorTotal = productos.reduce((acc, p) => acc + parseFloat(p.precio), 0);
    valorTotalSpan.textContent = valorTotal.toFixed(2);
}

// ==========================================
// 7. FUNCIONES CRUD LOCALES
// ==========================================

/**
 * TASK 3 & 4 - Agrega un producto al array, al DOM y al Local Storage.
 * @param {Object} nuevoProducto
 * @returns {boolean}
 */
function agregarProducto(nuevoProducto) {
    if (productoExiste(nuevoProducto.nombre)) {
        mostrarMensaje('Este producto ya existe', 'error');
        return false;
    }

    nuevoProducto.id = Date.now(); // ID único basado en timestamp
    productos.push(nuevoProducto);
    guardarEnLocalStorage();
    renderizarProductos();

    console.log('[CRUD Local] Producto agregado:', nuevoProducto);
    mostrarMensaje(`✓ Producto "${nuevoProducto.nombre}" agregado`, 'success');
    return true;
}

/**
 * TASK 3 - Elimina un producto del DOM usando removeChild(),
 *          del array con splice() y del Local Storage.
 *
 * @param {number|string} id    - ID del producto (clave del Map)
 * @param {number}        index - Índice en el array `productos`
 */
function eliminarProductoDom(id, index) {
    const nodo = nodosPorId.get(id);

    if (nodo) {
        // TASK 3 - Eliminación explícita con removeChild()
        listaProductos.removeChild(nodo);
        nodosPorId.delete(id);
        console.log(`[DOM] Nodo eliminado con removeChild() para ID: ${id}`);
    }

    const productoEliminado = productos[index];
    productos.splice(index, 1);
    guardarEnLocalStorage();

    // Re-renderizar para actualizar índices de los botones restantes
    renderizarProductos();
    mostrarMensaje(`Producto "${productoEliminado.nombre}" eliminado`, 'success');
    console.log('[CRUD Local] Producto eliminado:', productoEliminado);
}

/**
 * TASK 3 - Carga los datos del producto en el formulario para editar.
 * @param {number} index
 */
function editarProducto(index) {
    if (index < 0 || index >= productos.length) {
        mostrarMensaje('Producto no encontrado', 'error');
        return;
    }

    const producto = productos[index];
    inputNombre.value      = producto.nombre;
    inputPrecio.value      = producto.precio;
    inputDescripcion.value = producto.descripcion || '';

    btnAgregar.textContent        = 'Actualizar Producto';
    btnAgregar.dataset.editIndex  = index;

    formulario.scrollIntoView({ behavior: 'smooth' });
    console.log('[Edición] Modo edición activado para:', producto);
}

/** Cancela la edición y restaura el formulario */
function cancelarEdicion() {
    formulario.reset();
    btnAgregar.textContent = 'Agregar Producto';
    delete btnAgregar.dataset.editIndex;
}

// ==========================================
// 8. FUNCIONES CRUD CON API (FETCH)
// ==========================================

/**
 * TASK 5 - GET: Obtiene todos los productos del servidor.
 */
async function obtenerProductosAPI() {
    try {
        btnSincronizar.disabled    = true;
        btnSincronizar.textContent = 'Sincronizando...';
        mostrarMensaje('Obteniendo datos del servidor...', 'info', 0);

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();
        console.log('[API GET] Productos recibidos:', datos);

        productos = datos;
        guardarEnLocalStorage();
        renderizarProductos();
        mostrarMensaje(`✓ ${datos.length} producto(s) sincronizados desde el servidor`, 'success');

    } catch (error) {
        console.error('[API GET] Error:', error.message);
        mostrarMensaje(`No se pudo conectar con el servidor: ${error.message}`, 'error');
    } finally {
        btnSincronizar.disabled    = false;
        btnSincronizar.textContent = '🔄 Sincronizar con API';
    }
}

/**
 * TASK 5 - POST: Envía un nuevo producto al servidor.
 * @param {Object} producto
 * @returns {Object|null} Producto guardado con ID asignado por la API
 */
async function agregarProductoAPI(producto) {
    try {
        mostrarMensaje('Guardando en el servidor...', 'info', 0);

        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const productoGuardado = await respuesta.json();
        console.log('[API POST] Producto guardado:', productoGuardado);
        mostrarMensaje('✓ Producto guardado en el servidor', 'success');
        return productoGuardado;

    } catch (error) {
        console.error('[API POST] Error:', error.message);
        mostrarMensaje(`Error al guardar en servidor: ${error.message}`, 'error');
        return null;
    }
}

/**
 * TASK 5 - PUT: Actualiza un producto existente en el servidor.
 * @param {number} id
 * @param {Object} producto
 * @returns {Object|null}
 */
async function actualizarProductoAPI(id, producto) {
    try {
        mostrarMensaje('Actualizando en el servidor...', 'info', 0);

        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const actualizado = await respuesta.json();
        console.log('[API PUT] Producto actualizado:', actualizado);
        mostrarMensaje('✓ Producto actualizado en el servidor', 'success');
        return actualizado;

    } catch (error) {
        console.error('[API PUT] Error:', error.message);
        mostrarMensaje(`Error al actualizar: ${error.message}`, 'error');
        return null;
    }
}

/**
 * TASK 5 - DELETE: Elimina un producto del servidor.
 * @param {number} id
 * @returns {boolean}
 */
async function eliminarProductoAPI(id) {
    try {
        mostrarMensaje('Eliminando del servidor...', 'info', 0);

        const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        console.log(`[API DELETE] Producto ID ${id} eliminado del servidor`);
        mostrarMensaje('✓ Producto eliminado del servidor', 'success');
        return true;

    } catch (error) {
        console.error('[API DELETE] Error:', error.message);
        mostrarMensaje(`Error al eliminar: ${error.message}`, 'error');
        return false;
    }
}


//  EVENT LISTENERS


/**
 * TASK 2 & 5 - Maneja el envío del formulario.
 * Distingue entre modo "agregar" y modo "editar".
 */
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('--- FORMULARIO ENVIADO ---');

    // Validar entradas del usuario (TASK 2)
    const { valido, errores } = validarFormulario();
    if (!valido) {
        mostrarMensaje(errores.join(', '), 'error');
        return;
    }

    const nuevoProducto = {
        nombre:      inputNombre.value.trim(),
        precio:      parseFloat(inputPrecio.value),
        descripcion: inputDescripcion.value.trim()
    };

    const editIndex = btnAgregar.dataset.editIndex;

    if (editIndex !== undefined) {
        // --- MODO EDICIÓN ---
        const productoAntiguo = productos[editIndex];
        productos[editIndex]  = { ...productoAntiguo, ...nuevoProducto };

        guardarEnLocalStorage();
        renderizarProductos();

        console.log('[Edición] Producto actualizado localmente:', productos[editIndex]);
        mostrarMensaje('✓ Producto actualizado', 'success');

        // Sincronizar con API si el producto tenía ID del servidor
        if (productoAntiguo.id) {
            await actualizarProductoAPI(productoAntiguo.id, productos[editIndex]);
        }

        cancelarEdicion();

    } else {
        // --- MODO AGREGAR ---
        if (agregarProducto(nuevoProducto)) {
            // Intentar guardar también en la API (TASK 5)
            const productoGuardado = await agregarProductoAPI(nuevoProducto);

            // Actualizar el ID local con el asignado por la API
            if (productoGuardado?.id) {
                productos[productos.length - 1].id = productoGuardado.id;
                guardarEnLocalStorage();
            }

            formulario.reset();
        }
    }
});

/**
 * TASK 5 - Botón de sincronización: dispara un GET a la API.
 */
btnSincronizar.addEventListener('click', async () => {
    console.log('--- SINCRONIZANDO CON API ---');
    await obtenerProductosAPI();
});


// FUNCIÓN DE PRUEBAS Y EVIDENCIAS


/**
 * TASK 6 - Ejecuta un ciclo de pruebas automático en consola para verificar
 * que todas las funcionalidades trabajan en conjunto:
 *  - DOM (antes y después de una operación)
 *  - Local Storage (contenido actual)
 *  - Estructuras Set y Map
 *  - API (se intenta conexión y se reporta resultado)
 */
async function ejecutarPruebas() {
    console.group('=== TASK 6: PRUEBAS Y EVIDENCIAS ===');

    // --- DOM antes ---
    console.log('[Evidencia DOM - ANTES] Productos en lista:', listaProductos.children.length);
    console.log('[Evidencia Array] productos[]:', JSON.parse(JSON.stringify(productos)));

    // --- Local Storage ---
    const datosLS = localStorage.getItem(STORAGE_KEY);
    console.log('[Evidencia Local Storage]', datosLS ? JSON.parse(datosLS) : '(vacío)');

    // --- Set ---
    console.log('[Evidencia Set] Categorías disponibles:', [...categoriasSet]);
    categoriasSet.add('Gaming');
    console.log('[Evidencia Set] Tras agregar "Gaming":', [...categoriasSet]);
    categoriasSet.add('Gaming'); // duplicado → Set lo ignora
    console.log('[Evidencia Set] Tamaño tras agregar "Gaming" de nuevo (sin duplicado):', categoriasSet.size);

    // --- Map ---
    console.log('[Evidencia Map] Nodos registrados (IDs):', [...nodosPorId.keys()]);

    // --- Prueba DOM (agregar y eliminar un producto temporal) ---
    const productoTest = { id: 99999, nombre: 'Producto Test', precio: 1, descripcion: 'Prueba automática' };
    productos.push(productoTest);
    renderizarProductos();
    console.log('[Evidencia DOM - DESPUÉS de agregar test] Productos en lista:', listaProductos.children.length);

    // Eliminar con removeChild()
    const nodoTest = nodosPorId.get(99999);
    if (nodoTest) {
        listaProductos.removeChild(nodoTest);
        nodosPorId.delete(99999);
        console.log('[Evidencia removeChild()] Nodo de prueba eliminado del DOM');
    }
    productos.pop(); // quitar del array
    renderizarProductos();
    console.log('[Evidencia DOM - DESPUÉS de eliminar test] Productos en lista:', listaProductos.children.length);

    // --- API ---
    try {
        const res = await fetch(API_URL);
        if (res.ok) {
            const data = await res.json();
            console.log('[Evidencia API GET] Respuesta del servidor:', data);
        } else {
            console.warn('[Evidencia API] El servidor respondió con status:', res.status);
        }
    } catch {
        console.warn('[Evidencia API] Sin conexión al servidor (normal si JSON Server no está activo)');
    }

    console.groupEnd();
}

// ==========================================
// 11. INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================

/**
 * TASK 1 & 4 - Punto de entrada: carga Local Storage, renderiza el DOM
 * e intenta sincronizar con la API.
 */
function inicializarApp() {
    console.log('=== INICIALIZANDO APLICACIÓN ===');

    // Cargar datos persistidos (TASK 4)
    const haydatos = cargarDelLocalStorage();
    console.log(haydatos ? 'Datos restaurados del Local Storage' : 'Local Storage vacío, partiendo desde cero');

    // Renderizar lista inicial (TASK 3)
    renderizarProductos();

    // Intentar sincronizar con la API (TASK 5)
    obtenerProductosAPI().catch(() =>
        console.warn('API no disponible; se usan datos del Local Storage')
    );

    // TASK 6 - Ejecutar pruebas automáticas
    ejecutarPruebas();

    console.log('=== APLICACIÓN LISTA ===');
}

// Esperar a que el DOM esté listo antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}
