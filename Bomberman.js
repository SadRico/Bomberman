const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64; // Größe eines Spielfeldblocks
const numRows = 13; // Anzahl der Reihen
const numCols = 15; // Anzahl der Spalten

// Erstellt ein Canvas für zerstörbare Blöcke
const brickCanvas = document.createElement('canvas');
const brickCtx = brickCanvas.getContext('2d');
brickCanvas.width = brickCanvas.height = grid;
brickCtx.fillStyle = '#6d4520';
brickCtx.fillRect(0, 0, grid, grid);

// Erstellt ein Canvas für feste Wände
const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;
wallCtx.fillStyle = 'black';
wallCtx.fillRect(0, 0, grid, grid);
wallCtx.fillStyle = '#a9a9a9';
wallCtx.fillRect(2, 2, grid - 4, grid - 4);

// Erstellt einen Timer
const timerCanvas = document.createElement('canvas');
timerCanvas.width = 200;
timerCanvas.height = 100;
document.body.appendChild(timerCanvas);
const timerContext = timerCanvas.getContext('2d');

let seconds_left = 100;

function updateCanvas() {
    timerContext.clearRect(0, 0, timerCanvas.width, timerCanvas.height); // Clears the canvas
    timerContext.font = '30px Arial';
    timerContext.fillStyle = 'black';
    timerContext.textAlign = 'center';
    timerContext.fillText(seconds_left > 0 ? seconds_left : 'Time Up!', timerCanvas.width / 2, timerCanvas.height / 2);
}

let interval = setInterval(function() {
    seconds_left--;
    updateCanvas();

    if (seconds_left <= 0) {
        clearInterval(interval);
        player = null
    }
}, 1000); // zeigt an wie langsam/schnell die zeit abläuft

// Definiert die verschiedenen Typen von Objekten im Spiel
const types = {
    wall: '🟩', // Wand
    brick: 1, // zerstörbarer Block
    bomb: 2 // Bombe
};

let entities = []; // Alle entitäten wie Spieler, Bomben, Explosionen
let cells = []; // Raster vom Spielfeld

// Spielfeld-Template
class Level {
    constructor() {
        this.template = [
            ['🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩', '🟩'],
            ['🟩', 'x', 'x',    ,    ,    ,    ,    ,    ,    ,    ,    ,       'x', 'x', '🟩'],
            ['🟩', 'x', '🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    'x', '🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    ,'🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩', 'x', '🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    'x', '🟩'],
            ['🟩', 'x', 'x',    ,    ,     ,    ,    ,    ,    ,    ,    ,  'x', 'x','🟩'],
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩', '🟩', '🟩'],
        ];
    }

    // Generiert das Spielfeld basierend auf dem Template
    generate() {
        cells = [];
        for (let row = 0; row < numRows; row++) {
            cells[row] = [];
            for (let col = 0; col < numCols; col++) {
                if (!this.template[row][col] && Math.random() < 0.90) { // 90% Chance, einen Block zu spawnen
                    cells[row][col] = types.brick;
                } else if (this.template[row][col] === types.wall) {
                    cells[row][col] = types.wall;
                }
            }
        }
    }
}

// Mainklasse für Entitäten wie Bomben, Explosionen und Spieler
class Entity {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    update(frameTime) {}
    render() {}
}

// Bomb-Klasse
class Bomb extends Entity {
    constructor(row, col, size, owner) {
        super(row, col);
        this.radius = grid * 0.4;
        this.size = size;
        this.owner = owner;
        this.alive = true;
        this.type = types.bomb;
        this.timer = 3000; // 3 Sekunden Timer
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            blowUpBomb(this); // Bombe explodiert
        }
        // 'Animation' für Bombe
        const interval = Math.ceil(this.timer / 500);
        this.radius = (interval % 2 === 0) ? grid * 0.4 : grid * 0.5; // Wechsel der Größe von der Bombe
    }

    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        context.fillStyle = 'black';
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }
}

// Explosion-Klasse
class Explosion extends Entity {
    constructor(row, col) {
        super(row, col);
        this.alive = true;
        this.timer = 300; // 300ms Lebenszeit der Explosion
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            this.alive = false; // Explosion endet
        }
    }

    render() {
        const x = this.col * grid;
        const y = this.row * grid;
        context.fillStyle = '#D72B16'; // Rote Explosion
        context.fillRect(x, y, grid, grid);
    }
}

// Spieler-Klasse
class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.numBombs = 1; // Der Spieler kann nur eine Bombe gleichzeitig legen
        this.bombSize = 3; // Bombenreichweite
        this.radius = grid * 0.35;
    }

    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        context.save();
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    move(direction) {
        let newRow = this.row;
        let newCol = this.col;

        // Berechnet die neue Position des Spielers basierend auf der Steuerung
        switch (direction) {
            case 'a': newCol--; break;
            case 'w': newRow--; break;
            case 'd': newCol++; break;
            case 's': newRow++; break;
        }

        // Überprüft, ob die neue Position gültig ist (keine Wand oder Bombe)
        if (this.isValidMove(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
        }
    }

    // Überprüft, ob der Spieler auf ein gültiges Feld laufen kann
    isValidMove(row, col) {
        if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
            return false; // Außerhalb des Spielfelds
        }

        else if (cells[row][col] === types.bomb || cells[row][col] === types.wall || cells[row][col] === types.brick){ // Hindernisse
            return false;
        }

        return true; // Bewegung ist gültig, wenn kein Hindernis vorhanden ist
    }

    placeBomb() {
        // Platziert eine Bombe, wenn der Spieler keine andere Bombe an dieser Stelle hat
        if (!cells[this.row][this.col] && entities.filter(entity => entity.type === types.bomb && entity.owner === this).length < this.numBombs) {
            const bomb = new Bomb(this.row, this.col, this.bombSize, this);
            entities.push(bomb);
            cells[this.row][this.col] = types.bomb;
        }
    }
}

// Funktion, die eine Bombe explodieren lässt
function blowUpBomb(bomb) {
    if (!bomb.alive) return;
    bomb.alive = false; // Bombe ist nicht mehr aktiv
    cells[bomb.row][bomb.col] = null; // Entfernt die Bombe vom Spielfeld

    const directions = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
    const startRange = 2; // Reichweite der Bombe

    // Überprüft jede Richtung (oben, unten, links, rechts)
    directions.forEach((direction) => {
        for (let i = 0; i < startRange; i++) {
            const row = bomb.row + direction.row * i;
            const col = bomb.col + direction.col * i;
            const cell = cells[row]?.[col]; // Sicherstellen, dass die Zelle existiert

            if (cell === types.wall) return; // Wand blockiert Explosion
            entities.push(new Explosion(row, col)); // Explosion erzeugen
            cells[row][col] = null;

            if (cell === types.bomb) {
                const nextBomb = entities.find((entity) => entity.type === types.bomb && entity.row === row && entity.col === col);
                blowUpBomb(nextBomb); // Nächste Bombe explodieren lassen
            }

            if (player && player.row === row && player.col === col) {
                player = null // player wird gekillt
            }
            if (cell) return; // Stoppt die Explosion, wenn ein Block getroffen wurde
        }
    });
}

let player = new Player(1, 1); // Startposition des Spielers
let level = new Level();
level.generate();

// Game-Loop für Animation
let last;
let frameTime;
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
                case types.wall:
                    context.drawImage(wallCanvas, col * grid, row * grid);
                    break;
                case types.brick:
                    context.drawImage(brickCanvas, col * grid, row * grid);
                    break;
            }
        }
    }

    // Aktualisiert und rendert alle Entitäten (Spieler, Bomben, Explosionen)
    entities.forEach(entity => {
        entity.update(frameTime);
        entity.render();
    });

    // Entfernt inaktive Entitäten/Objekte
    entities = entities.filter(entity => entity.alive);

    player.render();
}

// Event-Listener für Tasteneingaben
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') {
        player.move(event.key);
    } else if (event.key === ' ') {
        player.placeBomb();
    }
});

requestAnimationFrame(loop);