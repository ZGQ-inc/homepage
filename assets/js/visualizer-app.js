/**
 * Butterchurn Milkdrop Visualizer Manager
 * Powers the retro Winamp/Milkdrop visualizer window
 */

(function (window) {
  'use strict';

  class VisualizerManager {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.visualizer = null;
      this.audioContext = null;
      this.analyser = null;
      this.isInitialized = false;
      this.presets = {};
      this.presetKeys = [];
      this.currentPresetIndex = 0;
      this.autoCycle = true;
      this.cycleInterval = 25; // seconds
      this.cycleTimer = null;
      this.isRendering = false;
    }

    init(audioEngine) {
      if (this.isInitialized || !this.canvas) return;

      if (!window.butterchurn) {
        console.warn('Butterchurn library not loaded.');
        return;
      }

      // Ensure AudioContext
      if (!audioEngine.audioContext) {
        audioEngine.initAudioContext();
      }
      this.audioContext = audioEngine.audioContext;
      this.analyser = audioEngine.analyser;

      const rect = this.canvas.parentElement.getBoundingClientRect();
      const w = Math.max(320, Math.floor(rect.width || 480));
      const h = Math.max(240, Math.floor(rect.height || 320));

      this.canvas.width = w;
      this.canvas.height = h;

      try {
        this.visualizer = window.butterchurn.createVisualizer(this.audioContext, this.canvas, {
          width: w,
          height: h,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5)
        });

        if (audioEngine.sourceNode) {
          this.visualizer.connectAudio(audioEngine.sourceNode);
        } else if (this.analyser) {
          this.visualizer.connectAudio(this.analyser);
        }

        this.loadPresets();
        this.startRender();
        this.isInitialized = true;
        console.log('Butterchurn Milkdrop visualizer initialized successfully.');
      } catch (err) {
        console.warn('Error creating Butterchurn visualizer:', err);
      }
    }

    loadPresets() {
      if (window.butterchurnPresets && typeof window.butterchurnPresets.getPresets === 'function') {
        this.presets = window.butterchurnPresets.getPresets();
        this.presetKeys = Object.keys(this.presets);
        console.log(`Loaded ${this.presetKeys.length} presets from ButterchurnPresets.`);
      }

      // Pick a random preset to start
      if (this.presetKeys.length > 0) {
        this.currentPresetIndex = Math.floor(Math.random() * this.presetKeys.length);
        this.loadPresetByIndex(this.currentPresetIndex, 0.0);
      }

      this.startCycleTimer();
    }

    loadPresetByIndex(index, blendTime = 2.0) {
      if (!this.visualizer || this.presetKeys.length === 0) return;
      this.currentPresetIndex = (index + this.presetKeys.length) % this.presetKeys.length;
      const key = this.presetKeys[this.currentPresetIndex];
      const preset = this.presets[key];

      try {
        this.visualizer.loadPreset(preset, blendTime);
        this.showOSD(key);
      } catch (e) {
        console.warn('Error loading preset:', key, e);
      }
    }

    nextPreset() {
      this.loadPresetByIndex(this.currentPresetIndex + 1, 2.5);
    }

    prevPreset() {
      this.loadPresetByIndex(this.currentPresetIndex - 1, 2.5);
    }

    randomPreset() {
      if (this.presetKeys.length === 0) return;
      const rnd = Math.floor(Math.random() * this.presetKeys.length);
      this.loadPresetByIndex(rnd, 2.5);
    }

    startCycleTimer() {
      if (this.cycleTimer) clearInterval(this.cycleTimer);
      if (this.autoCycle) {
        this.cycleTimer = setInterval(() => {
          this.randomPreset();
        }, this.cycleInterval * 1000);
      }
    }

    showOSD(title) {
      const osd = document.getElementById('visualizer-osd');
      if (osd) {
        osd.textContent = title;
        osd.classList.add('visible');
        clearTimeout(this._osdTimer);
        this._osdTimer = setTimeout(() => {
          osd.classList.remove('visible');
        }, 3500);
      }
    }

    resize(w, h) {
      if (!this.visualizer || !this.canvas) return;
      this.canvas.width = w;
      this.canvas.height = h;
      this.visualizer.setRendererSize(w, h);
    }

    startRender() {
      if (this.isRendering) return;
      this.isRendering = true;

      const loop = () => {
        if (this.visualizer) {
          try {
            this.visualizer.render();
          } catch (e) {}
        }
        if (this.isRendering) {
          requestAnimationFrame(loop);
        }
      };
      requestAnimationFrame(loop);
    }
  }

  window.VisualizerManager = VisualizerManager;

})(window);
