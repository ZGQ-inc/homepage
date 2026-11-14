# 🌆 Windows 98 Synthwave Retro Desktop (ZGQ Inc. Homepage)

<div align="center">

![Windows 98 SE](https://img.shields.io/badge/Windows-98_SE_Retro-008080?style=for-the-badge&logo=windows-95&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Webamp](https://img.shields.io/badge/Audio-Winamp_2.9-orange?style=for-the-badge&logo=winamp&logoColor=white)
![Milkdrop](https://img.shields.io/badge/Visualizer-Butterchurn_WebGL-purple?style=for-the-badge)
![Cloudflare](https://img.shields.io/badge/Guestbook-Cloudflare_D1_&_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Status](https://img.shields.io/badge/Status-Online_&_Active-brightgreen?style=for-the-badge)

<p align="center">
  <b>ZGQ Inc. 的个人复古 Web 桌面主页 —— 融合 Windows 98 像素美学、80s 霓虹合成波 (Synthwave) 与现代边缘计算技术。</b>
</p>

[🌐 在线访问 (Live Demo)](https://zgqinc.gq/) · [📖 个人博客](https://blog.zgqinc.gq/) · [📢 TG 频道](https://t.me/CopyRightZGQInc)

</div>

---

## 🌟 项目亮点与特性 (Key Features)

### 🖥️ 1. 原汁原味的 Windows 98 桌面环境
- **像素级 UI 还原**：基于 `98.css` 与 `1j01/98` 经典像素级资产构建，包含立体凹凸边框、标题栏控制按钮、开始菜单横幅、快捷启动栏及系统托盘时钟。
- **现代化窗口管理引擎**：
  - 支持多窗口拖拽定位、层级点击置顶 (z-index)、最小化至任务栏、最大化/还原与 Escape 键快捷关闭。
  - **原生八方向边缘拉伸控制 (Resize)**：鼠标悬停在窗口边缘即显示相应调节光标，可平滑缩放窗口宽高。
  - **一键智能排版 (📐 Tidy Windows)**：自动将打开的窗口按网格并列层叠排布。
  - **移动端与折叠屏双屏适配**：支持折叠屏 Dual-Book 双屏书本视图与触控滑动，窗口自适应全屏。

### 🎵 2. 经典 Winamp 播放器与 Milkdrop 3D 律动视觉器
- **Webamp (Winamp 2.9)**：内置 10 首复古合成波（Synthwave / Retrowave）经典曲目，包含双通道波形/频谱仪、10 段专业均衡器与播放列表编辑器。
- **Butterchurn (Milkdrop 2 WebGL)**：纯前端 WebGL 移植的经典 Milkdrop 音乐可视化引擎，内置多样化视觉预设，随着音频实时律动变换光影。

### 📻 3. NewRetroWave (NRW) 专属合成波电台
- 独立于本地音频文件的在线实时广播电台客户端，直接接入 NewRetroWave (NRW) 官方高质量无损流媒体音频源 (`https://backend.nrwmusic.stream/`)，支持实时曲库拉取、在线随机下一首与声量调节。

### 👤 4. 全量原样集成的 GitHub 个人主页
严格按照 [@ZGQ-inc](https://github.com/ZGQ-inc) 真实 Profile 结构重构，**不作任何精简**，直接原封不动引用外部原生 Badge 与 Icon：
- **🛠️ 语言和工具**：全量引用 54 项 Devicon 官方矢量图标与 5 项真实开发环境 Shields.io 徽章。
- **💻 个人设备**：完整展示 23 项硬件终端徽章（折叠屏 Fold7、RTX 5070、掌机、VR 头显等）及 PCGameBenchmark 双主机性能评测认证卡。
- **🏠 智能家居**：展示 25 项全套米家、Yeelight 与 Home Assistant 联动设备徽章。
- **🔧 DIY 设备**：以经典 Windows 98 凹凸斑马纹数据表格展示创客工坊的全部 24 项精密仪器与工具清单。
- **⚡ 正在使用**：全量直接引用 142 个 Homarr Dashboard 应用与服务原生图标。

### 📰 5. 频道展示与现场动态博文抓取 (RSS)
- 聚合展示 Telegram 个人发布频道 (`@CopyRightZGQInc`)。
- 博客板块支持**现场实时从 RSS Feed (`https://blog.zgqinc.gq/feed.xml`) 跨域异步拉取最新文章**，并自动更新博文标签与时间戳，配有离线容灾回退缓存机制。

### 💬 6. 云原生留言板 (Cloudflare Workers + D1)
- 采用 Cloudflare D1 边缘无服务器 SQLite 数据库与 Python Worker 架构构建留言板后端。
- 内置严格的 XSS 攻击清洗与 SQL 参数化查询防注入防护机制。

### 📎 7. 活灵活现的 Clippy 桌面智能助理
- 基于 `clippy.js` 实现的经典微软回形针桌面助理，支持待机随机动作、对不同窗口打开事件作出动态气泡反应、支持拖拽互动。

### 🗑️ 8. 回收站历史档案库
- 完整保留历史旧版网站代码，归档存放于 `/old/` 目录，可随时双击回顾演化历程。

---

## 📁 目录架构 (Repository Structure)

```text
homepage/
├── assets/
│   ├── css/
│   │   ├── 98.css               # 经典 Windows 98 样式库
│   │   └── desktop-theme.css    # 桌面主题、合成波霓虹样式与自适应布局
│   ├── icons/                   # 1:1 Windows 98 经典像素图标集
│   ├── images/                  # 背景图、开始菜单图、头像与界面材质
│   └── js/
│       ├── clippy-assistant.js  # 活泼的 Clippy 助理交互逻辑
│       └── main.js              # 桌面状态、音频控制与窗口系统核心驱动
├── cloudflare/
│   ├── schema.sql               # Cloudflare D1 数据库初始化表结构
│   └── worker.py                # Cloudflare Python Edge Worker 留言板后端 API
├── old/                         # 历史版本网站档案与原始文件
├── 404.html                     # Windows 98 蓝屏死机 (BSOD) 与系统错误弹窗 404 页面
├── index.html                   # 桌面主页面
├── LICENSE                      # MIT 开源许可证
└── README.md                    # 本说明文件
```

---

## 🚀 本地运行与开发 (Quick Start)

本项目为纯静态前端项目（结合 Cloudflare 边缘计算），无需复杂的打包编译流程：

1. **克隆本仓库**：
   ```bash
   git clone https://github.com/ZGQ-inc/homepage.git
   cd homepage
   ```

2. **本地启动预览**（可使用任意静态服务器）：
   ```bash
   # 使用 Python 启动本地服务
   python -m http.server 8080

   # 或使用 Node.js 的 serve
   npx serve .
   ```

3. 打开浏览器访问 `http://localhost:8080` 即可畅享复古 Windows 98 体验！

---

## ⚙️ 边缘留言板配置 (Cloudflare D1 Setup)

若需接入您自己的 Cloudflare D1 留言板服务：
1. 在 Cloudflare 控制台创建 D1 数据库：
   ```bash
   wrangler d1 create guestbook-db
   wrangler d1 execute guestbook-db --file=cloudflare/schema.sql
   ```
2. 部署 `cloudflare/worker.py` 至您的 Cloudflare Workers 服务。
3. 在 `index.html` 中配置 Worker 请求端点即可实现自动通信。

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
| **NewRetroWave (NRW)** | NRW Records | 80s 复古合成波官方流媒体电台与曲库 | [Website](https://newretrowave.com/) · [Stream](https://nrwmusic.stream/) |
| **IFmiss/music** | IFmiss | 原站经典 HTML5 音乐播放器组件 | [GitHub](https://github.com/IFmiss/music) |
| **HTML5 UP (Dimension)** | @ajlkn | 原站毛玻璃卡片响应式前端设计主题 | [HTML5 UP](https://html5up.net/dimension) |

---

## 📜 许可证 (License)

本项目遵循 [MIT License](LICENSE) 协议开源。欢迎 Fork、学习与交流！

Copyright (c) 2026 **ZGQ Inc.** ([zgqinc@gmail.com](mailto:zgqinc@gmail.com))
