/**
 * Sistema de Reservas de Salas – Versão Front-End
 * Armazena dados em localStorage (nenhum back-end necessário).
 * Funciona direto no GitHub Pages.
 */

/* ========== Funções utilitárias ========== */
function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}
function carregar(chave) {
  return JSON.parse(localStorage.getItem(chave) || "[]");
}
function exibirMensagem(texto, tipo = "primary") {
  // cria um alerta temporário no topo da página
  const alert = document.createElement("div");
  alert.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
  alert.style.zIndex = "9999";
  alert.textContent = texto;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 2500);
}

/* ========== Referências aos elementos ========== */
const formSala = document.getElementById("formSala");
const formReserva = document.getElementById("formReserva");
const listaSalas = document.getElementById("listaSalas");
const listaReservas = document.getElementById("listaReservas");
const selectSalaReserva = document.getElementById("salaReserva");

/* ========== Renderização das listas ========== */
function atualizarSalas() {
  const salas = carregar("salas");
  listaSalas.innerHTML = "";
  selectSalaReserva.innerHTML = "";

  if (salas.length === 0) {
    listaSalas.innerHTML =
      '<li class="list-group-item text-muted">Nenhuma sala cadastrada.</li>';
  }

  salas.forEach((sala, idx) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${sala.nome}</strong>
        <small class="d-block text-muted">Capacidade: ${sala.capacidade}</small>
      </div>
      <button class="btn btn-sm btn-outline-danger" title="Excluir sala">
        <i class="bi bi-trash"></i>
      </button>
    `;

    // excluir sala + reservas relacionadas
    li.querySelector("button").onclick = () => {
      if (!confirm(`Excluir a sala "${sala.nome}"?`)) return;
      salas.splice(idx, 1);
      salvar("salas", salas);

      // remove reservas dessa sala
      const reservas = carregar("reservas").filter(r => r.sala !== sala.nome);
      salvar("reservas", reservas);

      atualizarSalas();
      atualizarReservas();
      exibirMensagem("Sala excluída", "warning");
    };

    listaSalas.appendChild(li);

    // adiciona sala ao <select> de reservas
    const opt = document.createElement("option");
    opt.value = sala.nome;
    opt.textContent = sala.nome;
    selectSalaReserva.appendChild(opt);
  });
}

function atualizarReservas() {
  const reservas = carregar("reservas");
  listaReservas.innerHTML = "";

  if (reservas.length === 0) {
    listaReservas.innerHTML =
      '<li class="list-group-item text-muted">Nenhuma reserva criada.</li>';
  }

  reservas.forEach((r, i) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${r.sala}</strong>
        <small class="d-block text-muted">
          ${r.data} — ${r.inicio} às ${r.fim}
        </small>
      </div>
      <button class="btn btn-sm btn-outline-danger" title="Cancelar reserva">
        <i class="bi bi-x-circle"></i>
      </button>
    `;

    li.querySelector("button").onclick = () => {
      if (!confirm("Cancelar esta reserva?")) return;
      reservas.splice(i, 1);
      salvar("reservas", reservas);
      atualizarReservas();
      exibirMensagem("Reserva cancelada", "warning");
    };

    listaReservas.appendChild(li);
  });
}

/* ========== Eventos ========== */
formSala.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nomeSala").value.trim();
  const capacidade = document.getElementById("capacidadeSala").value.trim();

  if (!nome || !capacidade) return;

  const salas = carregar("salas");
  salas.push({ nome, capacidade: parseInt(capacidade, 10) });
  salvar("salas", salas);

  formSala.reset();
  atualizarSalas();
  exibirMensagem("Sala cadastrada com sucesso", "success");
});

formReserva.addEventListener("submit", (e) => {
  e.preventDefault();

  const sala = selectSalaReserva.value;
  const data = document.getElementById("dataReserva").value;
  const inicio = document.getElementById("horaInicio").value;
  const fim = document.getElementById("horaFim").value;

  if (!sala || !data || !inicio || !fim) return;

  // verifica conflito de horários para a mesma sala
  const reservas = carregar("reservas");
  const conflito = reservas.some(
    (r) =>
      r.sala === sala &&
      r.data === data &&
      !(r.fim <= inicio || r.inicio >= fim)
  );

  if (conflito) {
    exibirMensagem("Conflito: já existe reserva nesse horário.", "danger");
    return;
  }

  reservas.push({ sala, data, inicio, fim });
  salvar("reservas", reservas);

  formReserva.reset();
  atualizarReservas();
  exibirMensagem("Reserva criada com sucesso", "success");
});

/* ========== Inicialização ========== */
atualizarSalas();
atualizarReservas();

