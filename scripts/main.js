// === Globale Variablen === //

let substances = []; // Enthält alle Spielobjekte wie Bomben, Explosionen und Items
let cells = [];      // Raster für das Spielfeld
let interval;              // Intervall für den Spiel-Timer
let last;                  // Zeitstempel der letzten Frame-Aktualisierung
let frameTime;             // Zeitdifferenz zwischen den Frames


// === Spielstatus Variablen === //
const bgmAudio = new Audio('sounds/music/BGM_1.mp3');
const bgm2Audio = new Audio('sounds/music/BGM_2.wav');
const bgm3Audio = new Audio('sounds/music/BGM_3.wav'); // loopt noch nicht richtig(sehr aufwendig in Audacity)
const bossAudio = new Audio('sounds/boss/boss_2.wav');
const hitAudio = new Audio('sounds/boss/boss_damage.wav');
const winAudio = new Audio('sounds/music/victory_theme.wav');

let canPlaceBomb = true;      // Separate Kontrolle für Bombenplatzierung

let animationFrameId;                 // Variable zum Speichern der Loop-ID (Danke Chatgpt)
let isGameOver = false;      // Überprüfung, ob Game Over ist
let isVictory = false;       // Überprüfung, ob Spiel gewonnen ist

let savedPlayerState = {};        // Spielerzustand speichern (Range, Bombenanzahl/-art)

let invincible = false;      // Unverwundbarkeitsstatus des Spielers
let boss_invincible = false; // Unverwundbarkeitsstatus des Bosses
let isVisible = false;       // Zustand für Blinkeffekt von Restart-Text
let seconds_left = 340;      // Verbleibende Zeit im Spiel (in Sekunden)

let lives = 3;               // Anzahl der Leben des Spielers
let bossHP = 10;             // Anzahl der Leben des Bosses
let frameCounter = 0;        // Zählt die Frames
let totalBricks = 0;         // Gesamtanzahl der Bricks im Level (Fürs Bosslevel wichtig)


// === Initialisierung des Spielers und Levels === //

let level = new Level();                        // Rendert neues Level
let player = new Player(1, 1, level); // Startposition des Spielers
let bossEnemy = new Boss(3, 7, level); // Startposition des Bosses

// === Definition von Spielobjekttypen === //

const types = {
    wall: 9,   // Feste Wand (nicht zerstörbar)
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
    '💣': 0.11,  // 11 % Wahrscheinlichkeit für extra Bomben
    '🔥': 0.11,  // 11 % Wahrscheinlichkeit für Fire Up
    '🪡': 0.02   // 2% Wahrscheinlichkeit für Piercing Bomb
};

window.onload = () => initGame();