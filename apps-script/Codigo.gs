/**
 * Do Lixo à Luz: backend no Google Sheets (Apps Script)
 *
 * Como instalar (passo a passo completo no README do repositório):
 * 1. Crie uma planilha no Google Sheets e abra Extensões > Apps Script.
 * 2. Cole este arquivo inteiro no lugar do código que aparece lá.
 * 3. Escolha a função "configurar" no menu de cima e clique em Executar.
 *    Ela cria as abas e mostra no registro a chave do painel do(a) professor(a).
 * 4. Implantar > Nova implantação > App da Web
 *    Executar como: Eu | Quem pode acessar: Qualquer pessoa
 * 5. Copie a URL que termina em /exec e cole no jogo.
 *
 * Os estudantes só conseguem GRAVAR o próprio progresso.
 * Para LER a turma inteira, o painel precisa da chave do(a) professor(a).
 */

const ABA_ALUNOS = 'Alunos';
const ABA_FASES = 'Fases concluídas';
const CAB_ALUNOS = ['ID', 'Nome', 'Turma', 'Avatar', 'XP', 'Nível', 'F1 %', 'F2 %', 'F3 %', 'F4 %', 'F5 %', 'F6 %', 'Estrelas', 'Missões', 'Último acesso', 'Dados do jogo (não editar)'];
const CAB_FASES = ['Data e hora', 'ID', 'Nome', 'Turma', 'Fase', 'Acerto %', 'Estrelas', 'Tentativa'];
const NOMES_FASES = ['', 'Conhecer os resíduos', 'Destinação correta', 'Potencial energético', 'Rotas de conversão', 'Combustíveis e produtos', 'Leito fluidizado e CFD'];
const NIVEIS = [[0, 'Aprendiz da Reciclagem'], [120, 'Separador(a) Expert'], [300, 'Caçador(a) de Energia'], [500, 'Engenheiro(a) de Conversão'], [700, 'Mestre do Leito Fluidizado'], [880, 'Cientista Do Lixo à Luz']];

/** Rode uma vez pelo editor: cria as abas e a chave do painel. */
function configurar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  prepararAba_(ss, ABA_ALUNOS, CAB_ALUNOS);
  prepararAba_(ss, ABA_FASES, CAB_FASES);
  const props = PropertiesService.getScriptProperties();
  let chave = props.getProperty('CHAVE_PROFESSOR');
  if (!chave) {
    chave = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
    props.setProperty('CHAVE_PROFESSOR', chave);
  }
  Logger.log('Pronto! Chave do painel do(a) professor(a): ' + chave);
  Logger.log('Para trocar a chave: Configurações do projeto > Propriedades do script > CHAVE_PROFESSOR.');
}

function doGet() {
  return resposta_({ ok: true, app: 'dolixoaluz' });
}

function doPost(e) {
  let corpo;
  try {
    corpo = JSON.parse(e.postData.contents);
  } catch (err) {
    return resposta_({ ok: false, erro: 'Pedido inválido.' });
  }
  const trava = LockService.getScriptLock();
  try {
    trava.waitLock(20000);
    if (corpo.acao === 'salvar') {
      const aluno = limparAluno_(corpo.aluno);
      if (!aluno) return resposta_({ ok: false, erro: 'Dados do estudante inválidos.' });
      salvarAluno_(aluno);
      (Array.isArray(corpo.fases) ? corpo.fases.slice(0, 30) : []).forEach(function (f) { registrarFase_(aluno, f); });
      return resposta_({ ok: true });
    }
    if (corpo.acao === 'listar') {
      if (!chaveOk_(corpo.chave)) return resposta_({ ok: false, erro: 'chave' });
      return resposta_({ ok: true, alunos: listarAlunos_() });
    }
    if (corpo.acao === 'testar') {
      return resposta_({ ok: true, chave: chaveOk_(corpo.chave) });
    }
    return resposta_({ ok: false, erro: 'Ação desconhecida.' });
  } catch (err) {
    return resposta_({ ok: false, erro: String(err) });
  } finally {
    trava.releaseLock();
  }
}

/* ---------- gravação ---------- */

function salvarAluno_(a) {
  const aba = prepararAba_(SpreadsheetApp.getActiveSpreadsheet(), ABA_ALUNOS, CAB_ALUNOS);
  const ultima = aba.getLastRow();
  let alvo = 0;
  if (ultima > 1) {
    const ids = aba.getRange(2, 1, ultima - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (ids[i][0] === a.id) { alvo = i + 2; break; }
  }
  // mantém o melhor resultado já gravado, caso o estudante tenha jogado em outro computador
  if (alvo) {
    try { unirAluno_(a, limparAluno_(JSON.parse(aba.getRange(alvo, CAB_ALUNOS.length).getValue()))); } catch (err) {}
  }

  let xp = Object.keys(a.phases).reduce(function (s, k) { return s + a.phases[k].xp; }, 0);
  const missoes = Object.keys(a.missions).filter(function (k) { return a.missions[k]; }).length;
  xp += missoes * 15;
  let nivel = NIVEIS[0][1];
  NIVEIS.forEach(function (n) { if (xp >= n[0]) nivel = n[1]; });
  const pct = [1, 2, 3, 4, 5, 6].map(function (f) { const p = a.phases[f]; return p ? Math.round(p.best * 100) : ''; });
  const estrelas = Object.keys(a.phases).reduce(function (s, k) { return s + a.phases[k].stars; }, 0);
  const linha = [a.id, texto_(a.name), texto_(a.turma), a.avatar, xp, nivel].concat(pct, [estrelas, missoes + '/3', a.last ? new Date(a.last) : '', JSON.stringify(a)]);
  if (alvo) aba.getRange(alvo, 1, 1, linha.length).setValues([linha]);
  else aba.appendRow(linha);
}

/** Copia para "novo" tudo o que "antigo" tinha de melhor. */
function unirAluno_(novo, antigo) {
  if (!antigo) return;
  Object.keys(antigo.phases).forEach(function (k) {
    const p = antigo.phases[k], q = novo.phases[k];
    if (!q) { novo.phases[k] = p; return; }
    novo.phases[k] = { xp: Math.max(p.xp, q.xp), stars: Math.max(p.stars, q.stars), best: Math.max(p.best, q.best), attempts: Math.max(p.attempts, q.attempts), last: q.last, at: Math.max(p.at, q.at) };
  });
  Object.keys(antigo.missions).forEach(function (k) { if (antigo.missions[k]) novo.missions[k] = true; });
  ['seen', 'errors'].forEach(function (c) {
    Object.keys(antigo[c]).forEach(function (k) { novo[c][k] = Math.max(antigo[c][k], novo[c][k] || 0); });
  });
  novo.created = Math.min(novo.created || antigo.created, antigo.created || novo.created);
  novo.last = Math.max(novo.last, antigo.last);
}

function registrarFase_(a, f) {
  if (!f) return;
  const fase = parseInt(f.fase, 10);
  if (!(fase >= 1 && fase <= 6)) return;
  const aba = prepararAba_(SpreadsheetApp.getActiveSpreadsheet(), ABA_FASES, CAB_FASES);
  aba.appendRow([new Date(), a.id, texto_(a.name), texto_(a.turma), fase + ' · ' + NOMES_FASES[fase], Math.round(num_(f.acerto, 0, 1) * 100), num_(f.estrelas, 0, 3), num_(f.tentativa, 0, 9999)]);
}

/* ---------- leitura ---------- */

function listarAlunos_() {
  const aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_ALUNOS);
  if (!aba || aba.getLastRow() < 2) return [];
  return aba.getRange(2, CAB_ALUNOS.length, aba.getLastRow() - 1, 1).getValues()
    .map(function (l) { try { return JSON.parse(l[0]); } catch (err) { return null; } })
    .filter(Boolean);
}

/* ---------- validação ---------- */

function limparAluno_(x) {
  if (!x || typeof x.id !== 'string' || !x.id || x.id.length > 90 || !x.name) return null;
  const a = {
    id: x.id, name: String(x.name).slice(0, 40), turma: String(x.turma || '').slice(0, 24), avatar: String(x.avatar || '').slice(0, 16),
    phases: {}, missions: {}, seen: {}, errors: {}, created: num_(x.created, 0, 4e12), last: num_(x.last, 0, 4e12)
  };
  [1, 2, 3, 4, 5, 6].forEach(function (f) {
    const p = x.phases && x.phases[f];
    if (!p) return;
    a.phases[f] = { xp: num_(p.xp, 0, 300), stars: num_(p.stars, 0, 3), best: num_(p.best, 0, 1), attempts: num_(p.attempts, 0, 9999), last: num_(p.last, 0, 1), at: num_(p.at, 0, 4e12) };
  });
  ['fixo', 'borb', 'arraste'].forEach(function (k) { if (x.missions && x.missions[k]) a.missions[k] = true; });
  ['seen', 'errors'].forEach(function (c) {
    Object.keys(x[c] || {}).slice(0, 300).forEach(function (k) {
      if (/^f[1-6]-[a-z0-9-]{1,40}$/.test(k)) a[c][k] = num_(x[c][k], 0, 9999);
    });
  });
  return a;
}

function num_(v, min, max) {
  const n = Number(v);
  return isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
}

// impede que um nome começando com = + - @ vire fórmula na planilha
function texto_(s) {
  s = String(s || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function chaveOk_(chave) {
  const certa = PropertiesService.getScriptProperties().getProperty('CHAVE_PROFESSOR');
  return !!certa && chave === certa;
}

function prepararAba_(ss, nome, cab) {
  let aba = ss.getSheetByName(nome);
  if (!aba) aba = ss.insertSheet(nome);
  if (aba.getLastRow() === 0) {
    aba.appendRow(cab);
    aba.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#0A9A68').setFontColor('#FFFFFF');
    aba.setFrozenRows(1);
  }
  return aba;
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
