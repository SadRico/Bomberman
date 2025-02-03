const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 64;
const numRows = 13;
const numCols = 15;

const bombableWallCanvas = document.createElement('canvas');
const bombableWallCtx = bombableWallCanvas.getContext('2d');
bombableWallCanvas.width = bombableWallCanvas.height = grid;

bombableWallCtx.fillstyle = 'black';
bombableWallCtx.fillRect(0, 0, grid, grid);
bombableWallCtx.fillStyle = '#a9a9a9';



const wallCanvas = document.createElement('canvas');
const wallCtx = wallCanvas.getContext('2d');
wallCanvas.width = wallCanvas.height = grid;

wallCtx.fillStyle = 'black';
wallCtx.fillRect(0, 0, grid, grid);
wallCtx.fillStyle = 'white';
wallCtx.fillRect(0, 0, grid - 2, grid - 2);
wallCtx.fillStyle = '#a9a9a9';
wallCtx.fillRect(2, 2, grid - 4, grid - 4);

const types = {
    wall: '🟩',
    bombableWall: 1,
    bomb: 2
};


let entities = [];

let cells = []

const template = [
    ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩', '🟩','🟩'],
    ['🟩', 'x', 'x',    ,     ,    ,    ,    ,    ,    ,    ,    ,  'x', 'x','🟩'],
    ['🟩', 'x','🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩', 'x','🟩'],
    ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,    ,'🟩'],
    ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    ,'🟩'],
    ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,    ,'🟩'],
    ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    ,'🟩'],
    ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,    ,'🟩'],
    ['🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩',    ,'🟩',    ,'🟩'],
    ['🟩',    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,    ,     ,     ,'🟩'],
    ['🟩', 'x','🟩',    ,'🟩',    ,'🟩',    ,'🟩',    ,'🟩',    , '🟩', 'x','🟩'],
    ['🟩', 'x', 'x',    ,    ,     ,    ,    ,    ,    ,    ,    ,  'x', 'x','🟩'],
    ['🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩','🟩', '🟩','🟩'],
];
