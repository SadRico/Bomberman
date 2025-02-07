let keysPressed = {
    'a': false,
    'w': false,
    'd': false,
    's': false,
    'ArrowUp': false
};

document.addEventListener('keydown', (event) => {
    if ((event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's') && !keysPressed[event.key] && canChangeDirection) {
        player.move(event.key);
        keysPressed[event.key] = true;
        canChangeDirection = false; // Verhindert sofortigen Richtungswechsel (Mashing)

        // Timeout um zu schnellen Richtungswechsel zu verhindern (Mashing)
        setTimeout(() => {
            canChangeDirection = true;
        }, 75); // Spieler 'Speed'
    }
    // Event für das Platzieren der Bombe
    else if (event.key === 'ArrowUp' && !keysPressed['ArrowUp']) {
        player.placeBomb();
        keysPressed['ArrowUp'] = true;
    }
});

// Event-Listener für Loslassen
document.addEventListener('keyup', (event) => {
    if (event.key === 'a' || event.key === 'w' || event.key === 'd' || event.key === 's' || event.key === 'ArrowUp') {
        keysPressed[event.key] = false;
    }
});