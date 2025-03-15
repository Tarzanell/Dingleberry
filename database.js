const sqlite3 = require("sqlite3").verbose();

// Apriamo il database (creerà il file se non esiste)
const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    console.error("Errore nella connessione al database:", err.message);
  } else {
    console.log("Database connesso con successo.");
  }
});

// Creiamo la tabella personaggi
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS personaggi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      velocita INTEGER NOT NULL DEFAULT 450,
      forza INTEGER NOT NULL DEFAULT 10,
      destrezza INTEGER NOT NULL DEFAULT 10,
      costituzione INTEGER NOT NULL DEFAULT 10,
      punti_vita INTEGER NOT NULL DEFAULT 100
    )
  `, (err) => {
    if (err) {
      console.error("Errore nella creazione della tabella:", err.message);
    } else {
      console.log("Tabella personaggi pronta.");
    }
  });
});

module.exports = db;