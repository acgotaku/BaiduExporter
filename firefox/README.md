#BaiduExporter for firefox

调试方法

`jpm run -b $(which firefox) run -p ~/.mozilla/firefox/gtvf6i6n.default/`

生成安装包方法

`jpm xpi`

关闭Firefox插件校验

- Go to `about:config` (enter it into address bar)
- Set `xpinstall.signatures.required` to `false`.