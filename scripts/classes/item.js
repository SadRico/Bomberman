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
