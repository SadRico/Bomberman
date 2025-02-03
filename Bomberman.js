const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64;
const numRows = 13;
const numCols = 15;

const bombableWallCanvas = document.createElement('canvas');
const bombableWallCtx = bombableWallCanvas.getContext('2d');
bombableWallCanvas.width = bombableWallCanvas.height = grid;

bombableWallCtx.fillStyle = '#6d4520';
bombableWallCtx.fillRect(0, 0, grid, grid);


const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;

wallCtx.fillStyle = 'black';
wallCtx.fillRect(0, 0, grid, grid);
wallCtx.fillStyle = '#a9a9a9';
wallCtx.fillRect(2, 2, grid - 4, grid - 4);

const types = {
    wall: '🟩',
    bombableWall: 1,
    bomb: 2
};

let entities = [];
let cells = [];

class Level {
    constructor() {
        this.template = [
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩', '🟩','🟩'],
            ['🟩', 'x', 'x',    ,     ,    ,    ,    ,    ,    ,    ,    ,  'x', 'x','🟩'],
            ['🟩', 'x','🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    'x','🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    ,'🟩',       ,'🟩'],
            ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
            ['🟩', 'x','🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    'x','🟩'],
            ['🟩', 'x', 'x',    ,    ,     ,    ,    ,    ,    ,    ,    ,  'x', 'x','🟩'],
            ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩', '🟩', '🟩'],
        ];
    }

    //generiert das spielfeld
    generate() {
        cells = [];
        for (let row = 0; row < numRows; row++) {
            cells[row] = [];
            for (let col = 0; col < numCols; col++) {
                if (!this.template[row][col] && Math.random() < 0.90) { // 90% chance einen block zu spawnen
                    cells[row][col] = types.bombableWall;
                } else if (this.template[row][col] === types.wall) {
                    cells[row][col] = types.wall;
                }
            }
        }
    }
}

class Entity {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    update(frameTime) {}
    render() {}
}

class Bomb extends Entity {
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
            blowUpBomb(this);
        }
        // 'Animation' für Bombe
        const interval = Math.ceil(this.timer / 500);
        if (interval % 2 === 0) {
            this.radius = grid * 0.4;
        } else {
            this.radius = grid * 0.5;
        }
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

class Explosion extends Entity {
    constructor(row, col, center) {
        super(row, col);
        this.alive = true;
        this.timer = 300;
        this.center = center;
    }

    update(frameTime) {
        this.timer -= frameTime;
        if (this.timer <= 0) {
            this.alive = false;
        }
    }

    render() {
        const x = this.col * grid;
        const y = this.row * grid;

        context.fillStyle = '#D72B16'; // red
        context.fillRect(x, y, grid, grid);
        }
}

class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.numBombs = 1;
        this.bombSize = 3;
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

        switch (direction) {
            case 'a': newCol--; break;
            case 'w': newRow--; break;
            case 'd': newCol++; break;
            case 's': newRow++; break;
        }

        // Überprüft, ob die neue Position im Gitter gültig ist und keine Bombe, Wand oder Block enthält
        if (this.isValidMove(newRow, newCol)) {
            this.row = newRow;
            this.col = newCol;
        }
    }

    // Überprüft, ob der Spieler auf ein gültiges Feld laufen kann
    isValidMove(row, col) {
        // Überprüft, ob die neue Position innerhalb der Grenzen des Spielfeldes liegt
        if (row < 0 || row >= numRows || col < 0 || col >= numCols) {
            return false;
        }

        // Überprüft, ob auf der Zelle eine Bombe liegt
        if (cells[row][col] === types.bomb) {
            return false;
        }

        // Überprüft, ob das Ziel eine Wand oder ein Block ist
        if (cells[row][col] === types.wall || cells[row][col] === types.bombableWall) {
            return false;
        }

        return true; // Bewegung ist gültig, wenn kein Hindernis vorhanden ist
    }

    placeBomb() {
        if (!cells[this.row][this.col] && entities.filter(entity => entity.type === types.bomb && entity.owner === this).length < this.numBombs) {
            const bomb = new Bomb(this.row, this.col, this.bombSize, this);
            entities.push(bomb);
            cells[this.row][this.col] = types.bomb;
        }
    }
}

let player = new Player(1, 1); //startpostion vom spieler
let level = new Level();
level.generate();

function blowUpBomb(bomb) {
    if (!bomb.alive) return;
    bomb.alive = false;
    cells[bomb.row][bomb.col] = null;
    const directions = [{
        row: -1, col: 0
    }, {
        row: 1, col: 0
    }, {
        row: 0, col: -1
    }, {
        row: 0, col: 1
    }];

    const startRange = 2; // Bombenreichweite

    directions.forEach((direction) => {
        for (let i = 0; i < startRange; i++) {
            const row = bomb.row + direction.row * i;
            const col = bomb.col + direction.col * i;
            const cell = cells[row][col];
            if (cell === types.wall) return;
            entities.push(new Explosion(row, col, direction, i === 0));
            cells[row][col] = null;
            if (cell === types.bomb) {
                const nextBomb = entities.find((entity) => entity.type === types.bomb && entity.row === row && entity.col === col);
                blowUpBomb(nextBomb);
            }
            if (cell) return;
        }
    });
}


let last;
let frameTime;
function loop(timestamp) {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (!last) last = timestamp;
    frameTime = timestamp - last;
    last = timestamp;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            switch (cells[row][col]) {
                case types.wall:
                    context.drawImage(wallCanvas, col * grid, row * grid);
                    break;
                case types.bombableWall:
                    context.drawImage(bombableWallCanvas, col * grid, row * grid);
                    break;
            }
        }
    }

    entities.forEach(entity => {
        entity.update(frameTime);
        entity.render();
    });

    entities = entities.filter(entity => entity.alive);
    player.render();
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') {
        player.move(event.key);
    } else if (event.key === ' ') {
        player.placeBomb();
    }
});

requestAnimationFrame(loop);