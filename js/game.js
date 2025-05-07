// Retro Runner Game
// Main game script

// Import asset generator
// This will be loaded from separate script tag in index.html
// AssetGenerator is a global object

// Canvas setup
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Screens
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const scoreElement = document.getElementById("score");
const finalScoreElement = document.getElementById("final-score");

// Buttons
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

// Game variables
let gameActive = false;
let score = 0;
let animationId;
let speed = 5;
let lastTime = 0;
let deltaTime = 0;

// Game assets
let gameAssets = null;

// Game objects
let player = {
  x: 100,
  y: 0,
  width: 48,
  height: 48,
  velocityY: 0,
  isJumping: false,
  frameX: 0, // Current animation frame
  frameTimer: 0, // Timer for animations
  animationSpeed: 0.15, // Seconds per frame
};

let obstacles = [];
let coins = [];
let backgrounds = {
  far: { x: 0, speed: 0.2 },
  mid: { x: 0, speed: 0.5 },
  close: { x: 0, speed: 0.8 },
};

const GROUND_HEIGHT = 40;
const JUMP_FORCE = -800;
const GRAVITY = 1800;
const OBSTACLE_SPAWN_RATE = 0.5; // % chance per second
const COIN_SPAWN_RATE = 1; // % chance per second

// Responsive canvas sizing
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Update player's ground position after resize
  if (player) {
    player.y = canvas.height - GROUND_HEIGHT - player.height;
  }
}

// Generate or load game assets
function loadGameAssets() {
  // Generate assets if they don't exist
  if (!gameAssets) {
    console.log("Generating game assets...");
    gameAssets = AssetGenerator.generateAllAssets();
  }
}

// Initialize the game
function init() {
  resizeCanvas();
  loadGameAssets();

  // Hide start screen and show game
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  canvas.style.opacity = 1;

  // Reset game variables
  gameActive = true;
  score = 0;
  speed = 5;
  scoreElement.textContent = score;

  // Reset game objects
  player.x = 100;
  player.y = canvas.height - GROUND_HEIGHT - player.height;
  player.velocityY = 0;
  player.isJumping = false;
  player.frameX = 0;
  player.frameTimer = 0;

  obstacles = [];
  coins = [];

  // Start the game loop
  lastTime = performance.now();
  gameLoop();
}

// Game loop
function gameLoop(timestamp) {
  // Calculate delta time for smooth animations
  deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
  lastTime = timestamp;

  // Limit delta time to avoid large jumps
  if (deltaTime > 0.1) deltaTime = 0.1;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameActive) {
    // Update game state
    update(deltaTime);

    // Render game elements
    render();

    // Continue the game loop
    animationId = requestAnimationFrame(gameLoop);
  }
}

// Update game state
function update(deltaTime) {
  // Update player
  updatePlayer(deltaTime);

  // Spawn obstacles
  if (Math.random() < OBSTACLE_SPAWN_RATE * deltaTime) {
    spawnObstacle();
  }

  // Spawn coins
  if (Math.random() < COIN_SPAWN_RATE * deltaTime) {
    spawnCoin();
  }

  // Update obstacles
  updateObstacles(deltaTime);

  // Update coins
  updateCoins(deltaTime);

  // Update backgrounds for parallax effect
  updateBackgrounds(deltaTime);
}

// Update player state
function updatePlayer(deltaTime) {
  // Apply gravity
  if (player.isJumping) {
    player.velocityY += GRAVITY * deltaTime;
    player.y += player.velocityY * deltaTime;

    // Check if player landed
    if (player.y >= canvas.height - GROUND_HEIGHT - player.height) {
      player.y = canvas.height - GROUND_HEIGHT - player.height;
      player.velocityY = 0;
      player.isJumping = false;
    }
  }

  // Update animation
  player.frameTimer += deltaTime;
  if (player.frameTimer >= player.animationSpeed) {
    player.frameTimer = 0;

    // Select appropriate frame
    if (player.isJumping) {
      player.frameX = 3; // Jump frame
    } else {
      player.frameX = (player.frameX + 1) % 3; // Cycle between frames 0-2 for running
    }
  }
}

// Update obstacles
function updateObstacles(deltaTime) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

    // Move obstacle
    obstacle.x -= (speed + obstacle.speedMod) * deltaTime * 60;

    // Check if obstacle is off screen
    if (obstacle.x < -obstacle.width) {
      obstacles.splice(i, 1);
      continue;
    }

    // Check collision with player
    if (checkCollision(player, obstacle)) {
      gameOver();
      return;
    }
  }
}

// Update coins
function updateCoins(deltaTime) {
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];

    // Move coin
    coin.x -= speed * deltaTime * 60;

    // Animate coin
    coin.frameTimer += deltaTime;
    if (coin.frameTimer >= coin.animationSpeed) {
      coin.frameTimer = 0;
      coin.frameX = (coin.frameX + 1) % 4;
    }

    // Check if coin is off screen
    if (coin.x < -coin.width) {
      coins.splice(i, 1);
      continue;
    }

    // Check if player collected the coin
    if (checkCollision(player, coin)) {
      // Update score
      score++;
      scoreElement.textContent = score;

      // Increase speed gradually
      if (score % 10 === 0) {
        speed += 0.5;
      }

      // Remove coin
      coins.splice(i, 1);
    }
  }
}

// Update background layers for parallax effect
function updateBackgrounds(deltaTime) {
  Object.values(backgrounds).forEach((bg) => {
    bg.x -= bg.speed * speed * deltaTime * 60;
    // Reset background position when it goes off screen
    if (bg.x <= -canvas.width) {
      bg.x += canvas.width;
    }
  });
}

// Spawn obstacle
function spawnObstacle() {
  const obstacleType = Math.floor(Math.random() * 3);
  const obstacle = {
    x: canvas.width,
    y: canvas.height - GROUND_HEIGHT - 48,
    width: 48,
    height: 48,
    type: obstacleType,
    speedMod: Math.random() * 2, // Random speed modifier
  };
  obstacles.push(obstacle);
}

// Spawn coin
function spawnCoin() {
  const coin = {
    x: canvas.width,
    y: canvas.height - GROUND_HEIGHT - 24 - Math.random() * 80, // Random height
    width: 24,
    height: 24,
    frameX: 0,
    frameTimer: 0,
    animationSpeed: 0.1 + Math.random() * 0.1, // Random animation speed
  };
  coins.push(coin);
}

// Check collision between two objects
function checkCollision(objA, objB) {
  return (
    objA.x < objB.x + objB.width * 0.8 &&
    objA.x + objA.width * 0.7 > objB.x &&
    objA.y < objB.y + objB.height * 0.8 &&
    objA.y + objA.height * 0.7 > objB.y
  );
}

// Player jump
function playerJump() {
  if (!player.isJumping) {
    player.isJumping = true;
    player.velocityY = JUMP_FORCE;
  }
}

// Render game elements
function render() {
  // Draw background color
  ctx.fillStyle = "#4a608c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background layers (if available)
  if (gameAssets && gameAssets.backgrounds) {
    // Far background (mountains)
    renderBackgroundLayer(gameAssets.backgrounds.far, backgrounds.far.x, 0);
    renderBackgroundLayer(
      gameAssets.backgrounds.far,
      backgrounds.far.x + canvas.width,
      0
    );

    // Mid background (hills)
    renderBackgroundLayer(gameAssets.backgrounds.mid, backgrounds.mid.x, 0);
    renderBackgroundLayer(
      gameAssets.backgrounds.mid,
      backgrounds.mid.x + canvas.width,
      0
    );

    // Close background (ground details)
    renderBackgroundLayer(gameAssets.backgrounds.close, backgrounds.close.x, 0);
    renderBackgroundLayer(
      gameAssets.backgrounds.close,
      backgrounds.close.x + canvas.width,
      0
    );
  }

  // Draw ground
  ctx.fillStyle = "#3a4466";
  ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

  // Draw coins
  coins.forEach((coin) => {
    if (gameAssets && gameAssets.coins) {
      // Draw coin sprite from spritesheet
      ctx.drawImage(
        gameAssets.coins,
        coin.frameX * 24,
        0,
        24,
        24,
        coin.x,
        coin.y,
        coin.width,
        coin.height
      );
    } else {
      // Fallback to a simple shape
      ctx.fillStyle = "#feae34";
      ctx.beginPath();
      ctx.arc(coin.x + 12, coin.y + 12, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw player
  if (gameAssets && gameAssets.character) {
    // Draw player sprite from spritesheet
    ctx.drawImage(
      gameAssets.character,
      player.frameX * 48,
      0,
      48,
      48,
      player.x,
      player.y,
      player.width,
      player.height
    );
  } else {
    // Fallback to a simple rectangle
    ctx.fillStyle = "#ff7700";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // Draw obstacles
  obstacles.forEach((obstacle) => {
    if (gameAssets && gameAssets.obstacles) {
      // Draw obstacle sprite from spritesheet
      ctx.drawImage(
        gameAssets.obstacles,
        obstacle.type * 48,
        0,
        48,
        48,
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    } else {
      // Fallback to a simple shape
      ctx.fillStyle = "#cc2a41";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  });
}

// Render a background layer with tiling if needed
function renderBackgroundLayer(layerCanvas, x, y) {
  if (!layerCanvas) return;

  // Draw the background layer
  ctx.drawImage(layerCanvas, x, y);
}

// Game over function
function gameOver() {
  gameActive = false;
  cancelAnimationFrame(animationId);
  finalScoreElement.textContent = score;
  gameOverScreen.classList.remove("hidden");
}

// Event listeners
startButton.addEventListener("click", init);
restartButton.addEventListener("click", init);

// Handle window resize
window.addEventListener("resize", resizeCanvas);

// Initialize canvas size on load
window.addEventListener("load", resizeCanvas);

// Add keyboard controls
window.addEventListener("keydown", (e) => {
  if (gameActive && (e.key === "ArrowUp" || e.key === " " || e.key === "w")) {
    playerJump();
  }
});

// Touch controls for mobile
canvas.addEventListener("touchstart", () => {
  if (gameActive) {
    playerJump();
  }
});

// Display start screen initially
canvas.style.opacity = 0.3;
