class Game {
    constructor() {

    }
}

// leere variablen
let substances = []; // Alle Substances wie Spieler, Bomben, Explosionen
let cells = []; // Raster vom Spielfeld
let interval; // Intervall für Timer
let last;
let frameTime;

// variablen mit content
let seconds_left = 240;
let lives = 3;
let player = new Player(1, 1); // Startposition des Spielers
let level = new Level();

// Definiert die verschiedenen Typen von Objekten im Spiel
const types = {
    wall:  9, // Wand
    brick: 1, // zerstörbarer Block
    bomb: 2 // Bombe
};

// Item-Typen
const items = {
    extraBombs: '💣',// Erhöht die Anzahl der Bomben
    fireUp: '🔥', // Erhöht die Explosionsrange
    pierce: '🪡' // Kann durch mehrere Blöcke schießen, wenn Feuerrate > 1 ist
};

const itemChances = {
    '💣': 0.11,  // 11 % Wahrscheinlichkeit für Bomben
    '🔥': 0.11,  // 11 % Wahrscheinlichkeit für Fire Up
    '🪡': 0.02   // 2 % Wahrscheinlichkeit für Piercing Bomb
};

// Levelgenerierung
level.generate();

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

    // Aktualisiert und rendert alle Substances (Spieler, Bomben, Explosionen)
    substances.forEach(substance => {
        substance.update(frameTime);
        substance.render();
    });

    // Entfernt inaktive Substances/Objekte
    substances = substances.filter(substance => substance.alive);

    player.render();
}

let keysPressed = {
    'a': false,
    'w': false,
    'd': false,
    's': false,
    ' ': false
};

// Event-Listener für Tasteneingaben
document.addEventListener('keydown', (event) => {
    if ((event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') && !keysPressed[event.key]) {
        player.move(event.key);
        keysPressed[event.key] = true;
    }
    else if (event.key === ' ' && !keysPressed[' ']) {
        player.placeBomb();
        keysPressed[' '] = true;
    }
});

// Event-Listener für Loslassen
document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's' || event.key === ' ') {
        keysPressed[event.key] = false;
    }
});


// Timer beim Start des Spiels aufrufen
startTimer();

// Game-Loop
requestAnimationFrame(loop);