const express = require("express");
const db = require("./database");

const app = express();
const PORT = 3001;

const cors = require("cors"); // 👈 Importa CORS

app.use(cors());
app.use(express.json());

// Ottieni tutti i personaggi
app.get("/api/personaggi", (req, res) => {
  db.all("SELECT * FROM personaggi", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Ottieni un personaggio specifico per ID
app.get("/api/personaggi/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM personaggi WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

app.post("/api/personaggi", (req, res) => {
  const { nome, velocita, forza, destrezza, costituzione, punti_vita } = req.body;

  // Query SQL per inserire i dati
  db.run(
    `INSERT INTO personaggi (nome, velocita, forza, destrezza, costituzione, punti_vita) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, velocita || 450, forza || 10, destrezza || 10, costituzione || 10, punti_vita || 100],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: "Personaggio aggiunto con successo!" });
    }
  );
});

// ✅ Endpoint per aggiornare un personaggio esistente
app.put("/api/personaggi/:id", (req, res) => {
  const { id } = req.params;
  const { nome, velocita, forza, destrezza, costituzione, punti_vita } = req.body;

  db.run(
    `UPDATE personaggi 
     SET nome = ?, velocita = ?, forza = ?, destrezza = ?, costituzione = ?, punti_vita = ?
     WHERE id = ?`,
    [nome, velocita, forza, destrezza, costituzione, punti_vita, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ message: "Personaggio non trovato" });
      } else {
        res.json({ message: "Personaggio aggiornato con successo!" });
      }
    }
  );
});

// ✅ Endpoint per eliminare un personaggio esistente
app.delete("/api/personaggi/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM personaggi WHERE id = ?`, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ message: "Personaggio non trovato" });
    } else {
      res.json({ message: "Personaggio eliminato con successo!" });
    }
  });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server API in esecuzione su http://localhost:${PORT}`);
});