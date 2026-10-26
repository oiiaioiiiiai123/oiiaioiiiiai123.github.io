# 网站仓库开发约定

这是 `oiiaioiiiiai.github.io` 独立仓库；父目录只是本地工作空间。不得将 Profile 文件移入这里。未经用户授权不得 push、远程发布或改线上配置。

- 技术栈：GitHub Pages 原生 Jekyll 3.10、Liquid、Markdown、原生 CSS/JS、SVG。不要引入复杂 Node 构建或第三方服务。
- `_projects/<slug>.md` 为项目唯一内容来源。分类允许 app / website / games / more，定义见 `_data/categories.yml`。`output: true` 与 `/projects/:name/` permalink 必须保留。
- 新项目复制 `templates/project.md`；真实链接准备好才填 github_url/live_url/download_url。截图放 `assets/images/projects/<slug>/`，在 screenshots 中添加 src/alt/caption。不可伪造已完成功能。
- 新随笔复制 `templates/post.md` 到 `_posts/YYYY-MM-DD-slug.md`，修改日期、标题和正文。文章图片放 `assets/images/writing/<slug>/`。示例及测试文章不得成为正式内容。
- CSS 集中于 assets/css；main.css 为公用样式，reading.css 仅文章，pig.css 仅小猪。JS 同理，不要创建重复实现。
- 普通小猪必须直接使用 assets/images/pig/pig-original.png（最新用户原图，1216×1181 RGBA 透明背景，按原始宽高比缩小显示）。原始文件不可覆盖；身体、耳朵、鼻子、四肢、尾巴与粉色花纹不可修改。按用户最新授权，仅允许在真实眼睛与鼻子下方的小嘴区域使用 Canvas 局部修复与绘制表情；闭眼须先遮去原黑眼，不得出现双眼。Idle 必须恢复原图。整图和表情层共用坐标与动画；旧 SVG 在 archive/ 中不再加载。胡萝卜仍在 assets/images/carrot，不得复制 Minecraft 官方纹理。
- 医生猪仅在 Pig's Room 通过听诊器启用，主体必须使用 assets/images/pig/doctor/doctor-original.png 用户原图。doctor-closed-reference.png 仅作闭眼参考，不以整帧换图改变服装或手持物。两个角色复用 pig.js 的角色配置与状态机；医生眼镜、服装、光环和身体不可改动，局部眼睛/嘴允许按用户授权修复和动画，idle 清空表情层。
- 排版复用 main.css 的 rem 字号变量；保留原字体和大标题，不恢复分类副标题。新小花使用 four-petal-flower.html：恰好四片圆花瓣、aria-hidden、pointer-events:none，须避开角色和控制区域，支持减少动态效果。
- 首页四卡片只能是分类；Writing 独立。If I Could Draw Life 拼写不可更改。标题保留 oiiaioiiiiai's HomePage；介绍不得夹小猪 Emoji；身份为上海交通大学医学院 2025 级学生。所有页面结束语 happy everyday。
- 不引入假链接、虚构姓名、奖项、经历、医学内容、账号、排行榜或评论系统。阅读页不加载小猪。
- 资源和站内导航均使用 relative_url；项目/文章链接使用 Jekyll 输出 URL。所有链接需支持直接访问和刷新。
- 编辑现有文件优先；先确认用途，不擅自覆盖、删除现有用户内容，不复制全项目，不创建 final2 等无意义版本。
- 维护键盘访问、移动端、深色、prefers-reduced-motion、无存储权限降级。不再把小猪图片 fetch 后转换成 SVG；图片加载失败时应保留原图路径供排查，不生成替代角色。
- 验证：bundle exec jekyll build --strict_front_matter；运行 scripts/check-site.py 检查输出；实测点击/拖动/触摸投喂、休眠唤醒、连续五次抚摸彩蛋。临时长文仅在隔离测试源运行，不发布。
- _site、vendor、缓存、.bundle、临时日志和测试截图由 .gitignore 忽略；Gemfile.lock 应跟踪。不得在父目录初始化 Git。

- 实际 GitHub 账号 `oiiaioiiiiai123`；未来 Profile/Pages 仓库分别为 `oiiaioiiiiai123`、`oiiaioiiiiai123.github.io`，本地目录名称暂不改变。`_config.yml` 中 github_url 为个人链接唯一来源，url 指向未来 Pages 域名，未发布前不可声称在线。

- eggplant 展示资料来自当前 Android 工程，不擅自修改 Android 的 UI、包名、版本、图标或签名；项目资料仍仅在 _projects/eggplant.md。截图与 icon 必须来自真实资源；链接未实际准备好时保持空值。
- 项目画廊复用 screenshot-gallery.html 与 project.css/project.js；保留原始截图比例、无脚本回退、移动滑动、键盘和焦点返回。features、version、platform、release_url 等为可选 front matter，不创建 projects.yml。
- 社交标签统一由 social-meta.html 输出，不叠加另一套 SEO 标签；分享图从原图与真实素材合成。原始小猪 PNG 不可改动，404 复用静态 sleeping 模式，不添加养成逻辑。