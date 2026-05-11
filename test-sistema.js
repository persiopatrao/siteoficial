const http = require('http');
const PORT = process.env.PORT || 3000;

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    let body = '';
    const req = http.request(options, (res) => {
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          TESTE COMPLETO DO SISTEMA DE OCORRÊNCIAS          ║');
  console.log('║                  (VERSÃO CORRIGIDA)                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // ========== LOGIN TESTS ==========
  console.log('🔐 TESTES DE AUTENTICAÇÃO\n');
  
  console.log('1️⃣  LOGIN - Super Admin (Rafa.admin)');
  let res = await request('POST', '/api/auth/login', {username: 'Rafa.admin', password: '123', empresa_id: 1});
  let rafiToken = null;
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Role: ' + res.data.role);
    rafiToken = res.data.token;
  } else {
    console.log('   ❌ Erro: ' + res.status + ' - ' + JSON.stringify(res.data));
  }
  
  console.log('\n2️⃣  LOGIN - Admin (lucas.usuario)');
  res = await request('POST', '/api/auth/login', {username: 'lucas.usuario', password: '123', empresa_id: 1});
  let lucasToken = null;
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Role: ' + res.data.role);
    lucasToken = res.data.token;
  } else {
    console.log('   ❌ Erro: ' + res.status + ' - ' + JSON.stringify(res.data));
  }
  
  console.log('\n3️⃣  LOGIN - Usuário Regular (junior.usuario)');
  res = await request('POST', '/api/auth/login', {username: 'junior.usuario', password: '123', empresa_id: 1});
  let juniorToken = null;
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Role: ' + res.data.role);
    juniorToken = res.data.token;
  } else {
    console.log('   ❌ Erro: ' + res.status + ' - ' + JSON.stringify(res.data));
  }
  
  // ========== USER MANAGEMENT ==========
  console.log('\n👥 TESTES DE GERENCIAMENTO DE USUÁRIOS\n');
  
  console.log('4️⃣  Listar Todos os Usuários');
  res = await request('GET', '/api/users', null, rafiToken);
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    const users = Array.isArray(res.data) ? res.data : res.data.users ? res.data.users : [];
    console.log('   Total: ' + users.length);
    users.forEach(user => console.log('   - ' + user.username + ' (Role: ' + user.role + ', Status: ' + user.status + ')'));
  } else {
    console.log('   ❌ Erro: ' + JSON.stringify(res.data));
  }
  
  console.log('\n5️⃣  Criar Novo Usuário');
  const newUsername = `teste.novo.${Math.floor(Math.random() * 10000)}`;
  res = await request('POST', '/api/users', {
    username: newUsername,
    password: 'senha123',
    role: 'usuario',
    empresa_id: 1
  }, rafiToken);
  if (res.status === 201) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Usuário criado: ' + (res.data.username || 'id ' + res.data.id));
  } else {
    console.log('   Status: ' + res.status);
    console.log('   Response: ' + JSON.stringify(res.data));
  }
  
  console.log('\n6️⃣  Atualizar Status do Usuário (ativar/desativar)');
  res = await request('PUT', '/api/users/3/status', {status: 'aprovado'}, rafiToken);
  console.log('   Status: ' + res.status);
  console.log('   Response: ' + JSON.stringify(res.data));
  
  // ========== INCIDENTS ==========
  console.log('\n📋 TESTES DE OCORRÊNCIAS\n');
  
  console.log('7️⃣  Listar Ocorrências');
  res = await request('GET', '/api/incidents', null, lucasToken);
  if (res.status === 200) {
    const incidentCount = Array.isArray(res.data) ? res.data.length : (res.data.incidents ? res.data.incidents.length : 0);
    console.log('   ✅ Status: ' + res.status);
    console.log('   Total: ' + incidentCount);
  } else {
    console.log('   ❌ Erro: ' + res.status);
  }
  
  console.log('\n8️⃣  Criar Ocorrência');
  res = await request('POST', '/api/incidents', {
    aluno: 'Aluno Teste',
    turma: '5º Ano',
    descricao: 'Descrição do teste automatizado',
    data: '2026-05-05',
    hora: '10:30'
  }, juniorToken);
  if (res.status === 201) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Ocorrência criada: ' + res.data.id);
  } else {
    console.log('   Status: ' + res.status);
    console.log('   Response: ' + JSON.stringify(res.data));
  }
  
  // ========== COMPANIES ==========
  console.log('\n🏫 TESTES DE EMPRESAS\n');
  
  console.log('9️⃣  Listar Empresas');
  res = await request('GET', '/api/empresas', null, rafiToken);
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Total: ' + res.data.length);
    res.data.forEach(emp => console.log('   - ' + emp.nome));
  } else {
    console.log('   ❌ Erro: ' + res.status);
  }
  
  // ========== USER STATS ==========
  console.log('\n📊 TESTES DE ESTATÍSTICAS\n');
  
  console.log('🔟  Obter Estatísticas do Usuário');
  res = await request('GET', '/api/users/stats', null, lucasToken);
  if (res.status === 200) {
    console.log('   ✅ Status: ' + res.status);
    console.log('   Stats: ' + JSON.stringify(res.data));
  } else {
    console.log('   Status: ' + res.status);
    console.log('   Response: ' + JSON.stringify(res.data));
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                   ✅ TESTES CONCLUÍDOS                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

runTests().catch(console.error);
