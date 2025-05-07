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
const highScoreElement = document.getElementById("high-score");
const gameOverHighScoreElement = document.getElementById(
  "game-over-high-score"
);

// Buttons
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

// Game variables
let gameActive = false;
let score = 0;
let highScore = 0;
let animationId;
let speed = 5;
let lastTime = 0;
let deltaTime = 0;

// Difficulty progression system
let difficultyLevel = 1;
let nextDifficultyThreshold = 50; // Score needed for next difficulty increase
let difficultyProgressPercent = 0; // Visual progress toward next difficulty

// Game assets
let gameAssets = null;

// Particle system for visual effects
let particles = [];
const MAX_PARTICLES = 30; // Limit to avoid performance issues

// Game objects
let player = {
  x: 100,
  y: 0,
  width: 64,  // Increased from 48
  height: 64, // Increased from 48
  velocityY: 0,
  isJumping: false,
  frameX: 0, // Current animation frame
  frameTimer: 0, // Timer for animations
  animationSpeed: 0.15, // Seconds per frame
  // Power-up related properties
  hasPowerUp: false,
  powerUpType: null,
  powerUpTimeLeft: 0,
  isInvincible: false,
  hasDoublePoints: false,
  speedBoost: 0,
  effectDisplay: { alpha: 0, pulse: 0 }, // For visual effects
};

let obstacles = [];
let coins = [];
let powerUps = []; // Array to store active power-ups in the game
let backgrounds = {
  far: { x: 0, speed: 0.2 },
  mid: { x: 0, speed: 0.5 },
  close: { x: 0, speed: 0.8 },
};

const GROUND_HEIGHT = 40;
const JUMP_FORCE = -850; // Increased to accommodate larger player
const GRAVITY = 1800;
let OBSTACLE_SPAWN_RATE = 0.5; // % chance per second
let COIN_SPAWN_RATE = 1; // % chance per second
let POWER_UP_SPAWN_RATE = 0.2; // % chance per second (rarer than coins)
const POWER_UP_DURATION = 10; // Power-up duration in seconds
const SPEED_BOOST_MULTIPLIER = 1.5; // How much faster with speed boost
const DOUBLE_POINTS_MULTIPLIER = 2; // How many extra points for double points
const LOCAL_STORAGE_HIGH_SCORE_KEY = "retroRunnerHighScore";

// Performance tracking variables
let fpsCounter = {
  frames: 0,
  lastCheck: 0,
  currentFps: 0,
  fpsHistory: [],
  showStats: false,
};

// Detect browser for browser-specific optimizations
const browserInfo = {
  name: getBrowserName(),
  isMobile:
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),
  isLowEnd: false, // Will be determined based on FPS performance
};

// Game difficulty settings
const gameDifficulty = {
  easy: {
    obstacleSpawnRate: 0.3,
    coinSpawnRate: 1.2,
    powerUpSpawnRate: 0.3,
    speedIncrement: 0.3,
  },
  medium: {
    obstacleSpawnRate: 0.5,
    coinSpawnRate: 1.0,
    powerUpSpawnRate: 0.2,
    speedIncrement: 0.5,
  },
  hard: {
    obstacleSpawnRate: 0.7,
    coinSpawnRate: 0.8,
    powerUpSpawnRate: 0.15,
    speedIncrement: 0.7,
  },
};

// Current game settings (default: medium)
let currentDifficulty = gameDifficulty.medium;

// Asset loading optimization
let assetsLoaded = false;
let assetsLoadingStartTime = 0;

// Responsive canvas sizing
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Update player's ground position after resize
  if (player) {
    player.y = canvas.height - GROUND_HEIGHT - player.height;
  }
}

// Load high score from local storage
function loadHighScore() {
  try {
    const savedHighScore = localStorage.getItem(LOCAL_STORAGE_HIGH_SCORE_KEY);
    if (savedHighScore) {
      highScore = parseInt(savedHighScore);
      updateHighScoreDisplay();
    }
  } catch (error) {
    console.error("Error loading high score from local storage:", error);
  }
}

// Save high score to local storage
function saveHighScore() {
  try {
    localStorage.setItem(LOCAL_STORAGE_HIGH_SCORE_KEY, highScore.toString());
  } catch (error) {
    console.error("Error saving high score to local storage:", error);
  }
}

// Update high score display
function updateHighScoreDisplay() {
  if (highScoreElement) highScoreElement.textContent = highScore;
  if (gameOverHighScoreElement)
    gameOverHighScoreElement.textContent = highScore;
}

// Check and update high score
function checkHighScore() {
  if (score > highScore) {
    highScore = score;
    saveHighScore();
    updateHighScoreDisplay();
    return true;
  }
  return false;
}

// Generate or load game assets
function loadGameAssets() {
  if (assetsLoaded) {
    console.log("Using cached game assets");
    return;
  }

  // Generate assets if they don't exist
  if (!gameAssets) {
    console.log("Generating game assets...");
    try {
      // Apply browser-specific optimizations
      const assetQuality = browserInfo.isMobile ? "low" : "high";
      console.log(
        `Using ${assetQuality} quality assets for ${browserInfo.name}`
      );

      // Start with a smaller subset of assets for faster initial load
      gameAssets = AssetGenerator.generateAllAssets(assetQuality);
      console.log("Assets generated successfully:", gameAssets);

      // Apply browser-specific audio handling
      if (gameAssets.sounds) {
        preloadAudio(gameAssets.sounds);
      }

      // Optimize images
      if (gameAssets.backgrounds) {
        optimizeBackgroundLayers(gameAssets.backgrounds);
      }

      assetsLoaded = true;
    } catch (error) {
      console.error("Error generating assets:", error);
    }
  }
}

// Initialize the game
function init() {
  console.log("Game initialization started");
  resizeCanvas();

  // Track asset loading time
  assetsLoadingStartTime = performance.now();
  loadGameAssets();
  console.log(
    `Assets loaded in ${performance.now() - assetsLoadingStartTime}ms`
  );

  // Apply appropriate difficulty settings based on device capability
  adjustGameDifficultyForDevice();

  // Hide start screen and show game
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  canvas.style.opacity = 1;

  // Reset game variables
  gameActive = true;
  score = 0;
  speed = 5;
  difficultyLevel = 1;
  nextDifficultyThreshold = 50;
  difficultyProgressPercent = 0;
  scoreElement.textContent = score;

  // Reset game objects
  player.x = 100;
  player.y = canvas.height - GROUND_HEIGHT - player.height;
  player.velocityY = 0;
  player.isJumping = false;
  player.frameX = 0;
  player.frameTimer = 0;

  // Reset power-up properties
  player.hasPowerUp = false;
  player.powerUpType = null;
  player.powerUpTimeLeft = 0;
  player.isInvincible = false;
  player.hasDoublePoints = false;
  player.speedBoost = 0;
  player.effectDisplay = { alpha: 0, pulse: 0 };

  obstacles = [];
  coins = [];
  powerUps = [];
  particles = [];

  // Reset FPS counter
  fpsCounter.frames = 0;
  fpsCounter.lastCheck = performance.now();
  fpsCounter.fpsHistory = [];

  // Start the game loop
  lastTime = performance.now();
  gameLoop();
  console.log("Game loop started");
}

// Adjust game difficulty based on device performance
function adjustGameDifficultyForDevice() {
  if (browserInfo.isMobile) {
    // Reduce visual effects on mobile
    currentDifficulty = gameDifficulty.easy;
    console.log("Mobile device detected, optimizing for performance");
  }

  // Apply current difficulty settings
  OBSTACLE_SPAWN_RATE = currentDifficulty.obstacleSpawnRate;
  COIN_SPAWN_RATE = currentDifficulty.coinSpawnRate;
  POWER_UP_SPAWN_RATE = currentDifficulty.powerUpSpawnRate;
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

  // Track frames for FPS calculation
  fpsCounter.frames++;

  if (timestamp - fpsCounter.lastCheck >= 1000) {
    fpsCounter.currentFps = fpsCounter.frames;
    fpsCounter.fpsHistory.push(fpsCounter.currentFps);

    // Only keep last 10 FPS readings
    if (fpsCounter.fpsHistory.length > 10) {
      fpsCounter.fpsHistory.shift();
    }

    // Check for performance issues
    const avgFps =
      fpsCounter.fpsHistory.reduce((a, b) => a + b, 0) /
      fpsCounter.fpsHistory.length;
    if (avgFps < 30 && !browserInfo.isLowEnd) {
      console.warn("Low FPS detected, optimizing for performance");
      optimizeForLowEndDevice();
    }

    // Reset frame counter
    fpsCounter.frames = 0;
    fpsCounter.lastCheck = timestamp;
  }

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

  // Spawn power-ups (more rare than coins)
  if (Math.random() < POWER_UP_SPAWN_RATE * deltaTime) {
    spawnPowerUp();
  }

  // Update obstacles
  updateObstacles(deltaTime);

  // Update coins
  updateCoins(deltaTime);

  // Update power-ups
  updatePowerUps(deltaTime);

  // Update particles
  updateParticles(deltaTime);

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

    // Apply speed boost effect if active
    let currentSpeed = speed;
    if (player.hasPowerUp && player.speedBoost > 0) {
      currentSpeed *= player.speedBoost;
    }

    // Move obstacle
    obstacle.x -= (currentSpeed + obstacle.speedMod) * deltaTime * 60;

    // Check if obstacle is off screen
    if (obstacle.x < -obstacle.width) {
      obstacles.splice(i, 1);
      continue;
    }

    // Check collision with player unless invincible
    if (checkCollision(player, obstacle) && !player.isInvincible) {
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
      // Update score - double points if power-up is active
      const pointsToAdd = player.hasDoublePoints ? DOUBLE_POINTS_MULTIPLIER : 1;
      score += pointsToAdd;
      scoreElement.textContent = score;

      // Update difficulty progression
      updateDifficultyProgression(pointsToAdd);

      // If double points is active, show visual feedback
      if (player.hasDoublePoints) {
        // Create a temporary floating score text
        const floatingText = {
          x: coin.x,
          y: coin.y,
          text: `+${pointsToAdd}`,
          alpha: 1.0,
          life: 0.6, // life in seconds
        };

        // This is a simple way to display the text
        setTimeout(() => {
          const displayInterval = setInterval(() => {
            floatingText.y -= 1;
            floatingText.alpha -= 0.05;
            if (floatingText.alpha <= 0) {
              clearInterval(displayInterval);
            }
          }, 30);
        }, 0);
      }

      // Increase speed gradually
      if (score % 10 === 0) {
        speed += 0.5;
      }

      // Remove coin
      coins.splice(i, 1);

      // Create particles for visual effect
      createParticles(coin.x, coin.y, "#feae34", 10, 1);
    }
  }
}

// Update difficulty progression based on score
function updateDifficultyProgression(points) {
  // Calculate progress toward next difficulty level
  difficultyProgressPercent =
    ((score % nextDifficultyThreshold) / nextDifficultyThreshold) * 100;

  // Check if we should increase difficulty
  if (score >= difficultyLevel * nextDifficultyThreshold) {
    increaseDifficulty();
  }
}

// Update power-ups
function updatePowerUps(deltaTime) {
  // Update existing power-ups in the game world
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];

    // Move power-up
    powerUp.x -= speed * deltaTime * 60;

    // Animate power-up (pulsing effect)
    powerUp.frameTimer += deltaTime;
    if (powerUp.frameTimer >= powerUp.animationSpeed) {
      powerUp.frameTimer = 0;
      powerUp.pulse = (powerUp.pulse + 1) % 20;
    }

    // Check if power-up is off screen
    if (powerUp.x < -powerUp.width) {
      powerUps.splice(i, 1);
      continue;
    }

    // Check if player collected the power-up
    if (checkCollision(player, powerUp)) {
      // Apply power-up effect
      applyPowerUp(powerUp.type);

      // Remove power-up
      powerUps.splice(i, 1);

      // Create particles for visual effect
      const colors = ["#ff5e54", "#38b86e", "#fee761"];
      createParticles(powerUp.x, powerUp.y, colors[powerUp.type], 15, 1.5);
    }
  }

  // Update active power-up timer if player has one
  if (player.hasPowerUp) {
    player.powerUpTimeLeft -= deltaTime;

    // Update visual effects for the power-up
    player.effectDisplay.pulse =
      (player.effectDisplay.pulse + deltaTime * 5) % (Math.PI * 2);
    player.effectDisplay.alpha =
      0.3 + Math.sin(player.effectDisplay.pulse) * 0.1;

    // Check if power-up has expired
    if (player.powerUpTimeLeft <= 0) {
      removePowerUpEffects();
    }
  }
}

// Apply power-up effect based on type
function applyPowerUp(type) {
  // Reset any existing power-up
  removePowerUpEffects();

  // Set power-up active
  player.hasPowerUp = true;
  player.powerUpType = type;
  player.powerUpTimeLeft = POWER_UP_DURATION;

  // Apply specific power-up effect
  switch (type) {
    case 0: // Speed boost
      player.speedBoost = SPEED_BOOST_MULTIPLIER;
      console.log("Speed boost activated!");
      break;
    case 1: // Invincibility
      player.isInvincible = true;
      console.log("Invincibility activated!");
      break;
    case 2: // Double points
      player.hasDoublePoints = true;
      console.log("Double points activated!");
      break;
  }
}

// Remove all power-up effects
function removePowerUpEffects() {
  player.hasPowerUp = false;
  player.powerUpType = null;
  player.powerUpTimeLeft = 0;
  player.isInvincible = false;
  player.hasDoublePoints = false;
  player.speedBoost = 0;
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
    y: canvas.height - GROUND_HEIGHT - 64, // Adjusted for larger size
    width: 64, // Increased from 48
    height: 64, // Increased from 48
    type: obstacleType,
    speedMod: Math.random() * 2, // Random speed modifier
  };
  obstacles.push(obstacle);
}

// Spawn coin
function spawnCoin() {
  const coin = {
    x: canvas.width,
    y: canvas.height - GROUND_HEIGHT - 32 - Math.random() * 80, // Adjusted for larger size
    width: 32, // Increased from 24
    height: 32, // Increased from 24
    frameX: 0,
    frameTimer: 0,
    animationSpeed: 0.1 + Math.random() * 0.1, // Random animation speed
  };
  coins.push(coin);
}

// Spawn power-up
function spawnPowerUp() {
  // Random power-up type: 0 = speed boost, 1 = invincibility, 2 = double points
  const powerUpType = Math.floor(Math.random() * 3);
  const powerUp = {
    x: canvas.width,
    y: canvas.height - GROUND_HEIGHT - 32 - Math.random() * 100, // Adjusted for larger size
    width: 32, // Increased from 24
    height: 32, // Increased from 24
    type: powerUpType,
    frameX: 0,
    frameTimer: 0,
    animationSpeed: 0.08, // Slower animation than coins
    pulse: 0, // For visual pulsing effect
  };
  powerUps.push(powerUp);
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

    // Add jump sound effect if available
    if (gameAssets && gameAssets.sounds && gameAssets.sounds.jump) {
      gameAssets.sounds.jump.currentTime = 0;
      gameAssets.sounds.jump
        .play()
        .catch((error) => console.warn("Audio play error:", error));
    }
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

  // Only render visible elements (simple culling)
  // This prevents rendering objects that are off-screen
  const visibleObstacles = obstacles.filter(
    (obs) => obs.x > -obs.width && obs.x < canvas.width
  );

  const visibleCoins = coins.filter(
    (coin) => coin.x > -coin.width && coin.x < canvas.width
  );

  const visiblePowerUps = powerUps.filter(
    (powerUp) => powerUp.x > -powerUp.width && powerUp.x < canvas.width
  );

  // Draw coins (only visible ones)
  visibleCoins.forEach((coin) => {
    if (gameAssets && gameAssets.coins) {
      // Draw coin sprite from spritesheet, scaled up
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
      ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw power-ups (only visible ones)
  visiblePowerUps.forEach((powerUp) => {
    if (gameAssets && gameAssets.powerups) {
      // Draw power-up sprite from spritesheet with pulsing effect and scaling
      const pulseScale = 1 + Math.sin(powerUp.pulse * 0.3) * 0.1;
      const scaledWidth = powerUp.width * pulseScale;
      const scaledHeight = powerUp.height * pulseScale;
      const offsetX = (scaledWidth - powerUp.width) / 2;
      const offsetY = (scaledHeight - powerUp.height) / 2;

      ctx.drawImage(
        gameAssets.powerups,
        powerUp.type * 24,
        0,
        24,
        24,
        powerUp.x - offsetX,
        powerUp.y - offsetY,
        scaledWidth,
        scaledHeight
      );
    } else {
      // Fallback to a simple shape
      const colors = ["#ff5e54", "#38b86e", "#fee761"];
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2, powerUp.width/3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Draw player with power-up effect if active
  if (gameAssets && gameAssets.character) {
    // Draw player sprite from spritesheet, scaled up
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

    // Add visual effect when player has active power-up
    if (player.hasPowerUp) {
      ctx.save();

      // Different color overlays based on power-up type
      switch (player.powerUpType) {
        case 0: // Speed boost - blue trail effect
          ctx.globalAlpha = player.effectDisplay.alpha;
          ctx.fillStyle = "rgba(80, 200, 255, 0.6)";
          ctx.fillRect(player.x - 10, player.y, 10, player.height);
          break;
        case 1: // Invincibility - shield/glow effect
          ctx.globalAlpha = player.effectDisplay.alpha;
          ctx.strokeStyle = "rgba(255, 255, 100, 0.8)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width / 2 + 5,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          break;
        case 2: // Double points - sparkle effect
          ctx.globalAlpha = player.effectDisplay.alpha;
          ctx.fillStyle = "rgba(255, 100, 255, 0.7)";
          for (let i = 0; i < 3; i++) {
            const x = player.x + Math.random() * player.width;
            const y = player.y + Math.random() * player.height;
            const size = 3 + Math.random() * 4;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
      }

      // Display power-up time remaining
      const timeLeft = Math.ceil(player.powerUpTimeLeft);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.fillText(
        timeLeft.toString(),
        player.x + player.width / 2 - 4,
        player.y - 5
      );

      ctx.restore();
    }
  } else {
    // Fallback to a simple rectangle
    ctx.fillStyle = "#ff7700";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  // Draw obstacles (only visible ones)
  visibleObstacles.forEach((obstacle) => {
    if (gameAssets && gameAssets.obstacles) {
      // Draw obstacle sprite from spritesheet, scaled up
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

  // Render particles
  renderParticles();

  // If player has an active power-up, show an indicator
  if (player.hasPowerUp) {
    const powerUpLabels = ["SPEED", "SHIELD", "2X PTS"];
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText(
      `${powerUpLabels[player.powerUpType]}: ${Math.ceil(
        player.powerUpTimeLeft
      )}s`,
      10,
      30
    );
  }

  // Draw score in retro pixel style
  ctx.font = "16px 'Press Start 2P', monospace";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Add retro pixel effect around score display
  const scoreBoxX = 20;
  const scoreBoxY = 20;
  const scoreText = `SCORE: ${score}`;
  const scoreWidth = ctx.measureText(scoreText).width;

  // Draw score with pixel shadow effect
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(scoreText, scoreBoxX, scoreBoxY);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Display performance stats when enabled
  if (fpsCounter.showStats) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(canvas.width - 100, 10, 90, 60);

    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(`FPS: ${fpsCounter.currentFps}`, canvas.width - 90, 30);
    ctx.fillText(
      `Objects: ${obstacles.length + coins.length + powerUps.length}`,
      canvas.width - 90,
      50
    );
    ctx.fillText(`Browser: ${browserInfo.name}`, canvas.width - 90, 70);
  }
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

  // Check if this is a new high score
  const isNewHighScore = checkHighScore();

  // Update UI
  finalScoreElement.textContent = score;
  gameOverHighScoreElement.textContent = highScore;

  // Add visual indication if it's a new high score
  const highScoreMessage = document.querySelector(".high-score");
  if (highScoreMessage && isNewHighScore) {
    highScoreMessage.innerHTML = `NEW HIGH SCORE! <span id="game-over-high-score">${highScore}</span>`;
    highScoreMessage.style.color = "#ffff00";
    highScoreMessage.style.animation = "pulse 1s infinite alternate";
  } else if (highScoreMessage) {
    highScoreMessage.style.color = "#ffcc00";
    highScoreMessage.style.animation = "none";
  }

  gameOverScreen.classList.remove("hidden");

  // Play game over sound if available
  if (gameAssets && gameAssets.sounds && gameAssets.sounds.gameOver) {
    gameAssets.sounds.gameOver.currentTime = 0;
    gameAssets.sounds.gameOver
      .play()
      .catch((error) => console.warn("Audio play error:", error));
  }
}

// Setup all event listeners
function setupEventListeners() {
  console.log("Setting up event listeners");

  // Button controls
  if (startButton) {
    console.log("Start button found, attaching event listener");
    startButton.addEventListener("click", function () {
      console.log("Start button clicked");
      init();
    });
  } else {
    console.error("Start button not found!");
  }

  if (restartButton) {
    console.log("Restart button found, attaching event listener");
    restartButton.addEventListener("click", function () {
      console.log("Restart button clicked");
      init();
    });
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    // Start or restart the game with space bar
    if (e.key === " " || e.code === "Space") {
      console.log("Space bar pressed");
      if (!gameActive && startScreen.classList.contains("hidden") === false) {
        console.log("Starting game with space bar");
        init();
      } else if (
        !gameActive &&
        gameOverScreen.classList.contains("hidden") === false
      ) {
        console.log("Restarting game with space bar");
        init();
      } else if (gameActive) {
        playerJump();
      }
    } else if (
      gameActive &&
      (e.key === "ArrowUp" ||
        e.key === "w" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW")
    ) {
      playerJump();
    }
  });

  // Touch controls for mobile
  canvas.addEventListener("touchstart", () => {
    if (gameActive) {
      playerJump();
    }
  });

  // Handle clicking anywhere on the start screen to start the game
  startScreen.addEventListener("click", function () {
    console.log("Start screen clicked");
    if (!gameActive) {
      init();
    }
  });

  // Handle window resize
  window.addEventListener("resize", resizeCanvas);
}

// Detect browser name for browser-specific optimizations
function getBrowserName() {
  const userAgent = navigator.userAgent;
  let browser = "Unknown";

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browser = "Chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browser = "Firefox";
  } else if (userAgent.match(/safari/i)) {
    browser = "Safari";
  } else if (userAgent.match(/opr\//i)) {
    browser = "Opera";
  } else if (userAgent.match(/edg/i)) {
    browser = "Edge";
  }
  console.log(`Browser detected: ${browser}`);
  return browser;
}

// Check if browser is Safari for specific audio handling
function isSafari() {
  return browserInfo.name === "Safari";
}

// Optimize game for low-end devices
function optimizeForLowEndDevice() {
  browserInfo.isLowEnd = true;

  // Reduce spawn rates and effects
  currentDifficulty = gameDifficulty.easy;
  OBSTACLE_SPAWN_RATE = currentDifficulty.obstacleSpawnRate * 0.8;

  // Simplify rendering of background layers
  // Limit number of objects on screen by reducing max counts
}

// Preload and optimize audio
function preloadAudio(sounds) {
  if (!sounds) return;

  // For each sound in the sounds object
  Object.values(sounds).forEach((sound) => {
    if (sound instanceof HTMLAudioElement) {
      // Set low volume by default to avoid startling users
      sound.volume = 0.7;

      // For Safari, we need to handle audio differently
      if (isSafari()) {
        sound.preload = "auto";
      }

      // Add error handling for audio
      sound.addEventListener("error", (e) => {
        console.warn("Audio error:", e);
      });
    }
  });
}

// Optimize background layers for performance
function optimizeBackgroundLayers(backgrounds) {
  if (!backgrounds) return;

  // If on a low-end device, use simpler background
  if (browserInfo.isLowEnd) {
    // For low-end devices, we could simplify the background or use a static image
    console.log("Optimizing background layers for low-end device");
  }
}

// Run performance tests
function runPerformanceTests() {
  console.log("Running performance tests...");

  // Test FPS stability
  const testDuration = 5000; // 5 seconds
  const startTime = performance.now();
  let framesRendered = 0;

  function testFrame() {
    framesRendered++;

    if (performance.now() - startTime < testDuration) {
      requestAnimationFrame(testFrame);
    } else {
      // Test complete
      const fps = framesRendered / (testDuration / 1000);
      console.log(`Performance test complete. Average FPS: ${fps.toFixed(2)}`);

      // Recommend optimizations based on results
      if (fps < 30) {
        console.warn(
          "Low performance detected, automatically applying optimizations"
        );
        optimizeForLowEndDevice();
      }
    }
  }

  // Start the test
  requestAnimationFrame(testFrame);
}

// Test responsive design
function testResponsiveness() {
  console.log("Testing responsive design...");

  // Get current dimensions
  const currentWidth = canvas.width;
  const currentHeight = canvas.height;

  // Test common screen sizes
  const testSizes = [
    { width: 320, height: 568 }, // iPhone SE
    { width: 375, height: 667 }, // iPhone 6/7/8
    { width: 414, height: 896 }, // iPhone XR
    { width: 768, height: 1024 }, // iPad
    { width: 1366, height: 768 }, // Laptop
    { width: 1920, height: 1080 }, // Desktop
  ];

  testSizes.forEach((size) => {
    console.log(`Testing layout at ${size.width}x${size.height}...`);
    // This is simulation only, would need actual resize in a real test environment
  });

  // Restore original dimensions
  canvas.width = currentWidth;
  canvas.height = currentHeight;
}

// Additional event listeners for testing functionality
function setupTestingEventListeners() {
  // Add keyboard shortcut for running performance test
  window.addEventListener("keydown", (e) => {
    // Ctrl+Shift+T runs performance tests
    if (e.ctrlKey && e.shiftKey && (e.key === "t" || e.code === "KeyT")) {
      e.preventDefault(); // Prevent browser's default behavior
      runPerformanceTests();
    }

    // Ctrl+Shift+R tests responsiveness
    if (e.ctrlKey && e.shiftKey && (e.key === "r" || e.code === "KeyR")) {
      e.preventDefault();
      testResponsiveness();
    }
  });
}

// Update setupEventListeners to include testing functionality
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function () {
  originalSetupEventListeners();
  setupTestingEventListeners();
  console.log("Testing event listeners added");
};

// Initialize canvas size and event listeners on load
window.addEventListener("load", function () {
  console.log("Window loaded");
  resizeCanvas();
  loadHighScore();
  setupEventListeners();

  // Display start screen initially
  canvas.style.opacity = 0.3;
});

// Toggle performance stats display with 'P' key
window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.code === "KeyP") {
    fpsCounter.showStats = !fpsCounter.showStats;
  }

  // Emergency performance mode toggle with 'O' key
  if (e.key === "o" || e.code === "KeyO") {
    optimizeForLowEndDevice();
  }

  // Toggle difficulty with '1', '2', '3' keys
  if (e.key === "1") {
    currentDifficulty = gameDifficulty.easy;
    adjustGameDifficultyForDevice();
  } else if (e.key === "2") {
    currentDifficulty = gameDifficulty.medium;
    adjustGameDifficultyForDevice();
  } else if (e.key === "3") {
    currentDifficulty = gameDifficulty.hard;
    adjustGameDifficultyForDevice();
  }
});

// Create particles for visual effects
function createParticles(x, y, color, count, speedMultiplier = 1) {
  // Limit particles based on performance settings
  if (browserInfo.isLowEnd) count = Math.floor(count * 0.5);

  // Don't exceed maximum particle count
  const availableSlots = MAX_PARTICLES - particles.length;
  if (availableSlots <= 0) return;

  // Adjust count to available slots
  count = Math.min(count, availableSlots);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (1 + Math.random() * 2) * speedMultiplier;

    particles.push({
      x: x,
      y: y,
      size: 2 + Math.random() * 3,
      color: color,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1, // Slight upward bias
      life: 0.5 + Math.random() * 0.5, // Life in seconds
      gravity: 0.5,
      alpha: 1,
    });
  }
}

// Update all particles
function updateParticles(deltaTime) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Apply gravity
    particle.vy += particle.gravity * deltaTime;

    // Update life and fade out
    particle.life -= deltaTime;
    particle.alpha = particle.life / 0.5; // Fade based on remaining life

    // Remove dead particles
    if (particle.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Render particles
function renderParticles() {
  ctx.save();

  // Draw all active particles
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Increase difficulty when reaching threshold
function increaseDifficulty() {
  difficultyLevel++;

  // Create a visual effect for level up
  createLevelUpEffect();

  // Scale difficulty based on level
  OBSTACLE_SPAWN_RATE += 0.1;
  POWER_UP_SPAWN_RATE = Math.max(0.05, POWER_UP_SPAWN_RATE - 0.02); // Power-ups get rarer

  // Increase speed slightly
  speed += currentDifficulty.speedIncrement;

  console.log(`Difficulty increased to level ${difficultyLevel}`);
}

// Create visual effect for level up
function createLevelUpEffect() {
  // Create particles all across the bottom of the screen
  for (let x = 0; x < canvas.width; x += 50) {
    createParticles(x, canvas.height - GROUND_HEIGHT - 10, "#ffffff", 5, 2);
  }

  // Create particles around the player for more emphasis
  createParticles(
    player.x + player.width / 2,
    player.y + player.height / 2,
    "#ffff00", // Golden color
    20,
    2.5
  );

  // Flash screen effect (if not on low-end device)
  if (!browserInfo.isLowEnd) {
    const flashOverlay = document.createElement("div");
    flashOverlay.style.position = "absolute";
    flashOverlay.style.top = "0";
    flashOverlay.style.left = "0";
    flashOverlay.style.width = "100%";
    flashOverlay.style.height = "100%";
    flashOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    flashOverlay.style.pointerEvents = "none";
    flashOverlay.style.zIndex = "10";
    flashOverlay.style.opacity = "0.7";
    flashOverlay.style.transition = "opacity 0.5s ease-out";

    document.querySelector(".game-container").appendChild(flashOverlay);

    setTimeout(() => {
      flashOverlay.style.opacity = "0";
      setTimeout(() => flashOverlay.remove(), 500);
    }, 100);

    // Display level-up text animation
    const levelUpText = document.createElement("div");
    levelUpText.textContent = `LEVEL ${difficultyLevel}!`;
    levelUpText.style.position = "absolute";
    levelUpText.style.top = "40%";
    levelUpText.style.left = "50%";
    levelUpText.style.transform = "translate(-50%, -50%) scale(0.5)";
    levelUpText.style.color = "#ffff00";
    levelUpText.style.fontFamily = "'Press Start 2P', monospace";
    levelUpText.style.fontSize = "36px";
    levelUpText.style.fontWeight = "bold";
    levelUpText.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.7)";
    levelUpText.style.zIndex = "11";
    levelUpText.style.opacity = "0";
    levelUpText.style.transition =
      "all 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    levelUpText.style.pointerEvents = "none";

    document.querySelector(".game-container").appendChild(levelUpText);

    // Animate the level up text
    setTimeout(() => {
      levelUpText.style.opacity = "1";
      levelUpText.style.transform = "translate(-50%, -50%) scale(1)";

      setTimeout(() => {
        levelUpText.style.opacity = "0";
        levelUpText.style.transform = "translate(-50%, -100%) scale(1.5)";
        setTimeout(() => levelUpText.remove(), 700);
      }, 1000);
    }, 100);
  }

  // Play level up sound if available
  if (gameAssets && gameAssets.sounds && gameAssets.sounds.powerup) {
    gameAssets.sounds.powerup.currentTime = 0;
    gameAssets.sounds.powerup
      .play()
      .catch((error) => console.warn("Audio play error:", error));
  }

  // Briefly slow down the game (temporal enhancement effect)
  const originalSpeed = speed;
  speed *= 0.5;

  // Return to normal speed after a short pause
  setTimeout(() => {
    speed = originalSpeed;
  }, 500);

  // Update UI to reflect new difficulty level
  const difficultyMessages = [
    "Getting tougher!",
    "Challenge accepted?",
    "Speed up!",
    "Watch out!",
    "Difficulty rising!",
  ];

  // Show a random encouragement message
  if (!browserInfo.isLowEnd) {
    const randomMessage =
      difficultyMessages[Math.floor(Math.random() * difficultyMessages.length)];
    const messageElement = document.createElement("div");
    messageElement.textContent = randomMessage;
    messageElement.style.position = "absolute";
    messageElement.style.bottom = "30%";
    messageElement.style.left = "50%";
    messageElement.style.transform = "translateX(-50%)";
    messageElement.style.color = "#ffffff";
    messageElement.style.fontFamily = "'Press Start 2P', monospace";
    messageElement.style.fontSize = "16px";
    messageElement.style.opacity = "0";
    messageElement.style.transition = "opacity 0.5s ease-in-out";
    messageElement.style.pointerEvents = "none";
    messageElement.style.zIndex = "11";

    document.querySelector(".game-container").appendChild(messageElement);

    setTimeout(() => {
      messageElement.style.opacity = "1";
      setTimeout(() => {
        messageElement.style.opacity = "0";
        setTimeout(() => messageElement.remove(), 500);
      }, 1500);
    }, 800);
  }
}
