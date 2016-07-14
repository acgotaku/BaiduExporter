# BaiduExporter

可以方便的把百度网盘的下载地址导出到 aria2/aria2-rpc，支持 YAAW。

## Usage

- 插件的设置必须保存之后才会生效。
- 推荐设置：
    - Set `--rpc-secret=<secret>` if you are using aria2 1.18.4(or higher) with 'JSON-RPC PATH' like http://token:secret@hostname:port/jsonrpc
    - Set `--rpc-user=<username> --rpc-passwd=<passwd>` if you are using aria2 1.15.2(or higher) with 'JSON-RPC PATH' like http://username:passwd@hostname:port/jsonrpc
    - Use `http://localhost:6800/jsonrpc#max-connection-per-server=5&split=10` set download options for specific file.
- 已上传 Aria2 配置文件方便大家使用：[aria2.conf](https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/aria2c/aria2.conf)
- Aria2 配置参考我的博客：[使用 Aria2 下载百度网盘和 115 的资源](https://blog.icehoney.me/posts/2015-01-31-Aria2-download)。

## Install

全面支持 Chrome, Firefox, Edge 和 Safari：

* [Chrome](https://chrome.google.com/webstore/detail/baiduexporter/mjaenbjdjmgolhoafkohbhhbaiedbkno)
* [Firefox](https://addons.mozilla.org/zh-CN/firefox/addon/baiduexporter)
* [Firefox(XPI)](https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/firefox/BaiduExporter.xpi)：下载后打开 Firefox，Ctrl/Command + O 打开选择文件对话框选中 XPI 包即可安装。
* [Safari](https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/safari/BaiduExporter.safariextz)：下载后双击安装即可。
* Edge: You need at least Windows 10 build 14342
    1. Open [about:flags](about:flags), Check `Enable extension developer features`, Restart.
    2. Clone repo to a local read-write folder.
    3. Click **More(...)** -> **Extensions** -> **Load extension**, navigate to the `chrome` folder, click OK.

## Issue 须知

请先阅读[这里](https://github.com/acgotaku/BaiduExporter/issues/128)

## Thanks

- Icon by [Losses Don](https://github.com/Losses)

## Tips

想加快百度网盘的加载请用各种屏蔽插件 添加 `*monitor.jpg?xcode` 和 `http://127.0.0.1:1000*/guanjia*` 规则.  
详见 : [Issue 142](https://github.com/acgotaku/BaiduExporter/issues/142) 和 [Issue 140](https://github.com/acgotaku/BaiduExporter/issues/140)

关于限速，目前请使用这个 UA：
`netdisk;Chrome Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36`

## License

![GPLv3](https://www.gnu.org/graphics/gplv3-127x51.png)

BaiduExporter is licensed under [GNU General Public License](https://www.gnu.org/licenses/gpl.html) Version 3 or later.

BaiduExporter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

BaiduExporter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with BaiduExporter.  If not, see <http://www.gnu.org/licenses/>.
