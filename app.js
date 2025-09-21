/ --- utilidades ---
function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}
function carregar(chave) {
  return JSON.parse(localStorage.getItem(chave) || "[]");
}

// --- elementos DOM ---
const formSala = document.getElementById("formSala");
const formReserva = document.getElementById("formReserva");
const listaSalas = document.getElementById("listaSalas");
const listaReservas = document.getElementById("listaReservas");
const selectSalaReserva = document.getElementById("salaReserva");

// --- renderizações ---
function atualizarSalas() {
  const salas = carregar("salas");
  listaSalas.innerHTML = "";
  selectSalaReserva.innerHTML = "";
  salas.forEach((sala, idx) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<strong>${sala.nome}</strong> 
                    <small>Capacidade: ${sala.capacidade}</small>
                    <button class="btn btn-sm btn-outline-danger">Excluir</button>`;
    li.querySelector("button").onclick = () => {
      salas.splice(idx, 1);
      salvar("salas", salas);
      atualizarSalas();
      atualizarReservas(); // remove reservas ligadas à sala
    };
    listaSalas.appendChild(li);

    const opt = document.createElement("option");
    opt.value = sala.nome;
    opt.textContent = sala.nome;
    selectSalaReserva.appendChild(opt);
  });
}

function atualizarReservas() {
  const reservas = carregar("reservas");
  listaReservas.innerHTML = "";
  reservas.forEach((r, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `<div>
        <strong>${r.sala}</strong> – ${r.data}
        <small>${r.inicio} às ${r.fim}</small>
      </div>
      <button class="btn btn-sm btn-outline-danger">Cancelar</button>`;
    li.querySelector("button").onclick = () => {
      reservas.splice(i, 1);
      salvar("reservas", reservas);
      atualizarReservas();
    };
    listaReservas.appendChild(li);
  });
}

// --- eventos ---
formSala.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nomeSala").value.trim();
  const capacidade = document.getElementById("capacidadeSala").value.trim();
  if (!nome || !capacidade) return;
  const salas = carregar("salas");
  salas.push({ nome, capacidade });
  salvar("salas", salas);
  formSala.reset();
  atualizarSalas();
});

formReserva.addEventListener("submit", (e) => {
  e.preventDefault();
  const sala = selectSalaReserva.value;
  const data = document.getElementById("dataReserva").value;
  const inicio = document.getElementById("horaInicio").value;
  const fim = document.getElementById("horaFim").value;

  if (!sala || !data || !inicio || !fim) return;

  // Checar conflito
  const reservas = carregar("reservas");
  const conflito = reservas.some(r =>
    r.sala === sala && r.data === data &&
    !(r.fim <= inicio || r.inicio >= fim)
  );
  if (conflito) {
    alert("Conflito: já existe reserva nessa sala/horário.");
    return;
  }

  reservas.push({ sala, data, inicio, fim });
  salvar("reservas", reservas);
  formReserva.reset();
  atualizarReservas();
});

// --- inicialização ---
atualizarSalas();
atualizarReservas();
