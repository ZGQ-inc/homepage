/**
 * Authentic Windows 95/98 Scrollbar Polyfill for non-WebKit browsers (Mozilla Firefox / Gecko).
 * Chromium / WebKit browsers (Chrome, Edge, Safari, Arc, Opera) use the native CSS ::-webkit-scrollbar (Dakedres Gist).
 * Firefox does not support ::-webkit-scrollbar by specification, so this script provides
 * 1:1 pixel-accurate Windows 98 scrollbars with smooth scrolling, 16px stepper buttons,
 * dithered track, and beveled thumb.
 */
(function () {
  'use strict';

  // Chromium / WebKit engines already natively render Dakedres ::-webkit-scrollbar rules
  if (window.CSS && CSS.supports && CSS.supports('selector(::-webkit-scrollbar)')) {
    return;
  }

  const SCROLLABLE_SELECTORS = [
    '#win-spotify .window-body',
    '.gh-tab-content',
    '#channel-blog-container',
    '#nav-bookmarks-container',
    '.tree-view',
    '#gb-messages-container',
    '.credits-scroll-box',
    '.recycle-table-wrapper',
    '.details-box',
    '#details-panel',
    'textarea',
    '[data-win98-scroll]'
  ];

  const registry = new Set();

  function attachWin98Scrollbar(el) {
    if (!el || el.nodeType !== 1 || el._win98Sb) return;
    const parent = el.parentElement;
    if (!parent) return;

    // Skip windows or containers that manage scrolling internally or have hidden overflow
    const cs = window.getComputedStyle(el);
    if (cs.overflowY === 'hidden' || cs.display === 'none') return;
    if (el.classList.contains('window-body') && !el.closest('#win-spotify')) return;

    el.classList.add('win98-scrollable-ff');

    const computedPos = window.getComputedStyle(parent).position;
    if (computedPos === 'static') {
      parent.style.position = 'relative';
    }

    const sb = document.createElement('div');
    sb.className = 'win98-sb-v';
    sb.setAttribute('aria-hidden', 'true');
    sb.innerHTML = `
      <div class="win98-sb-btn win98-sb-up" title="向上滚动"></div>
      <div class="win98-sb-track">
        <div class="win98-sb-thumb"></div>
      </div>
      <div class="win98-sb-btn win98-sb-down" title="向下滚动"></div>
    `;
    parent.appendChild(sb);

    const thumb = sb.querySelector('.win98-sb-thumb');
    const track = sb.querySelector('.win98-sb-track');
    const upBtn = sb.querySelector('.win98-sb-up');
    const downBtn = sb.querySelector('.win98-sb-down');

    function updateThumb() {
      const scrollH = el.scrollHeight;
      const clientH = el.clientHeight;
      if (scrollH <= clientH || clientH <= 0) {
        sb.style.display = 'none';
        return;
      }
      sb.style.display = 'flex';
      const trackH = track.clientHeight;
      if (trackH <= 0) return;
      const thumbH = Math.max(16, Math.min(trackH, Math.round((clientH / scrollH) * trackH)));
      thumb.style.height = thumbH + 'px';
      const maxScroll = scrollH - clientH;
      const maxTop = trackH - thumbH;
      const top = maxScroll > 0 ? Math.round((el.scrollTop / maxScroll) * maxTop) : 0;
      thumb.style.top = top + 'px';
    }

    function updateGeometry() {
      if (!parent.isConnected || !el.isConnected) {
        sb.style.display = 'none';
        return;
      }
      if (el.offsetParent === null || el.clientHeight <= 0 || el.scrollHeight <= el.clientHeight) {
        sb.style.display = 'none';
        return;
      }

      // Exact containing block origin probe (handles <fieldset>, <legend>, border, padding)
      let probe = parent.querySelector(':scope > .win98-cb-probe');
      if (!probe) {
        probe = document.createElement('div');
        probe.className = 'win98-cb-probe';
        probe.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:0;margin:0;border:none;';
        parent.appendChild(probe);
      }

      const probeRect = probe.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const elCs = window.getComputedStyle(el);
      const bt = parseFloat(elCs.borderTopWidth) || 0;
      const br = parseFloat(elCs.borderRightWidth) || 0;
      const bb = parseFloat(elCs.borderBottomWidth) || 0;

      const top = Math.round(elRect.top - probeRect.top + bt);
      const left = Math.round(elRect.right - probeRect.left - 16 - br);
      const height = Math.round(elRect.height - bt - bb);

      sb.style.top = top + 'px';
      sb.style.left = left + 'px';
      sb.style.height = height + 'px';
      sb.style.display = 'flex';

      updateThumb();
    }

    el.addEventListener('scroll', updateThumb, { passive: true });

    // 经典 Windows 98 步进微调按钮 (点击与按住连续步进)
    function setupButton(btn, delta) {
      let timer = null;
      let interval = null;
      function step() {
        el.scrollBy({ top: delta, behavior: 'smooth' });
      }
      btn.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        step();
        timer = setTimeout(() => {
          interval = setInterval(step, 80);
        }, 350);
        const onUp = () => {
          clearTimeout(timer);
          clearInterval(interval);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mouseup', onUp);
      });
    }
    setupButton(upBtn, -40);
    setupButton(downBtn, 40);

    // 轨道点击快速翻页 (Page Up / Page Down)
    track.addEventListener('mousedown', (e) => {
      if (e.target === thumb || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const trackRect = track.getBoundingClientRect();
      const clickY = e.clientY - trackRect.top;
      const thumbTop = parseFloat(thumb.style.top || '0');
      const thumbH = thumb.offsetHeight;
      if (clickY < thumbTop) {
        el.scrollBy({ top: -el.clientHeight * 0.8, behavior: 'smooth' });
      } else if (clickY > thumbTop + thumbH) {
        el.scrollBy({ top: el.clientHeight * 0.8, behavior: 'smooth' });
      }
    });

    // 滑块拖拽平滑滚动
    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    thumb.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      startY = e.clientY;
      startScrollTop = el.scrollTop;
      document.body.style.userSelect = 'none';

      const onMouseMove = (ev) => {
        if (!isDragging) return;
        const deltaY = ev.clientY - startY;
        const trackH = track.clientHeight;
        const thumbH = thumb.offsetHeight;
        const maxTop = trackH - thumbH;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxTop > 0 && maxScroll > 0) {
          el.scrollTop = startScrollTop + (deltaY / maxTop) * maxScroll;
        }
      };

      const onMouseUp = () => {
        isDragging = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => updateGeometry());
      ro.observe(el);
      ro.observe(parent);
    }

    el._win98Sb = { update: updateGeometry, updateThumb, el: sb };
    registry.add(el);
    updateGeometry();
  }

  function scan() {
    document.querySelectorAll(SCROLLABLE_SELECTORS.join(', ')).forEach(el => {
      attachWin98Scrollbar(el);
    });
    // Dynamic scan for any other custom scroll containers
    document.querySelectorAll('div, ul, table, textarea, pre').forEach(el => {
      if (el._win98Sb) return;
      const cs = window.getComputedStyle(el);
      if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
        attachWin98Scrollbar(el);
      }
    });
  }

  function updateAll() {
    registry.forEach(el => {
      if (el._win98Sb) {
        el._win98Sb.update();
      }
    });
  }

  window.addEventListener('resize', updateAll);
  window.addEventListener('load', () => {
    scan();
    updateAll();
  });

  if (window.MutationObserver) {
    const mo = new MutationObserver(() => {
      scan();
      updateAll();
    });
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  }

  // 页面就绪后立即扫描与布局
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scan();
      setTimeout(updateAll, 50);
    });
  } else {
    scan();
    setTimeout(updateAll, 50);
  }

  window.refreshWin98Scrollbars = updateAll;
})();
