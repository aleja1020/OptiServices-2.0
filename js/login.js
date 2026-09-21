// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Referencias a elementos del DOM
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const roleCards = document.querySelectorAll('.role-card');

    // Variable para almacenar el rol seleccionado
    let selectedRole = null;

    // ==================== SELECCIÓN DE ROLES ====================
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover clase active de todas las tarjetas
            roleCards.forEach(c => c.classList.remove('active'));
            
            // Agregar clase active a la tarjeta clickeada
            this.classList.add('active');
            
            // Guardar el rol seleccionado
            selectedRole = this.getAttribute('data-role');
            
            console.log('Rol seleccionado:', selectedRole);
            
            // Feedback visual
            showMessage(`Rol seleccionado: ${this.querySelector('span').textContent}`, 'success');
        });
    });

    // ==================== LOGIN ====================
    loginBtn.addEventListener('click', handleLogin);
    
    // Permitir login con tecla Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validación básica
        if (!username || !password) {
            showMessage('Por favor, complete todos los campos', 'error');
            shakeElement(usernameInput);
            shakeElement(passwordInput);
            return;
        }

        if (!selectedRole) {
            showMessage('Por favor, seleccione un rol de usuario', 'error');
            return;
        }

        // Simular proceso de login
        showLoading(true);

        // Simular llamada a API (esto se cambiará por una llamada real después)
        setTimeout(() => {
            // Aquí iría la validación real contra backend
            const loginSuccess = simulateLogin(username, password, selectedRole);
            
            showLoading(false);

            if (loginSuccess) {
                showMessage('¡Login exitoso! Redirigiendo...', 'success');
                
                // Guardar información de sesión
                sessionStorage.setItem('user', JSON.stringify({
                    username: username,
                    role: selectedRole,
                    loginTime: new Date().toISOString()
                }));

                // Redirigir según el rol (después de 1 segundo)
                setTimeout(() => {
                    redirectToDashboard(selectedRole);
                }, 1000);
            } else {
                showMessage('Credenciales incorrectas. Intente nuevamente.', 'error');
                passwordInput.value = '';
                shakeElement(passwordInput);
            }
        }, 1500);
    }

    // ==================== FUNCIONES AUXILIARES ====================
    
    // Simular validación de login (REEMPLAZAR CON BACKEND REAL)
    function simulateLogin(username, password, role) {
        // Usuarios de prueba (ESTO ES SOLO PARA DEMOSTRACIÓN)
        const testUsers = {
            'admin': { password: 'admin123', roles: ['biomedical', 'clinical', 'audits'] },
            'biomedico': { password: 'bio123', roles: ['biomedical'] },
            'clinico': { password: 'cli123', roles: ['clinical'] },
            'auditor': { password: 'aud123', roles: ['audits'] }
        };

        const user = testUsers[username];
        
        if (user && user.password === password && user.roles.includes(role)) {
            return true;
        }
        
        return false;
    }

   function redirectToDashboard(role) {
    const routes = {
        'biomedical': 'pages/dashboard.html',
        'clinical': 'pages/dashboard.html',
        'audits': 'pages/dashboard.html'
    };

    window.location.href = routes[role];
}

    // Mostrar mensajes
    function showMessage(text, type) {
        // Remover mensajes existentes
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Crear nuevo mensaje
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} show`;
        messageDiv.textContent = text;

        // Insertar antes del formulario
        loginForm.insertBefore(messageDiv, loginForm.firstChild);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    // Mostrar/ocultar loading
    function showLoading(show) {
        if (show) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading"></span><span>Procesando...</span>';
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Login</span><i class="fas fa-sign-in-alt"></i>';
        }
    }

    // Efecto de shake en inputs con error
    function shakeElement(element) {
        element.style.animation = 'shake 0.5s';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    // ==================== FORGOT PASSWORD ====================
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = prompt('Ingrese su correo electrónico para recuperar la contraseña:');
        
        if (email) {
            // Aquí iría la lógica para enviar email de recuperación
            alert(`Se enviará un enlace de recuperación a: ${email}`);
            console.log('Recuperar contraseña para:', email);
        }
    });

    // Agregar animación shake al CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);
});

// ==================== FUNCIONES GLOBALES ====================
// Función para cerrar sesión (disponible en todas las páginas)
function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    const user = sessionStorage.getItem('user');
    return user !== null;
}

// Función para obtener el usuario actual
function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}