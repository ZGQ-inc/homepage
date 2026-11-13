/**
 * Butterchurn Milkdrop Visualizer Manager
 * Powers the retro Winamp/Milkdrop visualizer window
 * Features:
 *  - 100 Curated Milkdrop presets from Milkdrop_147k+_presets.7z (BeatDrop/Butterchurn Presets)
 *  - Prominent current preset display (LED marquee, dropdown selector, titlebar sync, OSD)
 *  - Instant synchronous preset loading (no blank screen, immediate dropdown population)
 *  - Continuous rendering (never blank: synthetic energy fallback when music is stopped)
 *  - Auto-cycle, Next, Prev, Random preset navigation
 *  - Fullscreen support
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
      this.currentPresetName = 'Loading...';
      this.autoCycle = true;
      this.cycleInterval = 25; // seconds
      this.remainingSeconds = 25;
      this.cycleTimer = null;
      this.countdownTimer = null;
      this.isRendering = false;

      // Load presets immediately so UI is populated synchronously
      this.loadPresets();
    }

    loadPresets() {
      if (window.butterchurnPresets && typeof window.butterchurnPresets.getPresets === 'function') {
        this.presets = window.butterchurnPresets.getPresets();
        this.presetKeys = Object.keys(this.presets);
      }

      // Populate UI Dropdown Selector immediately
      this.populatePresetSelector();

      if (this.presetKeys.length > 0) {
        this.currentPresetIndex = Math.floor(Math.random() * this.presetKeys.length);
        this.currentPresetName = this.presetKeys[this.currentPresetIndex];
        this.updatePresetUI(this.currentPresetName);
      }

      this.startCycleTimer();
    }

    init(audioEngine) {
      if (!this.canvas) return;

      const bc = (window.butterchurn && window.butterchurn.default) ? window.butterchurn.default : window.butterchurn;
      if (!bc || typeof bc.createVisualizer !== 'function') {
        console.warn('Butterchurn library not loaded or createVisualizer unavailable.');
        return;
      }

      // Ensure AudioContext
      if (audioEngine && !audioEngine.audioContext) {
        audioEngine.initAudioContext();
      }
      this.audioContext = (audioEngine && audioEngine.audioContext) || new (window.AudioContext || window.webkitAudioContext)();

      // Ensure Canvas Dimensions
      let w = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 500;
      let h = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 320;
      w = Math.max(360, w);
      h = Math.max(260, h);

      this.canvas.width = w;
      this.canvas.height = h;

      try {
        if (!this.visualizer) {
          this.visualizer = bc.createVisualizer(this.audioContext, this.canvas, {
            width: w,
            height: h,
            pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5)
          });

          if (audioEngine && audioEngine.sourceNode) {
            try {
              this.visualizer.connectAudio(audioEngine.sourceNode);
            } catch (e) {}
          } else if (audioEngine && audioEngine.analyser) {
            try {
              this.visualizer.connectAudio(audioEngine.analyser);
            } catch (e) {}
          }

          if (this.presetKeys.length > 0) {
            this.loadPresetByIndex(this.currentPresetIndex, 0.0);
          }

          this.startRender();
          this.isInitialized = true;
          console.log('Butterchurn Milkdrop initialized successfully with WebGL2.');
        } else {
          this.resize(w, h);
        }
      } catch (err) {
        console.warn('Error creating Butterchurn visualizer:', err);
      }
    }

    populatePresetSelector() {
      const select = document.getElementById('vis-preset-select');
      if (!select) return;

      select.innerHTML = '';
      this.presetKeys.forEach((key, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${idx + 1}. ${key}`;
        select.appendChild(opt);
      });

      select.addEventListener('change', (e) => {
        this.loadPresetByIndex(parseInt(e.target.value, 10), 1.5);
      });
    }

    loadPresetByIndex(index, blendTime = 2.0) {
      if (this.presetKeys.length === 0) return;
      this.currentPresetIndex = (index + this.presetKeys.length) % this.presetKeys.length;
      const key = this.presetKeys[this.currentPresetIndex];
      const preset = this.presets[key];
      this.currentPresetName = key;

      if (this.visualizer) {
        try {
          this.visualizer.loadPreset(preset, blendTime);
        } catch (e) {
          console.warn('Error loading preset:', key, e);
        }
      }

      this.updatePresetUI(key);
    }

    updatePresetUI(title) {
      const displayEl = document.getElementById('vis-current-preset-text');
      if (displayEl) {
        displayEl.textContent = title;
        displayEl.title = title;
      }

      const statusPresetEl = document.getElementById('vis-status-preset');
      if (statusPresetEl) {
        statusPresetEl.textContent = `预设 (${this.currentPresetIndex + 1}/${this.presetKeys.length}): ${title}`;
      }

      const select = document.getElementById('vis-preset-select');
      if (select) {
        select.value = this.currentPresetIndex;
      }

      const winTitle = document.getElementById('vis-window-title');
      if (winTitle) {
        winTitle.textContent = `Milkdrop 3D - [${title}]`;
      }

      const osd = document.getElementById('visualizer-osd');
      if (osd) {
        osd.textContent = `♫ ${title}`;
        osd.classList.add('visible');
        clearTimeout(this._osdTimer);
        this._osdTimer = setTimeout(() => {
          osd.classList.remove('visible');
        }, 4000);
      }

      this.remainingSeconds = this.cycleInterval;
      this.updateCountdownDisplay();
    }

    nextPreset() {
      this.loadPresetByIndex(this.currentPresetIndex + 1, 2.0);
    }

    prevPreset() {
      this.loadPresetByIndex(this.currentPresetIndex - 1, 2.0);
    }

    randomPreset() {
      if (this.presetKeys.length === 0) return;
      let rnd = Math.floor(Math.random() * this.presetKeys.length);
      if (rnd === this.currentPresetIndex) rnd = (rnd + 1) % this.presetKeys.length;
      this.loadPresetByIndex(rnd, 2.0);
    }

    startCycleTimer() {
      if (this.cycleTimer) clearInterval(this.cycleTimer);
      if (this.countdownTimer) clearInterval(this.countdownTimer);

      this.remainingSeconds = this.cycleInterval;

      if (this.autoCycle) {
        this.countdownTimer = setInterval(() => {
          this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
          this.updateCountdownDisplay();
        }, 1000);

        this.cycleTimer = setInterval(() => {
          this.randomPreset();
        }, this.cycleInterval * 1000);
      }
    }

    updateCountdownDisplay() {
      const countdownEl = document.getElementById('vis-status-timer');
      if (countdownEl) {
        countdownEl.textContent = this.autoCycle ? `轮播倒计时: ${this.remainingSeconds}s` : '自动轮播: 暂停';
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

      const fftSize = 1024;
      const synthArr = new Uint8Array(fftSize);
      const synthArrL = new Uint8Array(fftSize);
      const synthArrR = new Uint8Array(fftSize);
      let frameCount = 0;

      const loop = () => {
        if (this.visualizer) {
          try {
            const radio = window.radioEngine;
            let hasRealAudio = false;

            if (radio && radio.isPlaying && radio.analyser && radio.audioData) {
              for (let k = 0; k < 12; k++) {
                if (radio.audioData[k] > 0) {
                  hasRealAudio = true;
                  break;
                }
              }
            }

            if (hasRealAudio) {
              this.visualizer.render();
            } else {
              // Synthetic rhythmic synthwave pulses so visualizer is never dark
              frameCount++;
              const t = frameCount * 0.03;
              const bassBeat = Math.pow(Math.max(0, Math.sin(t * 3.14)), 3) * 80;
              const midMelody = Math.sin(t * 5.2) * 35;
              const trebleSparks = (Math.random() - 0.5) * 20;

              for (let i = 0; i < fftSize; i++) {
                const phase = (i / fftSize) * Math.PI * 4;
                const wave = Math.sin(phase + t * 3.5) * (20 + bassBeat * 0.5)
                           + Math.cos(phase * 2.2 - t * 1.8) * (15 + midMelody * 0.4)
                           + Math.sin(phase * 7) * 8
                           + trebleSparks;
                const val = Math.min(255, Math.max(0, Math.floor(128 + wave)));
                synthArr[i] = val;
                synthArrL[i] = val;
                synthArrR[i] = Math.min(255, Math.max(0, Math.floor(128 + wave * 0.92)));
              }

              this.visualizer.render({
                audioLevels: {
                  timeByteArray: synthArr,
                  timeByteArrayL: synthArrL,
                  timeByteArrayR: synthArrR
                }
              });
            }
          } catch (e) {
            console.warn('Butterchurn render error:', e);
          }
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
