function updateCanvas() {
    timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
    timerCtx.font = '28px Bahnschrift';
    timerCtx.fillStyle = 'white';
    timerCtx.textAlign = 'center';
    timerCtx.textBaseline = 'bottom';

    lifeCtx.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height); // Clear the canvas each time it's updated
    lifeCtx.font = '28px Bahnschrift';
    lifeCtx.fillStyle = 'white';
    lifeCtx.textAlign = 'center';
    lifeCtx.textBaseline = 'bottom';

    lifeCtx.fillText(`${lives}`, lifeCanvas.width / 5.78, 46);

    // Zeit und Text Canvas zeichnen
    let minutes = Math.floor(seconds_left / 60);
    let seconds = seconds_left % 60;

    let timeString = `${checkZero(minutes)}:${checkZero(seconds)}`;

    timerCtx.fillText(seconds_left > 0 ? timeString : 'Time Up!', timerCanvas.width / 2, 46);

    timeUpDeath()
}

function startTimer() {
    if (interval) {
        clearInterval(interval); // Stoppt einen vorherigen Timer, falls vorhanden
    }
    interval = setInterval(function() {
        seconds_left--; // Zeit zählt runter
        updateCanvas(); // Canvas wird aktualisiert

        if (seconds_left <= 0) {
            clearInterval(interval); // Stoppt das Intervall, wenn die Zeit abgelaufen ist
        }
    }, 1000);
}

function checkZero(num) {
    return num < 10 ? '0' + num : num;
}

function timeUpDeath(){
    // Wenn Tod durch Time Up & Leben > 0
    if (seconds_left === 0 && lives > 0) {
        timerCtx.fillText('Time Up!', timerCanvas.width / 2, 46);
        clearInterval(interval);  // Stoppt den Timer

        // Wenn 1 Leben durch Time Up verloren, dann Time-Reset, weil sonst cringe Fehler
        if (lives - 1){
            seconds_left = 240
        }

        setTimeout(() => {
            reduceLife(); // Leben verlieren
            respawnPlayer(); // Spieler respawnen
            startTimer(); // Timer neu starten

        }, 1000);
    } else if (lives === 0) {
        timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
        timerCtx.fillText('Game Over', timerCanvas.width / 2, 46); // Game Over Nachricht
    }
}

function reduceLife() {
    if (lives > 0) {
        lives--;
        player = null;

        // Player Death Sound
        const deathAudio = new Audio('sounds/Death.wav');
        deathAudio.volume = 0.1;
        deathAudio.play();

        updateCanvas();  // Updated das Canvas nach Tod

    } else if (lives === 0) {
        player = null; // Spieler tot

        // Player Death Sound
        const deathAudio = new Audio('sounds/Death.wav');
        deathAudio.volume = 0.1;
        deathAudio.play();

        updateCanvas(); // Canvas wird nach GameOver geupdatet
    }
}

function respawnPlayer() {
    if (lives > 0) {
        player = new Player(1, 1);
        player.numBombs = 1;  // Standardanzahl an Bomben
        player.fireUp = 2;  // Standardanzahl an Bomben
    }
}

// Funktion, die eine Bombe explodieren lässt
function blowUp(bomb) {
    if (!bomb.alive) return;
    bomb.alive = false; // Bombe ist nicht mehr aktiv
    cells[bomb.row][bomb.col] = null; // Entfernt die Bombe vom Spielfeld

    const directions = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
    const startRange = bomb.owner.bombRange; // Reichweite der Bombe

    // Überprüft jede Richtung
    directions.forEach((direction) => {
        for (let i = 0; i < startRange; i++) {
            const row = bomb.row + direction.row * i;
            const col = bomb.col + direction.col * i;
            const cell = cells[row]?.[col]; // Sicherstellen, dass die Zelle existiert

            if (cell === types.wall) return; // Wand blockiert Explosion
            substances.push(new Explosion(row, col)); // Explosion erzeugen

            cells[row][col] = null;

            if (cell === types.brick){
                generateItem(row, col); // Zufälliges Item im Block generieren
            }
            if (cell === types.bomb) {
                const nextBomb = substances.find((substance) => substance.type === types.bomb && substance.row === row && substance.col === col);
                blowUp(nextBomb); // Nächste Bombe explodieren lassen, für Bomb-chains
            }

            if (player && player.row === row && player.col === col) {
                reduceLife()
                respawnPlayer()
            }
            if (cell) return; // Stoppt die Explosion, wenn ein Block getroffen wurde
        }
    });
}

function pierceBlowUp(bomb) {
    if (!bomb.alive) return;
    bomb.alive = false; // Bombe ist nicht mehr aktiv
    cells[bomb.row][bomb.col] = null; // Entfernt die Bombe vom Spielfeld

    const directions = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
    const startRange = bomb.owner.bombRange; // Reichweite der Bombe

    // Überprüft jede Richtung
    directions.forEach((direction) => {
        for (let i = 0; i < startRange; i++) {
            const row = bomb.row + direction.row * i;
            const col = bomb.col + direction.col * i;
            const cell = cells[row]?.[col]; // Sicherstellen, dass die Zelle existiert

            if (cell === types.wall) return; // Wand blockiert Explosion
            substances.push(new Explosion(row, col, 'pierce')); // Explosion als Pierce markieren

            cells[row][col] = null;

            if (cell === types.brick){
                generateItem(row, col); // Zufälliges Item im Block generieren
            }
            if (cell === types.bomb) {
                const nextBomb = substances.find((substance) => substance.type === types.bomb && substance.row === row && substance.col === col);
                pierceBlowUp(nextBomb); // Nächste Bombe explodieren lassen, für Bomb-chains
            }

            if (player && player.row === row && player.col === col) {
                reduceLife()
                respawnPlayer()
            }
        }
    });
}

// Funktion um Item zu generieren
function generateItem(row, col) {
    // Geht durch alle Items und prüft Wahrscheinlichkeit
    for (const [itemType, chance] of Object.entries(itemChances)) { // of Object ist eine built-in method (Zur Verständnis)
        if (Math.random() < chance) {
            // Item wird mit der Wahrscheinlichkeit erzeugt
            const item = new Item(row, col, itemType);
            substances.push(item);
            break; // Nur ein Item wird erzeugt
        }
    }
}