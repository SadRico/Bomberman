let keysPressed = {
    'a': false,
    'w': false,
    'd': false,
    's': false,
    ' ': false
};

let canChangeDirection = true;

document.addEventListener('keydown', (event) => {
    if ((event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') && !keysPressed[event.key] && canChangeDirection) {
        player.move(event.key);
        keysPressed[event.key] = true;
        canChangeDirection = false; // Verhindert sofortigen Richtungswechsel

        // Timeout um zu schnellen Richtungswechsel zu verhindern
        setTimeout(() => {
            canChangeDirection = true;
        }, 150);
    }
    // Event für das Platzieren der Bombe
    else if (event.key === ' ' && !keysPressed[' ']) {
        player.placeBomb();
        keysPressed[' '] = true;
    }
});

// Event-Listener für Loslassen
document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's' || event.key === ' ') {
        keysPressed[event.key] = false;
    }
});