class Boss {
    constructor(row, col, level) {
        this.row = row;
        this.col = col;
        this.level = level;
        this.radius = 200;  // Radius der Hitbox
        this.speedX = 2;    // X Geschwindigkeit
        this.speedY = -2;   // Y Geschwindigkeit
        this.grid = 64;

        this.x = col * this.grid + this.grid / 2;  // Um den Mittelpunkt zu berechnen
        this.y = row * this.grid + this.grid / 2;

        this.img = new Image();
        this.img.src = 'assets/misc/boss.png';
        this.img.onload = () => {
            this.render();
        };
    }

    move() {
        // Berechnet die neue Position basierend auf speedX und speedY
        let nextX = this.x + this.speedX;
        let nextY = this.y + this.speedY;

        // Überprüfe, ob die neue Position eine Kollision mit den Rändern hat
        if (this.checkCollision(nextX, nextY)) {
            this.reverseDirection();  // Wenn Kollision, Richtung wechseln
        } else {
            this.x = nextX;  // Neue Position setzen
            this.y = nextY;
        }
    }

    checkCollision(x, y) {
        // Berechnet die Zeile und Spalte basierend auf den neuen Koordinaten
        const row = Math.floor(y / this.grid);
        const col = Math.floor(x / this.grid);

        // Überprüft Kollision mit den äußeren Wänden
        // Falls der Boss außerhalb der Level-Grenzen geht (erste oder letzte Zeile/Spalte)
        if (row < 0 || col < 0 || row >= this.level.template.length || col >= this.level.template[row].length) {
            return false; // Keine Kollision außerhalb des Levelbereichs
        }

        // Überprüft, ob die Zelle ein Block (9) ist und ob es sich um eine äußere Wand handelt
        if (this.level.template[row][col] === 9) {
            // Überprüft, ob es sich um eine äußere Wand handelt (erste und letzte Reihe/Spalte)
            if (row === 0 || col === 0 || row === this.level.template.length - 1 || col === this.level.template[row].length - 1) {
                return true; // Kollision mit äußerer Wand
            }
        }
        // Keine Kollision mit inneren Walls oder freien Zellen
        return false;
    }


    reverseDirection() {
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.speedX = -this.speedX; // Umkehren der horizontalen Richtung
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY; // Umkehren der vertikalen Richtung
        }
    }


    render() {
        // Berechnet die Position der oberen linken Ecke des Bildes
        const x = this.x - this.radius;  // x für obere linke Ecke (Mittelpunkt - Radius)
        const y = this.y - this.radius;  // y für obere linke Ecke (Mittelpunkt - Radius)
        const size = this.radius * 2;  // Bildgröße (2 * Radius)

        // Blinken bei Unverwundbarkeit
        if (boss_invincible && Math.floor(performance.now() / 200) % 2 !== 0) {
            return;  // Überspringt das rendern für den Blinkeffekt
        }
        bossCtx.drawImage(this.img, x, y, size, size);  // Bild wird auf Mittelpunkt gezeichnet
    }
}