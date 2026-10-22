const API = 'https://jsonplaceholder.typicode.com';
const formBuscar   = document.querySelector('#form-buscar');
const formCrear    = document.querySelector('#form-crear');
const inputUsuario = document.querySelector('#input-usuario');
const inputTitulo  = document.querySelector('#input-titulo');
const inputCuerpo  = document.querySelector('#input-cuerpo');
const btnCrear     = document.querySelector('#btn-crear');
const estado       = document.querySelector('#estado');
const lista        = document.querySelector('#lista');

// 1. Petición genérica: sirve para GET y para POST
async function peticion(url, opciones = {}) {
    const res = await fetch(url, opciones);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return { status: res.status, datos: await res.json() };
}

// 2. Funciones de interfaz
function crearTarjeta(post, esNuevo = false) {
    const art = document.createElement('article');
    art.className = esNuevo ? 'post nuevo' : 'post';
    const h3 = document.createElement('h3');
    h3.textContent = `#${post.id} ${post.title}`;
    const p = document.createElement('p');
    p.textContent = post.body;
    art.append(h3, p);
    return art;
}

function mostrarEstado(texto, esError = false) {
    estado.textContent = texto;
    estado.className = esError ? 'error' : '';
}

// 3. GET: listar las publicaciones de un usuario
formBuscar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
        userId: inputUsuario.value,
        _limit: 5
    });
    mostrarEstado('Cargando...');
    try {
        const { status, datos } = await peticion(`${API}/posts?${params}`);
        lista.replaceChildren(...datos.map(p => crearTarjeta(p)));
        mostrarEstado(`GET ${status}: ${datos.length} publicaciones`);
    } catch (error) {
        mostrarEstado(error.message, true);
    }
});

// 4. POST: crear una publicación
formCrear.addEventListener('submit', async (e) => {
    e.preventDefault();
const nuevo = {
        title: inputTitulo.value.trim(),
        body: inputCuerpo.value.trim(),
        userId: Number(inputUsuario.value)
    };
    btnCrear.disabled = true;               // evita envíos duplicados
    mostrarEstado('Enviando...');
    try {
        const { status, datos } = await peticion(`${API}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });
        lista.prepend(crearTarjeta(datos, true));
        mostrarEstado(`POST ${status}: creada con id ${datos.id}`);
        formCrear.reset();
    } catch (error) {
        mostrarEstado(error.message, true);
    } finally {
        btnCrear.disabled = false;
    }
});

// 5. Carga inicial
formBuscar.requestSubmit();
