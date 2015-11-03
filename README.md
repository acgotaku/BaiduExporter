#BaiduExporter

可以方便的把百度网盘的下载地址导出到aria2/aria2-rpc，支持YAAW。

#Usage

插件的设置必须保存之后才会生效

Recommend: Set --rpc-secret=<secret> if you are using aria2 1.18.4(or higher) with 'JSON-RPC PATH' like http://token:secret@hostname:port/jsonrpc

Set --rpc-user=<username> --rpc-passwd=<passwd> if you are using aria2 1.15.2(or higher) with 'JSON-RPC PATH' like http://username:passwd@hostname:port/jsonrpc

已上传Aria2配置文件方便大家使用：[aria2.conf](https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/aria2.conf)

Aria2配置参考我的博客：[使用Aria2下载百度网盘和115的资源](https://blog.icehoney.me/posts/2015-01-31-Aria2-download)

#Install
作为chrome扩展安装即可.

Web Store link : https://chrome.google.com/webstore/detail/baiduexporter/mjaenbjdjmgolhoafkohbhhbaiedbkno

Firefox

XPI包安装:

https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/firefox/baidu-exporter.xpi

下载XPI包,打开Firefox.Ctrl+O 打开选择文件对话框,选中XPI包即可安装.

Safari:

https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/safari/BaiduExporter.safariextz

下载安装即可

Icon by[Losses Don](https://github.com/Losses)


License
-------
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
