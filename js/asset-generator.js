/**
 * Retro Mini-Game Asset Generator
 * This file contains utilities to generate pixel art game assets
 */

// Create an off-screen canvas for asset generation
const generateCanvas = document.createElement("canvas");
const generateCtx = generateCanvas.getContext("2d");

// Asset generation utilities
const AssetGenerator = {
  // Color palettes for a retro look with MYOB brand colors incorporated
  palettes: {
    character: ["#181425", "#5a6988", "#3a4466", "#262b44", "#ff0044"],
    environment: ["#181425", "#262b44", "#3a4466", "#5a6988", "#8b9bb4"],
    // MYOB Purple (#6542a6) color integrated into coins
    coins: ["#181425", "#6542a6", "#8663ba", "#a384cf", "#ffffff"],
    // MYOB Purple in power-ups
    powerups: ["#181425", "#7a3045", "#6542a6", "#ff5e54", "#38b86e"],
    // MYOB brand colors palette
    myob: ["#6542a6", "#9469e3", "#00b0a6", "#e12229", "#0070c0"],
  },

  // Quality settings for different device capabilities
  qualitySettings: {
    low: {
      backgroundDetailLevel: 0.5, // Reduce background details
      animationFrameCount: 2, // Use fewer animation frames
      particleEffects: false, // Disable particle effects
      shadowEffects: false, // Disable shadow effects
      backgroundSize: 0.75, // Scale down background size
    },
    medium: {
      backgroundDetailLevel: 0.8,
      animationFrameCount: 3,
      particleEffects: true,
      shadowEffects: false,
      backgroundSize: 1.0,
    },
    high: {
      backgroundDetailLevel: 1.0,
      animationFrameCount: 4,
      particleEffects: true,
      shadowEffects: true,
      backgroundSize: 1.0,
    },
  },

  // Current quality setting
  currentQuality: "high",

  // Assets cache to avoid regenerating
  assetsCache: {},

  // Set the quality level for asset generation
  setQuality(quality) {
    if (this.qualitySettings[quality]) {
      this.currentQuality = quality;
      console.log(`Asset quality set to: ${quality}`);
      return true;
    }
    console.warn(`Invalid quality level: ${quality}. Using high quality.`);
    this.currentQuality = "high";
    return false;
  },

  /**
   * Generate a sprite sheet for a character with running animation
   * @returns {HTMLCanvasElement} Canvas element with the sprite sheet
   */
  generateCharacterSprite() {
    const cacheKey = `character_${this.currentQuality}`;
    if (this.assetsCache[cacheKey]) {
      return this.assetsCache[cacheKey];
    }

    const settings = this.qualitySettings[this.currentQuality];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Determine number of frames based on quality
    const frameCount = settings.animationFrameCount;
    canvas.width = frameCount * 48; // frameCount frames x 48px
    canvas.height = 48;

    // Frame 1: Standing
    this._drawCharacter(ctx, 0, 0, false);

    // Frame 2: Running pose 1
    this._drawCharacter(ctx, 48, 0, true, 1);

    // Additional frames based on quality
    if (frameCount > 2) {
      // Frame 3: Running pose 2
      this._drawCharacter(ctx, 96, 0, true, 2);
    }

    if (frameCount > 3) {
      // Frame 4: Jumping pose
      this._drawCharacter(ctx, 144, 0, false, 0, true);
    }

    // Cache and return
    this.assetsCache[cacheKey] = canvas;
    return canvas;
  },

  /**
   * Draw a pixel art character at the specified position
   */
  _drawCharacter(ctx, x, y, isRunning, runFrame = 0, isJumping = false) {
    const palette = this.palettes.character;

    // Head
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 18, y + 8, 12, 12);

    // Body
    ctx.fillStyle = palette[1];
    ctx.fillRect(x + 16, y + 20, 16, 14);

    // Eyes
    ctx.fillStyle = palette[0];
    ctx.fillRect(x + 22, y + 12, 4, 4);

    // Arms
    ctx.fillStyle = palette[2];
    if (isJumping) {
      // Arms up for jumping
      ctx.fillRect(x + 14, y + 20, 4, 8);
      ctx.fillRect(x + 32, y + 20, 4, 8);
    } else {
      ctx.fillRect(x + 12, y + 24, 4, 8);
      ctx.fillRect(x + 32, y + 24, 4, 8);
    }

    // Legs
    ctx.fillStyle = palette[2];
    if (isRunning) {
      if (runFrame === 1) {
        ctx.fillRect(x + 18, y + 34, 4, 8);
        ctx.fillRect(x + 26, y + 32, 4, 10);
      } else {
        ctx.fillRect(x + 18, y + 32, 4, 10);
        ctx.fillRect(x + 26, y + 34, 4, 8);
      }
    } else if (isJumping) {
      ctx.fillRect(x + 18, y + 34, 4, 6);
      ctx.fillRect(x + 26, y + 34, 4, 6);
    } else {
      ctx.fillRect(x + 18, y + 34, 4, 8);
      ctx.fillRect(x + 26, y + 34, 4, 8);
    }

    // Add accent color
    ctx.fillStyle = palette[4]; // Red accent
    ctx.fillRect(x + 22, y + 25, 4, 4);
  },

  /**
   * Generate obstacle sprites
   * @returns {HTMLCanvasElement} Canvas with obstacle sprites
   */
  generateObstacleSprites() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 144; // 3 obstacles x 48px
    canvas.height = 48;

    // Obstacle 1: Small cactus-like
    this._drawObstacle1(ctx, 0, 0);

    // Obstacle 2: Medium rock-like
    this._drawObstacle2(ctx, 48, 0);

    // Obstacle 3: Tall spike-like
    this._drawObstacle3(ctx, 96, 0);

    return canvas;
  },

  /**
   * Draw a small cactus-like obstacle
   */
  _drawObstacle1(ctx, x, y) {
    const palette = this.palettes.environment;

    // Base
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 18, y + 32, 12, 16);

    // Arms
    ctx.fillRect(x + 12, y + 24, 6, 4);
    ctx.fillRect(x + 30, y + 20, 6, 4);

    // Details
    ctx.fillStyle = palette[3];
    ctx.fillRect(x + 22, y + 32, 4, 16);
  },

  /**
   * Draw a medium rock-like obstacle
   */
  _drawObstacle2(ctx, x, y) {
    const palette = this.palettes.environment;
    const myobPalette = this.palettes.myob;

    // Base shape
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 14, y + 32, 20, 16);
    ctx.fillRect(x + 18, y + 28, 12, 4);

    // Highlights
    ctx.fillStyle = palette[3];
    ctx.fillRect(x + 16, y + 36, 4, 4);
    ctx.fillRect(x + 26, y + 32, 6, 6);

    // MYOB brand element - subtle purple accent
    ctx.fillStyle = myobPalette[0]; // MYOB purple
    ctx.fillRect(x + 20, y + 40, 8, 2);
    ctx.fillRect(x + 22, y + 38, 4, 2);
  },

  /**
   * Draw a tall spike-like obstacle
   */
  _drawObstacle3(ctx, x, y) {
    const palette = this.palettes.environment;
    const myobPalette = this.palettes.myob;

    // Base
    ctx.fillStyle = palette[1];
    ctx.fillRect(x + 16, y + 32, 16, 16);

    // Spikes
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 18, y + 16, 4, 16);
    ctx.fillRect(x + 24, y + 20, 4, 12);
    ctx.fillRect(x + 14, y + 24, 4, 8);
    ctx.fillRect(x + 30, y + 24, 4, 8);

    // Highlights
    ctx.fillStyle = palette[3];
    ctx.fillRect(x + 20, y + 24, 2, 8);
    ctx.fillRect(x + 26, y + 28, 2, 4);

    // MYOB brand element - teal accent on the spike
    ctx.fillStyle = myobPalette[2]; // MYOB teal
    ctx.fillRect(x + 19, y + 18, 2, 4);
  },

  /**
   * Generate animated coin sprites
   * @returns {HTMLCanvasElement} Canvas with coin animation frames
   */
  generateCoinSprites() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 96; // 4 frames x 24px
    canvas.height = 24;

    // Frame 1: Full coin
    this._drawCoin(ctx, 0, 0, 1);

    // Frame 2: Slightly rotated
    this._drawCoin(ctx, 24, 0, 0.8);

    // Frame 3: Edge view
    this._drawCoin(ctx, 48, 0, 0.5);

    // Frame 4: Almost invisible
    this._drawCoin(ctx, 72, 0, 0.2);

    return canvas;
  },

  /**
   * Draw a single coin frame with the given width ratio (for rotation effect)
   */
  _drawCoin(ctx, x, y, widthRatio) {
    const palette = this.palettes.coins;
    const centerX = x + 12;
    const width = Math.max(2, Math.floor(12 * widthRatio));

    // Coin shape
    ctx.fillStyle = palette[1]; // MYOB purple base
    ctx.fillRect(centerX - width / 2, y + 6, width, 12);

    // Highlight - lighter purple
    ctx.fillStyle = palette[3];
    ctx.fillRect(centerX - width / 2, y + 8, width, 4);

    // Outline
    ctx.fillStyle = palette[0]; // Dark outline
    ctx.fillRect(centerX - width / 2, y + 6, 1, 12);
    ctx.fillRect(centerX + width / 2 - 1, y + 6, 1, 12);
    ctx.fillRect(centerX - width / 2, y + 6, width, 1);
    ctx.fillRect(centerX - width / 2, y + 17, width, 1);

    // MYOB "M" logo hint (simplified for pixel art)
    if (widthRatio > 0.7) {
      // Only on front-facing frames
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(centerX - 2, y + 10, 1, 4); // Left line of M
      ctx.fillRect(centerX, y + 10, 1, 4); // Right line of M
      ctx.fillRect(centerX - 1, y + 10, 1, 1); // Top middle connector
    }
  },

  /**
   * Generate background layers for parallax scrolling
   * @returns {Object} Object containing different background layer canvases
   */
  generateBackgroundLayers() {
    const cacheKey = `backgrounds_${this.currentQuality}`;
    if (this.assetsCache[cacheKey]) {
      return this.assetsCache[cacheKey];
    }

    const backgrounds = {
      far: this._generateFarBackgroundLayer(),
      mid: this._generateMidBackgroundLayer(),
      close: this._generateCloseBackgroundLayer(),
    };

    // Cache and return
    this.assetsCache[cacheKey] = backgrounds;
    return backgrounds;
  },

  /**
   * Generate far background layer (mountains/sky)
   */
  _generateFarBackgroundLayer() {
    const settings = this.qualitySettings[this.currentQuality];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Scale canvas size based on quality
    const baseWidth = 480;
    const baseHeight = 160;
    canvas.width = baseWidth * settings.backgroundSize;
    canvas.height = baseHeight;

    const palette = this.palettes.environment;

    // Sky
    ctx.fillStyle = palette[4];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Far mountains
    ctx.fillStyle = palette[3];

    // Adjust detail level based on quality
    const mountainCount = Math.max(
      3,
      Math.floor((canvas.width / 80) * settings.backgroundDetailLevel)
    );
    const mountainSpacing = canvas.width / mountainCount;

    for (let i = 0; i < canvas.width; i += mountainSpacing) {
      const height = 40 + Math.random() * 30 * settings.backgroundDetailLevel;
      ctx.beginPath();
      ctx.moveTo(i, 160);
      ctx.lineTo(i + mountainSpacing / 4, 160 - height);
      ctx.lineTo(i + mountainSpacing, 160);
      ctx.fill();
    }

    return canvas;
  },

  /**
   * Generate mid background layer (hills)
   */
  _generateMidBackgroundLayer() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 320;
    canvas.height = 160;

    const palette = this.palettes.environment;

    // Hills
    ctx.fillStyle = palette[2];
    for (let i = 0; i < canvas.width; i += 60) {
      const height = 20 + Math.random() * 25;
      ctx.beginPath();
      ctx.moveTo(i, 160);
      ctx.quadraticCurveTo(i + 30, 160 - height, i + 60, 160);
      ctx.fill();
    }

    return canvas;
  },

  /**
   * Generate close background layer (small details)
   */
  _generateCloseBackgroundLayer() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 240;
    canvas.height = 160;

    const palette = this.palettes.environment;
    const myobPalette = this.palettes.myob;

    // Small bushes or rocks
    for (let i = 0; i < canvas.width; i += 40) {
      if (Math.random() > 0.3) {
        const width = 8 + Math.random() * 12;
        const height = 4 + Math.random() * 6;

        // Randomly use MYOB purple for some platform elements
        if (Math.random() > 0.6) {
          ctx.fillStyle = myobPalette[0]; // MYOB purple
        } else {
          ctx.fillStyle = palette[1];
        }

        ctx.fillRect(i, 160 - height, width, height);

        // Add MYOB teal accents to some elements
        if (Math.random() > 0.7) {
          ctx.fillStyle = myobPalette[2]; // MYOB teal
          ctx.fillRect(i + width / 4, 160 - height - 2, 2, 2);
        }
      }
    }

    return canvas;
  },

  /**
   * Generate power-up sprites
   * @returns {HTMLCanvasElement} Canvas with power-up sprites
   */
  generatePowerUpSprites() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 72; // 3 powerups x 24px
    canvas.height = 24;

    // Power-up 1: Speed boost
    this._drawSpeedBoost(ctx, 0, 0);

    // Power-up 2: Invincibility
    this._drawInvincibility(ctx, 24, 0);

    // Power-up 3: Double points
    this._drawDoublePoints(ctx, 48, 0);

    return canvas;
  },

  /**
   * Draw a speed boost power-up
   */
  _drawSpeedBoost(ctx, x, y) {
    const palette = this.palettes.powerups;

    // Base
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 8, y + 8, 8, 8);

    // Arrow
    ctx.fillStyle = palette[4];
    ctx.fillRect(x + 10, y + 10, 8, 4);
    ctx.fillRect(x + 14, y + 6, 4, 12);

    // Outline
    ctx.fillStyle = palette[0];
    ctx.fillRect(x + 8, y + 8, 8, 1);
    ctx.fillRect(x + 8, y + 15, 8, 1);
    ctx.fillRect(x + 8, y + 8, 1, 8);
    ctx.fillRect(x + 15, y + 8, 1, 8);
  },

  /**
   * Draw an invincibility power-up
   */
  _drawInvincibility(ctx, x, y) {
    const palette = this.palettes.powerups;
    const myobPalette = this.palettes.myob;

    // Shield shape using MYOB purple
    ctx.fillStyle = myobPalette[0]; // MYOB purple
    ctx.fillRect(x + 8, y + 6, 8, 12);
    ctx.fillRect(x + 6, y + 8, 12, 8);

    // Star center
    ctx.fillStyle = myobPalette[2]; // MYOB teal
    ctx.fillRect(x + 10, y + 10, 4, 4);

    // Outline
    ctx.fillStyle = palette[0];
    ctx.fillRect(x + 8, y + 6, 8, 1);
    ctx.fillRect(x + 8, y + 17, 8, 1);
    ctx.fillRect(x + 6, y + 8, 1, 8);
    ctx.fillRect(x + 17, y + 8, 1, 8);
  },

  /**
   * Draw a double points power-up
   */
  _drawDoublePoints(ctx, x, y) {
    const palette = this.palettes.powerups;
    const myobPalette = this.palettes.myob;

    // Base
    ctx.fillStyle = myobPalette[0]; // MYOB purple for base
    ctx.fillRect(x + 8, y + 8, 8, 8);

    // "x2" text
    ctx.fillStyle = "#ffffff"; // White text for contrast
    // "x"
    ctx.fillRect(x + 9, y + 9, 2, 2);
    ctx.fillRect(x + 11, y + 11, 2, 2);
    ctx.fillRect(x + 9, y + 13, 2, 2);
    ctx.fillRect(x + 11, y + 9, 1, 1);
    // "2"
    ctx.fillRect(x + 13, y + 9, 2, 2);
    ctx.fillRect(x + 13, y + 13, 2, 2);
    ctx.fillRect(x + 13, y + 11, 2, 1);
  },

  /**
   * Save a canvas to the specified path
   * @param {HTMLCanvasElement} canvas - The canvas to save
   * @param {string} fileName - The file path/name to save to
   */
  saveCanvasToFile(canvas, fileName) {
    // In a browser environment, this would download the image
    // In this demo, we'll just log that the asset was generated
    console.log(`Asset generated: ${fileName}`);

    // In a real implementation, you would use:
    // const dataURL = canvas.toDataURL('image/png');
    // And then save this dataURL to a file or use it directly as an image source
  },

  /**
   * Generate sounds for the game
   * @returns {Object} Object containing game sound effects
   */
  generateSounds() {
    const cacheKey = `sounds_${this.currentQuality}`;
    if (this.assetsCache[cacheKey]) {
      return this.assetsCache[cacheKey];
    }

    // Create audio elements
    const jumpSound = new Audio();
    jumpSound.src = "assets/audio/jump.mp3"; // These would be actual audio files in production

    const coinSound = new Audio();
    coinSound.src = "assets/audio/coin.mp3";

    const powerupSound = new Audio();
    powerupSound.src = "assets/audio/powerup.mp3";

    const gameOverSound = new Audio();
    gameOverSound.src = "assets/audio/gameover.mp3";

    // In low quality mode, we might disable some sounds
    const sounds = {
      jump: jumpSound,
      coin: coinSound,
      powerup: powerupSound,
      gameOver: gameOverSound,
    };

    // Cache and return
    this.assetsCache[cacheKey] = sounds;
    return sounds;
  },

  /**
   * Optimize assets for specific browsers
   * @param {Object} assets - The generated assets
   * @param {String} browserName - The name of the browser
   * @returns {Object} - Optimized assets for the specific browser
   */
  optimizeForBrowser(assets, browserName) {
    if (!assets) return assets;

    // Apply browser-specific optimizations
    switch (browserName.toLowerCase()) {
      case "safari":
        // Safari sometimes has issues with large canvas elements
        console.log("Applying Safari-specific optimizations");
        // No specific optimizations needed at this time
        break;

      case "firefox":
        console.log("Applying Firefox-specific optimizations");
        // No specific optimizations needed at this time
        break;

      case "edge":
      case "chrome":
        // These browsers generally handle the assets well
        console.log(`No specific optimizations needed for ${browserName}`);
        break;

      default:
        console.log("Using standard asset configuration");
    }

    return assets;
  },

  /**
   * Clean up unused assets to free memory
   * @param {Array} assetsToKeep - Array of asset keys to keep
   */
  cleanupUnusedAssets(assetsToKeep = []) {
    const allKeys = Object.keys(this.assetsCache);

    // If no specific keys to keep, preserve all assets
    if (!assetsToKeep.length) return;

    for (const key of allKeys) {
      if (!assetsToKeep.includes(key)) {
        delete this.assetsCache[key];
        console.log(`Cleaned up unused asset: ${key}`);
      }
    }
  },

  /**
   * Generate all game assets
   * @param {String} quality - Quality level: 'low', 'medium', or 'high'
   * @param {String} browserName - Optional: browser name for specific optimizations
   * @returns {Object} - All game assets
   */
  generateAllAssets(quality = "high", browserName = "unknown") {
    console.log(`Generating assets with ${quality} quality for ${browserName}`);

    // Set quality level
    this.setQuality(quality);

    // Track asset generation performance
    const startTime = performance.now();

    // Character sprite
    const characterSprite = this.generateCharacterSprite();

    // Obstacle sprites
    const obstacleSprites = this.generateObstacleSprites();

    // Coin sprites
    const coinSprites = this.generateCoinSprites();

    // Background layers
    const backgroundLayers = this.generateBackgroundLayers();

    // Power-up sprites
    const powerUpSprites = this.generatePowerUpSprites();

    // Sound effects
    const sounds = this.generateSounds();

    const assets = {
      character: characterSprite,
      obstacles: obstacleSprites,
      coins: coinSprites,
      backgrounds: backgroundLayers,
      powerups: powerUpSprites,
      sounds: sounds,
    };

    // Optimize for specific browser if provided
    const optimizedAssets = this.optimizeForBrowser(assets, browserName);

    // Log performance metrics
    console.log(
      `Assets generated in ${(performance.now() - startTime).toFixed(2)}ms`
    );

    return optimizedAssets;
  },
};

// Export for use in the main game
if (typeof module !== "undefined") {
  module.exports = AssetGenerator;
}
