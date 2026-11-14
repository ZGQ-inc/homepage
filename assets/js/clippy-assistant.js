/**
 * Clippy Assistant for ZGQ Inc. Web OS
 * Supports official clippyjs agent with rich animations, idle behaviors,
 * mouse tracking, music reactions & retro geek quotes.
 */

(function (window) {
  'use strict';

  const CLIPPY_IDLE_ACTIONS = [
    { anim: 'Thinking', text: "我正在思考：今天是不是一个适合写代码和修 Bug 的好日子？🤔" },
    { anim: 'GetTechy', text: "系统底层监测：已捕获 600+ 首高质量 NewRetroWave 合成波电台数据流！💻" },
    { anim: 'GetWizardy', text: "见证奇迹的时刻！双击桌面图标可以唤起复古视窗，拖拽任意排列！✨" },
    { anim: 'GetArtsy', text: "Milkdrop 3D 视觉器拥有 100 款经典预设，随音频 FFT 频谱流光溢彩，帧率拉满！🎨" },
    { anim: 'IdleHeadScratch', text: "哇，这个主页竟然用现代前端 1:1 复刻了 Windows 98 的窗口和控件体系！" },
    { anim: 'IdleFingerTap', text: "听这首合成波的时候忍不住跟着节拍敲键盘了~ 键盘敲击声也是一种白噪音！🎹" },
    { anim: 'IdleSnooze', text: "Zzz... 80 年代的复古霓虹夜景与合成波旋律真的太让人解压了..." },
    { anim: 'IdleAtom', text: "右键点击桌面可以一键切换壁纸哦！⚛️" },
    { anim: 'Searching', text: "想找 ZGQ 的开源作品吗？快打开『项目与导航』搜索在线项目！🔍" },
    { anim: 'Congratulate', text: "欢迎来到 ZGQ Inc. 的数字世界，祝你今天也是灵感满满的一天！🎉" },
    { anim: 'Writing', text: "正在记事本里记录灵感... 记事本内容会自动保存在你的浏览器本地哦！📝" },
    { anim: 'SendMail', text: "想联系作者？通讯簿里有 Telegram 和 Gmail 邮箱，随时来打个招呼！📬" },
    { anim: 'CheckingSomething', text: "正在检查软盘驱动器 A:... 咔嗒咔嗒... 好像没有插入 3.5 英寸软盘呢！💾" },
    { anim: 'Alert', text: "提示：本站没有蓝屏死机，只有纯粹的复古体验！⚠️" },
    { anim: 'Print', text: "正在向针式打印机发送任务... 嗤嗤嗤... 打印出一张复古 Windows 98 认证奖状！🖨️" },
    { anim: 'Save', text: "滴！已自动将你的桌面探索进度保存到浏览器 LocalStorage！💾" },
    { anim: 'IdleSideToSide', text: "左瞧瞧，右看看... 今天的复古桌面井井有条，简直像刚装完系统一样清爽！👀" },
    { anim: 'IdleRopePile', text: "哇！我这根曲别针可不是普通的文具，有整整 43 种动画呢！➰" },
    { anim: 'IdleEyeBrowRaise', text: "嘿！看起来你在认真研究这个页面，发现了什么有趣的彩蛋了吗？🤨" },
    { anim: 'GetAttention', text: "提示：屏幕前的朋友，记得眨眨眼、喝口水，站起来伸个懒腰再继续冲浪哦！💧" },
    { anim: 'Explain', text: "你还记得当年在 Word 97 里把我点来点去的时光吗？今天我依然陪伴着你！📎" },
    { anim: 'Processing', text: "正在后台编译代码... 优化等级 -O3... 没有任何 Warning，编译通过！⚡" },
    { anim: 'Hearing_1', text: "这首合成波的前奏太上头了！仿佛置身 1984 年迈阿密的霓虹棕榈海岸！🌴" },
    { anim: 'LookDown', text: "任务栏最右侧有系统托盘时钟和音量控制开关，还可以看时间哦！⌚" },
    { anim: 'Wave', text: "嗨！无论是第一次来访还是老朋友，很高兴在复古网络世界与你相遇！👋" },
    { anim: 'EmptyTrash', text: "回收站里躺着一些有趣的旧回忆，需要我帮你巡视一下吗？🗑️" },
    { anim: 'GetTechy', text: "主机侦测... 这套复古外观下的怪兽级配置简直太暴躁了！🚀" },
    { anim: 'Thinking', text: "56Kbps 调制解调器的拨号音：嘟——哔——滋滋滋滋... 那段纯粹的互联网回忆！📞" },
    { anim: 'GetWizardy', text: "提示：按桌面右键菜单，可以一键开启复古 CRT 显像管扫描线滤镜！📺" },
    { anim: 'GetArtsy', text: "Milkdrop 视觉器支持两种音频输入源：电台音源、Winamp 播放器！🎤" },
    { anim: 'Searching', text: "遇到感兴趣的技术问题吗？欢迎查阅『频道与博客』里的文章！📚" },
    { anim: 'IdleFingerTap', text: "敲敲敲... 每写下一行代码，世界上就少了一个需求，多了一份创造的乐趣！💻" },
    { anim: 'Greeting', text: "今天也是写代码没有 Bug、系统没有崩溃的大吉之日！✨" },
    { anim: 'Writing', text: "通讯簿留言板支持提交到 Cloudflare 分布式 D1 数据库，欢迎留下你的足迹！💬" },
    { anim: 'Hearing_1', text: "在 Spotify 视窗中收听 ZGQ 的年度 Top Songs，一起共享跨越时代的音乐品味！🎧" },
    { anim: 'IdleSnooze', text: "有时候，什么也不做，静静看着 Milkdrop 的极光粒子流动也是一种极致享受... 🌌" },
    { anim: 'Alert', text: "注意：你已在这个复古操作系统里停留了一段时间，看来你也是一位资深复古极客！🕹️" },
    { anim: 'LookLeft', text: "左侧桌面有 11 个经典快捷方式，双击即可唤起对应的系统程序！🗂️" },
    { anim: 'Explain', text: "你知道吗？Winamp 曾是千禧年最风靡的 MP3 播放器，那句口号是：It really whips the llama's ass! 🦙" },
    { anim: 'Congratulate', text: "感谢你来到 ZGQ 的个人主页！如果喜欢这个项目，欢迎去 GitHub 点一颗 Star 🌟！" },
    { anim: 'IdleHeadScratch', text: "奇怪... 我的磁铁吸附力今天好像特别强，连回形针同伴都被我吸引过来了！🧲" },
    { anim: 'GetTechy', text: "网络安全提醒：无论身在何处，请保护好你的个人密钥与安全凭证哦！🛡️" },
    { anim: 'Thinking', text: "如果给 Windows 98 配上光线追踪和实时 AI 助手，会不会就是现在这个样子？🤖" },
    { anim: 'Show', text: "点击『开始』菜单中的『整理窗口』，可以一键将所有打开的窗口排列整齐！📐" },
    { anim: 'GestureUp', text: "仰望星空，敲击键盘！代码是人类写给未来的情书。🚀" },
    { anim: 'CheckingSomething', text: "硬件诊断：检测到系统正在稳定运行！🧠" },
    { anim: 'Idle1_1', text: "曲别针小剧场：在这个没有打卡和 KPI 的复古时空里，尽情享受技术的美好吧！🌴" },
    { anim: 'GestureRight', text: "右边的记事本可以随手记下待办事项，刷新网页也不会丢失哦！📋" }
  ];

  const CLIPPY_CLICK_ANIMATIONS = [
    'GetAttention', 'Wave', 'Explain', 'GetTechy', 'GetWizardy', 'Congratulate',
    'IdleEyeBrowRaise', 'IdleRopePile', 'IdleAtom', 'Thinking', 'Alert', 'Print'
  ];

  const CLIPPY_CLICK_QUOTES = [
    "你点击了我！需要探索 ZGQ 的哪个开源项目或在线工具吗？📎",
    "提示：Milkdrop 视觉器支持全屏，按 [全屏] 按钮享受极致沉浸视效！🌌",
    "听歌提示：点击电台『下一首』探索 600+ 首合成波宝藏！🎵",
    "右键点击桌面空白处，可以切换壁纸或 CRT 特效！🖼️",
    "提示：可以双击 Winamp 启动第二款经典复古播放器，重温千禧年桌面回忆！📻",
    "想看网站信息？打开『我的电脑』查看！💻",
    "在『项目与导航』里支持即时搜索，快速定位！🔍",
    "双击我还可以看我的隐藏魔术绝活哦，不信你双击试试！🎩✨",
    "按住我可以随意把我拖拽到屏幕任意角落，找到你最舒服的视野！👀",
    "留言板现已接入 Cloudflare Turnstile 人机验证与 D1 数据库，安全又高效！🛡️",
    "右下角托盘不仅能看时间，点击小喇叭还可以一键切换全局静音/音效！🔊",
    "觉得桌面窗口太乱？点击任务栏的『整理窗口』或者『显示桌面』一秒搞定！📐",
    "写代码遇到卡壳时，听一首 80 年代复古 Synthwave 往往能激发意外灵感！🎹",
    "本站使用纯原生 HTML+CSS+JS 打造，零大型框架，极速加载！⚡",
    "如果喜欢这个复古小站，别忘了在 GitHub 上点个 Star 🌟 鼓励作者哦！",
    "随时找我聊天~ 我永远是那个热心肠的智能曲别针！📎✨"
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
      this.lastHookTimes = {};

      this.init();
    }

    async init() {
      // Remove any pre-existing fallback widgets
      const existing = document.getElementById('retro-clippy');
      if (existing) existing.remove();

      // Attempt to load official clippyjs agent first (local bundle preferred, CDN fallback)
      try {
        const loadOfficialPromise = (async () => {
          let clippyModule, clippyAgent;
          try {
            // 1. Load local offline bundle first (instant, 100% offline, zero network latency/timeout)
            clippyModule = await import('../vendor/clippy/index.mjs');
            const clippyPkg = await import('../vendor/clippy/agents/clippy/index.mjs');
            clippyAgent = clippyPkg.default || clippyPkg.Clippy;
          } catch (localErr) {
            console.warn('Local Clippy assets unavailable, falling back to CDN:', localErr);
            clippyModule = await import('https://unpkg.com/clippyjs/dist/index.mjs');
            const agentsModule = await import('https://unpkg.com/clippyjs/dist/agents/index.mjs');
            clippyAgent = agentsModule && agentsModule.Clippy;
          }
          if (clippyModule && clippyAgent) {
            return await clippyModule.initAgent(clippyAgent);
          }
          return null;
        })();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Clippy load timeout')), 6000)
        );

        this.agent = await Promise.race([loadOfficialPromise, timeoutPromise]);
        if (this.agent) {

          // Silence clippy internal animations & sound effects if desktop sound is muted
          if (this.agent && this.agent._animator) {
            const origPlaySound = this.agent._animator._playSound;
            this.agent._animator._playSound = function (...args) {
              if (window.desktopOS && !window.desktopOS.isSoundEnabled) return;
              return origPlaySound.apply(this, args);
            };

            const origPreload = this.agent._animator.preloadSounds;
            if (origPreload) {
              const self = this;
              this.agent._animator.preloadSounds = async function (...args) {
                const res = await origPreload.apply(this, args);
                self.syncSoundMute();
                return res;
              };
            }
          }
          this.syncSoundMute();

          this.agent.show();
          this.isAgentLoaded = true;

          if (this.agent && this.agent._el) {
            this.agent._el.classList.add('clippy');
            this.agent._el.id = 'clippyjs-agent';
          }

          // Position Clippy safely above taskbar & tray, especially on mobile
          const isMobile = window.innerWidth <= 768;
          const initialX = Math.max(10, window.innerWidth - (isMobile ? 120 : 160));
          const initialY = Math.max(10, window.innerHeight - (isMobile ? 210 : 180));
          if (this.agent && typeof this.agent.moveTo === 'function') {
            try { this.agent.moveTo(initialX, initialY, 0); } catch (e) {}
          }

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

    syncSoundMute() {
      const isMuted = !window.desktopOS || !window.desktopOS.isSoundEnabled;
      if (this.agent && this.agent._animator && this.agent._animator._sounds) {
        Object.values(this.agent._animator._sounds).forEach(audio => {
          if (audio) {
            audio.muted = isMuted;
            if (isMuted) {
              try {
                audio.pause();
                audio.currentTime = 0;
              } catch (e) {}
            }
          }
        });
      }
    }

    triggerHook(hookName, cooldownMs, actionFn) {
      if (!this.agent || !this.isVisible) return;
      const now = Date.now();
      if (this.lastHookTimes[hookName] && (now - this.lastHookTimes[hookName] < cooldownMs)) {
        return;
      }
      this.lastHookTimes[hookName] = now;
      try {
        actionFn();
      } catch (e) {}
    }

    bindAgentInteractions() {
      // 1. Setup drag and interactions on clippy element
      const el = (this.agent && this.agent._el) || document.getElementById('clippyjs-agent') || document.querySelector('.clippy') || document.querySelector('[class*="clippy"]');
      if (el) {
        this.setupDraggable(el);
      } else {
        setTimeout(() => {
          const fallbackEl = (this.agent && this.agent._el) || document.getElementById('clippyjs-agent') || document.querySelector('.clippy') || document.querySelector('[class*="clippy"]');
          if (fallbackEl) this.setupDraggable(fallbackEl);
        }, 300);
      }

      // 2. Radio: Song change reaction
      window.addEventListener('radio:songchanged', (e) => {
        const track = e.detail && e.detail.track;
        if (track && this.isVisible && this.agent) {
          this.triggerHook('radio_song', 4000, () => {
            this.agent.stop();
            this.agent.play('Hearing_1');
            this.speak(`🎶 正在播放: "${track.title}" - ${track.artist_name}`, 8000);
            setTimeout(() => {
              if (this.agent) this.agent.play('Congratulate');
            }, 3000);
          });
        }
      });

      // 3. Radio: Play / Pause reaction
      window.addEventListener('radio:playstatechanged', (e) => {
        if (!this.isVisible || !this.agent) return;
        const isPlaying = e.detail && e.detail.isPlaying;
        if (isPlaying) {
          this.triggerHook('radio_play', 25000, () => {
            this.agent.stop();
            this.agent.play('Hearing_1');
            this.speak("🎶 音乐响起！合成波能量正在注入，尽情享受复古节奏吧！", 7000);
          });
        }
      });

      // 4. Notepad: User typing auto-save reaction
      const notepad = document.getElementById('notepad-textarea');
      if (notepad) {
        notepad.addEventListener('input', () => {
          this.triggerHook('notepad_type', 30000, () => {
            this.agent.stop();
            this.agent.play('Save');
            this.speak("📝 记事本内容已自动保存到本地存储 (LocalStorage)！随时记录你的想法~", 6000);
          });
        });
      }

      // 5. Guestbook: Focus & Submission reactions
      const gbContent = document.getElementById('gb-content');
      if (gbContent) {
        gbContent.addEventListener('focus', () => {
          this.triggerHook('gb_focus', 60000, () => {
            this.agent.stop();
            this.agent.play('Writing');
            this.speak("想在留言板说点什么？留下你的大名和寄语吧！✍️", 7000);
          });
        });
      }

      const gbSubmitBtn = document.getElementById('gb-submit-btn');
      if (gbSubmitBtn) {
        gbSubmitBtn.addEventListener('click', () => {
          this.triggerHook('gb_submit', 10000, () => {
            this.agent.stop();
            this.agent.play('SendMail');
            this.speak("🚀 正在通过 Cloudflare Turnstile 与 D1 数据库提交留言...", 7000);
          });
        });
      }

      const gbClearBtn = document.getElementById('gb-clear-btn');
      if (gbClearBtn) {
        gbClearBtn.addEventListener('click', () => {
          this.triggerHook('gb_clear', 15000, () => {
            this.agent.stop();
            this.agent.play('EmptyTrash');
            this.speak("🗑️ 留言输入框已清空，重新组织一下语言吧~", 6000);
          });
        });
      }

      // 6. Contact: Copy Email button reaction
      const copyEmailBtn = document.getElementById('copy-email-btn');
      if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
          this.triggerHook('copy_email', 10000, () => {
            this.agent.stop();
            this.agent.play('Print');
            this.speak("📬 已复制联系邮箱到剪贴板！随时给我发邮件交流技术与创意哦！", 7000);
          });
        });
      }

      // 7. Navigation: Search input & reset reaction
      const navSearch = document.getElementById('nav-search-input');
      if (navSearch) {
        navSearch.addEventListener('input', () => {
          if (navSearch.value.trim().length > 0) {
            this.triggerHook('nav_search', 25000, () => {
              this.agent.stop();
              this.agent.play('Searching');
              this.speak("🔍 正在全库检索在线项目与实用工具...", 6000);
            });
          }
        });
      }

      const navResetBtn = document.getElementById('nav-reset-btn');
      if (navResetBtn) {
        navResetBtn.addEventListener('click', () => {
          this.triggerHook('nav_reset', 15000, () => {
            this.agent.stop();
            this.agent.play('Show');
            this.speak("📂 分类筛选已重置，所有宝藏项目已全部列出！", 6000);
          });
        });
      }

      // 8. Taskbar: Sound mute toggle reaction
      const soundToggle = document.getElementById('taskbar-sound-toggle');
      if (soundToggle) {
        soundToggle.addEventListener('click', () => {
          this.triggerHook('sound_toggle', 4000, () => {
            setTimeout(() => {
              const isMuted = !window.desktopOS || !window.desktopOS.isSoundEnabled;
              this.agent.stop();
              if (!isMuted) {
                this.agent.play('Congratulate');
                this.speak("🔊 音效已开启！沉浸在 80 年代复古合成波与视窗音效中吧！", 6000);
              } else {
                this.agent.play('IdleSnooze');
                this.speak("🔇 已切换为静音模式，嘘... 静静写代码也是一种享受~", 6000);
              }
            }, 100);
          });
        });
      }

      // 9. Visualizer: Fullscreen & preset controls reaction
      const visFsBtn = document.getElementById('vis-fullscreen-btn');
      if (visFsBtn) {
        visFsBtn.addEventListener('click', () => {
          this.triggerHook('vis_fs', 10000, () => {
            this.agent.stop();
            this.agent.play('GetArtsy');
            this.speak("🌌 Milkdrop 全屏极光幻境启动！按 ESC 键即可退出全屏哦！", 7000);
          });
        });
      }

      const visNextBtn = document.getElementById('vis-next-btn');
      const visRandBtn = document.getElementById('vis-rand-btn');
      const onPresetBtnClick = () => {
        this.triggerHook('vis_preset', 15000, () => {
          this.agent.stop();
          this.agent.play('GetWizardy');
          this.speak("✨ 切换到了新的 Milkdrop 视觉预设！随着音频 FFT 脉冲震撼起舞吧！", 6000);
        });
      };
      if (visNextBtn) visNextBtn.addEventListener('click', onPresetBtnClick);
      if (visRandBtn) visRandBtn.addEventListener('click', onPresetBtnClick);

      // 10. Spotify: Playlist switch reaction
      const spotifyBtns = document.getElementById('spotify-win-playlist-btns');
      if (spotifyBtns) {
        spotifyBtns.addEventListener('click', (e) => {
          if (e.target && e.target.tagName === 'BUTTON') {
            this.triggerHook('spotify_switch', 15000, () => {
              this.agent.stop();
              this.agent.play('Hearing_1');
              this.speak("🎧 正在切换 Spotify 精选歌单，享受流媒体音乐盛宴！", 7000);
            });
          }
        });
      }

      // 11. Desktop Management: Tidy windows reaction
      const tidyBtn = document.getElementById('btn-tidy-windows');
      const startTidyBtn = document.getElementById('start-tidy-windows');
      const onTidyClick = () => {
        this.triggerHook('tidy_windows', 15000, () => {
          this.agent.stop();
          this.agent.play('Congratulate');
          this.speak("📐 强迫症狂喜！所有桌面视窗已自动网格层叠对齐完毕！", 6000);
        });
      };
      if (tidyBtn) tidyBtn.addEventListener('click', onTidyClick);
      if (startTidyBtn) startTidyBtn.addEventListener('click', onTidyClick);

      // 12. Start Menu reaction
      const startBtn = document.getElementById('start-button');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.triggerHook('start_menu', 35000, () => {
            this.agent.stop();
            this.agent.play('GestureDown');
            this.speak("点击了『开始』菜单！可以在这里整理视窗或切换桌面模式~ 🪟", 6000);
          });
        });
      }

      // 13. Mouse tracking glance (debounced)
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
          // 45% chance to speak a humorous quote
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

      const q = CLIPPY_CLICK_QUOTES[Math.floor(Math.random() * CLIPPY_CLICK_QUOTES.length)];
      this.speak(q, 8000);
    }

    reactToDoubleClick() {
      if (!this.agent) return;
      try {
        this.agent.stop();
        const tricks = [
          { anim: 'GetWizardy', text: "Ta-da! 魔法时刻！你发现了 Clippy 的隐藏变身绝活！看我变出一顶巫师帽！🎩✨" },
          { anim: 'IdleRopePile', text: "看我的独门绝技：把自己打结成一捆绳子！——哎呀，快帮我解开！➰" },
          { anim: 'IdleAtom', text: "极客核聚变！看我化身为高速旋转的原核粒子，释放无限能量！⚛️⚡" },
          { anim: 'Print', text: "嗤嗤嗤... 正在为您现场打印一张复古极客特别荣誉证书！🖨️🎉" },
          { anim: 'EmptyTrash', text: "魔术时间：正在把桌面上的烦恼与 Bug 全部塞进回收站变走！🗑️✨" },
          { anim: 'Congratulate', text: "祝贺你发现了双击 Clippy 的隐藏彩蛋！给你放个漫天礼花庆祝！🎉🥳" },
          { anim: 'GetTechy', text: "嘀嘀嘀... 启动超频模式！算力已突破 9000！🚀💻" }
        ];
        const selected = tricks[Math.floor(Math.random() * tricks.length)];
        this.agent.play(selected.anim);
        this.speak(selected.text, 8000);
      } catch (e) {}
    }

    reactToDragEnd() {
      this.triggerHook('drag_end', 8000, () => {
        const dragQuotes = [
          "呼~ 搬家到这里啦？这个新位置视线真不错！👀",
          "换个新角度看桌面~ 我会在这里默默为你加油打气的！💪",
          "新位置已就绪！在这个角落看着你冲浪视野更开阔了！📎",
          "落地！无论在这个桌面的哪个角落，我随时为你效劳！✨"
        ];
        const q = dragQuotes[Math.floor(Math.random() * dragQuotes.length)];
        this.agent.stop();
        this.agent.play(Math.random() > 0.5 ? 'Alert' : 'IdleSideToSide');
        this.speak(q, 7000);
      });
    }

    reactToWindow(winId) {
      if (!this.agent || !this.isVisible) return;
      try {
        this.agent.stop();
        if (winId === 'win-visualizer') {
          this.agent.play('GetArtsy');
          this.speak("Milkdrop 3D 视觉器启动！支持 100 款预设与实时音频 FFT 频谱律动，按全屏享受震撼视效！🎨🌌", 8000);
        } else if (winId === 'win-navigation') {
          this.agent.play('Searching');
          this.speak("打开了项目与导航！这里汇集了 ZGQ 的在线工具、实用项目与 GitHub 开源仓库！🔍🌐", 8000);
        } else if (winId === 'win-github') {
          this.agent.play('GetTechy');
          this.speak("打开了 GitHub & 装备库！展示了活跃贡献、硬件装备搭配与深度逆向安全博文！💻🛠️", 8000);
        } else if (winId === 'win-player') {
          this.agent.play('Wave');
          this.speak("NewRetroWave 在线电台启动！600+ 首精选合成波音乐已就绪，享受 80 年代复古电波吧！📻⚡", 8000);
        } else if (winId === 'win-channel') {
          this.agent.play('SendMail');
          this.speak("打开了频道与博客！欢迎查阅最新博文动态与 Telegram @ZGQinc 技术分享！📢✍️", 8000);
        } else if (winId === 'win-spotify') {
          this.agent.play('Hearing_1');
          this.speak("Spotify 音乐空间启动！正在加载 ZGQ 的年度 Top Songs 和精选歌单，支持一键切换！🎧🎵", 8000);
        } else if (winId === 'win-contact') {
          this.agent.play('Writing');
          this.speak("打开了通讯簿与留言板！支持 Cloudflare Turnstile 验证并直连 D1 分布式数据库！💬📬", 8000);
        } else if (winId === 'win-computer') {
          this.agent.play('CheckingSomething');
          this.speak("打开了系统属性！本机搭载 CSS + JS 渲染器，充满复古回忆！🚀", 8000);
        } else if (winId === 'win-notepad') {
          this.agent.play('Writing');
          this.speak("打开了记事本！在这里输入的任何灵感与备忘都会实时自动保存到本地 LocalStorage 存储中！📝", 8000);
        } else if (winId === 'win-recycle') {
          this.agent.play('EmptyTrash');
          this.speak("打开了回收站！里面存放着一些值得怀念的旧文件与历史记录，怀旧感拉满！🗑️", 8000);
        } else if (winId === 'winamp') {
          this.agent.play('Hearing_1');
          this.speak("千禧年经典 Winamp 启动！怀旧均衡器、播放列表与复古皮肤重现眼前！🎛️📻", 8000);
        }
      } catch (e) {}
    }

    speak(text, duration = 8000) {
      if (this.isAgentLoaded && this.agent) {
        try {
          if (this.agent._balloon) {
            this.agent._balloon.CLOSE_BALLOON_DELAY = duration;
            this.agent._balloon.speak(() => {}, text);
            return;
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

      // Safe initial position above taskbar
      const isMobile = window.innerWidth <= 768;
      const initialX = Math.max(10, window.innerWidth - (isMobile ? 120 : 160));
      const initialY = Math.max(10, window.innerHeight - (isMobile ? 210 : 180));
      container.style.position = 'fixed';
      container.style.left = `${initialX}px`;
      container.style.top = `${initialY}px`;
      container.style.right = 'auto';
      container.style.bottom = 'auto';

      container.innerHTML = `
        <div class="clippy-balloon" id="clippy-balloon" style="display: none;">
          <div class="clippy-tip"></div>
          <div class="clippy-content" id="clippy-content"></div>
        </div>
        <div class="clippy-character" id="clippy-character" title="我是 Clippy！拖动我可以移动我，点击我互动，双击看绝活！">
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
      const container = document.getElementById('retro-clippy');
      if (container) {
        this.setupDraggable(container);
      }
    }

    setupDraggable(el) {
      if (!el || el.dataset.draggableSetup) return;
      el.dataset.draggableSetup = 'true';
      el.style.touchAction = 'none';
      el.style.cursor = 'grab';
      el.title = '我是 Clippy！按住拖动可移动位置，点击互动，双击看绝活！';

      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;
      let hasMoved = false;

      const ensureFixedCoords = () => {
        const rect = el.getBoundingClientRect();
        el.style.position = 'fixed';
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        return rect;
      };

      const onPointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;

        const rect = ensureFixedCoords();
        initialLeft = rect.left;
        initialTop = rect.top;

        el.style.cursor = 'grabbing';
        el.style.zIndex = '999999';

        if (e.type === 'touchstart' && e.cancelable) {
          e.preventDefault();
        }
      };

      const onPointerMove = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          hasMoved = true;
        }

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const elW = el.offsetWidth || 124;
        const elH = el.offsetHeight || 93;
        const maxLeft = window.innerWidth - elW - 4;
        const maxTop = window.innerHeight - elH - 34; // keep above taskbar

        newLeft = Math.max(4, Math.min(newLeft, maxLeft));
        newTop = Math.max(4, Math.min(newTop, maxTop));

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

        if (this.agent) {
          this.agent._targetX = newLeft;
          this.agent._targetY = newTop;
          if (this.agent._balloon && typeof this.agent._balloon.reposition === 'function') {
            try { this.agent._balloon.reposition(); } catch (err) {}
          }
        }

        if (e.cancelable) {
          e.preventDefault();
        }
      };

      const onPointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        el.style.cursor = 'grab';

        // Tap without drag triggers normal interaction; drag triggers move reaction
        if (!hasMoved) {
          this.reactToClick();
        } else {
          this.reactToDragEnd();
        }
      };

      // Touch events for mobile
      el.addEventListener('touchstart', onPointerDown, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: true });
      window.addEventListener('touchcancel', onPointerUp, { passive: true });

      // Mouse events for desktop
      el.addEventListener('mousedown', onPointerDown);
      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('mouseup', onPointerUp);

      el.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.reactToDoubleClick();
      });
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
