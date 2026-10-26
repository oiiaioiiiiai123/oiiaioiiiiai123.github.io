# oiiaioiiiiai's HomePage

奶油白、樱花粉与鼠尾草绿的个人网站。Jekyll + Liquid + 原生 CSS/JavaScript + 原始 PNG 与原创像素素材；无数据库、API Key、Node 构建或外部字体依赖。

本地目录名保持 `oiiaioiiiiai.github.io`，未来对应远程 `oiiaioiiiiai123.github.io` 仓库。旁边的 `oiiaioiiiiai/` 对应未来远程 Profile 仓库 `oiiaioiiiiai123`；不要将它们合并，也不要把父目录发布成第三个仓库。

## 立即查看本次已构建的版本

本次已经生成 `_site/`。当前这台 Mac 已有 Python，可在「终端」复制：

```sh
cd "/Users/guoguohui/文件/lly/GitHub开发/oiiaioiiiiai.github.io"
python3 -m http.server 4000 --bind 127.0.0.1 --directory _site
```

浏览器打开 <http://127.0.0.1:4000/>；结束时按 Control + C。这种方式查看的是上一次构建结果，修改 Markdown 后需要重新运行 Jekyll 构建。以后从 GitHub 下载源代码时不会包含 `_site/`，请按下面的方法安装依赖并构建。

## 第一次本地预览（Mac）

Jekyll 源文件不能直接双击 index.html：Liquid 和 Markdown 必须先构建。

1. 打开 Mac 的「终端」应用（可以按 Command + 空格搜索“终端”）。
2. 如果没有 Homebrew，按 [Homebrew 官网](https://brew.sh/) 的说明安装。第一次可能需要安装 Apple 命令行工具；按照终端提示操作。
3. 安装现代 Ruby（Mac 自带 Ruby 2.6 比较旧）。复制下面整段：

```sh
brew install ruby@3.3
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
gem install bundler -v 2.4.22
export PATH="$(ruby -r rubygems -e 'print Gem.bindir'):$PATH"
cd "/Users/guoguohui/文件/lly/GitHub开发/oiiaioiiiiai.github.io"
bundle _2.4.22_ config set --local path vendor/bundle
bundle _2.4.22_ install
bundle _2.4.22_ exec jekyll serve --livereload --host 127.0.0.1
```

看到 Server address 后，在浏览器打开 <http://127.0.0.1:4000/>。保持终端窗口打开。退出预览按 Control + C。下次打开新的终端，只需：

```sh
export PATH="$(brew --prefix ruby@3.3)/bin:$PATH"
export PATH="$(ruby -r rubygems -e 'print Gem.bindir'):$PATH"
cd "/Users/guoguohui/文件/lly/GitHub开发/oiiaioiiiiai.github.io"
bundle _2.4.22_ exec jekyll serve --livereload --host 127.0.0.1
```

如果出现端口被占用，在末尾添加 `--port 4001`，然后打开 <http://127.0.0.1:4001/>。更改 `_config.yml` 后需要停止并重新启动服务。若以后移动整个工作空间，修改上述 cd 路径即可。

## 目录地图

| 位置 | 用途 |
| --- | --- |
| `_config.yml`、`Gemfile`、`Gemfile.lock` | 网站配置与锁定的构建依赖 |
| `_layouts/` | 默认页、分类、项目、长文章模板 |
| `_includes/` | 导航、卡片、图标、页脚、小猪共用组件 |
| `_projects/` | 每个项目的唯一内容文件 |
| `_posts/` | 正式文章，目前为空 |
| `_data/categories.yml` | 四个分类，不重复存项目内容 |
| `pages/` | 四分类、项目入口、文章合集、Pig's Room |
| `assets/css/`、`assets/js/` | 公用、小猪、文章的样式和交互 |
| `assets/images/pig/`、`assets/images/carrot/` | 用户原始小猪 PNG 和原创像素胡萝卜 |
| `assets/images/projects/<slug>/` | 项目封面、后续截图 |
| `assets/images/writing/<slug>/` | 文章照片和自己的插画 |
| `templates/` | 不会发布的文章及项目模板 |
| `scripts/check-site.py` | 生成页面的本地链接与资源检查 |
| `_site/`、`vendor/` | 构建产物、本地依赖，已忽略 |

## 更新作品

所有文件路径都以本仓库为起点。修改 Markdown，构建时分类页和详情页会同步更新，不需要手工编辑列表。

| 想做什么 | 具体文件 / 操作 |
| --- | --- |
| 新增 App | 复制 `templates/project.md` 为 `_projects/my-app.md`，category 填 `app` |
| 新增 Website | 复制为 `_projects/my-website.md`，category 填 `website` |
| 新增 Game | 复制为 `_projects/my-game.md`，category 填 `games` |
| 其他创意作品 | 复制为 `_projects/my-idea.md`，category 填 `more` |
| 修改 eggplant | 编辑 `_projects/eggplant.md` 的资料和正文 |
| 修改地铁测试 | 编辑 `_projects/shanghai-metro-test.md` |
| 更改状态 | 在对应文件修改 `status: In Development` / `Coming Soon` / `Released` |
| 添加源码 | 填 `github_url: 真实存在的仓库 URL（未创建时留空）` |
| 添加网页体验 | 网站项目填 `live_url: https://真实网址` |
| 添加 APK | App 填真实的 `download_url`；不将 App 伪装成浏览器应用 |

例如给 eggplant 加截图：

1. 将图片放到 `assets/images/projects/eggplant/reading-screen.png`。
2. 将 `_projects/eggplant.md` 中的 `screenshots: []` 替换为：

```yaml
screenshots:
  - src: /assets/images/projects/eggplant/reading-screen.png
    alt: 阅读页面的实际截图
    caption: 阅读界面
```

要更改封面，更新同一文件的 `cover`、`cover_alt`、`cover_caption`。封面来源以项目的 cover_caption 为准：eggplant 已使用真实图标和实际界面合成封面；地铁项目仍是标明来源的概念图，不是完成界面。没有真实 URL 时字段留空，页面不显示无效按钮。新项目文件名会生成稳定 URL，例如 `_projects/my-app.md` → `/projects/my-app/`；发布后尽量不要改文件名。

## 写新文章

1. 复制 `templates/post.md` 到 `_posts/2026-10-19-a-small-day.md`。日期改成实际发表日期；文件名后半段使用英文小写和短横线。
2. 填 `title`、`date`，可选 `description`、`cover`、`cover_alt`、`tags`。日期示例：`2026-10-19 12:00:00 +0800`。未来日期在到时之前不会正式显示（需要重新构建）。
3. 第二个 `---` 后写正文。`##` 为二级标题，`###` 为三级标题。有至少两个二/三级标题时自动出现目录；设 `toc: false` 可关闭。
4. 把照片放到 `assets/images/writing/a-small-day/photo.jpg`，自己的插画放到同目录 `drawing.png`。真实 Markdown 引用如下（反引号和代码围栏不用复制）：

```liquid
![窗边的下午]({{ '/assets/images/writing/a-small-day/photo.jpg' | relative_url }})
![我的原创插画]({{ '/assets/images/writing/a-small-day/drawing.png' | relative_url }})
```

5. `bundle exec jekyll serve --livereload` 本地预览，打开 `/writing/` 看列表，再进入文章。合集自动按日期倒序，正文支持引用、链接、列表、强调、自适应图片、代码和轻量阅读进度。
6. 本地满意后再自行提交并推送网站仓库；GitHub Pages 构建成功后文章才在公开网站出现。具体发布操作见工作空间 `../docs/publishing.md`。

不要把模板当正式文章；不要将测试文章提交到 `_posts/`。用 Markdown 编辑器保存为 UTF-8 的纯文本 `.md`，避免误存成 `.md.txt`。

## 小猪

- Pig's Room 的听诊器按钮在普通猪和医生猪间切换，支持 Enter/空格。医生猪使用用户提供的原始透明 PNG，真正局部眨眼、笑眼、小微笑与闭眼睡眠；45 秒休眠与五次抚摸彩蛋、投喂计数沿用同一状态机，切换时保留计数。
- 首页和房间复用四瓣小花组件；四朵轻缓错时漂浮，纯装饰，不拦截点击。

- 单击或键盘聚焦后按 Enter/空格抚摸；原始图片轻跳；真实眼睛变为笑眼，鼻子下方出现小微笑，随后恢复原图。
- 点击胡萝卜即可投喂，桌面和手机也可拖到鼻子下方的嘴边；拖到其他位置不会增加数量。
- 胡萝卜数量存在 sessionStorage，跨网站页面保留；关闭这次浏览会话后重新开始。浏览器禁用存储时仍可互动。
- 45 秒无小猪互动后真正闭眼睡着，点击睁眼唤醒；Idle 随机自然眨眼。
- 4 秒内连续抚摸五次，触发外部爱心彩蛋；不会给原图增加花冠或其他角色细节。
- 动画遵循 prefers-reduced-motion。长文章不加载小猪代码。
- 最新原始 PNG 逐字节保存为 `assets/images/pig/pig-original.png`（1216×1181 RGBA），保留透明背景和原始边缘，网页以 contain 按比例缩小显示。Canvas 只局部修复眼睛并画表情、小嘴；身体和粉色花纹不变。不改原图、不抠图、不加白底。投喂依次张嘴、三次轻嚼、满足微笑。素材说明见 `assets/images/pig/README.md`。
- 计数不上传服务器，没有账号、排行或复杂养成系统。

## 构建检查

```sh
cd "/Users/guoguohui/文件/lly/GitHub开发/oiiaioiiiiai.github.io"
bundle exec jekyll build --strict_front_matter
python3 scripts/check-site.py
```

额外的子路径测试（测试输出放在临时目录，不改正式配置）：

```sh
bundle exec jekyll build --baseurl /preview --destination /private/tmp/oiia-subpath-site
python3 scripts/check-site.py /private/tmp/oiia-subpath-site --baseurl /preview
```

发布使用 GitHub Pages 的 `main` 分支根目录，无需 Actions、`.nojekyll` 或 `_site` 提交。`_config.yml` 中的项目 Collection 已设置 `output: true` 和稳定 permalink。参考 [Jekyll Collections](https://jekyllrb.com/docs/collections/) 与 [GitHub Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。


## 单独打开本仓库时如何发布

此仓库可以独立维护，不依赖父目录文档才能构建。需要发布时，在 GitHub Desktop 中为当前目录创建本地 Git 仓库，检查并提交源码，然后发布为 `oiiaioiiiiai123.github.io`（本地文件夹不必改名）；不要把 `_site/` 或 `vendor/` 加入提交。若 GitHub 上已有同名仓库，先获取并整合已有内容。

在该仓库的 Settings → Pages → Build and deployment 中选择 **Deploy from a branch**，分支 **main**、目录 **/(root)**，保存并等待 GitHub 完成构建。具体依据见 [GitHub 官方发布来源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。本次没有执行这些远程操作。

维护依赖时保留 Jekyll 3.10 和 `kramdown-parser-gfm`；后者是 GFM Markdown 解析所必需的依赖。`Gemfile.lock` 已包含通用 Ruby、Mac 与 Linux 平台。

实际 GitHub 个人资料：[oiiaioiiiiai123](https://github.com/oiiaioiiiiai123)。未来 Pages 地址为 https://oiiaioiiiiai123.github.io/，尚未发布。网站显示标题保持 `oiiaioiiiiai's HomePage`，与 GitHub 用户名不同。

## eggplant 第一版展示与通用画廊

eggplant 当前实际 versionName 为 1.0、versionCode 为 1；App → eggplant 沿用 `_projects/eggplant.md` 单一资料来源。图标来自 Android 正式资源，5 张完整截图来自工程已有的真实模拟器记录。Android 内部标签拼写 Egglpant 未修改，网站对外名称为 eggplant。

项目可选字段：icon/icon_alt、platform/minimum_os、version/version_code、features（title/description 数组）、screenshots（src/alt/caption/width/height 数组）、social_image/social_image_alt、github_url/live_url/release_url/download_url。空链接不显示按钮；未完成项目显示截图空状态。通用 `_includes/screenshot-gallery.html` 支持横向滑动、放大、左右键、Escape、焦点循环和无 JavaScript 的图片链接回退。

分享标签由 `_includes/social-meta.html` 输出；未安装 jekyll-seo-tag，因此没有重复输出。默认分享图为 `assets/images/social/home.png`，eggplant 独立图为 `assets/images/projects/eggplant/share.png`；均为 1200×630 PNG。图片生成工具为 `scripts/render-preview-images.cjs`，开发时需要 Playwright + Chrome，正式 Jekyll 构建不依赖 Node。生成完成的图片应随源码提交。

404 复用 `pig.html` 的 sleeping 模式和原始 PNG/局部闭眼层，无投喂或额外互动。最终输出为根目录 404.html；GitHub Pages 负责不存在路径的回退。普通 Python 静态服务器不模拟自定义 404；可直接查看 /404.html，部署后的真实回退另行检查。

新增浏览器检查工具 `scripts/check-showcase.cjs`，环境变量 PLAYWRIGHT_MODULE、CHROME_PATH、SHOWCASE_QA_URL、SHOWCASE_QA_OUT 可指定本地工具和截图输出；默认输出到已忽略的 test-results/showcase。验收截图不进入正式素材。

当前只有 debug APK，没有 release APK 或可用的项目仓库/下载 URL，所以网页未显示下载按钮。未来填写真实 release_url 可链接 Release 页面，填写真实 download_url 可下载 APK；Android 下载会注明不适用于 iPhone/iPad。不要将 APK 放在本网站目录。

完整的本地审计与验收、发布步骤在工作空间 `../docs/eggplant-showcase.md` 与 `../docs/eggplant-publishing.md`。本次没有创建 GitHub 仓库、Release、tag、push 或部署。

## 排版与医生猪验收

全站沿用原字体，辅助标签 13px、说明/页脚 15px、导航/正文/主要链接 16px、阅读正文 17px，统一 rem 变量。大标题保持原有层级。

新增验收脚本 `scripts/check-typography-doctor.cjs`：运行前需要网站预览服务及隔离的临时文章预览（不把测试文章放入正式 `_posts`）。设置 `PLAYWRIGHT_MODULE`、`CHROME_PATH`、`VISUAL_QA_URL`、`ARTICLE_QA_URL` 和 `VISUAL_QA_OUT` 后运行。七种视口、深色/减少动态、真实 Chrome 200% 缩放及医生局部像素/互动均在同一脚本检查；具体本机环境、截图和结果见工作空间 `../docs/typography-doctor.md`。
