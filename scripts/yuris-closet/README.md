# yuri的衣橱发布源

公开试玩：https://oiiaioiiiiai123.github.io/yuris-closet/

本项目沿用个人主页仓库的 GitHub Pages 原生 Jekyll 发布。只打包已存在的精修 PNG，不运行美术生成器。

源码分布：
- `scripts/yuris-closet/index.html`：游戏 HTML 源模板。
- `assets/css/yuris-closet.css`：游戏样式。
- `assets/js/yuris-closet/app.js`、`rig.js`：交互、合成和锚点。
- `assets/images/projects/yuris-closet/layers/`：147 个当前透明像素图层。
- `scripts/yuris-closet/artwork/`：可继续编辑的路径记录与整理后的面部像素。
- `yuris-closet/index.html`：发布用完整内嵌页面；`release.json` 为校验清单。
- `_projects/yuris-closet.md`：Games 卡片与项目详情的唯一内容源。

在网站仓库根目录运行：

```sh
python3 scripts/publish-yuris-closet.py
python3 scripts/publish-yuris-closet.py --check
bundle exec jekyll build --strict_front_matter
python3 scripts/check-site.py
```

修改上述仓库中的源码／PNG 后，运行这些命令，检查差异，提交对应文件并推送本仓库 `main`。GitHub Pages 会自动重建整个主页，游戏不会替代首页。

若仍在原本地「yuri的衣橱」中编辑，用 `python3 scripts/publish-yuris-closet.py --source "游戏目录的实际路径"` 同步明确清单并打包；无需手工搬运文件。该命令核对嵌入素材与 PNG 一致，拒绝符号链接，不复制原始 ZIP、参考图、开发日志、私人文件或测试数据。

卡片封面来自修复后发后的真实游戏画布。重新编辑美术时应重新提供实际画布封面。当前发布保留 05.0 的连续颈后发片，不重绘人物。

浏览器收藏仅保存在本机 localStorage；自定义导入和 PNG 导出在浏览器完成，无后台服务或数据收集。原本地离线版与 ZIP 保留不动。

非官方、非商业 Limbus Company 粉丝换装作品。角色、相关参考及各素材的权利属于各自权利人；本目录没有将第三方内容声明为原创或统一授予开源许可。第三方原始参考图未上传。
