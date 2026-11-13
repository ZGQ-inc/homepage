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
      this.isWebampOpen = false;

      // Global Sound Setting (Default: false / muted)
      this.isSoundEnabled = localStorage.getItem('win98_sound_enabled') === 'true';

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
      this.setupSoundToggle();
      this.setupSoundBalloon();
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
      if (!this.isSoundEnabled) return;
      try {
        const s = this.sounds[name];
        if (s) {
          s.currentTime = 0;
          s.play().catch(() => {});
        }
      } catch (e) {}
    }

    setSoundEnabled(enabled, userTriggered = false) {
      this.isSoundEnabled = !!enabled;
      localStorage.setItem('win98_sound_enabled', this.isSoundEnabled ? 'true' : 'false');
      this.updateSoundTrayIcon();

      if (this.isSoundEnabled) {
        if (this.hideSoundBalloon) this.hideSoundBalloon();
        if (userTriggered) {
          this.playSound('chord');
        }
      } else {
        // When muted, pause any ongoing sounds immediately
        Object.values(this.sounds).forEach(s => {
          try {
            s.pause();
            s.currentTime = 0;
          } catch (e) {}
        });
      }

      // Sync all media elements on the page with global mute state
      try {
        document.querySelectorAll('audio, video').forEach(media => {
          media.muted = !this.isSoundEnabled;
        });
      } catch (e) {}
    }

    setupSoundToggle() {
      const soundIcon = document.getElementById('taskbar-sound-toggle');
      if (!soundIcon) return;

      this.updateSoundTrayIcon();
      soundIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setSoundEnabled(!this.isSoundEnabled, true);
      });
    }

    setupSoundBalloon() {
      const balloon = document.getElementById('win98-tray-balloon');
      const closeBtn = document.getElementById('win98-balloon-close');
      const soundIcon = document.getElementById('taskbar-sound-toggle');
      if (!balloon) return;

      const hideBalloon = () => {
        balloon.style.display = 'none';
      };

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          hideBalloon();
        });
      }

      // Clicking balloon enables sound
      balloon.addEventListener('click', () => {
        this.setSoundEnabled(true, true);
        hideBalloon();
      });

      this.showSoundBalloon = () => {
        if (this.isSoundEnabled) return;
        balloon.style.display = 'block';
        setTimeout(hideBalloon, 10000);
      };

      this.hideSoundBalloon = hideBalloon;
    }

    updateSoundTrayIcon() {
      const soundIcon = document.getElementById('taskbar-sound-toggle');
      if (!soundIcon) return;

      if (this.isSoundEnabled) {
        soundIcon.src = './assets/icons/speaker-16x16.png';
        soundIcon.title = '网页声音：已开启 (点击静音)';
        soundIcon.classList.remove('sound-muted');
      } else {
        soundIcon.src = './assets/icons/audio-nope-16x16.png';
        soundIcon.title = '网页声音：已静音 (点击开启)';
        soundIcon.classList.add('sound-muted');
      }
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

        // 8-way border/corner resizing (inspired by 1j01/98 os-gui)
        this.makeResizable(el);

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
          if (window.innerWidth <= 768) {
            el.style.left = '8px';
            el.style.top = '10px';
            el.style.width = 'calc(100vw - 16px)';
          } else if (!el.style.left || !el.style.top) {
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

        const maxLeft = window.innerWidth - 60;
        const maxTop = window.innerHeight - 36;
        newLeft = Math.max(-10, Math.min(maxLeft, newLeft));
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
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        onMove(touch.clientX, touch.clientY);
      }, { passive: false });

      window.addEventListener('touchend', () => {
        if (isDragging) onEnd();
      });
      window.addEventListener('touchcancel', () => {
        if (isDragging) onEnd();
      });

      // 双击/双击触控标题栏切换最大化/还原
      handleEl.addEventListener('dblclick', (e) => {
        if (e.target.tagName.toLowerCase() === 'button') return;
        this.toggleMaximize(winEl.dataset.windowId);
      });
    }

    /* -------------------------------------------------------------------------
     * 8-Way Window Resizing (Inspired by 1j01/98 $Window.js)
     * Supports mouse & touch edge/corner dragging with constraints
     * ------------------------------------------------------------------------- */
    makeResizable(winEl) {
      const directions = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];
      directions.forEach((dir) => {
        const handle = document.createElement('div');
        handle.className = `window-handle window-handle-${dir}`;
        handle.dataset.direction = dir;
        winEl.appendChild(handle);

        let isResizing = false;
        let startX = 0, startY = 0;
        let startLeft = 0, startTop = 0, startWidth = 0, startHeight = 0;

        const onResizeStart = (clientX, clientY) => {
          if (winEl.classList.contains('maximized')) return;
          isResizing = true;
          startX = clientX;
          startY = clientY;

          const rect = winEl.getBoundingClientRect();
          startLeft = rect.left;
          startTop = rect.top;
          startWidth = rect.width;
          startHeight = rect.height;

          this.bringToFront(winEl.dataset.windowId);
          document.body.style.userSelect = 'none';
          document.body.style.webkitUserSelect = 'none';
        };

        const onResizeMove = (clientX, clientY) => {
          if (!isResizing) return;
          const dx = clientX - startX;
          const dy = clientY - startY;

          const minW = 280;
          const minH = 160;
          const maxW = window.innerWidth - 8;
          const maxH = window.innerHeight - 36;

          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;

          // Horizontal
          if (dir.includes('e')) {
            newWidth = Math.max(minW, Math.min(maxW - startLeft, startWidth + dx));
          } else if (dir.includes('w')) {
            newWidth = Math.max(minW, startWidth - dx);
            newLeft = startLeft + (startWidth - newWidth);
            if (newLeft < 0) {
              newWidth += newLeft;
              newLeft = 0;
            }
          }

          // Vertical
          if (dir.includes('s')) {
            newHeight = Math.max(minH, Math.min(maxH - startTop, startHeight + dy));
          } else if (dir.includes('n')) {
            newHeight = Math.max(minH, startHeight - dy);
            newTop = startTop + (startHeight - newHeight);
            if (newTop < 0) {
              newHeight += newTop;
              newTop = 0;
            }
          }

          winEl.style.width = `${newWidth}px`;
          winEl.style.height = `${newHeight}px`;
          winEl.style.left = `${newLeft}px`;
          winEl.style.top = `${newTop}px`;

          // If visualizer window, update Milkdrop canvas dynamically
          if (winEl.id === 'win-visualizer' && window.visualizerManager) {
            const wrapper = winEl.querySelector('.visualizer-wrapper');
            if (wrapper) {
              window.visualizerManager.resize(wrapper.clientWidth, wrapper.clientHeight);
            }
          }
        };

        const onResizeEnd = () => {
          if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
          }
        };

        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onResizeStart(e.clientX, e.clientY);

          const moveHandler = (ev) => onResizeMove(ev.clientX, ev.clientY);
          const upHandler = () => {
            onResizeEnd();
            window.removeEventListener('mousemove', moveHandler);
            window.removeEventListener('mouseup', upHandler);
          };
          window.addEventListener('mousemove', moveHandler);
          window.addEventListener('mouseup', upHandler);
        });

        handle.addEventListener('touchstart', (e) => {
          e.stopPropagation();
          const touch = e.touches[0];
          onResizeStart(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
          if (!isResizing) return;
          if (e.cancelable) e.preventDefault();
          const touch = e.touches[0];
          onResizeMove(touch.clientX, touch.clientY);
        }, { passive: false });

        window.addEventListener('touchend', onResizeEnd);
        window.addEventListener('touchcancel', onResizeEnd);
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
      if (window.innerWidth <= 768 && !win.isMaximized) {
        if (!win.element.style.left || win.element.style.left === '2px') {
          win.element.style.left = '8px';
          win.element.style.top = '10px';
          win.element.style.width = 'calc(100vw - 16px)';
        }
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
          left: win.element.style.left || '8px',
          top: win.element.style.top || '10px',
          width: win.element.style.width || '',
          height: win.element.style.height || ''
        };
        win.element.classList.add('maximized');
        win.isMaximized = true;
        win.element.style.left = '0px';
        win.element.style.top = '0px';
        win.element.style.width = '100vw';
        win.element.style.height = 'calc(100dvh - var(--taskbar-height, 28px))';
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
      this.webampTracks = [
        {
          metaData: {
            artist: "Velkommen",
            title: "title.wma"
          },
          url: "./assets/music/title.wma"
        },
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
            artist: "The Midnight & Timecop1983",
            title: "River of Darkness"
          },
          url: "./old/music/The_Midnight&Timecop1983-River_of_Darkness_(feat._Timecop1983).mp3"
        },
        {
          metaData: {
            artist: "LeBrock",
            title: "Please Don't Cry"
          },
          url: "./old/music/LeBrock-Please_Don`t_Cry.mp3"
        },
        {
          metaData: {
            artist: "LeBrock",
            title: "Hangin' On"
          },
          url: "./old/music/LeBrock-Hangin`_On.mp3"
        },
        {
          metaData: {
            artist: "LeBrock",
            title: "Takes All Night"
          },
          url: "./old/music/LeBrock-Takes_All_Night.mp3"
        },
        {
          metaData: {
            artist: "Dance With The Dead",
            title: "Dead of Night"
          },
          url: "./old/music/Dance_With_The_Dead-Dead_of_Night.mp3"
        },
        {
          metaData: {
            artist: "GUNSHIP",
            title: "When You Grow up, Your Heart Dies"
          },
          url: "./old/music/GUNSHIP-When_You_Grow_up,_Your_Heart_Dies.mp3"
        },
        {
          metaData: {
            artist: "Timecop1983",
            title: "On the Run"
          },
          url: "./old/music/Timecop1983-On_the_Run.mp3"
        },
        {
          metaData: {
            artist: "PYLOT",
            title: "A Race Against Time"
          },
          url: "./old/music/PYLOT-A_Race_Against_Time.mp3"
        }
      ];

      // Lazy initialization of Webamp
      this.toggleWebamp = () => {
        if (!window.Webamp) {
          alert('Webamp 正在加载组件，请稍候...');
          return Promise.resolve();
        }

        const existingWebampEl = document.getElementById('webamp');
        if (this.webampInstance && existingWebampEl) {
          const isCurrentlyHidden = !this.isWebampOpen || existingWebampEl.style.display === 'none' || window.getComputedStyle(existingWebampEl).display === 'none';
          if (isCurrentlyHidden) {
            this.highestZIndex += 10;
            existingWebampEl.style.zIndex = this.highestZIndex;
            existingWebampEl.style.display = 'block';
            this.webampInstance.reopen();
            this.isWebampOpen = true;
            this.activeWindowId = 'winamp';
            this.updateTaskbar();
            this.playSound('ding');
          } else {
            this.webampInstance.close();
            existingWebampEl.style.display = 'none';
            this.isWebampOpen = false;
            if (this.activeWindowId === 'winamp') this.activeWindowId = null;
            this.updateTaskbar();
          }
          return Promise.resolve();
        }

        this.highestZIndex += 10;
        const initialZ = this.highestZIndex;
        const posX = Math.max(30, Math.min(window.innerWidth - 300, 180));
        const posY = Math.max(40, Math.min(window.innerHeight - 300, 90));

        this.webampInstance = new window.Webamp({
          zIndex: initialZ,
          initialTracks: this.webampTracks,
          __initialWindowLayout: {
            main: { position: { x: posX, y: posY } },
            equalizer: { position: { x: posX, y: posY + 116 } },
            playlist: { position: { x: posX, y: posY + 232 } }
          }
        });

        // Handle close button inside Webamp
        this.webampInstance.onClose(() => {
          this.isWebampOpen = false;
          const el = document.getElementById('webamp');
          if (el) el.style.display = 'none';
          if (this.activeWindowId === 'winamp') this.activeWindowId = null;
          this.updateTaskbar();
        });

        const rootContainer = document.getElementById('webamp-root') || document.body;
        return this.webampInstance.renderWhenReady(rootContainer).then(() => {
          this.isWebampRendered = true;
          this.isWebampOpen = true;
          this.activeWindowId = 'winamp';
          this.playSound('ding');
          const el = document.getElementById('webamp');
          if (el) {
            this.highestZIndex += 5;
            el.style.zIndex = this.highestZIndex;
            el.style.display = 'block';
          }
          if (this.webampInstance && this.webampInstance.store) {
            this.webampInstance.store.dispatch({ type: "CLICKED_TRACK", index: 0 });
          }
          this.updateTaskbar();
          console.log('Webamp rendered onto desktop successfully.');
        });
      };

      // Ensure clicking anywhere inside Webamp brings it to the top
      document.addEventListener('mousedown', (e) => {
        const el = document.getElementById('webamp');
        if (el && el.contains(e.target) && this.isWebampOpen) {
          this.highestZIndex += 1;
          el.style.zIndex = this.highestZIndex;
          this.activeWindowId = 'winamp';
          this.updateTaskbar();
        }
      });
      document.addEventListener('touchstart', (e) => {
        const el = document.getElementById('webamp');
        if (el && el.contains(e.target) && this.isWebampOpen) {
          this.highestZIndex += 1;
          el.style.zIndex = this.highestZIndex;
          this.activeWindowId = 'winamp';
          this.updateTaskbar();
        }
      }, { passive: true });

      // 在 Winamp 中添加并直接播放指定音频
      this.playTrackInWebamp = (trackUrl, trackTitle) => {
        return this.toggleWebamp().then(() => {
          if (this.webampInstance) {
            this.webampInstance.appendTracks([{
              url: trackUrl,
              defaultName: trackTitle || 'Classic Track',
              metaData: { title: trackTitle || 'Classic Track', artist: '原站经典曲库' }
            }]);
            this.webampInstance.play();
          }
        });
      };
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
      if (window.innerWidth <= 768) {
        let mobOffset = 0;
        Object.keys(this.windows).forEach((id) => {
          const win = this.windows[id];
          if (win && !win.element.classList.contains('hidden') && !win.isMinimized) {
            win.element.style.left = `${8 + mobOffset * 8}px`;
            win.element.style.top = `${10 + mobOffset * 15}px`;
            win.element.style.width = 'calc(100vw - 16px)';
            mobOffset++;
          }
        });
        this.playSound('ding');
        if (window.clippy) window.clippy.speak('移动端窗口已重置对齐！');
        this.updateTaskbar();
        return;
      }

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

      // Winamp taskbar entry
      if (this.isWebampOpen) {
        const btn = document.createElement('button');
        btn.className = 'taskbar-item' + (this.activeWindowId === 'winamp' ? ' active' : '');
        btn.innerHTML = '<img src="./assets/icons/winamp2-16x16.png" style="width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;">Winamp';
        btn.title = 'Winamp 音乐播放器';

        btn.addEventListener('click', () => {
          const el = document.getElementById('webamp');
          if (this.activeWindowId === 'winamp' && el && el.style.display !== 'none') {
            el.style.display = 'none';
            this.activeWindowId = null;
            this.updateTaskbar();
          } else {
            if (el) {
              el.style.display = 'block';
              this.highestZIndex += 1;
              el.style.zIndex = this.highestZIndex;
            }
            this.activeWindowId = 'winamp';
            this.updateTaskbar();
          }
        });

        container.appendChild(btn);
      }
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
