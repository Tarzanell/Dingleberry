import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

function App() {
  const pixiContainer = useRef(null);
  const gridSize = 50; // Dimensione delle celle
  const [velocita, setVelocita] = useState(450); // Stato per la velocità (default 450)

  useEffect(() => {
    // ✅ Recupera la velocità dal database
    fetch("http://localhost:3001/api/personaggi/1") // Assumiamo che l'ID del personaggio sia 1
      .then(response => response.json())
      .then(data => {
        if (data && data.velocita) {
          setVelocita(data.velocita); // Imposta la velocità reale
        }
      })
      .catch(error => console.error("Errore nel recupero della velocità:", error));

    // Creazione dell'app Pixi.js
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x222222
    });

    pixiContainer.current.appendChild(app.view);

    // Carica l'immagine di sfondo
    const backgroundTexture = PIXI.Texture.from("sfondo.png");
    const background = new PIXI.Sprite(backgroundTexture);
    background.width = app.renderer.width;
    background.height = app.renderer.height;
    app.stage.addChild(background);

    // Creiamo la griglia
    const rows = Math.floor(app.renderer.height / gridSize);
    const cols = Math.floor(app.renderer.width / gridSize);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cell = new PIXI.Graphics();
        cell.lineStyle(2, 0xffffff, 0.5);
        cell.drawRect(i * gridSize, j * gridSize, gridSize, gridSize);
        app.stage.addChild(cell);
      }
    }

    // Creiamo il token del giocatore
    const playerTexture = PIXI.Texture.from("player.png"); 
    const player = new PIXI.Sprite(playerTexture);
    player.width = gridSize;
    player.height = gridSize;
    player.x = 0;
    player.y = 0;
    player.interactive = true;
    player.buttonMode = true;

    let dragging = false;
    let turnStartPosition = { x: 0, y: 0 };
    let dragOffset = { x: 0, y: 0 };
    let moveLine = new PIXI.Graphics(); 

    app.stage.addChild(moveLine);

    function onDragStart(event) {
      dragging = true;
      player.alpha = 0.7;
      player.data = event.data;
      turnStartPosition = { x: player.x, y: player.y };

      const newPosition = event.data.getLocalPosition(player.parent);
      dragOffset.x = newPosition.x - player.x;
      dragOffset.y = newPosition.y - player.y;
    }

    function onDragMove() {
      if (dragging) {
        const newPosition = player.data.getLocalPosition(player.parent);
        player.x = newPosition.x - dragOffset.x;
        player.y = newPosition.y - dragOffset.y;

        const dx = player.x - turnStartPosition.x;
        const dy = player.y - turnStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // ✅ Usa la velocità dinamica al posto di 450
        moveLine.clear();
        moveLine.lineStyle(3, distance > velocita ? 0xff0000 : 0x00ff00, 1);
        moveLine.moveTo(turnStartPosition.x + gridSize / 2, turnStartPosition.y + gridSize / 2);
        moveLine.lineTo(player.x + gridSize / 2, player.y + gridSize / 2);
      }
    }

    function onDragEnd() {
      dragging = false;
      player.alpha = 1;
      player.data = null;

      const dx = player.x - turnStartPosition.x;
      const dy = player.y - turnStartPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // ✅ Controllo sulla velocità dinamica
      if (distance > velocita) {
        player.x = turnStartPosition.x;
        player.y = turnStartPosition.y;
      } else {
        player.x = Math.round(player.x / gridSize) * gridSize;
        player.y = Math.round(player.y / gridSize) * gridSize;
        turnStartPosition = { x: player.x, y: player.y };
      }

      moveLine.clear();
    }

    player
      .on("pointerdown", onDragStart)
      .on("pointerup", onDragEnd)
      .on("pointerupoutside", onDragEnd)
      .on("pointermove", onDragMove);

    app.stage.addChild(player);

    return () => {
      app.destroy(true, { children: true });
    };
  }, [velocita]); // ✅ Il codice si aggiorna quando cambia la velocità

  return <div ref={pixiContainer} />;


}

export default App;