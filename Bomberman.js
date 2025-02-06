const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64; // Größe eines Spielfeldblocks
const numRows = 13; // Anzahl der Reihen
const numCols = 15; // Anzahl der Spalten

// BGM Musik
const bgmAudio = new Audio('sounds/BGM_1.mp3');
bgmAudio.volume = 0.2;
bgmAudio.loop = true;
bgmAudio.play();


// Erstellt Canvas für zerstörbare Blöcke
const brickCanvas = document.createElement('canvas');
const brickCtx = brickCanvas.getContext('2d');
brickCanvas.width = brickCanvas.height = grid;
const brickImage = new Image();
brickImage.src = 'assets/block.png';
brickImage.onload = () => {
    brickCtx.drawImage(brickImage, 0, 0, grid, grid); // Bild auf Canvas zeichnen
};

// Erstellt Canvas für feste Wände
const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;
const wallImage = new Image();
wallImage.src = 'assets/wall.png';
wallImage.onload = () => {
    wallCtx.drawImage(wallImage, 0, 0, grid, grid); // Wandbild auf Canvas zeichnen
};

// Erstellt Timer
const timerCanvas = document.createElement('canvas');
const timerCtx = timerCanvas.getContext('2d');
timerCanvas.id = 'timerCanvas';
timerCanvas.width = 957;
timerCanvas.height = 60;
document.body.appendChild(timerCanvas);

// Erstellt Leben
const lifeCanvas = document.createElement('canvas');
const lifeCtx = lifeCanvas.getContext('2d');
lifeCanvas.id = 'lifeCanvas';
lifeCanvas.width = 957;
lifeCanvas.height = 60;
document.body.appendChild(lifeCanvas);

// Erstellt schwarze Ränder
const blackCanvas = document.createElement('canvas');
const blackCtx = blackCanvas.getContext('2d');
blackCanvas.id = 'blackCanvas';
blackCanvas.width = 1050;
blackCanvas.height = 947;
blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height)
document.body.appendChild(blackCanvas);


let seconds_left = 240;
let lives = 3;
let interval; // Intervall für Timer

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

// Definiert die verschiedenen Typen von Objekten im Spiel
const types = {
    wall: '🟩', // Wand
    brick: 1, // zerstörbarer Block
    bomb: 2 // Bombe
};

// Item-Typen
const items = {
    extraBombs: '💣',// Erhöht die Anzahl der Bomben
    fireUp: '🔥', // Erhöht die Explosionsrange
    pierce: '🪡' // Extra Hit
};

let substances = []; // Alle Substances wie Spieler, Bomben, Explosionen
let cells = []; // Raster vom Spielfeld

// Spielfeld-Template
class Level {
    constructor() {
        this.template = [
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩'],
            ['🟩',1,1,0,0,0,0,0,0,0,0,0,1,1,'🟩'],
            ['🟩',1,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',1,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩'],
            ['🟩',0,0,0,0,0,0,0,0,0,0,0,0,0,'🟩'],
            ['🟩',1,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',0,'🟩',1,'🟩'],
            ['🟩',1,1,0,0,0,0,0,0,0,0,0,1,1,'🟩'],
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

// Main-klasse für Substances wie Bomben, Explosionen und Spieler
class Substance {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    update(frameTime) {}
    render() {}
}

const itemCanvas = document.querySelector('canvas');
const itemCtx = itemCanvas.getContext('2d');

// Klasse für Items
class Item {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.secondsLeft = 10;
        this.interval = null;
        this.alive = true;

        this.img = new Image();
        if (this.type === '💣') {
            this.img.src = 'assets/bomb_up.png';
        } else if (this.type === '🔥') {
            this.img.src = 'assets/fire_up.png';
        } else if (this.type === '🪡') {
            this.img.src = 'assets/pierce_bomb.png';
        }

        this.imgLoaded = false;
        this.img.onload = () => {
            this.imgLoaded = true;
        };
    }

    // Items werden gerendert
    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        const size = 60;  // Größe des Items

        if (this.imgLoaded) {  // Prüft, ob das Bild vollständig geladen wurde
            itemCtx.drawImage(this.img, x - size / 2, y - size / 2, size, size);
        } else {
            // Wenn das Bild noch nicht geladen ist, zeige Symbol an
            itemCtx.font = '30px Arial';
            itemCtx.textAlign = 'center';
            itemCtx.fillText(this.type, x, y);
        }
    }

    // Updated das Item um es de-spawnen zu lassen
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
const itemChances = {
    '💣': 0.15,  // 15 % Wahrscheinlichkeit für Bomben
    '🔥': 0.15,  // 15 % Wahrscheinlichkeit für Fire Up
    '🪡': 1   // 5 % Wahrscheinlichkeit für Piercing Bomb
};

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

const bombCanvas = document.querySelector('canvas');
const bombCtx = bombCanvas.getContext('2d');

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
        this.img = new Image();

        // Wenn es eine Piercebomb ist, nutze das Bild der Piercebomb
        if (this.type === 'pierce') {
            this.img.src = 'assets/pierce.png';  // Piercebomb
        } else {
            this.img.src = 'assets/bomb.png';  // Standard Bombe
        }

        this.img.onload = () => {
            this.init();
        };
    }
    init() {
        bombCtx.drawImage(this.img, 0, 0, 16, 18, 0, 0, 16, 18);
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            blowUp(this); // Bombe explodiert

            // Explosion Sound
            const bombAudio = new Audio('sounds/Bomb.wav');
            bombAudio.volume = 0.15;
            bombAudio.play();
        }
        // 'Animation' für Bombe
        const interval = Math.ceil(this.timer / 500);
        this.radius = (interval % 2 === 0) ? grid * 0.4 : grid * 0.5; // Wechsel der Größe von der Bombe, wegen Animation
    }

    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        const size = this.radius * 2;
        // Bombenbild (jetzt das Bild der Piercebomb, wenn es eine ist)
        bombCtx.drawImage(this.img, x - size / 2, y - size / 2, size, size)
    }
}


const pierceBombCanvas = document.querySelector('canvas');
const pierceBombCtx = pierceBombCanvas.getContext('2d');

// Piercebomb-Klasse
class Piercebomb extends Substance {
    constructor(row, col, size, owner) {
        super(row, col);
        this.radius = grid * 0.4;
        this.size = size;
        this.owner = owner;
        this.alive = true;
        this.type = types.bomb;
        this.timer = 3000;
        this.img = new Image();

        this.img.src = 'assets/pierce.png';
        this.img.onload = () => {
            this.init();
        };
    }
    init() {
        pierceBombCtx.drawImage(this.img, 0, 0, 16, 18, 0, 0, 16, 18);
    }
    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            pierceBlowUp(this); // Bombe explodiert

            // Explosion Sound
            const bombAudio = new Audio('sounds/Bomb.wav');
            bombAudio.volume = 0.15;
            bombAudio.play();
        }
        // 'Animation' für Bombe
        const interval = Math.ceil(this.timer / 500);
        this.radius = (interval % 2 === 0) ? grid * 0.4 : grid * 0.5; // Wechsel der Größe von der Bombe, wegen Animation
    }

    render() {
        const x = (this.col + 0.5) * grid;
        const y = (this.row + 0.5) * grid;
        const size = this.radius * 2;
        // Bombenbild
        bombCtx.drawImage(this.img, x - size / 2, y - size / 2, size, size)
    }
}

// Explosion-Klasse
class Explosion extends Substance {
    constructor(row, col) {
        super(row, col);
        this.alive = true;
        this.timer = 300; // 300ms Lebenszeit der Explosion
        this.isPierceBomb = items.pierce; // Kennzeichnung, ob es eine Piercebomb war
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            this.alive = false; // Explosion endet
        }
    }

    render() {
        const x = this.col * grid + grid / 2;
        const y = this.row * grid + grid / 2;
        const maxRadius = grid * 0.4;

        let colors;

        if (this.isPierceBomb) {
            // Falls es eine Piercebomb war, wird die Explosion blau
            colors = [
                '#0066FF',  // Blau
                '#3399FF',  // Hellblau
                '#66CCFF'   // Sehr hellblau
            ];
        } else {
            // Sonst normale Explosion mit den originalen Farben
            colors = [
                '#D72B16',  // Rot
                '#EA6C05',  // Orange
                '#FFB700'   // Gelb
            ];
        }

        colors.forEach((color, index) => {
            context.beginPath();
            context.arc(x, y, maxRadius * (1 - index * 0.3), 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
        });
    }
}

const playerImages = {
    idle: new Image(),
    walkDown: [new Image(), new Image(), new Image(), new Image()],
    walkUp: [new Image(), new Image(), new Image(), new Image()],
    walkRight: [new Image(), new Image(), new Image(), new Image()],
    walkLeft: [new Image(), new Image(), new Image(), new Image()]
};

playerImages.idle.src = 'assets/bomberman_idle.png';
playerImages.walkDown[0].src = 'assets/bomberman_walk_down_1.png';
playerImages.walkDown[1].src = 'assets/bomberman_idle.png';
playerImages.walkDown[2].src = 'assets/bomberman_walk_down_2.png';
playerImages.walkDown[3].src = 'assets/bomberman_idle.png';


playerImages.walkUp[0].src = 'assets/bomberman_walk_up_1.png';
playerImages.walkUp[1].src = 'assets/bomberman_walk_up_idle.png';
playerImages.walkUp[2].src = 'assets/bomberman_walk_up_2.png';
playerImages.walkUp[3].src = 'assets/bomberman_walk_up_idle.png';

playerImages.walkRight[0].src = 'assets/bomberman_walk_right_1.png';
playerImages.walkRight[1].src = 'assets/bomberman_walk_right_idle.png';
playerImages.walkRight[2].src = 'assets/bomberman_walk_right_2.png';
playerImages.walkRight[3].src = 'assets/bomberman_walk_right_idle.png';

playerImages.walkLeft[0].src = 'assets/bomberman_walk_left_1.png';
playerImages.walkLeft[1].src = 'assets/bomberman_walk_left_idle.png';
playerImages.walkLeft[2].src = 'assets/bomberman_walk_left_2.png';
playerImages.walkLeft[3].src = 'assets/bomberman_walk_left_idle.png';



class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.numBombs = 1;
        this.bombSize = 3;
        this.bombRange = 2;
        this.walkingDownFrame = 0; // Index für das animierte Bild nach unten
        this.walkingUpFrame = 0; // Index für das animierte Bild nach oben
        this.walkingRightFrame = 0; // Index für das animierte Bild nach rechts
        this.walkingLeftFrame = 0; // Index für das animierte Bild nach links
    }

    render() {
        const x = (this.col + 0.5) * grid - grid / 2; // Zentrierung
        const y = (this.row + 0.5) * grid - grid / 2;

        // Wenn Spieler sich bewegt, spiele Bilder ab
        if (this.isMovingDown) {
            context.drawImage(playerImages.walkDown[this.walkingDownFrame], x, y, grid, grid); // UntenFrame
        } else if (this.isMovingUp) {
            context.drawImage(playerImages.walkUp[this.walkingUpFrame], x, y, grid, grid); // ObenFrame
        } else if (this.isMovingRight) {
            context.drawImage(playerImages.walkRight[this.walkingRightFrame], x, y, grid, grid); // RechtsFrame
        } else if (this.isMovingLeft) {
            context.drawImage(playerImages.walkLeft[this.walkingLeftFrame], x, y, grid, grid); // LinksFrame
        } else {
            context.drawImage(playerImages.idle, x, y, grid, grid); // Idle
        }
    }

    move(direction) {
        let newRow = this.row;
        let newCol = this.col;
        // 'isMoving' standardmäßig auf false
        this.isMovingDown = false;
        this.isMovingUp = false;
        this.isMovingRight = false;
        this.isMovingLeft = false;

        switch (direction) {
            case 'a':
                newCol--;
                this.isMovingLeft = true;// Spieler läuft nach links
                break;
            case 'w':
                newRow--;
                this.isMovingUp = true;// Spieler läuft nach oben
                break;
            case 'd':
                newCol++;
                this.isMovingRight = true;// Spieler läuft nach rechts
                break;
            case 's':
                newRow++;
                this.isMovingDown = true; // Spieler läuft nach unten
                break;
        }

        // Update Position und Bildwechsel für Animation
        if (this.isMovingDown) {
            this.walkingDownFrame = (this.walkingDownFrame + 1) % 4; // Wechselt zwischen den beiden Bildern
        }
        if (this.isMovingUp) {
            this.walkingUpFrame = (this.walkingUpFrame + 1) % 4;
        }
        if (this.isMovingRight) {
            this.walkingRightFrame = (this.walkingRightFrame + 1) % 4;
        }
        if (this.isMovingLeft) {
            this.walkingLeftFrame = (this.walkingLeftFrame + 1) % 4;
        }


        // Überprüft, ob die neue Position gültig ist (keine Wand oder Bombe)
        if (this.isValidMove(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;

            // Walking Sound (Hier platziert, damit Sound nicht IMMER abgespielt, wenn gegen Wand gelaufen wird bei Eingabe!)
            let walkAudio = new Audio('sounds/Walking.wav');
            walkAudio.volume = 0.4;
            walkAudio.play();

            this.getItem(); // Item einsammeln
        }
    }

    // Überprüft, ob Spieler auf ein gültiges Feld laufen kann
    isValidMove(row, col) {
        if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
            return false; // Außerhalb des Spielfelds
        } else if (cells[row][col] === types.bomb || cells[row][col] === types.wall || cells[row][col] === types.brick) { // Hindernisse
            return false;
        }

        return true; // Bewegung ist gültig, wenn kein Hindernis vorhanden ist
    }

    placeBomb() {
        // Platziert eine Piercebomb, wenn der Spieler das Item aktiviert hat
        if (!cells[this.row][this.col] && substances.filter(substance => substance.type === types.bomb && substance.owner === this).length < this.numBombs) {
            let bomb;

            // Da jede Bombe eine Piercebomb ist, wird sie als solche platziert
            if (this.hasPierceBomb) {
                bomb = new Piercebomb(this.row, this.col, this.bombSize, this);
            } else {
                bomb = new Bomb(this.row, this.col, this.bombSize, this); // Diese Zeile könnte entfernt werden, wenn alle Bomben Piercebombs sind
            }

            substances.push(bomb);
            cells[this.row][this.col] = types.bomb;

            // Place-Bomb Sound
            const bombPlaceAudio = new Audio('sounds/Place_Bomb.wav');
            bombPlaceAudio.volume = 0.4;
            bombPlaceAudio.play();
        }
    }


    getItem() {
        // Findet ein Item an der aktuellen Position
        let item = substances.find(substance => substance instanceof Item && substance.row === this.row && substance.col === this.col);

        if (item) {
            if (item.type === items.extraBombs) {
                // Bomb-Up Audio
                const bombUpAudio = new Audio('sounds/GetItem__.wav');
                bombUpAudio.volume = 0.09;
                bombUpAudio.play();

                if (this.numBombs < 8) {
                    this.numBombs++; // Mehr Bomben (max. 8)
                }
            } else if (item.type === items.fireUp) {
                // Fire-Up Audio
                const fireUpAudio = new Audio('sounds/GetItem.wav');
                fireUpAudio.volume = 0.09;
                fireUpAudio.play();

                if (this.bombRange < 8) {
                    this.bombRange++; // Range erhöhen (max. 58)
                }
            } else if (item.type === items.pierce) {  // Wenn es die Piercebomb ist
                // Piercebomb Audio
                const pierceBombAudio = new Audio('sounds/PierceBomb.wav');
                pierceBombAudio.volume = 0.09;
                pierceBombAudio.play();

                this.hasPierceBomb = true;  // Spieler erhält die Fähigkeit, eine Piercebomb zu legen
            }

            item.remove(); // Entfernt das Item nach Aufnahme
        }
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

// Timer beim Start des Spiels aufrufen
startTimer();
requestAnimationFrame(loop);