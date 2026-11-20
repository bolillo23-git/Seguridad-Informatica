// Generamos o recuperamos el ID único de la máquina
let machineId = localStorage.getItem('machineId');
if (!machineId) {
    machineId = crypto.randomUUID();
    localStorage.setItem('machineId', machineId);
}

const formularioLogin = document.getElementById('formularioLogin');

formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Machine-Id': machineId // Enviamos el ID de la máquina al backend
            },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (respuesta.status === 200) {
            localStorage.setItem('usuarioLogueado', JSON.stringify(datos.usuario));
            localStorage.setItem('tokenAutenticacion', datos.token); // Guardamos el token

            if (datos.usuario.rol === 'admin') {
                window.location.href = 'panel-admin.html';
            } else if (datos.usuario.rol === 'moderador') {
                window.location.href = 'panel-moderador.html';
            } else {
                window.location.href = 'muro.html';
            }
        } else {
            alert(datos.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
});