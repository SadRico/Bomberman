// Main-klasse für Substances wie Bomben, Explosionen und Spieler
class Substance {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    update(frameTime) {}
    render() {}
}

// Spieler Klasse
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
                const pierceBombAudio = new Audio('sounds/GetItem__.wav');
                pierceBombAudio.volume = 0.09;
                pierceBombAudio.play();

                this.hasPierceBomb = true;  // Spieler erhält die Fähigkeit, eine Piercebomb zu legen
            }

            item.remove(); // Entfernt das Item nach Aufnahme
        }
    }
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
        substances = substances.filter(substance => substance !== this);
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
    constructor(row, col, type) {
        super(row, col);
        this.alive = true;
        this.timer = 300; // 300ms Lebenszeit der Explosion
        this.type = type; // Kennzeichnung, ob es eine Piercebomb war
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

        if (this.type === 'pierce') {  // Falls Piercebomb, benutze Blau-Töne
            colors = ['#0066FF', '#3399FF', '#66CCFF'];
        } else {
            colors = ['#D72B16', '#EA6C05', '#FFB700'];  // Standard Rot-Orange-Gelb
        }

        colors.forEach((color, index) => {
            context.beginPath();
            context.arc(x, y, maxRadius * (1 - index * 0.3), 0, Math.PI * 2);
            context.fillStyle = color;
            context.fill();
        });
    }
}
