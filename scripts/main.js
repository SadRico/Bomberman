// === Globale Variablen === //

let substances = []; // Enthält alle Spielobjekte wie Spieler, Bomben, Explosionen
let cells = [];      // Raster für das Spielfeld
let interval;        // Intervall für den Spiel-Timer
let last;            // Zeitstempel der letzten Frame-Aktualisierung
let frameTime;       // Zeitdifferenz zwischen den Frames


// === Spielstatus Variablen === //

let canPlaceBomb = true;     // Separate Kontrolle für Bombenplatzierung
let isGameOver = false;      // Überprüfung, ob Game Over ist
let invincible = false;      // Unverwundbarkeitsstatus des Spielers
let isVisible = false;       // Zustand für Blinkeffekt von Restart-Text
let seconds_left = 240;        // Verbleibende Zeit im Spiel (in Sekunden)
let lives = 3;               // Anzahl der Leben des Spielers
let frameCounter = 0;        // Zählt die Frames

// === Initialisierung des Spielers und Levels === //

let player = new Player(1, 1); // Startposition des Spielers
let level = new Level();       // Erzeugt ein neues Level

// === Definition von Spielobjekttypen === //

const types = {
    wall: 9,   // Feste Wand, nicht zerstörbar
    brick: 1,  // Zerstörbarer Block
    bomb: 2    // Bombe
};

// === Definition von Item-Typen === //

const items = {
    extraBombs: '💣',  // Erhöht die Anzahl der gleichzeitig platzierbaren Bomben
    fireUp: '🔥',      // Erhöht die Reichweite der Explosionen
    pierce: '🪡'       // Explosionen können durch mehrere Blöcke gehen
};

// === Wahrscheinlichkeiten für das Erscheinen von Items === //

const itemChances = {
    '💣': 0.11,  // 11% Wahrscheinlichkeit für extra Bomben
    '🔥': 0.11,  // 11% Wahrscheinlichkeit für Fire Up
    '🪡': 0.02   // 2% Wahrscheinlichkeit für Piercing Bomb
};

window.onload = initGame;