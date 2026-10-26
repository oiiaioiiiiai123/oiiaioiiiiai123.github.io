# eggplant 展示素材

- `app-icon.webp`：逐字节复制 Android 工程 `app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp`，192×192。使用已有紫色书本、茄子和绿色星星图标，没有生成新图标。
- `home.webp`：来自 `docs/vivo-fixes/home-emulator.png`。
- `book-reader.webp`：来自 `docs/screenshots/offline-after-restart.png`，真实离线重启验收中的 Gutenberg 阅读器。
- `news.webp`：来自 `docs/vivo-fixes/news-online-emulator.png`。
- `reading.webp`：来自 `docs/vivo-fixes/news-reader-scrolled-emulator.png`。
- `dark-reading.webp`：来自 `docs/vivo-fixes/news-reader-dark-emulator.png`。

截图都是原 Android 工程已有的实际模拟器截图，原图仍保留在 Android 工程中。正式网站版本为完整 1080×2400 WebP、quality 91，没有修改应用 UI、编造学习数据、重绘手机界面或裁切状态栏/正文。来源文件哈希、输出大小和路径记录在工作空间 `docs/eggplant-assets.json`，没有复制 Android 源码到网站。

`cover.png`（1200×750）和 `share.png`（1200×630）是将真实图标和真实界面排版合成的封面，不是假手机 Mockup。开发脚本 `scripts/render-preview-images.cjs` 从 `_projects/eggplant.md` 读取名称/介绍/版本/状态，从站点配置读取显示标题和域名；仅生成图片，不改应用源文件。

早期 `cover.svg` 是之前的概念图，保留原文件但正式项目已不再引用它。网页 QA 截图在工作空间 `docs/eggplant-preview/`，不混入本目录。

没有 APK、私钥、签名密码或 Token 存放在这里。
