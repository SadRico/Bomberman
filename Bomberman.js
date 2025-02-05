const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64; // Größe eines Spielfeldblocks
const numRows = 13; // Anzahl der Reihen
const numCols = 15; // Anzahl der Spalten

// Erstellt Canvas für zerstörbare Blöcke
const brickCanvas = document.createElement('canvas');
const brickCtx = brickCanvas.getContext('2d');
brickCanvas.width = brickCanvas.height = grid;
brickCtx.fillStyle = '#6d4520';
brickCtx.fillRect(0, 0, grid, grid);

// Erstellt Canvas für feste Wände
const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;
wallCtx.fillStyle = 'black';
wallCtx.fillRect(0, 0, grid, grid);
wallCtx.fillStyle = '#a9a9a9';
wallCtx.fillRect(2, 2, grid - 4, grid - 4);

// Erstellt Timer
const timerCanvas = document.createElement('canvas');
timerCanvas.id = 'timerCanvas'; // ID hinzufügen
const timerCtx = timerCanvas.getContext('2d');
timerCanvas.width = 957;
timerCanvas.height = 60; // Timer-Höhe anpassen, je nachdem, was du benötigst
document.body.appendChild(timerCanvas);


let seconds_left = 200;

function updateCanvas() {
    timerCtx.clearRect(0, 0, timerCanvas.width, timerCanvas.height); // Clears the canvas
    timerCtx.font = '30px Arial';
    timerCtx.fillStyle = 'white';
    timerCtx.textAlign = 'center';

    // Minuten und Sekunden berechnen
    let minutes = Math.floor(seconds_left / 60);
    let seconds = seconds_left % 60;

    // Zeit im mm:ss-Format
    let timeString = `${checkZero(minutes)}:${checkZero(seconds)}`;

    // Zeit und Text Canvas zeichnen
    timerCtx.fillText(seconds_left > 0 ? timeString : 'Time Up!', timerCanvas.width / 2, 50);
}

// Stellt sicher, dass Minuten und Sekunden immer 2 Stellen haben
function checkZero(num) {
    return num < 10 ? '0' + num : num;
}

let interval = setInterval(function() {
    seconds_left--;
    updateCanvas();

    if (seconds_left <= 0) {
        clearInterval(interval);
        player = null; // wenn time up, spieler tot
    }
}, 1000); // zeigt an, wie langsam/schnell die Zeit abläuft

// Definiert die verschiedenen Typen von Objekten im Spiel
const types = {
    wall: '🟩', // Wand
    brick: 1, // zerstörbarer Block
    bomb: 2 // Bombe
};

// Item-Typen
const items = {
    extraBombs: '💣', // Erhöht die Anzahl der Bomben
    fireUp: '🔥', // Erhöht die Explosionsrange
    vest: '🦺' // Extra Hit
};

let substances = []; // Alle Substances wie Spieler, Bomben, Explosionen
let cells = []; // Raster vom Spielfeld

// Spielfeld-Template
class Level {
    constructor() {
        this.template = [
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩'],
            ['🟩','x','x',0,0,0,0,0,0,0,0,0,'x','x','🟩'],
            ['🟩','x','🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩','x','🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩','x','🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩','x','🟩'],
            ['🟩','x','x',0,0,0,0,0,0,0,0,0,'x','x','🟩'],
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩']
        ]
        ;
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
class Substance {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    update(frameTime) {}
    render() {}
}
// Klasse für Items
class Item {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.secondsLeft = 10;
        this.interval = null;
        this.alive = true;
    }

    // Items werden gerendert
    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.65) * grid;
        context.font = '30px Arial';
        context.textAlign = 'center';
        context.fillText(this.type, x, y);
    }

    // Updated das Item um es despawnen zu lassen
    update() {
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.secondsLeft--;

                // Wenn die Zeit abgelaufen ist
                if (this.secondsLeft <= 0) {
                    clearInterval(this.interval);
                    this.remove(); // Item entfernen
                }
            }, 1000);
        }
    }

    remove() {
        // Item wird gelöscht
        //console.log(`Item bei (${this.row}, ${this.col}) wurde gelöscht`);
        substances = substances.filter(substance => substance !== this);
    }
}

// Funktion zum zufälligen Erzeugen von Items, wenn ein Block zerstört wird
function generateItem(row, col) {
    // Random Item erscheint mit 30% Wahrscheinlichkeit
    if (Math.random() < 0.3) {
        const itemTypes = Object.values(items); // Object ist eine built-in method (Zur Verständnis)
        const randomItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const item = new Item(row, col, randomItemType);
        substances.push(item);
    }
}
// Bomb-Klasse
class Bomb extends Substance {
    constructor(row, col, size, owner) {
        super(row, col);
        this.radius = grid * 0.4;
        this.size = size;
        this.owner = owner;
        this.alive = true;
        this.type = types.bomb;
        this.timer = 3000;
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            blowUp(this); // Bombe explodiert
        }
        // 'Animation' für Bombe
        const interval = Math.ceil(this.timer / 500);
        this.radius = (interval % 2 === 0) ? grid * 0.4 : grid * 0.5; // Wechsel der Größe von der Bombe, wegen Animation
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
class Explosion extends Substance {
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
        this.numBombs = 1; // Spieler kann nur eine Bombe gleichzeitig legen
        this.bombSize = 3; // Bombenreichweite
        this.radius = grid * 0.25;
    }

    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        context.save();
        context.fillStyle = 'orange';
        context.beginPath();
        context.arc(x, y, this.radius, 0, 2 * Math.PI);
        context.fill();
    }

    move(direction) {
        let newRow = this.row;
        let newCol = this.col;

        // Berechnet die Position des Spielers
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
            this.getItem(); // Item einsammeln
        }
    }


    // Überprüft, ob Spieler auf ein gültiges Feld laufen kann
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
        if (!cells[this.row][this.col] && substances.filter(substance => substance.type === types.bomb && substance.owner === this).length < this.numBombs) {
            const bomb = new Bomb(this.row, this.col, this.bombSize, this);
            substances.push(bomb);
            cells[this.row][this.col] = types.bomb;
        }
    }

    getItem() {
        // Findet ein Item an der aktuellen Position
        let item = substances.find(substance => substance instanceof Item && substance.row === this.row && substance.col === this.col);

        if (item) {
            if (item.type === items.extraBombs) {
                if (this.numBombs< 5){
                    this.numBombs++; // Mehr Bomben (max. 5)
            }
            } //else if (item.type === items.fireUp) {
                //this.speedBoost(); // Geschwindigkeit erhöhen
            }
            item.remove(); // Entfernt das Item nach Aufnahme
        }
}

// Funktion, die eine Bombe explodieren lässt
function blowUp(bomb) {
    if (!bomb.alive) return;
    bomb.alive = false; // Bombe ist nicht mehr aktiv
    cells[bomb.row][bomb.col] = null; // Entfernt die Bombe vom Spielfeld

    const directions = [{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];
    const startRange = 2; // Reichweite der Bombe

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
                blowUp(nextBomb); // Nächste Bombe explodieren lassen, für Bombchains
            }

            if (player && player.row === row && player.col === col) {
                player = null // Player wird gekillt
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

// Event-Listener für Tasteneingaben
document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') {
        player.move(event.key);
    } else if (event.key === ' ') {
        player.placeBomb();
    }
});
requestAnimationFrame(loop);