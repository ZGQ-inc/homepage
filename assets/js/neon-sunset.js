/**
 * Wallpaper Engine Neon Sunset & Multi-Mode Retro Background Renderer
 * Modes:
 *  1. 'wallpaper-engine': Authentic Wallpaper Engine 4K Neon Sunset with audio-reactive live 3D perspective grid
 *  2. 'neon-sunset': Pure procedural WebGL/Canvas retrowave sunset
 *  3. 'win98-clouds': Classic Windows 98 Clouds wallpaper
 *  4. 'win98-teal': Classic Windows 98 solid teal background (#008080)
 *  5. 'starfield': Classic Windows 98 Flying Stars screensaver
 *  6. 'matrix': Matrix digital code rain
 */

(function (window) {
  'use strict';

  class RetroBackground {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = canvasId;
        document.body.prepend(this.canvas);
      }
      this.ctx = this.canvas.getContext('2d');
      this.mode = 'wallpaper-engine'; // default to Wallpaper Engine Neon Sunset
      this.animationFrameId = null;
      this.lastTime = 0;
      this.elapsed = 0;
      this.audioEnergy = 0;
      this.targetEnergy = 0;

      // Assets
      this.weImage = new Image();
      this.weImage.src = './assets/images/neon-sunset-wallpaper-engine.jpg';
      this.cloudsImage = new Image();
      this.cloudsImage.src = './assets/images/clouds.jpg';

      // Stars configuration
      this.stars = [];
      this.starfieldStars = [];
      this.matrixColumns = [];

      this.init();
    }

    init() {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.start();
        }
      });

      this.initStars();
      this.initStarfield();
      this.initMatrix();
      this.start();
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.initMatrix();
    }

    setMode(mode) {
      this.mode = mode;
      // If win98-teal, update document body background color directly
      if (mode === 'win98-teal') {
        document.body.style.backgroundColor = '#008080';
      } else {
        document.body.style.backgroundColor = '#000000';
      }
    }

    setAudioEnergy(energy) {
      this.targetEnergy = Math.max(0, Math.min(1.5, energy));
    }

    initStars() {
      this.stars = [];
      for (let i = 0; i < 120; i++) {
        this.stars.push({
          x: Math.random(),
          y: Math.random() * 0.6,
          size: Math.random() * 1.8 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    initStarfield() {
      this.starfieldStars = [];
      for (let i = 0; i < 350; i++) {
        this.starfieldStars.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 1000 + 1,
          prevZ: 1000
        });
      }
    }

    initMatrix() {
      const fontSize = 16;
      const columns = Math.floor(this.width / fontSize) + 1;
      this.matrixColumns = [];
      for (let i = 0; i < columns; i++) {
        this.matrixColumns.push({
          y: Math.random() * -100,
          speed: Math.random() * 3 + 2,
          chars: '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'
        });
      }
    }

    start() {
      if (!this.animationFrameId) {
        this.lastTime = performance.now();
        const loop = (timestamp) => {
          const delta = (timestamp - this.lastTime) / 1000;
          this.lastTime = timestamp;
          this.update(delta);
          this.render();
          this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
      }
    }

    pause() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    update(delta) {
      this.elapsed += delta;
      this.audioEnergy += (this.targetEnergy - this.audioEnergy) * 0.15;
      this.targetEnergy = Math.max(0, this.targetEnergy - delta * 1.2);
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      if (this.mode === 'wallpaper-engine') {
        this.renderWallpaperEngine(ctx, w, h);
      } else if (this.mode === 'neon-sunset') {
        this.renderProceduralSunset(ctx, w, h);
      } else if (this.mode === 'win98-clouds') {
        this.renderClouds(ctx, w, h);
      } else if (this.mode === 'win98-teal') {
        ctx.fillStyle = '#008080';
        ctx.fillRect(0, 0, w, h);
      } else if (this.mode === 'starfield') {
        this.renderStarfield(ctx, w, h);
      } else if (this.mode === 'matrix') {
        this.renderMatrix(ctx, w, h);
      }
    }

    /* -------------------------------------------------------------------------
     * Mode 1: Wallpaper Engine Authentic Neon Sunset
     * ------------------------------------------------------------------------- */
    renderWallpaperEngine(ctx, w, h) {
      // 1. Draw 4K Backdrop Image (Cover fit)
      if (this.weImage.complete && this.weImage.naturalWidth > 0) {
        const img = this.weImage;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const winRatio = w / h;
        let dw, dh, dx, dy;
        if (winRatio > imgRatio) {
          dw = w;
          dh = w / imgRatio;
          dx = 0;
          dy = (h - dh) * 0.5;
        } else {
          dh = h;
          dw = h * imgRatio;
          dx = (w - dw) * 0.5;
          dy = 0;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
      } else {
        this.renderProceduralSunset(ctx, w, h);
        return;
      }

      // 2. Layer Live Animated Perspective Grid Over Lower Half
      const horizonY = h * 0.65;
      this.drawTerrainGridOverlay(ctx, w, h, horizonY, this.elapsed, this.audioEnergy);

      // 3. Audio-Reactive Sun Glow Pulse
      if (this.audioEnergy > 0.05) {
        const sunCenterX = w * 0.5;
        const sunCenterY = horizonY - 110;
        const pulse = this.audioEnergy;
        const glow = ctx.createRadialGradient(sunCenterX, sunCenterY, 30, sunCenterX, sunCenterY, 200 + pulse * 80);
        glow.addColorStop(0, `rgba(255, 0, 128, ${pulse * 0.35})`);
        glow.addColorStop(0.6, `rgba(255, 120, 0, ${pulse * 0.18})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunCenterX, sunCenterY, 280, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawTerrainGridOverlay(ctx, w, h, horizonY, t, pulse) {
      const groundH = h - horizonY;
      if (groundH <= 0) return;

      const fov = 350;
      const cameraHeight = 150;
      const gridSpeed = 80;
      const zOffset = (t * gridSpeed) % 40;
      const maxZ = 500;
      const stepZ = 30;

      // Transverse horizontal grid lines
      ctx.lineWidth = 1.4;
      for (let z = maxZ; z >= 30; z -= stepZ) {
        const actualZ = z - zOffset;
        if (actualZ <= 5) continue;

        const screenY = horizonY + (cameraHeight / actualZ) * fov;
        if (screenY > h) continue;

        const depth = 1 - (actualZ / maxZ);
        const alpha = Math.max(0.1, depth * 0.7);

        ctx.strokeStyle = `rgba(255, 0, 140, ${alpha})`;
        if (depth > 0.6) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        }

        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(w, screenY);
        ctx.stroke();
      }

      // Longitudinal lines
      const centerX = w * 0.5;
      const cols = 26;
      const spacingX = 40;
      ctx.lineWidth = 1.2;

      for (let col = -cols; col <= cols; col++) {
        const worldX = col * spacingX;
        const isRoad = Math.abs(col) < 3;

        ctx.beginPath();
        let first = true;

        for (let z = maxZ; z >= 25; z -= 25) {
          const actualZ = z - zOffset;
          if (actualZ <= 5) continue;

          const lateral = Math.max(0, (Math.abs(col) - 2) / 8);
          const wave = Math.sin(col * 0.45 + actualZ * 0.02 - t * 2);
          const hill = lateral * (50 + pulse * 40) * Math.abs(wave);

          const px = centerX + (worldX / actualZ) * fov;
          const py = horizonY + ((cameraHeight - hill) / actualZ) * fov;

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }

        const depthColAlpha = Math.max(0.15, 1 - Math.abs(col) / cols);
        ctx.strokeStyle = isRoad ? `rgba(0, 245, 255, ${depthColAlpha * 0.7})` : `rgba(255, 0, 160, ${depthColAlpha * 0.6})`;
        ctx.stroke();
      }
    }

    renderClouds(ctx, w, h) {
      if (this.cloudsImage.complete && this.cloudsImage.naturalWidth > 0) {
        ctx.drawImage(this.cloudsImage, 0, 0, w, h);
      } else {
        ctx.fillStyle = '#008080';
        ctx.fillRect(0, 0, w, h);
      }
    }

    /* -------------------------------------------------------------------------
     * Mode 2: Procedural Neon Sunset
     * ------------------------------------------------------------------------- */
    renderProceduralSunset(ctx, w, h) {
      const horizonY = h * 0.58;
      const t = this.elapsed;
      const pulse = this.audioEnergy;

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0.0, '#070210');
      skyGrad.addColorStop(0.4, '#1c052d');
      skyGrad.addColorStop(0.7, '#440e53');
      skyGrad.addColorStop(0.92, '#8d1767');
      skyGrad.addColorStop(1.0, '#ff4365');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Stars
      for (const s of this.stars) {
        const sx = s.x * w;
        const sy = s.y * h;
        const currentAlpha = Math.sin(t * s.pulseSpeed * 60 + s.pulseOffset) * 0.3 + 0.6;
        ctx.fillStyle = `rgba(255, 235, 255, ${currentAlpha * s.alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sun
      const sunCenterX = w * 0.5;
      const baseSunRadius = Math.min(w, h) * 0.22;
      const sunRadius = baseSunRadius + pulse * 14;
      const sunCenterY = horizonY - sunRadius * 0.45;

      const haloGrad = ctx.createRadialGradient(
        sunCenterX, sunCenterY, sunRadius * 0.6,
        sunCenterX, sunCenterY, sunRadius * 1.9 + pulse * 40
      );
      haloGrad.addColorStop(0, 'rgba(255, 77, 166, 0.45)');
      haloGrad.addColorStop(0.5, 'rgba(255, 120, 0, 0.2)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.clip();

      const sunGrad = ctx.createLinearGradient(0, sunCenterY - sunRadius, 0, sunCenterY + sunRadius);
      sunGrad.addColorStop(0.0, '#fff477');
      sunGrad.addColorStop(0.3, '#ffaa00');
      sunGrad.addColorStop(0.65, '#ff006e');
      sunGrad.addColorStop(1.0, '#79006e');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(sunCenterX - sunRadius, sunCenterY - sunRadius, sunRadius * 2, sunRadius * 2);

      const numStripes = 11;
      const stripeStartY = sunCenterY - sunRadius * 0.1;
      const stripeHeightTotal = sunRadius * 1.1;

      for (let i = 0; i < numStripes; i++) {
        const factor = i / (numStripes - 1);
        const yRel = Math.pow(factor, 1.45) * stripeHeightTotal;
        const stripeY = stripeStartY + yRel;
        const stripeThickness = 2.5 + factor * (12 + pulse * 4);

        ctx.fillStyle = '#0f041a';
        ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, stripeThickness);
      }
      ctx.restore();

      this.drawTerrainGridOverlay(ctx, w, h, horizonY, t, pulse);
    }

    renderStarfield(ctx, w, h) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const speed = 14 + this.audioEnergy * 25;

      ctx.fillStyle = '#FFFFFF';
      for (const s of this.starfieldStars) {
        s.prevZ = s.z;
        s.z -= speed;

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * 2000;
          s.y = (Math.random() - 0.5) * 2000;
          s.z = 1000;
          s.prevZ = 1000;
        }

        const k = 400 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const pk = 400 / s.prevZ;
        const ppx = s.x * pk + cx;
        const ppy = s.y * pk + cy;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const size = Math.max(1, (1 - s.z / 1000) * 3.5);
          const alpha = Math.min(1, (1 - s.z / 1000) * 1.5);

          ctx.strokeStyle = `rgba(220, 240, 255, ${alpha})`;
          ctx.lineWidth = size * 0.8;
          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.lineTo(px, py);
          ctx.stroke();

          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    renderMatrix(ctx, w, h) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = '15px monospace';
      const fontSize = 16;

      for (let i = 0; i < this.matrixColumns.length; i++) {
        const col = this.matrixColumns[i];
        const char = col.chars[Math.floor(Math.random() * col.chars.length)];
        const x = i * fontSize;
        const y = col.y;

        ctx.fillStyle = '#a6ffb2';
        ctx.fillText(char, x, y);

        ctx.fillStyle = '#00ff41';
        ctx.fillText(char, x, y - fontSize);

        col.y += col.speed * 4;
        if (col.y > h && Math.random() > 0.975) {
          col.y = 0;
          col.speed = Math.random() * 3 + 2;
        }
      }
    }
  }

  window.RetroBackground = RetroBackground;

})(window);
