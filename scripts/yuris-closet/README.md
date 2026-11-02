# yuri的衣橱 · 08.0 绘稿姿势版发布源

试玩：https://oiiaioiiiiai123.github.io/yuris-closet/

沿用此个人主页仓库的 GitHub Pages 原生 Jekyll。游戏页面自包含，现有主页、分类和其他项目不变。

- `scripts/yuris-closet/index.html`：HTML 源模板。
- `assets/css/yuris-closet.css`：样式。
- `assets/js/yuris-closet/`：app.js、rig.js、pose-engine.js 和生成的 assets.js。
- `scripts/yuris-closet/runtime.json`、`poses.json`：原生裁切坐标、身体区域所有权和姿势兼容配置。
- `assets/images/projects/yuris-closet/layers/`：运行清单明确列出的 107 个 PNG；历史文件不自动打包。
- `yuris-closet/index.html`：实际发布页面，`release.json` 记录输入及页面 SHA-256。
- `_projects/yuris-closet.md`：Games 项目入口唯一内容源，cover.png 来自真实游戏画布。

采用先前生成并恢复的 Yuri 原稿，统一 1024×1536；上衣、鞋腿与完整套装可以拥有不同绘制姿势。卫衣插兜、白外套扶领、制服持剑和交错裙腿使用绘稿，运行时不旋转拉伸人体。冲突时选择同款兼容手势。脸、刘海及多数发型、下装与配件继续沿用原批素材。此目录不包含第三方原始参考图、开发日志或私人工作文件。

在原本地项目完成绘稿／代码编辑、构建及实际浏览器验收后，于网站仓库运行：

```sh
python3 scripts/publish-yuris-closet.py --source "../yuri's closet/yuri的衣橱"
python3 scripts/publish-yuris-closet.py --check
bundle exec jekyll build --strict_front_matter
python3 scripts/check-site.py
```

发布器只同步明确运行文件和封面，验证源码、PNG 与本地最终网页验收的哈希一致，不运行美术生成器。只提交游戏相关文件，然后正常推送 `origin/main`；Pages 自动重建完整站点。不要提交 `_site` 或修改 DNS／发布平台。

如直接修改仓库中的代码，可运行不带 `--source` 的发布命令重新打包。编辑 PNG 时同步 runtime.json 的尺寸、原点与 SHA-256；姿势配置同时更新 poses.json 与 runtime.json.poseSystem。推荐在原项目保留的分层绘稿中编辑，再通过上述同步命令更新，避免两份源码分叉。

浏览器本地收藏、随机、导入、透明 PNG 和角色卡导出均保留。没有账号、服务器或数据收集。非官方、非商业 Limbus Company 粉丝作品；相关权利属于各自权利人，不声明原角色或全部素材原创，不另授第三方内容开源许可。
