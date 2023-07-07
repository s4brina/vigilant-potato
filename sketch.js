// Initialize player variables
let player;
let playerSpeed = 3;
let projectiles = [];
let playerImages = [];
let currentImageIndex = 0;
let frameCountThreshold = 10;
let backgroundImage;
let fontRegular;
let grassWalkSound;
let playerRightImages = [];
let gameStarted = false;
let frameCount = 0;
let textX, textY;
let jiggleOffset = 5; // Maximum offset for the jiggle effect
let jiggleTimer = 0; // Timer to control the delay between each jiggle
let jiggleDelay = 10;
let isGameStarted = false;
let gameOverSound;

// Initialize monster variables
let monsters = [];
let monsterSpeed = 2;
let monsterSize = 32;
let numMonsters = 5;
let monsterImage;

// Initialize collectible variables
let collectibles = [];
let collectibleSize = 30;
let numCollectibles = 1;
let score = 0;
let scoreNeededToWin = 50;
let collectibleImage = [];
let collectibleSound;

// Flags to store arrow key states
let upKeyPressed = false;
let downKeyPressed = false;
let leftKeyPressed = false;
let rightKeyPressed = false;

// Variables for shooting pellets
let pellets = [];
let shootingInterval;
let shootingDuration = 10000;

function preload() {
  // Preload images and sounds
  playerImages[0] = loadImage("still.png");
  playerImages[1] = loadImage("running1.png");
  playerRightImages[0] = loadImage("rightstill.png");
  playerRightImages[1] = loadImage("rightrun.png");
  monsterImage = loadImage("foxleft.png");
  backgroundImage = loadImage("grass.png");
  grassWalkSound = loadSound("walking.mov");
  grassWalkSound.setVolume(1.0);
  collectibleImage = loadImage("collectible.png");
  collectibleSound = loadSound("collectibleSound.mp3");
  gameOverSound = loadSound("gameOverSound.mp3");
  gameOverSound.setVolume(0.5);
  fontRegular = loadFont("PressStart2P.ttf");
  soundtrack = loadSound("soundtrack.mp3");
  soundtrack.setVolume(0.1);
  soundtrack.loop();
}

function setup() {
  // Set up the canvas and initialize game objects
  textFont(fontRegular);
  createCanvas(600, 400);
  soundtrack.play();

  // Create player object
  player = new Player(width / 2, height / 2);

  // Create monster objects
  for (let i = 0; i < numMonsters; i++) {
    monsters.push(new Monster(random(width), random(height)));
  }

  // Create collectible objects
  for (let i = 0; i < numCollectibles; i++) {
    let collectibleX = random(width - collectibleSize); // Limit x position within canvas width
    let collectibleY = random(height - collectibleSize); // Limit y position within canvas height
    collectibles.push(new Collectible(collectibleX, collectibleY, collectibleImage));
  }

  // Start shooting pellets after a certain duration
  setTimeout(startShootingPellets, shootingDuration);
}

function draw() {
  // The main game loop, called repeatedly
  if (!gameStarted) {
    drawStartPage();
  } else {
    image(backgroundImage, 0, 0, 720, 500);

    // Move player based on arrow key states
    if (upKeyPressed) {
      player.moveUp();
      player.updateAnimation();
    }
    if (downKeyPressed) {
      player.moveDown();
      player.updateAnimation();
    }
    if (leftKeyPressed) {
      player.moveLeft();
      player.updateAnimation();
    }
    if (rightKeyPressed) {
      player.moveRight();
      player.updateAnimation();
    }

    // Display player
    player.display();
    
    if (score >= 50) {
    music.stop();
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2);
    noLoop(); // Stop the game loop
  } else {
    // Move and display the player
  }

    // Move and display monsters
    for (let i = 0; i < monsters.length; i++) {
      let monster = monsters[i];
      monster.move();
      monster.display();
      monster.shootPellet();

      // Check collision between player and monsters
      if (player.hits(monster)) {
        // Game over
        textSize(32);
        textAlign(CENTER);
        textFont(fontRegular);
        text("Game Over", width / 2, height / 2);
        noLoop();
        gameOver();
        return;
      }
    }

    // Move and display projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      let projectile = projectiles[i];
      projectile.move();
      projectile.display();

      // Check collision between projectiles and monsters
      for (let j = monsters.length - 1; j >= 0; j--) {
        let monster = monsters[j];
        if (projectile.hits(monster)) {
          monsters.splice(j, 1);
          projectiles.splice(i, 1);
          break;
        }
      }
    }

    // Move and display pellets
    for (let i = pellets.length - 1; i >= 0; i--) {
      let pellet = pellets[i];
      pellet.move();
      pellet.display();

      // Check collision between pellets and player
      if (pellet.hits(player)) {
        // Game over
        textSize(32);
        textAlign(CENTER);
        text("Game Over", width / 2, height / 2);
        noLoop();
        gameOver();
        return;
      }
    }

    // Check collision between player and collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      let collectible = collectibles[i];
      if (player.collects(collectible)) {
        collectibles.splice(i, 1);
        score++;

        collectibleSound.play();

        // Add a new collectible
        collectibles.push(
          new Collectible(random(width), random(height), collectibleImage)
        );

        // Check score and add more monsters if needed
        if (score % 10 === 0 && score !== 0 && monsters.length < numMonsters) {
          // Calculate the number of additional monsters to add
          let numAdditionalMonsters =
            Math.floor(score / 10) - (monsters.length - numMonsters);
          numAdditionalMonsters = Math.min(
            numAdditionalMonsters,
            numMonsters - monsters.length
          );

          // Add the additional monsters
          for (let j = 0; j < numAdditionalMonsters; j++) {
            monsters.push(new Monster(random(width), random(height)));
          }
        }
      }
    }

    // Display collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      let collectible = collectibles[i];
      collectible.display();
    }

    // Display score
    textSize(20);
    textAlign(LEFT);
    text("Score: " + score, 10, 30);
  }
}


function gameOver() {
  // Stop the game music
  soundtrack.stop();

  // Play the game over sound effect
  gameOverSound.play();
}

function startShootingPellets() {
  // Create a new pellet every second
  shootingInterval = setInterval(() => {
    for (let i = 0; i < monsters.length; i++) {
      monsters[i].shootPellet();
    }
  }, 1000);
}

function keyPressed() {
  if (key === '1') {
    startGame();
  }
  // Handle key press events
  if (keyCode === UP_ARROW) {
    upKeyPressed = true;
  } else if (keyCode === DOWN_ARROW) {
    downKeyPressed = true;
  } else if (keyCode === LEFT_ARROW) {
    leftKeyPressed = true;
  } else if (keyCode === RIGHT_ARROW) {
    rightKeyPressed = true;
  }
  
  function startGame() {
  gameStarted = true;
  console.log("Game started!");
  // Add your game logic here
}


  // Handle diagonal movement
  if (keyIsDown(UP_ARROW) && keyIsDown(LEFT_ARROW)) {
    player.moveUp();
    player.moveLeft();
  } else if (keyIsDown(UP_ARROW) && keyIsDown(RIGHT_ARROW)) {
    player.moveUp();
    player.moveRight();
  } else if (keyIsDown(DOWN_ARROW) && keyIsDown(LEFT_ARROW)) {
    player.moveDown();
    player.moveLeft();
  } else if (keyIsDown(DOWN_ARROW) && keyIsDown(RIGHT_ARROW)) {
    player.moveDown();
    player.moveRight();
  }
}



function drawStartPage() {
  background(0);
  textAlign(CENTER);
  fill(255);
  textSize(30);

  if (jiggleTimer <= 0) {
    // Add jiggle effect to the text position
    let xOffset = random(-jiggleOffset, jiggleOffset);
    let yOffset = random(-jiggleOffset, jiggleOffset);
    textX = width / 2 + xOffset;
    textY = height / 2.2 + yOffset;

    jiggleTimer = jiggleDelay; // Reset the timer
  } else {
    jiggleTimer--; // Decrease the timer
  }

  text("Chicken Run!", textX, textY);

  // Start button
  rectMode(CENTER);
  fill("rgb(238,216,146)");
  rect(width / 2, height / 2 + 50, 500, 50, 20);
  fill(0);
  textSize(15);
  text("Press button 1 to start.", width / 2, height / 1.99 + 55);
}

function mousePressed() {
  if (
    !gameStarted &&
    mouseX > width / 2 - 50 &&
    mouseX < width / 2 + 50 &&
    mouseY > height / 2 &&
    mouseY < height / 2 + 50
  ) {
    gameStarted = true;
  }
}

function keyReleased() {
  switch (keyCode) {
    case UP_ARROW:
      upKeyPressed = false;
      break;
    case DOWN_ARROW:
      downKeyPressed = false;
      break;
    case LEFT_ARROW:
      leftKeyPressed = false;
      break;
    case RIGHT_ARROW:
      rightKeyPressed = false;
      break;
  }
  player.stopGrassWalkSound();
}


class Player {
  // The Player class represents the player character in the game
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.direction = "left";
  }

  display() {
    let currentImage;
    if (this.direction === "left") {
      currentImage = playerImages[currentImageIndex];
    } else if (this.direction === "right") {
      currentImage = playerRightImages[currentImageIndex];
    }
    image(currentImage, this.x, this.y, this.size, this.size);
  }

  updateAnimation() {
    frameCount++;
    if (frameCount >= frameCountThreshold) {
      frameCount = 0;
      if (this.direction === "left") {
        currentImageIndex++;
        if (currentImageIndex >= playerImages.length) {
          currentImageIndex = 0;
        }
      } else if (this.direction === "right") {
        currentImageIndex++;
        if (currentImageIndex >= playerRightImages.length) {
          currentImageIndex = 0;
        }
      }
    }
  }

  moveUp() {
    if (this.y - playerSpeed >= 0) {
      this.y -= playerSpeed;
      this.playGrassWalkSound();
    }
  }

  moveDown() {
    if (this.y + this.size + playerSpeed <= height) {
      this.y += playerSpeed;
      this.playGrassWalkSound();
    }
  }

  moveLeft() {
    if (this.x - playerSpeed >= 0) {
      this.x -= playerSpeed;
      this.direction = "left";
      this.playGrassWalkSound();
    }
  }

  moveRight() {
    if (this.x + this.size + playerSpeed <= width) {
      this.x += playerSpeed;
      this.direction = "right";
      this.playGrassWalkSound();
    }
  }

  playGrassWalkSound() {
    if (!grassWalkSound.isPlaying()) {
      grassWalkSound.play();
    }
  }

  stopGrassWalkSound() {
    if (grassWalkSound.isPlaying()) {
      grassWalkSound.stop(); // Stop playing the sound effect
    }
  }

  hits(monster) {
    let d = dist(
      this.x + this.size / 2,
      this.y + this.size / 2,
      monster.x + monster.size / 2,
      monster.y + monster.size / 2
    );
    return d < (this.size + monster.size) / 2;
  }

    collects(collectible) {
    let d = dist(
      this.x + this.size / 2,
      this.y + this.size / 2,
      collectible.x + collectibleSize / 2,
      collectible.y + collectibleSize / 2
    );
    return d < (this.size + collectibleSize) / 2;
  }
}

class Monster {
  // The Monster class represents the enemy monsters in the game
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = monsterSize;
    this.directionX = random(-1, 1);
    this.directionY = random(-1, 1);
    this.shootInterval = 2000; // Time between shots
    this.lastShotTime = 0; // Time of the last shot

    // Load monster images for different directions
    this.leftImage = loadImage("foxleft.png");
    this.rightImage = loadImage("foxright.png");
    this.currentImage = this.leftImage; // Default image
  }

  move() {
    this.x += this.directionX * monsterSpeed;
    this.y += this.directionY * monsterSpeed;

    // Bounce off walls
    if (this.x <= 0 || this.x >= width - this.size) {
      this.directionX *= -1;
      this.x = constrain(this.x, 0, width - this.size); // Keep the fox within the canvas
    }
    if (this.y <= 0 || this.y >= height - this.size) {
      this.directionY *= -1;
      this.y = constrain(this.y, 0, height - this.size); // Keep the fox within the canvas
    }

    // Update the current image based on the movement direction
    if (this.directionX < 0) {
      this.currentImage = this.leftImage;
    } else if (this.directionX > 0) {
      this.currentImage = this.rightImage;
    }
  }

  display() {
    image(this.currentImage, this.x, this.y, this.size, this.size);
  }

  shootPellet() {
    if (millis() - this.lastShotTime >= this.shootInterval) {
      let playerX = player.x + player.size / 2;
      let playerY = player.y + player.size / 2;

      let dx = playerX - (this.x + this.size / 2);
      let dy = playerY - (this.y + this.size / 2);
      let distance = sqrt(dx * dx + dy * dy);

      let pelletX = this.x + this.size / 2;
      let pelletY = this.y;

      let pelletXSpeed = (dx / distance) * this.speed;
      let pelletYSpeed = (dy / distance) * this.speed;

      pellets.push(new Pellet(pelletX, pelletY, pelletXSpeed, pelletYSpeed));
      this.lastShotTime = millis();
    }
  }
}

class Projectile {
  // The Projectile class represents the projectiles shot by the player
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.speed = 5;
  }

  move() {
    this.y -= this.speed;
  }

  display() {
    fill(0, 0, 255);
    ellipse(this.x, this.y, this.size, this.size);
  }

  hits(monster) {
    let d = dist(
      this.x,
      this.y,
      monster.x + monster.size / 2,
      monster.y + monster.size / 2
    );
    return d < (this.size + monster.size) / 2;
  }
}

class Pellet {
  constructor(x, y) {
    this.x = x; // X-coordinate of the pellet
    this.y = y; // Y-coordinate of the pellet
    this.size = 5;
    this.speed = 3;
  }

  move() {
    this.y += this.speed; // Update the position of the pellet
  }

  display() {
    noStroke();
    fill("#FFEB3B");
    ellipse(this.x, this.y, this.size, this.size);
  }

    hits(player) {
    let d = dist(this.x, this.y, player.x, player.y); // Calculate the distance between the pellet and the player's position
    return d < (this.size + player.size) / 3; // Return true if the distance is less than the sum of the pellet size and player size divided by 2
  }
}

class Collectible {
  constructor() {
    this.size = 30;
    this.image = collectibleImage; // Assign the loaded image to the `image` property
    this.x = random(width - this.size);
    this.y = random(height - this.size);
  }

  display() {
    image(this.image, this.x, this.y, this.size, this.size);
  }
}

