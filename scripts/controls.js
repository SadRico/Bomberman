let keysPressed = {
    'a': false,
    'w': false,
    'd': false,
    's': false,
    'ArrowUp': false
};

document.addEventListener('keydown', (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keysPressed) {
        keysPressed[event.key] = false;

        // Erlaubt erneutes Platzieren der Bombe beim Loslassen
        if (event.key === 'ArrowUp') {
            canPlaceBomb = true;
        }
    }
});