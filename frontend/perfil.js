const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado'));

if (!usuarioLocal) {
    window.location.href = 'login.html';
}

// Atrapamos el ID de la URL si es que existe
const parametrosURL = new URLSearchParams(window.location.search);
const idPerfilVisita = parametrosURL.get('id');

// Determinamos de quién es el perfil que vamos a cargar
const idCargar = idPerfilVisita ? idPerfilVisita : usuarioLocal.id;
const esMiPerfil = (idCargar === usuarioLocal.id);

async function cargarDatosPerfil() {
    try {
        // 1. Cargar Info del Usuario (usando el ID determinado)
        const resUser = await fetch(`http://localhost:3000/api/perfil/${idCargar}`);
        const usuario = await resUser.json();

        document.getElementById('nombrePerfil').innerText = usuario.nombreUsuario;

        if (usuario.fotoPerfil) {
            document.getElementById('imgPerfil').src = usuario.fotoPerfil;
        }
        if (usuario.fotoPortada) {
            document.getElementById('imgPortada').src = usuario.fotoPortada;
        }

        // 2. Cargar sus publicaciones
        const resPubs = await fetch(`http://localhost:3000/api/perfil/${idCargar}/publicaciones`);
        const publicaciones = await resPubs.json();

        const numeroAmigos = usuario.amigos ? usuario.amigos.length : 0;
        document.getElementById('estadisticasPerfil').innerText = `${numeroAmigos} amigos • ${publicaciones.length} publicaciones`;

        // 3. Ocultar botones de edición si estamos viendo el perfil de OTRA persona
        if (!esMiPerfil) {
            // Ocultar botones de cámara
            document.querySelectorAll('.btn-camara, .bi-camera-fill').forEach(icono => {
                const boton = icono.closest('button');
                if (boton) boton.style.display = 'none';
            });
            // Ocultar botones de acción (Editar perfil, Agregar historia)
            const botonesAccion = document.querySelectorAll('[data-bs-target="#modalEditarPerfil"], .bi-plus-circle');
            botonesAccion.forEach(icono => {
                const boton = icono.closest('button');
                if (boton) boton.style.display = 'none';
            });
        }

        // 4. Dibujar publicaciones
        const contenedor = document.getElementById('contenedorMisPublicaciones');
        contenedor.innerHTML = '';

        if (publicaciones.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-muted mt-4">No hay publicaciones.</p>';
        } else {
            publicaciones.forEach(pub => {
                const fecha = new Date(pub.fechaCreacion).toLocaleString('es-MX');
                contenedor.innerHTML += `
                    <div class="card p-3 mb-3 shadow-sm border-0">
                        <div class="d-flex align-items-center mb-2">
                            <img src="${usuario.fotoPerfil || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="rounded-circle me-2 object-fit-cover shadow-sm" width="40" height="40">
                            <div>
                                <h6 class="mb-0 fw-bold">${usuario.nombreUsuario}</h6>
                                <small class="text-muted">${fecha}</small>
                            </div>
                        </div>
                        <p class="mb-1">${pub.contenido}</p>
                    </div>
                `;
            });
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}

// 4. Lógica para cambiar la foto al elegir un archivo desde la PC
const inputFoto = document.getElementById('inputFoto');

if (inputFoto) {
    inputFoto.addEventListener('change', function (evento) {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.readAsDataURL(archivo); // Convierte la imagen a código Base64

        lector.onload = async function () {
            const fotoBase64 = lector.result;

            try {
                const respuesta = await fetch(`http://localhost:3000/api/perfil/${usuarioLocal.id}/foto`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fotoBase64 })
                });

                if (respuesta.status === 200) {
                    // Actualizamos la foto en pantalla y avisamos que todo salió bien
                    document.getElementById('imgPerfil').src = fotoBase64;
                    alert('¡Foto de perfil actualizada exitosamente!');
                    cargarDatosPerfil(); // Recargamos para que las fotos de las publicaciones también se actualicen
                } else {
                    alert('Hubo un problema al subir la foto.');
                }
            } catch (error) {
                console.error('Error al subir foto:', error);
                alert('No se pudo conectar con el servidor.');
            }
        };
    });
}

// Ejecutamos la carga inicial al entrar a la página
cargarDatosPerfil();

// --- LÓGICA PARA EDITAR Y ELIMINAR PERFIL ---

// 1. Poner el nombre actual en la caja de texto al abrir la ventana
function cargarDatosEdicion() {
    const nombreActual = document.getElementById('nombrePerfil').innerText;
    document.getElementById('editNombre').value = nombreActual;
    document.getElementById('editPassword').value = ''; // La contraseña siempre va vacía por seguridad
}

// 2. Enviar los cambios al backend
const formEditarPerfil = document.getElementById('formEditarPerfil');

if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoNombre = document.getElementById('editNombre').value.trim();
        const nuevoPassword = document.getElementById('editPassword').value.trim();

        // Armamos el paquete de datos (solo incluimos la contraseña si escribió algo)
        const datosAActualizar = { nombreUsuario: nuevoNombre };
        if (nuevoPassword !== '') {
            datosAActualizar.password = nuevoPassword;
        }

        try {
            const respuesta = await fetch(`http://localhost:3000/api/perfil/${usuarioLocal.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosAActualizar)
            });

            if (respuesta.status === 200) {
                const datos = await respuesta.json();

                // Actualizamos la memoria del navegador con el nuevo nombre
                usuarioLocal.nombreUsuario = datos.usuario.nombreUsuario;
                localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioLocal));

                alert('¡Perfil actualizado con éxito!');

                // Cerramos la ventana y recargamos la página para ver los cambios
                window.location.reload();
            } else {
                alert('Hubo un error al actualizar el perfil.');
            }
        } catch (error) {
            console.error('Error al editar perfil:', error);
        }
    });
}

// 3. Eliminar la cuenta
async function eliminarCuenta() {
    const confirmar = confirm('¿Estás COMPLETAMENTE seguro de eliminar tu cuenta? Esta acción borrará todas tus publicaciones y no se puede deshacer.');

    if (!confirmar) return;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/perfil/${usuarioLocal.id}`, {
            method: 'DELETE'
        });

        if (respuesta.status === 200) {
            alert('Tu cuenta ha sido eliminada para siempre.');
            localStorage.removeItem('usuarioLogueado');
            window.location.href = 'login.html'; // Lo mandamos pa' fuera
        } else {
            alert('No se pudo eliminar la cuenta.');
        }
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
    }
}

// 5. Lógica para cambiar la foto de portada
const inputPortada = document.getElementById('inputPortada');

if (inputPortada) {
    inputPortada.addEventListener('change', function (evento) {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.readAsDataURL(archivo);

        lector.onload = async function () {
            const fotoBase64 = lector.result;

            try {
                const respuesta = await fetch(`http://localhost:3000/api/perfil/${usuarioLocal.id}/portada`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fotoBase64 })
                });

                if (respuesta.status === 200) {
                    // Actualizamos la portada en pantalla
                    document.getElementById('imgPortada').src = fotoBase64;
                } else {
                    alert('Hubo un problema al subir la portada.');
                }
            } catch (error) {
                console.error('Error al subir portada:', error);
                alert('No se pudo conectar con el servidor.');
            }
        };
    });
}