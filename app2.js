const API = 'https://jsonplaceholder.typicode.com';
const formBuscar        = document.querySelector('#form-buscar');
const formCrear         = document.querySelector('#form-crear');
const inputUsuario      = document.querySelector('#input-usuario');
const inputTitulo       = document.querySelector('#input-titulo');
const inputCuerpo       = document.querySelector('#input-cuerpo');
const btnCrear          = document.querySelector('#btn-crear');
const estado            = document.querySelector('#estado');
const lista             = document.querySelector('#lista');

// Actividad 2: Nuevas referencias DOM y estado local
const selectLimite      = document.querySelector('#select-limite');
const inputFiltroTitulo = document.querySelector('#input-filtro-titulo');
let publicacionesGuardadas = []; // Almacena el resultado del GET original

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

    // Actividad 2: Contenedor donde se insertarán los comentarios
    const contenedorComentarios = document.createElement('div');
    contenedorComentarios.className = 'comentarios-container';
    contenedorComentarios.style.display = 'none'; // Oculto inicialmente

    art.append(h3, p, contenedorComentarios);

    // Actividad 2: Evento click para obtener y mostrar comentarios / toggle
    let cargandoComentarios = false;
    art.addEventListener('click', async () => {
        // Si ya están visibles, se ocultan/muestran
        if (contenedorComentarios.children.length > 0) {
            contenedorComentarios.style.display = 
                contenedorComentarios.style.display === 'none' ? 'block' : 'none';
            return;
        }

        if (cargandoComentarios) return;
        cargandoComentarios = true;

        contenedorComentarios.style.display = 'block';
        contenedorComentarios.innerHTML = '<p><em>Cargando comentarios...</em></p>';

        try {
            const { datos: comentarios } = await peticion(`${API}/posts/${post.id}/comments`);
            contenedorComentarios.replaceChildren();

            if (comentarios.length === 0) {
                contenedorComentarios.innerHTML = '<p><em>Sin comentarios.</em></p>';
                return;
            }

            const titulo = document.createElement('h4');
            titulo.textContent = `Comentarios (${comentarios.length}):`;
            
            const ul = document.createElement('ul');
            comentarios.forEach(c => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${c.email}:</strong> ${c.body}`;
                ul.appendChild(li);
            });

            contenedorComentarios.append(titulo, ul);
        } catch (error) {
            contenedorComentarios.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        } finally {
            cargandoComentarios = false;
        }
    });

    return art;
}

function mostrarEstado(texto, esError = false) {
    estado.textContent = texto;
    estado.className = esError ? 'error' : '';
}

// Actividad 2: Función para filtrar por título usando Array.prototype.filter()
function aplicarFiltroTitulo() {
    const textoFiltro = inputFiltroTitulo.value.toLowerCase().trim();
    
    const publicacionesFiltradas = publicacionesGuardadas.filter(post => 
        post.title.toLowerCase().includes(textoFiltro)
    );

    lista.replaceChildren(...publicacionesFiltradas.map(p => crearTarjeta(p)));
}

// Escuchar cambios de escritura en el input de filtro
inputFiltroTitulo.addEventListener('input', aplicarFiltroTitulo);

// 3. GET: listar las publicaciones de un usuario
formBuscar.addEventListener('submit', async (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
        userId: inputUsuario.value,
        _limit: selectLimite.value // Actividad 2: Usa el valor dinámico del <select>
    });
    mostrarEstado('Cargando...');
    try {
        const { status, datos } = await peticion(`${API}/posts?${params}`);
        publicacionesGuardadas = datos; // Guardar copias en memoria
        inputFiltroTitulo.value = '';  // Resetear el filtro visual
        
        lista.replaceChildren(...datos.map(p => crearTarjeta(p)));
        mostrarEstado(`GET ${status}: ${datos.length} publicaciones cargadas`);
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

// Actividad 1
const formActividad1 = document.querySelector('#form-actividad1');
const Ciudad1  = document.querySelector('#activ1-Ciudad');
const Nombre1  = document.querySelector('#activ1-Nombre');

formActividad1.addEventListener('submit', async (e) => {
    e.preventDefault();
	
    const params = new URLSearchParams({
        Nombre: Nombre1.value.trim(),
        Ciudad: Ciudad1.value.trim()
    });

    window.history.pushState({}, '', `?${params.toString()}`);

    const parametrosDeLaURL = new URLSearchParams(window.location.search);

    if (parametrosDeLaURL.has('Nombre') && parametrosDeLaURL.has('Ciudad')) {
        const nombreRegistrado = parametrosDeLaURL.get('Nombre');
        const ciudadRegistrada = parametrosDeLaURL.get('Ciudad');
		
        document.getElementById('ver-nombre').textContent = nombreRegistrado;
        document.getElementById('ver-ciudad').textContent = ciudadRegistrada;
    }
    
    formActividad1.reset();
});