// Funktion um das Canvas zu updaten
function updateCanvas() {
    timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
    timerCtx.font = '28px Bahnschrift';
    timerCtx.fillStyle = 'white';
    timerCtx.textAlign = 'center';
    timerCtx.textBaseline = 'bottom';

    lifeCtx.clearRect(0, 0, lifeCanvas.width, lifeCanvas.height);
    lifeCtx.font = '28px Bahnschrift';
    lifeCtx.fillStyle = 'white';
    lifeCtx.textAlign = 'center';
    lifeCtx.textBaseline = 'bottom';

    lifeCtx.fillText(`${lives}`, lifeCanvas.width / 5.78, 46);

    // Zeit und Text Canvas zeichnen
    let minutes = Math.floor(seconds_left / 60);
    let seconds = seconds_left % 60;

    let timeString = `${checkZero(minutes)}:${checkZero(seconds)}`;

    if (lives > 0) {
        timerCtx.fillText(seconds_left > 0 ? timeString : 'Time Up!', timerCanvas.width / 2, 46);
    }
    // Time Up nur prüfen, wenn das Spiel läuft
    timeUpDeath()
    restartGame()

}

// Funktion um Timer zu starten
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

// Funktion um Timer richtig darzustellen
function checkZero(num) {
    return num < 10 ? '0' + num : num;
}

// Funktion bei einem Time Up Tod
function timeUpDeath(){
    // Wenn das Spiel vorbei ist, nichts weiter ausführen
    if (isGameOver) {
        return;
    }

    // Wenn Tod durch Time Up & Leben > 0
    if (seconds_left === 0 && lives > 0) {
        // Wenn 1 Leben durch Time Up verloren, dann Time-Reset, weil sonst cringe Fehler
        if (lives - 1){
            seconds_left = 240
        }

        setTimeout(() => {
            reduceLife();
            respawnPlayer();
            startTimer();
        }, 1000);
    }
}

// Funktion um Spiel zu restarten
function restartGame() {
    if (lives === 0 && !isGameOver) {
        isGameOver = true;

        // GameOver-Text anzeigen
        timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
        timerCtx.fillText('GameOver!', timerCanvas.width / 2, 46);

        // GameOver-Text verzögern
        setTimeout(() => {

            const blinkText = setInterval(() => {
                timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);

                if (isVisible) {
                    timerCtx.fillText('Restart!', timerCanvas.width / 2, 46); // Restart-Text
                }

                isVisible = !isVisible; // Sichtbarkeit
            }, 500); // Alle 500ms blinken lassen

            // Nach 5 Sekunden Blinkeffekt stoppen
            setTimeout(() => {
                clearInterval(blinkText); // Stoppe das Blinken
                timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height); // Canvas leeren
                timerCtx.fillText('Restart!', timerCanvas.width / 2, 46); // Text dauerhaft anzeigen
            }, 5000);

        }, 1050); // Verzögert Start des Blinkeffekts

        // Nach 7 Sekunden das Spiel neu starten
        setTimeout(() => {
            lives = 3;
            substances = [];
            seconds_left = 240;
            respawnPlayer();
            level.generate();
            startTimer()
            updateCanvas();

            isGameOver = false;
        }, 7000);
    }
}

// Funktion um Leben zu verlieren
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
        respawnPlayer()
        updateCanvas(); // Canvas wird nach GameOver geupdated

    }
}

// Funktion um Spieler zu respawnen
function respawnPlayer() {
    if (lives > 0) {
        player = new Player(1, 1);
        invincible = true;  // Spieler ist unverwundbar
        player.numBombs = 1;  // Standardanzahl an Bomben
        player.fireUp = 2;  // Standardanzahl an Bomben

        // Nach 3 Sekunden ist der Spieler wieder verwundbar
        setTimeout(() => {
            invincible = false;
        }, 3000); // 3000 Millisekunden = 3 Sekunden

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
                if (!invincible) {  // Nur Schaden zufügen, wenn Spieler nicht unverwundbar ist
                    setTimeout(() => {
                        respawnPlayer();
                    }, 50);
                    reduceLife();
                }
            }

            if (cell) return; // Stoppt die Explosion, wenn ein Block getroffen wurde
        }
    });
}

// Funktion für Pierce Bombe (schießt durch mehrere Blöcke auf einmal, wenn Feuerkraft es hergibt)
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
                if (!invincible) {  // Nur Schaden zufügen, wenn Spieler nicht unverwundbar ist
                    setTimeout(() => {
                        respawnPlayer();
                    }, 50);
                    reduceLife();
                }
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

// Game-Loop für Animation
function loop(timestamp) {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!last) last = timestamp;
    frameTime = timestamp - last;
    last = timestamp;

    // Zeichnet das Spielfeld basierend auf den Zellen
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            switch (cells[row][col]) {
                // zeichnet feste Wände
                case types.wall:
                    context.drawImage(wallCanvas, col * grid, row * grid);
                    break;
                // zeichnet Blöcke
                case types.brick:
                    context.drawImage(brickCanvas, col * grid, row * grid);
                    break;
            }
        }
    }
    // Bewegung, wenn man Tasten hält
    frameCounter++;

    if (frameCounter % 9 === 0) {  // Bewegung nur alle 9 Frames
        // Fix, damit man nicht entgegengesetzte Richtungen gleichzeitig drücken kann für Moonwalk-Bug UND nicht diagonal glitcht
        if (keysPressed['a'] && !keysPressed['d'] && !keysPressed['w'] && !keysPressed['s']){
            player.move('a');
        } else if (keysPressed['d'] && !keysPressed['a'] && !keysPressed['w'] && !keysPressed['s']) {
            player.move('d');
        }
        if (keysPressed['w'] && !keysPressed['s'] && !keysPressed['d'] && !keysPressed['a']) {
            player.move('w');
        } else if (keysPressed['s'] && !keysPressed['w'] && !keysPressed['a'] && !keysPressed['d']) {
            player.move('s');
        }
    }
    // Bombe platzieren, wenn Pfeil nach oben gedrückt wird
    if (keysPressed['ArrowUp'] && canPlaceBomb) {
        player.placeBomb();
        canPlaceBomb = false; // Verhindert, dass Bomben gespammt werden
    }

    // Aktualisiert und rendert alle Substances (Spieler, Bomben, Explosionen, Items etc.)
    substances.forEach(substance => {
        substance.update(frameTime);
        substance.render();
    });

    // Entfernt inaktive Substances/Objekte/Entities
    substances = substances.filter(substance => substance.alive);

    player.render();
}

// Spiel-Initialisierung
function initGame() {
    // BGM Musik (Option im Browser einstellen, um es IMMER abspielen zu lassen beim Restart!)
    bgmAudio.volume = 0.2;
    bgmAudio.loop = true;
    bgmAudio.play();
    level.generate();      // Generiert das Level-Layout
    startTimer();      // Startet den Spiel-Timer
    requestAnimationFrame(loop); // Startet den Spiel-Loop
}