/**
 * Retro Mini-Game Asset Generator
 * This file contains utilities to generate pixel art game assets
 */

// Create an off-screen canvas for asset generation
const generateCanvas = document.createElement("canvas");
const generateCtx = generateCanvas.getContext("2d");

// Asset generation utilities
const AssetGenerator = {
  // Color palettes for a retro look
  palettes: {
    character: ["#181425", "#5a6988", "#3a4466", "#262b44", "#ff0044"],
    environment: ["#181425", "#262b44", "#3a4466", "#5a6988", "#8b9bb4"],
    coins: ["#181425", "#c0c741", "#feae34", "#fee761", "#ffffff"],
    powerups: ["#181425", "#7a3045", "#cc2a41", "#ff5e54", "#38b86e"],
  },

  /**
   * Generate a sprite sheet for a character with running animation
   * @returns {HTMLCanvasElement} Canvas element with the sprite sheet
   */
  generateCharacterSprite() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 192; // 4 frames x 48px
    canvas.height = 48;

    // Frame 1: Standing
    this._drawCharacter(ctx, 0, 0, false);

    // Frame 2: Running pose 1
    this._drawCharacter(ctx, 48, 0, true, 1);

    // Frame 3: Running pose 2
    this._drawCharacter(ctx, 96, 0, true, 2);

    // Frame 4: Jumping pose
    this._drawCharacter(ctx, 144, 0, false, 0, true);

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

    // Base shape
    ctx.fillStyle = palette[2];
    ctx.fillRect(x + 14, y + 32, 20, 16);
    ctx.fillRect(x + 18, y + 28, 12, 4);

    // Highlights
    ctx.fillStyle = palette[3];
    ctx.fillRect(x + 16, y + 36, 4, 4);
    ctx.fillRect(x + 26, y + 32, 6, 6);
  },

  /**
   * Draw a tall spike-like obstacle
   */
  _drawObstacle3(ctx, x, y) {
    const palette = this.palettes.environment;

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
    ctx.fillStyle = palette[2]; // Base gold
    ctx.fillRect(centerX - width / 2, y + 6, width, 12);

    // Highlight
    ctx.fillStyle = palette[3]; // Light gold
    ctx.fillRect(centerX - width / 2, y + 8, width, 4);

    // Outline
    ctx.fillStyle = palette[0]; // Dark outline
    ctx.fillRect(centerX - width / 2, y + 6, 1, 12);
    ctx.fillRect(centerX + width / 2 - 1, y + 6, 1, 12);
    ctx.fillRect(centerX - width / 2, y + 6, width, 1);
    ctx.fillRect(centerX - width / 2, y + 17, width, 1);
  },

  /**
   * Generate background layers for parallax scrolling
   * @returns {Object} Object containing different background layer canvases
   */
  generateBackgroundLayers() {
    return {
      far: this._generateFarBackgroundLayer(),
      mid: this._generateMidBackgroundLayer(),
      close: this._generateCloseBackgroundLayer(),
    };
  },

  /**
   * Generate far background layer (mountains/sky)
   */
  _generateFarBackgroundLayer() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 480;
    canvas.height = 160;

    const palette = this.palettes.environment;

    // Sky
    ctx.fillStyle = palette[4];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Far mountains
    ctx.fillStyle = palette[3];
    for (let i = 0; i < canvas.width; i += 80) {
      const height = 40 + Math.random() * 30;
      ctx.beginPath();
      ctx.moveTo(i, 160);
      ctx.lineTo(i + 20, 160 - height);
      ctx.lineTo(i + 80, 160);
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

    // Small bushes or rocks
    ctx.fillStyle = palette[1];
    for (let i = 0; i < canvas.width; i += 40) {
      if (Math.random() > 0.3) {
        const width = 8 + Math.random() * 12;
        const height = 4 + Math.random() * 6;
        ctx.fillRect(i, 160 - height, width, height);
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

    // Shield shape
    ctx.fillStyle = palette[3];
    ctx.fillRect(x + 8, y + 6, 8, 12);
    ctx.fillRect(x + 6, y + 8, 12, 8);

    // Star center
    ctx.fillStyle = palette[4];
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

    // Base
    ctx.fillStyle = palette[1];
    ctx.fillRect(x + 8, y + 8, 8, 8);

    // "x2" text
    ctx.fillStyle = palette[3];
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
   * Generate all game assets
   */
  generateAllAssets() {
    // Character sprite
    const characterSprite = this.generateCharacterSprite();
    this.saveCanvasToFile(characterSprite, "assets/images/character.png");

    // Obstacle sprites
    const obstacleSprites = this.generateObstacleSprites();
    this.saveCanvasToFile(obstacleSprites, "assets/images/obstacles.png");

    // Coin sprites
    const coinSprites = this.generateCoinSprites();
    this.saveCanvasToFile(coinSprites, "assets/images/coins.png");

    // Background layers
    const backgroundLayers = this.generateBackgroundLayers();
    this.saveCanvasToFile(backgroundLayers.far, "assets/images/bg-far.png");
    this.saveCanvasToFile(backgroundLayers.mid, "assets/images/bg-mid.png");
    this.saveCanvasToFile(backgroundLayers.close, "assets/images/bg-close.png");

    // Power-up sprites
    const powerUpSprites = this.generatePowerUpSprites();
    this.saveCanvasToFile(powerUpSprites, "assets/images/powerups.png");

    console.log("All assets generated successfully!");

    // Return all assets for direct use in the game
    return {
      character: characterSprite,
      obstacles: obstacleSprites,
      coins: coinSprites,
      backgrounds: backgroundLayers,
      powerups: powerUpSprites,
    };
  },
};

// Export for use in the main game
if (typeof module !== "undefined") {
  module.exports = AssetGenerator;
}
