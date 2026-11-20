// Generamos o recuperamos el ID único de la máquina
let machineId = localStorage.getItem('machineId');
if (!machineId) {
    machineId = crypto.randomUUID();
    localStorage.setItem('machineId', machineId);
}

const formularioRegistro = document.getElementById('formularioRegistro');

formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturamos los valores que escribió el usuario
    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch(`${API_URL}/api/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Machine-Id': machineId // Enviamos el ID de la máquina al backend
            },
            body: JSON.stringify({ email, password, nombreUsuario })
        });

        const datos = await respuesta.json();

        if (respuesta.status === 201) {
            alert('¡Usuario registrado con éxito!');
            window.location.href = 'login.html'; // Lo mandamos directo al login
        } else {
            // Si hay error (como correo duplicado), mostramos el mensaje del backend
            alert(datos.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
});