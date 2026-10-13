const formularioLogin = document.getElementById('formularioLogin');

formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }) 
        });

        const datos = await respuesta.json();

        if (respuesta.status === 200) {
            // Guardamos los datos del usuario en el navegador para usarlos en las otras páginas
            localStorage.setItem('usuarioLogueado', JSON.stringify(datos.usuario));

            // Redirección basada en el rol
            if (datos.usuario.rol === 'admin') {
                window.location.href = 'panel-admin.html';
            } else if (datos.usuario.rol === 'moderador') {
                window.location.href = 'panel-moderador.html';
            } else {
                window.location.href = 'muro.html'; // El usuario normal va al muro
            }
        } else {
            alert(datos.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
});