const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado'));
const token = localStorage.getItem('tokenAutenticacion'); // Leemos el token

if (!usuarioLocal || !token) {
    window.location.href = 'login.html';
}

const parametrosURL = new URLSearchParams(window.location.search);
const idPerfilVisita = parametrosURL.get('id');

const idCargar = idPerfilVisita ? idPerfilVisita : usuarioLocal.id;
const esMiPerfil = (idCargar === usuarioLocal.id);

async function cargarDatosPerfil() {
    try {
        const resUser = await fetch(`${API_URL}/api/perfil/${idCargar}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuario = await resUser.json();

        document.getElementById('nombrePerfil').innerText = usuario.nombreUsuario;

        if (usuario.fotoPerfil) {
            document.getElementById('imgPerfil').src = usuario.fotoPerfil;
        }
        if (usuario.fotoPortada) {
            document.getElementById('imgPortada').src = usuario.fotoPortada;
        }

        const resPubs = await fetch(`${API_URL}/api/perfil/${idCargar}/publicaciones`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const publicaciones = await resPubs.json();

        const numeroAmigos = usuario.amigos ? usuario.amigos.length : 0;
        document.getElementById('estadisticasPerfil').innerText = `${numeroAmigos} amigos • ${publicaciones.length} publicaciones`;

        if (!esMiPerfil) {
            document.querySelectorAll('.btn-camara, .bi-camera-fill').forEach(icono => {
                const boton = icono.closest('button');
                if (boton) boton.style.display = 'none';
            });
            const botonesAccion = document.querySelectorAll('[data-bs-target="#modalEditarPerfil"], .bi-plus-circle');
            botonesAccion.forEach(icono => {
                const boton = icono.closest('button');
                if (boton) boton.style.display = 'none';
            });
        }

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

const inputFoto = document.getElementById('inputFoto');
if (inputFoto) {
    inputFoto.addEventListener('change', function (evento) {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.readAsDataURL(archivo);

        lector.onload = async function () {
            const fotoBase64 = lector.result;

            try {
                const respuesta = await fetch(`${API_URL}/api/perfil/${usuarioLocal.id}/foto`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fotoBase64 })
                });

                if (respuesta.status === 200) {
                    document.getElementById('imgPerfil').src = fotoBase64;
                    alert('¡Foto de perfil actualizada exitosamente!');
                    cargarDatosPerfil();
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

cargarDatosPerfil();

function cargarDatosEdicion() {
    const nombreActual = document.getElementById('nombrePerfil').innerText;
    document.getElementById('editNombre').value = nombreActual;
    document.getElementById('editPassword').value = '';
}

const formEditarPerfil = document.getElementById('formEditarPerfil');
if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoNombre = document.getElementById('editNombre').value.trim();
        const nuevoPassword = document.getElementById('editPassword').value.trim();

        const datosAActualizar = { nombreUsuario: nuevoNombre };
        if (nuevoPassword !== '') {
            datosAActualizar.password = nuevoPassword;
        }

        try {
            const respuesta = await fetch(`${API_URL}/api/perfil/${usuarioLocal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosAActualizar)
            });

            if (respuesta.status === 200) {
                const datos = await respuesta.json();
                usuarioLocal.nombreUsuario = datos.usuario.nombreUsuario;
                localStorage.setItem('usuarioLogueado', JSON.stringify(usuarioLocal));

                alert('¡Perfil actualizado con éxito!');
                window.location.reload();
            } else {
                alert('Hubo un error al actualizar el perfil.');
            }
        } catch (error) {
            console.error('Error al editar perfil:', error);
        }
    });
}

async function eliminarCuenta() {
    const confirmar = confirm('¿Estás COMPLETAMENTE seguro de eliminar tu cuenta? Esta acción borrará todas tus publicaciones y no se puede deshacer.');
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/api/perfil/${usuarioLocal.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (respuesta.status === 200) {
            alert('Tu cuenta ha sido eliminada para siempre.');
            localStorage.removeItem('usuarioLogueado');
            localStorage.removeItem('tokenAutenticacion');
            window.location.href = 'login.html';
        } else {
            alert('No se pudo eliminar la cuenta.');
        }
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
    }
}

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
                const respuesta = await fetch(`${API_URL}/api/perfil/${usuarioLocal.id}/portada`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ fotoBase64 })
                });

                if (respuesta.status === 200) {
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