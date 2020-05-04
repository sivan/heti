# 赫蹏

赫蹏（hètí）是专为中文内容展示设计的排版样式增强。它基于通行的中文排版规范而来，可以为网站的读者带来更好的文章阅读体验。

预览：[https://sivan.github.io/heti/](https://sivan.github.io/heti/)

![Preview](https://raw.githubusercontent.com/sivan/heti/master/_site/assets/screenshot-grid.png)

主要特性：
- 贴合网格的排版；
- 全标签样式美化；
- 预置古文、诗词样式；
- 预置多种排版样式（行间注、多栏、竖排等）；
- 多种预设字体族（仅限桌面端）；
- 简/繁体中文支持；
- 自适应黑暗模式；
- 中西文混排美化，不再手敲空格👏（基于 JavaScript 脚本）；
- 全角标点挤压（基于 JavaScript 脚本）；
- 兼容 *normalize.css*、*CSS Reset* 等常见样式重置；
- 移动端支持；
- ……

总之，用上就会变好看。

## 使用方法

1. 在页面的 `<head>` 标签中引入 `heti.css` 文件：
    ```
    <link rel="stylesheet" href="//unpkg.com/heti/umd/heti.min.css">
    ```
1. 在要作用的容器元素上增加 `class="heti"` 的类名即可：
    ```
    <article class="entry heti">
      <h1>我的世界观</h1>
      <p>有钱人的生活就是这么朴实无华，且枯燥</p>
      ……
    </article>
    ```
1. 使用增强脚本（可选）：
    ```
    <script src="//unpkg.com/heti/umd/heti-addon.min.js"></script>
    <script>
      const heti = new Heti('.heti');
      heti.autoSpacing(); // 自动进行中西文混排美化和标点挤压
    </script>
    ```


## WIP

暂时没什么想做的了。

- [x] 自适应黑暗模式
- [x] 标点挤压
- [x] 中、西文混排
- [x] 繁体中文支持
- [x] 诗词版式
- [x] 行间注版式

-- EOF --
