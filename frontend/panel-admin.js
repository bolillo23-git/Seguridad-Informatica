const usuarioLocal = JSON.parse(localStorage.getItem('usuarioLogueado'));
const tablaUsuarios = document.getElementById('tablaUsuarios');

// 1. Protección de ruta: Si no hay usuario o no es admin, lo expulsamos
if (!usuarioLocal || usuarioLocal.rol !== 'admin') {
    alert('Acceso denegado. Área exclusiva para administradores.');
    window.location.href = 'muro.html';
} else {
    document.getElementById('nombreAdminDisplay').innerText = `Admin: ${usuarioLocal.nombreUsuario}`;
    cargarUsuarios(); // Se llama al inicio para llenar la tabla
}

function cerrarSesion() {
    localStorage.removeItem('usuarioLogueado');
    window.location.href = 'login.html';
}

// 2. Pedir todos los usuarios al backend al cargar la página
async function cargarUsuarios() {
    try {
      
        const respuesta = await fetch(`http://localhost:3000/api/admin/roles/buscar`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'usuario-id': usuarioLocal.id 
            }
        });
        const usuarios = await respuesta.json();

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

// 3. Enviar el cambio de rol al backend
async function cambiarRol(idUsuario) {
    const nuevoRol = document.getElementById(`select-rol-${idUsuario}`).value;

    try {
        const respuesta = await fetch(`http://localhost:3000/api/admin/roles/${idUsuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nuevoRol })
        });

        if (respuesta.status === 200) {
            alert('Rol actualizado correctamente');
            cargarUsuarios(); // Recargamos la tabla para ver los cambios
        } else {
            const datos = await respuesta.json();
            alert(datos.mensaje);
        }
    } catch (error) {
        console.error('Error al cambiar rol:', error);
    }
} // CORRECCIÓN 2: El buscador ya NO está atrapado dentro de esta función

// 4. Lógica del buscador con el botón
const buscadorEmail = document.getElementById('buscadorEmail');
const btnBuscar = document.getElementById('btnBuscar');

if (btnBuscar && buscadorEmail) {
    btnBuscar.addEventListener('click', async () => {
        const textoBuscado = buscadorEmail.value.trim();

        try {
            // CORRECCIÓN 3: Agregamos los headers al buscador también
            const respuesta = await fetch(`http://localhost:3000/api/admin/roles/buscar?correo=${textoBuscado}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'usuario-id': usuarioLocal.id // Pase VIP
                }
            });
            const usuarios = await respuesta.json();

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