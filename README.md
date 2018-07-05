# BaiduExporter [![Build Status](https://img.shields.io/circleci/project/acgotaku/BaiduExporter/master.svg)](https://circleci.com/gh/acgotaku/BaiduExporter/tree/master)

Export Baidu Cloud files address to aria2/aria2-rpc, support YAAW.

## Usage

- Please click save button when change config.
- Recommended Settings:
    - Set `--rpc-secret=<secret>` if you are using aria2 1.18.4(or higher) with 'JSON-RPC PATH' like http://token:secret@hostname:port/jsonrpc
    - Set `--rpc-user=<username> --rpc-passwd=<passwd>` if you are using aria2 1.15.2(or higher) with 'JSON-RPC PATH' like http://username:passwd@hostname:port/jsonrpc
    - Use `http://localhost:6800/jsonrpc#max-connection-per-server=5&split=10` set download options for specific file.
- Aria2c config sample：[aria2.conf](https://raw.githubusercontent.com/acgotaku/BaiduExporter/master/aria2c/aria2.conf)

## Install

* Chrome : Click **Settings** -> **Extensions**, drag `BaiduExporter.crx` file to the page, install it, or check **Developer mode** -> **Load unpacked extension**, navigate to the `chrome/release` folder.
* Firefox : Open **about:debugging** in Firefox, click "Load Temporary Add-on" and navigate to the `chrome/release` folder, select `manifest.json`, click OK.
## Contribution

Please make sure to read the [Contributing Guide](https://github.com/acgotaku/BaiduExporter/blob/master/.github/CONTRIBUTING.md) before making a pull request.

## Issue Notice

Please read [Issue Notice](https://github.com/acgotaku/BaiduExporter/issues/128)

## Thanks

- Icon by [Losses Don](https://github.com/Losses)

## Tips

If you don't want to show disable tips every time, please read the post：[Guide on Packaging and Import Baidu Exporter to Chrome](https://hencolle.com/2016/10/16/baidu_exporter/)

## License

![GPLv3](https://www.gnu.org/graphics/gplv3-127x51.png)

BaiduExporter is licensed under [GNU General Public License](https://www.gnu.org/licenses/gpl.html) Version 3 or later.

BaiduExporter is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

BaiduExporter is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with BaiduExporter.  If not, see <http://www.gnu.org/licenses/>.
