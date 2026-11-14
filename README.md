# 🌆 Windows 98 Synthwave Retro Desktop (ZGQ Inc. Homepage)

<div align="center">

![Windows 98 SE](https://img.shields.io/badge/Windows-98_SE_Retro-008080?style=for-the-badge&logo=windows-95&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Webamp](https://img.shields.io/badge/Audio-Winamp_2.9-orange?style=for-the-badge&logo=winamp&logoColor=white)
![Milkdrop](https://img.shields.io/badge/Visualizer-Butterchurn_WebGL-purple?style=for-the-badge)
![Cloudflare](https://img.shields.io/badge/Guestbook-Cloudflare_D1_&_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Turnstile](https://img.shields.io/badge/Security-CF_Turnstile_Bot_Defense-2453FF?style=for-the-badge&logo=cloudflare&logoColor=white)
![Status](https://img.shields.io/badge/Status-Online_&_Active-brightgreen?style=for-the-badge)

<p align="center">
  <b>ZGQ Inc. 的个人复古 Web 桌面主页 —— 融合 Windows 98 像素美学、80s 霓虹合成波 (Synthwave) 与现代边缘计算技术。</b>
</p>

[🌐 在线访问 (Live Demo)](https://zgqinc.gq/) · [📖 个人博客](https://blog.zgqinc.gq/) · [📢 TG 频道](https://t.me/CopyRightZGQInc)

</div>

---

## 🌟 项目亮点与特性 (Key Features)

### 🖥️ 1. 原汁原味的 Windows 98 桌面环境
- **像素级 UI 还原**：基于 `98.css` 与 `1j01/98` 经典像素级资产构建，包含立体凹凸边框、标准标题栏控件、开始菜单横幅、快捷启动栏及系统托盘时钟。
- **现代化窗口管理引擎**：
  - 支持多窗口拖拽定位、层级点击置顶 (`z-index`)、最小化至任务栏、最大化/还原与 `Escape` 键快捷关闭。
  - **原生八方向边缘拉伸控制 (Resize)**：鼠标悬停在窗口边缘即显示相应调节光标，可平滑缩放窗口宽高。
  - **一键智能排版 (📐 Tidy Windows)**：自动将打开的窗口按网格并列层叠排布。
  - **移动端与折叠屏双屏适配**：支持移动端自适应及折叠屏 Dual-Book 双屏书本视图与触控滑动，窗口自适应全屏。

### 💬 2. 全局 Windows 98 复古模态对话框系统 (Win98 Dialog & MessageBox)
- **告别现代浏览器出戏弹窗**：全局深度代理 `window.alert()`、`window.confirm()` 和 `window.prompt()`，统一替换为 1:1 Windows 98 拟真对话框。
- **像素级原生细节**：
  - 继承 `98.css` 原生深蓝活动渐变标题栏与标准 8×7 像素矢量叉号关闭按钮（拒绝字体文字符号替代）。
  - **智能图标与音效联动**：根据消息语义自动匹配 32×32 像素图标与 16×16 标题图标（信息 `info`、确认 `question`、警告 `warning`、错误 `error`），并联动播放微软原版 `DING.WAV` 与 `CHORD.WAV` 音效。
  - **平滑交互与安全边界**：支持鼠标与移动端触摸按住标题栏在可视区域内自由拖动，支持键盘 `Enter` 快捷确认与 `Escape` 取消，移动端视口自适应防溢出。

### 🛡️ 3. 云原生防刷留言板 (Cloudflare Workers + D1 + Turnstile)
- **边缘 Serverless 计算**：后端由 Cloudflare Python Worker (`WorkerEntrypoint`) 驱动，直连边缘分布式 SQLite 数据库 **Cloudflare D1**。
- **Cloudflare Turnstile 智能人机安全验证**：嵌入式无感防 Bot 验证，前端提交时获取 Token 并由 Worker 携带 Secret Key 向 Cloudflare Siteverify 官方接口发起服务端鉴权。
- **企业级安全防御**：
  - **严格 SQL 参数化查询**：彻底杜绝 SQL 注入风险。
  - **XSS 攻击防护**：服务端严格 HTML 实体转义与异常控制字符剔除。
  - **IP 级防灌水频率限制**：单一 IP 15 秒限流机制，避免恶意请求轰炸。

### 🎵 4. 经典 Winamp 播放器与 Milkdrop 3D 律动视觉器
- **Webamp (Winamp 2.9)**：内置 10 首复古合成波（Synthwave / Retrowave）经典曲目，包含双通道波形/频谱仪、10 段专业均衡器与播放列表编辑器。
- **Butterchurn (Milkdrop 2 WebGL)**：纯前端 WebGL 移植的经典 Milkdrop 音乐可视化引擎，内置多样化视觉预设，随着音频实时律动变换光影。

### 📻 5. NewRetroWave (NRW) 专属合成波电台
- 独立于本地音频文件的在线实时广播电台客户端，直接接入 NewRetroWave (NRW) 官方高质量无损流媒体音频源 (`https://backend.nrwmusic.stream/`)，支持实时曲库拉取、在线随机下一首与声量调节。

### 📎 6. 活灵活现的 Clippy 桌面智能助理
- 基于 `clippy.js` 实现的经典微软回形针桌面助理，大幅扩充经典语录库（极客梗、复古彩蛋、趣味互动），具备多种状态动作及闲置待机动画，并针对打开视窗、移动位置与双击操作做出灵敏的气泡反应。

### 👤 7. 全量原样集成的 GitHub 个人主页
严格按照 [@ZGQ-inc](https://github.com/ZGQ-inc) 真实 Profile 结构重构，**不作任何精简**，直接原封不动引用外部原生 Badge 与 Icon：
- **🛠️ 语言和工具**：全量引用 54 项 Devicon 官方矢量图标与 5 项真实开发环境 Shields.io 徽章。
- **💻 个人设备**：完整展示 23 项硬件终端徽章（折叠屏 Fold7、RTX 5070、掌机、VR 头显等）及 PCGameBenchmark 双主机性能评测认证卡。
- **🏠 智能家居**：展示 25 项全套米家、Yeelight 与 Home Assistant 联动设备徽章。
- **🔧 DIY 设备**：以经典 Windows 98 凹凸斑马纹数据表格展示创客工坊的全部 24 项精密仪器与工具清单。
- **⚡ 正在使用**：全量直接引用 142 个 Homarr Dashboard 应用与服务原生图标。

### 📰 8. 频道展示与现场动态博文抓取 (RSS)
- 聚合展示 Telegram 个人发布频道 (`@CopyRightZGQInc`)。
- 博客板块支持**现场实时从 RSS Feed (`https://blog.zgqinc.gq/feed.xml`) 跨域异步拉取最新文章**，并自动更新博文标签与时间戳，配有离线容灾回退缓存机制。

### 📺 9. CRT 复古开机画面与 404 蓝屏死机 (BSOD)
- **4:3 CRT 开机画面**：Canvas 动态模拟 CRT 比例与经典 Windows 98 开机滚动进度条，包含音效联动与一键跳过功能。
- **404 蓝屏极客彩蛋**：1:1 像素级复刻 Windows 98 经典致命异常蓝屏（BSOD），内容优雅居中，按任意键或点击屏幕随时返回桌面。

### 🗑️ 10. 回收站历史档案库
- 完整保留历史旧版网站代码，归档存放于 `/old/` 目录，可随时双击回顾演化历程。

---

## 📁 目录架构 (Repository Structure)

```text
homepage/
├── .github/
│   └── workflows/
│       └── deploy-worker.yml    # GitHub Actions 自动化部署 CF Python Worker & D1
├── assets/
│   ├── audio/                   # 经典 Windows 98 系统音效 (STARTUP, DING, CHORD 等)
│   ├── css/
│   │   ├── 98.css               # 经典 Windows 98 纯 CSS 控件库
│   │   └── desktop-theme.css    # 桌面主题、合成波霓虹样式、模态对话框与自适应布局
│   ├── icons/                   # 1:1 Windows 98 经典像素图标集 (8bpp/16bpp)
│   ├── images/                  # 背景壁纸、开始菜单图、头像与界面材质
│   └── js/
│       ├── butterchurn.min.js   # WebGL 版 Milkdrop 2 视觉器核心库
│       ├── butterchurnPresets.min.js # Milkdrop 视觉预设库
│       ├── clippy-assistant.js  # Clippy 助手扩展语录与动态交互引擎
│       ├── desktop-os.js        # 桌面窗口管理、图标、任务栏与全局事件中枢
│       ├── neon-sunset.js       # 合成波 3D 霓虹夕阳动态壁纸 Canvas 渲染
│       ├── radio-engine.js      # NewRetroWave 在线流媒体广播音频引擎
│       ├── visualizer-app.js    # 律动音频上下文与视觉器桥接
│       ├── webamp.bundle.min.js # Winamp 2.9 Web 播放器核心
│       ├── win98-boot-screen.js # 4:3 CRT 开机进度条动画组件
│       ├── win98-dialog.js      # 全局 Windows 98 模态对话框与消息框代理系统
│       └── win98-scrollbar.js   # 复古滚动条支持
├── worker/
│   ├── src/
│   │   └── entry.py             # Cloudflare Python Worker 留言板后端 API
│   ├── package.json             # Wrangler 开发依赖
│   ├── schema.sql               # Cloudflare D1 SQLite 数据表与索引结构
│   └── wrangler.toml            # Cloudflare Worker & D1 部署配置
├── old/                         # 历史版本网站档案与原始文件
├── 404.html                     # Windows 98 蓝屏死机 (BSOD) 页面
├── index.html                   # 桌面主页面
├── LICENSE                      # MIT 开源许可证
└── README.md                    # 本说明文件
```

---

## 🚀 本地运行与开发 (Quick Start)

本项目前端为纯静态架构，结合 Cloudflare 边缘计算，本地无需编译打包，即可直接启动：

1. **克隆本仓库**：
   ```bash
   git clone https://github.com/ZGQ-inc/homepage.git
   cd homepage
   ```

2. **本地启动静态服务**（可使用任意 HTTP 静态服务器）：
   ```bash
   # 使用 Python 启动本地静态服务器
   python -m http.server 8080

   # 或使用 Node.js 的 serve
   npx serve .
   ```

3. 打开浏览器访问 `http://localhost:8080` 即可畅享完整的 Windows 98 复古桌面体验！

---

## ⚙️ 边缘留言板配置 (Cloudflare D1 & Worker)

### 1. 自动化 CI/CD 部署 (推荐)
本项目内置了 GitHub Actions 工作流 (`.github/workflows/deploy-worker.yml`)。在 GitHub 仓库的 **Settings -> Secrets and variables -> Actions** 中配置以下 Secrets：
- `CF_API_TOKEN`：具备 **Workers Scripts: Edit** 与 **D1: Edit** 权限的 Cloudflare API 令牌。
- `CF_ACCOUNT_ID`：您的 Cloudflare 账户 ID。
- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile 小组件对应的私钥 Secret Key。

当提交代码至 `main` 分支下的 `worker/**` 路径时，工作流将自动执行数据库初始化与 Worker 部署。

### 2. 手动 CLI 部署
若需在本地手动部署：
```bash
cd worker
npm install

# 1. 创建 D1 数据库
npx wrangler d1 create homepage-db

# 2. 执行 Schema 数据库建表与索引
npx wrangler d1 execute homepage-db --file=./schema.sql --remote

# 3. 部署 Worker
npx wrangler deploy

# 4. 配置 Turnstile Secret Key 环境变量
echo "你的_TURNSTILE_SECRET_KEY" | npx wrangler secret put TURNSTILE_SECRET_KEY
```

最后在 `index.html` 中确认 `CF_WORKER_URL` 指向您绑定的 Worker 自定义域名（例如 `https://guestbook.zgqinc.gq`）即可。

---

## 🤝 致敬与鸣谢开源项目 (Open Source Credits)

本项目得以诞生离不开以下优秀的开源项目与社区贡献者的启发：

| 项目名称 | 开发者 / 组织 | 描述 | 开源链接 |
| :--- | :--- | :--- | :--- |
| **98.css** | Jordan Scales (`jdan`) | 忠实复刻 Windows 98 控件的纯 CSS 设计系统 | [GitHub](https://github.com/jdan/98.css) |
| **98.js.org** | Isaiah Odhner (`1j01`) | 基于 Web 的 Windows 98 桌面环境与像素资产 | [GitHub](https://github.com/1j01/98) |
| **Webamp** | Jordan Eldredge (`captbaritone`) | HTML5 & JavaScript 实现的完整 Winamp 2.9 | [GitHub](https://github.com/captbaritone/webamp) |
| **Butterchurn** | Jordan Berg (`jberg`) | Milkdrop 2 WebGL 可视化器 | [GitHub](https://github.com/jberg/butterchurn) |
| **clippy.js** | Smarterer & jsmorse | 浏览器中的微软 Microsoft Agent 助理库 | [GitHub](https://github.com/clippyjs/clippy.js) |
| **Devicon** | Devicon Team | 开发者与编程语言原生矢量图标库 | [GitHub](https://github.com/devicons/devicon) |
| **Dashboard Icons** | Homarr Labs | 高清 Homelab / 服务 Dashboard 图标库 | [GitHub](https://github.com/homarr-labs/dashboard-icons) |
| **Shields.io** | Shields Team | 简洁规范的代码徽章生成服务 | [GitHub](https://github.com/badges/shields) |
| **Cloudflare Turnstile** | Cloudflare | 隐私友好、智能无感的新一代人机验证服务 | [Website](https://www.cloudflare.com/products/turnstile/) |
| **NewRetroWave (NRW)** | NRW Records | 80s 复古合成波官方流媒体电台与曲库 | [Website](https://newretrowave.com/) · [Stream](https://nrwmusic.stream/) |
| **IFmiss/music** | IFmiss | 原站经典 HTML5 音乐播放器组件 | [GitHub](https://github.com/IFmiss/music) |
| **HTML5 UP (Dimension)** | @ajlkn | 原站毛玻璃卡片响应式前端设计主题 | [HTML5 UP](https://html5up.net/dimension) |

---

## 📜 许可证 (License)

本项目遵循 [MIT License](LICENSE) 协议开源。欢迎 Fork、学习与交流！

Copyright (c) 2026 **ZGQ Inc.** ([zgqinc@gmail.com](mailto:zgqinc@gmail.com))
