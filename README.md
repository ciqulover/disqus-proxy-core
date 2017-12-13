## disqus-proxy-core

disqus代理前端评论组件，配合[disqus-proxy-server](https://github.com/ciqulover/disqus-proxy-server)后端使用

[![npm package](https://img.shields.io/npm/v/disqus-proxy-core.svg?style=flat)](https://www.npmjs.org/package/disqus-proxy-core)
![](https://img.shields.io/badge/node-%3E7.6-brightgreen.svg)

[![NPM](https://nodei.co/npm/disqus-proxy-core.png)](https://nodei.co/npm/disqus-proxy-core/)

### 使用方法

1. 在页面中插入`script`标签，以配置disqus-proxy
```
<script>
window.disqusProxy = {
	shortname: 'ciqu',
    username: 'ciqu',
	server: 'disqus-proxy.ycwalker.com',
	port: 5509,
    identifier: "about/index.html"
};
window.disqus_config = function () {
          this.page.url = window.location.href;
          this.page.identifier = window.disqusProxy.identifier;
};
</script>
```
其中：
* shortname 是你的website的 shortname 名称 比如在你的disqus安装代码中 有这样一句脚本： s.src = 'https://test-eo9kkdlcze.disqus.com/embed.js'; 那么你的disqus 的shortname 就是 test-eo9kkdlcze
* username 是你的disqus用户名，即评论时候留下的名字，用来区别disqus-proxy的评论头像显示
* server是你启用disqus代理的VPS的域名
* port是VPS服务器启用disqus代理的端口，需要与之后配置的后端一致
* identifier是文章的标识符，一般为文章路径

2. 在页面合适的地方插入评论框占位符`<div id=""disqus_proxy_thread></div>`,如果有原生diqus的占位符(`<div id=""disqus_thread></div>`)，需要删去。

3. 在需要评论的页面引入[脚本文件（在1.2步骤引入的标签之后引入）](https://github.com/ciqulover/disqus-proxy-core/blob/master/lib/disqus-proxy-core.js)

4. Done!