# Aripple_star · 长梦轨道

个人介绍站的新版。单页、8 个章节、多文件静态站，亮色纸本主题，中英双语，默认英文，无框架、无构建步骤、无外部请求。

## 本地预览

```bash
cd "/storage/emulated/0/我的文件/aripple-star-v2"
python3 -m http.server 8000
```

打开 `http://127.0.0.1:8000/`。

静态预览（关动效、方便截图）：`http://127.0.0.1:8000/?static=1`

默认打开英文；点左上角纸片「中文 / EN」切换。中文直达：`http://127.0.0.1:8000/?lang=zh`。选择会记在 localStorage；`?static=1&lang=en` 可直接截英文静态图。

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 结构、文案、语义 |
| `styles.css` | 全部样式、亮色纸本相位、响应式、中英排版 |
| `script.js` | 首屏轨道、诗云星图、滚动渐入、打字机、中英切换、动效开关 |
| `assets/avatar.webp` | 头像（来自 B 站公开头像） |
| `assets/bg-ridge-light.webp` | Unsplash 山脊天光，亮色印相；首屏底图 |
| `assets/bg-land-light.webp` | Unsplash 山谷云层，亮色印相；关于底图 |
| `assets/bg-dawn-light.webp` | Unsplash 云海晨光，亮色印相；两句话底图 |
| `assets/bg-cosmos-light.webp` | NASA/ESA 哈勃极深场反相成纸上墨点；诗云底图 |
| `assets/bg-paper.webp` | 头像笔记本页的模糊纸纹，联系页底图 |
| `assets/bg-*.webp`（无 `-light`） | 上一版暗色主题的底图，页面不再引用 |
| `assets/fonts/gloock-latin.woff2` | Gloock 拉丁字面，本地加载 |
| `assets/fonts/OFL-Gloock.txt` | Gloock 的 SIL OFL 1.1 许可证 |
| `assets/PROVENANCE.md` | 头像、底图与分享图的来源、处理方式、日期 |
| `share.jpg` | 社交分享图（1200×630） |
| `PRODUCT.md` | 产品事实与约束 |
| `DESIGN.md` | 构建后的设计系统记录 |
| `.impeccable/` | impeccable 的方向契约、审阅截图与工作记录 |
| `_preview.html` | 仅用于本地截图验收的 iframe 预览页，部署前可删 |

## 更新 B 站数字

数据截至 **2026.11**：19 投稿 / 76 粉丝。需要改这三处，保持三处一致：

1. 首屏左下角 `.readout`
2. “一些数字”章节 `.readouts`
3. “找到我”的 Bilibili 行 `contact__value small`

另外更新 `.numbers__note` 与页脚里的“截至 2026.11”。

## 部署

把 `index.html`、`styles.css`、`script.js`、`assets/`、`share.jpg` 上传到仓库根目录即可。原仓库的旧版单文件 `index.html` 建议先备份；`_preview.html`、`.impeccable/`、`.taste-skill/` 不需要部署。

`og:image` 已写成 `https://hajcklll.github.io/Instructions-/share.jpg`；换域名时记得一起改。

## 说明

- 所有资源本地；没有 CDN、统计脚本或第三方请求，断网能看。
- 主题是亮色纸本：底色在冷调晨纸、暖调晨光、正午纸色之间轻微过渡，铜色只做信号。
- 动效尊重 `prefers-reduced-motion`；桌面右下、手机/平板右上可以随时暂停。
- 首屏定位语有一次性的打字机效果；关动效、减少动态或没有 JS 时直接显示全句。
- 左上角有醒目的纸片「中文 / EN」切换：所有正文、章节标题、诗云引文和面板、页脚、document title 都会换；英文标题和引文回到 Gloock 排版，首屏定位语允许换行。
- 默认英文；首次进入会先按英文排版再显示内容，避免中文闪一下。
- 语言选择存 localStorage；`?lang=en` 或 `?lang=zh` 可以直接指定。
- 章节标题进入视口时逐字打出；正文和版块以 26px 上浮、4px 虚化渐入，只播一次；数字章节会从 0 数到 19/76/1。静态预览、减少动态或关动效时全部直接显示。
- “书单”章节列出 5 本刘慈欣作品和一句内容提示，中英各一套；只是阅读建议，不是必读顺序。
- 诗云章节在无 JS 时会显示完整引文列表。
- 风景摄影来自 Unsplash（山脊天光、山谷、云海晨光），诗云用 NASA/ESA 哈勃极深场反相成纸上墨点；全部本地调色压缩，署名在页脚和 `assets/PROVENANCE.md`。
- 诗云面板逐字显示引文（中英各一套），列表支持左右方向键；桌面左侧站点轨会高亮当前章节，章节标题悬停会画一条铜线。
- `styles.css` / `script.js` 带 `?v=20261114b` 缓存版本；以后改样式或脚本，记得改这个版本号，外部浏览器才会拿到新文件。
- Gloock 字体按 SIL OFL 1.1 使用，许可证随字体放在 `assets/fonts/`。
