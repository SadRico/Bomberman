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