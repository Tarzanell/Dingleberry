import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

function App() {
  const pixiContainer = useRef(null);
  const gridSize = 50;
  const [velocita, setVelocita] = useState(450);
  const [movimentoRimanente, setMovimentoRimanente] = useState(450);
  const movimentoRef = useRef(450); // ✅ Memorizza il movimento aggiornato
  const [turno, setTurno] = useState(1);
  const playerRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/personaggi/1")
      .then(response => response.json())
      .then(data => {
        if (data && data.velocita) {
          setVelocita(data.velocita);
          setMovimentoRimanente(data.velocita);
          movimentoRef.current = data.velocita; // ✅ Aggiorniamo la ref
        }
      })
      .catch(error => console.error("Errore nel recupero della velocità:", error));

    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x222222
    });

    pixiContainer.current.appendChild(app.view);

    const backgroundTexture = PIXI.Texture.from("sfondo.png");
    const background = new PIXI.Sprite(backgroundTexture);
    background.width = app.renderer.width;
    background.height = app.renderer.height;
    app.stage.addChild(background);

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

    const playerTexture = PIXI.Texture.from("player.png");
    const player = new PIXI.Sprite(playerTexture);
    player.width = gridSize;
    player.height = gridSize;
    player.x = 0;
    player.y = 0;
    player.interactive = true;
    player.buttonMode = true;
    playerRef.current = player;

    let dragging = false;
    let turnStartPosition = { x: 0, y: 0 };
    let dragOffset = { x: 0, y: 0 };
    let moveLine = new PIXI.Graphics();
    app.stage.addChild(moveLine);

    function onDragStart(event) {
      if (movimentoRef.current <= 0) return; // ✅ Blocca il drag se il movimento è esaurito
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
        const newX = newPosition.x - dragOffset.x;
        const newY = newPosition.y - dragOffset.y;

        const dx = newX - turnStartPosition.x;
        const dy = newY - turnStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        moveLine.clear();
        moveLine.lineStyle(3, distance > movimentoRef.current ? 0xff0000 : 0x00ff00, 1);
        moveLine.moveTo(turnStartPosition.x + gridSize / 2, turnStartPosition.y + gridSize / 2);
        moveLine.lineTo(newX + gridSize / 2, newY + gridSize / 2);

        if (distance <= movimentoRef.current) {
          player.x = newX;
          player.y = newY;
        }
      }
    }

    function onDragEnd() {
      dragging = false;
      player.alpha = 1;
      player.data = null;

      const dx = player.x - turnStartPosition.x;
      const dy = player.y - turnStartPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > movimentoRef.current) {
        player.x = turnStartPosition.x;
        player.y = turnStartPosition.y;
      } else {
        player.x = Math.round(player.x / gridSize) * gridSize;
        player.y = Math.round(player.y / gridSize) * gridSize;
        setMovimentoRimanente(prev => {
          const newMovimento = Math.max(0, prev - distance);
          movimentoRef.current = newMovimento; // ✅ Aggiorna la ref
          return newMovimento;
        });
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
  }, []); // ✅ Nessuna dipendenza qui, evita reset continui

  function passaTurno() {
    setTurno(prev => prev + 1);
    setMovimentoRimanente(velocita);
    movimentoRef.current = velocita; // ✅ Reset anche nella ref
  }

  return (
    <div>
      <div ref={pixiContainer} />
      <button onClick={passaTurno}>Passa Turno</button>
      <p>Turno: {turno}</p>
      <p>Movimento Rimanente: {Math.round(movimentoRimanente)}</p>
    </div>
  );
}

export default App;