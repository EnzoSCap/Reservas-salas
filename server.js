const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "./database.db";

app.use(cors());
app.use(express.json());

// Conexão DB
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("Erro ao conectar ao banco:", err);
  else console.log("Banco de dados conectado.");
});

// Criação de tabelas (se não existirem)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            tipo TEXT DEFAULT 'usuario'
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS salas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            capacidade INTEGER NOT NULL,
            recursos TEXT
          )`);

  db.run(`CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER,
            sala_id INTEGER,
            inicio DATETIME,
            fim DATETIME,
            finalidade TEXT,
            status TEXT DEFAULT 'CONFIRMADA',
            FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY(sala_id) REFERENCES salas(id)
          )`);
});

// Rota teste
app.get("/api/ping", (req, res) => res.json({ msg: "ok" }));

// Usuários: registro simples (hash de senha)
app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) return res.status(400).json({ error: "Campos obrigatórios" });

    const hash = await bcrypt.hash(senha, 10);
    db.run(
      "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
      [nome, email, hash],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) return res.status(409).json({ error: "Email já cadastrado" });
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, nome, email });
      }
    );
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Login (exemplo simples — sem JWT)
app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: "Campos obrigatórios" });

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Credenciais inválidas" });

    const match = await bcrypt.compare(senha, row.senha);
    if (!match) return res.status(401).json({ error: "Credenciais inválidas" });

    // Em MVP podemos retornar info do usuário (não retornar a senha)
    const { senha: _, ...user } = row;
    res.json({ user });
  });
});

// Salas
app.get("/api/salas", (req, res) => {
  db.all("SELECT * FROM salas", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/salas", (req, res) => {
  const { nome, capacidade, recursos } = req.body;
  if (!nome || !capacidade) return res.status(400).json({ error: "Campos obrigatórios" });
  db.run("INSERT INTO salas (nome, capacidade, recursos) VALUES (?, ?, ?)", [nome, capacidade, recursos || ""], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, nome, capacidade, recursos });
  });
});

// Reservas: com verificação de conflito (lógica correta)
app.get("/api/reservas", (req, res) => {
  db.all("SELECT * FROM reservas", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/reservas", (req, res) => {
  const { usuario_id, sala_id, inicio, fim, finalidade } = req.body;
  if (!usuario_id || !sala_id || !inicio || !fim) return res.status(400).json({ error: "Campos obrigatórios" });

  // Verificar conflito: existe reserva tal que NÃO (existing.fim <= new.inicio OR existing.inicio >= new.fim)
  const conflitoQuery = `
    SELECT * FROM reservas
    WHERE sala_id = ?
      AND NOT (fim <= ? OR inicio >= ?)
  `;

  db.all(conflitoQuery, [sala_id, inicio, fim], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length > 0) return res.status(409).json({ error: "Horário já reservado", conflicts: rows });

    db.run(
      "INSERT INTO reservas (usuario_id, sala_id, inicio, fim, finalidade) VALUES (?, ?, ?, ?, ?)",
      [usuario_id, sala_id, inicio, fim, finalidade || ""],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, usuario_id, sala_id, inicio, fim, finalidade });
      }
    );
  });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
