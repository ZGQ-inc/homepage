/**
 * Clippy Assistant for ZGQ Inc. Web OS
 * Supports official clippyjs agent with pixel-perfect fallback & speech bubble
 */

(function (window) {
  'use strict';

  const CLIPPY_QUOTES = [
    "It looks like you're browsing ZGQ Inc.'s homepage. Would you like some help discovering awesome synthwave music?",
    "Did you know? You can drag, resize, and minimize any window just like in Windows 98!",
    "Tip: Right-click anywhere on the desktop to change the wallpaper or trigger retro CRT effects!",
    "NewRetroWave radio brings you 600+ hand-picked retro synth tracks. Sit back and enjoy the ride!",
    "Need to contact ZGQ? Check out the 'Contact' window to reach Telegram @ZGQinc or send an email.",
    "Butterchurn Milkdrop visualizer features 36+ hand-picked visual presets. Click fullscreen for the full trance experience!",
    "Have you checked out ZGQ's GitHub yet? Lots of exciting projects waiting for you!",
    "Remember: Never turn off your computer until it's safe to do so."
  ];

  class ClippyAssistant {
    constructor() {
      this.agent = null;
      this.isAgentLoaded = false;
      this.domContainer = null;
      this.balloon = null;
      this.balloonText = null;
      this.isVisible = true;

      this.init();
    }

    async init() {
      this.createFallbackDOM();
      this.bindEvents();

      // Attempt to load modern clippyjs if available
      try {
        const clippyModule = await import('https://unpkg.com/clippyjs/dist/index.mjs');
        const agentsModule = await import('https://unpkg.com/clippyjs/dist/agents/index.mjs');
        if (clippyModule && agentsModule && agentsModule.Clippy) {
          this.agent = await clippyModule.initAgent(agentsModule.Clippy);
          this.agent.show();
          this.isAgentLoaded = true;
          // Hide fallback DOM if real agent loaded
          if (this.domContainer) {
            this.domContainer.style.display = 'none';
          }
          this.speak("Hi! I'm Clippy. Welcome to ZGQ Inc.'s retro portal!");
          console.log('Official Clippy agent loaded successfully!');
          return;
        }
      } catch (e) {
        console.log('Using native interactive Clippy widget:', e.message);
      }

      // Fallback native widget is ready
      setTimeout(() => {
        this.speak("Hi! I'm Clippy. Welcome to ZGQ Inc.'s retro portal! 📎");
      }, 1000);
    }

    createFallbackDOM() {
      const container = document.createElement('div');
      container.id = 'retro-clippy';
      container.className = 'retro-clippy-widget';
      container.innerHTML = `
        <div class="clippy-balloon" id="clippy-balloon" style="display: none;">
          <div class="clippy-tip"></div>
          <div class="clippy-content" id="clippy-content"></div>
        </div>
        <div class="clippy-character" id="clippy-character" title="Click me for tips!">
          <div class="clippy-eyes">
            <span class="eye eye-left"><span class="pupil"></span></span>
            <span class="eye eye-right"><span class="pupil"></span></span>
          </div>
          <div class="clippy-eyebrow"></div>
          <div class="clippy-paperclip"></div>
        </div>
      `;
      document.body.appendChild(container);
      this.domContainer = container;
      this.balloon = document.getElementById('clippy-balloon');
      this.balloonText = document.getElementById('clippy-content');
    }

    bindEvents() {
      // Click on clippy for tips
      const char = document.getElementById('clippy-character');
      if (char) {
        char.addEventListener('click', () => {
          this.speakRandomQuote();
          this.wiggle();
        });
      }

      // Listen to radio song changes
      window.addEventListener('radio:songchanged', (e) => {
        const track = e.detail.track;
        if (track && this.isVisible) {
          this.speak(`🎶 Now Playing: "${track.title}" - ${track.artist_name}`);
        }
      });
    }

    speak(text, duration = 6000) {
      if (this.isAgentLoaded && this.agent) {
        try {
          this.agent.speak(text);
          return;
        } catch (e) {}
      }

      if (!this.balloon || !this.balloonText) return;
      this.balloonText.textContent = text;
      this.balloon.style.display = 'block';
      this.balloon.classList.add('animate-pop');

      clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this.balloon.style.display = 'none';
      }, duration);
    }

    speakRandomQuote() {
      const q = CLIPPY_QUOTES[Math.floor(Math.random() * CLIPPY_QUOTES.length)];
      this.speak(q);
    }

    wiggle() {
      const char = document.getElementById('clippy-character');
      if (char) {
        char.classList.add('clippy-wiggle');
        setTimeout(() => char.classList.remove('clippy-wiggle'), 600);
      }
    }

    toggle() {
      this.isVisible = !this.isVisible;
      if (this.domContainer) {
        this.domContainer.style.display = this.isVisible ? 'block' : 'none';
      }
      if (this.agent) {
        if (this.isVisible) this.agent.show();
        else this.agent.hide();
      }
    }
  }

  window.ClippyAssistant = ClippyAssistant;

})(window);
