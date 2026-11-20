const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado'));
const token = localStorage.getItem('tokenAutenticacion'); // Leemos el token
const tablaUsuarios = document.getElementById('tablaUsuarios');

if (!usuarioLocal || !token || usuarioLocal.rol !== 'admin') {
    alert('Acceso denegado. Área exclusiva para administradores.');
    window.location.href = 'muro.html';
} else {
    document.getElementById('nombreAdminDisplay').innerText = `Admin: ${usuarioLocal.nombreUsuario}`;
    cargarUsuarios();
}

function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('tokenAutenticacion');
    window.location.href = 'login.html';
}

async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${API_URL}/api/admin/roles/buscar`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Reemplazamos header vulnerable
            }
        });
        const usuarios = await respuesta.json();

        if (!respuesta.ok) {
            console.error("Error del servidor:", usuarios.mensaje);
            return;
        }

        tablaUsuarios.innerHTML = '';

        usuarios.forEach(user => {
            const disabled = user._id === usuarioLocal.id ? 'disabled' : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold">${user.nombreUsuario}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-secondary">${user.rol.toUpperCase()}</span></td>
                <td>
                    <select class="form-select form-select-sm" id="select-rol-${user._id}" ${disabled}>
                        <option value="usuario" ${user.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                        <option value="moderador" ${user.rol === 'moderador' ? 'selected' : ''}>Moderador</option>
                        <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="cambiarRol('${user._id}')" ${disabled}>
                        Actualizar
                    </button>
                </td>
            `;
            tablaUsuarios.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

async function cambiarRol(idUsuario) {
    const nuevoRol = document.getElementById(`select-rol-${idUsuario}`).value;

    try {
        const respuesta = await fetch(`${API_URL}/api/admin/roles/${idUsuario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nuevoRol })
        });

        if (respuesta.status === 200) {
            alert('Rol actualizado correctamente');
            cargarUsuarios();
        } else {
            const datos = await respuesta.json();
            alert(datos.mensaje);
        }
    } catch (error) {
        console.error('Error al cambiar rol:', error);
    }
}

const buscadorEmail = document.getElementById('buscadorEmail');
const btnBuscar = document.getElementById('btnBuscar');

if (btnBuscar && buscadorEmail) {
    btnBuscar.addEventListener('click', async () => {
        const textoBuscado = buscadorEmail.value.trim();

        try {
            const respuesta = await fetch(`${API_URL}/api/admin/roles/buscar?correo=${textoBuscado}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const usuarios = await respuesta.json();

            if (!respuesta.ok) {
                console.error("Error del servidor:", usuarios.mensaje);
                return;
            }

            tablaUsuarios.innerHTML = '';

            usuarios.forEach(user => {
                const disabled = user._id === usuarioLocal.id ? 'disabled' : '';
                const tr = document.createElement('tr');

                tr.innerHTML = `
                  <td class="fw-bold">${user.nombreUsuario}</td>
                  <td>${user.email}</td>
                  <td><span class="badge bg-secondary">${user.rol.toUpperCase()}</span></td>
                  <td>
                    <select class="form-select form-select-sm" id="select-rol-${user._id}" ${disabled}>
                      <option value="usuario" ${user.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                      <option value="moderador" ${user.rol === 'moderador' ? 'selected' : ''}>Moderador</option>
                      <option value="admin" ${user.rol === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="cambiarRol('${user._id}')" ${disabled}>
                      Actualizar
                    </button>
                  </td>
                `;
                tablaUsuarios.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al realizar la búsqueda:', error);
        }
    });
}