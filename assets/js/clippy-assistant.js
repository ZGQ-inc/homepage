/**
 * Clippy Assistant for ZGQ Inc. Web OS
 * Supports official clippyjs agent with rich animations, idle behaviors,
 * mouse tracking, music reactions & retro geek quotes.
 */

(function (window) {
  'use strict';

  const CLIPPY_IDLE_ACTIONS = [
    { anim: 'Thinking', text: "我正在思考：今天是不是一个适合写代码和逆向分析的好日子？🤔" },
    { anim: 'GetTechy', text: "正在扫描主机网络... 发现 NewRetroWave 曲库已载入 612 首合成波神曲！💻" },
    { anim: 'GetWizardy', text: "见证奇迹的时刻！双击桌面图标可以唤起复古视窗，拖拽随意排列！✨" },
    { anim: 'GetArtsy', text: "Milkdrop 3D 视觉器拥有 100 款经典预设，随音乐流光溢彩，帧率拉满！🎨" },
    { anim: 'IdleHeadScratch', text: "哇，这个页面竟然是用现代前端 1:1 像素级复刻 Windows 98 的！" },
    { anim: 'IdleFingerTap', text: "听这首合成波的时候忍不住跟着节拍敲键盘了~ 🎹" },
    { anim: 'IdleSnooze', text: "Zzz... 80年代的复古霓虹夜景真的好让人放松..." },
    { anim: 'IdleAtom', text: "科学与极客！右键点击桌面可以一键切换 Wallpaper Engine 霓虹日落壁纸哦！⚛️" },
    { anim: 'Searching', text: "想找 ZGQ 的作品吗？快双击打开『项目与导航』搜索 41 个在线项目！🔍" },
    { anim: 'Congratulate', text: "欢迎来到 ZGQ Inc. 的数字世界，祝你今天也是极客精神满满的一天！🎉" },
    { anim: 'Writing', text: "正在记事本里记录极客灵感... 灵感+1！📝" },
    { anim: 'SendMail', text: "想联系作者？通讯簿里有 Telegram @ZGQinc 和 Gmail 邮箱！📬" }
  ];

  const CLIPPY_CLICK_ANIMATIONS = [
    'GetAttention', 'Wave', 'Explain', 'GetTechy', 'GetWizardy', 'Congratulate', 'IdleEyeBrowRaise'
  ];

  class ClippyAssistant {
    constructor() {
      this.agent = null;
      this.isAgentLoaded = false;
      this.domContainer = null;
      this.balloon = null;
      this.balloonText = null;
      this.isVisible = true;
      this.idleTimer = null;
      this.lastLookTime = 0;

      this.init();
    }

    async init() {
      // Remove any pre-existing fallback widgets
      const existing = document.getElementById('retro-clippy');
      if (existing) existing.remove();

      // Attempt to load official clippyjs agent first
      try {
        const clippyModule = await import('https://unpkg.com/clippyjs/dist/index.mjs');
        const agentsModule = await import('https://unpkg.com/clippyjs/dist/agents/index.mjs');
        if (clippyModule && agentsModule && agentsModule.Clippy) {
          this.agent = await clippyModule.initAgent(agentsModule.Clippy);
          this.agent.show();
          this.isAgentLoaded = true;

          // Grand entrance
          setTimeout(() => {
            if (this.agent) {
              try {
                if (this.agent._balloon) {
                  this.agent._balloon.CLOSE_BALLOON_DELAY = 8000;
                }
                this.agent.play('Greeting');
                this.speak("Hi! 我是 Clippy 📎 欢迎来到 ZGQ Inc. 的复古视窗世界！", 8000);
                setTimeout(() => {
                  if (this.agent) this.agent.play('Wave');
                }, 2000);
              } catch (e) {}
            }
          }, 600);

          this.bindAgentInteractions();
          this.startLivelyIdleRoutine();
          console.log('Official Clippy agent loaded successfully with full animation suite!');
          return;
        }
      } catch (e) {
        console.log('Official Clippy unavailable, using native interactive fallback:', e.message);
      }

      // ONLY create fallback DOM if official Clippy failed to load
      this.createFallbackDOM();
      this.bindEvents();
      setTimeout(() => {
        this.speak("Hi! 我是 Clippy 📎 欢迎来到 ZGQ Inc. 的复古视窗世界！", 8000);
      }, 1000);
    }

    bindAgentInteractions() {
      // Click & double click on clippy element
      setTimeout(() => {
        const el = document.querySelector('.clippy') || document.querySelector('[class*="clippy"]');
        if (el) {
          el.style.cursor = 'pointer';
          el.title = '我是 Clippy！点击我互动，双击看绝活！';

          el.addEventListener('click', () => {
            this.reactToClick();
          });

          el.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.reactToDoubleClick();
          });
        }
      }, 1500);

      // Listen to radio song changes
      window.addEventListener('radio:songchanged', (e) => {
        const track = e.detail && e.detail.track;
        if (track && this.isVisible && this.agent) {
          try {
            this.agent.stop();
            this.agent.play('Hearing_1');
            this.speak(`🎶 正在播放: "${track.title}" - ${track.artist_name}`, 8000);
            setTimeout(() => {
              if (this.agent) this.agent.play('Congratulate');
            }, 3000);
          } catch (err) {}
        }
      });

      // Mouse tracking glance (debounced)
      window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - this.lastLookTime < 6000 || !this.agent || !this.isVisible) return;

        const clippyEl = document.querySelector('.clippy');
        if (!clippyEl) return;

        const rect = clippyEl.getBoundingClientRect();
        const clippyCenterX = rect.left + rect.width / 2;
        const clippyCenterY = rect.top + rect.height / 2;

        const deltaX = e.clientX - clippyCenterX;
        const deltaY = e.clientY - clippyCenterY;

        // If mouse is far to the left
        if (deltaX < -250 && Math.abs(deltaY) < 200) {
          this.lastLookTime = now;
          try { this.agent.play('LookLeft'); } catch (err) {}
        } else if (deltaY < -200) {
          this.lastLookTime = now;
          try { this.agent.play('LookUp'); } catch (err) {}
        }
      });
    }

    startLivelyIdleRoutine() {
      if (this.idleTimer) clearInterval(this.idleTimer);

      const triggerIdleAction = () => {
        if (!this.agent || !this.isVisible) return;
        const item = CLIPPY_IDLE_ACTIONS[Math.floor(Math.random() * CLIPPY_IDLE_ACTIONS.length)];
        try {
          this.agent.stop();
          this.agent.play(item.anim);
          // 40% chance to speak a humorous quote
          if (Math.random() < 0.45) {
            this.speak(item.text, 8000);
          }
        } catch (e) {}
      };

      // Periodic random animations every 22 seconds
      this.idleTimer = setInterval(() => {
        triggerIdleAction();
      }, 22000);
    }

    reactToClick() {
      if (!this.agent) return;
      const anim = CLIPPY_CLICK_ANIMATIONS[Math.floor(Math.random() * CLIPPY_CLICK_ANIMATIONS.length)];
      try {
        this.agent.stop();
        this.agent.play(anim);
      } catch (e) {}

      const quotes = [
        "你点击了我！需要探索 ZGQ 的哪个开源项目吗？📎",
        "提示：Milkdrop 视觉器支持全屏，按 [全屏] 享受极致视效！🌌",
        "听歌提示：点击『随机下一首』探索 600+ 首合成波宝藏！🎵",
        "右键点击桌面空白处，可以切换 Wallpaper Engine 霓虹日落或 CRT 特效！🖼️",
        "提示：可以双击 Winamp 启动第二款经典复古播放器，重温千禧年桌面回忆！📻"
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      this.speak(q, 8000);
    }

    reactToDoubleClick() {
      if (!this.agent) return;
      try {
        this.agent.stop();
        const trick = Math.random() > 0.5 ? 'GetWizardy' : 'Congratulate';
        this.agent.play(trick);
        this.speak("Ta-da! 魔法时刻！你发现了 Clippy 的隐藏绝活！🎩✨", 8000);
      } catch (e) {}
    }

    reactToWindow(winId) {
      if (!this.agent || !this.isVisible) return;
      try {
        if (winId === 'win-visualizer') {
          this.agent.play('GetArtsy');
          this.speak("Milkdrop 3D 视觉器启动！随着合成波音乐节拍震撼律动！🎨", 8000);
        } else if (winId === 'win-navigation') {
          this.agent.play('Explain');
          this.speak("这里汇集了 ZGQ 的 34 个在线实用项目与 GitHub 开源仓库！🌐", 8000);
        } else if (winId === 'win-github') {
          this.agent.play('GetTechy');
          this.speak("这里展示了 ZGQ 的 GitHub 活跃数据、设备装备库与深度逆向博文！💻", 8000);
        } else if (winId === 'win-player') {
          this.agent.play('Wave');
          this.speak("NewRetroWave 在线电台启动！600+ 随机合成波音乐已就绪！📻", 8000);
        } else if (winId === 'win-channel') {
          this.agent.play('SendMail');
          this.speak("打开了频道和博客！欢迎查阅最新博文与 Telegram 技术动态！📢✍️", 8000);
        } else if (winId === 'win-spotify') {
          this.agent.play('Hearing_1');
          this.speak("Spotify 音乐空间启动！正在加载 ZGQ 的年度 Top Songs 和精选歌单！🎧", 8000);
        } else if (winId === 'win-contact') {
          this.agent.play('Writing');
          this.speak("打开了通讯簿与留言板！支持直接提交到 Cloudflare D1 数据库哦！💬", 8000);
        }
      } catch (e) {}
    }

    speak(text, duration = 8000) {
      if (this.isAgentLoaded && this.agent) {
        try {
          if (this.agent._balloon) {
            this.agent._balloon.CLOSE_BALLOON_DELAY = duration;
          }
          this.agent.speak(text);
          return;
        } catch (e) {}
      }

      if (!this.balloon || !this.balloonText) return;
      this.balloonText.textContent = text;
      this.balloon.style.display = 'block';

      clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        if (this.balloon) this.balloon.style.display = 'none';
      }, duration);
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
      const char = document.getElementById('clippy-character');
      if (char) {
        char.addEventListener('click', () => {
          this.reactToClick();
        });
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
