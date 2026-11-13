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

        // Stagger initial open windows
        if (!el.classList.contains('hidden') && !el.classList.contains('maximized')) {
          const offsetX = 90 + (index % 4) * 35;
          const offsetY = 30 + (index % 4) * 30;
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
          return;
        }

        if (!this.webampInstance) {
          const container = document.getElementById('webamp-root');
          this.webampInstance = new window.Webamp({
            initialTracks: [
              {
                metaData: {
                  artist: "FM-84 & Ollie Wride",
                  title: "Running in the Night"
                },
                url: "./old/music/Running_in_the_Night-FM-84&Ollie_Wride.mp3"
              },
              {
                metaData: {
                  artist: "The Midnight",
                  title: "Los Angeles"
                },
                url: "./old/music/The_Midnight-Los_Angeles.mp3"
              },
              {
                metaData: {
                  artist: "LeBrock",
                  title: "Please Don't Cry"
                },
                url: "./old/music/LeBrock-Please_Don`t_Cry.mp3"
              }
            ]
          });

          this.webampInstance.renderWhenReady(container).then(() => {
            this.isWebampRendered = true;
            this.playSound('ding');
            console.log('Webamp rendered onto desktop successfully.');
          });
        } else {
          // Toggle visibility
          const container = document.getElementById('webamp-root');
          if (container) {
            container.style.display = container.style.display === 'none' ? 'block' : 'none';
          }
        }
      };
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

      document.getElementById('ctx-refresh').addEventListener('click', () => {
        this.closeContextMenu();
        window.location.reload();
      });

      document.getElementById('ctx-wallpaper').addEventListener('click', () => {
        this.closeContextMenu();
        if (window.retroBackground) {
          const modes = ['wallpaper-engine', 'neon-sunset', 'win98-clouds', 'win98-teal', 'starfield', 'matrix'];
          const curIdx = modes.indexOf(window.retroBackground.mode);
          const nextMode = modes[(curIdx + 1) % modes.length];
          window.retroBackground.setMode(nextMode);
          if (window.clippy) window.clippy.speak(`壁纸已切换为: ${nextMode}`);
        }
      });

      document.getElementById('ctx-next-song').addEventListener('click', () => {
        this.closeContextMenu();
        if (window.radioEngine) window.radioEngine.next();
      });

      document.getElementById('ctx-toggle-clippy').addEventListener('click', () => {
        this.closeContextMenu();
        if (window.clippy) window.clippy.toggle();
      });

      document.getElementById('ctx-toggle-crt').addEventListener('click', () => {
        this.closeContextMenu();
        document.body.classList.toggle('crt-active');
      });

      document.getElementById('ctx-about').addEventListener('click', () => {
        this.closeContextMenu();
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
