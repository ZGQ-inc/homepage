/**
 * Windows 98 1:1 Authentic Desktop Operating System Manager
 * Features:
 *  - Authentic Windows 98 startup and event sounds (The Microsoft Sound, Ding, Chord, Recycle)
 *  - Full window lifecycle (Drag, Focus, Minimize, Maximize, Close)
 *  - Start menu, Taskbar, Context Menu, Tray Clock
 *  - Webamp (Winamp 2.9) secondary player integration
 *  - Immediate initialization & sizing for Butterchurn Milkdrop
 */

(function (window) {
  'use strict';

  class DesktopOS {
    constructor() {
      this.windows = {};
      this.highestZIndex = 100;
      this.activeWindowId = null;
      this.webampInstance = null;
      this.isWebampRendered = false;

      // Authentic Sound Audio Objects
      this.sounds = {
        startup: new Audio('./assets/audio/The Microsoft Sound.wav'),
        ding: new Audio('./assets/audio/DING.WAV'),
        chord: new Audio('./assets/audio/CHORD.WAV'),
        recycle: new Audio('./assets/audio/RECYCLE.WAV')
      };

      this.init();
    }

    init() {
      this.setupWindows();
      this.setupDesktopIcons();
      this.setupTaskbar();
      this.setupStartMenu();
      this.setupContextMenu();
      this.setupClock();
      this.setupFoldableAdaptation();
      this.setupWebampLauncher();

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeStartMenu();
          this.closeContextMenu();
        }
      });

      console.log('Desktop OS initialized successfully.');
    }

    playSound(name) {
      try {
        const s = this.sounds[name];
        if (s) {
          s.currentTime = 0;
          s.play().catch(() => {});
        }
      } catch (e) {}
    }

    /* -------------------------------------------------------------------------
     * Window Management
     * ------------------------------------------------------------------------- */
    setupWindows() {
      const windowElements = document.querySelectorAll('.window[data-window-id]');
      windowElements.forEach((el, index) => {
        const id = el.dataset.windowId;
        this.windows[id] = {
          element: el,
          title: el.querySelector('.title-bar-text span') ? el.querySelector('.title-bar-text span').textContent.trim() : id,
          isMinimized: el.classList.contains('minimized'),
          isMaximized: el.classList.contains('maximized'),
          prevRect: null
        };

        const titleBar = el.querySelector('.title-bar');
        if (titleBar) {
          this.makeDraggable(el, titleBar);
        }

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

        el.addEventListener('mousedown', () => this.bringToFront(id));
        el.addEventListener('touchstart', () => this.bringToFront(id), { passive: true });

        // Keep explicit inline positioning if present, otherwise stagger
        if (!el.classList.contains('hidden') && !el.classList.contains('maximized')) {
          if ((!el.style.left || !el.style.top) && window.innerWidth > 768) {
            const offsetX = 90 + (index % 4) * 35;
            const offsetY = 30 + (index % 4) * 30;
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

        const maxLeft = window.innerWidth - 80;
        const maxTop = window.innerHeight - 50;
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

      // On mobile viewports
      if (window.innerWidth <= 768) {
        win.element.style.left = '2px';
        win.element.style.top = '2px';
        win.element.style.width = 'calc(100vw - 4px)';
        win.element.style.height = 'calc(100dvh - 36px)';
      }

      this.playSound('ding');
      this.updateTaskbar();

      // If opening Milkdrop visualizer, ensure it initializes and sizes immediately
      if (id === 'win-visualizer' && window.visualizerManager) {
        setTimeout(() => {
          window.visualizerManager.init(window.radioEngine);
        }, 50);
      }

      // Trigger lively Clippy reaction to window opening
      if (window.clippy && typeof window.clippy.reactToWindow === 'function') {
        window.clippy.reactToWindow(id);
      }
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
        win.element.classList.remove('maximized');
        win.isMaximized = false;
        if (win.prevRect) {
          win.element.style.left = win.prevRect.left;
          win.element.style.top = win.prevRect.top;
          win.element.style.width = win.prevRect.width;
          win.element.style.height = win.prevRect.height;
        }
      } else {
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
        win.element.style.height = 'calc(100vh - 28px)';
      }

      if (id === 'win-visualizer' && window.visualizerManager) {
        setTimeout(() => {
          const wrapper = win.element.querySelector('.visualizer-wrapper');
          if (wrapper) {
            window.visualizerManager.resize(wrapper.clientWidth, wrapper.clientHeight);
          }
        }, 100);
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

          const now = Date.now();
          if (now - lastClick < 350 || window.innerWidth <= 768) {
            if (targetId === 'winamp') {
              this.toggleWebamp();
            } else {
              this.openWindow(targetId);
            }
          }
          lastClick = now;
        });
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.desktop-icon')) {
          icons.forEach((ic) => ic.classList.remove('selected'));
        }
      });
    }

    /* -------------------------------------------------------------------------
     * Webamp Secondary Player Integration
     * ------------------------------------------------------------------------- */
    setupWebampLauncher() {
      // Lazy initialization of Webamp
      this.toggleWebamp = () => {
        if (!window.Webamp) {
          alert('Webamp 正在加载组件，请稍候...');
          return Promise.resolve();
        }

        const existingWebampEl = document.getElementById('webamp');
        if (this.webampInstance && existingWebampEl) {
          const isCurrentlyHidden = existingWebampEl.style.display === 'none' || window.getComputedStyle(existingWebampEl).display === 'none';
          if (isCurrentlyHidden) {
            this.highestZIndex += 10;
            existingWebampEl.style.zIndex = this.highestZIndex;
            existingWebampEl.style.display = 'block';
            this.playSound('ding');
          } else {
            existingWebampEl.style.display = 'none';
          }
          return Promise.resolve();
        }

        this.highestZIndex += 10;
        const initialZ = this.highestZIndex;

        this.webampInstance = new window.Webamp({
          zIndex: initialZ,
          initialTracks: [
            {
              metaData: {
                artist: "FM-84 & Ollie Wride",
                title: "Running in the Night"
              },
              url: "./music/Running_in_the_Night-FM-84&Ollie_Wride.mp3"
            },
            {
              metaData: {
                artist: "The Midnight",
                title: "Los Angeles"
              },
              url: "./music/The_Midnight-Los_Angeles.mp3"
            },
            {
              metaData: {
                artist: "LeBrock",
                title: "Please Don't Cry"
              },
              url: "./music/LeBrock-Please_Don`t_Cry.mp3"
            }
          ]
        });

        // Handle close button inside Webamp
        this.webampInstance.onClose(() => {
          const el = document.getElementById('webamp');
          if (el) el.style.display = 'none';
        });

        const rootContainer = document.getElementById('webamp-root') || document.body;
        return this.webampInstance.renderWhenReady(rootContainer).then(() => {
          this.isWebampRendered = true;
          this.playSound('ding');
          const el = document.getElementById('webamp');
          if (el) {
            this.highestZIndex += 5;
            el.style.zIndex = this.highestZIndex;
            el.style.display = 'block';

            // Ensure window is in clear view on desktop
            const mainWin = el.querySelector('#main-window');
            if (mainWin && mainWin.parentElement) {
              const posX = Math.max(30, Math.min(window.innerWidth - 300, 180));
              const posY = Math.max(40, Math.min(window.innerHeight - 300, 90));
              mainWin.parentElement.style.transform = `translate(${posX}px, ${posY}px)`;
            }
          }
          console.log('Webamp rendered onto desktop successfully.');
        });
      };

      // Ensure clicking anywhere inside Webamp brings it to the top
      document.addEventListener('mousedown', (e) => {
        const el = document.getElementById('webamp');
        if (el && el.contains(e.target)) {
          this.highestZIndex += 1;
          el.style.zIndex = this.highestZIndex;
        }
      });
      document.addEventListener('touchstart', (e) => {
        const el = document.getElementById('webamp');
        if (el && el.contains(e.target)) {
          this.highestZIndex += 1;
          el.style.zIndex = this.highestZIndex;
        }
      }, { passive: true });
    }

    /* -------------------------------------------------------------------------
     * Taskbar & Start Menu
     * ------------------------------------------------------------------------- */
    setupTaskbar() {
      const btnShowDesktop = document.getElementById('btn-show-desktop');
      if (btnShowDesktop) {
        btnShowDesktop.addEventListener('click', () => {
          this.showDesktop();
        });
      }

      const btnTidyWindows = document.getElementById('btn-tidy-windows');
      if (btnTidyWindows) {
        btnTidyWindows.addEventListener('click', () => {
          this.tidyWindows();
        });
      }

      this.updateTaskbar();
    }

    tidyWindows() {
      // 1. Arrange win-navigation on the left
      const winNav = this.windows['win-navigation'];
      if (winNav && !winNav.element.classList.contains('hidden')) {
        winNav.element.classList.remove('minimized');
        winNav.isMinimized = false;
        winNav.element.style.left = '90px';
        winNav.element.style.top = '25px';
        const navW = Math.min(580, Math.max(320, window.innerWidth - 480));
        winNav.element.style.width = `${navW}px`;
      }

      // 2. Stack win-player and win-visualizer neatly on the right
      const rightX = Math.max(680, window.innerWidth - 450);
      const winPlayer = this.windows['win-player'];
      if (winPlayer && !winPlayer.element.classList.contains('hidden')) {
        winPlayer.element.classList.remove('minimized');
        winPlayer.isMinimized = false;
        winPlayer.element.style.left = `${rightX}px`;
        winPlayer.element.style.top = '25px';
        winPlayer.element.style.width = '420px';
      }

      const winVis = this.windows['win-visualizer'];
      if (winVis && !winVis.element.classList.contains('hidden')) {
        winVis.element.classList.remove('minimized');
        winVis.isMinimized = false;
        winVis.element.style.left = `${rightX}px`;
        winVis.element.style.top = '275px';
        winVis.element.style.width = '420px';
        winVis.element.style.height = '320px';
        if (window.visualizerManager) {
          setTimeout(() => {
            const wrapper = winVis.element.querySelector('.visualizer-wrapper');
            if (wrapper) window.visualizerManager.resize(wrapper.clientWidth, wrapper.clientHeight);
          }, 60);
        }
      }

      // 3. Cascade any other open windows in center workspace
      let offset = 0;
      Object.keys(this.windows).forEach((id) => {
        if (id === 'win-navigation' || id === 'win-player' || id === 'win-visualizer') return;
        const win = this.windows[id];
        if (win && !win.element.classList.contains('hidden') && !win.isMinimized) {
          const posX = 120 + (offset * 30);
          const posY = 40 + (offset * 30);
          win.element.style.left = `${posX}px`;
          win.element.style.top = `${posY}px`;
          offset++;
        }
      });

      this.playSound('ding');
      if (window.clippy) window.clippy.speak('桌面窗口已自动整理对齐！');
      this.updateTaskbar();
    }

    cascadeWindows() {
      let offset = 0;
      const visibleWins = Object.values(this.windows).filter(w => !w.element.classList.contains('hidden') && !w.isMinimized);
      visibleWins.forEach((win) => {
        win.element.style.left = `${80 + offset * 30}px`;
        win.element.style.top = `${25 + offset * 30}px`;
        this.bringToFront(win.element.dataset.windowId);
        offset++;
      });
      this.playSound('ding');
      this.updateTaskbar();
    }

    tileWindows() {
      const visibleWins = Object.values(this.windows).filter(w => !w.element.classList.contains('hidden') && !w.isMinimized);
      if (visibleWins.length === 0) return;
      const screenW = window.innerWidth - 85;
      const screenH = window.innerHeight - 36;
      const cols = visibleWins.length > 2 ? 2 : visibleWins.length;
      const rows = Math.ceil(visibleWins.length / cols);
      const tileW = Math.floor(screenW / cols);
      const tileH = Math.floor(screenH / rows);

      visibleWins.forEach((win, idx) => {
        const c = idx % cols;
        const r = Math.floor(idx / cols);
        win.element.style.left = `${80 + c * tileW}px`;
        win.element.style.top = `${8 + r * tileH}px`;
        win.element.style.width = `${tileW - 10}px`;
        win.element.style.height = `${tileH - 10}px`;
      });
      this.playSound('ding');
      this.updateTaskbar();
    }

    showDesktop() {
      const hasUnminimized = Object.values(this.windows).some(w => !w.element.classList.contains('hidden') && !w.isMinimized);
      if (hasUnminimized) {
        this._savedMinimizedState = {};
        Object.keys(this.windows).forEach((id) => {
          const w = this.windows[id];
          if (!w.element.classList.contains('hidden') && !w.isMinimized) {
            this._savedMinimizedState[id] = true;
            this.minimizeWindow(id);
          }
        });
      } else if (this._savedMinimizedState) {
        Object.keys(this._savedMinimizedState).forEach((id) => {
          if (this.windows[id]) {
            this.windows[id].element.classList.remove('minimized');
            this.windows[id].isMinimized = false;
          }
        });
        this._savedMinimizedState = null;
        this.updateTaskbar();
      }
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
        this.playSound('ding');
      });

      document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && e.target !== startBtn) {
          this.closeStartMenu();
        }
      });

      const menuItems = startMenu.querySelectorAll('[data-open-window]');
      menuItems.forEach((item) => {
        item.addEventListener('click', () => {
          const winId = item.dataset.openWindow;
          if (winId === 'winamp') {
            this.toggleWebamp();
          } else {
            this.openWindow(winId);
          }
          this.closeStartMenu();
        });
      });

      const startTidy = document.getElementById('start-tidy-windows');
      if (startTidy) {
        startTidy.addEventListener('click', () => {
          this.tidyWindows();
          this.closeStartMenu();
        });
      }
    }

    closeStartMenu() {
      const startBtn = document.getElementById('start-button');
      const startMenu = document.getElementById('start-menu');
      if (startMenu) startMenu.classList.remove('open');
      if (startBtn) startBtn.classList.remove('active');
    }

    /* -------------------------------------------------------------------------
     * Desktop Context Menu
     * ------------------------------------------------------------------------- */
    setupContextMenu() {
      const menu = document.getElementById('desktop-context-menu');
      if (!menu) return;

      document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.window') || e.target.closest('#taskbar') || e.target.closest('#start-menu')) {
          return;
        }
        e.preventDefault();

        const x = Math.min(e.clientX, window.innerWidth - 190);
        const y = Math.min(e.clientY, window.innerHeight - 220);

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('visible');
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          this.closeContextMenu();
        }
      });

      const bindCtx = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => {
          this.closeContextMenu();
          fn();
        });
      };

      bindCtx('ctx-refresh', () => window.location.reload());
      bindCtx('ctx-tidy', () => this.tidyWindows());
      bindCtx('ctx-cascade', () => this.cascadeWindows());
      bindCtx('ctx-tile', () => this.tileWindows());
      bindCtx('ctx-show-desktop', () => this.showDesktop());

      bindCtx('ctx-wallpaper', () => {
        if (window.retroBackground) {
          const modes = ['wallpaper-engine', 'neon-sunset', 'win98-clouds', 'win98-teal', 'starfield', 'matrix'];
          const curIdx = modes.indexOf(window.retroBackground.mode);
          const nextMode = modes[(curIdx + 1) % modes.length];
          window.retroBackground.setMode(nextMode);
          if (window.clippy) window.clippy.speak(`壁纸已切换为: ${nextMode}`);
        }
      });

      bindCtx('ctx-next-song', () => {
        if (window.radioEngine) window.radioEngine.next();
      });

      bindCtx('ctx-toggle-clippy', () => {
        if (window.clippy) window.clippy.toggle();
      });

      bindCtx('ctx-toggle-crt', () => {
        document.body.classList.toggle('crt-active');
      });

      bindCtx('ctx-about', () => {
        this.openWindow('win-computer');
      });
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
          const winNav = this.windows['win-navigation'];
          const winPlayer = this.windows['win-player'];
          if (winNav) {
            winNav.element.style.left = '0px';
            winNav.element.style.top = '0px';
            winNav.element.style.width = '50vw';
            winNav.element.style.height = 'calc(100vh - 28px)';
          }
          if (winPlayer) {
            winPlayer.element.style.left = '50vw';
            winPlayer.element.style.top = '0px';
            winPlayer.element.style.width = '50vw';
            winPlayer.element.style.height = 'calc(100vh - 28px)';
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
