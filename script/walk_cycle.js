const playerImages = {
    idle: new Image(),
    walkDown: [new Image(), new Image(), new Image(), new Image()],
    walkUp: [new Image(), new Image(), new Image(), new Image()],
    walkRight: [new Image(), new Image(), new Image(), new Image()],
    walkLeft: [new Image(), new Image(), new Image(), new Image()]
};

playerImages.idle.src = 'assets/bomberman_idle.png';
playerImages.walkDown[0].src = 'assets/bomberman_walk_down_1.png';
playerImages.walkDown[1].src = 'assets/bomberman_idle.png';
playerImages.walkDown[2].src = 'assets/bomberman_walk_down_2.png';
playerImages.walkDown[3].src = 'assets/bomberman_idle.png';

playerImages.walkUp[0].src = 'assets/bomberman_walk_up_1.png';
playerImages.walkUp[1].src = 'assets/bomberman_walk_up_idle.png';
playerImages.walkUp[2].src = 'assets/bomberman_walk_up_2.png';
playerImages.walkUp[3].src = 'assets/bomberman_walk_up_idle.png';

playerImages.walkRight[0].src = 'assets/bomberman_walk_right_1.png';
playerImages.walkRight[1].src = 'assets/bomberman_walk_right_idle.png';
playerImages.walkRight[2].src = 'assets/bomberman_walk_right_2.png';
playerImages.walkRight[3].src = 'assets/bomberman_walk_right_idle.png';

playerImages.walkLeft[0].src = 'assets/bomberman_walk_left_1.png';
playerImages.walkLeft[1].src = 'assets/bomberman_walk_left_idle.png';
playerImages.walkLeft[2].src = 'assets/bomberman_walk_left_2.png';
playerImages.walkLeft[3].src = 'assets/bomberman_walk_left_idle.png';