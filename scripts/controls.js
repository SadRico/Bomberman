let keyCooldown = 0;

// Alle Inputs in der Reihenfolge von neu zu alt
let lastInputs = [];

let keysPressed = {
    'a': false,
    'w': false,
    'd': false,
    's': false,
    'ArrowUp': false
};

document.addEventListener('keydown', (event) => {
    if (event.key in keysPressed && keysPressed[event.key] !== true) {

        keysPressed[event.key] = true;

        if (lastInputs.indexOf(event.key) === -1) {
        	lastInputs.unshift(event.key);
        }

        evaluateControllerDirection(event.key);
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = false;

        // Erlaubt erneutes Platzieren der Bombe beim Loslassen
        if (event.key === 'ArrowUp') {
            canPlaceBomb = true;
        }

        let index = lastInputs.indexOf(event.key);
        if (index !== -1) {
        	lastInputs.splice(index, 1);
        }
    }
});