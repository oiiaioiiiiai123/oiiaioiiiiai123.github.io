---
title: "文章标题"
date: 2026-10-19 12:00:00 +0800
description: "可选的一句话摘要。"
cover:
cover_alt:
tags: []
toc: true
---

在这里开始写正文。复制本模板到 `_posts/YYYY-MM-DD-slug.md` 后，修改日期和标题；模板本身不会被发布。

## 一个小标题

支持 **强调**、*斜体*、[链接](https://github.com/oiiaioiiiiai123)。

> 也可以写一段引用。

## 放入照片或自己的插画

将图片保存到 `assets/images/writing/文章-slug/`，然后使用：

```liquid
![描述照片内容]({{ '/assets/images/writing/文章-slug/photo.jpg' | relative_url }})
![描述原创插画]({{ '/assets/images/writing/文章-slug/drawing.png' | relative_url }})
```

添加图片时去掉代码围栏，将路径替换为真实文件路径。中文正文、列表和长文都会自动排版。
