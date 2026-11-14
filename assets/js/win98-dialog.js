/**
 * Windows 98 Authentic Modal Dialog & MessageBox System
 * Replaces native browser alert(), confirm(), and prompt() with pixel-perfect Win98 dialogs.
 */

(function (window) {
  'use strict';

  class Win98DialogSystem {
    constructor() {
      this.queue = [];
      this.activeDialog = null;
      this.overlay = null;
      this.init();
    }

    init() {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => this.init());
        return;
      }
      if (document.getElementById('win98-modal-overlay')) {
        this.overlay = document.getElementById('win98-modal-overlay');
        return;
      }

      const overlay = document.createElement('div');
      overlay.id = 'win98-modal-overlay';
      overlay.className = 'win98-modal-overlay';
      overlay.style.display = 'none';

      overlay.innerHTML = `
        <div class="window win98-dialog-box" id="win98-dialog-box" role="dialog" aria-modal="true">
          <div class="title-bar" id="win98-dialog-titlebar" style="cursor: move;">
            <div class="title-bar-text">
              <img id="win98-dialog-title-icon" src="./assets/icons/info-16x16-8bpp.png" alt="" />
              <span id="win98-dialog-title-text">系统提示</span>
            </div>
            <div class="title-bar-controls">
              <button aria-label="Close" id="win98-dialog-close-btn"></button>
            </div>
          </div>
          <div class="win98-dialog-content">
            <div class="win98-dialog-icon-wrap" id="win98-dialog-icon-wrap">
              <img id="win98-dialog-icon" src="./assets/icons/info-32x32-8bpp.png" alt="" />
            </div>
            <div class="win98-dialog-body" id="win98-dialog-body">
              <div class="win98-dialog-message" id="win98-dialog-message"></div>
              <div class="win98-dialog-input-wrap" id="win98-dialog-input-wrap" style="display: none;">
                <input type="text" class="win98-dialog-input" id="win98-dialog-input" autocomplete="off" />
              </div>
            </div>
          </div>
          <div class="win98-dialog-buttons" id="win98-dialog-buttons">
            <button class="default" id="win98-dialog-btn-ok">确定</button>
            <button id="win98-dialog-btn-cancel" style="display: none;">取消</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.dialogBox = document.getElementById('win98-dialog-box');
      this.titleText = document.getElementById('win98-dialog-title-text');
      this.titleIcon = document.getElementById('win98-dialog-title-icon');
      this.dialogIcon = document.getElementById('win98-dialog-icon');
      this.messageEl = document.getElementById('win98-dialog-message');
      this.inputWrap = document.getElementById('win98-dialog-input-wrap');
      this.inputEl = document.getElementById('win98-dialog-input');
      this.btnOk = document.getElementById('win98-dialog-btn-ok');
      this.btnCancel = document.getElementById('win98-dialog-btn-cancel');
      this.btnClose = document.getElementById('win98-dialog-close-btn');

      this.bindEvents();
    }

    bindEvents() {
      // Dragging titlebar
      const titlebar = document.getElementById('win98-dialog-titlebar');
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;

      const onPointerDown = (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        const rect = this.dialogBox.getBoundingClientRect();
        this.dialogBox.style.margin = '0';
        this.dialogBox.style.transform = 'none';
        this.dialogBox.style.left = `${rect.left}px`;
        this.dialogBox.style.top = `${rect.top}px`;

        startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        initialLeft = rect.left;
        initialTop = rect.top;

        if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
        const dx = clientX - startX;
        const dy = clientY - startY;

        const maxLeft = window.innerWidth - this.dialogBox.offsetWidth - 4;
        const maxTop = window.innerHeight - this.dialogBox.offsetHeight - 4;

        this.dialogBox.style.left = `${Math.max(4, Math.min(initialLeft + dx, maxLeft))}px`;
        this.dialogBox.style.top = `${Math.max(4, Math.min(initialTop + dy, maxTop))}px`;

        if (e.cancelable) e.preventDefault();
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      titlebar.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      titlebar.addEventListener('touchstart', onPointerDown, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (!this.overlay || this.overlay.style.display !== 'flex') return;
        if (e.key === 'Enter') {
          e.preventDefault();
          this.btnOk.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (this.btnCancel.style.display !== 'none') {
            this.btnCancel.click();
          } else {
            this.btnOk.click();
          }
        }
      });

      this.btnOk.addEventListener('click', () => {
        if (!this.activeDialog) return;
        const val = this.activeDialog.type === 'prompt' ? this.inputEl.value : true;
        this.closeDialog(val);
      });

      this.btnCancel.addEventListener('click', () => {
        if (!this.activeDialog) return;
        const val = this.activeDialog.type === 'prompt' ? null : false;
        this.closeDialog(val);
      });

      this.btnClose.addEventListener('click', () => {
        if (!this.activeDialog) return;
        const val = this.activeDialog.type === 'confirm' ? false : (this.activeDialog.type === 'prompt' ? null : undefined);
        this.closeDialog(val);
      });
    }

    inferIconAndTitle(message, customTitle, customIcon, type) {
      let icon = customIcon;
      let title = customTitle;

      const lowerMsg = String(message || '').toLowerCase();
      const isError = lowerMsg.includes('错误') || lowerMsg.includes('失败') || lowerMsg.includes('异常') || lowerMsg.includes('error') || lowerMsg.includes('fail') || lowerMsg.includes('http');
      const isWarning = lowerMsg.includes('警告') || lowerMsg.includes('注意') || lowerMsg.includes('请先') || lowerMsg.includes('warning') || lowerMsg.includes('太短') || lowerMsg.includes('过长') || lowerMsg.includes('不能为空');

      if (!icon) {
        if (type === 'confirm' || type === 'prompt') icon = 'question';
        else if (isError) icon = 'error';
        else if (isWarning) icon = 'warning';
        else icon = 'info';
      }

      if (!title) {
        if (type === 'confirm' || type === 'prompt') title = '确认';
        else if (isError) title = '错误';
        else if (isWarning) title = '警告';
        else title = '系统提示';
      }

      return { icon, title };
    }

    show(item) {
      if (!this.overlay || !this.dialogBox) {
        this.init();
      }
      this.activeDialog = item;
      const { message, title, type, icon, defaultValue } = item;

      const meta = this.inferIconAndTitle(message, title, icon, type);

      this.titleText.textContent = meta.title;

      // Icon setup
      let iconSrc32 = './assets/icons/info-32x32-8bpp.png';
      let iconSrc16 = './assets/icons/info-16x16-8bpp.png';
      if (meta.icon === 'error') {
        iconSrc32 = './assets/icons/error-32x32-8bpp.png';
        iconSrc16 = './assets/icons/error-16x16-8bpp.png';
      } else if (meta.icon === 'warning') {
        iconSrc32 = './assets/icons/warning-32x32-8bpp.png';
        iconSrc16 = './assets/icons/warning-16x16-8bpp.png';
      } else if (meta.icon === 'question') {
        iconSrc32 = './assets/icons/question-32x32-8bpp.png';
        iconSrc16 = './assets/icons/info-16x16-8bpp.png';
      }

      this.dialogIcon.src = iconSrc32;
      this.titleIcon.src = iconSrc16;

      this.messageEl.textContent = String(message || '');

      // Mode configuration
      if (type === 'prompt') {
        this.inputWrap.style.display = 'block';
        this.inputEl.value = defaultValue || '';
        this.btnCancel.style.display = 'inline-block';
      } else if (type === 'confirm') {
        this.inputWrap.style.display = 'none';
        this.btnCancel.style.display = 'inline-block';
      } else {
        this.inputWrap.style.display = 'none';
        this.btnCancel.style.display = 'none';
      }

      // Reset centered layout
      this.dialogBox.style.margin = '0';
      this.dialogBox.style.left = '50%';
      this.dialogBox.style.top = '50%';
      this.dialogBox.style.transform = 'translate(-50%, -50%)';

      this.overlay.style.display = 'flex';

      // Play authentic Windows 98 Sound
      try {
        if (window.desktop && typeof window.desktop.playSound === 'function') {
          if (meta.icon === 'error') {
            window.desktop.playSound('chord');
          } else {
            window.desktop.playSound('ding');
          }
        }
      } catch (e) {}

      // Auto focus primary button or input
      setTimeout(() => {
        if (type === 'prompt') {
          this.inputEl.focus();
          this.inputEl.select();
        } else {
          this.btnOk.focus();
        }
      }, 50);
    }

    closeDialog(result) {
      if (!this.activeDialog) return;
      const resolve = this.activeDialog.resolve;
      this.activeDialog = null;
      this.overlay.style.display = 'none';

      if (resolve) resolve(result);

      // Process next queued dialog if any
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        setTimeout(() => this.show(next), 50);
      }
    }

    enqueue(item) {
      return new Promise((resolve) => {
        item.resolve = resolve;
        const pushOrShow = () => {
          if (!this.activeDialog && this.overlay && this.overlay.style.display === 'none') {
            this.show(item);
          } else {
            this.queue.push(item);
          }
        };

        if (!document.body) {
          document.addEventListener('DOMContentLoaded', () => {
            if (!this.overlay) this.init();
            pushOrShow();
          }, { once: true });
        } else {
          if (!this.overlay) this.init();
          pushOrShow();
        }
      });
    }

    alert(message, title, icon) {
      return this.enqueue({
        type: 'alert',
        message,
        title,
        icon
      });
    }

    confirm(message, title, icon) {
      return this.enqueue({
        type: 'confirm',
        message,
        title,
        icon
      });
    }

    prompt(message, defaultValue = '', title, icon) {
      return this.enqueue({
        type: 'prompt',
        message,
        title,
        icon,
        defaultValue
      });
    }
  }

  // Instantiate and bind to window
  const win98Dialog = new Win98DialogSystem();
  window.win98Dialog = win98Dialog;

  // Intercept native browser alert, confirm & prompt
  window.alert = function (message, title) {
    return win98Dialog.alert(message, title);
  };

  window.confirm = function (message, title) {
    return win98Dialog.confirm(message, title);
  };

  window.prompt = function (message, defaultValue, title) {
    return win98Dialog.prompt(message, defaultValue, title);
  };

})(window);
