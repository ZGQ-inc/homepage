/**
 * Windows 98 Web OS Desktop Manager
 * Implements full window lifecycle, taskbar, start menu, icons, sound synthesis, and touch adaptation
 */

(function (window) {
  'use strict';

  class DesktopOS {
    constructor() {
      this.windows = {};
      this.highestZIndex = 100;
      this.activeWindowId = null;
      this.audioSynth = null;
      this.isSoundEnabled = true;

      this.init();
    }

    init() {
      this.initAudioSynth();
      this.setupWindows();
      this.setupDesktopIcons();
      this.setupTaskbar();
      this.setupStartMenu();
      this.setupContextMenu();
      this.setupClock();
      this.setupFoldableAdaptation();

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeStartMenu();
          this.closeContextMenu();
        }
      });

      console.log('Desktop OS initialized successfully.');
    }

    /* -------------------------------------------------------------------------
     * Pure Web Audio Retro Sound Synthesizer (Zero asset dependency)
     * ------------------------------------------------------------------------- */
    initAudioSynth() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.playChime = () => {
        if (!this.isSoundEnabled) return;
        try {
          const ctx = new AudioCtx();
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C E G C E
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime + idx * 0.08);
            osc.stop(ctx.currentTime + idx * 0.08 + 1.3);
          });
        } catch (e) {}
      };

      this.playClick = () => {
        if (!this.isSoundEnabled) return;
        try {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch (e) {}
      };
    }

    /* -------------------------------------------------------------------------
     * Window Management: Drag, Resize, Focus, Minimize, Maximize
     * ------------------------------------------------------------------------- */
    setupWindows() {
      const windowElements = document.querySelectorAll('.window[data-window-id]');
      windowElements.forEach((el, index) => {
        const id = el.dataset.windowId;
        this.windows[id] = {
          element: el,
          title: el.querySelector('.title-bar-text') ? el.querySelector('.title-bar-text').textContent.trim() : id,
          isMinimized: el.classList.contains('minimized'),
          isMaximized: el.classList.contains('maximized'),
          prevRect: null
        };

        // Window Title Bar Dragging (Desktop & Touch)
        const titleBar = el.querySelector('.title-bar');
        if (titleBar) {
          this.makeDraggable(el, titleBar);
        }

        // Window Controls (Min, Max, Close)
        const closeBtn = el.querySelector('button[aria-label="Close"]');
        if (closeBtn) {
          closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(id);
          });
        }

        const minBtn = el.querySelector('button[aria-label="Minimize"]');
        if (minBtn) {
          minBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimizeWindow(id);
          });
        }

        const maxBtn = el.querySelector('button[aria-label="Maximize"]');
        if (maxBtn) {
          maxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMaximize(id);
          });
        }

        // Bring to front on click
        el.addEventListener('mousedown', () => this.bringToFront(id));
        el.addEventListener('touchstart', () => this.bringToFront(id), { passive: true });

        // Stagger initial positions for open windows
        if (!el.classList.contains('hidden') && !el.classList.contains('maximized')) {
          const offsetX = 40 + (index % 5) * 30;
          const offsetY = 35 + (index % 5) * 30;
          if (window.innerWidth > 768) {
            el.style.left = `${offsetX}px`;
            el.style.top = `${offsetY}px`;
          }
        }
      });
    }

    makeDraggable(winEl, handleEl) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let initLeft = 0, initTop = 0;

      const onStart = (clientX, clientY) => {
        if (winEl.classList.contains('maximized')) return;
        isDragging = true;
        startX = clientX;
        startY = clientY;
        const rect = winEl.getBoundingClientRect();
        initLeft = rect.left;
        initTop = rect.top;
        this.bringToFront(winEl.dataset.windowId);
      };

      const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        let newLeft = initLeft + dx;
        let newTop = initTop + dy;

        // Viewport bounds constraint
        const maxLeft = window.innerWidth - 80;
        const maxTop = window.innerHeight - 60;
        newLeft = Math.max(0, Math.min(maxLeft, newLeft));
        newTop = Math.max(0, Math.min(maxTop, newTop));

        winEl.style.left = `${newLeft}px`;
        winEl.style.top = `${newTop}px`;
        winEl.style.margin = '0';
      };

      const onEnd = () => {
        isDragging = false;
      };

      handleEl.addEventListener('mousedown', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        onStart(e.clientX, e.clientY);
        const moveHandler = (ev) => onMove(ev.clientX, ev.clientY);
        const upHandler = () => {
          onEnd();
          window.removeEventListener('mousemove', moveHandler);
          window.removeEventListener('mouseup', upHandler);
        };
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);
      });

      handleEl.addEventListener('touchstart', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
      }, { passive: true });

      window.addEventListener('touchend', () => {
        if (isDragging) onEnd();
      });
    }

    bringToFront(id) {
      const win = this.windows[id];
      if (!win) return;

      this.highestZIndex += 1;
      win.element.style.zIndex = this.highestZIndex;
      this.activeWindowId = id;

      // Update active title bar classes
      Object.keys(this.windows).forEach((key) => {
        const otherEl = this.windows[key].element;
        if (key === id) {
          otherEl.classList.add('active');
          otherEl.classList.remove('inactive');
        } else {
          otherEl.classList.remove('active');
          otherEl.classList.add('inactive');
        }
      });

      this.updateTaskbar();
    }

    openWindow(id) {
      const win = this.windows[id];
      if (!win) return;

      win.element.classList.remove('hidden');
      win.element.classList.remove('minimized');
      win.isMinimized = false;
      this.bringToFront(id);

      // On mobile viewports, auto maximize or center window
      if (window.innerWidth <= 768) {
        win.element.style.left = '0px';
        win.element.style.top = '0px';
        win.element.style.width = '100vw';
        win.element.style.height = 'calc(100dvh - 36px)';
        win.element.classList.add('mobile-fullscreen');
      }

      if (this.playClick) this.playClick();
      this.updateTaskbar();
    }

    closeWindow(id) {
      const win = this.windows[id];
      if (!win) return;

      win.element.classList.add('hidden');
      win.element.classList.remove('active');
      if (this.activeWindowId === id) {
        this.activeWindowId = null;
      }
      this.updateTaskbar();
    }

    minimizeWindow(id) {
      const win = this.windows[id];
      if (!win) return;

      win.element.classList.add('minimized');
      win.isMinimized = true;
      win.element.classList.remove('active');
      this.updateTaskbar();
    }

    toggleMaximize(id) {
      const win = this.windows[id];
      if (!win) return;

      if (win.isMaximized) {
        // Restore
        win.element.classList.remove('maximized');
        win.isMaximized = false;
        if (win.prevRect) {
          win.element.style.left = win.prevRect.left;
          win.element.style.top = win.prevRect.top;
          win.element.style.width = win.prevRect.width;
          win.element.style.height = win.prevRect.height;
        }
      } else {
        // Maximize
        win.prevRect = {
          left: win.element.style.left,
          top: win.element.style.top,
          width: win.element.style.width,
          height: win.element.style.height
        };
        win.element.classList.add('maximized');
        win.isMaximized = true;
        win.element.style.left = '0px';
        win.element.style.top = '0px';
        win.element.style.width = '100vw';
        win.element.style.height = 'calc(100vh - 34px)';
      }
    }

    /* -------------------------------------------------------------------------
     * Desktop Icons Setup
     * ------------------------------------------------------------------------- */
    setupDesktopIcons() {
      const icons = document.querySelectorAll('.desktop-icon[data-target]');
      icons.forEach((icon) => {
        const targetId = icon.dataset.target;
        let lastClick = 0;

        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          icons.forEach((ic) => ic.classList.remove('selected'));
          icon.classList.add('selected');

          // Double click or single click on touch
          const now = Date.now();
          if (now - lastClick < 350 || window.innerWidth <= 768) {
            this.openWindow(targetId);
          }
          lastClick = now;
        });
      });

      // Clear icon selection on background click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-icon')) {
          icons.forEach((ic) => ic.classList.remove('selected'));
        }
      });
    }

    /* -------------------------------------------------------------------------
     * Taskbar & Start Menu
     * ------------------------------------------------------------------------- */
    setupTaskbar() {
      this.updateTaskbar();
    }

    updateTaskbar() {
      const container = document.getElementById('taskbar-tasks');
      if (!container) return;

      container.innerHTML = '';
      Object.keys(this.windows).forEach((id) => {
        const win = this.windows[id];
        if (win.element.classList.contains('hidden')) return;

        const btn = document.createElement('button');
        btn.className = 'taskbar-item' + (this.activeWindowId === id && !win.isMinimized ? ' active' : '');
        btn.textContent = win.title;
        btn.title = win.title;

        btn.addEventListener('click', () => {
          if (win.isMinimized) {
            win.element.classList.remove('minimized');
            win.isMinimized = false;
            this.bringToFront(id);
          } else if (this.activeWindowId === id) {
            this.minimizeWindow(id);
          } else {
            this.bringToFront(id);
          }
        });

        container.appendChild(btn);
      });
    }

    setupStartMenu() {
      const startBtn = document.getElementById('start-button');
      const startMenu = document.getElementById('start-menu');
      if (!startBtn || !startMenu) return;

      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.classList.toggle('open');
        startBtn.classList.toggle('active');
        if (this.playClick) this.playClick();
      });

      document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && e.target !== startBtn) {
          this.closeStartMenu();
        }
      });

      // Start Menu Item Clicks
      const menuItems = startMenu.querySelectorAll('[data-open-window]');
      menuItems.forEach((item) => {
        item.addEventListener('click', () => {
          const winId = item.dataset.openWindow;
          this.openWindow(winId);
          this.closeStartMenu();
        });
      });
    }

    closeStartMenu() {
      const startBtn = document.getElementById('start-button');
      const startMenu = document.getElementById('start-menu');
      if (startMenu) startMenu.classList.remove('open');
      if (startBtn) startBtn.classList.remove('active');
    }

    /* -------------------------------------------------------------------------
     * Desktop Context Menu (Right Click)
     * ------------------------------------------------------------------------- */
    setupContextMenu() {
      const menu = document.getElementById('desktop-context-menu');
      if (!menu) return;

      document.addEventListener('contextmenu', (e) => {
        // Only trigger on desktop background or icons
        if (e.target.closest('.window') || e.target.closest('#taskbar') || e.target.closest('#start-menu')) {
          return;
        }
        e.preventDefault();

        const x = Math.min(e.clientX, window.innerWidth - 180);
        const y = Math.min(e.clientY, window.innerHeight - 200);

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('visible');
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          this.closeContextMenu();
        }
      });

      // Context Menu Actions
      const actionRefresh = document.getElementById('ctx-refresh');
      if (actionRefresh) {
        actionRefresh.addEventListener('click', () => {
          this.closeContextMenu();
          window.location.reload();
        });
      }

      const actionWallpaper = document.getElementById('ctx-wallpaper');
      if (actionWallpaper) {
        actionWallpaper.addEventListener('click', () => {
          this.closeContextMenu();
          if (window.retroBackground) {
            const modes = ['neon-sunset', 'starfield', 'matrix'];
            const curIdx = modes.indexOf(window.retroBackground.mode);
            const nextMode = modes[(curIdx + 1) % modes.length];
            window.retroBackground.setMode(nextMode);
            if (window.clippy) window.clippy.speak(`Background switched to: ${nextMode.toUpperCase()}`);
          }
        });
      }

      const actionNextSong = document.getElementById('ctx-next-song');
      if (actionNextSong) {
        actionNextSong.addEventListener('click', () => {
          this.closeContextMenu();
          if (window.radioEngine) window.radioEngine.next();
        });
      }

      const actionToggleClippy = document.getElementById('ctx-toggle-clippy');
      if (actionToggleClippy) {
        actionToggleClippy.addEventListener('click', () => {
          this.closeContextMenu();
          if (window.clippy) window.clippy.toggle();
        });
      }

      const actionCRT = document.getElementById('ctx-toggle-crt');
      if (actionCRT) {
        actionCRT.addEventListener('click', () => {
          this.closeContextMenu();
          document.body.classList.toggle('crt-active');
        });
      }

      const actionAbout = document.getElementById('ctx-about');
      if (actionAbout) {
        actionAbout.addEventListener('click', () => {
          this.closeContextMenu();
          this.openWindow('win-computer');
        });
      }
    }

    closeContextMenu() {
      const menu = document.getElementById('desktop-context-menu');
      if (menu) menu.classList.remove('visible');
    }

    /* -------------------------------------------------------------------------
     * Taskbar Clock
     * ------------------------------------------------------------------------- */
    setupClock() {
      const clockEl = document.getElementById('taskbar-clock');
      if (!clockEl) return;

      const update = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        clockEl.textContent = `${hours}:${minutes} ${ampm}`;
        clockEl.title = now.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };
      update();
      setInterval(update, 1000);
    }

    /* -------------------------------------------------------------------------
     * Foldable Screen & Viewport Adaptation
     * ------------------------------------------------------------------------- */
    setupFoldableAdaptation() {
      const handleResize = () => {
        const isDualHorizontal = window.matchMedia('(horizontal-viewport-segments: 2)').matches;
        const isDualVertical = window.matchMedia('(vertical-viewport-segments: 2), (device-posture: folded)').matches;

        if (isDualHorizontal) {
          document.body.classList.add('foldable-dual-book');
          // Automatically tile navigation to left screen and player/visualizer to right screen
          const winNav = this.windows['win-navigation'];
          const winPlayer = this.windows['win-player'];
          if (winNav) {
            winNav.element.style.left = '0px';
            winNav.element.style.top = '0px';
            winNav.element.style.width = '50vw';
            winNav.element.style.height = 'calc(100vh - 34px)';
          }
          if (winPlayer) {
            winPlayer.element.style.left = '50vw';
            winPlayer.element.style.top = '0px';
            winPlayer.element.style.width = '50vw';
            winPlayer.element.style.height = 'calc(100vh - 34px)';
          }
        } else if (isDualVertical) {
          document.body.classList.add('foldable-laptop-posture');
        } else {
          document.body.classList.remove('foldable-dual-book', 'foldable-laptop-posture');
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();
    }
  }

  window.DesktopOS = DesktopOS;

})(window);
