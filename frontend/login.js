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
            alert(`¡Bienvenido de vuelta, ${datos.usuario.nombreUsuario}!`);
            // Aquí en el futuro lo redirigirías al muro de la red social
            // window.location.href = 'muro.html'; 
        } else {
            // Si la contraseña o correo están mal, mostramos el "Credenciales inválidas"
            alert(datos.mensaje);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al conectar con el servidor.');
    }
});