// ===========================
// GERENCIAMENTO DE DADOS
// ===========================

const DB = {
    // Inicializar dados no LocalStorage
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify(this.createDefaultUsers()));
        }
        if (!localStorage.getItem('bookings')) {
            localStorage.setItem('bookings', JSON.stringify([]));
        }
        if (!localStorage.getItem('availability')) {
            localStorage.setItem('availability', JSON.stringify({}));
        }
    },

    // Criar usuários padrão para demonstração
    createDefaultUsers() {
        return [
            {
                id: 1,
                name: 'Demo Cliente',
                email: 'demo@cliente.com',
                phone: '(11) 99999-9999',
                password: '123456',
                type: 'cliente',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Demo Profissional',
                email: 'demo@prof.com',
                phone: '(11) 98888-8888',
                password: '123456',
                type: 'profissional',
                profession: 'Cabeleireiro',
                bio: 'Profissional experiente com 10 anos de mercado',
                createdAt: new Date().toISOString()
            }
        ];
    },

    // Obter todos os usuários
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },

    // Adicionar novo usuário
    addUser(user) {
        const users = this.getUsers();
        user.id = Math.max(...users.map(u => u.id), 0) + 1;
        user.createdAt = new Date().toISOString();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    },

    // Obter usuário por email
    getUserByEmail(email) {
        return this.getUsers().find(u => u.email === email);
    },

    // Obter usuário por ID
    getUserById(id) {
        return this.getUsers().find(u => u.id === id);
    },

    // Obter todos os profissionais
    getProfessionals() {
        return this.getUsers().filter(u => u.type === 'profissional');
    },

    // Obter todos os agendamentos
    getBookings() {
        return JSON.parse(localStorage.getItem('bookings')) || [];
    },

    // Adicionar novo agendamento
    addBooking(booking) {
        const bookings = this.getBookings();
        booking.id = Math.max(...bookings.map(b => b.id), 0) + 1;
        booking.createdAt = new Date().toISOString();
        booking.status = 'confirmed';
        bookings.push(booking);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        return booking;
    },

    // Cancelar agendamento
    cancelBooking(bookingId) {
        const bookings = this.getBookings();
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = 'cancelled';
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
        return booking;
    },

    // Obter agendamentos de um cliente
    getClientBookings(clientId) {
        return this.getBookings().filter(b => b.clientId === clientId && b.status !== 'cancelled');
    },

    // Obter agendamentos de um profissional
    getProfessionalBookings(professionalId) {
        return this.getBookings().filter(b => b.professionalId === professionalId && b.status !== 'cancelled');
    },

    // Obter disponibilidade de um profissional
    getAvailability(professionalId) {
        const availability = JSON.parse(localStorage.getItem('availability')) || {};
        return availability[professionalId] || { startTime: '08:00', endTime: '18:00', interval: 50 };
    },

    // Salvar disponibilidade de um profissional
    setAvailability(professionalId, availability) {
        const allAvailability = JSON.parse(localStorage.getItem('availability')) || {};
        allAvailability[professionalId] = availability;
        localStorage.setItem('availability', JSON.stringify(allAvailability));
    }
};

// ===========================
// GERENCIAMENTO DE SESSÃO
// ===========================

const AUTH = {
    // Obter usuário logado
    getCurrentUser() {
        const userId = sessionStorage.getItem('currentUserId');
        if (!userId) return null;
        return DB.getUserById(parseInt(userId));
    },

    // Login
    login(email, password, type) {
        const user = DB.getUserByEmail(email);
        if (!user || user.password !== password || user.type !== type) {
            return { success: false, message: 'Email, senha ou tipo de conta inválidos' };
        }
        sessionStorage.setItem('currentUserId', user.id);
        return { success: true, user };
    },

    // Logout
    logout() {
        sessionStorage.removeItem('currentUserId');
    },

    // Verificar se está logado
    isLoggedIn() {
        return sessionStorage.getItem('currentUserId') !== null;
    },

    // Registrar novo usuário
    signup(userData) {
        // Validar se email já existe
        if (DB.getUserByEmail(userData.email)) {
            return { success: false, message: 'Email já cadastrado' };
        }

        // Validar senha
        if (userData.password.length < 6) {
            return { success: false, message: 'Senha deve ter no mínimo 6 caracteres' };
        }

        // Adicionar usuário
        const user = DB.addUser(userData);
        sessionStorage.setItem('currentUserId', user.id);
        return { success: true, user };
    }
};

// ===========================
// NAVEGAÇÃO ENTRE PÁGINAS
// ===========================

function navigateTo(pageName) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Mostrar página solicitada
    const page = document.getElementById(pageName + '-page');
    if (page) {
        page.classList.add('active');

        // Executar ações específicas da página
        if (pageName === 'client') {
            loadClientPage();
        } else if (pageName === 'professional') {
            loadProfessionalPage();
        }
    }
}

function handleLogout() {
    if (confirm('Deseja sair?')) {
        AUTH.logout();
        navigateTo('home');
    }
}

// ===========================
// AUTENTICAÇÃO - LOGIN
// ===========================

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const type = document.getElementById('login-type').value;

    const result = AUTH.login(email, password, type);

    if (result.success) {
        // Redirecionar para página apropriada
        if (type === 'cliente') {
            navigateTo('client');
        } else if (type === 'profissional') {
            navigateTo('professional');
        }
        document.getElementById('login-form').reset();
        showNotification('Login realizado com sucesso!', 'success');
    } else {
        showNotification(result.message, 'error');
    }
}

// ===========================
// AUTENTICAÇÃO - CADASTRO
// ===========================

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const type = document.getElementById('signup-type').value;

    let userData = {
        name,
        email,
        phone,
        password,
        type
    };

    // Adicionar campos específicos para profissional
    if (type === 'profissional') {
        userData.profession = document.getElementById('signup-profession').value;
        userData.bio = document.getElementById('signup-bio').value;
    }

    const result = AUTH.signup(userData);

    if (result.success) {
        showNotification('Conta criada com sucesso!', 'success');
        document.getElementById('signup-form').reset();
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            if (type === 'cliente') {
                navigateTo('client');
            } else if (type === 'profissional') {
                navigateTo('professional');
            }
        }, 1000);
    } else {
        showNotification(result.message, 'error');
    }
}

// Mostrar/esconder campos de profissional no cadastro
document.addEventListener('DOMContentLoaded', function() {
    const signupTypeSelect = document.getElementById('signup-type');
    const professionalFields = document.getElementById('professional-fields');

    if (signupTypeSelect) {
        signupTypeSelect.addEventListener('change', function() {
            if (this.value === 'profissional') {
                professionalFields.style.display = 'block';
                document.getElementById('signup-profession').required = true;
            } else {
                professionalFields.style.display = 'none';
                document.getElementById('signup-profession').required = false;
            }
        });
    }

    // Inicializar dados
    DB.init();

    // Definir data mínima no input de data
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = today;
    });
});

// ===========================
// PÁGINA DO CLIENTE
// ===========================

function loadClientPage() {
    const user = AUTH.getCurrentUser();
    if (!user) {
        navigateTo('login');
        return;
    }

    document.getElementById('client-name').textContent = user.name;
    loadProfessionalsForClient();
    loadClientBookings();
}

function loadProfessionalsForClient() {
    const professionals = DB.getProfessionals();
    const container = document.getElementById('professionals-list');
    container.innerHTML = '';

    if (professionals.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Nenhum profissional disponível</h3></div>';
        return;
    }

    professionals.forEach(prof => {
        const card = document.createElement('div');
        card.className = 'professional-card';
        card.innerHTML = `
            <div class="professional-card-header">
                <h3>${prof.name}</h3>
                <p>${prof.profession || 'Profissional'}</p>
            </div>
            <div class="professional-card-body">
                <p>${prof.bio || 'Profissional de qualidade'}</p>
                <p><strong>Telefone:</strong> ${prof.phone}</p>
                <button class="btn btn-primary" onclick="selectProfessional(${prof.id})">Agendar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function selectProfessional(professionalId) {
    sessionStorage.setItem('selectedProfessionalId', professionalId);
    navigateTo('booking');
    loadBookingPage();
}

function loadBookingPage() {
    const professionalId = parseInt(sessionStorage.getItem('selectedProfessionalId'));
    const professional = DB.getUserById(professionalId);

    if (!professional) {
        navigateTo('client');
        return;
    }

    document.getElementById('booking-prof-name').textContent = professional.name;
    document.getElementById('booking-prof-profession').textContent = professional.profession || 'Profissional';
    document.getElementById('booking-prof-bio').textContent = professional.bio || '';

    // Carregar horários quando data for selecionada
    const dateInput = document.getElementById('booking-date');
    dateInput.addEventListener('change', loadAvailableTimes);

    // Definir data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    loadAvailableTimes();
}

function loadAvailableTimes() {
    const professionalId = parseInt(sessionStorage.getItem('selectedProfessionalId'));
    const date = document.getElementById('booking-date').value;

    if (!date) return;

    const availability = DB.getAvailability(professionalId);
    const bookings = DB.getProfessionalBookings(professionalId);
    const timesContainer = document.getElementById('available-times');
    timesContainer.innerHTML = '';

    // Gerar horários disponíveis
    const times = generateTimeSlots(availability.startTime, availability.endTime, availability.interval);

    // Filtrar horários já agendados
    const bookedTimes = bookings
        .filter(b => b.date === date)
        .map(b => b.time);

    times.forEach(time => {
        const isBooked = bookedTimes.includes(time);
        const btn = document.createElement('button');
        btn.className = 'time-btn';
        btn.textContent = time;
        btn.disabled = isBooked;
        btn.onclick = () => selectTime(time, btn);
        timesContainer.appendChild(btn);
    });

    if (times.length === 0) {
        timesContainer.innerHTML = '<p class="text-muted">Nenhum horário disponível para esta data</p>';
    }
}

function selectTime(time, element) {
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-time').value = time;
}

function confirmBooking() {
    const user = AUTH.getCurrentUser();
    const professionalId = parseInt(sessionStorage.getItem('selectedProfessionalId'));
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('selected-time').value;
    const notes = document.getElementById('booking-notes').value;

    if (!date || !time) {
        showNotification('Selecione uma data e horário', 'error');
        return;
    }

    // Verificar se horário ainda está disponível
    const bookings = DB.getProfessionalBookings(professionalId);
    const isBooked = bookings.some(b => b.date === date && b.time === time);

    if (isBooked) {
        showNotification('Este horário já foi agendado', 'error');
        return;
    }

    const booking = {
        clientId: user.id,
        clientName: user.name,
        clientPhone: user.phone,
        professionalId: professionalId,
        professionalName: DB.getUserById(professionalId).name,
        date: date,
        time: time,
        notes: notes,
        isGuest: false
    };

    DB.addBooking(booking);
    showNotification('Agendamento confirmado com sucesso!', 'success');
    
    setTimeout(() => {
        navigateTo('client');
        loadClientBookings();
        document.getElementById('booking-notes').value = '';
    }, 1500);
}

function loadClientBookings() {
    const user = AUTH.getCurrentUser();
    const bookings = DB.getClientBookings(user.id);
    const container = document.getElementById('client-bookings');
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>Você não tem agendamentos</h3><p>Agende um horário com um profissional</p></div>';
        return;
    }

    bookings.forEach(booking => {
        const card = createBookingCard(booking, 'client');
        container.appendChild(card);
    });
}

function cancelClientBooking(bookingId) {
    if (confirm('Deseja cancelar este agendamento?')) {
        DB.cancelBooking(bookingId);
        showNotification('Agendamento cancelado', 'success');
        loadClientBookings();
    }
}

// ===========================
// PÁGINA DO PROFISSIONAL
// ===========================

function loadProfessionalPage() {
    const user = AUTH.getCurrentUser();
    if (!user) {
        navigateTo('login');
        return;
    }

    document.getElementById('professional-name').textContent = user.name;
    loadAvailabilityInfo();
    loadProfessionalBookings();
    loadReports();
}

function handleAvailability(event) {
    event.preventDefault();

    const user = AUTH.getCurrentUser();
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const interval = parseInt(document.getElementById('interval').value);

    if (startTime >= endTime) {
        showNotification('Horário de término deve ser após o de início', 'error');
        return;
    }

    const availability = {
        startTime: startTime,
        endTime: endTime,
        interval: interval
    };

    DB.setAvailability(user.id, availability);
    showNotification('Disponibilidade atualizada com sucesso!', 'success');
    loadAvailabilityInfo();
}

function loadAvailabilityInfo() {
    const user = AUTH.getCurrentUser();
    const availability = DB.getAvailability(user.id);
    const container = document.getElementById('current-availability');

    const times = generateTimeSlots(availability.startTime, availability.endTime, availability.interval);

    container.innerHTML = `
        <p><strong>Horário de Funcionamento:</strong> ${availability.startTime} às ${availability.endTime}</p>
        <p><strong>Duração do Atendimento:</strong> ${availability.interval} minutos</p>
        <p><strong>Total de Horários Disponíveis:</strong> ${times.length} horários por dia</p>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--light-text);">
            <strong>Próximos horários:</strong> ${times.slice(0, 5).join(', ')}...
        </p>
    `;
}

function loadProfessionalBookings() {
    const user = AUTH.getCurrentUser();
    const bookings = DB.getProfessionalBookings(user.id);
    const container = document.getElementById('professional-bookings');
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Nenhum agendamento</h3></div>';
        return;
    }

    // Ordenar por data e hora
    bookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateA - dateB;
    });

    bookings.forEach(booking => {
        const card = createBookingCard(booking, 'professional');
        container.appendChild(card);
    });
}

function filterAgenda() {
    const filterDate = document.getElementById('agenda-date-filter').value;
    const user = AUTH.getCurrentUser();
    let bookings = DB.getProfessionalBookings(user.id);

    if (filterDate) {
        bookings = bookings.filter(b => b.date === filterDate);
    }

    const container = document.getElementById('professional-bookings');
    container.innerHTML = '';

    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><h3>Nenhum agendamento nesta data</h3></div>';
        return;
    }

    bookings.forEach(booking => {
        const card = createBookingCard(booking, 'professional');
        container.appendChild(card);
    });
}

function clearDateFilter() {
    document.getElementById('agenda-date-filter').value = '';
    loadProfessionalBookings();
}

function cancelProfessionalBooking(bookingId) {
    if (confirm('Deseja cancelar este agendamento?')) {
        DB.cancelBooking(bookingId);
        showNotification('Agendamento cancelado', 'success');
        loadProfessionalBookings();
    }
}

// ===========================
// AGENDAMENTO COMO CONVIDADO
// ===========================

function loadGuestBookingPage() {
    const professionals = DB.getProfessionals();
    const select = document.getElementById('guest-professional');
    select.innerHTML = '<option value="">Escolha um profissional...</option>';

    professionals.forEach(prof => {
        const option = document.createElement('option');
        option.value = prof.id;
        option.textContent = `${prof.name} - ${prof.profession || 'Profissional'}`;
        select.appendChild(option);
    });
}

function loadGuestAvailableTimes() {
    const professionalId = parseInt(document.getElementById('guest-professional').value);
    const date = document.getElementById('guest-date').value;

    if (!professionalId || !date) {
        document.getElementById('guest-available-times').innerHTML = '';
        return;
    }

    const availability = DB.getAvailability(professionalId);
    const bookings = DB.getProfessionalBookings(professionalId);
    const timesContainer = document.getElementById('guest-available-times');
    timesContainer.innerHTML = '';

    const times = generateTimeSlots(availability.startTime, availability.endTime, availability.interval);
    const bookedTimes = bookings
        .filter(b => b.date === date)
        .map(b => b.time);

    times.forEach(time => {
        const isBooked = bookedTimes.includes(time);
        const btn = document.createElement('button');
        btn.className = 'time-btn';
        btn.textContent = time;
        btn.disabled = isBooked;
        btn.onclick = () => selectGuestTime(time, btn);
        timesContainer.appendChild(btn);
    });
}

function selectGuestTime(time, element) {
    document.querySelectorAll('#guest-available-times .time-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('guest-selected-time').value = time;
}

function confirmGuestBooking() {
    const name = document.getElementById('guest-name').value;
    const phone = document.getElementById('guest-phone').value;
    const email = document.getElementById('guest-email').value;
    const professionalId = parseInt(document.getElementById('guest-professional').value);
    const date = document.getElementById('guest-date').value;
    const time = document.getElementById('guest-selected-time').value;
    const notes = document.getElementById('guest-notes').value;

    if (!name || !phone || !professionalId || !date || !time) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    // Verificar se horário ainda está disponível
    const bookings = DB.getProfessionalBookings(professionalId);
    const isBooked = bookings.some(b => b.date === date && b.time === time);

    if (isBooked) {
        showNotification('Este horário já foi agendado', 'error');
        return;
    }

    const booking = {
        clientId: null,
        clientName: name,
        clientPhone: phone,
        clientEmail: email,
        professionalId: professionalId,
        professionalName: DB.getUserById(professionalId).name,
        date: date,
        time: time,
        notes: notes,
        isGuest: true
    };

    DB.addBooking(booking);
    showNotification('Agendamento confirmado com sucesso!', 'success');
    
    setTimeout(() => {
        document.getElementById('guest-name').value = '';
        document.getElementById('guest-phone').value = '';
        document.getElementById('guest-email').value = '';
        document.getElementById('guest-professional').value = '';
        document.getElementById('guest-date').value = '';
        document.getElementById('guest-notes').value = '';
        navigateTo('home');
    }, 1500);
}

// ===========================
// UTILITÁRIOS
// ===========================

// Gerar slots de tempo
function generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentTime = new Date();
    currentTime.setHours(startHour, startMin, 0);

    const endDateTime = new Date();
    endDateTime.setHours(endHour, endMin, 0);

    while (currentTime < endDateTime) {
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        slots.push(`${hours}:${minutes}`);
        currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }

    return slots;
}

// Criar card de agendamento
function createBookingCard(booking, userType) {
    const card = document.createElement('div');
    card.className = 'booking-card';

    const dateObj = new Date(booking.date);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let cardHTML = `
        <div class="booking-card-header">
            <div class="booking-card-title">
                ${userType === 'client' ? booking.professionalName : booking.clientName}
            </div>
            <span class="booking-card-status confirmed">Confirmado</span>
        </div>
        <div class="booking-card-info">
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Data</div>
                <div class="booking-card-info-value">${formattedDate}</div>
            </div>
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Horário</div>
                <div class="booking-card-info-value">${booking.time}</div>
            </div>
    `;

    if (userType === 'client') {
        cardHTML += `
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Profissional</div>
                <div class="booking-card-info-value">${booking.professionalName}</div>
            </div>
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Telefone</div>
                <div class="booking-card-info-value">${booking.professionalName}</div>
            </div>
        `;
    } else {
        cardHTML += `
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Cliente</div>
                <div class="booking-card-info-value">${booking.clientName}</div>
            </div>
            <div class="booking-card-info-item">
                <div class="booking-card-info-label">Telefone</div>
                <div class="booking-card-info-value">${booking.clientPhone}</div>
            </div>
        `;
    }

    cardHTML += '</div>';

    if (booking.notes) {
        cardHTML += `
            <div class="booking-card-notes">
                <strong>Observações:</strong> ${booking.notes}
            </div>
        `;
    }

    cardHTML += `
        <div class="booking-card-actions">
            <button class="btn btn-secondary" onclick="copyBookingInfo(${booking.id})">
                Copiar Info
            </button>
            <button class="btn btn-danger" onclick="${userType === 'client' ? 'cancelClientBooking' : 'cancelProfessionalBooking'}(${booking.id})">
                Cancelar
            </button>
        </div>
    `;

    card.innerHTML = cardHTML;
    return card;
}

// Copiar informações do agendamento
function copyBookingInfo(bookingId) {
    const booking = DB.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const info = `
Agendamento #${booking.id}
Cliente: ${booking.clientName}
Telefone: ${booking.clientPhone}
Data: ${booking.date}
Horário: ${booking.time}
${booking.notes ? `Observações: ${booking.notes}` : ''}
    `.trim();

    navigator.clipboard.writeText(info).then(() => {
        showNotification('Informações copiadas!', 'success');
    });
}

// Alternar entre abas
function switchTab(tabName) {
    // Remover classe active de todos os tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Adicionar classe active ao tab selecionado
    const tab = document.getElementById(tabName);
    if (tab) {
        tab.classList.add('active');
    }

    // Adicionar classe active ao botão selecionado
    event.target.classList.add('active');
}

// Mostrar notificações
function showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
    `;

    // Inserir no topo da página
    const mainContent = document.querySelector('.main-content') || document.querySelector('.form-container') || document.querySelector('.hero-section');
    if (mainContent) {
        mainContent.insertBefore(notification, mainContent.firstChild);
    }

    // Remover após 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', function() {
    DB.init();
    
    // Carregar página inicial
    navigateTo('home');

    // Carregar página de agendamento como convidado
    loadGuestBookingPage();
});

// ===========================
// RELATORIOS E METRICAS
// ===========================

// Calcular metricas de relatorio
function calculateReportMetrics(bookings, startDate = null, endDate = null) {
    let filteredBookings = bookings;

    // Filtrar por data se especificado
    if (startDate && endDate) {
        filteredBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
        });
    }

    const completed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    const total = filteredBookings.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Simular receita (valor aleatorio entre 50 e 150 por agendamento)
    const basePrice = 75; // Valor base simulado
    const potentialRevenue = completed * basePrice;
    const avgRevenue = completed > 0 ? potentialRevenue / completed : 0;

    // Calcular receita mensal media
    let monthlyRevenue = 0;
    if (filteredBookings.length > 0) {
        const dates = filteredBookings.map(b => new Date(b.date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                          (maxDate.getMonth() - minDate.getMonth()) + 1;
        monthlyRevenue = monthsDiff > 0 ? potentialRevenue / monthsDiff : potentialRevenue;
    }

    return {
        completed,
        cancelled,
        total,
        completionRate,
        potentialRevenue,
        avgRevenue,
        monthlyRevenue
    };
}

// Carregar relatorios
function loadReports() {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    const bookings = DB.getProfessionalBookings(user.id);

    const metrics = calculateReportMetrics(bookings, startDate, endDate);

    // Atualizar KPIs
    document.getElementById('completed-bookings').textContent = metrics.completed;
    document.getElementById('cancelled-bookings').textContent = metrics.cancelled;
    document.getElementById('completion-rate').textContent = metrics.completionRate + '%';
    document.getElementById('potential-revenue').textContent = 'R$ ' + metrics.potentialRevenue.toFixed(2).replace('.', ',');

    // Atualizar resumo de receita
    document.getElementById('avg-revenue').textContent = 'R$ ' + metrics.avgRevenue.toFixed(2).replace('.', ',');
    document.getElementById('total-revenue').textContent = 'R$ ' + metrics.potentialRevenue.toFixed(2).replace('.', ',');
    document.getElementById('monthly-revenue').textContent = 'R$ ' + metrics.monthlyRevenue.toFixed(2).replace('.', ',');

    // Carregar tabela de agendamentos
    loadReportsTable(bookings, startDate, endDate);
}

// Carregar tabela de relatorios
function loadReportsTable(bookings, startDate = null, endDate = null) {
    let filteredBookings = bookings;

    // Filtrar por data se especificado
    if (startDate && endDate) {
        filteredBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate);
        });
    }

    // Ordenar por data decrescente
    filteredBookings.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + a.time);
        const dateB = new Date(b.date + ' ' + b.time);
        return dateB - dateA;
    });

    const container = document.getElementById('bookings-table');
    container.innerHTML = '';

    if (filteredBookings.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum agendamento no periodo selecionado</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'reports-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Horario</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Valor Simulado</th>
            </tr>
        </thead>
        <tbody>
            ${filteredBookings.map(booking => `
                <tr>
                    <td>${new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                    <td>${booking.time}</td>
                    <td>${booking.clientName}</td>
                    <td>${booking.clientPhone}</td>
                    <td><span class="status-badge ${booking.status === 'confirmed' ? 'confirmed' : 'cancelled'}">${booking.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}</span></td>
                    <td>${booking.status === 'confirmed' ? 'R$ 75,00' : '-'}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    container.appendChild(table);
}

// Limpar filtros de relatorio
function clearReportFilters() {
    document.getElementById('report-start-date').value = '';
    document.getElementById('report-end-date').value = '';
    loadReports();
}
