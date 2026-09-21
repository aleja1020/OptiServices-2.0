document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar si el usuario está logueado
    const userData = sessionStorage.getItem('user');
    
    if (!userData) {
        // No hay sesión, redirigir al login
        window.location.href = '../index.html';
        return;
    }

    const user = JSON.parse(userData);
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const roleDescriptionElement = document.getElementById('roleDescription');
    const logoutBtn = document.getElementById('logoutBtn');
    const moduleCards = document.querySelectorAll('.module-card');

    // Mostrar información del usuario
    userNameElement.textContent = user.username;
    userRoleElement.textContent = getRoleName(user.role);

    // Descripción de permisos según el rol
    const roleDescriptions = {
        'biomedical': '👩‍🔧 <strong>Biomédica - Acceso Completo:</strong> Puedes ver, editar, subir documentos, generar reportes y gestionar toda la información del sistema.',
        'clinical': '🩺 <strong>Asistencial - Visualización + Reportes:</strong> Puedes visualizar la información y reportar daños o incidencias en los equipos.',
        'audits': '👁️ <strong>Auditor - Solo Visualización:</strong> Puedes ver la información generada por el área biomédica, pero no puedes modificarla.'
    };

    roleDescriptionElement.innerHTML = roleDescriptions[user.role] || 'Rol no definido';

    // Aplicar permisos según el rol
    applyRolePermissions(user.role);

    // Event listeners para los módulos
    moduleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Si no se hizo clic en un botón de acción
            if (!e.target.closest('.btn-action')) {
                const moduleName = this.getAttribute('data-module');
                openModule(moduleName, user.role);
            }
        });
    });

    // Event listeners para botones de acción
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.module-card');
            const moduleName = card.getAttribute('data-module');
            const action = getActionType(this);
            handleAction(moduleName, action, user.role);
        });
    });

    // Logout
    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            sessionStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    });

    // ==================== FUNCIONES ====================

    function getRoleName(role) {
        const roleNames = {
            'biomedical': 'Biomédica',
            'clinical': 'Asistencial',
            'audits': 'Auditor'
        };
        return roleNames[role] || role;
    }

    function applyRolePermissions(role) {
        moduleCards.forEach(card => {
            const actions = card.querySelectorAll('.btn-action');
            
            actions.forEach(btn => {
                const actionType = getActionType(btn);
                
                // Biomédica: todos los permisos
                if (role === 'biomedical') {
                    btn.style.display = 'flex';
                }
                // Asistencial: solo ver y reportar
                else if (role === 'clinical') {
                    if (actionType === 'view' || actionType === 'report') {
                        btn.style.display = 'flex';
                    } else {
                        btn.style.display = 'none';
                    }
                }
                // Auditor: solo ver
                else if (role === 'audits') {
                    if (actionType === 'view') {
                        btn.style.display = 'flex';
                    } else {
                        btn.style.display = 'none';
                    }
                }
            });
        });
    }

    function getActionType(btn) {
        if (btn.classList.contains('btn-view')) return 'view';
        if (btn.classList.contains('btn-edit')) return 'edit';
        if (btn.classList.contains('btn-upload')) return 'upload';
        if (btn.classList.contains('btn-add')) return 'add';
        if (btn.classList.contains('btn-report')) return 'report';
        if (btn.classList.contains('btn-schedule')) return 'schedule';
        return 'unknown';
    }

    function openModule(moduleName, role) {
        const moduleNames = {
            'hojas-vida': 'Hojas de Vida',
            'bitacora': 'Bitácora',
            'reportes': 'Reportes de Mantenimientos',
            'calibraciones': 'Calibraciones',
            'documentos': 'Documentos Relevantes'
        };

        alert(`Abriendo módulo: ${moduleNames[moduleName]}\nRol: ${getRoleName(role)}`);
        // Aquí iría la navegación real: window.location.href = `modules/${moduleName}.html`;
    }

    function handleAction(moduleName, action, role) {
        const permissions = {
            'biomedical': {
                'view': 'Ver información',
                'edit': 'Editar información',
                'upload': 'Subir documentos',
                'add': 'Agregar registro',
                'report': 'Generar reporte',
                'schedule': 'Programar calibración'
            },
            'clinical': {
                'view': 'Ver información',
                'report': 'Reportar daño o incidencia'
            },
            'audits': {
                'view': 'Ver información (solo lectura)'
            }
        };

        const userPermissions = permissions[role] || {};
        const actionDescription = userPermissions[action] || 'Acción no permitida';

        // Verificar si la acción está permitida
        if (!userPermissions[action]) {
            alert(`️ No tienes permisos para realizar esta acción.\n\nTu rol (${getRoleName(role)}) no permite: ${action}`);
            return;
        }

        alert(`✅ Acción: ${actionDescription}\nMódulo: ${moduleName}`);
        // Aquí iría la lógica real de cada acción
    }
});