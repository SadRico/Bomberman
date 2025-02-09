class Player {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.level = level;
        this.numBombs = 1;
        this.bombSize = 3;
        this.bombRange = 2;
        this.walkingDownFrame = 0;
        this.walkingUpFrame = 0;
        this.walkingRightFrame = 0;
        this.walkingLeftFrame = 0;
    }

    render() {
        const x = (this.col + 0.5) * grid - grid / 2; // Zentrierung
        const y = (this.row + 0.5) * grid - grid / 2; // Zentrierung

        // Blinken bei Unverwundbarkeit
        if (invincible && Math.floor(performance.now() / 200) % 2 !== 0) { // Danke ChatGpt
            return;  // Überspringt das rendern, um Blinkeffekt zu erzeugen
        }

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
            this.walkingDownFrame = (this.walkingDownFrame + 1) % 4; // Wechselt zwischen den Bildern
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
            walkAudio.volume = 0.2;
            walkAudio.play();

            this.getItem();
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
                bomb = new Bomb(this.row, this.col, this.bombSize, this); // Ansonsten die normale Bombe
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
        let item = substances.find(substance => substance instanceof Item && substance.row === this.row && substance.col === this.col); // ergooglet

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

                this.hasPierceBomb = true;  // Spieler hat jetzt die Fähigkeit, eine Piercebomb zu legen
            }
            item.remove(); // Entfernt das Item nach dem einsammeln
        }
    }
}