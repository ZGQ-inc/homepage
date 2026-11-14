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

      // Ensure shared AudioContext
      const AudioCtx = (window.getSharedAudioContext ? window.getSharedAudioContext() : null) || (audioEngine && audioEngine.audioContext) || window.AudioContext || window.webkitAudioContext;
      this.audioContext = typeof AudioCtx === 'function' ? new AudioCtx() : AudioCtx;

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

    updateAudioSourceDisplay(sourceName) {
      if (this._lastSourceDisplay === sourceName) return;
      this._lastSourceDisplay = sourceName;
      const el = document.getElementById('vis-status-source');
      if (el) {
        el.textContent = `音频源: ${sourceName}`;
      }
    }

    startRender() {
      if (this.isRendering) return;
      this.isRendering = true;

      const fftSize = 1024;
      const wavBuffer = new Uint8Array(fftSize);
      const wavBufferL = new Uint8Array(fftSize);
      const wavBufferR = new Uint8Array(fftSize);
      const realWavData = new Uint8Array(fftSize);
      const realFreqData = new Uint8Array(fftSize);
      let idleFrame = 0;

      const loop = () => {
        if (this.visualizer) {
          try {
            const webamp = window.desktopOS && window.desktopOS.webampInstance;
            const isWebampPlaying = !!(webamp && webamp.store && webamp.store.getState().media && webamp.store.getState().media.status === 'PLAYING');
            const radio = window.radioEngine;
            const isRadioPlaying = !!(radio && radio.isPlaying);

            if (isWebampPlaying) {
              // ==========================================
              // Option A: 100% Real-time Winamp Audio!
              // ==========================================
              const webampAnalyser = (webamp.media && typeof webamp.media.getAnalyser === 'function')
                ? webamp.media.getAnalyser()
                : (webamp.media ? webamp.media._analyser : null);

              if (webampAnalyser) {
                try {
                  webampAnalyser.getByteTimeDomainData(realWavData);
                  webampAnalyser.getByteFrequencyData(realFreqData);
                } catch (e) {}

                this.visualizer.render({
                  audioLevels: {
                    timeByteArray: realWavData,
                    timeByteArrayL: realWavData,
                    timeByteArrayR: realWavData
                  }
                });

                // Synchronize Wallpaper Engine Neon Sunset background with Winamp bass & beat
                if (window.retroBackground) {
                  let sum = 0;
                  for (let i = 1; i < 14; i++) sum += (realFreqData[i] || 0);
                  const energy = Math.min(1.0, (sum / (13 * 255)) * 1.5);
                  window.retroBackground.setAudioEnergy(energy);
                }

                this.updateAudioSourceDisplay('Winamp 实时频谱');
              } else {
                this.renderAmbientWave(wavBuffer, wavBufferL, wavBufferR, fftSize, ++idleFrame);
                this.updateAudioSourceDisplay('Winamp');
              }
            } else if (isRadioPlaying) {
              // ==========================================
              // Option B: NRW Radio Engine Audio
              // ==========================================
              let hasRealOscillation = false;
              if (radio && radio.analyser) {
                try {
                  radio.analyser.getByteTimeDomainData(realWavData);
                  // Check if waveform differs from 128 (flat silence)
                  for (let k = 0; k < 64; k += 4) {
                    if (Math.abs(realWavData[k] - 128) > 2) {
                      hasRealOscillation = true;
                      break;
                    }
                  }
                } catch (e) {}
              }

              if (hasRealOscillation) {
                // Real Audio waveform from Web Audio API
                this.visualizer.render({
                  audioLevels: {
                    timeByteArray: realWavData,
                    timeByteArrayL: realWavData,
                    timeByteArrayR: realWavData
                  }
                });

                // Background pulse from real audio
                if (window.retroBackground && radio.audioData) {
                  let sum = 0;
                  for (let i = 1; i < 14; i++) sum += (radio.audioData[i] || 0);
                  window.retroBackground.setAudioEnergy(sum / (13 * 255));
                }
              } else {
                // Synthesize dynamic, beat-locked synthwave audio waveforms synchronized with radio.audio.currentTime
                this.renderSynthwaveWave(wavBuffer, wavBufferL, wavBufferR, fftSize, radio);
              }
              this.updateAudioSourceDisplay('NRW 电台');
            } else {
              // ==========================================
              // Option C: Music is paused or stopped -> gentle ambient wave so canvas doesn't decay to pitch black
              // ==========================================
              this.renderAmbientWave(wavBuffer, wavBufferL, wavBufferR, fftSize, ++idleFrame);
              this.updateAudioSourceDisplay('待机');
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

    renderSynthwaveWave(wavBuffer, wavBufferL, wavBufferR, fftSize, radio) {
      const curTime = (radio.audio && radio.audio.currentTime > 0) ? radio.audio.currentTime : (performance.now() / 1000);
      const bpm = 124; // Standard Synthwave tempo
      const beatTime = curTime * (bpm / 60);
      const beatFraction = beatTime % 1.0;
      const isSnareBeat = (Math.floor(beatTime) % 2 === 1);

      // Kick punch: powerful low frequency drop on beat
      const kickImpulse = Math.pow(Math.max(0, 1 - beatFraction * 3.5), 2) * 115;
      // Snare punch: noisy mid-frequency punch on beats 2 & 4
      const snareImpulse = isSnareBeat ? Math.pow(Math.max(0, 1 - beatFraction * 2.8), 2) * 85 : 0;
      // 16th-note rolling synth bassline
      const sixteenth = (beatTime * 4) % 1.0;
      const bassArp = Math.sin(sixteenth * Math.PI * 2) * (30 + kickImpulse * 0.4);
      // Lead melody & chord shimmer
      const melodyPhase = curTime * 7.5;
      const leadSynth = Math.sin(melodyPhase) * 25 + Math.cos(melodyPhase * 1.5) * 18;

      // Generate stereo 1024-sample audio waveform with massive dynamic range
      for (let i = 0; i < fftSize; i++) {
        const phase = (i / fftSize) * Math.PI * 4;
        const kickWave = Math.sin(phase * 1.2) * kickImpulse;
        const midWave = Math.sin(phase * 4.8 + melodyPhase) * (snareImpulse + leadSynth);
        const trebNoise = (Math.random() - 0.5) * (15 + (sixteenth < 0.25 ? 25 : 5));

        const sampleVal = kickWave + midWave + bassArp + trebNoise;
        const finalL = Math.min(255, Math.max(0, Math.floor(128 + sampleVal)));
        const finalR = Math.min(255, Math.max(0, Math.floor(128 + sampleVal * 0.94 + Math.sin(phase * 3) * 10)));

        wavBuffer[i] = finalL;
        wavBufferL[i] = finalL;
        wavBufferR[i] = finalR;
      }

      this.visualizer.render({
        audioLevels: {
          timeByteArray: wavBuffer,
          timeByteArrayL: wavBufferL,
          timeByteArrayR: wavBufferR
        }
      });

      // Synchronize background neon glow with kick bass
      if (window.retroBackground) {
        const energy = Math.min(1.0, (kickImpulse / 115) * 0.85 + 0.1);
        window.retroBackground.setAudioEnergy(energy);
      }
    }

    renderAmbientWave(wavBuffer, wavBufferL, wavBufferR, fftSize, frameCount) {
      const t = frameCount * 0.02;
      const ambientSway = Math.sin(t * 1.5) * 18;

      for (let i = 0; i < fftSize; i++) {
        const phase = (i / fftSize) * Math.PI * 2;
        const val = Math.min(255, Math.max(0, Math.floor(128 + Math.sin(phase + t) * ambientSway)));
        wavBuffer[i] = val;
        wavBufferL[i] = val;
        wavBufferR[i] = val;
      }

      this.visualizer.render({
        audioLevels: {
          timeByteArray: wavBuffer,
          timeByteArrayL: wavBufferL,
          timeByteArrayR: wavBufferR
        }
      });

      if (window.retroBackground) {
        window.retroBackground.setAudioEnergy(0.05);
      }
    }
  }

  window.VisualizerManager = VisualizerManager;

})(window);
