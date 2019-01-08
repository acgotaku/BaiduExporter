(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EventEmitter =
/*#__PURE__*/
function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this._listeners = {};
  }
  /**
   * @param {string} name - event name
   * @param {function(data: *): void} fn - listener function
   */


  _createClass(EventEmitter, [{
    key: "on",
    value: function on(name, fn) {
      var list = this._listeners[name] = this._listeners[name] || [];
      list.push(fn);
    }
    /**
     * @param {string} name - event name
     * @param {*} data - data to emit event listeners
     */

  }, {
    key: "trigger",
    value: function trigger(name, data) {
      var fns = this._listeners[name] || [];
      fns.forEach(function (fn) {
        return fn(data);
      });
    }
    /**
     * @param {string} name - event name
     */

  }, {
    key: "off",
    value: function off(name) {
      delete this._listeners[name];
    }
  }]);

  return EventEmitter;
}();

var _default = EventEmitter;
exports.default = _default;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _store = _interopRequireDefault(require("./store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Core =
/*#__PURE__*/
function () {
  function Core() {
    _classCallCheck(this, Core);

    this.cookies = {};
  }

  _createClass(Core, [{
    key: "httpSend",
    value: function httpSend(_ref, resolve, reject) {
      var url = _ref.url,
          options = _ref.options;
      fetch(url, options).then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            resolve(data);
          });
        } else {
          reject(response);
        }
      }).catch(function (err) {
        reject(err);
      });
    }
  }, {
    key: "getConfigData",
    value: function getConfigData() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return _store.default.getConfigData(key);
    }
  }, {
    key: "objectToQueryString",
    value: function objectToQueryString(obj) {
      return Object.keys(obj).map(function (key) {
        return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(obj[key]));
      }).join('&');
    }
  }, {
    key: "sendToBackground",
    value: function sendToBackground(method, data, callback) {
      chrome.runtime.sendMessage({
        method: method,
        data: data
      }, callback);
    }
  }, {
    key: "showToast",
    value: function showToast(message, type) {
      window.postMessage({
        type: 'showToast',
        data: {
          message: message,
          type: type
        }
      }, location.origin);
    }
  }, {
    key: "getHashParameter",
    value: function getHashParameter(name) {
      var hash = window.location.hash;
      var paramsString = hash.substr(1);
      var searchParams = new URLSearchParams(paramsString);
      return searchParams.get(name);
    }
  }, {
    key: "formatCookies",
    value: function formatCookies() {
      var cookies = [];

      for (var key in this.cookies) {
        cookies.push("".concat(key, "=").concat(this.cookies[key]));
      }

      return cookies.join('; ');
    }
  }, {
    key: "getHeader",
    value: function getHeader() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'RPC';
      var headerOption = [];
      headerOption.push("User-Agent: ".concat(this.getConfigData('userAgent')));
      headerOption.push("Referer: ".concat(this.getConfigData('referer')));

      if (Object.keys(this.cookies).length > 0) {
        headerOption.push("Cookie: ".concat(this.formatCookies()));
      }

      var headers = this.getConfigData('headers');

      if (headers) {
        headers.split('\n').forEach(function (item) {
          headerOption.push(item);
        });
      }

      if (type === 'RPC') {
        return headerOption;
      } else if (type === 'aria2Cmd') {
        return headerOption.map(function (item) {
          return "--header ".concat(JSON.stringify(item));
        }).join(' ');
      } else if (type === 'aria2c') {
        return headerOption.map(function (item) {
          return " header=".concat(item);
        }).join('\n');
      } else if (type === 'idm') {
        return headerOption.map(function (item) {
          var headers = item.split(': ');
          return "".concat(headers[0].toLowerCase(), ": ").concat(headers[1]);
        }).join('\r\n');
      }
    } // 解析 RPC地址 返回验证数据 和地址

  }, {
    key: "parseURL",
    value: function parseURL(url) {
      var parseURL = new URL(url);
      var authStr = parseURL.username ? "".concat(parseURL.username, ":").concat(decodeURI(parseURL.password)) : null;

      if (authStr) {
        if (!authStr.includes('token:')) {
          authStr = "Basic ".concat(btoa(authStr));
        }
      }

      var paramsString = parseURL.hash.substr(1);
      var options = {};
      var searchParams = new URLSearchParams(paramsString);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = searchParams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;
          options[key[0]] = key.length === 2 ? key[1] : 'enabled';
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var path = parseURL.origin + parseURL.pathname;
      return {
        authStr: authStr,
        path: path,
        options: options
      };
    }
  }, {
    key: "generateParameter",
    value: function generateParameter(authStr, path, data) {
      if (authStr && authStr.startsWith('token')) {
        data.params.unshift(authStr);
      }

      var parameter = {
        url: path,
        options: {
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: JSON.stringify(data)
        }
      };

      if (authStr && authStr.startsWith('Basic')) {
        parameter.options.headers['Authorization'] = authStr;
      }

      return parameter;
    } // get aria2 version

  }, {
    key: "getVersion",
    value: function getVersion(rpcPath, element) {
      var data = {
        jsonrpc: '2.0',
        method: 'aria2.getVersion',
        id: 1,
        params: []
      };

      var _this$parseURL = this.parseURL(rpcPath),
          authStr = _this$parseURL.authStr,
          path = _this$parseURL.path;

      this.sendToBackground('rpcVersion', this.generateParameter(authStr, path, data), function (version) {
        if (version) {
          element.innerText = "Aria2\u7248\u672C\u4E3A: ".concat(version);
        } else {
          element.innerText = '错误,请查看是否开启Aria2';
        }
      });
    }
  }, {
    key: "copyText",
    value: function copyText(text) {
      var input = document.createElement('textarea');
      document.body.appendChild(input);
      input.value = text;
      input.focus();
      input.select();
      var result = document.execCommand('copy');
      input.remove();

      if (result) {
        this.showToast('拷贝成功~', 'success');
      } else {
        this.showToast('拷贝失败 QAQ', 'failure');
      }
    } // cookies format  [{"url": "http://pan.baidu.com/", "name": "BDUSS"},{"url": "http://pcs.baidu.com/", "name": "pcsett"}]

  }, {
    key: "requestCookies",
    value: function requestCookies(cookies) {
      var _this = this;

      this.sendToBackground('getCookies', cookies, function (value) {
        _this.cookies = value;
      });
    }
  }, {
    key: "aria2RPCMode",
    value: function aria2RPCMode(rpcPath, fileDownloadInfo) {
      var _this2 = this;

      var _this$parseURL2 = this.parseURL(rpcPath),
          authStr = _this$parseURL2.authStr,
          path = _this$parseURL2.path,
          options = _this$parseURL2.options;

      fileDownloadInfo.forEach(function (file) {
        var rpcData = {
          jsonrpc: '2.0',
          method: 'aria2.addUri',
          id: new Date().getTime(),
          params: [[file.link], {
            out: file.name,
            header: _this2.getHeader()
          }]
        };

        var md5Check = _this2.getConfigData('md5Check');

        var rpcOption = rpcData.params[1];

        var dir = _this2.getConfigData('downloadPath');

        if (dir) {
          rpcOption['dir'] = dir;
        }

        if (md5Check) {
          rpcOption['checksum'] = "md5=".concat(file.md5);
        }

        if (options) {
          for (var key in options) {
            rpcOption[key] = options[key];
          }
        }

        _this2.sendToBackground('rpcData', _this2.generateParameter(authStr, path, rpcData), function (success) {
          if (success) {
            _this2.showToast('下载成功!赶紧去看看吧~', 'success');
          } else {
            _this2.showToast('下载失败!是不是没有开启Aria2?', 'failure');
          }
        });
      });
    }
  }, {
    key: "aria2TXTMode",
    value: function aria2TXTMode(fileDownloadInfo) {
      var _this3 = this;

      var aria2CmdTxt = [];
      var aria2Txt = [];
      var idmTxt = [];
      var downloadLinkTxt = [];
      var prefixTxt = 'data:text/plain;charset=utf-8,';
      fileDownloadInfo.forEach(function (file) {
        var aria2CmdLine = "aria2c -c -s10 -k1M -x16 --enable-rpc=false -o ".concat(JSON.stringify(file.name), " ").concat(_this3.getHeader('aria2Cmd'), " ").concat(JSON.stringify(file.link));
        var aria2Line = [file.link, _this3.getHeader('aria2c'), " out=".concat(file.name)].join('\n');

        var md5Check = _this3.getConfigData('md5Check');

        if (md5Check) {
          aria2CmdLine += " --checksum=md5=".concat(file.md5);
          aria2Line += "\n checksum=md5=".concat(file.md5);
        }

        aria2CmdTxt.push(aria2CmdLine);
        aria2Txt.push(aria2Line);
        var idmLine = ['<', file.link, _this3.getHeader('idm'), '>'].join('\r\n');
        idmTxt.push(idmLine);
        downloadLinkTxt.push(file.link);
      });
      document.querySelector('#aria2CmdTxt').value = "".concat(aria2CmdTxt.join('\n'));
      document.querySelector('#aria2Txt').href = "".concat(prefixTxt).concat(encodeURIComponent(aria2Txt.join('\n')));
      document.querySelector('#idmTxt').href = "".concat(prefixTxt).concat(encodeURIComponent(idmTxt.join('\r\n') + '\r\n'));
      document.querySelector('#downloadLinkTxt').href = "".concat(prefixTxt).concat(encodeURIComponent(downloadLinkTxt.join('\n')));
      document.querySelector('#copyDownloadLinkTxt').dataset.link = downloadLinkTxt.join('\n');
    }
  }]);

  return Core;
}();

var _default = new Core();

exports.default = _default;

},{"./store":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = _interopRequireDefault(require("./core"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Downloader =
/*#__PURE__*/
function () {
  function Downloader(listParameter) {
    _classCallCheck(this, Downloader);

    this.listParameter = listParameter;
    this.fileDownloadInfo = [];
    this.currentTaskId = 0;
    this.completedCount = 0;
    this.folders = [];
    this.files = {};
  }

  _createClass(Downloader, [{
    key: "start",
    value: function start() {
      var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;
      var done = arguments.length > 1 ? arguments[1] : undefined;
      this.interval = interval;
      this.done = done;
      this.currentTaskId = new Date().getTime();
      this.getNextFile(this.currentTaskId);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.fileDownloadInfo = [];
      this.currentTaskId = 0;
      this.folders = [];
      this.files = {};
      this.completedCount = 0;
    }
  }, {
    key: "addFolder",
    value: function addFolder(path) {
      this.folders.push(path);
    }
  }, {
    key: "addFile",
    value: function addFile(file) {
      this.files[file.fs_id] = file;
    }
  }, {
    key: "getNextFile",
    value: function getNextFile(taskId) {
      var _this = this;

      if (taskId !== this.currentTaskId) {
        return;
      }

      if (this.folders.length !== 0) {
        this.completedCount++;

        _core.default.showToast("\u6B63\u5728\u83B7\u53D6\u6587\u4EF6\u5217\u8868... ".concat(this.completedCount, "/").concat(this.completedCount + this.folders.length - 1), 'success');

        var dir = this.folders.pop();
        this.listParameter.search.dir = dir;
        fetch("".concat(window.location.origin).concat(this.listParameter.url).concat(_core.default.objectToQueryString(this.listParameter.search)), this.listParameter.options).then(function (response) {
          if (response.ok) {
            response.json().then(function (data) {
              setTimeout(function () {
                return _this.getNextFile(taskId);
              }, _this.interval);

              if (data.errno !== 0) {
                _core.default.showToast('未知错误', 'failure');

                console.log(data);
                return;
              }

              data.list.forEach(function (item) {
                if (item.isdir) {
                  _this.folders.push(item.path);
                } else {
                  _this.files[item.fs_id] = item;
                }
              });
            });
          } else {
            console.log(response);
          }
        }).catch(function (err) {
          _core.default.showToast('网络请求失败', 'failure');

          console.log(err);
          setTimeout(function () {
            return _this.getNextFile(taskId);
          }, _this.interval);
        });
      } else if (this.files.length !== 0) {
        _core.default.showToast('正在获取下载地址...', 'success');

        this.getFiles(this.files).then(function () {
          _this.done(_this.fileDownloadInfo);
        });
      } else {
        _core.default.showToast('一个文件都没有哦...', 'caution');

        this.reset();
      }
    }
  }, {
    key: "getFiles",
    value: function getFiles(files) {
      throw new Error('subclass should implement this method!');
    }
  }]);

  return Downloader;
}();

var _default = Downloader;
exports.default = _default;

},{"./core":2}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _EventEmitter2 = _interopRequireDefault(require("./EventEmitter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var Store =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  function Store() {
    var _this;

    _classCallCheck(this, Store);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Store).call(this));
    _this.defaultRPC = [{
      name: 'ARIA2 RPC',
      url: 'http://localhost:6800/jsonrpc'
    }];
    _this.defaultUserAgent = 'netdisk;6.0.0.12;PC;PC-Windows;10.0.16299;WindowsBaiduYunGuanJia';
    _this.defaultReferer = 'https://pan.baidu.com/disk/home';
    _this.defaultConfigData = {
      rpcList: _this.defaultRPC,
      configSync: false,
      md5Check: false,
      fold: 0,
      interval: 300,
      downloadPath: '',
      userAgent: _this.defaultUserAgent,
      referer: _this.defaultReferer,
      headers: ''
    };
    _this.configData = {};

    _this.on('initConfigData', _this.init.bind(_assertThisInitialized(_assertThisInitialized(_this))));

    _this.on('setConfigData', _this.set.bind(_assertThisInitialized(_assertThisInitialized(_this))));

    _this.on('clearConfigData', _this.clear.bind(_assertThisInitialized(_assertThisInitialized(_this))));

    return _this;
  }

  _createClass(Store, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      chrome.storage.sync.get(null, function (items) {
        var _loop = function _loop(key) {
          chrome.storage.local.set({
            key: items[key]
          }, function () {
            console.log('chrome first local set: %s, %s', key, items[key]);
          });
        };

        for (var key in items) {
          _loop(key);
        }
      });
      chrome.storage.local.get(null, function (items) {
        _this2.configData = Object.assign({}, _this2.defaultConfigData, items);

        _this2.trigger('updateView', _this2.configData);
      });
    }
  }, {
    key: "getConfigData",
    value: function getConfigData() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (key) {
        return this.configData[key];
      } else {
        return this.configData;
      }
    }
  }, {
    key: "set",
    value: function set(configData) {
      this.configData = configData;
      this.save(configData);
      this.trigger('updateView', configData);
    }
  }, {
    key: "save",
    value: function save(configData) {
      var _loop2 = function _loop2(key) {
        chrome.storage.local.set(_defineProperty({}, key, configData[key]), function () {
          console.log('chrome local set: %s, %s', key, configData[key]);
        });

        if (configData['configSync'] === true) {
          chrome.storage.sync.set(_defineProperty({}, key, configData[key]), function () {
            console.log('chrome sync set: %s, %s', key, configData[key]);
          });
        }
      };

      for (var key in configData) {
        _loop2(key);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      chrome.storage.sync.clear();
      chrome.storage.local.clear();
      this.configData = this.defaultConfigData;
      this.trigger('updateView', this.configData);
    }
  }]);

  return Store;
}(_EventEmitter2.default);

var _default = new Store();

exports.default = _default;

},{"./EventEmitter":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = _interopRequireDefault(require("./core"));

var _store = _interopRequireDefault(require("./store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UI =
/*#__PURE__*/
function () {
  function UI() {
    var _this = this;

    _classCallCheck(this, UI);

    this.version = '1.0.2';
    this.updateDate = '2017/12/30';

    _store.default.on('updateView', function (configData) {
      _this.updateSetting(configData);

      _this.updateMenu(configData);
    });
  }

  _createClass(UI, [{
    key: "init",
    value: function init() {
      this.addSettingUI();
      this.addTextExport();

      _store.default.trigger('initConfigData');
    } // z-index resolve share page show problem

  }, {
    key: "addMenu",
    value: function addMenu(element, position) {
      var menu = "\n      <div id=\"exportMenu\" class=\"g-dropdown-button\">\n        <a class=\"g-button\">\n          <span class=\"g-button-right\">\n            <em class=\"icon icon-download\"></em>\n            <span class=\"text\">\u5BFC\u51FA\u4E0B\u8F7D</span>\n          </span>\n        </a>\n        <div id=\"aria2List\" class=\"menu\" style=\"z-index:50;\">\n          <a class=\"g-button-menu\" id=\"aria2Text\" href=\"javascript:void(0);\">\u6587\u672C\u5BFC\u51FA</a>\n          <a class=\"g-button-menu\" id=\"settingButton\" href=\"javascript:void(0);\">\u8BBE\u7F6E</a>\n        </div>\n      </div>";
      element.insertAdjacentHTML(position, menu);
      var exportMenu = document.querySelector('#exportMenu');
      exportMenu.addEventListener('mouseenter', function () {
        exportMenu.classList.add('button-open');
      });
      exportMenu.addEventListener('mouseleave', function () {
        exportMenu.classList.remove('button-open');
      });
      var settingButton = document.querySelector('#settingButton');
      var settingMenu = document.querySelector('#settingMenu');
      settingButton.addEventListener('click', function () {
        settingMenu.classList.add('open-o');
      });
    }
  }, {
    key: "resetMenu",
    value: function resetMenu() {
      Array.from(document.querySelectorAll('.rpc-button')).forEach(function (rpc) {
        rpc.remove();
      });
    }
  }, {
    key: "updateMenu",
    value: function updateMenu(configData) {
      this.resetMenu();
      var rpcList = configData.rpcList;
      var rpcDOMList = '';
      rpcList.forEach(function (rpc) {
        var rpcDOM = "<a class=\"g-button-menu rpc-button\" href=\"javascript:void(0);\" data-url=".concat(rpc.url, ">").concat(rpc.name, "</a>");
        rpcDOMList += rpcDOM;
      });
      document.querySelector('#aria2List').insertAdjacentHTML('afterbegin', rpcDOMList);
    }
  }, {
    key: "addTextExport",
    value: function addTextExport() {
      var _this2 = this;

      var text = "\n      <div id=\"textMenu\" class=\"modal export-menu\">\n        <div class=\"modal-inner\">\n          <div class=\"modal-header\">\n            <div class=\"modal-title\">\u6587\u672C\u5BFC\u51FA</div>\n            <div class=\"modal-close\">\xD7</div>\n          </div>\n          <div class=\"modal-body\">\n            <div class=\"export-menu-row\">\n              <a class=\"export-menu-button\" href=\"javascript:void(0);\" id=\"aria2Txt\" download=\"aria2c.down\">\u5B58\u4E3AAria2\u6587\u4EF6</a>\n              <a class=\"export-menu-button\" href=\"javascript:void(0);\" id=\"idmTxt\" download=\"idm.ef2\">\u5B58\u4E3AIDM\u6587\u4EF6</a>\n              <a class=\"export-menu-button\" href=\"javascript:void(0);\" id=\"downloadLinkTxt\" download=\"link.txt\">\u4FDD\u5B58\u4E0B\u8F7D\u94FE\u63A5</a>\n              <a class=\"export-menu-button\" href=\"javascript:void(0);\" id=\"copyDownloadLinkTxt\">\u62F7\u8D1D\u4E0B\u8F7D\u94FE\u63A5</a>\n            </div>\n            <div class=\"export-menu-row\">\n              <textarea class=\"export-menu-textarea\" type=\"textarea\" wrap=\"off\" spellcheck=\"false\" id=\"aria2CmdTxt\"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>";
      document.body.insertAdjacentHTML('beforeend', text);
      var textMenu = document.querySelector('#textMenu');
      var close = textMenu.querySelector('.modal-close');
      var copyDownloadLinkTxt = textMenu.querySelector('#copyDownloadLinkTxt');
      copyDownloadLinkTxt.addEventListener('click', function () {
        _core.default.copyText(copyDownloadLinkTxt.dataset.link);
      });
      close.addEventListener('click', function () {
        textMenu.classList.remove('open-o');

        _this2.resetTextExport();
      });
    }
  }, {
    key: "resetTextExport",
    value: function resetTextExport() {
      var textMenu = document.querySelector('#textMenu');
      textMenu.querySelector('#aria2Txt').href = '';
      textMenu.querySelector('#idmTxt').href = '';
      textMenu.querySelector('#downloadLinkTxt').href = '';
      textMenu.querySelector('#aria2CmdTxt').value = '';
      textMenu.querySelector('#copyDownloadLinkTxt').dataset.link = '';
    }
  }, {
    key: "addSettingUI",
    value: function addSettingUI() {
      var _this3 = this;

      var setting = "\n      <div id=\"settingMenu\" class=\"modal setting-menu\">\n        <div class=\"modal-inner\">\n          <div class=\"modal-header\">\n            <div class=\"modal-title\">\u5BFC\u51FA\u8BBE\u7F6E</div>\n            <div class=\"modal-close\">\xD7</div>\n          </div>\n          <div class=\"modal-body\">\n            <div class=\"setting-menu-message\">\n              <label class=\"setting-menu-label orange-o\" id=\"message\"></label>\n            </div>\n            <div class=\"setting-menu-row rpc-s\">\n              <div class=\"setting-menu-name\">\n                <input class=\"setting-menu-input name-s\" spellcheck=\"false\">\n              </div>\n              <div class=\"setting-menu-value\">\n                <input class=\"setting-menu-input url-s\" spellcheck=\"false\">\n                <a class=\"setting-menu-button\" id=\"addRPC\" href=\"javascript:void(0);\">\u6DFB\u52A0RPC\u5730\u5740</a>\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">\u914D\u7F6E\u540C\u6B65</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input type=\"checkbox\" class=\"setting-menu-checkbox configSync-s\">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">MD5\u6821\u9A8C</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input type=\"checkbox\" class=\"setting-menu-checkbox md5Check-s\">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n               <div class=\"setting-menu-name\">\n                 <label class=\"setting-menu-label\">\u6587\u4EF6\u5939\u5C42\u6570</label>\n               </div>\n               <div class=\"setting-menu-value\">\n                 <input class=\"setting-menu-input small-o fold-s\" type=\"number\" spellcheck=\"false\">\n                 <label class=\"setting-menu-label\">(\u9ED8\u8BA40\u8868\u793A\u4E0D\u4FDD\u7559,-1\u8868\u793A\u4FDD\u7559\u5B8C\u6574\u8DEF\u5F84)</label>\n               </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">\u9012\u5F52\u4E0B\u8F7D\u95F4\u9694</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input class=\"setting-menu-input small-o interval-s\" type=\"number\" spellcheck=\"false\">\n                <label class=\"setting-menu-label\">(\u5355\u4F4D:\u6BEB\u79D2)</label>\n                <a class=\"setting-menu-button version-s\" id=\"testAria2\" href=\"javascript:void(0);\">\u6D4B\u8BD5\u8FDE\u63A5\uFF0C\u6210\u529F\u663E\u793A\u7248\u672C\u53F7</a>\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">\u4E0B\u8F7D\u8DEF\u5F84</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input class=\"setting-menu-input downloadPath-s\" placeholder=\"\u53EA\u80FD\u8BBE\u7F6E\u4E3A\u7EDD\u5BF9\u8DEF\u5F84\" spellcheck=\"false\">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">User-Agent</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input class=\"setting-menu-input userAgent-s\" spellcheck=\"false\">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">Referer</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <input class=\"setting-menu-input referer-s\" spellcheck=\"false\">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class=\"setting-menu-row\">\n              <div class=\"setting-menu-name\">\n                <label class=\"setting-menu-label\">Headers</label>\n              </div>\n              <div class=\"setting-menu-value\">\n                <textarea class=\"setting-menu-input textarea-o headers-s\" type=\"textarea\" spellcheck=\"false\"></textarea>\n              </div>\n            </div><!-- /.setting-menu-row -->\n          </div><!-- /.setting-menu-body -->\n          <div class=\"modal-footer\">\n            <div class=\"setting-menu-copyright\">\n              <div class=\"setting-menu-item\">\n                <label class=\"setting-menu-label\">&copy; Copyright</label>\n                <a class=\"setting-menu-link\" href=\"https://github.com/acgotaku/BaiduExporter\" target=\"_blank\">\u96EA\u6708\u79CB\u6C34</a>\n              </div>\n              <div class=\"setting-menu-item\">\n                <label class=\"setting-menu-label\">Version: ".concat(this.version, "</label>\n                <label class=\"setting-menu-label\">Update date: ").concat(this.updateDate, "</label>\n              </div>\n            </div><!-- /.setting-menu-copyright -->\n            <div class=\"setting-menu-operate\">\n              <a class=\"setting-menu-button large-o blue-o\" id=\"apply\" href=\"javascript:void(0);\">\u5E94\u7528</a>\n              <a class=\"setting-menu-button large-o\" id=\"reset\" href=\"javascript:void(0);\">\u91CD\u7F6E</a>\n            </div>\n          </div>\n        </div>\n      </div>");
      document.body.insertAdjacentHTML('beforeend', setting);
      var settingMenu = document.querySelector('#settingMenu');
      var close = settingMenu.querySelector('.modal-close');
      close.addEventListener('click', function () {
        settingMenu.classList.remove('open-o');

        _this3.resetSetting();
      });
      var addRPC = document.querySelector('#addRPC');
      addRPC.addEventListener('click', function () {
        var rpcDOMList = document.querySelectorAll('.rpc-s');
        var RPC = "\n        <div class=\"setting-menu-row rpc-s\">\n          <div class=\"setting-menu-name\">\n            <input class=\"setting-menu-input name-s\" spellcheck=\"false\">\n          </div>\n          <div class=\"setting-menu-value\">\n            <input class=\"setting-menu-input url-s\" spellcheck=\"false\">\n          </div>\n        </div><!-- /.setting-menu-row -->";
        Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC);
      });
      var apply = document.querySelector('#apply');
      var message = document.querySelector('#message');
      apply.addEventListener('click', function () {
        _this3.saveSetting();

        message.innerText = '设置已保存';
      });
      var reset = document.querySelector('#reset');
      reset.addEventListener('click', function () {
        _store.default.trigger('clearConfigData');

        message.innerText = '设置已重置';
      });
      var testAria2 = document.querySelector('#testAria2');
      testAria2.addEventListener('click', function () {
        _core.default.getVersion(_store.default.getConfigData('rpcList')[0].url, testAria2);
      });
    }
  }, {
    key: "resetSetting",
    value: function resetSetting() {
      var message = document.querySelector('#message');
      message.innerText = '';
      var testAria2 = document.querySelector('#testAria2');
      testAria2.innerText = '测试连接，成功显示版本号';
    }
  }, {
    key: "updateSetting",
    value: function updateSetting(configData) {
      var rpcList = configData.rpcList,
          configSync = configData.configSync,
          md5Check = configData.md5Check,
          fold = configData.fold,
          interval = configData.interval,
          downloadPath = configData.downloadPath,
          userAgent = configData.userAgent,
          referer = configData.referer,
          headers = configData.headers; // reset dom

      Array.from(document.querySelectorAll('.rpc-s')).forEach(function (rpc, index) {
        if (index !== 0) {
          rpc.remove();
        }
      });
      rpcList.forEach(function (rpc, index) {
        var rpcDOMList = document.querySelectorAll('.rpc-s');

        if (index === 0) {
          rpcDOMList[index].querySelector('.name-s').value = rpc.name;
          rpcDOMList[index].querySelector('.url-s').value = rpc.url;
        } else {
          var RPC = "\n          <div class=\"setting-menu-row rpc-s\">\n            <div class=\"setting-menu-name\">\n              <input class=\"setting-menu-input name-s\" value=\"".concat(rpc.name, "\" spellcheck=\"false\">\n            </div>\n            <div class=\"setting-menu-value\">\n              <input class=\"setting-menu-input url-s\" value=\"").concat(rpc.url, "\" spellcheck=\"false\">\n            </div>\n          </div><!-- /.setting-menu-row -->");
          Array.from(rpcDOMList).pop().insertAdjacentHTML('afterend', RPC);
        }
      });
      document.querySelector('.configSync-s').checked = configSync;
      document.querySelector('.md5Check-s').checked = md5Check;
      document.querySelector('.fold-s').value = fold;
      document.querySelector('.interval-s').value = interval;
      document.querySelector('.downloadPath-s').value = downloadPath;
      document.querySelector('.userAgent-s').value = userAgent;
      document.querySelector('.referer-s').value = referer;
      document.querySelector('.headers-s').value = headers;
    }
  }, {
    key: "saveSetting",
    value: function saveSetting() {
      var rpcDOMList = document.querySelectorAll('.rpc-s');
      var rpcList = Array.from(rpcDOMList).map(function (rpc) {
        var name = rpc.querySelector('.name-s').value;
        var url = rpc.querySelector('.url-s').value;

        if (name && url) {
          return {
            name: name,
            url: url
          };
        }
      }).filter(function (el) {
        return el;
      });
      var configSync = document.querySelector('.configSync-s').checked;
      var md5Check = document.querySelector('.md5Check-s').checked;
      var fold = Number.parseInt(document.querySelector('.fold-s').value);
      var interval = document.querySelector('.interval-s').value;
      var downloadPath = document.querySelector('.downloadPath-s').value;
      var userAgent = document.querySelector('.userAgent-s').value;
      var referer = document.querySelector('.referer-s').value;
      var headers = document.querySelector('.headers-s').value;
      var configData = {
        rpcList: rpcList,
        configSync: configSync,
        md5Check: md5Check,
        fold: fold,
        interval: interval,
        downloadPath: downloadPath,
        userAgent: userAgent,
        referer: referer,
        headers: headers
      };

      _store.default.trigger('setConfigData', configData);
    }
  }]);

  return UI;
}();

var _default = new UI();

exports.default = _default;

},{"./core":2,"./store":4}],6:[function(require,module,exports){
"use strict";

var _core = _interopRequireDefault(require("./lib/core"));

var _ui = _interopRequireDefault(require("./lib/ui"));

var _downloader = _interopRequireDefault(require("./lib/downloader"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Share =
/*#__PURE__*/
function (_Downloader) {
  _inherits(Share, _Downloader);

  function Share() {
    var _this;

    _classCallCheck(this, Share);

    var search = {
      dir: '',
      bdstoken: window.yunData.MYBDSTOKEN,
      uk: window.yunData.SHARE_UK,
      shareid: window.yunData.SHARE_ID,
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    };
    var listParameter = {
      search: search,
      url: "/share/list?",
      options: {
        credentials: 'include',
        method: 'GET'
      }
    };
    _this = _possibleConstructorReturn(this, _getPrototypeOf(Share).call(this, listParameter));

    _ui.default.init();

    _ui.default.addMenu(document.querySelector('a[data-button-id="b1"]'), 'beforebegin');

    _core.default.requestCookies([{
      url: 'https://pan.baidu.com/',
      name: 'BDUSS'
    }, {
      url: 'https://pcs.baidu.com/',
      name: 'pcsett'
    }, {
      url: 'https://pan.baidu.com/',
      name: 'STOKEN'
    }, {
      url: 'https://pan.baidu.com/',
      name: 'PANPSC'
    }, {
      url: 'https://pan.baidu.com/',
      name: 'SCRC'
    }]); // fix export button position


    document.querySelector('.bar').style.position = 'absolute';

    _core.default.showToast('初始化成功!', 'success');

    _this.mode = 'RPC';
    _this.rpcURL = 'http://localhost:6800/jsonrpc';
    _this.cookies = null;
    _this.files = {};

    _this.requestCookies();

    return _this;
  }

  _createClass(Share, [{
    key: "startDownload",
    value: function startDownload() {
      var _this2 = this;

      this.start(_core.default.getConfigData('interval'), function (fileDownloadInfo) {
        console.log(fileDownloadInfo);

        if (_this2.mode === 'RPC') {
          _core.default.aria2RPCMode(_this2.rpcURL, fileDownloadInfo);
        }

        if (_this2.mode === 'TXT') {
          _core.default.aria2TXTMode(fileDownloadInfo);

          document.querySelector('#textMenu').classList.add('open-o');
        }
      });
    }
  }, {
    key: "requestCookies",
    value: function requestCookies() {
      var _this3 = this;

      _core.default.sendToBackground('getCookies', [{
        url: 'http://pan.baidu.com/',
        name: 'BDCLND'
      }], function (value) {
        _this3.cookies = decodeURIComponent(value['BDCLND']);
      });
    }
  }, {
    key: "startListen",
    value: function startListen() {
      var _this4 = this;

      window.addEventListener('message', function (event) {
        if (event.source !== window) {
          return;
        }

        if (event.data.type && event.data.type === 'selected') {
          _this4.reset();

          var selectedFile = event.data.data;
          console.log(selectedFile);

          if (selectedFile.length === 0) {
            _core.default.showToast('请选择一下你要保存的文件哦', 'failure');

            return;
          }

          selectedFile.forEach(function (item) {
            if (item.isdir) {
              _this4.addFolder(item.path);
            } else {
              _this4.addFile(item);
            }
          });

          _this4.startDownload();
        }
      });
      var menuButton = document.querySelector('#aria2List');
      menuButton.addEventListener('click', function (event) {
        var rpcURL = event.target.dataset.url;

        if (rpcURL) {
          _this4.rpcURL = rpcURL;

          _this4.getSelected();

          _this4.mode = 'RPC';
        }

        if (event.target.id === 'aria2Text') {
          _this4.getSelected();

          _this4.mode = 'TXT';
        }
      });
    }
  }, {
    key: "getSelected",
    value: function getSelected() {
      if (window.yunData.SHAREPAGETYPE === 'single_file_page') {
        this.reset();
        this.addFile({
          fs_id: window.yunData.FS_ID
        });
        this.startDownload();
      } else {
        window.postMessage({
          type: 'getSelected'
        }, location.origin);
      }
    }
  }, {
    key: "showCaptcha",
    value: function showCaptcha(data, resolve, auth) {
      var _this5 = this;

      var captcha = "\n      <div id=\"captchaMenu\" class=\"modal captcha-menu open-o\">\n        <div class=\"modal-inner\">\n          <div class=\"modal-header\">\n            <div class=\"modal-title\">\u63D0\u793A</div>\n            <div class=\"modal-close\">\xD7</div>\n          </div>\n          <div class=\"modal-body\">\n            <div class=\"captcha-menu-row\">\n              <label class=\"captcha-menu-label\">\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801\uFF1A</label>\n              <div class=\"captcha-menu-box\">\n                <input class=\"captcha-menu-input\" maxlength=\"4\" id=\"vcodeValue\">\n                <label class=\"captcha-menu-label warn-o\">".concat(auth === true ? '验证码输入错误' : '', "</label>\n              </div>\n              <img class=\"captcha-menu-img\" maxlength=\"4\" alt=\"\u9A8C\u8BC1\u7801\u83B7\u53D6\u4E2D\" width=\"100\" height=\"30\" src=").concat(data.vcode_img, " id=\"vcode\">\n              <a href=\"javascript:void(0);\" class=\"captcha-menu-button\" id=\"change\">\u6362\u4E00\u5F20</a>\n            </div>\n          </div>\n          <div class=\"modal-footer\">\n          <div class=\"captcha-menu-operate\">\n            <a class=\"captcha-menu-button blue-o\" id=\"apply\" href=\"javascript:void(0);\">\u786E\u5B9A</a>\n            <a class=\"captcha-menu-button\" id=\"reset\" href=\"javascript:void(0);\">\u53D6\u6D88</a>\n          </div>\n          </div>\n        </div>\n      </div>");
      document.body.insertAdjacentHTML('beforeend', captcha);
      var captchaMenu = document.querySelector('#captchaMenu');
      var close = captchaMenu.querySelector('.modal-close');
      close.addEventListener('click', function () {
        captchaMenu.remove();
      });
      var apply = captchaMenu.querySelector('#apply');
      apply.addEventListener('click', function () {
        data['vcode_input'] = document.querySelector('#vcodeValue').value;

        _this5.getFiles(_this5.files, data).then(function () {
          resolve();
        });

        captchaMenu.remove();
      });
      var reset = captchaMenu.querySelector('#reset');
      reset.addEventListener('click', function () {
        captchaMenu.remove();
      });
      var change = captchaMenu.querySelector('#change');
      change.addEventListener('click', function () {
        captchaMenu.querySelector('#vcode').src = "//pan.baidu.com/genimage?".concat(data.vcode_str, "&").concat(new Date().getTime());
      });
    }
  }, {
    key: "getCaptcha",
    value: function getCaptcha(resolve, auth) {
      var _this6 = this;

      var search = {
        prod: 'share',
        bdstoken: window.yunData.MYBDSTOKEN,
        app_id: 250528,
        channel: 'chunlei',
        clienttype: 0,
        web: 1
      };
      var parameter = {
        search: search,
        url: "/api/getcaptcha?",
        options: {
          credentials: 'include',
          method: 'GET'
        }
      };
      fetch("".concat(window.location.origin).concat(parameter.url).concat(_core.default.objectToQueryString(parameter.search)), parameter.options).then(function (response) {
        if (response.ok) {
          response.json().then(function (data) {
            if (data.errno !== 0) {
              _core.default.showToast('未知错误', 'failure');

              console.log(data);
              return;
            }

            _this6.showCaptcha(data, resolve, auth);
          });
        } else {
          console.log(response);
        }
      }).catch(function (err) {
        _core.default.showToast('网络请求失败', 'failure');

        console.log(err);
      });
    }
  }, {
    key: "getPrefixLength",
    value: function getPrefixLength() {
      var path = _core.default.getHashParameter('list/path') || _core.default.getHashParameter('path') || ''; // solution for example :链接:http://pan.baidu.com/s/1hqOIdUk 密码:qat2

      if (path !== window.yunData.PATH) {
        return window.yunData.PATH.slice(0, window.yunData.PATH.lastIndexOf('/')).length + 1;
      } else {
        return path.length === 1 ? 1 : path.length + 1;
      }
    }
  }, {
    key: "getFiles",
    value: function getFiles(files, captcha) {
      var _this7 = this;

      this.files = files;
      var list = [];

      for (var key in files) {
        list.push(files[key].fs_id);
      }

      var body = {
        encrypt: '0',
        product: 'share',
        uk: window.yunData.SHARE_UK,
        primaryid: window.yunData.SHARE_ID,
        fid_list: JSON.stringify(list)
      };

      if (!window.yunData.SHARE_PUBLIC) {
        body['extra'] = JSON.stringify({
          sekey: this.cookies
        });
      }

      if (captcha) {
        body['vcode_input'] = captcha['vcode_input'];
        body['vcode_str'] = captcha['vcode_str'];
      }

      var search = {
        timestamp: window.yunData.TIMESTAMP,
        sign: window.yunData.SIGN,
        bdstoken: window.yunData.MYBDSTOKEN,
        app_id: 250528,
        channel: 'chunlei',
        clienttype: 0,
        web: 1
      };
      var parameter = {
        search: search,
        url: "/api/sharedownload?",
        options: {
          body: _core.default.objectToQueryString(body),
          credentials: 'include',
          method: 'POST',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }
      };
      var prefix = this.getPrefixLength();
      return new Promise(function (resolve) {
        fetch("".concat(window.location.origin).concat(parameter.url).concat(_core.default.objectToQueryString(parameter.search)), parameter.options).then(function (response) {
          if (response.ok) {
            response.json().then(function (data) {
              if (data.errno === 0) {
                data.list.forEach(function (item) {
                  _this7.fileDownloadInfo.push({
                    name: item.path.substr(prefix),
                    link: item.dlink,
                    md5: item.md5
                  });
                });
                resolve();
              } else if (data.errno === -20) {
                _core.default.showToast('请输入验证码以继续下载', 'caution');

                if (captcha) {
                  _this7.getCaptcha(resolve, true);
                } else {
                  _this7.getCaptcha(resolve, false);
                }
              }
            });
          } else {
            console.log(response);
          }
        }).catch(function (err) {
          _core.default.showToast('网络请求失败', 'failure');

          console.log(err);
        });
      });
    }
  }]);

  return Share;
}(_downloader.default);

var share = new Share();
share.startListen();

},{"./lib/core":2,"./lib/downloader":3,"./lib/ui":5}]},{},[6]);
