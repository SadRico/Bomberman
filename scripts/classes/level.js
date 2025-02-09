// Spielfeld-Template
class Level {
    constructor() {
        this.template = [
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
            [9, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 9],
            [9, 1, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 1, 9],
            [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
            [9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9],
            [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
            [9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9],
            [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
            [9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9],
            [9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
            [9, 1, 9, 0, 9, 0, 9, 0, 9, 0, 9, 0, 9, 1, 9],
            [9, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 9],
            [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
        ];
    }

    // Generiert das Spielfeld basierend auf dem Template
    generate() {
        cells = [];
        totalBricks = 0;  // Zähler bei jedem neuen Level zurücksetzen

        for (let row = 0; row < numRows; row++) { // Geht durch jede Reihe des Spielfelds
            cells[row] = []; // Für jede Zeile wird leeres Array erstellt
            for (let col = 0; col < numCols; col++) { // Geht durch jede Spalte des Spielfelds
                if (!this.template[row][col] && Math.random() < 0.90) { // 90 % Chance, einen Block zu spawnen. überprüft, ob keine Wand da ist
                    cells[row][col] = types.brick; // Wenn Bedingung true, dann platziert Brick
                    totalBricks++;  // Jedes Mal, wenn ein Brick erstellt wird, den Zähler erhöhen

                } else if (this.template[row][col] === types.wall) {
                    cells[row][col] = types.wall; // Wenn Bedingung false, dann platziert Wall
                }
            }
        }
    }


    generate_bossLevel() {
        cells = [];
        for (let row = 0; row < numRows; row++) {
            cells[row] = [];
            for (let col = 0; col < numCols; col++) {
                if (!this.template[row][col] && Math.random() < 0.00) { // 0% Chance, einen Block zu spawnen. überprüft, ob keine Wand da ist
                    cells[row][col] = types.brick;

                } else if (this.template[row][col] === types.wall) {
                    cells[row][col] = types.wall;
                }
            }
        }
    }
}