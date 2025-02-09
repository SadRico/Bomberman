// === Canvas Funktionen === //

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
    // Time-Up nur prüfen, wenn das Spiel läuft
    timeUpDeath()
    restartGame()
}

// Funktion um Timer zu starten
function startTimer() {
    if (interval) {
        clearInterval(interval); // Stoppt vorherigen Timer, falls vorhanden
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
            seconds_left = 340;
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
        // GameOver-Text anzeigen
        timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
        timerCtx.fillText('GameOver!', timerCanvas.width / 2, 46);
        isGameOver = true;


        restartText(); // Text anzeigen, falls notwendig

        // Spiel nach 7 Sekunden neu starten
        setTimeout(() => {

            // Game-Loop stoppen
            cancelAnimationFrame(animationFrameId);

            // Setzt Spielvariablen zurück
            lives = 3;
            substances = [];
            seconds_left = 340;
            bossEnemy = null;
            isVictory = false;
            isGameOver = false;

            // Spieler respawnen & Spiel neu starten
            if (!player) {
                respawnPlayer();
            }

            // Musik neu starten
            bossAudioMute();

            bgmAudio.pause();
            bgm2Audio.pause();
            bgm3Audio.pause();

            bgmAudio.currentTime = 0;
            bgm2Audio.currentTime = 0;
            bgm3Audio.currentTime = 0;

            initGame();
        }, 7000);
    }
}

// Funktion für Restart oben in Timer Canvas
function restartText(){
    // GameOver-Text verzögern (Spoiler: klappt immer noch nicht richtig...)
    setTimeout(() => {

        const blinkText = setInterval(() => {
            timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);

            if (isVisible) {
                timerCtx.fillText('Restart!', timerCanvas.width / 2, 46); // Restart-Text
            }

            isVisible = !isVisible;
        }, 500); // Alle 500ms blinken lassen

        // Nach 5 Sekunden Blinkeffekt stoppen
        setTimeout(() => {
            clearInterval(blinkText); // Stoppe das Blinken
            timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height); // Canvas leeren
            timerCtx.fillText('Restart!', timerCanvas.width / 2, 46);
        }, 5000);

    }, 1050); // Verzögert Start des Blinkeffekts
}

// Zeichnet Win-Screen
function winScreen(){

    // Stellt sicher, dass die Bossmusik gestoppt wird
    bossAudioMute()

    // Victory Canvas render
    const victoryCanvas = document.createElement('canvas');
    const victoryCtx = victoryCanvas.getContext('2d');
    const victoryImage = new Image();
    victoryImage.src = 'assets/misc/victory_screen.jpg';

    victoryImage.onload = () => {
        victoryCanvas.width = 3000;
        victoryCanvas.height = 936;
        victoryCtx.drawImage(victoryImage, 0, 0, victoryCanvas.width, victoryCanvas.height);
    };
    victoryCanvas.id = 'victoryCanvas';

    // Setzt Spielvariablen zurück
    player = null;
    bossEnemy = null;
    substances = [];

    // Victory Musik
    winAudio.volume = 0.15;
    winAudio.play();

    if (interval) {
        clearInterval(interval); // Stoppt vorherigen Timer, falls vorhanden
    }

    // Game-Loop stoppen, falls aktiv
    cancelAnimationFrame(animationFrameId);

    document.body.appendChild(victoryCanvas);

    setTimeout(() => {
        window.alert('Glückwunsch! Leider musst du noch das Fenster neustarten, um nochmal spielen zu können. :(')
    }, 20)


// === Noch geplanter neustart nach Win === //

    // Nach 7 Sekunden das Spiel neu starten
    //setTimeout(() => {
    //    updateCanvas()
    //    initGame()
    //    restartGame();  // Funktion zum Neustart des Spiels aufrufen
    //}, 7000);
}



// === PlayerFunktionen === //

function savePlayerItems() {
    savedPlayerState.numBombs = player.numBombs;
    savedPlayerState.bombRange = player.bombRange;
    savedPlayerState.hasPierceBomb = player.hasPierceBomb;
}

function restorePlayerItems() {
    player.numBombs = savedPlayerState.numBombs || 1;  // Standardwert 1 Bombe
    player.bombRange = savedPlayerState.bombRange || 2; // Standardwert 2
    player.hasPierceBomb = savedPlayerState.hasPierceBomb || false; // Standardwert false
}


// Funktion um Spieler zu respawnen
function respawnPlayer() {
    if (lives > 0) {
        player = new Player(1, 1, level);
        invincible = true;  // Spieler ist unverwundbar

        player.numBombs = 1;  // Standardanzahl an Bomben
        player.fireUp = 2;  // Standardanzahl an Bomben

        // Nach 3 Sekunden ist der Spieler wieder verwundbar
        setTimeout(() => {
            invincible = false;
        }, 3000); // 3000 Millisekunden = 3 Sekunden
    }
}

// Funktion um Spieler in BossLevel zu respawnen
function respawnPlayerInBossLevel() {
    if (lives > 0) {
        player = new Player(11, 7, level);
        invincible = true;  // Spieler ist unverwundbar
        player.numBombs = 1;  // Standardanzahl an Bomben

        // Nach 3 Sekunden ist der Spieler wieder verwundbar
        setTimeout(() => {
            invincible = false;
        }, 3000); // 3000 Millisekunden = 3 Sekunden
    }
}

// Speed-einstellungen für Spieler
function resetPlayerSpeed(){
    frameCounter++
    // Bewegung, wenn man Tasten hält
    if (frameCounter % 7 === 0) {  // Bewegung nur alle 7 Frames (Speed-items noch geplant)
        if (keysPressed['a'] && !keysPressed['d'] && !keysPressed['w'] && !keysPressed['s']) {
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
}

// Funktion um Leben zu verlieren
function reduceLife() {
    if (lives > 0) {
        lives--;
        player = null;

        // Player Death Sound
        const deathAudio = new Audio('sounds/player/Death.wav');
        deathAudio.volume = 0.1;
        deathAudio.play();

        updateCanvas();  // Updated das Canvas nach Tod

    } else if (lives === 0) {
        player = null; // Spieler tot
        // Player Death Sound
        const deathAudio = new Audio('sounds/player/Death.wav');
        deathAudio.volume = 0.1;
        deathAudio.play();
        respawnPlayer();  // Spieler respawnen
        updateCanvas();   // Canvas wird nach GameOver geupdated

    }
}



// === Boss Funktionen === //

// Funktion um Leben zu verlieren
function reduceBossLife() {
    if (bossHP === 0) {
        // Verhindert mehrfachen Boss-Tod
        return;
    }

    bossHP--; // BossHP reduzieren
    boss_invincible = true;

    // Unverwundbarkeit nach 5 Sekunden beenden
    setTimeout(() => {
        boss_invincible = false;
    }, 3000);

    // Boss Hit Sound
    hitAudio.volume = 0.5;
    hitAudio.play();
    updateCanvas(); // Canvas aktualisieren nach Treffer

    // Überprüfen, ob Boss jetzt tot ist
    if (bossHP === 0) {
        hitAudio.volume = 0.5;
        hitAudio.pause();

        bossDeath(); // Victory-Screen und Game-Stop
        updateCanvas(); // Nach dem Sieg aktualisieren
    }
}

// Checkt ob Boss tot ist
function bossDeath() {
    if (isVictory) return;  // Falls der Sieg schon ausgelöst wurde, nichts tun
    isVictory = true;

    // Sicherstellen, dass der Boss entfernt wird
    bossEnemy = null;

    // Loop stoppen
    cancelAnimationFrame(animationFrameId);

    winScreen();  // Siegesbildschirm zeigen
}

// Muted die Boss Musik
function bossAudioMute(){
    if ( bossAudio ){
        bossAudio.pause()
        bossAudio.currentTime = 0;
    }
}

// Funktion um am Boss Schaden zu kriegen
function playerBossDamage() {
    if (bossEnemy && player) {
        // Berechnet die Pixelposition des Bosses
        const bossX = bossEnemy.x;  // Bosses X-Koordinate (Mittelpunkt)
        const bossY = bossEnemy.y;  // Bosses Y-Koordinate (Mittelpunkt)

        // Berechnet die Pixelposition des Spielers
        const playerX = (player.col + 0.5) * grid;
        const playerY = (player.row + 0.5) * grid;

        // Berechnet die Entfernung zwischen Spieler und Boss
        const distance = Math.hypot(bossX - playerX, bossY - playerY); // (ChatGPT)

        // Wenn der Spieler den Boss berührt (innerhalb des Boss-Radius)
        if (distance < bossEnemy.radius) {
            if (!invincible) {  // Nur Schaden zufügen, wenn der Spieler nicht unverwundbar ist
                reduceLife();   // Spielerleben reduzieren
                respawnPlayerInBossLevel(); // Spieler nach kurzer Zeit respawnen
            }
        }
    }
}

// Funktion um im Boss Raum zu spawnen
function spawnBossRoom() {

    setTimeout(() => {
        window.alert('Oh nein, was ist das?!')
    }, 20)

    // Spieleritems speichern
    savePlayerItems();

    // Timer neustarten (klappt noch nicht richtig)
    startTimer()

    // Hintergrundmusik stoppen
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgm2Audio.pause();
    bgm2Audio.currentTime = 0;
    bgm3Audio.pause();
    bgm3Audio.currentTime = 0;

    // Boss-Level generierend
    level.generate_bossLevel();
    respawnPlayerInBossLevel()

    // Boss-Spawn-Position festlegen (Mitte des Spielfeldes)
    bossEnemy = new Boss(3, 7, level);  // Beispielposition in der Mitte des Spielfelds
    boss_invincible = true;

    // Unverwundbarkeit nach 5 Sekunden beenden
    setTimeout(() => {
        boss_invincible = false;
    }, 5000);

    bossEnemy.move(); // Bewegung des Bosses
    bossEnemy.render(); // Boss rendern

    // Boss-Kampfmusik abspielen
    bossAudio.volume = 0.5; // Je lauter, desto besser
    bossAudio.loop = true;
    bossAudio.play();

    // Spieleritems im Bossraum wiederherstellen
    restorePlayerItems();
}




// === Bomben und Item Funktionen === //

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
            const cell = cells[row]?.[col]; // Sicherstellen, dass die Zelle existiert (ergooglet)

            if (cell === types.wall) return; // Wand blockiert Explosion
            substances.push(new Explosion(row, col)); // Explosion erzeugen

            cells[row][col] = null;

            // Wenn der Block ein 'brick' ist, dann ein Item generieren
            if (cell === types.brick) {
                generateItem(row, col); // Zufälliges Item im Block generieren
                totalBricks--;          // Brick-Counter verringern

                if (totalBricks <= 0) {
                    spawnBossRoom();    // Bossraum spawnen, wenn alle Bricks zerstört wurden
                }
            }

            // Wenn eine weitere Bombe auf die Explosion trifft, explodiert diese ebenfalls
            if (cell === types.bomb) {
                const nextBomb = substances.find((substance) => substance.type === types.bomb && substance.row === row && substance.col === col);
                blowUp(nextBomb); // Nächste Bombe explodieren lassen, für Bomb-chains
            }

            // Überprüfen, ob der Spieler in der Nähe ist
            if (player && player.row === row && player.col === col) {
                if (!invincible) {  // Nur Schaden zufügen, wenn der Spieler nicht unverwundbar ist
                    setTimeout(() => {
                        respawnPlayer();
                    }, 50);
                    reduceLife();
                }
            }

            // Neue Boss-Kollision basierend auf Abstand
            else if (bossEnemy) {
                const bossX = bossEnemy.x;  // Boss X-Koordinate (Mittelpunkt)
                const bossY = bossEnemy.y;  // Boss Y-Koordinate (Mittelpunkt)

                const explosionX = col * bossEnemy.grid + bossEnemy.grid / 2;
                const explosionY = row * bossEnemy.grid + bossEnemy.grid / 2;

                const distance = Math.hypot(bossX - explosionX, bossY - explosionY);

                if (distance < bossEnemy.radius && !boss_invincible) {
                    reduceBossLife();
                }
            }
            // Stoppt die Explosion, wenn ein Block getroffen wurde
            if (cell) return;
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

            if (cell === types.brick) {
                generateItem(row, col); // Zufälliges Item im Block generieren
                totalBricks--;          // Brick-Zähler verringern

                if (totalBricks <= 0) {
                    spawnBossRoom();    // Bossraum spawnen, wenn alle Bricks zerstört wurden
                }
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

            // Boss-Kollision basierend auf Abstand
            if (bossEnemy) {
                const bossX = bossEnemy.x;  // Boss X-Koordinate (Mittelpunkt)
                const bossY = bossEnemy.y;  // Boss Y-Koordinate (Mittelpunkt)

                const explosionX = col * bossEnemy.grid + bossEnemy.grid / 2;
                const explosionY = row * bossEnemy.grid + bossEnemy.grid / 2;

                const distance = Math.hypot(bossX - explosionX, bossY - explosionY);

                if (distance < bossEnemy.radius && !boss_invincible) {
                    reduceBossLife();
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



// === Gameloop Funktionen === //

// Game-Loop für Animation
function loop(timestamp) {
    // Sieg-Bedingung überprüfen
    if (isVictory) {
        cancelAnimationFrame(animationFrameId);  // Stoppt Game-Loop nach Sieg
        bossCtx.clearRect(0, 0, canvas.width, canvas.height);
        bossEnemy = null
        return; // Verhindert weiteres Ausführen der Spiellogik
    }

    animationFrameId = requestAnimationFrame(loop); // Game-Loop aufrufen
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

    resetPlayerSpeed()

    // Bombe platzieren, wenn Pfeil nach oben gedrückt wird
    if (keysPressed['ArrowUp'] && canPlaceBomb) {
        player.placeBomb();
        canPlaceBomb = false; // Verhindert, dass Bomben gespammt werden
    }

    // Prüfen, ob alle Bricks zerstört wurden und Boss noch nicht gespawnt ist
    if (totalBricks <= 0 && !bossEnemy) {
        spawnBossRoom();  // Bossraum spawnen
    }

    // Aktualisiert und rendert alle Substances (Spieler, Bomben, Explosionen, Items etc.)
    substances.forEach(substance => {
        substance.update(frameTime);
        substance.render();
    });

    if (bossEnemy) {
        // Debugging: Überprüfe, ob der Boss richtig existiert
        console.log(`Boss Position: (${bossEnemy.x}, ${bossEnemy.y})`);

        bossEnemy.render();
        bossEnemy.move();
        playerBossDamage();

        // Debugging: Überprüfe, ob die Bewegung des Bosses stattfindet
        console.log(`Boss Geschwindigkeit: speedX=${bossEnemy.speedX}, speedY=${bossEnemy.speedY}`);
    } else {
        console.log("Boss nicht vorhanden.");
    }

    // Entfernt inaktive Substances/Objekte/Entities
    substances = substances.filter(substance => substance.alive);

    if (player) {
        player.render();  // Spieler rendern, wenn existent
    } else {
        console.log("Spieler ist null, kann nicht gerendert werden.");
    }

}

// Spiel-Initialisierung
function initGame() {
    setTimeout(() => {
        window.alert('Willkommen! Zerstöre alle Blöcke und eine Überraschung erwartet dich!')
    }, 20)


    frameTime = 0; // Setzt frameTime zurück
    last = undefined; // Setzt last auf undefined, um Zeit zu korrigieren

    bgmAudio.volume = 0.2;
    bgmAudio.loop = true;
    bgm2Audio.volume = 0.13;
    bgm2Audio.loop = true;
    bgm3Audio.volume = 0.12;
    bgm3Audio.loop = true;

    // 30 % Chance welche Hintergrundmusik abspielt, außer für BGM2, weil guter Track
    if (Math.random() < 0.3) {
        bgmAudio.play();
    } else if (Math.random() < 0.6) {
        bgm2Audio.play();
    } else if (Math.random() < 0.9) {
        bgm3Audio.play();
    } else {
        bgm2Audio.play();
    }

    bossEnemy = null;
    level.generate(); // Normales Level generieren
    startTimer();

    animationFrameId = requestAnimationFrame(loop);  // Game-Loop starten
}