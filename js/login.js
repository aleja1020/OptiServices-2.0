// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // 🔥 NUEVO: Capturar el parámetro 'equipo' de la URL si viene de un QR
    const urlParams = new URLSearchParams(window.location.search);
    const equipoEscaneado = urlParams.get('equipo'); // Será 'monitor', 'anestesia', 'bomba' o null
    console.log("Equipo detectado en URL:", equipoEscaneado);

    // Referencias a elementos del DOM
    const loginForm = document.querySelector('.login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const roleCards = document.querySelectorAll('.role-card');

    let selectedRole = null;

    // ==================== SELECCIÓN DE ROLES ====================
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            roleCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedRole = this.getAttribute('data-role');
            showMessage(`Rol seleccionado: ${this.querySelector('span').textContent}`, 'success');
        });
    });

    // ==================== LOGIN ====================
    loginBtn.addEventListener('click', handleLogin);
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('Por favor, complete todos los campos', 'error');
            return;
        }

        if (!selectedRole) {
            showMessage('Por favor, seleccione un rol de usuario', 'error');
            return;
        }

        showLoading(true);

        setTimeout(() => {
            const loginSuccess = simulateLogin(username, password, selectedRole);
            showLoading(false);

            if (loginSuccess) {
                showMessage('¡Login exitoso! Redirigiendo...', 'success');
                
                // 🔥 NUEVO: Guardar también el equipo escaneado en la sesión
                sessionStorage.setItem('user', JSON.stringify({
                    username: username,
                    role: selectedRole,
                    equipoActivo: equipoEscaneado, // <-- Aquí guardamos el equipo
                    loginTime: new Date().toISOString()
                }));

                setTimeout(() => {
                    redirectToDashboard(selectedRole);
                }, 1000);
            } else {
                showMessage('Credenciales incorrectas. Intente nuevamente.', 'error');
                passwordInput.value = '';
            }
        }, 1500);
    }

    // ==================== FUNCIONES AUXILIARES ====================
    function simulateLogin(username, password, role) {
        const testUsers = {
            'admin': { password: 'admin123', roles: ['biomedical', 'clinical', 'audits'] },
            'biomedico': { password: 'bio123', roles: ['biomedical'] },
            'clinico': { password: 'cli123', roles: ['clinical'] },
            'auditor': { password: 'aud123', roles: ['audits'] }
        };

        const user = testUsers[username];
        return (user && user.password === password && user.roles.includes(role));
    }

    function redirectToDashboard(role) {
        window.location.href = 'pages/dashboard.html';
    }

    function showMessage(text, type) {
        const existingMessage = document.querySelector('.message');
        if (existingMessage) existingMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} show`;
        messageDiv.textContent = text;
        loginForm.insertBefore(messageDiv, loginForm.firstChild);

        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    function showLoading(show) {
        if (show) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading"></span><span>Procesando...</span>';
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<span>Login</span><i class="fas fa-sign-in-alt"></i>';
        }
    }

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = prompt('Ingrese su correo electrónico para recuperar la contraseña:');
        if (email) alert(`Se enviará un enlace de recuperación a: ${email}`);
    });

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

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = '../index.html';
}