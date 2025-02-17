// Game canvas
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64; // Größe eines Levelblocks
const numRows = 13; // Anzahl der Reihen
const numCols = 15; // Anzahl der Spalten

// Erstellt Canvas für feste Wände
const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;
const wallImage = new Image();
wallImage.src = 'assets/level_tiles/wall.png';
wallImage.onload = () => {
    wallCtx.drawImage(wallImage, 0, 0, grid, grid); // Wandbild auf Canvas zeichnen
};

// Erstellt Canvas für zerstörbare Blöcke
const brickCanvas = document.createElement('canvas');
const brickCtx = brickCanvas.getContext('2d');
brickCanvas.width = brickCanvas.height = grid;
const brickImage = new Image();
brickImage.src = 'assets/level_tiles/block.png';
brickImage.onload = () => {
    brickCtx.drawImage(brickImage, 0, 0, grid, grid); // Bild auf Canvas zeichnen
};

// Erstellt Boss
const bossCanvas = document.querySelector('canvas');
const bossCtx = bossCanvas.getContext('2d');

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

// Erstellt Controls Canvas
const controlsCanvas = document.createElement('canvas');
const controlsCtx = controlsCanvas.getContext('2d');
const controlsImage = new Image();
controlsImage.src = 'assets/misc/controls.png';

controlsImage.onload = () => {
    controlsCanvas.width = 250;
    controlsCanvas.height = 300;
    controlsCtx.drawImage(controlsImage, 0, 0, controlsCanvas.width, controlsCanvas.height);
};
controlsCanvas.id = 'controlsCanvas';
document.body.appendChild(controlsCanvas);

// Erstellt schwarze Ränder
const blackCanvas = document.createElement('canvas');
const blackCtx = blackCanvas.getContext('2d');
blackCanvas.id = 'blackCanvas';
blackCanvas.width = 1050;
blackCanvas.height = 926;
blackCtx.fillRect(0, 0, blackCanvas.width, blackCanvas.height);
document.body.appendChild(blackCanvas);

// Erstellt Bomben
const bombCanvas = document.querySelector('canvas');
const bombCtx = bombCanvas.getContext('2d');

// Erstellt Pierce Bomb
const pierceBombCanvas = document.querySelector('canvas');
const pierceBombCtx = pierceBombCanvas.getContext('2d');

// Erstellt Items
const itemCanvas = document.querySelector('canvas');
const itemCtx = itemCanvas.getContext('2d');
