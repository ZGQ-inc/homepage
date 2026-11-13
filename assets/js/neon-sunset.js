/**
 * Neon Sunset Canvas Engine (Wallpaper Engine Retro Style)
 * & Multi-Mode Retro Background Renderer
 * Modes:
 *  1. 'neon-sunset': 80s Retrowave Neon Sun, Moving 3D Perspective Mountain Wireframe Grid, Starfield, Audio-Reactivity
 *  2. 'starfield': Classic Windows 98 Flying Stars Screensaver
 *  3. 'matrix': Matrix Digital Rain
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
      this.mode = 'neon-sunset'; // 'neon-sunset' | 'starfield' | 'matrix'
      this.animationFrameId = null;
      this.lastTime = 0;
      this.elapsed = 0;
      this.audioEnergy = 0; // 0.0 ~ 1.0 for beat pulse
      this.targetEnergy = 0;

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
      if (['neon-sunset', 'starfield', 'matrix'].includes(mode)) {
        this.mode = mode;
      }
    }

    setAudioEnergy(energy) {
      this.targetEnergy = Math.max(0, Math.min(1.5, energy));
    }

    initStars() {
      this.stars = [];
      const count = 120;
      for (let i = 0; i < count; i++) {
        this.stars.push({
          x: Math.random(),
          y: Math.random() * 0.6, // only in upper 60% of sky
          size: Math.random() * 1.8 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }

    initStarfield() {
      this.starfieldStars = [];
      const count = 350;
      for (let i = 0; i < count; i++) {
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
      // Smooth decay audio energy
      this.audioEnergy += (this.targetEnergy - this.audioEnergy) * 0.15;
      this.targetEnergy = Math.max(0, this.targetEnergy - delta * 1.2);
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      ctx.clearRect(0, 0, w, h);

      if (this.mode === 'neon-sunset') {
        this.renderNeonSunset(ctx, w, h);
      } else if (this.mode === 'starfield') {
        this.renderStarfield(ctx, w, h);
      } else if (this.mode === 'matrix') {
        this.renderMatrix(ctx, w, h);
      }
    }

    /* ----------------------------------------------------
     * Mode 1: Wallpaper Engine Iconic Neon Sunset
     * ---------------------------------------------------- */
    renderNeonSunset(ctx, w, h) {
      const horizonY = h * 0.58;
      const t = this.elapsed;
      const pulse = this.audioEnergy;

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0.0, '#070210');
      skyGrad.addColorStop(0.4, '#1c052d');
      skyGrad.addColorStop(0.7, '#440e53');
      skyGrad.addColorStop(0.92, '#8d1767');
      skyGrad.addColorStop(1.0, '#ff4365');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // 2. Stars
      for (const s of this.stars) {
        const sx = s.x * w;
        const sy = s.y * h;
        const currentAlpha = Math.sin(t * s.pulseSpeed * 60 + s.pulseOffset) * 0.3 + 0.6;
        ctx.fillStyle = `rgba(255, 235, 255, ${currentAlpha * s.alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Glowing Retrowave Sun
      const sunCenterX = w * 0.5;
      const baseSunRadius = Math.min(w, h) * 0.22;
      const sunRadius = baseSunRadius + pulse * 14;
      const sunCenterY = horizonY - sunRadius * 0.45;

      // Outer Sun Radial Bloom / Halo
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

      // Sun Body Clip & Stripes
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.clip();

      // Sun Vertical Gradient
      const sunGrad = ctx.createLinearGradient(0, sunCenterY - sunRadius, 0, sunCenterY + sunRadius);
      sunGrad.addColorStop(0.0, '#fff477');
      sunGrad.addColorStop(0.3, '#ffaa00');
      sunGrad.addColorStop(0.65, '#ff006e');
      sunGrad.addColorStop(1.0, '#79006e');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(sunCenterX - sunRadius, sunCenterY - sunRadius, sunRadius * 2, sunRadius * 2);

      // Sun Venetian Blind Stripes (Moving slightly or static with depth)
      const numStripes = 11;
      const stripeStartY = sunCenterY - sunRadius * 0.1;
      const stripeHeightTotal = sunRadius * 1.1;

      for (let i = 0; i < numStripes; i++) {
        const factor = i / (numStripes - 1);
        // Exponential distribution: stripes get thicker & further apart towards bottom
        const yRel = Math.pow(factor, 1.45) * stripeHeightTotal;
        const stripeY = stripeStartY + yRel;
        const stripeThickness = 2.5 + factor * (12 + pulse * 4);

        ctx.fillStyle = '#0f041a'; // matches backdrop/horizon
        ctx.fillRect(sunCenterX - sunRadius, stripeY, sunRadius * 2, stripeThickness);
      }
      ctx.restore();

      // 4. Distant Horizon Mountain Silhouettes
      this.drawHorizonMountains(ctx, w, horizonY);

      // 5. 3D Terrain Grid & Synthwave Highway
      this.drawTerrainGrid(ctx, w, h, horizonY, t, pulse);

      // 6. Horizon Glow Line
      const horizonGrad = ctx.createLinearGradient(0, horizonY - 2, 0, horizonY + 3);
      horizonGrad.addColorStop(0, 'rgba(255, 60, 160, 0.9)');
      horizonGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.8)');
      horizonGrad.addColorStop(1, 'rgba(10, 2, 20, 0)');
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizonY - 2, w, 5);
    }

    drawHorizonMountains(ctx, w, horizonY) {
      ctx.fillStyle = '#110321';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      const segments = 24;
      const segWidth = w / segments;
      for (let i = 0; i <= segments; i++) {
        const x = i * segWidth;
        // Pseudo-random deterministic mountain heights
        const seed = Math.sin(i * 1.8) * 15 + Math.cos(i * 4.3) * 12 + Math.sin(i * 0.9) * 20;
        const y = horizonY - Math.abs(seed) - 6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, horizonY);
      ctx.closePath();
      ctx.fill();
    }

    drawTerrainGrid(ctx, w, h, horizonY, t, pulse) {
      const groundH = h - horizonY;
      if (groundH <= 0) return;

      // Ground Dark Base
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      groundGrad.addColorStop(0, '#0a0217');
      groundGrad.addColorStop(0.5, '#120427');
      groundGrad.addColorStop(1.0, '#05010b');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, w, groundH);

      // Grid Parameters
      const fov = 350;
      const cameraHeight = 160;
      const gridSpeed = 90; // units per second
      const zOffset = (t * gridSpeed) % 40;
      const maxZ = 600;
      const stepZ = 30;

      // 1. Horizontal Lines (Transverse)
      ctx.lineWidth = 1.5;
      for (let z = maxZ; z >= 30; z -= stepZ) {
        const actualZ = z - zOffset;
        if (actualZ <= 5) continue;

        const screenY = horizonY + (cameraHeight / actualZ) * fov;
        if (screenY > h) continue;

        const depthRatio = 1 - (actualZ / maxZ);
        const alpha = Math.max(0.1, depthRatio * 0.9);

        // Color shifts from hot magenta at horizon to cyan at bottom
        ctx.strokeStyle = `rgba(255, 0, 140, ${alpha})`;
        if (depthRatio > 0.6) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
        }

        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(w, screenY);
        ctx.stroke();
      }

      // 2. Perspective Longitudinal Lines + Undulating Mountain Peaks
      const centerX = w * 0.5;
      const cols = 28;
      const spacingX = 40;

      ctx.lineWidth = 1.2;
      for (let col = -cols; col <= cols; col++) {
        const worldX = col * spacingX;
        const isCenterRoad = Math.abs(col) < 3;

        ctx.beginPath();
        let first = true;

        for (let z = maxZ; z >= 25; z -= 25) {
          const actualZ = z - zOffset;
          if (actualZ <= 5) continue;

          // Lateral factor: hills rise only outside center highway
          const lateral = Math.max(0, (Math.abs(col) - 2.5) / 8);
          // Elevation waves
          const wave = Math.sin(col * 0.45 + actualZ * 0.02 - t * 2) * Math.cos(col * 0.3);
          const hillHeight = lateral * (65 + pulse * 45) * Math.abs(wave);

          const projX = centerX + (worldX / actualZ) * fov;
          const projY = horizonY + ((cameraHeight - hillHeight) / actualZ) * fov;

          if (first) {
            ctx.moveTo(projX, projY);
            first = false;
          } else {
            ctx.lineTo(projX, projY);
          }
        }

        const depthColAlpha = Math.max(0.15, 1 - Math.abs(col) / cols);
        if (isCenterRoad) {
          ctx.strokeStyle = `rgba(0, 245, 255, ${depthColAlpha * 0.85})`;
        } else {
          ctx.strokeStyle = `rgba(255, 0, 160, ${depthColAlpha * 0.75})`;
        }
        ctx.stroke();
      }
    }

    /* ----------------------------------------------------
     * Mode 2: Classic Windows 98 Flying Stars
     * ---------------------------------------------------- */
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

    /* ----------------------------------------------------
     * Mode 3: Matrix Digital Rain
     * ---------------------------------------------------- */
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

        // Bright green head
        ctx.fillStyle = '#a6ffb2';
        ctx.fillText(char, x, y);

        // Body trails
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

  // Export to window
  window.RetroBackground = RetroBackground;

})(window);
