const API_URL = window.location.origin;

function getToken() {
  return localStorage.getItem('token');
}

function getRole() {
  return localStorage.getItem('role');
}

function saveSession({ token, role, username, empresa_id }) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', username);
  if (empresa_id) {
    localStorage.setItem('empresa_id', empresa_id);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('empresa_id');
  window.location.href = '/';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Sessão expirada, faça login novamente.');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || body.message || 'Erro na requisição');
    }
    return body;
  }

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || 'Erro na requisição');
  }
  return text;
}

function renderMessage(containerId, message, success = false) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.textContent = message;
  el.className = `message ${success ? 'success' : ''}`.trim();
}

async function loadSchools(selectId) {
  try {
    const response = await fetch(`${API_URL}/api/empresas`);
    if (!response.ok) throw new Error('Não foi possível carregar as unidades escolares.');
    const schools = await response.json();
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">Selecione sua unidade escolar</option>';
    schools.forEach(school => {
      const option = document.createElement('option');
      option.value = school.id;
      option.textContent = school.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    renderMessage(selectId === 'empresa' ? 'loginMessage' : 'registerMessage', 'Erro ao carregar escolas. Tente recarregar a página.');
  }
}

function ensureLoggedIn() {
  if (!getToken()) {
    window.location.href = '/';
    return false;
  }
  return true;
}

function getUserName() {
  return localStorage.getItem('username') || '';
}

function getSchoolId() {
  return localStorage.getItem('empresa_id') || '';
}

async function initializeLoginPage() {
  await loadSchools('empresa');
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    renderMessage('loginMessage', '');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const empresa_id = document.getElementById('empresa').value;

    if (!username || !password) {
      renderMessage('loginMessage', 'Preencha usuário e senha.');
      return;
    }

    if (!empresa_id && username !== 'Rafa.admin') {
      renderMessage('loginMessage', 'Selecione sua unidade escolar.');
      return;
    }

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, empresa_id: empresa_id || null })
      });
      saveSession({ token: response.token, role: response.role, username, empresa_id });
      if (response.role === 'super_admin') {
        window.location.href = '/frontend/pages/superadmin.html';
      } else if (response.role === 'admin') {
        window.location.href = '/frontend/pages/admin.html';
      } else {
        window.location.href = '/frontend/pages/dashboard.html';
      }
    } catch (error) {
      renderMessage('loginMessage', error.message || 'Erro no login.');
    }
  });
}

async function initializeRegisterPage() {
  await loadSchools('newEmpresa');
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    renderMessage('registerMessage', '');

    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const empresa_id = document.getElementById('newEmpresa').value;

    if (!username || !password || !empresa_id) {
      renderMessage('registerMessage', 'Preencha todos os campos antes de continuar.');
      return;
    }

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, empresa_id })
      });
      renderMessage('registerMessage', 'Usuário registrado com sucesso. Aguarde aprovação.', true);
      form.reset();
    } catch (error) {
      renderMessage('registerMessage', error.message || 'Erro ao registrar usuário.');
    }
  });
}

function buildTable(headers, rows, actions = []) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  if (actions.length) {
    const th = document.createElement('th');
    th.textContent = 'Ações';
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    row.cells.forEach(cell => {
      const td = document.createElement('td');
      td.innerHTML = cell;
      tr.appendChild(td);
    });
    if (actions.length) {
      const td = document.createElement('td');
      actions.forEach(action => {
        const button = document.createElement('button');
        const label = typeof action.label === 'function' ? action.label(row.data) : action.label;
        button.textContent = label;
        button.className = action.className || 'btn btn-secondary';
        button.addEventListener('click', () => action.onClick(row.data));
        td.appendChild(button);
      });
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

async function initializeDashboardPage() {
  if (!ensureLoggedIn()) return;
  document.getElementById('dashboardRole').textContent = `Usuário: ${getUserName()} (${getRole()})`;
  document.getElementById('logoutButton').addEventListener('click', logout);
  document.getElementById('incidentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    renderMessage('incidentMessage', '');

    const aluno = document.getElementById('aluno').value.trim();
    const turma = document.getElementById('turma').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;

    if (!aluno || !turma || !descricao || !data || !hora) {
      renderMessage('incidentMessage', 'Preencha todos os campos.');
      return;
    }

    try {
      await apiFetch('/api/incidents', {
        method: 'POST',
        body: JSON.stringify({ aluno, turma, descricao, data, hora })
      });
      renderMessage('incidentMessage', 'Ocorrência criada com sucesso.', true);
      event.target.reset();
      loadIncidents();
    } catch (error) {
      renderMessage('incidentMessage', error.message || 'Erro ao criar ocorrência.');
    }
  });
  loadIncidents();
}

async function loadIncidents() {
  try {
    const response = await apiFetch('/api/incidents');
    const incidents = Array.isArray(response) ? response : response.incidents || [];
    const container = document.getElementById('incidentsList');
    if (!container) return;
    if (!incidents.length) {
      container.innerHTML = '<p>Nenhuma ocorrência encontrada.</p>';
      return;
    }

    const rows = incidents.map(incident => ({
      data: incident,
      cells: [
        incident.aluno,
        incident.turma,
        incident.descricao,
        incident.data,
        incident.hora
      ]
    }));

    container.innerHTML = '';
    container.appendChild(buildTable(['Aluno', 'Turma', 'Descrição', 'Data', 'Hora'], rows));
  } catch (error) {
    renderMessage('incidentsMessage', error.message || 'Erro ao carregar ocorrências.');
  }
}

async function initializeAdminPage() {
  if (!ensureLoggedIn()) return;
  document.getElementById('adminRole').textContent = `Usuário: ${getUserName()} (${getRole()})`;
  document.getElementById('logoutButton').addEventListener('click', logout);
  loadAdminUsers();
}

async function loadAdminUsers() {
  try {
    const response = await apiFetch('/api/users');
    const users = Array.isArray(response) ? response : response.users || [];
    const container = document.getElementById('usersList');
    if (!container) return;
    if (!users.length) {
      container.innerHTML = '<p>Nenhum usuário encontrado.</p>';
      return;
    }

    const rows = users.map(user => ({
      data: user,
      cells: [user.username, user.role, user.status, user.escola || user.empresa_id || '—']
    }));

    container.innerHTML = '';
    container.appendChild(buildTable(
      ['Usuário', 'Role', 'Status', 'Escola'],
      rows,
      [
        {
          label: 'Aprovar',
          className: 'btn btn-primary',
          onClick: async (user) => {
            await changeUserStatus(user.id, 'aprovado');
            loadAdminUsers();
          }
        },
        {
          label: 'Recusar',
          className: 'btn btn-secondary',
          onClick: async (user) => {
            await changeUserStatus(user.id, 'rejeitado');
            loadAdminUsers();
          }
        }
      ]
    ));
  } catch (error) {
    renderMessage('usersMessage', error.message || 'Erro ao carregar usuários.');
  }
}

async function changeUserStatus(id, status) {
  try {
    await apiFetch(`/api/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  } catch (error) {
    renderMessage('usersMessage', error.message || 'Erro ao atualizar status.');
  }
}

async function initializeSuperAdminPage() {
  if (!ensureLoggedIn()) return;
  document.getElementById('superadminRole').textContent = `Usuário: ${getUserName()} (${getRole()})`;
  document.getElementById('logoutButton').addEventListener('click', logout);
  document.getElementById('companyForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    renderMessage('companyMessage', '');

    const nome = document.getElementById('companyName').value.trim();
    if (!nome) {
      renderMessage('companyMessage', 'Digite o nome da escola.');
      return;
    }

    try {
      await apiFetch('/api/empresas', {
        method: 'POST',
        body: JSON.stringify({ nome })
      });
      renderMessage('companyMessage', 'Escola criada com sucesso.', true);
      event.target.reset();
      loadSuperAdminCompanies();
      loadSuperAdminUsers();
      loadSchools('superUserEmpresa');
    } catch (error) {
      renderMessage('companyMessage', error.message || 'Erro ao criar escola.');
    }
  });

  document.getElementById('superCreateForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    renderMessage('superCreateMessage', '');

    const username = document.getElementById('superUsername').value.trim();
    const password = document.getElementById('superPassword').value;
    const role = document.getElementById('superUserRole').value;
    const empresa_id = document.getElementById('superUserEmpresa').value;

    if (!username || !password || !role || !empresa_id) {
      renderMessage('superCreateMessage', 'Preencha todos os campos para criar o usuário.');
      return;
    }

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ username, password, role, empresa_id })
      });
      renderMessage('superCreateMessage', 'Usuário criado com sucesso.', true);
      event.target.reset();
      loadSuperAdminUsers();
    } catch (error) {
      renderMessage('superCreateMessage', error.message || 'Erro ao criar usuário.');
    }
  });

  await loadSchools('superUserEmpresa');
  loadSuperAdminCompanies();
  loadSuperAdminUsers();
}

async function loadSuperAdminCompanies() {
  try {
    const companies = await apiFetch('/api/empresas');
    const container = document.getElementById('companiesList');
    if (!container) return;
    if (!companies.length) {
      container.innerHTML = '<p>Nenhuma escola cadastrada.</p>';
      return;
    }

    const rows = companies.map(company => ({
      data: company,
      cells: [company.id, company.nome]
    }));
    container.innerHTML = '';
    container.appendChild(buildTable(['ID', 'Nome'], rows));
  } catch (error) {
    renderMessage('companyMessage', error.message || 'Erro ao carregar empresas.');
  }
}

async function loadSuperAdminUsers() {
  try {
    const response = await apiFetch('/api/users');
    const users = Array.isArray(response) ? response : response.users || [];
    const container = document.getElementById('superUsersList');
    if (!container) return;
    if (!users.length) {
      container.innerHTML = '<p>Nenhum usuário encontrado.</p>';
      return;
    }

    const rows = users.map(user => ({
      data: user,
      cells: [user.username, user.role, user.status, user.escola || user.empresa_id || '—']
    }));

    container.innerHTML = '';
    container.appendChild(buildTable(
      ['Usuário', 'Role', 'Status', 'Escola'],
      rows,
      [
        {
          label: user => (user.role === 'usuario' ? 'Promover Admin' : 'Rebaixar para Usuário'),
          className: 'btn btn-secondary',
          onClick: async (user) => {
            const newRole = user.role === 'usuario' ? 'admin' : 'usuario';
            await changeUserRole(user.id, newRole);
            loadSuperAdminUsers();
          }
        }
      ]
    ));
  } catch (error) {
    renderMessage('superUsersMessage', error.message || 'Erro ao carregar usuários.');
  }
}

async function changeUserRole(id, role) {
  try {
    await apiFetch(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  } catch (error) {
    renderMessage('superUsersMessage', error.message || 'Erro ao atualizar role.');
  }
}

function initializePage() {
  const path = window.location.pathname;
  if (path.endsWith('/index.html') || path === '/' || path.endsWith('/login')) {
    initializeLoginPage();
  } else if (path.endsWith('/createUser.html')) {
    initializeRegisterPage();
  } else if (path.endsWith('/dashboard.html')) {
    initializeDashboardPage();
  } else if (path.endsWith('/admin.html')) {
    initializeAdminPage();
  } else if (path.endsWith('/superadmin.html')) {
    initializeSuperAdminPage();
  }
}

window.addEventListener('DOMContentLoaded', initializePage);
