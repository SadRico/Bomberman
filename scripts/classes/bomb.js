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