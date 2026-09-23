const formularioRegistro = document.getElementById('formularioRegistro');

formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Capturamos los valores que escribió el usuario
    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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