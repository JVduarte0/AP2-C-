/**
 * LOCADORA DE VEÍCULOS - INTEGRAÇÃO COM API REST (JS PURO)
 * 
 * Conecta o frontend às rotas da API em ASP.NET Core:
 * - GET    /api/veiculos       (Listar todos)
 * - GET    /api/veiculos/{id}  (Buscar por ID)
 * - POST   /api/veiculos       (Cadastrar veículo)
 * - PUT    /api/veiculos/{id}  (Atualizar veículo)
 * - DELETE /api/veiculos/{id}  (Remover veículo)
 */

'use strict';

// -----------------------------------------------------------------------------
// CONFIGURAÇÕES E ESTADO DA APLICAÇÃO
// -----------------------------------------------------------------------------
const API_URL = '/api/veiculos';

let veiculos = [];
let veiculoEmEdicaoId = null;

// -----------------------------------------------------------------------------
// SELETORES DO DOM
// -----------------------------------------------------------------------------
const form = document.getElementById('veiculo-form');
const inputId = document.getElementById('veiculo-id');
const inputMarca = document.getElementById('campo-marca');
const inputModelo = document.getElementById('campo-modelo');
const inputAno = document.getElementById('campo-ano');
const inputPlaca = document.getElementById('campo-placa');
const inputDiaria = document.getElementById('campo-diaria');
const selectDisponivel = document.getElementById('campo-disponivel');

const formTitle = document.getElementById('form-title');
const formBadge = document.getElementById('form-badge');
const btnSubmit = document.getElementById('btn-submit');
const btnCancelar = document.getElementById('btn-cancelar');
const btnLimpar = document.getElementById('btn-limpar');
const btnRecarregar = document.getElementById('btn-recarregar-dados');

const listaVeiculosEl = document.getElementById('lista-veiculos');
const emptyStateEl = document.getElementById('empty-state');
const filtroBusca = document.getElementById('filtro-busca');
const filtroStatus = document.getElementById('filtro-status');

// Indicador de Status da API
const apiStatusIndicator = document.getElementById('api-status-indicator');
const apiStatusText = document.getElementById('api-status-text');

// Métricas
const metricTotal = document.getElementById('metric-total');
const metricDisponiveis = document.getElementById('metric-disponiveis');
const metricLocados = document.getElementById('metric-locados');
const metricMedia = document.getElementById('metric-media');

// Modal
const modal = document.getElementById('modal-detalhes');
const modalConteudo = document.getElementById('modal-conteudo');
const modalBackdrop = document.getElementById('modal-backdrop');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnModalFechar = document.getElementById('btn-modal-fechar');
const btnModalEditar = document.getElementById('btn-modal-editar');

// Notificações
const toastContainer = document.getElementById('toast-container');

// -----------------------------------------------------------------------------
// FORMATAÇÕES E UTILITÁRIOS
// -----------------------------------------------------------------------------
function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function sanitizarTexto(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function atualizarStatusApi(conectado, mensagem) {
  if (!apiStatusIndicator || !apiStatusText) return;
  if (conectado) {
    apiStatusIndicator.style.backgroundColor = '#22c55e';
    apiStatusText.textContent = mensagem || 'API Conectada';
  } else {
    apiStatusIndicator.style.backgroundColor = '#ef4444';
    apiStatusText.textContent = mensagem || 'API Desconectada';
  }
}

// -----------------------------------------------------------------------------
// SISTEMA DE NOTIFICAÇÕES (TOASTS)
// -----------------------------------------------------------------------------
function mostrarToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;

  const icones = {
    success: '✅',
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <span aria-hidden="true">${icones[tipo] || 'ℹ️'}</span>
      <span>${sanitizarTexto(mensagem)}</span>
    </div>
    <button type="button" class="toast-fechar" aria-label="Fechar notificação">&times;</button>
  `;

  const btnFechar = toast.querySelector('.toast-fechar');
  btnFechar.addEventListener('click', () => toast.remove());

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 4000);
}

// -----------------------------------------------------------------------------
// ATUALIZAÇÃO DE MÉTRICAS
// -----------------------------------------------------------------------------
function atualizarMetricas() {
  const total = veiculos.length;
  const disponiveis = veiculos.filter(v => v.disponivel).length;
  const locados = total - disponiveis;

  const somaDiarias = veiculos.reduce((acc, curr) => acc + Number(curr.valorDiaria || 0), 0);
  const media = total > 0 ? somaDiarias / total : 0;

  metricTotal.textContent = total;
  metricDisponiveis.textContent = disponiveis;
  metricLocados.textContent = locados;
  metricMedia.textContent = formatarMoeda(media);
}

// -----------------------------------------------------------------------------
// COMUNICAÇÃO COM A API REST (CRUD)
// -----------------------------------------------------------------------------

/**
 * GET /api/veiculos — Lista todos os veículos do banco SQLite
 */
async function carregarVeiculos() {
  try {
    const resposta = await fetch(API_URL);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ao carregar veículos: ${resposta.status}`);
    }

    veiculos = await resposta.json();
    atualizarStatusApi(true, 'API Conectada');
    renderizarVeiculos();
  } catch (erro) {
    console.error('Falha ao obter veículos:', erro);
    atualizarStatusApi(false, 'API Indisponível');
    mostrarToast('Não foi possível conectar à API de veículos.', 'danger');
    renderizarVeiculos();
  }
}

/**
 * GET /api/veiculos/{id} — Busca detalhes de um veículo específico por ID
 */
async function buscarVeiculoPorId(id) {
  try {
    const resposta = await fetch(`${API_URL}/${id}`);
    if (resposta.status === 404) {
      mostrarToast(`Veículo #${id} não foi encontrado na base de dados.`, 'warning');
      return null;
    }
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
    return await resposta.json();
  } catch (erro) {
    console.error(`Erro ao buscar veículo #${id}:`, erro);
    mostrarToast('Falha na comunicação com a API ao consultar veículo.', 'danger');
    return null;
  }
}

// -----------------------------------------------------------------------------
// RENDERIZAÇÃO DA LISTA DE VEÍCULOS
// -----------------------------------------------------------------------------
function renderizarVeiculos() {
  const termo = filtroBusca.value.trim().toLowerCase();
  const statusFiltro = filtroStatus.value;

  const veiculosFiltrados = veiculos.filter(veiculo => {
    const correspondeBusca =
      (veiculo.marca || '').toLowerCase().includes(termo) ||
      (veiculo.modelo || '').toLowerCase().includes(termo) ||
      (veiculo.placa || '').toLowerCase().includes(termo);

    const correspondeStatus =
      statusFiltro === 'todos' ||
      (statusFiltro === 'disponivel' && veiculo.disponivel === true) ||
      (statusFiltro === 'indisponivel' && veiculo.disponivel === false);

    return correspondeBusca && correspondeStatus;
  });

  listaVeiculosEl.innerHTML = '';

  if (veiculosFiltrados.length === 0) {
    emptyStateEl.classList.remove('is-hidden');
  } else {
    emptyStateEl.classList.add('is-hidden');

    veiculosFiltrados.forEach(veiculo => {
      const card = document.createElement('article');
      card.className = `veiculo-card ${veiculo.id === veiculoEmEdicaoId ? 'em-edicao' : ''}`;
      card.setAttribute('data-id', veiculo.id);

      const statusBadge = veiculo.disponivel
        ? '<span class="badge badge-success">Disponível</span>'
        : '<span class="badge badge-warning">Locado</span>';

      card.innerHTML = `
        <div>
          <div class="veiculo-header">
            <div>
              <span class="veiculo-marca">${sanitizarTexto(veiculo.marca)}</span>
              <h3 class="veiculo-titulo">${sanitizarTexto(veiculo.modelo)}</h3>
            </div>
            ${statusBadge}
          </div>

          <div class="veiculo-specs">
            <span class="spec-item"><strong>Ano:</strong> ${veiculo.ano}</span>
            <span class="spec-item"><strong>Placa:</strong> ${sanitizarTexto(veiculo.placa)}</span>
            <span class="spec-item"><strong>ID:</strong> #${veiculo.id}</span>
          </div>

          <div class="veiculo-preco">
            <span class="preco-label">Valor por diária:</span>
            <span class="preco-valor">${formatarMoeda(veiculo.valorDiaria)}</span>
          </div>
        </div>

        <div class="veiculo-acoes">
          <button 
            type="button" 
            class="btn btn-outline btn-sm btn-ver-detalhes" 
            data-id="${veiculo.id}"
            aria-label="Ver detalhes de ${sanitizarTexto(veiculo.modelo)}"
          >
            👁️ Ver
          </button>
          <button 
            type="button" 
            class="btn btn-secondary btn-sm btn-editar" 
            data-id="${veiculo.id}"
            aria-label="Editar ${sanitizarTexto(veiculo.modelo)}"
          >
            ✏️ Editar
          </button>
          <button 
            type="button" 
            class="btn btn-danger btn-sm btn-excluir" 
            data-id="${veiculo.id}"
            aria-label="Excluir ${sanitizarTexto(veiculo.modelo)}"
          >
            🗑️ Excluir
          </button>
        </div>
      `;

      card.querySelector('.btn-ver-detalhes').addEventListener('click', () => abrirModalDetalhes(veiculo.id));
      card.querySelector('.btn-editar').addEventListener('click', () => iniciarEdicao(veiculo.id));
      card.querySelector('.btn-excluir').addEventListener('click', () => confirmarExclusao(veiculo.id));

      listaVeiculosEl.appendChild(card);
    });
  }

  atualizarMetricas();
}

// -----------------------------------------------------------------------------
// OPERAÇÕES DO FORMULÁRIO (VALIDAÇÃO E ENVIO)
// -----------------------------------------------------------------------------
function limparErros() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function exibirErroCampo(campoId, mensagem) {
  const campo = document.getElementById(campoId);
  const erroEl = document.getElementById(`erro-${campoId.replace('campo-', '')}`);
  if (campo) campo.classList.add('input-error');
  if (erroEl) erroEl.textContent = mensagem;
}

function validarFormulario() {
  limparErros();
  let valido = true;

  const marca = inputMarca.value.trim();
  const modelo = inputModelo.value.trim();
  const ano = parseInt(inputAno.value, 10);
  const placa = inputPlaca.value.trim();
  const diaria = parseFloat(inputDiaria.value);

  if (!marca) {
    exibirErroCampo('campo-marca', 'Por favor, informe a marca.');
    valido = false;
  }

  if (!modelo) {
    exibirErroCampo('campo-modelo', 'Por favor, informe o modelo.');
    valido = false;
  }

  if (isNaN(ano) || ano < 1950 || ano > 2035) {
    exibirErroCampo('campo-ano', 'Informe um ano válido entre 1950 e 2035.');
    valido = false;
  }

  if (!placa || placa.length < 5) {
    exibirErroCampo('campo-placa', 'Informe uma placa válida (ex.: ABC1D23).');
    valido = false;
  }

  if (isNaN(diaria) || diaria <= 0) {
    exibirErroCampo('campo-diaria', 'Informe uma diária maior que zero.');
    valido = false;
  }

  return valido;
}

function limparFormulario() {
  form.reset();
  inputId.value = '';
  veiculoEmEdicaoId = null;
  formTitle.textContent = 'Cadastrar Novo Veículo';
  formBadge.textContent = 'Modo Adição';
  formBadge.className = 'badge';
  btnSubmit.innerHTML = '<span aria-hidden="true">➕</span> Adicionar Veículo';
  btnSubmit.disabled = false;
  btnCancelar.classList.add('is-hidden');
  limparErros();
  renderizarVeiculos();
}

/**
 * Prepara o formulário para edição buscando dados atualizados da API
 */
async function iniciarEdicao(id) {
  const veiculo = await buscarVeiculoPorId(id) || veiculos.find(v => v.id === id);
  if (!veiculo) return;

  veiculoEmEdicaoId = id;
  inputId.value = veiculo.id;
  inputMarca.value = veiculo.marca;
  inputModelo.value = veiculo.modelo;
  inputAno.value = veiculo.ano;
  inputPlaca.value = veiculo.placa;
  inputDiaria.value = veiculo.valorDiaria;
  selectDisponivel.value = veiculo.disponivel.toString();

  formTitle.textContent = `Editar Veículo #${veiculo.id}`;
  formBadge.textContent = 'Modo Edição';
  formBadge.className = 'badge badge-warning';
  btnSubmit.innerHTML = '<span aria-hidden="true">💾</span> Salvar Alterações';
  btnCancelar.classList.remove('is-hidden');

  limparErros();
  renderizarVeiculos();

  inputMarca.focus();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * POST /api/veiculos ou PUT /api/veiculos/{id}
 */
async function salvarVeiculo(e) {
  e.preventDefault();

  if (!validarFormulario()) {
    mostrarToast('Por favor, corrija os erros apontados no formulário.', 'warning');
    return;
  }

  const payload = {
    marca: inputMarca.value.trim(),
    modelo: inputModelo.value.trim(),
    ano: parseInt(inputAno.value, 10),
    placa: inputPlaca.value.trim().toUpperCase(),
    valorDiaria: parseFloat(inputDiaria.value),
    disponivel: selectDisponivel.value === 'true'
  };

  btnSubmit.disabled = true;
  const textoOriginalBtn = btnSubmit.innerHTML;
  btnSubmit.innerHTML = 'Salvando...';

  try {
    if (veiculoEmEdicaoId !== null) {
      // PUT — Atualização
      const resposta = await fetch(`${API_URL}/${veiculoEmEdicaoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao atualizar veículo: status ${resposta.status}`);
      }

      const veiculoAtualizado = await resposta.json();
      mostrarToast(`Veículo "${veiculoAtualizado.marca} ${veiculoAtualizado.modelo}" atualizado com sucesso!`, 'success');
    } else {
      // POST — Cadastro
      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (resposta.status !== 201 && !resposta.ok) {
        throw new Error(`Falha ao cadastrar veículo: status ${resposta.status}`);
      }

      const veiculoCadastrado = await resposta.json();
      mostrarToast(`Veículo "${veiculoCadastrado.marca} ${veiculoCadastrado.modelo}" cadastrado com sucesso!`, 'success');
    }

    limparFormulario();
    await carregarVeiculos();
  } catch (erro) {
    console.error('Erro ao salvar veículo:', erro);
    mostrarToast('Erro ao salvar os dados do veículo na API. Verifique a conexão.', 'danger');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = textoOriginalBtn;
  }
}

/**
 * DELETE /api/veiculos/{id} — Remove veículo da base de dados
 */
async function confirmarExclusao(id) {
  const veiculo = veiculos.find(v => v.id === id);
  const descricao = veiculo ? `${veiculo.marca} ${veiculo.modelo}` : `#${id}`;

  const confirmacao = window.confirm(
    `Tem certeza que deseja excluir o veículo "${descricao}" (ID #${id}) da base de dados? Esta ação não pode ser desfeita.`
  );

  if (!confirmacao) return;

  try {
    const resposta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (resposta.status !== 204 && !resposta.ok) {
      throw new Error(`Erro ao excluir veículo: status ${resposta.status}`);
    }

    mostrarToast(`Veículo #${id} excluído com sucesso do banco de dados!`, 'danger');

    if (veiculoEmEdicaoId === id) {
      limparFormulario();
    }

    await carregarVeiculos();
  } catch (erro) {
    console.error(`Erro ao excluir veículo #${id}:`, erro);
    mostrarToast('Erro ao tentar remover o veículo na API.', 'danger');
  }
}

// -----------------------------------------------------------------------------
// MODAL DE DETALHES DO VEÍCULO (GET /api/veiculos/{id})
// -----------------------------------------------------------------------------
let idVeiculoVisualizado = null;

async function abrirModalDetalhes(id) {
  idVeiculoVisualizado = id;

  // Busca os dados atualizados diretamente da API
  const veiculo = await buscarVeiculoPorId(id) || veiculos.find(v => v.id === id);
  if (!veiculo) return;

  const statusBadge = veiculo.disponivel
    ? '<span class="badge badge-success">Disponível para Locação</span>'
    : '<span class="badge badge-warning">Locado / Indisponível</span>';

  modalConteudo.innerHTML = `
    <div class="detalhes-grid">
      <div class="detalhe-item">
        <span class="detalhe-rotulo">ID do Registro</span>
        <span class="detalhe-valor">#${veiculo.id}</span>
      </div>
      <div class="detalhe-item">
        <span class="detalhe-rotulo">Status</span>
        <div>${statusBadge}</div>
      </div>
      <div class="detalhe-item">
        <span class="detalhe-rotulo">Marca</span>
        <span class="detalhe-valor">${sanitizarTexto(veiculo.marca)}</span>
      </div>
      <div class="detalhe-item">
        <span class="detalhe-rotulo">Modelo</span>
        <span class="detalhe-valor">${sanitizarTexto(veiculo.modelo)}</span>
      </div>
      <div class="detalhe-item">
        <span class="detalhe-rotulo">Ano de Fabricação</span>
        <span class="detalhe-valor">${veiculo.ano}</span>
      </div>
      <div class="detalhe-item">
        <span class="detalhe-rotulo">Placa</span>
        <span class="detalhe-valor">${sanitizarTexto(veiculo.placa)}</span>
      </div>
      <div class="detalhe-item full-width">
        <span class="detalhe-rotulo">Valor da Diária de Locação</span>
        <span class="detalhe-valor text-success" style="font-size:1.4rem;">${formatarMoeda(veiculo.valorDiaria)}</span>
      </div>
    </div>
  `;

  modal.classList.remove('is-hidden');
  btnFecharModal.focus();
}

function fecharModalDetalhes() {
  modal.classList.add('is-hidden');
  idVeiculoVisualizado = null;
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS & INICIALIZAÇÃO
// -----------------------------------------------------------------------------
form.addEventListener('submit', salvarVeiculo);
btnCancelar.addEventListener('click', limparFormulario);
btnLimpar.addEventListener('click', limparFormulario);

if (btnRecarregar) {
  btnRecarregar.addEventListener('click', async () => {
    await carregarVeiculos();
    mostrarToast('Catálogo de veículos atualizado da API.', 'info');
  });
}

filtroBusca.addEventListener('input', renderizarVeiculos);
filtroStatus.addEventListener('change', renderizarVeiculos);

// Eventos do Modal
btnFecharModal.addEventListener('click', fecharModalDetalhes);
btnModalFechar.addEventListener('click', fecharModalDetalhes);
modalBackdrop.addEventListener('click', fecharModalDetalhes);

btnModalEditar.addEventListener('click', () => {
  const id = idVeiculoVisualizado;
  fecharModalDetalhes();
  if (id) {
    iniciarEdicao(id);
  }
});

// Fechar modal com tecla ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('is-hidden')) {
    fecharModalDetalhes();
  }
});

// Inicialização conectando à API
document.addEventListener('DOMContentLoaded', () => {
  carregarVeiculos();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  carregarVeiculos();
}
