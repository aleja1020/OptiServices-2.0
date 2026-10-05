document.addEventListener('DOMContentLoaded', function() {
    
    const userData = sessionStorage.getItem('user');
    
    if (!userData) {
        window.location.href = '../index.html';
        return;
    }

    const user = JSON.parse(userData);
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const roleDescriptionElement = document.getElementById('roleDescription');
    const logoutBtn = document.getElementById('logoutBtn');
    const moduleCards = document.querySelectorAll('.module-card');
    const dashboardContent = document.querySelector('.dashboard-content');

    // Mostrar información del usuario
    userNameElement.textContent = user.username;
    userRoleElement.textContent = getRoleName(user.role);

    const roleDescriptions = {
        'biomedical': '👩‍🔧 <strong>Biomédica:</strong> Acceso completo a edición, reportes y gestión.',
        'clinical': '🩺 <strong>Asistencial:</strong> Visualización y reporte de incidencias.',
        'audits': '👁️ <strong>Auditor:</strong> Solo visualización de registros.'
    };
    roleDescriptionElement.innerHTML = roleDescriptions[user.role] || 'Rol no definido';

    // 🔥 NUEVO: Lógica para mostrar el equipo escaneado
    const equipoActivo = user.equipoActivo;
    
    // Base de datos simulada de los equipos
    const equiposDB = {
        'monitor': { nombre: 'Monitor de Signos Vitales - Dräger Vista 100', serie: 'ABC2134', ubicacion: 'UCI - Cama 4' },
        'anestesia': { nombre: 'Máquina de Anestesia - Dräger Primus', serie: 'DEF1234', ubicacion: 'Quirófano 2' },
        'bomba': { nombre: 'Bomba de Infusión - B. Braun Plus200', serie: 'XYZ5678', ubicacion: 'Hospitalización - Piso 3' }
    };

    // Si viene de un QR, mostramos un banner especial al inicio del dashboard
    if (equipoActivo && equiposDB[equipoActivo]) {
        const equipo = equiposDB[equipoActivo];
        
        // Cambiar el título principal para que sea obvio
        const headerTitle = document.querySelector('.header-title');
        if(headerTitle) headerTitle.textContent = `OPTISERVICES | ${equipo.nombre}`;

        // Insertar un banner informativo al principio del contenido
        const bannerHTML = `
            <div style="background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); color: white; padding: 20px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);">
                <h2 style="margin: 0 0 10px 0; font-size: 1.4rem;"><i class="fas fa-qrcode"></i> Equipo Escaneado</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 0.95rem;">
                    <div><strong>Modelo:</strong> ${equipo.nombre}</div>
                    <div><strong>N° Serie:</strong> ${equipo.serie}</div>
                    <div><strong>Ubicación:</strong> ${equipo.ubicacion}</div>
                </div>
            </div>
        `;
        dashboardContent.insertAdjacentHTML('afterbegin', bannerHTML);
    } else {
        // Si entró normal sin escanear QR
        const headerTitle = document.querySelector('.header-title');
        if(headerTitle) headerTitle.textContent = `OPTISERVICES | Panel General`;
    }

    applyRolePermissions(user.role);

    // Event listeners para los módulos
    moduleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-action')) {
                const moduleName = this.getAttribute('data-module');
                openModule(moduleName, user.role, equipoActivo);
            }
        });
    });

    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.module-card');
            const moduleName = card.getAttribute('data-module');
            const action = getActionType(this);
            handleAction(moduleName, action, user.role, equipoActivo);
        });
    });

    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            sessionStorage.removeItem('user');
            window.location.href = '../index.html';
        }
    });

    // ==================== FUNCIONES ====================
    function getRoleName(role) {
        const names = { 'biomedical': 'Biomédica', 'clinical': 'Asistencial', 'audits': 'Auditor' };
        return names[role] || role;
    }

    function applyRolePermissions(role) {
        moduleCards.forEach(card => {
            const actions = card.querySelectorAll('.btn-action');
            actions.forEach(btn => {
                const actionType = getActionType(btn);
                if (role === 'biomedical') btn.style.display = 'flex';
                else if (role === 'clinical' && (actionType === 'view' || actionType === 'report')) btn.style.display = 'flex';
                else if (role === 'audits' && actionType === 'view') btn.style.display = 'flex';
                else btn.style.display = 'none';
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

    function openModule(moduleName, role, equipo) {
        const equipoInfo = equipo ? `del equipo: ${equiposDB[equipo].nombre}` : 'General';
        alert(`Abriendo módulo: ${moduleName}\n${equipoInfo}\nRol: ${getRoleName(role)}`);
    }

    function handleAction(moduleName, action, role, equipo) {
        const permissions = {
            'biomedical': { 'view': 'Ver', 'edit': 'Editar', 'upload': 'Subir', 'add': 'Agregar', 'report': 'Generar reporte', 'schedule': 'Programar' },
            'clinical': { 'view': 'Ver', 'report': 'Reportar daño' },
            'audits': { 'view': 'Ver (solo lectura)' }
        };

        const userPerms = permissions[role] || {};
        if (!userPerms[action]) {
            alert(`⚠️ No tienes permisos para: ${action}`);
            return;
        }

        const equipoInfo = equipo ? `(Equipo: ${equiposDB[equipo].serie})` : '';
        alert(`✅ Acción: ${userPerms[action]} ${equipoInfo}\nMódulo: ${moduleName}`);
    }
});