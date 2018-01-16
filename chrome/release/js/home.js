(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('./lib/core');

var _core2 = _interopRequireDefault(_core);

var _ui = require('./lib/ui');

var _ui2 = _interopRequireDefault(_ui);

var _downloader = require('./lib/downloader');

var _downloader2 = _interopRequireDefault(_downloader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Home = function (_Downloader) {
  _inherits(Home, _Downloader);

  function Home() {
    _classCallCheck(this, Home);

    var search = {
      dir: '',
      channel: 'chunlei',
      clienttype: 0,
      web: 1
    };
    var listParameter = {
      search: search,
      url: '/api/list?',
      options: {
        credentials: 'include',
        method: 'GET'
      }
    };

    var _this = _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).call(this, listParameter));

    _ui2.default.init();
    _ui2.default.addMenu(document.querySelectorAll('.g-dropdown-button')[3], 'afterend');
    _core2.default.requestCookies([{ url: 'https://pan.baidu.com/', name: 'BDUSS' }, { url: 'https://pcs.baidu.com/', name: 'STOKEN' }]);
    _core2.default.showToast('初始化成功!', 'success');
    _this.mode = 'RPC';
    _this.rpcURL = 'http://localhost:6800/jsonrpc';
    return _this;
  }

  _createClass(Home, [{
    key: 'startListen',
    value: function startListen() {
      var _this2 = this;

      window.addEventListener('message', function (event) {
        if (event.source !== window) {
          return;
        }

        if (event.data.type && event.data.type === 'selected') {
          _this2.reset();
          var selectedFile = event.data.data;
          if (selectedFile.length === 0) {
            _core2.default.showToast('请选择一下你要保存的文件哦', 'failure');
            return;
          }
          selectedFile.forEach(function (item) {
            if (item.isdir) {
              _this2.addFolder(item.path);
            } else {
              _this2.addFile(item);
            }
          });
          _this2.start(_core2.default.getConfigData('interval'), function (fileDownloadInfo) {
            if (_this2.mode === 'RPC') {
              _core2.default.aria2RPCMode(_this2.rpcURL, fileDownloadInfo);
            }
            if (_this2.mode === 'TXT') {
              _core2.default.aria2TXTMode(fileDownloadInfo);
              document.querySelector('#textMenu').classList.add('open-o');
            }
          });
        }
      });
      var menuButton = document.querySelector('#aria2List');
      menuButton.addEventListener('click', function (event) {
        var rpcURL = event.target.dataset.url;
        if (rpcURL) {
          _this2.rpcURL = rpcURL;
          _this2.getSelected();
          _this2.mode = 'RPC';
        }
        if (event.target.id === 'aria2Text') {
          _this2.getSelected();
          _this2.mode = 'TXT';
        }
      });
    }
  }, {
    key: 'getSelected',
    value: function getSelected() {
      window.postMessage({ type: 'getSelected' }, location.origin);
    }
  }, {
    key: 'getPrefixLength',
    value: function getPrefixLength() {
      var path = _core2.default.getHashParameter('list/path') || _core2.default.getHashParameter('path');
      var fold = _core2.default.getConfigData('fold');
      if (fold === -1 || path === '/') {
        return 1;
      } else {
        var dir = path.split('/');
        var count = 0;
        for (var i = 0; i < dir.length - fold; i++) {
          count = count + dir[i].length + 1;
        }
        return count;
      }
    }
  }, {
    key: 'getFiles',
    value: function getFiles(files) {
      var prefix = this.getPrefixLength();
      for (var key in files) {
        this.fileDownloadInfo.push({
          name: files[key].path.substr(prefix),
          link: location.protocol + '//pcs.baidu.com/rest/2.0/pcs/file?method=download&app_id=250528&path=' + encodeURIComponent(files[key].path),
          md5: files[key].md5
        });
      }
      return Promise.resolve();
    }
  }]);

  return Home;
}(_downloader2.default);

var home = new Home();

home.startListen();

},{"./lib/core":3,"./lib/downloader":4,"./lib/ui":6}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter = function () {
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

exports.default = EventEmitter;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = function () {
  function Core() {
    _classCallCheck(this, Core);

    this.cookies = {};
  }

  _createClass(Core, [{
    key: 'httpSend',
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
    key: 'getConfigData',
    value: function getConfigData() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      return _store2.default.getConfigData(key);
    }
  }, {
    key: 'objectToQueryString',
    value: function objectToQueryString(obj) {
      return Object.keys(obj).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
      }).join('&');
    }
  }, {
    key: 'sendToBackground',
    value: function sendToBackground(method, data, callback) {
      chrome.runtime.sendMessage({
        method: method,
        data: data
      }, callback);
    }
  }, {
    key: 'showToast',
    value: function showToast(message, type) {
      window.postMessage({ type: 'showToast', data: { message: message, type: type } }, location.origin);
    }
  }, {
    key: 'getHashParameter',
    value: function getHashParameter(name) {
      var hash = window.location.hash;
      var paramsString = hash.substr(1);
      var searchParams = new URLSearchParams(paramsString);
      return searchParams.get(name);
    }
  }, {
    key: 'formatCookies',
    value: function formatCookies() {
      var cookies = [];
      for (var key in this.cookies) {
        cookies.push(key + '=' + this.cookies[key]);
      }
      return cookies.join('; ');
    }
  }, {
    key: 'getHeader',
    value: function getHeader() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'RPC';

      var headerOption = [];
      headerOption.push('User-Agent: ' + this.getConfigData('userAgent'));
      headerOption.push('Referer: ' + this.getConfigData('referer'));
      if (Object.keys(this.cookies).length > 0) {
        headerOption.push('Cookie: ' + this.formatCookies());
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
          return '--header ' + JSON.stringify(item);
        }).join(' ');
      } else if (type === 'aria2c') {
        return headerOption.map(function (item) {
          return ' header=' + item;
        }).join('\n');
      } else if (type === 'idm') {
        return headerOption.map(function (item) {
          var headers = item.split(': ');
          return headers[0].toLowerCase() + ': ' + headers[1];
        }).join('\r\n');
      }
    }
    // 解析 RPC地址 返回验证数据 和地址

  }, {
    key: 'parseURL',
    value: function parseURL(url) {
      var parseURL = new URL(url);
      var authStr = parseURL.username ? parseURL.username + ':' + decodeURI(parseURL.password) : null;
      if (authStr) {
        if (!authStr.includes('token:')) {
          authStr = 'Basic ' + btoa(authStr);
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
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var path = parseURL.origin + parseURL.pathname;
      return { authStr: authStr, path: path, options: options };
    }
  }, {
    key: 'generateParameter',
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
    }
    // get aria2 version

  }, {
    key: 'getVersion',
    value: function getVersion(rpcPath, element) {
      var data = {
        jsonrpc: '2.0',
        method: 'aria2.getVersion',
        id: 1,
        params: []
      };

      var _parseURL = this.parseURL(rpcPath),
          authStr = _parseURL.authStr,
          path = _parseURL.path;

      this.sendToBackground('rpcVersion', this.generateParameter(authStr, path, data), function (version) {
        if (version) {
          element.innerText = 'Aria2\u7248\u672C\u4E3A: ' + version;
        } else {
          element.innerText = '错误,请查看是否开启Aria2';
        }
      });
    }
  }, {
    key: 'copyText',
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
    }
    // cookies format  [{"url": "http://pan.baidu.com/", "name": "BDUSS"},{"url": "http://pcs.baidu.com/", "name": "pcsett"}]

  }, {
    key: 'requestCookies',
    value: function requestCookies(cookies) {
      var _this = this;

      this.sendToBackground('getCookies', cookies, function (value) {
        _this.cookies = value;
      });
    }
  }, {
    key: 'aria2RPCMode',
    value: function aria2RPCMode(rpcPath, fileDownloadInfo) {
      var _this2 = this;

      var _parseURL2 = this.parseURL(rpcPath),
          authStr = _parseURL2.authStr,
          path = _parseURL2.path,
          options = _parseURL2.options;

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
          rpcOption['checksum'] = 'md5=' + file.md5;
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
    key: 'aria2TXTMode',
    value: function aria2TXTMode(fileDownloadInfo) {
      var _this3 = this;

      var aria2CmdTxt = [];
      var aria2Txt = [];
      var idmTxt = [];
      var downloadLinkTxt = [];
      var prefixTxt = 'data:text/plain;charset=utf-8,';
      fileDownloadInfo.forEach(function (file) {
        var aria2CmdLine = 'aria2c -c -s10 -k1M -x16 --enable-rpc=false -o ' + JSON.stringify(file.name) + ' ' + _this3.getHeader('aria2Cmd') + ' ' + JSON.stringify(file.link);
        var aria2Line = [file.link, _this3.getHeader('aria2c'), ' out=' + file.name].join('\n');
        var md5Check = _this3.getConfigData('md5Check');
        if (md5Check) {
          aria2CmdLine += ' --checksum=md5=' + file.md5;
          aria2Line += ' checksum=md5=' + file.md5;
        }
        aria2CmdTxt.push(aria2CmdLine);
        aria2Txt.push(aria2Line);
        var idmLine = ['<', file.link, _this3.getHeader('idm'), '>'].join('\r\n');
        idmTxt.push(idmLine);
        downloadLinkTxt.push(file.link);
      });
      document.querySelector('#aria2CmdTxt').value = '' + aria2CmdTxt.join('\n');
      document.querySelector('#aria2Txt').href = '' + prefixTxt + encodeURIComponent(aria2Txt.join('\n'));
      document.querySelector('#idmTxt').href = '' + prefixTxt + encodeURIComponent(idmTxt.join('\r\n') + '\r\n');
      document.querySelector('#downloadLinkTxt').href = '' + prefixTxt + encodeURIComponent(downloadLinkTxt.join('\n'));
      document.querySelector('#copyDownloadLinkTxt').dataset.link = downloadLinkTxt.join('\n');
    }
  }]);

  return Core;
}();

exports.default = new Core();

},{"./store":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Downloader = function () {
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
    key: 'start',
    value: function start() {
      var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 300;
      var done = arguments[1];

      this.interval = interval;
      this.done = done;
      this.currentTaskId = new Date().getTime();
      this.getNextFile(this.currentTaskId);
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.fileDownloadInfo = [];
      this.currentTaskId = 0;
      this.folders = [];
      this.files = {};
      this.completedCount = 0;
    }
  }, {
    key: 'addFolder',
    value: function addFolder(path) {
      this.folders.push(path);
    }
  }, {
    key: 'addFile',
    value: function addFile(file) {
      this.files[file.fs_id] = file;
    }
  }, {
    key: 'getNextFile',
    value: function getNextFile(taskId) {
      var _this = this;

      if (taskId !== this.currentTaskId) {
        return;
      }
      if (this.folders.length !== 0) {
        this.completedCount++;
        _core2.default.showToast('\u6B63\u5728\u83B7\u53D6\u6587\u4EF6\u5217\u8868... ' + this.completedCount + '/' + (this.completedCount + this.folders.length - 1), 'success');
        var dir = this.folders.pop();
        this.listParameter.search.dir = dir;
        fetch('' + window.location.origin + this.listParameter.url + _core2.default.objectToQueryString(this.listParameter.search), this.listParameter.options).then(function (response) {
          if (response.ok) {
            response.json().then(function (data) {
              setTimeout(function () {
                return _this.getNextFile(taskId);
              }, _this.interval);
              if (data.errno !== 0) {
                _core2.default.showToast('未知错误', 'failure');
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
          _core2.default.showToast('网络请求失败', 'failure');
          console.log(err);
          setTimeout(function () {
            return _this.getNextFile(taskId);
          }, _this.interval);
        });
      } else if (this.files.length !== 0) {
        _core2.default.showToast('正在获取下载地址...', 'success');
        this.getFiles(this.files).then(function () {
          _this.done(_this.fileDownloadInfo);
        });
      } else {
        _core2.default.showToast('一个文件都没有哦...', 'caution');
        this.reset();
      }
    }
  }, {
    key: 'getFiles',
    value: function getFiles(files) {
      throw new Error('subclass should implement this method!');
    }
  }]);

  return Downloader;
}();

exports.default = Downloader;

},{"./core":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventEmitter2 = require('./EventEmitter');

var _EventEmitter3 = _interopRequireDefault(_EventEmitter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  function Store() {
    _classCallCheck(this, Store);

    var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

    _this.defaultRPC = [{ name: 'ARIA2 RPC', url: 'http://localhost:6800/jsonrpc' }];
    _this.defaultUserAgent = 'netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia';
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
    _this.on('initConfigData', _this.init.bind(_this));
    _this.on('setConfigData', _this.set.bind(_this));
    _this.on('clearConfigData', _this.clear.bind(_this));
    return _this;
  }

  _createClass(Store, [{
    key: 'init',
    value: function init() {
      var _this2 = this;

      chrome.storage.sync.get(null, function (items) {
        var _loop = function _loop(key) {
          chrome.storage.local.set({ key: items[key] }, function () {
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
    key: 'getConfigData',
    value: function getConfigData() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (key) {
        return this.configData[key];
      } else {
        return this.configData;
      }
    }
  }, {
    key: 'set',
    value: function set(configData) {
      this.configData = configData;
      this.save(configData);
      this.trigger('updateView', configData);
    }
  }, {
    key: 'save',
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
    key: 'clear',
    value: function clear() {
      chrome.storage.sync.clear();
      chrome.storage.local.clear();
      this.configData = this.defaultConfigData;
      this.trigger('updateView', this.configData);
    }
  }]);

  return Store;
}(_EventEmitter3.default);

exports.default = new Store();

},{"./EventEmitter":2}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('./core');

var _core2 = _interopRequireDefault(_core);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UI = function () {
  function UI() {
    var _this = this;

    _classCallCheck(this, UI);

    this.version = '1.0.2';
    this.updateDate = '2017/12/30';
    _store2.default.on('updateView', function (configData) {
      _this.updateSetting(configData);
      _this.updateMenu(configData);
    });
  }

  _createClass(UI, [{
    key: 'init',
    value: function init() {
      this.addSettingUI();
      this.addTextExport();
      _store2.default.trigger('initConfigData');
    }
    // z-index resolve share page show problem

  }, {
    key: 'addMenu',
    value: function addMenu(element, position) {
      var menu = '\n      <div id="exportMenu" class="g-dropdown-button">\n        <a class="g-button">\n          <span class="g-button-right">\n            <em class="icon icon-download"></em>\n            <span class="text">\u5BFC\u51FA\u4E0B\u8F7D</span>\n          </span>\n        </a>\n        <div id="aria2List" class="menu" style="z-index:50;">\n          <a class="g-button-menu" id="aria2Text" href="javascript:void(0);">\u6587\u672C\u5BFC\u51FA</a>\n          <a class="g-button-menu" id="settingButton" href="javascript:void(0);">\u8BBE\u7F6E</a>\n        </div>\n      </div>';
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
    key: 'resetMenu',
    value: function resetMenu() {
      document.querySelectorAll('.rpc-button').forEach(function (rpc) {
        rpc.remove();
      });
    }
  }, {
    key: 'updateMenu',
    value: function updateMenu(configData) {
      this.resetMenu();
      var rpcList = configData.rpcList;

      var rpcDOMList = '';
      rpcList.forEach(function (rpc) {
        var rpcDOM = '<a class="g-button-menu rpc-button" href="javascript:void(0);" data-url=' + rpc.url + '>' + rpc.name + '</a>';
        rpcDOMList += rpcDOM;
      });
      document.querySelector('#aria2List').insertAdjacentHTML('afterbegin', rpcDOMList);
    }
  }, {
    key: 'addTextExport',
    value: function addTextExport() {
      var _this2 = this;

      var text = '\n      <div id="textMenu" class="modal export-menu">\n        <div class="modal-inner">\n          <div class="modal-header">\n            <div class="modal-title">\u6587\u672C\u5BFC\u51FA</div>\n            <div class="modal-close">\xD7</div>\n          </div>\n          <div class="modal-body">\n            <div class="export-menu-row">\n              <a class="export-menu-button" href="javascript:void(0);" id="aria2Txt" download="aria2c.down">\u5B58\u4E3AAria2\u6587\u4EF6</a>\n              <a class="export-menu-button" href="javascript:void(0);" id="idmTxt" download="idm.ef2">\u5B58\u4E3AIDM\u6587\u4EF6</a>\n              <a class="export-menu-button" href="javascript:void(0);" id="downloadLinkTxt" download="link.txt">\u4FDD\u5B58\u4E0B\u8F7D\u94FE\u63A5</a>\n              <a class="export-menu-button" href="javascript:void(0);" id="copyDownloadLinkTxt">\u62F7\u8D1D\u4E0B\u8F7D\u94FE\u63A5</a>\n            </div>\n            <div class="export-menu-row">\n              <textarea class="export-menu-textarea" type="textarea" wrap="off" spellcheck="false" id="aria2CmdTxt"></textarea>\n            </div>\n          </div>\n        </div>\n      </div>';
      document.body.insertAdjacentHTML('beforeend', text);
      var textMenu = document.querySelector('#textMenu');
      var close = textMenu.querySelector('.modal-close');
      var copyDownloadLinkTxt = textMenu.querySelector('#copyDownloadLinkTxt');
      copyDownloadLinkTxt.addEventListener('click', function () {
        _core2.default.copyText(copyDownloadLinkTxt.dataset.link);
      });
      close.addEventListener('click', function () {
        textMenu.classList.remove('open-o');
        _this2.resetTextExport();
      });
    }
  }, {
    key: 'resetTextExport',
    value: function resetTextExport() {
      var textMenu = document.querySelector('#textMenu');
      textMenu.querySelector('#aria2Txt').href = '';
      textMenu.querySelector('#idmTxt').href = '';
      textMenu.querySelector('#downloadLinkTxt').href = '';
      textMenu.querySelector('#aria2CmdTxt').value = '';
      textMenu.querySelector('#copyDownloadLinkTxt').dataset.link = '';
    }
  }, {
    key: 'addSettingUI',
    value: function addSettingUI() {
      var _this3 = this;

      var setting = '\n      <div id="settingMenu" class="modal setting-menu">\n        <div class="modal-inner">\n          <div class="modal-header">\n            <div class="modal-title">\u5BFC\u51FA\u8BBE\u7F6E</div>\n            <div class="modal-close">\xD7</div>\n          </div>\n          <div class="modal-body">\n            <div class="setting-menu-message">\n              <label class="setting-menu-label orange-o" id="message"></label>\n            </div>\n            <div class="setting-menu-row rpc-s">\n              <div class="setting-menu-name">\n                <input class="setting-menu-input name-s" spellcheck="false">\n              </div>\n              <div class="setting-menu-value">\n                <input class="setting-menu-input url-s" spellcheck="false">\n                <a class="setting-menu-button" id="addRPC" href="javascript:void(0);">\u6DFB\u52A0RPC\u5730\u5740</a>\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">\u914D\u7F6E\u540C\u6B65</label>\n              </div>\n              <div class="setting-menu-value">\n                <input type="checkbox" class="setting-menu-checkbox configSync-s">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">MD5\u6821\u9A8C</label>\n              </div>\n              <div class="setting-menu-value">\n                <input type="checkbox" class="setting-menu-checkbox md5Check-s">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n               <div class="setting-menu-name">\n                 <label class="setting-menu-label">\u6587\u4EF6\u5939\u5C42\u6570</label>\n               </div>\n               <div class="setting-menu-value">\n                 <input class="setting-menu-input small-o fold-s" type="number" spellcheck="false">\n                 <label class="setting-menu-label">(\u9ED8\u8BA40\u8868\u793A\u4E0D\u4FDD\u7559,-1\u8868\u793A\u4FDD\u7559\u5B8C\u6574\u8DEF\u5F84)</label>\n               </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">\u9012\u5F52\u4E0B\u8F7D\u95F4\u9694</label>\n              </div>\n              <div class="setting-menu-value">\n                <input class="setting-menu-input small-o interval-s" type="number" spellcheck="false">\n                <label class="setting-menu-label">(\u5355\u4F4D:\u6BEB\u79D2)</label>\n                <a class="setting-menu-button version-s" id="testAria2" href="javascript:void(0);">\u6D4B\u8BD5\u8FDE\u63A5\uFF0C\u6210\u529F\u663E\u793A\u7248\u672C\u53F7</a>\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">\u4E0B\u8F7D\u8DEF\u5F84</label>\n              </div>\n              <div class="setting-menu-value">\n                <input class="setting-menu-input downloadPath-s" placeholder="\u53EA\u80FD\u8BBE\u7F6E\u4E3A\u7EDD\u5BF9\u8DEF\u5F84" spellcheck="false">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">User-Agent</label>\n              </div>\n              <div class="setting-menu-value">\n                <input class="setting-menu-input userAgent-s" spellcheck="false">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">Referer</label>\n              </div>\n              <div class="setting-menu-value">\n                <input class="setting-menu-input referer-s" spellcheck="false">\n              </div>\n            </div><!-- /.setting-menu-row -->\n            <div class="setting-menu-row">\n              <div class="setting-menu-name">\n                <label class="setting-menu-label">Headers</label>\n              </div>\n              <div class="setting-menu-value">\n                <textarea class="setting-menu-input textarea-o headers-s" type="textarea" spellcheck="false"></textarea>\n              </div>\n            </div><!-- /.setting-menu-row -->\n          </div><!-- /.setting-menu-body -->\n          <div class="modal-footer">\n            <div class="setting-menu-copyright">\n              <div class="setting-menu-item">\n                <label class="setting-menu-label">&copy; Copyright</label>\n                <a class="setting-menu-link" href="https://github.com/acgotaku/BaiduExporter" target="_blank">\u96EA\u6708\u79CB\u6C34</a>\n              </div>\n              <div class="setting-menu-item">\n                <label class="setting-menu-label">Version: ' + this.version + '</label>\n                <label class="setting-menu-label">Update date: ' + this.updateDate + '</label>\n              </div>\n            </div><!-- /.setting-menu-copyright -->\n            <div class="setting-menu-operate">\n              <a class="setting-menu-button large-o blue-o" id="apply" href="javascript:void(0);">\u5E94\u7528</a>\n              <a class="setting-menu-button large-o" id="reset" href="javascript:void(0);">\u91CD\u7F6E</a>\n            </div>\n          </div>\n        </div>\n      </div>';
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
        var RPC = '\n        <div class="setting-menu-row rpc-s">\n          <div class="setting-menu-name">\n            <input class="setting-menu-input name-s" spellcheck="false">\n          </div>\n          <div class="setting-menu-value">\n            <input class="setting-menu-input url-s" spellcheck="false">\n          </div>\n        </div><!-- /.setting-menu-row -->';
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
        _store2.default.trigger('clearConfigData');
        message.innerText = '设置已重置';
      });

      var testAria2 = document.querySelector('#testAria2');
      testAria2.addEventListener('click', function () {
        _core2.default.getVersion(_store2.default.getConfigData('rpcList')[0].url, testAria2);
      });
    }
  }, {
    key: 'resetSetting',
    value: function resetSetting() {
      var message = document.querySelector('#message');
      message.innerText = '';
      var testAria2 = document.querySelector('#testAria2');
      testAria2.innerText = '测试连接，成功显示版本号';
    }
  }, {
    key: 'updateSetting',
    value: function updateSetting(configData) {
      var rpcList = configData.rpcList,
          configSync = configData.configSync,
          md5Check = configData.md5Check,
          fold = configData.fold,
          interval = configData.interval,
          downloadPath = configData.downloadPath,
          userAgent = configData.userAgent,
          referer = configData.referer,
          headers = configData.headers;
      // reset dom

      document.querySelectorAll('.rpc-s').forEach(function (rpc, index) {
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
          var RPC = '\n          <div class="setting-menu-row rpc-s">\n            <div class="setting-menu-name">\n              <input class="setting-menu-input name-s" value="' + rpc.name + '" spellcheck="false">\n            </div>\n            <div class="setting-menu-value">\n              <input class="setting-menu-input url-s" value="' + rpc.url + '" spellcheck="false">\n            </div>\n          </div><!-- /.setting-menu-row -->';
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
    key: 'saveSetting',
    value: function saveSetting() {
      var rpcDOMList = document.querySelectorAll('.rpc-s');
      var rpcList = Array.from(rpcDOMList).map(function (rpc) {
        var name = rpc.querySelector('.name-s').value;
        var url = rpc.querySelector('.url-s').value;
        if (name && url) {
          return { name: name, url: url };
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
      _store2.default.trigger('setConfigData', configData);
    }
  }]);

  return UI;
}();

exports.default = new UI();

},{"./core":3,"./store":5}]},{},[1])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaG9tZS5qcyIsInNyYy9qcy9saWIvRXZlbnRFbWl0dGVyLmpzIiwic3JjL2pzL2xpYi9jb3JlLmpzIiwic3JjL2pzL2xpYi9kb3dubG9hZGVyLmpzIiwic3JjL2pzL2xpYi9zdG9yZS5qcyIsInNyYy9qcy9saWIvdWkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7SUFFTSxJOzs7QUFDSixrQkFBZTtBQUFBOztBQUNiLFFBQU0sU0FBUztBQUNiLFdBQUssRUFEUTtBQUViLGVBQVMsU0FGSTtBQUdiLGtCQUFZLENBSEM7QUFJYixXQUFLO0FBSlEsS0FBZjtBQU1BLFFBQU0sZ0JBQWdCO0FBQ3BCLG9CQURvQjtBQUVwQix1QkFGb0I7QUFHcEIsZUFBUztBQUNQLHFCQUFhLFNBRE47QUFFUCxnQkFBUTtBQUZEO0FBSFcsS0FBdEI7O0FBUGEsNEdBZVAsYUFmTzs7QUFnQmIsaUJBQUcsSUFBSDtBQUNBLGlCQUFHLE9BQUgsQ0FBVyxTQUFTLGdCQUFULENBQTBCLG9CQUExQixFQUFnRCxDQUFoRCxDQUFYLEVBQStELFVBQS9EO0FBQ0EsbUJBQUssY0FBTCxDQUFvQixDQUFDLEVBQUUsS0FBSyx3QkFBUCxFQUFpQyxNQUFNLE9BQXZDLEVBQUQsRUFBbUQsRUFBRSxLQUFLLHdCQUFQLEVBQWlDLE1BQU0sUUFBdkMsRUFBbkQsQ0FBcEI7QUFDQSxtQkFBSyxTQUFMLENBQWUsUUFBZixFQUF5QixTQUF6QjtBQUNBLFVBQUssSUFBTCxHQUFZLEtBQVo7QUFDQSxVQUFLLE1BQUwsR0FBYywrQkFBZDtBQXJCYTtBQXNCZDs7OztrQ0FFYztBQUFBOztBQUNiLGFBQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUMsVUFBQyxLQUFELEVBQVc7QUFDNUMsWUFBSSxNQUFNLE1BQU4sS0FBaUIsTUFBckIsRUFBNkI7QUFD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VyxTQUFTLGFBQVQsQ0FBdUIsYUFBdkIsRUFBc0MsS0FBdkQ7QUFDQSxVQUFNLGVBQWUsU0FBUyxhQUFULENBQXVCLGlCQUF2QixFQUEwQyxLQUEvRDtBQUNBLFVBQU0sWUFBWSxTQUFTLGFBQVQsQ0FBdUIsY0FBdkIsRUFBdUMsS0FBekQ7QUFDQSxVQUFNLFVBQVUsU0FBUyxhQUFULENBQXVCLFlBQXZCLEVBQXFDLEtBQXJEO0FBQ0EsVUFBTSxVQUFVLFNBQVMsYUFBVCxDQUF1QixZQUF2QixFQUFxQyxLQUFyRDs7QUFFQSxVQUFNLGFBQWE7QUFDakIsd0JBRGlCO0FBRWpCLDhCQUZpQjtBQUdqQiwwQkFIaUI7QUFJakIsa0JBSmlCO0FBS2pCLDBCQUxpQjtBQU1qQixrQ0FOaUI7QUFPakIsNEJBUGlCO0FBUWpCLHdCQVJpQjtBQVNqQjtBQVRpQixPQUFuQjtBQVdBLHNCQUFNLE9BQU4sQ0FBYyxlQUFkLEVBQStCLFVBQS9CO0FBQ0Q7Ozs7OztrQkFHWSxJQUFJLEVBQUosRSIsImZpbGUiOiJob21lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgQ29yZSBmcm9tICcuL2xpYi9jb3JlJ1xuaW1wb3J0IFVJIGZyb20gJy4vbGliL3VpJ1xuaW1wb3J0IERvd25sb2FkZXIgZnJvbSAnLi9saWIvZG93bmxvYWRlcidcblxuY2xhc3MgSG9tZSBleHRlbmRzIERvd25sb2FkZXIge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgY29uc3Qgc2VhcmNoID0ge1xuICAgICAgZGlyOiAnJyxcbiAgICAgIGNoYW5uZWw6ICdjaHVubGVpJyxcbiAgICAgIGNsaWVudHR5cGU6IDAsXG4gICAgICB3ZWI6IDFcbiAgICB9XG4gICAgY29uc3QgbGlzdFBhcmFtZXRlciA9IHtcbiAgICAgIHNlYXJjaCxcbiAgICAgIHVybDogYC9hcGkvbGlzdD9gLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICB9XG4gICAgfVxuICAgIHN1cGVyKGxpc3RQYXJhbWV0ZXIpXG4gICAgVUkuaW5pdCgpXG4gICAgVUkuYWRkTWVudShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZy1kcm9wZG93bi1idXR0b24nKVszXSwgJ2FmdGVyZW5kJylcbiAgICBDb3JlLnJlcXVlc3RDb29raWVzKFt7IHVybDogJ2h0dHBzOi8vcGFuLmJhaWR1LmNvbS8nLCBuYW1lOiAnQkRVU1MnIH0sIHsgdXJsOiAnaHR0cHM6Ly9wY3MuYmFpZHUuY29tLycsIG5hbWU6ICdTVE9LRU4nIH1dKVxuICAgIENvcmUuc2hvd1RvYXN0KCfliJ3lp4vljJbmiJDlip8hJywgJ3N1Y2Nlc3MnKVxuICAgIHRoaXMubW9kZSA9ICdSUEMnXG4gICAgdGhpcy5ycGNVUkwgPSAnaHR0cDovL2xvY2FsaG9zdDo2ODAwL2pzb25ycGMnXG4gIH1cblxuICBzdGFydExpc3RlbiAoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5zb3VyY2UgIT09IHdpbmRvdykge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50LmRhdGEudHlwZSAmJiBldmVudC5kYXRhLnR5cGUgPT09ICdzZWxlY3RlZCcpIHtcbiAgICAgICAgdGhpcy5yZXNldCgpXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkRmlsZSA9IGV2ZW50LmRhdGEuZGF0YVxuICAgICAgICBpZiAoc2VsZWN0ZWRGaWxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIENvcmUuc2hvd1RvYXN0KCfor7fpgInmi6nkuIDkuIvkvaDopoHkv53lrZjnmoTmlofku7blk6YnLCAnZmFpbHVyZScpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRGaWxlLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICBpZiAoaXRlbS5pc2Rpcikge1xuICAgICAgICAgICAgdGhpcy5hZGRGb2xkZXIoaXRlbS5wYXRoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZEZpbGUoaXRlbSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuc3RhcnQoQ29yZS5nZXRDb25maWdEYXRhKCdpbnRlcnZhbCcpLCAoZmlsZURvd25sb2FkSW5mbykgPT4ge1xuICAgICAgICAgIGlmICh0aGlzLm1vZGUgPT09ICdSUEMnKSB7XG4gICAgICAgICAgICBDb3JlLmFyaWEyUlBDTW9kZSh0aGlzLnJwY1VSTCwgZmlsZURvd25sb2FkSW5mbylcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ1RYVCcpIHtcbiAgICAgICAgICAgIENvcmUuYXJpYTJUWFRNb2RlKGZpbGVEb3dubG9hZEluZm8pXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGV4dE1lbnUnKS5jbGFzc0xpc3QuYWRkKCdvcGVuLW8nKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnN0IG1lbnVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXJpYTJMaXN0JylcbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBycGNVUkwgPSBldmVudC50YXJnZXQuZGF0YXNldC51cmxcbiAgICAgIGlmIChycGNVUkwpIHtcbiAgICAgICAgdGhpcy5ycGNVUkwgPSBycGNVUkxcbiAgICAgICAgdGhpcy5nZXRTZWxlY3RlZCgpXG4gICAgICAgIHRoaXMubW9kZSA9ICdSUEMnXG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0LmlkID09PSAnYXJpYTJUZXh0Jykge1xuICAgICAgICB0aGlzLmdldFNlbGVjdGVkKClcbiAgICAgICAgdGhpcy5tb2RlID0gJ1RYVCdcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZ2V0U2VsZWN0ZWQgKCkge1xuICAgIHdpbmRvdy5wb3N0TWVzc2FnZSh7IHR5cGU6ICdnZXRTZWxlY3RlZCcgfSwgbG9jYXRpb24ub3JpZ2luKVxuICB9XG4gIGdldFByZWZpeExlbmd0aCAoKSB7XG4gICAgY29uc3QgcGF0aCA9IENvcmUuZ2V0SGFzaFBhcmFtZXRlcignbGlzdC9wYXRoJykgfHwgQ29yZS5nZXRIYXNoUGFyYW1ldGVyKCdwYXRoJylcbiAgICBjb25zdCBmb2xkID0gQ29yZS5nZXRDb25maWdEYXRhKCdmb2xkJylcbiAgICBpZiAoZm9sZCA9PT0gLTEgfHwgcGF0aCA9PT0gJy8nKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkaXIgPSBwYXRoLnNwbGl0KCcvJylcbiAgICAgIGxldCBjb3VudCA9IDBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGlyLmxlbmd0aCAtIGZvbGQ7IGkrKykge1xuICAgICAgICBjb3VudCA9IGNvdW50ICsgZGlyW2ldLmxlbmd0aCArIDFcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb3VudFxuICAgIH1cbiAgfVxuICBnZXRGaWxlcyAoZmlsZXMpIHtcbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLmdldFByZWZpeExlbmd0aCgpXG4gICAgZm9yIChsZXQga2V5IGluIGZpbGVzKSB7XG4gICAgICB0aGlzLmZpbGVEb3dubG9hZEluZm8ucHVzaCh7XG4gICAgICAgIG5hbWU6IGZpbGVzW2tleV0ucGF0aC5zdWJzdHIocHJlZml4KSxcbiAgICAgICAgbGluazogYCR7bG9jYXRpb24ucHJvdG9jb2x9Ly9wY3MuYmFpZHUuY29tL3Jlc3QvMi4wL3Bjcy9maWxlP21ldGhvZD1kb3dubG9hZCZhcHBfaWQ9MjUwNTI4JnBhdGg9JHtlbmNvZGVVUklDb21wb25lbnQoZmlsZXNba2V5XS5wYXRoKX1gLFxuICAgICAgICBtZDU6IGZpbGVzW2tleV0ubWQ1XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgfVxufVxuXG5jb25zdCBob21lID0gbmV3IEhvbWUoKVxuXG5ob21lLnN0YXJ0TGlzdGVuKClcbiIsImNsYXNzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gZXZlbnQgbmFtZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGRhdGE6ICopOiB2b2lkfSBmbiAtIGxpc3RlbmVyIGZ1bmN0aW9uXG4gICAqL1xuICBvbiAobmFtZSwgZm4pIHtcbiAgICBjb25zdCBsaXN0ID0gdGhpcy5fbGlzdGVuZXJzW25hbWVdID0gdGhpcy5fbGlzdGVuZXJzW25hbWVdIHx8IFtdXG4gICAgbGlzdC5wdXNoKGZuKVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gZXZlbnQgbmFtZVxuICAgKiBAcGFyYW0geyp9IGRhdGEgLSBkYXRhIHRvIGVtaXQgZXZlbnQgbGlzdGVuZXJzXG4gICAqL1xuICB0cmlnZ2VyIChuYW1lLCBkYXRhKSB7XG4gICAgY29uc3QgZm5zID0gdGhpcy5fbGlzdGVuZXJzW25hbWVdIHx8IFtdXG4gICAgZm5zLmZvckVhY2goZm4gPT4gZm4oZGF0YSkpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBldmVudCBuYW1lXG4gICAqL1xuICBvZmYgKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzW25hbWVdXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRXZlbnRFbWl0dGVyXG4iLCJpbXBvcnQgU3RvcmUgZnJvbSAnLi9zdG9yZSdcblxuY2xhc3MgQ29yZSB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLmNvb2tpZXMgPSB7fVxuICB9XG4gIGh0dHBTZW5kICh7dXJsLCBvcHRpb25zfSwgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgZmV0Y2godXJsLCBvcHRpb25zKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgaWYgKHJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KHJlc3BvbnNlKVxuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHJlamVjdChlcnIpXG4gICAgfSlcbiAgfVxuICBnZXRDb25maWdEYXRhIChrZXkgPSBudWxsKSB7XG4gICAgcmV0dXJuIFN0b3JlLmdldENvbmZpZ0RhdGEoa2V5KVxuICB9XG4gIG9iamVjdFRvUXVlcnlTdHJpbmcgKG9iaikge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcCgoa2V5KSA9PiB7XG4gICAgICByZXR1cm4gYCR7ZW5jb2RlVVJJQ29tcG9uZW50KGtleSl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKX1gXG4gICAgfSkuam9pbignJicpXG4gIH1cbiAgc2VuZFRvQmFja2dyb3VuZCAobWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgIG1ldGhvZCxcbiAgICAgIGRhdGFcbiAgICB9LCBjYWxsYmFjaylcbiAgfVxuICBzaG93VG9hc3QgKG1lc3NhZ2UsIHR5cGUpIHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoeyB0eXBlOiAnc2hvd1RvYXN0JywgZGF0YTogeyBtZXNzYWdlLCB0eXBlIH0gfSwgbG9jYXRpb24ub3JpZ2luKVxuICB9XG4gIGdldEhhc2hQYXJhbWV0ZXIgKG5hbWUpIHtcbiAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2hcbiAgICBjb25zdCBwYXJhbXNTdHJpbmcgPSBoYXNoLnN1YnN0cigxKVxuICAgIGNvbnN0IHNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocGFyYW1zU3RyaW5nKVxuICAgIHJldHVybiBzZWFyY2hQYXJhbXMuZ2V0KG5hbWUpXG4gIH1cbiAgZm9ybWF0Q29va2llcyAoKSB7XG4gICAgY29uc3QgY29va2llcyA9IFtdXG4gICAgZm9yIChsZXQga2V5IGluIHRoaXMuY29va2llcykge1xuICAgICAgY29va2llcy5wdXNoKGAke2tleX09JHt0aGlzLmNvb2tpZXNba2V5XX1gKVxuICAgIH1cbiAgICByZXR1cm4gY29va2llcy5qb2luKCc7ICcpXG4gIH1cbiAgZ2V0SGVhZGVyICh0eXBlID0gJ1JQQycpIHtcbiAgICBjb25zdCBoZWFkZXJPcHRpb24gPSBbXVxuICAgIGhlYWRlck9wdGlvbi5wdXNoKGBVc2VyLUFnZW50OiAke3RoaXMuZ2V0Q29uZmlnRGF0YSgndXNlckFnZW50Jyl9YClcbiAgICBoZWFkZXJPcHRpb24ucHVzaChgUmVmZXJlcjogJHt0aGlzLmdldENvbmZpZ0RhdGEoJ3JlZmVyZXInKX1gKVxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmNvb2tpZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgIGhlYWRlck9wdGlvbi5wdXNoKGBDb29raWU6ICR7dGhpcy5mb3JtYXRDb29raWVzKCl9YClcbiAgICB9XG4gICAgY29uc3QgaGVhZGVycyA9IHRoaXMuZ2V0Q29uZmlnRGF0YSgnaGVhZGVycycpXG4gICAgaWYgKGhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuc3BsaXQoJ1xcbicpLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgaGVhZGVyT3B0aW9uLnB1c2goaXRlbSlcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmICh0eXBlID09PSAnUlBDJykge1xuICAgICAgcmV0dXJuIGhlYWRlck9wdGlvblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FyaWEyQ21kJykge1xuICAgICAgcmV0dXJuIGhlYWRlck9wdGlvbi5tYXAoaXRlbSA9PiBgLS1oZWFkZXIgJHtKU09OLnN0cmluZ2lmeShpdGVtKX1gKS5qb2luKCcgJylcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdhcmlhMmMnKSB7XG4gICAgICByZXR1cm4gaGVhZGVyT3B0aW9uLm1hcChpdGVtID0+IGAgaGVhZGVyPSR7aXRlbX1gKS5qb2luKCdcXG4nKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2lkbScpIHtcbiAgICAgIHJldHVybiBoZWFkZXJPcHRpb24ubWFwKChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IGhlYWRlcnMgPSBpdGVtLnNwbGl0KCc6ICcpXG4gICAgICAgIHJldHVybiBgJHtoZWFkZXJzWzBdLnRvTG93ZXJDYXNlKCl9OiAke2hlYWRlcnNbMV19YFxuICAgICAgfSkuam9pbignXFxyXFxuJylcbiAgICB9XG4gIH1cbiAgLy8g6Kej5p6QIFJQQ+WcsOWdgCDov5Tlm57pqozor4HmlbDmja4g5ZKM5Zyw5Z2AXG4gIHBhcnNlVVJMICh1cmwpIHtcbiAgICBjb25zdCBwYXJzZVVSTCA9IG5ldyBVUkwodXJsKVxuICAgIGxldCBhdXRoU3RyID0gcGFyc2VVUkwudXNlcm5hbWUgPyBgJHtwYXJzZVVSTC51c2VybmFtZX06JHtkZWNvZGVVUkkocGFyc2VVUkwucGFzc3dvcmQpfWAgOiBudWxsXG4gICAgaWYgKGF1dGhTdHIpIHtcbiAgICAgIGlmICghYXV0aFN0ci5pbmNsdWRlcygndG9rZW46JykpIHtcbiAgICAgICAgYXV0aFN0ciA9IGBCYXNpYyAke2J0b2EoYXV0aFN0cil9YFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXNTdHJpbmcgPSBwYXJzZVVSTC5oYXNoLnN1YnN0cigxKVxuICAgIGxldCBvcHRpb25zID0ge31cbiAgICBjb25zdCBzZWFyY2hQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtc1N0cmluZylcbiAgICBmb3IgKGxldCBrZXkgb2Ygc2VhcmNoUGFyYW1zKSB7XG4gICAgICBvcHRpb25zW2tleVswXV0gPSBrZXkubGVuZ3RoID09PSAyID8ga2V5WzFdIDogJ2VuYWJsZWQnXG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSBwYXJzZVVSTC5vcmlnaW4gKyBwYXJzZVVSTC5wYXRobmFtZVxuICAgIHJldHVybiB7YXV0aFN0ciwgcGF0aCwgb3B0aW9uc31cbiAgfVxuICBnZW5lcmF0ZVBhcmFtZXRlciAoYXV0aFN0ciwgcGF0aCwgZGF0YSkge1xuICAgIGlmIChhdXRoU3RyICYmIGF1dGhTdHIuc3RhcnRzV2l0aCgndG9rZW4nKSkge1xuICAgICAgZGF0YS5wYXJhbXMudW5zaGlmdChhdXRoU3RyKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbWV0ZXIgPSB7XG4gICAgICB1cmw6IHBhdGgsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtdHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLTgnXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChhdXRoU3RyICYmIGF1dGhTdHIuc3RhcnRzV2l0aCgnQmFzaWMnKSkge1xuICAgICAgcGFyYW1ldGVyLm9wdGlvbnMuaGVhZGVyc1snQXV0aG9yaXphdGlvbiddID0gYXV0aFN0clxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1ldGVyXG4gIH1cbiAgLy8gZ2V0IGFyaWEyIHZlcnNpb25cbiAgZ2V0VmVyc2lvbiAocnBjUGF0aCwgZWxlbWVudCkge1xuICAgIGxldCBkYXRhID0ge1xuICAgICAganNvbnJwYzogJzIuMCcsXG4gICAgICBtZXRob2Q6ICdhcmlhMi5nZXRWZXJzaW9uJyxcbiAgICAgIGlkOiAxLFxuICAgICAgcGFyYW1zOiBbXVxuICAgIH1cbiAgICBjb25zdCB7YXV0aFN0ciwgcGF0aH0gPSB0aGlzLnBhcnNlVVJMKHJwY1BhdGgpXG4gICAgdGhpcy5zZW5kVG9CYWNrZ3JvdW5kKCdycGNWZXJzaW9uJywgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlcihhdXRoU3RyLCBwYXRoLCBkYXRhKSwgKHZlcnNpb24pID0+IHtcbiAgICAgIGlmICh2ZXJzaW9uKSB7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gYEFyaWEy54mI5pys5Li6OiAke3ZlcnNpb259YFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5pbm5lclRleHQgPSAn6ZSZ6K+vLOivt+afpeeci+aYr+WQpuW8gOWQr0FyaWEyJ1xuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgY29weVRleHQgKHRleHQpIHtcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlucHV0KVxuICAgIGlucHV0LnZhbHVlID0gdGV4dFxuICAgIGlucHV0LmZvY3VzKClcbiAgICBpbnB1dC5zZWxlY3QoKVxuICAgIGNvbnN0IHJlc3VsdCA9IGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgICBpbnB1dC5yZW1vdmUoKVxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHRoaXMuc2hvd1RvYXN0KCfmi7fotJ3miJDlip9+JywgJ3N1Y2Nlc3MnKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNob3dUb2FzdCgn5ou36LSd5aSx6LSlIFFBUScsICdmYWlsdXJlJylcbiAgICB9XG4gIH1cbiAgLy8gY29va2llcyBmb3JtYXQgIFt7XCJ1cmxcIjogXCJodHRwOi8vcGFuLmJhaWR1LmNvbS9cIiwgXCJuYW1lXCI6IFwiQkRVU1NcIn0se1widXJsXCI6IFwiaHR0cDovL3Bjcy5iYWlkdS5jb20vXCIsIFwibmFtZVwiOiBcInBjc2V0dFwifV1cbiAgcmVxdWVzdENvb2tpZXMgKGNvb2tpZXMpIHtcbiAgICB0aGlzLnNlbmRUb0JhY2tncm91bmQoJ2dldENvb2tpZXMnLCBjb29raWVzLCAodmFsdWUpID0+IHsgdGhpcy5jb29raWVzID0gdmFsdWUgfSlcbiAgfVxuICBhcmlhMlJQQ01vZGUgKHJwY1BhdGgsIGZpbGVEb3dubG9hZEluZm8pIHtcbiAgICBjb25zdCB7YXV0aFN0ciwgcGF0aCwgb3B0aW9uc30gPSB0aGlzLnBhcnNlVVJMKHJwY1BhdGgpXG4gICAgZmlsZURvd25sb2FkSW5mby5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCBycGNEYXRhID0ge1xuICAgICAgICBqc29ucnBjOiAnMi4wJyxcbiAgICAgICAgbWV0aG9kOiAnYXJpYTIuYWRkVXJpJyxcbiAgICAgICAgaWQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICBwYXJhbXM6IFtcbiAgICAgICAgICBbZmlsZS5saW5rXSwge1xuICAgICAgICAgICAgb3V0OiBmaWxlLm5hbWUsXG4gICAgICAgICAgICBoZWFkZXI6IHRoaXMuZ2V0SGVhZGVyKClcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAgIGNvbnN0IG1kNUNoZWNrID0gdGhpcy5nZXRDb25maWdEYXRhKCdtZDVDaGVjaycpXG4gICAgICBjb25zdCBycGNPcHRpb24gPSBycGNEYXRhLnBhcmFtc1sxXVxuICAgICAgY29uc3QgZGlyID0gdGhpcy5nZXRDb25maWdEYXRhKCdkb3dubG9hZFBhdGgnKVxuICAgICAgaWYgKGRpcikge1xuICAgICAgICBycGNPcHRpb25bJ2RpciddID0gZGlyXG4gICAgICB9XG4gICAgICBpZiAobWQ1Q2hlY2spIHtcbiAgICAgICAgcnBjT3B0aW9uWydjaGVja3N1bSddID0gYG1kNT0ke2ZpbGUubWQ1fWBcbiAgICAgIH1cbiAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgcnBjT3B0aW9uW2tleV0gPSBvcHRpb25zW2tleV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5zZW5kVG9CYWNrZ3JvdW5kKCdycGNEYXRhJywgdGhpcy5nZW5lcmF0ZVBhcmFtZXRlcihhdXRoU3RyLCBwYXRoLCBycGNEYXRhKSwgKHN1Y2Nlc3MpID0+IHtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLnNob3dUb2FzdCgn5LiL6L295oiQ5YqfIei1tue0p+WOu+eci+eci+WQp34nLCAnc3VjY2VzcycpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zaG93VG9hc3QoJ+S4i+i9veWksei0pSHmmK/kuI3mmK/msqHmnInlvIDlkK9BcmlhMj8nLCAnZmFpbHVyZScpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBhcmlhMlRYVE1vZGUgKGZpbGVEb3dubG9hZEluZm8pIHtcbiAgICBjb25zdCBhcmlhMkNtZFR4dCA9IFtdXG4gICAgY29uc3QgYXJpYTJUeHQgPSBbXVxuICAgIGNvbnN0IGlkbVR4dCA9IFtdXG4gICAgY29uc3QgZG93bmxvYWRMaW5rVHh0ID0gW11cbiAgICBjb25zdCBwcmVmaXhUeHQgPSAnZGF0YTp0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLTgsJ1xuICAgIGZpbGVEb3dubG9hZEluZm8uZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgbGV0IGFyaWEyQ21kTGluZSA9IGBhcmlhMmMgLWMgLXMxMCAtazFNIC14MTYgLS1lbmFibGUtcnBjPWZhbHNlIC1vICR7SlNPTi5zdHJpbmdpZnkoZmlsZS5uYW1lKX0gJHt0aGlzLmdldEhlYWRlcignYXJpYTJDbWQnKX0gJHtKU09OLnN0cmluZ2lmeShmaWxlLmxpbmspfWBcbiAgICAgIGxldCBhcmlhMkxpbmUgPSBbZmlsZS5saW5rLCB0aGlzLmdldEhlYWRlcignYXJpYTJjJyksIGAgb3V0PSR7ZmlsZS5uYW1lfWBdLmpvaW4oJ1xcbicpXG4gICAgICBjb25zdCBtZDVDaGVjayA9IHRoaXMuZ2V0Q29uZmlnRGF0YSgnbWQ1Q2hlY2snKVxuICAgICAgaWYgKG1kNUNoZWNrKSB7XG4gICAgICAgIGFyaWEyQ21kTGluZSArPSBgIC0tY2hlY2tzdW09bWQ1PSR7ZmlsZS5tZDV9YFxuICAgICAgICBhcmlhMkxpbmUgKz0gYCBjaGVja3N1bT1tZDU9JHtmaWxlLm1kNX1gXG4gICAgICB9XG4gICAgICBhcmlhMkNtZFR4dC5wdXNoKGFyaWEyQ21kTGluZSlcbiAgICAgIGFyaWEyVHh0LnB1c2goYXJpYTJMaW5lKVxuICAgICAgY29uc3QgaWRtTGluZSA9IFsnPCcsIGZpbGUubGluaywgdGhpcy5nZXRIZWFkZXIoJ2lkbScpLCAnPiddLmpvaW4oJ1xcclxcbicpXG4gICAgICBpZG1UeHQucHVzaChpZG1MaW5lKVxuICAgICAgZG93bmxvYWRMaW5rVHh0LnB1c2goZmlsZS5saW5rKVxuICAgIH0pXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FyaWEyQ21kVHh0JykudmFsdWUgPSBgJHthcmlhMkNtZFR4dC5qb2luKCdcXG4nKX1gXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FyaWEyVHh0JykuaHJlZiA9IGAke3ByZWZpeFR4dH0ke2VuY29kZVVSSUNvbXBvbmVudChhcmlhMlR4dC5qb2luKCdcXG4nKSl9YFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNpZG1UeHQnKS5ocmVmID0gYCR7cHJlZml4VHh0fSR7ZW5jb2RlVVJJQ29tcG9uZW50KGlkbVR4dC5qb2luKCdcXHJcXG4nKSArICdcXHJcXG4nKX1gXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Rvd25sb2FkTGlua1R4dCcpLmhyZWYgPSBgJHtwcmVmaXhUeHR9JHtlbmNvZGVVUklDb21wb25lbnQoZG93bmxvYWRMaW5rVHh0LmpvaW4oJ1xcbicpKX1gXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NvcHlEb3dubG9hZExpbmtUeHQnKS5kYXRhc2V0LmxpbmsgPSBkb3dubG9hZExpbmtUeHQuam9pbignXFxuJylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgQ29yZSgpXG4iLCJpbXBvcnQgQ29yZSBmcm9tICcuL2NvcmUnXG5cbmNsYXNzIERvd25sb2FkZXIge1xuICBjb25zdHJ1Y3RvciAobGlzdFBhcmFtZXRlcikge1xuICAgIHRoaXMubGlzdFBhcmFtZXRlciA9IGxpc3RQYXJhbWV0ZXJcbiAgICB0aGlzLmZpbGVEb3dubG9hZEluZm8gPSBbXVxuICAgIHRoaXMuY3VycmVudFRhc2tJZCA9IDBcbiAgICB0aGlzLmNvbXBsZXRlZENvdW50ID0gMFxuICAgIHRoaXMuZm9sZGVycyA9IFtdXG4gICAgdGhpcy5maWxlcyA9IHt9XG4gIH1cbiAgc3RhcnQgKGludGVydmFsID0gMzAwLCBkb25lKSB7XG4gICAgdGhpcy5pbnRlcnZhbCA9IGludGVydmFsXG4gICAgdGhpcy5kb25lID0gZG9uZVxuICAgIHRoaXMuY3VycmVudFRhc2tJZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgdGhpcy5nZXROZXh0RmlsZSh0aGlzLmN1cnJlbnRUYXNrSWQpXG4gIH1cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuZmlsZURvd25sb2FkSW5mbyA9IFtdXG4gICAgdGhpcy5jdXJyZW50VGFza0lkID0gMFxuICAgIHRoaXMuZm9sZGVycyA9IFtdXG4gICAgdGhpcy5maWxlcyA9IHt9XG4gICAgdGhpcy5jb21wbGV0ZWRDb3VudCA9IDBcbiAgfVxuICBhZGRGb2xkZXIgKHBhdGgpIHtcbiAgICB0aGlzLmZvbGRlcnMucHVzaChwYXRoKVxuICB9XG4gIGFkZEZpbGUgKGZpbGUpIHtcbiAgICB0aGlzLmZpbGVzW2ZpbGUuZnNfaWRdID0gZmlsZVxuICB9XG4gIGdldE5leHRGaWxlICh0YXNrSWQpIHtcbiAgICBpZiAodGFza0lkICE9PSB0aGlzLmN1cnJlbnRUYXNrSWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5mb2xkZXJzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdGhpcy5jb21wbGV0ZWRDb3VudCsrXG4gICAgICBDb3JlLnNob3dUb2FzdChg5q2j5Zyo6I635Y+W5paH5Lu25YiX6KGoLi4uICR7dGhpcy5jb21wbGV0ZWRDb3VudH0vJHt0aGlzLmNvbXBsZXRlZENvdW50ICsgdGhpcy5mb2xkZXJzLmxlbmd0aCAtIDF9YCwgJ3N1Y2Nlc3MnKVxuICAgICAgY29uc3QgZGlyID0gdGhpcy5mb2xkZXJzLnBvcCgpXG4gICAgICB0aGlzLmxpc3RQYXJhbWV0ZXIuc2VhcmNoLmRpciA9IGRpclxuICAgICAgZmV0Y2goYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3RoaXMubGlzdFBhcmFtZXRlci51cmx9JHtDb3JlLm9iamVjdFRvUXVlcnlTdHJpbmcodGhpcy5saXN0UGFyYW1ldGVyLnNlYXJjaCl9YCwgdGhpcy5saXN0UGFyYW1ldGVyLm9wdGlvbnMpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmIChyZXNwb25zZS5vaykge1xuICAgICAgICAgIHJlc3BvbnNlLmpzb24oKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZ2V0TmV4dEZpbGUodGFza0lkKSwgdGhpcy5pbnRlcnZhbClcbiAgICAgICAgICAgIGlmIChkYXRhLmVycm5vICE9PSAwKSB7XG4gICAgICAgICAgICAgIENvcmUuc2hvd1RvYXN0KCfmnKrnn6XplJnor68nLCAnZmFpbHVyZScpXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YS5saXN0LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgaWYgKGl0ZW0uaXNkaXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvbGRlcnMucHVzaChpdGVtLnBhdGgpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maWxlc1tpdGVtLmZzX2lkXSA9IGl0ZW1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICB9XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIENvcmUuc2hvd1RvYXN0KCfnvZHnu5zor7fmsYLlpLHotKUnLCAnZmFpbHVyZScpXG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmdldE5leHRGaWxlKHRhc2tJZCksIHRoaXMuaW50ZXJ2YWwpXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAodGhpcy5maWxlcy5sZW5ndGggIT09IDApIHtcbiAgICAgIENvcmUuc2hvd1RvYXN0KCfmraPlnKjojrflj5bkuIvovb3lnLDlnYAuLi4nLCAnc3VjY2VzcycpXG4gICAgICB0aGlzLmdldEZpbGVzKHRoaXMuZmlsZXMpLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmRvbmUodGhpcy5maWxlRG93bmxvYWRJbmZvKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgQ29yZS5zaG93VG9hc3QoJ+S4gOS4quaWh+S7tumDveayoeacieWTpi4uLicsICdjYXV0aW9uJylcbiAgICAgIHRoaXMucmVzZXQoKVxuICAgIH1cbiAgfVxuXG4gIGdldEZpbGVzIChmaWxlcykge1xuICAgIHRocm93IG5ldyBFcnJvcignc3ViY2xhc3Mgc2hvdWxkIGltcGxlbWVudCB0aGlzIG1ldGhvZCEnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERvd25sb2FkZXJcbiIsImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnLi9FdmVudEVtaXR0ZXInXG5cbmNsYXNzIFN0b3JlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmRlZmF1bHRSUEMgPSBbe25hbWU6ICdBUklBMiBSUEMnLCB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjY4MDAvanNvbnJwYyd9XVxuICAgIHRoaXMuZGVmYXVsdFVzZXJBZ2VudCA9ICduZXRkaXNrOzUuMy40LjU7UEM7UEMtV2luZG93czs1LjEuMjYwMDtXaW5kb3dzQmFpZHVZdW5HdWFuSmlhJ1xuICAgIHRoaXMuZGVmYXVsdFJlZmVyZXIgPSAnaHR0cHM6Ly9wYW4uYmFpZHUuY29tL2Rpc2svaG9tZSdcbiAgICB0aGlzLmRlZmF1bHRDb25maWdEYXRhID0ge1xuICAgICAgcnBjTGlzdDogdGhpcy5kZWZhdWx0UlBDLFxuICAgICAgY29uZmlnU3luYzogZmFsc2UsXG4gICAgICBtZDVDaGVjazogZmFsc2UsXG4gICAgICBmb2xkOiAwLFxuICAgICAgaW50ZXJ2YWw6IDMwMCxcbiAgICAgIGRvd25sb2FkUGF0aDogJycsXG4gICAgICB1c2VyQWdlbnQ6IHRoaXMuZGVmYXVsdFVzZXJBZ2VudCxcbiAgICAgIHJlZmVyZXI6IHRoaXMuZGVmYXVsdFJlZmVyZXIsXG4gICAgICBoZWFkZXJzOiAnJ1xuICAgIH1cbiAgICB0aGlzLmNvbmZpZ0RhdGEgPSB7fVxuICAgIHRoaXMub24oJ2luaXRDb25maWdEYXRhJywgdGhpcy5pbml0LmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignc2V0Q29uZmlnRGF0YScsIHRoaXMuc2V0LmJpbmQodGhpcykpXG4gICAgdGhpcy5vbignY2xlYXJDb25maWdEYXRhJywgdGhpcy5jbGVhci5iaW5kKHRoaXMpKVxuICB9XG4gIGluaXQgKCkge1xuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwsIChpdGVtcykgPT4ge1xuICAgICAgZm9yIChsZXQga2V5IGluIGl0ZW1zKSB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7a2V5OiBpdGVtc1trZXldfSwgKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdjaHJvbWUgZmlyc3QgbG9jYWwgc2V0OiAlcywgJXMnLCBrZXksIGl0ZW1zW2tleV0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQobnVsbCwgKGl0ZW1zKSA9PiB7XG4gICAgICB0aGlzLmNvbmZpZ0RhdGEgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRDb25maWdEYXRhLCBpdGVtcylcbiAgICAgIHRoaXMudHJpZ2dlcigndXBkYXRlVmlldycsIHRoaXMuY29uZmlnRGF0YSlcbiAgICB9KVxuICB9XG4gIGdldENvbmZpZ0RhdGEgKGtleSA9IG51bGwpIHtcbiAgICBpZiAoa2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25maWdEYXRhW2tleV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY29uZmlnRGF0YVxuICAgIH1cbiAgfVxuICBzZXQgKGNvbmZpZ0RhdGEpIHtcbiAgICB0aGlzLmNvbmZpZ0RhdGEgPSBjb25maWdEYXRhXG4gICAgdGhpcy5zYXZlKGNvbmZpZ0RhdGEpXG4gICAgdGhpcy50cmlnZ2VyKCd1cGRhdGVWaWV3JywgY29uZmlnRGF0YSlcbiAgfVxuICBzYXZlIChjb25maWdEYXRhKSB7XG4gICAgZm9yIChsZXQga2V5IGluIGNvbmZpZ0RhdGEpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7W2tleV06IGNvbmZpZ0RhdGFba2V5XX0sICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Nocm9tZSBsb2NhbCBzZXQ6ICVzLCAlcycsIGtleSwgY29uZmlnRGF0YVtrZXldKVxuICAgICAgfSlcbiAgICAgIGlmIChjb25maWdEYXRhWydjb25maWdTeW5jJ10gPT09IHRydWUpIHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoe1trZXldOiBjb25maWdEYXRhW2tleV19LCAoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2Nocm9tZSBzeW5jIHNldDogJXMsICVzJywga2V5LCBjb25maWdEYXRhW2tleV0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNsZWFyICgpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmNsZWFyKClcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5jbGVhcigpXG4gICAgdGhpcy5jb25maWdEYXRhID0gdGhpcy5kZWZhdWx0Q29uZmlnRGF0YVxuICAgIHRoaXMudHJpZ2dlcigndXBkYXRlVmlldycsIHRoaXMuY29uZmlnRGF0YSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgU3RvcmUoKVxuIiwiaW1wb3J0IENvcmUgZnJvbSAnLi9jb3JlJ1xuaW1wb3J0IFN0b3JlIGZyb20gJy4vc3RvcmUnXG5cbmNsYXNzIFVJIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMudmVyc2lvbiA9ICcxLjAuMidcbiAgICB0aGlzLnVwZGF0ZURhdGUgPSAnMjAxNy8xMi8zMCdcbiAgICBTdG9yZS5vbigndXBkYXRlVmlldycsIChjb25maWdEYXRhKSA9PiB7XG4gICAgICB0aGlzLnVwZGF0ZVNldHRpbmcoY29uZmlnRGF0YSlcbiAgICAgIHRoaXMudXBkYXRlTWVudShjb25maWdEYXRhKVxuICAgIH0pXG4gIH1cbiAgaW5pdCAoKSB7XG4gICAgdGhpcy5hZGRTZXR0aW5nVUkoKVxuICAgIHRoaXMuYWRkVGV4dEV4cG9ydCgpXG4gICAgU3RvcmUudHJpZ2dlcignaW5pdENvbmZpZ0RhdGEnKVxuICB9XG4gIC8vIHotaW5kZXggcmVzb2x2ZSBzaGFyZSBwYWdlIHNob3cgcHJvYmxlbVxuICBhZGRNZW51IChlbGVtZW50LCBwb3NpdGlvbikge1xuICAgIGNvbnN0IG1lbnUgPSBgXG4gICAgICA8ZGl2IGlkPVwiZXhwb3J0TWVudVwiIGNsYXNzPVwiZy1kcm9wZG93bi1idXR0b25cIj5cbiAgICAgICAgPGEgY2xhc3M9XCJnLWJ1dHRvblwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZy1idXR0b24tcmlnaHRcIj5cbiAgICAgICAgICAgIDxlbSBjbGFzcz1cImljb24gaWNvbi1kb3dubG9hZFwiPjwvZW0+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHRcIj7lr7zlh7rkuIvovb08L3NwYW4+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L2E+XG4gICAgICAgIDxkaXYgaWQ9XCJhcmlhMkxpc3RcIiBjbGFzcz1cIm1lbnVcIiBzdHlsZT1cInotaW5kZXg6NTA7XCI+XG4gICAgICAgICAgPGEgY2xhc3M9XCJnLWJ1dHRvbi1tZW51XCIgaWQ9XCJhcmlhMlRleHRcIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuaWh+acrOWvvOWHujwvYT5cbiAgICAgICAgICA8YSBjbGFzcz1cImctYnV0dG9uLW1lbnVcIiBpZD1cInNldHRpbmdCdXR0b25cIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPuiuvue9rjwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5gXG4gICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwocG9zaXRpb24sIG1lbnUpXG4gICAgY29uc3QgZXhwb3J0TWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNleHBvcnRNZW51JylcbiAgICBleHBvcnRNZW51LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICBleHBvcnRNZW51LmNsYXNzTGlzdC5hZGQoJ2J1dHRvbi1vcGVuJylcbiAgICB9KVxuICAgIGV4cG9ydE1lbnUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICAgIGV4cG9ydE1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnYnV0dG9uLW9wZW4nKVxuICAgIH0pXG4gICAgY29uc3Qgc2V0dGluZ0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZXR0aW5nQnV0dG9uJylcbiAgICBjb25zdCBzZXR0aW5nTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZXR0aW5nTWVudScpXG4gICAgc2V0dGluZ0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHNldHRpbmdNZW51LmNsYXNzTGlzdC5hZGQoJ29wZW4tbycpXG4gICAgfSlcbiAgfVxuICByZXNldE1lbnUgKCkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ycGMtYnV0dG9uJykuZm9yRWFjaCgocnBjKSA9PiB7XG4gICAgICBycGMucmVtb3ZlKClcbiAgICB9KVxuICB9XG4gIHVwZGF0ZU1lbnUgKGNvbmZpZ0RhdGEpIHtcbiAgICB0aGlzLnJlc2V0TWVudSgpXG4gICAgY29uc3QgeyBycGNMaXN0IH0gPSBjb25maWdEYXRhXG4gICAgbGV0IHJwY0RPTUxpc3QgPSAnJ1xuICAgIHJwY0xpc3QuZm9yRWFjaCgocnBjKSA9PiB7XG4gICAgICBjb25zdCBycGNET00gPSBgPGEgY2xhc3M9XCJnLWJ1dHRvbi1tZW51IHJwYy1idXR0b25cIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIGRhdGEtdXJsPSR7cnBjLnVybH0+JHtycGMubmFtZX08L2E+YFxuICAgICAgcnBjRE9NTGlzdCArPSBycGNET01cbiAgICB9KVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcmlhMkxpc3QnKS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBycGNET01MaXN0KVxuICB9XG4gIGFkZFRleHRFeHBvcnQgKCkge1xuICAgIGNvbnN0IHRleHQgPSBgXG4gICAgICA8ZGl2IGlkPVwidGV4dE1lbnVcIiBjbGFzcz1cIm1vZGFsIGV4cG9ydC1tZW51XCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1pbm5lclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC10aXRsZVwiPuaWh+acrOWvvOWHujwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWNsb3NlXCI+w5c8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtYm9keVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImV4cG9ydC1tZW51LXJvd1wiPlxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImV4cG9ydC1tZW51LWJ1dHRvblwiIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgaWQ9XCJhcmlhMlR4dFwiIGRvd25sb2FkPVwiYXJpYTJjLmRvd25cIj7lrZjkuLpBcmlhMuaWh+S7tjwvYT5cbiAgICAgICAgICAgICAgPGEgY2xhc3M9XCJleHBvcnQtbWVudS1idXR0b25cIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIGlkPVwiaWRtVHh0XCIgZG93bmxvYWQ9XCJpZG0uZWYyXCI+5a2Y5Li6SURN5paH5Lu2PC9hPlxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImV4cG9ydC1tZW51LWJ1dHRvblwiIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgaWQ9XCJkb3dubG9hZExpbmtUeHRcIiBkb3dubG9hZD1cImxpbmsudHh0XCI+5L+d5a2Y5LiL6L296ZO+5o6lPC9hPlxuICAgICAgICAgICAgICA8YSBjbGFzcz1cImV4cG9ydC1tZW51LWJ1dHRvblwiIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgaWQ9XCJjb3B5RG93bmxvYWRMaW5rVHh0XCI+5ou36LSd5LiL6L296ZO+5o6lPC9hPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZXhwb3J0LW1lbnUtcm93XCI+XG4gICAgICAgICAgICAgIDx0ZXh0YXJlYSBjbGFzcz1cImV4cG9ydC1tZW51LXRleHRhcmVhXCIgdHlwZT1cInRleHRhcmVhXCIgd3JhcD1cIm9mZlwiIHNwZWxsY2hlY2s9XCJmYWxzZVwiIGlkPVwiYXJpYTJDbWRUeHRcIj48L3RleHRhcmVhPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+YFxuICAgIGRvY3VtZW50LmJvZHkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCB0ZXh0KVxuICAgIGNvbnN0IHRleHRNZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RleHRNZW51JylcbiAgICBjb25zdCBjbG9zZSA9IHRleHRNZW51LnF1ZXJ5U2VsZWN0b3IoJy5tb2RhbC1jbG9zZScpXG4gICAgY29uc3QgY29weURvd25sb2FkTGlua1R4dCA9IHRleHRNZW51LnF1ZXJ5U2VsZWN0b3IoJyNjb3B5RG93bmxvYWRMaW5rVHh0JylcbiAgICBjb3B5RG93bmxvYWRMaW5rVHh0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgQ29yZS5jb3B5VGV4dChjb3B5RG93bmxvYWRMaW5rVHh0LmRhdGFzZXQubGluaylcbiAgICB9KVxuICAgIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgdGV4dE1lbnUuY2xhc3NMaXN0LnJlbW92ZSgnb3Blbi1vJylcbiAgICAgIHRoaXMucmVzZXRUZXh0RXhwb3J0KClcbiAgICB9KVxuICB9XG4gIHJlc2V0VGV4dEV4cG9ydCAoKSB7XG4gICAgY29uc3QgdGV4dE1lbnUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGV4dE1lbnUnKVxuICAgIHRleHRNZW51LnF1ZXJ5U2VsZWN0b3IoJyNhcmlhMlR4dCcpLmhyZWYgPSAnJ1xuICAgIHRleHRNZW51LnF1ZXJ5U2VsZWN0b3IoJyNpZG1UeHQnKS5ocmVmID0gJydcbiAgICB0ZXh0TWVudS5xdWVyeVNlbGVjdG9yKCcjZG93bmxvYWRMaW5rVHh0JykuaHJlZiA9ICcnXG4gICAgdGV4dE1lbnUucXVlcnlTZWxlY3RvcignI2FyaWEyQ21kVHh0JykudmFsdWUgPSAnJ1xuICAgIHRleHRNZW51LnF1ZXJ5U2VsZWN0b3IoJyNjb3B5RG93bmxvYWRMaW5rVHh0JykuZGF0YXNldC5saW5rID0gJydcbiAgfVxuICBhZGRTZXR0aW5nVUkgKCkge1xuICAgIGNvbnN0IHNldHRpbmcgPSBgXG4gICAgICA8ZGl2IGlkPVwic2V0dGluZ01lbnVcIiBjbGFzcz1cIm1vZGFsIHNldHRpbmctbWVudVwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaW5uZXJcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtdGl0bGVcIj7lr7zlh7rorr7nva48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jbG9zZVwiPsOXPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWJvZHlcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbWVzc2FnZVwiPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbGFiZWwgb3JhbmdlLW9cIiBpZD1cIm1lc3NhZ2VcIj48L2xhYmVsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXJvdyBycGMtc1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LW5hbWVcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3M9XCJzZXR0aW5nLW1lbnUtaW5wdXQgbmFtZS1zXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IHVybC1zXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJzZXR0aW5nLW1lbnUtYnV0dG9uXCIgaWQ9XCJhZGRSUENcIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPua3u+WKoFJQQ+WcsOWdgDwvYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtcm93XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbmFtZVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInNldHRpbmctbWVudS1sYWJlbFwiPumFjee9ruWQjOatpTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNsYXNzPVwic2V0dGluZy1tZW51LWNoZWNrYm94IGNvbmZpZ1N5bmMtc1wiPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjwhLS0gLy5zZXR0aW5nLW1lbnUtcm93IC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1yb3dcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+TUQ15qCh6aqMPC9sYWJlbD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtdmFsdWVcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2xhc3M9XCJzZXR0aW5nLW1lbnUtY2hlY2tib3ggbWQ1Q2hlY2stc1wiPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjwhLS0gLy5zZXR0aW5nLW1lbnUtcm93IC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1yb3dcIj5cbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbmFtZVwiPlxuICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbGFiZWxcIj7mlofku7blpLnlsYLmlbA8L2xhYmVsPlxuICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInNldHRpbmctbWVudS1pbnB1dCBzbWFsbC1vIGZvbGQtc1wiIHR5cGU9XCJudW1iZXJcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+KOm7mOiupDDooajnpLrkuI3kv53nlZksLTHooajnpLrkv53nlZnlrozmlbTot6/lvoQpPC9sYWJlbD5cbiAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+PCEtLSAvLnNldHRpbmctbWVudS1yb3cgLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXJvd1wiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LW5hbWVcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbGFiZWxcIj7pgJLlvZLkuIvovb3pl7TpmpQ8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS12YWx1ZVwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInNldHRpbmctbWVudS1pbnB1dCBzbWFsbC1vIGludGVydmFsLXNcIiB0eXBlPVwibnVtYmVyXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+KOWNleS9jTrmr6vnp5IpPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8YSBjbGFzcz1cInNldHRpbmctbWVudS1idXR0b24gdmVyc2lvbi1zXCIgaWQ9XCJ0ZXN0QXJpYTJcIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPua1i+ivlei/nuaOpe+8jOaIkOWKn+aYvuekuueJiOacrOWPtzwvYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtcm93XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbmFtZVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInNldHRpbmctbWVudS1sYWJlbFwiPuS4i+i9vei3r+W+hDwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IGRvd25sb2FkUGF0aC1zXCIgcGxhY2Vob2xkZXI9XCLlj6rog73orr7nva7kuLrnu53lr7not6/lvoRcIiBzcGVsbGNoZWNrPVwiZmFsc2VcIj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtcm93XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbmFtZVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInNldHRpbmctbWVudS1sYWJlbFwiPlVzZXItQWdlbnQ8L2xhYmVsPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS12YWx1ZVwiPlxuICAgICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInNldHRpbmctbWVudS1pbnB1dCB1c2VyQWdlbnQtc1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjwhLS0gLy5zZXR0aW5nLW1lbnUtcm93IC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1yb3dcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+UmVmZXJlcjwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IHJlZmVyZXItc1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjwhLS0gLy5zZXR0aW5nLW1lbnUtcm93IC0tPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1yb3dcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+SGVhZGVyczwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXZhbHVlXCI+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhIGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IHRleHRhcmVhLW8gaGVhZGVycy1zXCIgdHlwZT1cInRleHRhcmVhXCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+PC90ZXh0YXJlYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5cbiAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LWJvZHkgLS0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWZvb3RlclwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1jb3B5cmlnaHRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1pdGVtXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+JmNvcHk7IENvcHlyaWdodDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbGlua1wiIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vYWNnb3Rha3UvQmFpZHVFeHBvcnRlclwiIHRhcmdldD1cIl9ibGFua1wiPumbquaciOeni+awtDwvYT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtaXRlbVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInNldHRpbmctbWVudS1sYWJlbFwiPlZlcnNpb246ICR7dGhpcy52ZXJzaW9ufTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzPVwic2V0dGluZy1tZW51LWxhYmVsXCI+VXBkYXRlIGRhdGU6ICR7dGhpcy51cGRhdGVEYXRlfTwvbGFiZWw+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+PCEtLSAvLnNldHRpbmctbWVudS1jb3B5cmlnaHQgLS0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LW9wZXJhdGVcIj5cbiAgICAgICAgICAgICAgPGEgY2xhc3M9XCJzZXR0aW5nLW1lbnUtYnV0dG9uIGxhcmdlLW8gYmx1ZS1vXCIgaWQ9XCJhcHBseVwiIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCI+5bqU55SoPC9hPlxuICAgICAgICAgICAgICA8YSBjbGFzcz1cInNldHRpbmctbWVudS1idXR0b24gbGFyZ2Utb1wiIGlkPVwicmVzZXRcIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiPumHjee9rjwvYT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PmBcbiAgICBkb2N1bWVudC5ib2R5Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgc2V0dGluZylcbiAgICBjb25zdCBzZXR0aW5nTWVudSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZXR0aW5nTWVudScpXG4gICAgY29uc3QgY2xvc2UgPSBzZXR0aW5nTWVudS5xdWVyeVNlbGVjdG9yKCcubW9kYWwtY2xvc2UnKVxuICAgIGNsb3NlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgc2V0dGluZ01lbnUuY2xhc3NMaXN0LnJlbW92ZSgnb3Blbi1vJylcbiAgICAgIHRoaXMucmVzZXRTZXR0aW5nKClcbiAgICB9KVxuICAgIGNvbnN0IGFkZFJQQyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhZGRSUEMnKVxuICAgIGFkZFJQQy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IHJwY0RPTUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucnBjLXMnKVxuICAgICAgY29uc3QgUlBDID0gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXJvdyBycGMtc1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtbmFtZVwiPlxuICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IG5hbWUtc1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtdmFsdWVcIj5cbiAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInNldHRpbmctbWVudS1pbnB1dCB1cmwtc1wiIHNwZWxsY2hlY2s9XCJmYWxzZVwiPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5gXG4gICAgICBBcnJheS5mcm9tKHJwY0RPTUxpc3QpLnBvcCgpLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJlbmQnLCBSUEMpXG4gICAgfSlcbiAgICBjb25zdCBhcHBseSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcHBseScpXG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZXNzYWdlJylcbiAgICBhcHBseS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHRoaXMuc2F2ZVNldHRpbmcoKVxuICAgICAgbWVzc2FnZS5pbm5lclRleHQgPSAn6K6+572u5bey5L+d5a2YJ1xuICAgIH0pXG5cbiAgICBjb25zdCByZXNldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZXNldCcpXG4gICAgcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBTdG9yZS50cmlnZ2VyKCdjbGVhckNvbmZpZ0RhdGEnKVxuICAgICAgbWVzc2FnZS5pbm5lclRleHQgPSAn6K6+572u5bey6YeN572uJ1xuICAgIH0pXG5cbiAgICBjb25zdCB0ZXN0QXJpYTIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGVzdEFyaWEyJylcbiAgICB0ZXN0QXJpYTIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBDb3JlLmdldFZlcnNpb24oU3RvcmUuZ2V0Q29uZmlnRGF0YSgncnBjTGlzdCcpWzBdLnVybCwgdGVzdEFyaWEyKVxuICAgIH0pXG4gIH1cbiAgcmVzZXRTZXR0aW5nICgpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lc3NhZ2UnKVxuICAgIG1lc3NhZ2UuaW5uZXJUZXh0ID0gJydcbiAgICBjb25zdCB0ZXN0QXJpYTIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdGVzdEFyaWEyJylcbiAgICB0ZXN0QXJpYTIuaW5uZXJUZXh0ID0gJ+a1i+ivlei/nuaOpe+8jOaIkOWKn+aYvuekuueJiOacrOWPtydcbiAgfVxuICB1cGRhdGVTZXR0aW5nIChjb25maWdEYXRhKSB7XG4gICAgY29uc3QgeyBycGNMaXN0LCBjb25maWdTeW5jLCBtZDVDaGVjaywgZm9sZCwgaW50ZXJ2YWwsIGRvd25sb2FkUGF0aCwgdXNlckFnZW50LCByZWZlcmVyLCBoZWFkZXJzIH0gPSBjb25maWdEYXRhXG4gICAgLy8gcmVzZXQgZG9tXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJwYy1zJykuZm9yRWFjaCgocnBjLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGluZGV4ICE9PSAwKSB7XG4gICAgICAgIHJwYy5yZW1vdmUoKVxuICAgICAgfVxuICAgIH0pXG4gICAgcnBjTGlzdC5mb3JFYWNoKChycGMsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBycGNET01MaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnJwYy1zJylcbiAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICBycGNET01MaXN0W2luZGV4XS5xdWVyeVNlbGVjdG9yKCcubmFtZS1zJykudmFsdWUgPSBycGMubmFtZVxuICAgICAgICBycGNET01MaXN0W2luZGV4XS5xdWVyeVNlbGVjdG9yKCcudXJsLXMnKS52YWx1ZSA9IHJwYy51cmxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IFJQQyA9IGBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwic2V0dGluZy1tZW51LXJvdyBycGMtc1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInNldHRpbmctbWVudS1uYW1lXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCBjbGFzcz1cInNldHRpbmctbWVudS1pbnB1dCBuYW1lLXNcIiB2YWx1ZT1cIiR7cnBjLm5hbWV9XCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzZXR0aW5nLW1lbnUtdmFsdWVcIj5cbiAgICAgICAgICAgICAgPGlucHV0IGNsYXNzPVwic2V0dGluZy1tZW51LWlucHV0IHVybC1zXCIgdmFsdWU9XCIke3JwYy51cmx9XCIgc3BlbGxjaGVjaz1cImZhbHNlXCI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj48IS0tIC8uc2V0dGluZy1tZW51LXJvdyAtLT5gXG4gICAgICAgIEFycmF5LmZyb20ocnBjRE9NTGlzdCkucG9wKCkuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmVuZCcsIFJQQylcbiAgICAgIH1cbiAgICB9KVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb25maWdTeW5jLXMnKS5jaGVja2VkID0gY29uZmlnU3luY1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tZDVDaGVjay1zJykuY2hlY2tlZCA9IG1kNUNoZWNrXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZvbGQtcycpLnZhbHVlID0gZm9sZFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnRlcnZhbC1zJykudmFsdWUgPSBpbnRlcnZhbFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb3dubG9hZFBhdGgtcycpLnZhbHVlID0gZG93bmxvYWRQYXRoXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVzZXJBZ2VudC1zJykudmFsdWUgPSB1c2VyQWdlbnRcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVmZXJlci1zJykudmFsdWUgPSByZWZlcmVyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlYWRlcnMtcycpLnZhbHVlID0gaGVhZGVyc1xuICB9XG5cbiAgc2F2ZVNldHRpbmcgKCkge1xuICAgIGNvbnN0IHJwY0RPTUxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucnBjLXMnKVxuICAgIGNvbnN0IHJwY0xpc3QgPSBBcnJheS5mcm9tKHJwY0RPTUxpc3QpLm1hcCgocnBjKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0gcnBjLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lLXMnKS52YWx1ZVxuICAgICAgY29uc3QgdXJsID0gcnBjLnF1ZXJ5U2VsZWN0b3IoJy51cmwtcycpLnZhbHVlXG4gICAgICBpZiAobmFtZSAmJiB1cmwpIHtcbiAgICAgICAgcmV0dXJuIHsgbmFtZSwgdXJsIH1cbiAgICAgIH1cbiAgICB9KS5maWx0ZXIoZWwgPT4gZWwpXG4gICAgY29uc3QgY29uZmlnU3luYyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jb25maWdTeW5jLXMnKS5jaGVja2VkXG4gICAgY29uc3QgbWQ1Q2hlY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWQ1Q2hlY2stcycpLmNoZWNrZWRcbiAgICBjb25zdCBmb2xkID0gTnVtYmVyLnBhcnNlSW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mb2xkLXMnKS52YWx1ZSlcbiAgICBjb25zdCBpbnRlcnZhbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5pbnRlcnZhbC1zJykudmFsdWVcbiAgICBjb25zdCBkb3dubG9hZFBhdGggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG93bmxvYWRQYXRoLXMnKS52YWx1ZVxuICAgIGNvbnN0IHVzZXJBZ2VudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy51c2VyQWdlbnQtcycpLnZhbHVlXG4gICAgY29uc3QgcmVmZXJlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZWZlcmVyLXMnKS52YWx1ZVxuICAgIGNvbnN0IGhlYWRlcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVhZGVycy1zJykudmFsdWVcblxuICAgIGNvbnN0IGNvbmZpZ0RhdGEgPSB7XG4gICAgICBycGNMaXN0LFxuICAgICAgY29uZmlnU3luYyxcbiAgICAgIG1kNUNoZWNrLFxuICAgICAgZm9sZCxcbiAgICAgIGludGVydmFsLFxuICAgICAgZG93bmxvYWRQYXRoLFxuICAgICAgdXNlckFnZW50LFxuICAgICAgcmVmZXJlcixcbiAgICAgIGhlYWRlcnNcbiAgICB9XG4gICAgU3RvcmUudHJpZ2dlcignc2V0Q29uZmlnRGF0YScsIGNvbmZpZ0RhdGEpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IFVJKClcbiJdLCJwcmVFeGlzdGluZ0NvbW1lbnQiOiIvLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aWNtOTNjMlZ5TFhCaFkyc3ZYM0J5Wld4MVpHVXVhbk1pTENKemNtTXZhbk12YUc5dFpTNXFjeUlzSW5OeVl5OXFjeTlzYVdJdlJYWmxiblJGYldsMGRHVnlMbXB6SWl3aWMzSmpMMnB6TDJ4cFlpOWpiM0psTG1weklpd2ljM0pqTDJwekwyeHBZaTlrYjNkdWJHOWhaR1Z5TG1weklpd2ljM0pqTDJwekwyeHBZaTl6ZEc5eVpTNXFjeUlzSW5OeVl5OXFjeTlzYVdJdmRXa3Vhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJa0ZCUVVFN096czdPMEZEUVVFN096czdRVUZEUVRzN096dEJRVU5CT3pzN096czdPenM3T3pzN1NVRkZUU3hKT3pzN1FVRkRTaXhyUWtGQlpUdEJRVUZCT3p0QlFVTmlMRkZCUVUwc1UwRkJVenRCUVVOaUxGZEJRVXNzUlVGRVVUdEJRVVZpTEdWQlFWTXNVMEZHU1R0QlFVZGlMR3RDUVVGWkxFTkJTRU03UVVGSllpeFhRVUZMTzBGQlNsRXNTMEZCWmp0QlFVMUJMRkZCUVUwc1owSkJRV2RDTzBGQlEzQkNMRzlDUVVSdlFqdEJRVVZ3UWl4MVFrRkdiMEk3UVVGSGNFSXNaVUZCVXp0QlFVTlFMSEZDUVVGaExGTkJSRTQ3UVVGRlVDeG5Ra0ZCVVR0QlFVWkVPMEZCU0Zjc1MwRkJkRUk3TzBGQlVHRXNORWRCWlZBc1lVRm1UenM3UVVGblFtSXNhVUpCUVVjc1NVRkJTRHRCUVVOQkxHbENRVUZITEU5QlFVZ3NRMEZCVnl4VFFVRlRMR2RDUVVGVUxFTkJRVEJDTEc5Q1FVRXhRaXhGUVVGblJDeERRVUZvUkN4RFFVRllMRVZCUVN0RUxGVkJRUzlFTzBGQlEwRXNiVUpCUVVzc1kwRkJUQ3hEUVVGdlFpeERRVUZETEVWQlFVVXNTMEZCU3l4M1FrRkJVQ3hGUVVGcFF5eE5RVUZOTEU5QlFYWkRMRVZCUVVRc1JVRkJiVVFzUlVGQlJTeExRVUZMTEhkQ1FVRlFMRVZCUVdsRExFMUJRVTBzVVVGQmRrTXNSVUZCYmtRc1EwRkJjRUk3UVVGRFFTeHRRa0ZCU3l4VFFVRk1MRU5CUVdVc1VVRkJaaXhGUVVGNVFpeFRRVUY2UWp0QlFVTkJMRlZCUVVzc1NVRkJUQ3hIUVVGWkxFdEJRVm83UVVGRFFTeFZRVUZMTEUxQlFVd3NSMEZCWXl3clFrRkJaRHRCUVhKQ1lUdEJRWE5DWkRzN096dHJRMEZGWXp0QlFVRkJPenRCUVVOaUxHRkJRVThzWjBKQlFWQXNRMEZCZDBJc1UwRkJlRUlzUlVGQmJVTXNWVUZCUXl4TFFVRkVMRVZCUVZjN1FVRkROVU1zV1VGQlNTeE5RVUZOTEUxQlFVNHNTMEZCYVVJc1RVRkJja0lzUlVGQk5rSTdRVUZETTBJN1FVRkRSRHM3UVVGRlJDeFpRVUZKTEUxQlFVMHNTVUZCVGl4RFFVRlhMRWxCUVZnc1NVRkJiVUlzVFVGQlRTeEpRVUZPTEVOQlFWY3NTVUZCV0N4TFFVRnZRaXhWUVVFelF5eEZRVUYxUkR0QlFVTnlSQ3hwUWtGQlN5eExRVUZNTzBGQlEwRXNZMEZCVFN4bFFVRmxMRTFCUVUwc1NVRkJUaXhEUVVGWExFbEJRV2hETzBGQlEwRXNZMEZCU1N4aFFVRmhMRTFCUVdJc1MwRkJkMElzUTBGQk5VSXNSVUZCSzBJN1FVRkROMElzTWtKQlFVc3NVMEZCVEN4RFFVRmxMR1ZCUVdZc1JVRkJaME1zVTBGQmFFTTdRVUZEUVR0QlFVTkVPMEZCUTBRc2RVSkJRV0VzVDBGQllpeERRVUZ4UWl4VlFVRkRMRWxCUVVRc1JVRkJWVHRCUVVNM1FpeG5Ra0ZCU1N4TFFVRkxMRXRCUVZRc1JVRkJaMEk3UVVGRFpDeHhRa0ZCU3l4VFFVRk1MRU5CUVdVc1MwRkJTeXhKUVVGd1FqdEJRVU5FTEdGQlJrUXNUVUZGVHp0QlFVTk1MSEZDUVVGTExFOUJRVXdzUTBGQllTeEpRVUZpTzBGQlEwUTdRVUZEUml4WFFVNUVPMEZCVDBFc2FVSkJRVXNzUzBGQlRDeERRVUZYTEdWQlFVc3NZVUZCVEN4RFFVRnRRaXhWUVVGdVFpeERRVUZZTEVWQlFUSkRMRlZCUVVNc1owSkJRVVFzUlVGQmMwSTdRVUZETDBRc1owSkJRVWtzVDBGQlN5eEpRVUZNTEV0QlFXTXNTMEZCYkVJc1JVRkJlVUk3UVVGRGRrSXNOa0pCUVVzc1dVRkJUQ3hEUVVGclFpeFBRVUZMTEUxQlFYWkNMRVZCUVN0Q0xHZENRVUV2UWp0QlFVTkVPMEZCUTBRc1owSkJRVWtzVDBGQlN5eEpRVUZNTEV0QlFXTXNTMEZCYkVJc1JVRkJlVUk3UVVGRGRrSXNOa0pCUVVzc1dVRkJUQ3hEUVVGclFpeG5Ra0ZCYkVJN1FVRkRRU3gxUWtGQlV5eGhRVUZVTEVOQlFYVkNMRmRCUVhaQ0xFVkJRVzlETEZOQlFYQkRMRU5CUVRoRExFZEJRVGxETEVOQlFXdEVMRkZCUVd4RU8wRkJRMFE3UVVGRFJpeFhRVkpFTzBGQlUwUTdRVUZEUml4UFFUZENSRHRCUVRoQ1FTeFZRVUZOTEdGQlFXRXNVMEZCVXl4aFFVRlVMRU5CUVhWQ0xGbEJRWFpDTEVOQlFXNUNPMEZCUTBFc2FVSkJRVmNzWjBKQlFWZ3NRMEZCTkVJc1QwRkJOVUlzUlVGQmNVTXNWVUZCUXl4TFFVRkVMRVZCUVZjN1FVRkRPVU1zV1VGQlRTeFRRVUZUTEUxQlFVMHNUVUZCVGl4RFFVRmhMRTlCUVdJc1EwRkJjVUlzUjBGQmNFTTdRVUZEUVN4WlFVRkpMRTFCUVVvc1JVRkJXVHRCUVVOV0xHbENRVUZMTEUxQlFVd3NSMEZCWXl4TlFVRmtPMEZCUTBFc2FVSkJRVXNzVjBGQlREdEJRVU5CTEdsQ1FVRkxMRWxCUVV3c1IwRkJXU3hMUVVGYU8wRkJRMFE3UVVGRFJDeFpRVUZKTEUxQlFVMHNUVUZCVGl4RFFVRmhMRVZCUVdJc1MwRkJiMElzVjBGQmVFSXNSVUZCY1VNN1FVRkRia01zYVVKQlFVc3NWMEZCVER0QlFVTkJMR2xDUVVGTExFbEJRVXdzUjBGQldTeExRVUZhTzBGQlEwUTdRVUZEUml4UFFWaEVPMEZCV1VRN096dHJRMEZGWXp0QlFVTmlMR0ZCUVU4c1YwRkJVQ3hEUVVGdFFpeEZRVUZGTEUxQlFVMHNZVUZCVWl4RlFVRnVRaXhGUVVFMFF5eFRRVUZUTEUxQlFYSkVPMEZCUTBRN096dHpRMEZEYTBJN1FVRkRha0lzVlVGQlRTeFBRVUZQTEdWQlFVc3NaMEpCUVV3c1EwRkJjMElzVjBGQmRFSXNTMEZCYzBNc1pVRkJTeXhuUWtGQlRDeERRVUZ6UWl4TlFVRjBRaXhEUVVGdVJEdEJRVU5CTEZWQlFVMHNUMEZCVHl4bFFVRkxMR0ZCUVV3c1EwRkJiVUlzVFVGQmJrSXNRMEZCWWp0QlFVTkJMRlZCUVVrc1UwRkJVeXhEUVVGRExFTkJRVllzU1VGQlpTeFRRVUZUTEVkQlFUVkNMRVZCUVdsRE8wRkJReTlDTEdWQlFVOHNRMEZCVUR0QlFVTkVMRTlCUmtRc1RVRkZUenRCUVVOTUxGbEJRVTBzVFVGQlRTeExRVUZMTEV0QlFVd3NRMEZCVnl4SFFVRllMRU5CUVZvN1FVRkRRU3haUVVGSkxGRkJRVkVzUTBGQldqdEJRVU5CTEdGQlFVc3NTVUZCU1N4SlFVRkpMRU5CUVdJc1JVRkJaMElzU1VGQlNTeEpRVUZKTEUxQlFVb3NSMEZCWVN4SlFVRnFReXhGUVVGMVF5eEhRVUYyUXl4RlFVRTBRenRCUVVNeFF5eHJRa0ZCVVN4UlFVRlJMRWxCUVVrc1EwRkJTaXhGUVVGUExFMUJRV1lzUjBGQmQwSXNRMEZCYUVNN1FVRkRSRHRCUVVORUxHVkJRVThzUzBGQlVEdEJRVU5FTzBGQlEwWTdPenMyUWtGRFV5eExMRVZCUVU4N1FVRkRaaXhWUVVGTkxGTkJRVk1zUzBGQlN5eGxRVUZNTEVWQlFXWTdRVUZEUVN4WFFVRkxMRWxCUVVrc1IwRkJWQ3hKUVVGblFpeExRVUZvUWl4RlFVRjFRanRCUVVOeVFpeGhRVUZMTEdkQ1FVRk1MRU5CUVhOQ0xFbEJRWFJDTEVOQlFUSkNPMEZCUTNwQ0xHZENRVUZOTEUxQlFVMHNSMEZCVGl4RlFVRlhMRWxCUVZnc1EwRkJaMElzVFVGQmFFSXNRMEZCZFVJc1RVRkJka0lzUTBGRWJVSTdRVUZGZWtJc1owSkJRVk1zVTBGQlV5eFJRVUZzUWl3MlJVRkJhMGNzYlVKQlFXMUNMRTFCUVUwc1IwRkJUaXhGUVVGWExFbEJRVGxDTEVOQlJucEZPMEZCUjNwQ0xHVkJRVXNzVFVGQlRTeEhRVUZPTEVWQlFWYzdRVUZJVXl4VFFVRXpRanRCUVV0RU8wRkJRMFFzWVVGQlR5eFJRVUZSTEU5QlFWSXNSVUZCVUR0QlFVTkVPenM3T3pzN1FVRkhTQ3hKUVVGTkxFOUJRVThzU1VGQlNTeEpRVUZLTEVWQlFXSTdPMEZCUlVFc1MwRkJTeXhYUVVGTU96czdPenM3T3pzN096czdPMGxETTBkTkxGazdRVUZEU2l3d1FrRkJaVHRCUVVGQk96dEJRVU5pTEZOQlFVc3NWVUZCVEN4SFFVRnJRaXhGUVVGc1FqdEJRVU5FT3p0QlFVVkVPenM3T3pzN096dDFRa0ZKU1N4SkxFVkJRVTBzUlN4RlFVRkpPMEZCUTFvc1ZVRkJUU3hQUVVGUExFdEJRVXNzVlVGQlRDeERRVUZuUWl4SlFVRm9RaXhKUVVGM1FpeExRVUZMTEZWQlFVd3NRMEZCWjBJc1NVRkJhRUlzUzBGQmVVSXNSVUZCT1VRN1FVRkRRU3hYUVVGTExFbEJRVXdzUTBGQlZTeEZRVUZXTzBGQlEwUTdPMEZCUlVRN096czdPenM3TkVKQlNWTXNTU3hGUVVGTkxFa3NSVUZCVFR0QlFVTnVRaXhWUVVGTkxFMUJRVTBzUzBGQlN5eFZRVUZNTEVOQlFXZENMRWxCUVdoQ0xFdEJRWGxDTEVWQlFYSkRPMEZCUTBFc1ZVRkJTU3hQUVVGS0xFTkJRVms3UVVGQlFTeGxRVUZOTEVkQlFVY3NTVUZCU0N4RFFVRk9PMEZCUVVFc1QwRkJXanRCUVVORU96dEJRVVZFT3pzN096czdkMEpCUjBzc1NTeEZRVUZOTzBGQlExUXNZVUZCVHl4TFFVRkxMRlZCUVV3c1EwRkJaMElzU1VGQmFFSXNRMEZCVUR0QlFVTkVPenM3T3pzN2EwSkJSMWtzV1RzN096czdPenM3T3pzN1FVTXZRbVk3T3pzN096czdPMGxCUlUwc1NUdEJRVU5LTEd0Q1FVRmxPMEZCUVVFN08wRkJRMklzVTBGQlN5eFBRVUZNTEVkQlFXVXNSVUZCWmp0QlFVTkVPenM3TzIxRFFVTjVRaXhQTEVWQlFWTXNUU3hGUVVGUk8wRkJRVUVzVlVGQmFFTXNSMEZCWjBNc1VVRkJhRU1zUjBGQlowTTdRVUZCUVN4VlFVRXpRaXhQUVVFeVFpeFJRVUV6UWl4UFFVRXlRanM3UVVGRGVrTXNXVUZCVFN4SFFVRk9MRVZCUVZjc1QwRkJXQ3hGUVVGdlFpeEpRVUZ3UWl4RFFVRjVRaXhWUVVGRExGRkJRVVFzUlVGQll6dEJRVU55UXl4WlFVRkpMRk5CUVZNc1JVRkJZaXhGUVVGcFFqdEJRVU5tTEcxQ1FVRlRMRWxCUVZRc1IwRkJaMElzU1VGQmFFSXNRMEZCY1VJc1ZVRkJReXhKUVVGRUxFVkJRVlU3UVVGRE4wSXNiMEpCUVZFc1NVRkJVanRCUVVORUxGZEJSa1E3UVVGSFJDeFRRVXBFTEUxQlNVODdRVUZEVEN4cFFrRkJUeXhSUVVGUU8wRkJRMFE3UVVGRFJpeFBRVkpFTEVWQlVVY3NTMEZTU0N4RFFWRlRMRlZCUVVNc1IwRkJSQ3hGUVVGVE8wRkJRMmhDTEdWQlFVOHNSMEZCVUR0QlFVTkVMRTlCVmtRN1FVRlhSRHM3TzI5RFFVTXdRanRCUVVGQkxGVkJRVm9zUjBGQldTeDFSVUZCVGl4SlFVRk5PenRCUVVONlFpeGhRVUZQTEdkQ1FVRk5MR0ZCUVU0c1EwRkJiMElzUjBGQmNFSXNRMEZCVUR0QlFVTkVPenM3ZDBOQlEyOUNMRWNzUlVGQlN6dEJRVU40UWl4aFFVRlBMRTlCUVU4c1NVRkJVQ3hEUVVGWkxFZEJRVm9zUlVGQmFVSXNSMEZCYWtJc1EwRkJjVUlzVlVGQlF5eEhRVUZFTEVWQlFWTTdRVUZEYmtNc1pVRkJWU3h0UWtGQmJVSXNSMEZCYmtJc1EwRkJWaXhUUVVGeFF5eHRRa0ZCYlVJc1NVRkJTU3hIUVVGS0xFTkJRVzVDTEVOQlFYSkRPMEZCUTBRc1QwRkdUU3hGUVVWS0xFbEJSa2tzUTBGRlF5eEhRVVpFTEVOQlFWQTdRVUZIUkRzN08zRkRRVU5wUWl4TkxFVkJRVkVzU1N4RlFVRk5MRkVzUlVGQlZUdEJRVU40UXl4aFFVRlBMRTlCUVZBc1EwRkJaU3hYUVVGbUxFTkJRVEpDTzBGQlEzcENMSE5DUVVSNVFqdEJRVVY2UWp0QlFVWjVRaXhQUVVFelFpeEZRVWRITEZGQlNFZzdRVUZKUkRzN096aENRVU5WTEU4c1JVRkJVeXhKTEVWQlFVMDdRVUZEZUVJc1lVRkJUeXhYUVVGUUxFTkJRVzFDTEVWQlFVVXNUVUZCVFN4WFFVRlNMRVZCUVhGQ0xFMUJRVTBzUlVGQlJTeG5Ra0ZCUml4RlFVRlhMRlZCUVZnc1JVRkJNMElzUlVGQmJrSXNSVUZCYlVVc1UwRkJVeXhOUVVFMVJUdEJRVU5FT3pzN2NVTkJRMmxDTEVrc1JVRkJUVHRCUVVOMFFpeFZRVUZOTEU5QlFVOHNUMEZCVHl4UlFVRlFMRU5CUVdkQ0xFbEJRVGRDTzBGQlEwRXNWVUZCVFN4bFFVRmxMRXRCUVVzc1RVRkJUQ3hEUVVGWkxFTkJRVm9zUTBGQmNrSTdRVUZEUVN4VlFVRk5MR1ZCUVdVc1NVRkJTU3hsUVVGS0xFTkJRVzlDTEZsQlFYQkNMRU5CUVhKQ08wRkJRMEVzWVVGQlR5eGhRVUZoTEVkQlFXSXNRMEZCYVVJc1NVRkJha0lzUTBGQlVEdEJRVU5FT3pzN2IwTkJRMmRDTzBGQlEyWXNWVUZCVFN4VlFVRlZMRVZCUVdoQ08wRkJRMEVzVjBGQlN5eEpRVUZKTEVkQlFWUXNTVUZCWjBJc1MwRkJTeXhQUVVGeVFpeEZRVUU0UWp0QlFVTTFRaXhuUWtGQlVTeEpRVUZTTEVOQlFXZENMRWRCUVdoQ0xGTkJRWFZDTEV0QlFVc3NUMEZCVEN4RFFVRmhMRWRCUVdJc1EwRkJka0k3UVVGRFJEdEJRVU5FTEdGQlFVOHNVVUZCVVN4SlFVRlNMRU5CUVdFc1NVRkJZaXhEUVVGUU8wRkJRMFE3T3p0blEwRkRkMEk3UVVGQlFTeFZRVUZrTEVsQlFXTXNkVVZCUVZBc1MwRkJUenM3UVVGRGRrSXNWVUZCVFN4bFFVRmxMRVZCUVhKQ08wRkJRMEVzYlVKQlFXRXNTVUZCWWl4clFrRkJhVU1zUzBGQlN5eGhRVUZNTEVOQlFXMUNMRmRCUVc1Q0xFTkJRV3BETzBGQlEwRXNiVUpCUVdFc1NVRkJZaXhsUVVFNFFpeExRVUZMTEdGQlFVd3NRMEZCYlVJc1UwRkJia0lzUTBGQk9VSTdRVUZEUVN4VlFVRkpMRTlCUVU4c1NVRkJVQ3hEUVVGWkxFdEJRVXNzVDBGQmFrSXNSVUZCTUVJc1RVRkJNVUlzUjBGQmJVTXNRMEZCZGtNc1JVRkJNRU03UVVGRGVFTXNjVUpCUVdFc1NVRkJZaXhqUVVFMlFpeExRVUZMTEdGQlFVd3NSVUZCTjBJN1FVRkRSRHRCUVVORUxGVkJRVTBzVlVGQlZTeExRVUZMTEdGQlFVd3NRMEZCYlVJc1UwRkJia0lzUTBGQmFFSTdRVUZEUVN4VlFVRkpMRTlCUVVvc1JVRkJZVHRCUVVOWUxHZENRVUZSTEV0QlFWSXNRMEZCWXl4SlFVRmtMRVZCUVc5Q0xFOUJRWEJDTEVOQlFUUkNMRlZCUVVNc1NVRkJSQ3hGUVVGVk8wRkJRM0JETEhWQ1FVRmhMRWxCUVdJc1EwRkJhMElzU1VGQmJFSTdRVUZEUkN4VFFVWkVPMEZCUjBRN1FVRkRSQ3hWUVVGSkxGTkJRVk1zUzBGQllpeEZRVUZ2UWp0QlFVTnNRaXhsUVVGUExGbEJRVkE3UVVGRFJDeFBRVVpFTEUxQlJVOHNTVUZCU1N4VFFVRlRMRlZCUVdJc1JVRkJlVUk3UVVGRE9VSXNaVUZCVHl4aFFVRmhMRWRCUVdJc1EwRkJhVUk3UVVGQlFTd3JRa0ZCYjBJc1MwRkJTeXhUUVVGTUxFTkJRV1VzU1VGQlppeERRVUZ3UWp0QlFVRkJMRk5CUVdwQ0xFVkJRVFpFTEVsQlFUZEVMRU5CUVd0RkxFZEJRV3hGTEVOQlFWQTdRVUZEUkN4UFFVWk5MRTFCUlVFc1NVRkJTU3hUUVVGVExGRkJRV0lzUlVGQmRVSTdRVUZETlVJc1pVRkJUeXhoUVVGaExFZEJRV0lzUTBGQmFVSTdRVUZCUVN3NFFrRkJiVUlzU1VGQmJrSTdRVUZCUVN4VFFVRnFRaXhGUVVFMFF5eEpRVUUxUXl4RFFVRnBSQ3hKUVVGcVJDeERRVUZRTzBGQlEwUXNUMEZHVFN4TlFVVkJMRWxCUVVrc1UwRkJVeXhMUVVGaUxFVkJRVzlDTzBGQlEzcENMR1ZCUVU4c1lVRkJZU3hIUVVGaUxFTkJRV2xDTEZWQlFVTXNTVUZCUkN4RlFVRlZPMEZCUTJoRExHTkJRVTBzVlVGQlZTeExRVUZMTEV0QlFVd3NRMEZCVnl4SlFVRllMRU5CUVdoQ08wRkJRMEVzYVVKQlFWVXNVVUZCVVN4RFFVRlNMRVZCUVZjc1YwRkJXQ3hGUVVGV0xGVkJRWFZETEZGQlFWRXNRMEZCVWl4RFFVRjJRenRCUVVORUxGTkJTRTBzUlVGSFNpeEpRVWhKTEVOQlIwTXNUVUZJUkN4RFFVRlFPMEZCU1VRN1FVRkRSanRCUVVORU96czdPelpDUVVOVkxFY3NSVUZCU3p0QlFVTmlMRlZCUVUwc1YwRkJWeXhKUVVGSkxFZEJRVW9zUTBGQlVTeEhRVUZTTEVOQlFXcENPMEZCUTBFc1ZVRkJTU3hWUVVGVkxGTkJRVk1zVVVGQlZDeEhRVUYxUWl4VFFVRlRMRkZCUVdoRExGTkJRVFJETEZWQlFWVXNVMEZCVXl4UlFVRnVRaXhEUVVFMVF5eEhRVUUyUlN4SlFVRXpSanRCUVVOQkxGVkJRVWtzVDBGQlNpeEZRVUZoTzBGQlExZ3NXVUZCU1N4RFFVRkRMRkZCUVZFc1VVRkJVaXhEUVVGcFFpeFJRVUZxUWl4RFFVRk1MRVZCUVdsRE8wRkJReTlDTEN0Q1FVRnRRaXhMUVVGTExFOUJRVXdzUTBGQmJrSTdRVUZEUkR0QlFVTkdPMEZCUTBRc1ZVRkJUU3hsUVVGbExGTkJRVk1zU1VGQlZDeERRVUZqTEUxQlFXUXNRMEZCY1VJc1EwRkJja0lzUTBGQmNrSTdRVUZEUVN4VlFVRkpMRlZCUVZVc1JVRkJaRHRCUVVOQkxGVkJRVTBzWlVGQlpTeEpRVUZKTEdWQlFVb3NRMEZCYjBJc1dVRkJjRUlzUTBGQmNrSTdRVUZXWVR0QlFVRkJPMEZCUVVFN08wRkJRVUU3UVVGWFlpdzJRa0ZCWjBJc1dVRkJhRUlzT0VoQlFUaENPMEZCUVVFc1kwRkJja0lzUjBGQmNVSTdPMEZCUXpWQ0xHdENRVUZSTEVsQlFVa3NRMEZCU2l4RFFVRlNMRWxCUVd0Q0xFbEJRVWtzVFVGQlNpeExRVUZsTEVOQlFXWXNSMEZCYlVJc1NVRkJTU3hEUVVGS0xFTkJRVzVDTEVkQlFUUkNMRk5CUVRsRE8wRkJRMFE3UVVGaVdUdEJRVUZCTzBGQlFVRTdRVUZCUVR0QlFVRkJPMEZCUVVFN1FVRkJRVHRCUVVGQk8wRkJRVUU3UVVGQlFUdEJRVUZCTzBGQlFVRTdRVUZCUVR0QlFVRkJPenRCUVdOaUxGVkJRVTBzVDBGQlR5eFRRVUZUTEUxQlFWUXNSMEZCYTBJc1UwRkJVeXhSUVVGNFF6dEJRVU5CTEdGQlFVOHNSVUZCUXl4blFrRkJSQ3hGUVVGVkxGVkJRVllzUlVGQlowSXNaMEpCUVdoQ0xFVkJRVkE3UVVGRFJEczdPM05EUVVOclFpeFBMRVZCUVZNc1NTeEZRVUZOTEVrc1JVRkJUVHRCUVVOMFF5eFZRVUZKTEZkQlFWY3NVVUZCVVN4VlFVRlNMRU5CUVcxQ0xFOUJRVzVDTEVOQlFXWXNSVUZCTkVNN1FVRkRNVU1zWVVGQlN5eE5RVUZNTEVOQlFWa3NUMEZCV2l4RFFVRnZRaXhQUVVGd1FqdEJRVU5FTzBGQlEwUXNWVUZCVFN4WlFVRlpPMEZCUTJoQ0xHRkJRVXNzU1VGRVZ6dEJRVVZvUWl4cFFrRkJVenRCUVVOUUxHdENRVUZSTEUxQlJFUTdRVUZGVUN4dFFrRkJVenRCUVVOUUxEUkNRVUZuUWp0QlFVUlVMRmRCUmtZN1FVRkxVQ3huUWtGQlRTeExRVUZMTEZOQlFVd3NRMEZCWlN4SlFVRm1PMEZCVEVNN1FVRkdUeXhQUVVGc1FqdEJRVlZCTEZWQlFVa3NWMEZCVnl4UlFVRlJMRlZCUVZJc1EwRkJiVUlzVDBGQmJrSXNRMEZCWml4RlFVRTBRenRCUVVNeFF5eHJRa0ZCVlN4UFFVRldMRU5CUVd0Q0xFOUJRV3hDTEVOQlFUQkNMR1ZCUVRGQ0xFbEJRVFpETEU5QlFUZERPMEZCUTBRN1FVRkRSQ3hoUVVGUExGTkJRVkE3UVVGRFJEdEJRVU5FT3pzN095dENRVU5aTEU4c1JVRkJVeXhQTEVWQlFWTTdRVUZETlVJc1ZVRkJTU3hQUVVGUE8wRkJRMVFzYVVKQlFWTXNTMEZFUVR0QlFVVlVMR2RDUVVGUkxHdENRVVpETzBGQlIxUXNXVUZCU1N4RFFVaExPMEZCU1ZRc1owSkJRVkU3UVVGS1F5eFBRVUZZT3p0QlFVUTBRaXh6UWtGUFNpeExRVUZMTEZGQlFVd3NRMEZCWXl4UFFVRmtMRU5CVUVrN1FVRkJRU3hWUVU5eVFpeFBRVkJ4UWl4aFFVOXlRaXhQUVZCeFFqdEJRVUZCTEZWQlQxb3NTVUZRV1N4aFFVOWFMRWxCVUZrN08wRkJVVFZDTEZkQlFVc3NaMEpCUVV3c1EwRkJjMElzV1VGQmRFSXNSVUZCYjBNc1MwRkJTeXhwUWtGQlRDeERRVUYxUWl4UFFVRjJRaXhGUVVGblF5eEpRVUZvUXl4RlFVRnpReXhKUVVGMFF5eERRVUZ3UXl4RlFVRnBSaXhWUVVGRExFOUJRVVFzUlVGQllUdEJRVU0xUml4WlFVRkpMRTlCUVVvc1JVRkJZVHRCUVVOWUxHdENRVUZSTEZOQlFWSXNhVU5CUVdsRExFOUJRV3BETzBGQlEwUXNVMEZHUkN4TlFVVlBPMEZCUTB3c2EwSkJRVkVzVTBGQlVpeEhRVUZ2UWl4cFFrRkJjRUk3UVVGRFJEdEJRVU5HTEU5QlRrUTdRVUZQUkRzN096WkNRVU5UTEVrc1JVRkJUVHRCUVVOa0xGVkJRVTBzVVVGQlVTeFRRVUZUTEdGQlFWUXNRMEZCZFVJc1ZVRkJka0lzUTBGQlpEdEJRVU5CTEdWQlFWTXNTVUZCVkN4RFFVRmpMRmRCUVdRc1EwRkJNRUlzUzBGQk1VSTdRVUZEUVN4WlFVRk5MRXRCUVU0c1IwRkJZeXhKUVVGa08wRkJRMEVzV1VGQlRTeExRVUZPTzBGQlEwRXNXVUZCVFN4TlFVRk9PMEZCUTBFc1ZVRkJUU3hUUVVGVExGTkJRVk1zVjBGQlZDeERRVUZ4UWl4TlFVRnlRaXhEUVVGbU8wRkJRMEVzV1VGQlRTeE5RVUZPTzBGQlEwRXNWVUZCU1N4TlFVRktMRVZCUVZrN1FVRkRWaXhoUVVGTExGTkJRVXdzUTBGQlpTeFBRVUZtTEVWQlFYZENMRk5CUVhoQ08wRkJRMFFzVDBGR1JDeE5RVVZQTzBGQlEwd3NZVUZCU3l4VFFVRk1MRU5CUVdVc1ZVRkJaaXhGUVVFeVFpeFRRVUV6UWp0QlFVTkVPMEZCUTBZN1FVRkRSRHM3T3p0dFEwRkRaMElzVHl4RlFVRlRPMEZCUVVFN08wRkJRM1pDTEZkQlFVc3NaMEpCUVV3c1EwRkJjMElzV1VGQmRFSXNSVUZCYjBNc1QwRkJjRU1zUlVGQk5rTXNWVUZCUXl4TFFVRkVMRVZCUVZjN1FVRkJSU3hqUVVGTExFOUJRVXdzUjBGQlpTeExRVUZtTzBGQlFYTkNMRTlCUVdoR08wRkJRMFE3T3p0cFEwRkRZU3hQTEVWQlFWTXNaMElzUlVGQmEwSTdRVUZCUVRzN1FVRkJRU3gxUWtGRFRpeExRVUZMTEZGQlFVd3NRMEZCWXl4UFFVRmtMRU5CUkUwN1FVRkJRU3hWUVVOb1F5eFBRVVJuUXl4alFVTm9ReXhQUVVSblF6dEJRVUZCTEZWQlEzWkNMRWxCUkhWQ0xHTkJRM1pDTEVsQlJIVkNPMEZCUVVFc1ZVRkRha0lzVDBGRWFVSXNZMEZEYWtJc1QwRkVhVUk3TzBGQlJYWkRMSFZDUVVGcFFpeFBRVUZxUWl4RFFVRjVRaXhWUVVGRExFbEJRVVFzUlVGQlZUdEJRVU5xUXl4WlFVRk5MRlZCUVZVN1FVRkRaQ3h0UWtGQlV5eExRVVJMTzBGQlJXUXNhMEpCUVZFc1kwRkdUVHRCUVVka0xHTkJRVWtzU1VGQlNTeEpRVUZLTEVkQlFWY3NUMEZCV0N4RlFVaFZPMEZCU1dRc2EwSkJRVkVzUTBGRFRpeERRVUZETEV0QlFVc3NTVUZCVGl4RFFVUk5MRVZCUTA4N1FVRkRXQ3hwUWtGQlN5eExRVUZMTEVsQlJFTTdRVUZGV0N4dlFrRkJVU3hQUVVGTExGTkJRVXc3UVVGR1J5eFhRVVJRTzBGQlNrMHNVMEZCYUVJN1FVRlhRU3haUVVGTkxGZEJRVmNzVDBGQlN5eGhRVUZNTEVOQlFXMUNMRlZCUVc1Q0xFTkJRV3BDTzBGQlEwRXNXVUZCVFN4WlFVRlpMRkZCUVZFc1RVRkJVaXhEUVVGbExFTkJRV1lzUTBGQmJFSTdRVUZEUVN4WlFVRk5MRTFCUVUwc1QwRkJTeXhoUVVGTUxFTkJRVzFDTEdOQlFXNUNMRU5CUVZvN1FVRkRRU3haUVVGSkxFZEJRVW9zUlVGQlV6dEJRVU5RTEc5Q1FVRlZMRXRCUVZZc1NVRkJiVUlzUjBGQmJrSTdRVUZEUkR0QlFVTkVMRmxCUVVrc1VVRkJTaXhGUVVGak8wRkJRMW9zYjBKQlFWVXNWVUZCVml4aFFVRXJRaXhMUVVGTExFZEJRWEJETzBGQlEwUTdRVUZEUkN4WlFVRkpMRTlCUVVvc1JVRkJZVHRCUVVOWUxHVkJRVXNzU1VGQlNTeEhRVUZVTEVsQlFXZENMRTlCUVdoQ0xFVkJRWGxDTzBGQlEzWkNMSE5DUVVGVkxFZEJRVllzU1VGQmFVSXNVVUZCVVN4SFFVRlNMRU5CUVdwQ08wRkJRMFE3UVVGRFJqdEJRVU5FTEdWQlFVc3NaMEpCUVV3c1EwRkJjMElzVTBGQmRFSXNSVUZCYVVNc1QwRkJTeXhwUWtGQlRDeERRVUYxUWl4UFFVRjJRaXhGUVVGblF5eEpRVUZvUXl4RlFVRnpReXhQUVVGMFF5eERRVUZxUXl4RlFVRnBSaXhWUVVGRExFOUJRVVFzUlVGQllUdEJRVU0xUml4alFVRkpMRTlCUVVvc1JVRkJZVHRCUVVOWUxHMUNRVUZMTEZOQlFVd3NRMEZCWlN4alFVRm1MRVZCUVN0Q0xGTkJRUzlDTzBGQlEwUXNWMEZHUkN4TlFVVlBPMEZCUTB3c2JVSkJRVXNzVTBGQlRDeERRVUZsTEc5Q1FVRm1MRVZCUVhGRExGTkJRWEpETzBGQlEwUTdRVUZEUml4VFFVNUVPMEZCVDBRc1QwRnFRMFE3UVVGclEwUTdPenRwUTBGRFlTeG5RaXhGUVVGclFqdEJRVUZCT3p0QlFVTTVRaXhWUVVGTkxHTkJRV01zUlVGQmNFSTdRVUZEUVN4VlFVRk5MRmRCUVZjc1JVRkJha0k3UVVGRFFTeFZRVUZOTEZOQlFWTXNSVUZCWmp0QlFVTkJMRlZCUVUwc2EwSkJRV3RDTEVWQlFYaENPMEZCUTBFc1ZVRkJUU3haUVVGWkxHZERRVUZzUWp0QlFVTkJMSFZDUVVGcFFpeFBRVUZxUWl4RFFVRjVRaXhWUVVGRExFbEJRVVFzUlVGQlZUdEJRVU5xUXl4WlFVRkpMRzFGUVVGcFJTeExRVUZMTEZOQlFVd3NRMEZCWlN4TFFVRkxMRWxCUVhCQ0xFTkJRV3BGTEZOQlFUaEdMRTlCUVVzc1UwRkJUQ3hEUVVGbExGVkJRV1lzUTBGQk9VWXNVMEZCTkVnc1MwRkJTeXhUUVVGTUxFTkJRV1VzUzBGQlN5eEpRVUZ3UWl4RFFVRm9TVHRCUVVOQkxGbEJRVWtzV1VGQldTeERRVUZETEV0QlFVc3NTVUZCVGl4RlFVRlpMRTlCUVVzc1UwRkJUQ3hEUVVGbExGRkJRV1lzUTBGQldpeFpRVUU0UXl4TFFVRkxMRWxCUVc1RUxFVkJRVEpFTEVsQlFUTkVMRU5CUVdkRkxFbEJRV2hGTEVOQlFXaENPMEZCUTBFc1dVRkJUU3hYUVVGWExFOUJRVXNzWVVGQlRDeERRVUZ0UWl4VlFVRnVRaXhEUVVGcVFqdEJRVU5CTEZsQlFVa3NVVUZCU2l4RlFVRmpPMEZCUTFvc0swTkJRVzFETEV0QlFVc3NSMEZCZUVNN1FVRkRRU3d3UTBGQk9FSXNTMEZCU3l4SFFVRnVRenRCUVVORU8wRkJRMFFzYjBKQlFWa3NTVUZCV2l4RFFVRnBRaXhaUVVGcVFqdEJRVU5CTEdsQ1FVRlRMRWxCUVZRc1EwRkJZeXhUUVVGa08wRkJRMEVzV1VGQlRTeFZRVUZWTEVOQlFVTXNSMEZCUkN4RlFVRk5MRXRCUVVzc1NVRkJXQ3hGUVVGcFFpeFBRVUZMTEZOQlFVd3NRMEZCWlN4TFFVRm1MRU5CUVdwQ0xFVkJRWGRETEVkQlFYaERMRVZCUVRaRExFbEJRVGRETEVOQlFXdEVMRTFCUVd4RUxFTkJRV2hDTzBGQlEwRXNaVUZCVHl4SlFVRlFMRU5CUVZrc1QwRkJXanRCUVVOQkxIZENRVUZuUWl4SlFVRm9RaXhEUVVGeFFpeExRVUZMTEVsQlFURkNPMEZCUTBRc1QwRmlSRHRCUVdOQkxHVkJRVk1zWVVGQlZDeERRVUYxUWl4alFVRjJRaXhGUVVGMVF5eExRVUYyUXl4UlFVRnJSQ3haUVVGWkxFbEJRVm9zUTBGQmFVSXNTVUZCYWtJc1EwRkJiRVE3UVVGRFFTeGxRVUZUTEdGQlFWUXNRMEZCZFVJc1YwRkJka0lzUlVGQmIwTXNTVUZCY0VNc1VVRkJPRU1zVTBGQk9VTXNSMEZCTUVRc2JVSkJRVzFDTEZOQlFWTXNTVUZCVkN4RFFVRmpMRWxCUVdRc1EwRkJia0lzUTBGQk1VUTdRVUZEUVN4bFFVRlRMR0ZCUVZRc1EwRkJkVUlzVTBGQmRrSXNSVUZCYTBNc1NVRkJiRU1zVVVGQk5FTXNVMEZCTlVNc1IwRkJkMFFzYlVKQlFXMUNMRTlCUVU4c1NVRkJVQ3hEUVVGWkxFMUJRVm9zU1VGQmMwSXNUVUZCZWtNc1EwRkJlRVE3UVVGRFFTeGxRVUZUTEdGQlFWUXNRMEZCZFVJc2EwSkJRWFpDTEVWQlFUSkRMRWxCUVRORExGRkJRWEZFTEZOQlFYSkVMRWRCUVdsRkxHMUNRVUZ0UWl4blFrRkJaMElzU1VGQmFFSXNRMEZCY1VJc1NVRkJja0lzUTBGQmJrSXNRMEZCYWtVN1FVRkRRU3hsUVVGVExHRkJRVlFzUTBGQmRVSXNjMEpCUVhaQ0xFVkJRU3RETEU5QlFTOURMRU5CUVhWRUxFbEJRWFpFTEVkQlFUaEVMR2RDUVVGblFpeEpRVUZvUWl4RFFVRnhRaXhKUVVGeVFpeERRVUU1UkR0QlFVTkVPenM3T3pzN2EwSkJSMWtzU1VGQlNTeEpRVUZLTEVVN096czdPenM3T3pzN08wRkRjRTVtT3pzN096czdPenRKUVVWTkxGVTdRVUZEU2l4elFrRkJZU3hoUVVGaUxFVkJRVFJDTzBGQlFVRTdPMEZCUXpGQ0xGTkJRVXNzWVVGQlRDeEhRVUZ4UWl4aFFVRnlRanRCUVVOQkxGTkJRVXNzWjBKQlFVd3NSMEZCZDBJc1JVRkJlRUk3UVVGRFFTeFRRVUZMTEdGQlFVd3NSMEZCY1VJc1EwRkJja0k3UVVGRFFTeFRRVUZMTEdOQlFVd3NSMEZCYzBJc1EwRkJkRUk3UVVGRFFTeFRRVUZMTEU5QlFVd3NSMEZCWlN4RlFVRm1PMEZCUTBFc1UwRkJTeXhMUVVGTUxFZEJRV0VzUlVGQllqdEJRVU5FT3pzN096UkNRVU0wUWp0QlFVRkJMRlZCUVhSQ0xGRkJRWE5DTEhWRlFVRllMRWRCUVZjN1FVRkJRU3hWUVVGT0xFbEJRVTA3TzBGQlF6TkNMRmRCUVVzc1VVRkJUQ3hIUVVGblFpeFJRVUZvUWp0QlFVTkJMRmRCUVVzc1NVRkJUQ3hIUVVGWkxFbEJRVm83UVVGRFFTeFhRVUZMTEdGQlFVd3NSMEZCY1VJc1NVRkJTU3hKUVVGS0xFZEJRVmNzVDBGQldDeEZRVUZ5UWp0QlFVTkJMRmRCUVVzc1YwRkJUQ3hEUVVGcFFpeExRVUZMTEdGQlFYUkNPMEZCUTBRN096czBRa0ZEVVR0QlFVTlFMRmRCUVVzc1owSkJRVXdzUjBGQmQwSXNSVUZCZUVJN1FVRkRRU3hYUVVGTExHRkJRVXdzUjBGQmNVSXNRMEZCY2tJN1FVRkRRU3hYUVVGTExFOUJRVXdzUjBGQlpTeEZRVUZtTzBGQlEwRXNWMEZCU3l4TFFVRk1MRWRCUVdFc1JVRkJZanRCUVVOQkxGZEJRVXNzWTBGQlRDeEhRVUZ6UWl4RFFVRjBRanRCUVVORU96czdPRUpCUTFVc1NTeEZRVUZOTzBGQlEyWXNWMEZCU3l4UFFVRk1MRU5CUVdFc1NVRkJZaXhEUVVGclFpeEpRVUZzUWp0QlFVTkVPenM3TkVKQlExRXNTU3hGUVVGTk8wRkJRMklzVjBGQlN5eExRVUZNTEVOQlFWY3NTMEZCU3l4TFFVRm9RaXhKUVVGNVFpeEpRVUY2UWp0QlFVTkVPenM3WjBOQlExa3NUU3hGUVVGUk8wRkJRVUU3TzBGQlEyNUNMRlZCUVVrc1YwRkJWeXhMUVVGTExHRkJRWEJDTEVWQlFXMURPMEZCUTJwRE8wRkJRMFE3UVVGRFJDeFZRVUZKTEV0QlFVc3NUMEZCVEN4RFFVRmhMRTFCUVdJc1MwRkJkMElzUTBGQk5VSXNSVUZCSzBJN1FVRkROMElzWVVGQlN5eGpRVUZNTzBGQlEwRXNkVUpCUVVzc1UwRkJUQ3d3UkVGQk9FSXNTMEZCU3l4alFVRnVReXhWUVVGeFJDeExRVUZMTEdOQlFVd3NSMEZCYzBJc1MwRkJTeXhQUVVGTUxFTkJRV0VzVFVGQmJrTXNSMEZCTkVNc1EwRkJha2NzUjBGQmMwY3NVMEZCZEVjN1FVRkRRU3haUVVGTkxFMUJRVTBzUzBGQlN5eFBRVUZNTEVOQlFXRXNSMEZCWWl4RlFVRmFPMEZCUTBFc1lVRkJTeXhoUVVGTUxFTkJRVzFDTEUxQlFXNUNMRU5CUVRCQ0xFZEJRVEZDTEVkQlFXZERMRWRCUVdoRE8wRkJRMEVzYlVKQlFWTXNUMEZCVHl4UlFVRlFMRU5CUVdkQ0xFMUJRWHBDTEVkQlFXdERMRXRCUVVzc1lVRkJUQ3hEUVVGdFFpeEhRVUZ5UkN4SFFVRXlSQ3hsUVVGTExHMUNRVUZNTEVOQlFYbENMRXRCUVVzc1lVRkJUQ3hEUVVGdFFpeE5RVUUxUXl4RFFVRXpSQ3hGUVVGclNDeExRVUZMTEdGQlFVd3NRMEZCYlVJc1QwRkJja2tzUlVGQk9Fa3NTVUZCT1Vrc1EwRkJiVW9zVlVGQlF5eFJRVUZFTEVWQlFXTTdRVUZETDBvc1kwRkJTU3hUUVVGVExFVkJRV0lzUlVGQmFVSTdRVUZEWml4eFFrRkJVeXhKUVVGVUxFZEJRV2RDTEVsQlFXaENMRU5CUVhGQ0xGVkJRVU1zU1VGQlJDeEZRVUZWTzBGQlF6ZENMSGxDUVVGWE8wRkJRVUVzZFVKQlFVMHNUVUZCU3l4WFFVRk1MRU5CUVdsQ0xFMUJRV3BDTEVOQlFVNDdRVUZCUVN4bFFVRllMRVZCUVRKRExFMUJRVXNzVVVGQmFFUTdRVUZEUVN4clFrRkJTU3hMUVVGTExFdEJRVXdzUzBGQlpTeERRVUZ1UWl4RlFVRnpRanRCUVVOd1Fpd3JRa0ZCU3l4VFFVRk1MRU5CUVdVc1RVRkJaaXhGUVVGMVFpeFRRVUYyUWp0QlFVTkJMSGRDUVVGUkxFZEJRVklzUTBGQldTeEpRVUZhTzBGQlEwRTdRVUZEUkR0QlFVTkVMRzFDUVVGTExFbEJRVXdzUTBGQlZTeFBRVUZXTEVOQlFXdENMRlZCUVVNc1NVRkJSQ3hGUVVGVk8wRkJRekZDTEc5Q1FVRkpMRXRCUVVzc1MwRkJWQ3hGUVVGblFqdEJRVU5rTEhkQ1FVRkxMRTlCUVV3c1EwRkJZU3hKUVVGaUxFTkJRV3RDTEV0QlFVc3NTVUZCZGtJN1FVRkRSQ3hwUWtGR1JDeE5RVVZQTzBGQlEwd3NkMEpCUVVzc1MwRkJUQ3hEUVVGWExFdEJRVXNzUzBGQmFFSXNTVUZCZVVJc1NVRkJla0k3UVVGRFJEdEJRVU5HTEdWQlRrUTdRVUZQUkN4aFFXUkVPMEZCWlVRc1YwRm9Ra1FzVFVGblFrODdRVUZEVEN4dlFrRkJVU3hIUVVGU0xFTkJRVmtzVVVGQldqdEJRVU5FTzBGQlEwWXNVMEZ3UWtRc1JVRnZRa2NzUzBGd1FrZ3NRMEZ2UWxNc1ZVRkJReXhIUVVGRUxFVkJRVk03UVVGRGFFSXNlVUpCUVVzc1UwRkJUQ3hEUVVGbExGRkJRV1lzUlVGQmVVSXNVMEZCZWtJN1FVRkRRU3hyUWtGQlVTeEhRVUZTTEVOQlFWa3NSMEZCV2p0QlFVTkJMSEZDUVVGWE8wRkJRVUVzYlVKQlFVMHNUVUZCU3l4WFFVRk1MRU5CUVdsQ0xFMUJRV3BDTEVOQlFVNDdRVUZCUVN4WFFVRllMRVZCUVRKRExFMUJRVXNzVVVGQmFFUTdRVUZEUkN4VFFYaENSRHRCUVhsQ1JDeFBRVGxDUkN4TlFUaENUeXhKUVVGSkxFdEJRVXNzUzBGQlRDeERRVUZYTEUxQlFWZ3NTMEZCYzBJc1EwRkJNVUlzUlVGQk5rSTdRVUZEYkVNc2RVSkJRVXNzVTBGQlRDeERRVUZsTEdGQlFXWXNSVUZCT0VJc1UwRkJPVUk3UVVGRFFTeGhRVUZMTEZGQlFVd3NRMEZCWXl4TFFVRkxMRXRCUVc1Q0xFVkJRVEJDTEVsQlFURkNMRU5CUVN0Q0xGbEJRVTA3UVVGRGJrTXNaMEpCUVVzc1NVRkJUQ3hEUVVGVkxFMUJRVXNzWjBKQlFXWTdRVUZEUkN4VFFVWkVPMEZCUjBRc1QwRk1UU3hOUVV0Qk8wRkJRMHdzZFVKQlFVc3NVMEZCVEN4RFFVRmxMR0ZCUVdZc1JVRkJPRUlzVTBGQk9VSTdRVUZEUVN4aFFVRkxMRXRCUVV3N1FVRkRSRHRCUVVOR096czdOa0pCUlZNc1N5eEZRVUZQTzBGQlEyWXNXVUZCVFN4SlFVRkpMRXRCUVVvc1EwRkJWU3gzUTBGQlZpeERRVUZPTzBGQlEwUTdPenM3T3p0clFrRkhXU3hWT3pzN096czdPenM3T3p0QlEyaEdaanM3T3pzN096czdPenM3T3pzN1NVRkZUU3hMT3pzN1FVRkRTaXh0UWtGQlpUdEJRVUZCT3p0QlFVRkJPenRCUVVWaUxGVkJRVXNzVlVGQlRDeEhRVUZyUWl4RFFVRkRMRVZCUVVNc1RVRkJUU3hYUVVGUUxFVkJRVzlDTEV0QlFVc3NLMEpCUVhwQ0xFVkJRVVFzUTBGQmJFSTdRVUZEUVN4VlFVRkxMR2RDUVVGTUxFZEJRWGRDTEN0RVFVRjRRanRCUVVOQkxGVkJRVXNzWTBGQlRDeEhRVUZ6UWl4cFEwRkJkRUk3UVVGRFFTeFZRVUZMTEdsQ1FVRk1MRWRCUVhsQ08wRkJRM1pDTEdWQlFWTXNUVUZCU3l4VlFVUlRPMEZCUlhaQ0xHdENRVUZaTEV0QlJsYzdRVUZIZGtJc1owSkJRVlVzUzBGSVlUdEJRVWwyUWl4WlFVRk5MRU5CU21sQ08wRkJTM1pDTEdkQ1FVRlZMRWRCVEdFN1FVRk5ka0lzYjBKQlFXTXNSVUZPVXp0QlFVOTJRaXhwUWtGQlZ5eE5RVUZMTEdkQ1FWQlBPMEZCVVhaQ0xHVkJRVk1zVFVGQlN5eGpRVkpUTzBGQlUzWkNMR1ZCUVZNN1FVRlVZeXhMUVVGNlFqdEJRVmRCTEZWQlFVc3NWVUZCVEN4SFFVRnJRaXhGUVVGc1FqdEJRVU5CTEZWQlFVc3NSVUZCVEN4RFFVRlJMR2RDUVVGU0xFVkJRVEJDTEUxQlFVc3NTVUZCVEN4RFFVRlZMRWxCUVZZc1QwRkJNVUk3UVVGRFFTeFZRVUZMTEVWQlFVd3NRMEZCVVN4bFFVRlNMRVZCUVhsQ0xFMUJRVXNzUjBGQlRDeERRVUZUTEVsQlFWUXNUMEZCZWtJN1FVRkRRU3hWUVVGTExFVkJRVXdzUTBGQlVTeHBRa0ZCVWl4RlFVRXlRaXhOUVVGTExFdEJRVXdzUTBGQlZ5eEpRVUZZTEU5QlFUTkNPMEZCYmtKaE8wRkJiMEprT3pzN096SkNRVU5QTzBGQlFVRTdPMEZCUTA0c1lVRkJUeXhQUVVGUUxFTkJRV1VzU1VGQlppeERRVUZ2UWl4SFFVRndRaXhEUVVGM1FpeEpRVUY0UWl4RlFVRTRRaXhWUVVGRExFdEJRVVFzUlVGQlZ6dEJRVUZCTEcxRFFVTTVRaXhIUVVRNFFqdEJRVVZ5UXl4cFFrRkJUeXhQUVVGUUxFTkJRV1VzUzBGQlppeERRVUZ4UWl4SFFVRnlRaXhEUVVGNVFpeEZRVUZETEV0QlFVc3NUVUZCVFN4SFFVRk9MRU5CUVU0c1JVRkJla0lzUlVGQk5FTXNXVUZCVFR0QlFVTm9SQ3h2UWtGQlVTeEhRVUZTTEVOQlFWa3NaME5CUVZvc1JVRkJPRU1zUjBGQk9VTXNSVUZCYlVRc1RVRkJUU3hIUVVGT0xFTkJRVzVFTzBGQlEwUXNWMEZHUkR0QlFVWnhRenM3UVVGRGRrTXNZVUZCU3l4SlFVRkpMRWRCUVZRc1NVRkJaMElzUzBGQmFFSXNSVUZCZFVJN1FVRkJRU3huUWtGQlpDeEhRVUZqTzBGQlNYUkNPMEZCUTBZc1QwRk9SRHRCUVU5QkxHRkJRVThzVDBGQlVDeERRVUZsTEV0QlFXWXNRMEZCY1VJc1IwRkJja0lzUTBGQmVVSXNTVUZCZWtJc1JVRkJLMElzVlVGQlF5eExRVUZFTEVWQlFWYzdRVUZEZUVNc1pVRkJTeXhWUVVGTUxFZEJRV3RDTEU5QlFVOHNUVUZCVUN4RFFVRmpMRVZCUVdRc1JVRkJhMElzVDBGQlN5eHBRa0ZCZGtJc1JVRkJNRU1zUzBGQk1VTXNRMEZCYkVJN1FVRkRRU3hsUVVGTExFOUJRVXdzUTBGQllTeFpRVUZpTEVWQlFUSkNMRTlCUVVzc1ZVRkJhRU03UVVGRFJDeFBRVWhFTzBGQlNVUTdPenR2UTBGRE1FSTdRVUZCUVN4VlFVRmFMRWRCUVZrc2RVVkJRVTRzU1VGQlRUczdRVUZEZWtJc1ZVRkJTU3hIUVVGS0xFVkJRVk03UVVGRFVDeGxRVUZQTEV0QlFVc3NWVUZCVEN4RFFVRm5RaXhIUVVGb1FpeERRVUZRTzBGQlEwUXNUMEZHUkN4TlFVVlBPMEZCUTB3c1pVRkJUeXhMUVVGTExGVkJRVm83UVVGRFJEdEJRVU5HT3pzN2QwSkJRMGtzVlN4RlFVRlpPMEZCUTJZc1YwRkJTeXhWUVVGTUxFZEJRV3RDTEZWQlFXeENPMEZCUTBFc1YwRkJTeXhKUVVGTUxFTkJRVlVzVlVGQlZqdEJRVU5CTEZkQlFVc3NUMEZCVEN4RFFVRmhMRmxCUVdJc1JVRkJNa0lzVlVGQk0wSTdRVUZEUkRzN08zbENRVU5MTEZVc1JVRkJXVHRCUVVGQkxHMURRVU5RTEVkQlJFODdRVUZGWkN4bFFVRlBMRTlCUVZBc1EwRkJaU3hMUVVGbUxFTkJRWEZDTEVkQlFYSkNMSEZDUVVFeVFpeEhRVUV6UWl4RlFVRnBReXhYUVVGWExFZEJRVmdzUTBGQmFrTXNSMEZCYlVRc1dVRkJUVHRCUVVOMlJDeHJRa0ZCVVN4SFFVRlNMRU5CUVZrc01FSkJRVm9zUlVGQmQwTXNSMEZCZUVNc1JVRkJOa01zVjBGQlZ5eEhRVUZZTEVOQlFUZERPMEZCUTBRc1UwRkdSRHRCUVVkQkxGbEJRVWtzVjBGQlZ5eFpRVUZZTEUxQlFUWkNMRWxCUVdwRExFVkJRWFZETzBGQlEzSkRMR2xDUVVGUExFOUJRVkFzUTBGQlpTeEpRVUZtTEVOQlFXOUNMRWRCUVhCQ0xIRkNRVUV3UWl4SFFVRXhRaXhGUVVGblF5eFhRVUZYTEVkQlFWZ3NRMEZCYUVNc1IwRkJhMFFzV1VGQlRUdEJRVU4wUkN4dlFrRkJVU3hIUVVGU0xFTkJRVmtzZVVKQlFWb3NSVUZCZFVNc1IwRkJka01zUlVGQk5FTXNWMEZCVnl4SFFVRllMRU5CUVRWRE8wRkJRMFFzVjBGR1JEdEJRVWRFTzBGQlZHRTdPMEZCUTJoQ0xGZEJRVXNzU1VGQlNTeEhRVUZVTEVsQlFXZENMRlZCUVdoQ0xFVkJRVFJDTzBGQlFVRXNaVUZCYmtJc1IwRkJiVUk3UVVGVE0wSTdRVUZEUmpzN096UkNRVU5STzBGQlExQXNZVUZCVHl4UFFVRlFMRU5CUVdVc1NVRkJaaXhEUVVGdlFpeExRVUZ3UWp0QlFVTkJMR0ZCUVU4c1QwRkJVQ3hEUVVGbExFdEJRV1lzUTBGQmNVSXNTMEZCY2tJN1FVRkRRU3hYUVVGTExGVkJRVXdzUjBGQmEwSXNTMEZCU3l4cFFrRkJka0k3UVVGRFFTeFhRVUZMTEU5QlFVd3NRMEZCWVN4WlFVRmlMRVZCUVRKQ0xFdEJRVXNzVlVGQmFFTTdRVUZEUkRzN096czdPMnRDUVVkWkxFbEJRVWtzUzBGQlNpeEZPenM3T3pzN096czdPenRCUTNKRlpqczdPenRCUVVOQk96czdPenM3T3p0SlFVVk5MRVU3UVVGRFNpeG5Ra0ZCWlR0QlFVRkJPenRCUVVGQk96dEJRVU5pTEZOQlFVc3NUMEZCVEN4SFFVRmxMRTlCUVdZN1FVRkRRU3hUUVVGTExGVkJRVXdzUjBGQmEwSXNXVUZCYkVJN1FVRkRRU3h2UWtGQlRTeEZRVUZPTEVOQlFWTXNXVUZCVkN4RlFVRjFRaXhWUVVGRExGVkJRVVFzUlVGQlowSTdRVUZEY2tNc1dVRkJTeXhoUVVGTUxFTkJRVzFDTEZWQlFXNUNPMEZCUTBFc1dVRkJTeXhWUVVGTUxFTkJRV2RDTEZWQlFXaENPMEZCUTBRc1MwRklSRHRCUVVsRU96czdPekpDUVVOUE8wRkJRMDRzVjBGQlN5eFpRVUZNTzBGQlEwRXNWMEZCU3l4aFFVRk1PMEZCUTBFc2MwSkJRVTBzVDBGQlRpeERRVUZqTEdkQ1FVRmtPMEZCUTBRN1FVRkRSRHM3T3pzMFFrRkRVeXhQTEVWQlFWTXNVU3hGUVVGVk8wRkJRekZDTEZWQlFVMHNjV3RDUVVGT08wRkJZVUVzWTBGQlVTeHJRa0ZCVWl4RFFVRXlRaXhSUVVFelFpeEZRVUZ4UXl4SlFVRnlRenRCUVVOQkxGVkJRVTBzWVVGQllTeFRRVUZUTEdGQlFWUXNRMEZCZFVJc1lVRkJka0lzUTBGQmJrSTdRVUZEUVN4cFFrRkJWeXhuUWtGQldDeERRVUUwUWl4WlFVRTFRaXhGUVVFd1F5eFpRVUZOTzBGQlF6bERMRzFDUVVGWExGTkJRVmdzUTBGQmNVSXNSMEZCY2tJc1EwRkJlVUlzWVVGQmVrSTdRVUZEUkN4UFFVWkVPMEZCUjBFc2FVSkJRVmNzWjBKQlFWZ3NRMEZCTkVJc1dVRkJOVUlzUlVGQk1FTXNXVUZCVFR0QlFVTTVReXh0UWtGQlZ5eFRRVUZZTEVOQlFYRkNMRTFCUVhKQ0xFTkJRVFJDTEdGQlFUVkNPMEZCUTBRc1QwRkdSRHRCUVVkQkxGVkJRVTBzWjBKQlFXZENMRk5CUVZNc1lVRkJWQ3hEUVVGMVFpeG5Ra0ZCZGtJc1EwRkJkRUk3UVVGRFFTeFZRVUZOTEdOQlFXTXNVMEZCVXl4aFFVRlVMRU5CUVhWQ0xHTkJRWFpDTEVOQlFYQkNPMEZCUTBFc2IwSkJRV01zWjBKQlFXUXNRMEZCSzBJc1QwRkJMMElzUlVGQmQwTXNXVUZCVFR0QlFVTTFReXh2UWtGQldTeFRRVUZhTEVOQlFYTkNMRWRCUVhSQ0xFTkJRVEJDTEZGQlFURkNPMEZCUTBRc1QwRkdSRHRCUVVkRU96czdaME5CUTFrN1FVRkRXQ3hsUVVGVExHZENRVUZVTEVOQlFUQkNMR0ZCUVRGQ0xFVkJRWGxETEU5QlFYcERMRU5CUVdsRUxGVkJRVU1zUjBGQlJDeEZRVUZUTzBGQlEzaEVMRmxCUVVrc1RVRkJTanRCUVVORUxFOUJSa1E3UVVGSFJEczdPeXRDUVVOWExGVXNSVUZCV1R0QlFVTjBRaXhYUVVGTExGTkJRVXc3UVVGRWMwSXNWVUZGWkN4UFFVWmpMRWRCUlVZc1ZVRkdSU3hEUVVWa0xFOUJSbU03TzBGQlIzUkNMRlZCUVVrc1lVRkJZU3hGUVVGcVFqdEJRVU5CTEdOQlFWRXNUMEZCVWl4RFFVRm5RaXhWUVVGRExFZEJRVVFzUlVGQlV6dEJRVU4yUWl4WlFVRk5MSE5HUVVGdlJpeEpRVUZKTEVkQlFYaEdMRk5CUVN0R0xFbEJRVWtzU1VGQmJrY3NVMEZCVGp0QlFVTkJMSE5DUVVGakxFMUJRV1E3UVVGRFJDeFBRVWhFTzBGQlNVRXNaVUZCVXl4aFFVRlVMRU5CUVhWQ0xGbEJRWFpDTEVWQlFYRkRMR3RDUVVGeVF5eERRVUYzUkN4WlFVRjRSQ3hGUVVGelJTeFZRVUYwUlR0QlFVTkVPenM3YjBOQlEyZENPMEZCUVVFN08wRkJRMllzVlVGQlRTdzBjRU5CUVU0N1FVRnZRa0VzWlVGQlV5eEpRVUZVTEVOQlFXTXNhMEpCUVdRc1EwRkJhVU1zVjBGQmFrTXNSVUZCT0VNc1NVRkJPVU03UVVGRFFTeFZRVUZOTEZkQlFWY3NVMEZCVXl4aFFVRlVMRU5CUVhWQ0xGZEJRWFpDTEVOQlFXcENPMEZCUTBFc1ZVRkJUU3hSUVVGUkxGTkJRVk1zWVVGQlZDeERRVUYxUWl4alFVRjJRaXhEUVVGa08wRkJRMEVzVlVGQlRTeHpRa0ZCYzBJc1UwRkJVeXhoUVVGVUxFTkJRWFZDTEhOQ1FVRjJRaXhEUVVFMVFqdEJRVU5CTERCQ1FVRnZRaXhuUWtGQmNFSXNRMEZCY1VNc1QwRkJja01zUlVGQk9FTXNXVUZCVFR0QlFVTnNSQ3gxUWtGQlN5eFJRVUZNTEVOQlFXTXNiMEpCUVc5Q0xFOUJRWEJDTEVOQlFUUkNMRWxCUVRGRE8wRkJRMFFzVDBGR1JEdEJRVWRCTEZsQlFVMHNaMEpCUVU0c1EwRkJkVUlzVDBGQmRrSXNSVUZCWjBNc1dVRkJUVHRCUVVOd1F5eHBRa0ZCVXl4VFFVRlVMRU5CUVcxQ0xFMUJRVzVDTEVOQlFUQkNMRkZCUVRGQ08wRkJRMEVzWlVGQlN5eGxRVUZNTzBGQlEwUXNUMEZJUkR0QlFVbEVPenM3YzBOQlEydENPMEZCUTJwQ0xGVkJRVTBzVjBGQlZ5eFRRVUZUTEdGQlFWUXNRMEZCZFVJc1YwRkJka0lzUTBGQmFrSTdRVUZEUVN4bFFVRlRMR0ZCUVZRc1EwRkJkVUlzVjBGQmRrSXNSVUZCYjBNc1NVRkJjRU1zUjBGQk1rTXNSVUZCTTBNN1FVRkRRU3hsUVVGVExHRkJRVlFzUTBGQmRVSXNVMEZCZGtJc1JVRkJhME1zU1VGQmJFTXNSMEZCZVVNc1JVRkJla003UVVGRFFTeGxRVUZUTEdGQlFWUXNRMEZCZFVJc2EwSkJRWFpDTEVWQlFUSkRMRWxCUVRORExFZEJRV3RFTEVWQlFXeEVPMEZCUTBFc1pVRkJVeXhoUVVGVUxFTkJRWFZDTEdOQlFYWkNMRVZCUVhWRExFdEJRWFpETEVkQlFTdERMRVZCUVM5RE8wRkJRMEVzWlVGQlV5eGhRVUZVTEVOQlFYVkNMSE5DUVVGMlFpeEZRVUVyUXl4UFFVRXZReXhEUVVGMVJDeEpRVUYyUkN4SFFVRTRSQ3hGUVVFNVJEdEJRVU5FT3pzN2JVTkJRMlU3UVVGQlFUczdRVUZEWkN4VlFVRk5MRFpzUzBFclJtMUVMRXRCUVVzc1QwRXZSbmhFTEdsR1FXZEhkVVFzUzBGQlN5eFZRV2hITlVRc05tRkJRVTQ3UVVFd1IwRXNaVUZCVXl4SlFVRlVMRU5CUVdNc2EwSkJRV1FzUTBGQmFVTXNWMEZCYWtNc1JVRkJPRU1zVDBGQk9VTTdRVUZEUVN4VlFVRk5MR05CUVdNc1UwRkJVeXhoUVVGVUxFTkJRWFZDTEdOQlFYWkNMRU5CUVhCQ08wRkJRMEVzVlVGQlRTeFJRVUZSTEZsQlFWa3NZVUZCV2l4RFFVRXdRaXhqUVVFeFFpeERRVUZrTzBGQlEwRXNXVUZCVFN4blFrRkJUaXhEUVVGMVFpeFBRVUYyUWl4RlFVRm5ReXhaUVVGTk8wRkJRM0JETEc5Q1FVRlpMRk5CUVZvc1EwRkJjMElzVFVGQmRFSXNRMEZCTmtJc1VVRkJOMEk3UVVGRFFTeGxRVUZMTEZsQlFVdzdRVUZEUkN4UFFVaEVPMEZCU1VFc1ZVRkJUU3hUUVVGVExGTkJRVk1zWVVGQlZDeERRVUYxUWl4VFFVRjJRaXhEUVVGbU8wRkJRMEVzWVVGQlR5eG5Ra0ZCVUN4RFFVRjNRaXhQUVVGNFFpeEZRVUZwUXl4WlFVRk5PMEZCUTNKRExGbEJRVTBzWVVGQllTeFRRVUZUTEdkQ1FVRlVMRU5CUVRCQ0xGRkJRVEZDTEVOQlFXNUNPMEZCUTBFc1dVRkJUU3dyVjBGQlRqdEJRVk5CTEdOQlFVMHNTVUZCVGl4RFFVRlhMRlZCUVZnc1JVRkJkVUlzUjBGQmRrSXNSMEZCTmtJc2EwSkJRVGRDTEVOQlFXZEVMRlZCUVdoRUxFVkJRVFJFTEVkQlFUVkVPMEZCUTBRc1QwRmFSRHRCUVdGQkxGVkJRVTBzVVVGQlVTeFRRVUZUTEdGQlFWUXNRMEZCZFVJc1VVRkJka0lzUTBGQlpEdEJRVU5CTEZWQlFVMHNWVUZCVlN4VFFVRlRMR0ZCUVZRc1EwRkJkVUlzVlVGQmRrSXNRMEZCYUVJN1FVRkRRU3haUVVGTkxHZENRVUZPTEVOQlFYVkNMRTlCUVhaQ0xFVkJRV2RETEZsQlFVMDdRVUZEY0VNc1pVRkJTeXhYUVVGTU8wRkJRMEVzWjBKQlFWRXNVMEZCVWl4SFFVRnZRaXhQUVVGd1FqdEJRVU5FTEU5QlNFUTdPMEZCUzBFc1ZVRkJUU3hSUVVGUkxGTkJRVk1zWVVGQlZDeERRVUYxUWl4UlFVRjJRaXhEUVVGa08wRkJRMEVzV1VGQlRTeG5Ra0ZCVGl4RFFVRjFRaXhQUVVGMlFpeEZRVUZuUXl4WlFVRk5PMEZCUTNCRExIZENRVUZOTEU5QlFVNHNRMEZCWXl4cFFrRkJaRHRCUVVOQkxHZENRVUZSTEZOQlFWSXNSMEZCYjBJc1QwRkJjRUk3UVVGRFJDeFBRVWhFT3p0QlFVdEJMRlZCUVUwc1dVRkJXU3hUUVVGVExHRkJRVlFzUTBGQmRVSXNXVUZCZGtJc1EwRkJiRUk3UVVGRFFTeG5Ra0ZCVlN4blFrRkJWaXhEUVVFeVFpeFBRVUV6UWl4RlFVRnZReXhaUVVGTk8wRkJRM2hETEhWQ1FVRkxMRlZCUVV3c1EwRkJaMElzWjBKQlFVMHNZVUZCVGl4RFFVRnZRaXhUUVVGd1FpeEZRVUVyUWl4RFFVRXZRaXhGUVVGclF5eEhRVUZzUkN4RlFVRjFSQ3hUUVVGMlJEdEJRVU5FTEU5QlJrUTdRVUZIUkRzN08yMURRVU5sTzBGQlEyUXNWVUZCVFN4VlFVRlZMRk5CUVZNc1lVRkJWQ3hEUVVGMVFpeFZRVUYyUWl4RFFVRm9RanRCUVVOQkxHTkJRVkVzVTBGQlVpeEhRVUZ2UWl4RlFVRndRanRCUVVOQkxGVkJRVTBzV1VGQldTeFRRVUZUTEdGQlFWUXNRMEZCZFVJc1dVRkJka0lzUTBGQmJFSTdRVUZEUVN4blFrRkJWU3hUUVVGV0xFZEJRWE5DTEdOQlFYUkNPMEZCUTBRN096dHJRMEZEWXl4VkxFVkJRVms3UVVGQlFTeFZRVU5xUWl4UFFVUnBRaXhIUVVNMFJTeFZRVVExUlN4RFFVTnFRaXhQUVVScFFqdEJRVUZCTEZWQlExSXNWVUZFVVN4SFFVTTBSU3hWUVVRMVJTeERRVU5TTEZWQlJGRTdRVUZCUVN4VlFVTkpMRkZCUkVvc1IwRkRORVVzVlVGRU5VVXNRMEZEU1N4UlFVUktPMEZCUVVFc1ZVRkRZeXhKUVVSa0xFZEJRelJGTEZWQlJEVkZMRU5CUTJNc1NVRkVaRHRCUVVGQkxGVkJRMjlDTEZGQlJIQkNMRWRCUXpSRkxGVkJSRFZGTEVOQlEyOUNMRkZCUkhCQ08wRkJRVUVzVlVGRE9FSXNXVUZFT1VJc1IwRkRORVVzVlVGRU5VVXNRMEZET0VJc1dVRkVPVUk3UVVGQlFTeFZRVU0wUXl4VFFVUTFReXhIUVVNMFJTeFZRVVExUlN4RFFVTTBReXhUUVVRMVF6dEJRVUZCTEZWQlEzVkVMRTlCUkhaRUxFZEJRelJGTEZWQlJEVkZMRU5CUTNWRUxFOUJSSFpFTzBGQlFVRXNWVUZEWjBVc1QwRkVhRVVzUjBGRE5FVXNWVUZFTlVVc1EwRkRaMFVzVDBGRWFFVTdRVUZGZWtJN08wRkJRMEVzWlVGQlV5eG5Ra0ZCVkN4RFFVRXdRaXhSUVVFeFFpeEZRVUZ2UXl4UFFVRndReXhEUVVFMFF5eFZRVUZETEVkQlFVUXNSVUZCVFN4TFFVRk9MRVZCUVdkQ08wRkJRekZFTEZsQlFVa3NWVUZCVlN4RFFVRmtMRVZCUVdsQ08wRkJRMllzWTBGQlNTeE5RVUZLTzBGQlEwUTdRVUZEUml4UFFVcEVPMEZCUzBFc1kwRkJVU3hQUVVGU0xFTkJRV2RDTEZWQlFVTXNSMEZCUkN4RlFVRk5MRXRCUVU0c1JVRkJaMEk3UVVGRE9VSXNXVUZCVFN4aFFVRmhMRk5CUVZNc1owSkJRVlFzUTBGQk1FSXNVVUZCTVVJc1EwRkJia0k3UVVGRFFTeFpRVUZKTEZWQlFWVXNRMEZCWkN4RlFVRnBRanRCUVVObUxIRkNRVUZYTEV0QlFWZ3NSVUZCYTBJc1lVRkJiRUlzUTBGQlowTXNVMEZCYUVNc1JVRkJNa01zUzBGQk0wTXNSMEZCYlVRc1NVRkJTU3hKUVVGMlJEdEJRVU5CTEhGQ1FVRlhMRXRCUVZnc1JVRkJhMElzWVVGQmJFSXNRMEZCWjBNc1VVRkJhRU1zUlVGQk1FTXNTMEZCTVVNc1IwRkJhMFFzU1VGQlNTeEhRVUYwUkR0QlFVTkVMRk5CU0VRc1RVRkhUenRCUVVOTUxHTkJRVTBzZDB0QlIydEVMRWxCUVVrc1NVRklkRVFzT0VwQlRXbEVMRWxCUVVrc1IwRk9ja1FzTWtaQlFVNDdRVUZUUVN4blFrRkJUU3hKUVVGT0xFTkJRVmNzVlVGQldDeEZRVUYxUWl4SFFVRjJRaXhIUVVFMlFpeHJRa0ZCTjBJc1EwRkJaMFFzVlVGQmFFUXNSVUZCTkVRc1IwRkJOVVE3UVVGRFJEdEJRVU5HTEU5QmFrSkVPMEZCYTBKQkxHVkJRVk1zWVVGQlZDeERRVUYxUWl4bFFVRjJRaXhGUVVGM1F5eFBRVUY0UXl4SFFVRnJSQ3hWUVVGc1JEdEJRVU5CTEdWQlFWTXNZVUZCVkN4RFFVRjFRaXhoUVVGMlFpeEZRVUZ6UXl4UFFVRjBReXhIUVVGblJDeFJRVUZvUkR0QlFVTkJMR1ZCUVZNc1lVRkJWQ3hEUVVGMVFpeFRRVUYyUWl4RlFVRnJReXhMUVVGc1F5eEhRVUV3UXl4SlFVRXhRenRCUVVOQkxHVkJRVk1zWVVGQlZDeERRVUYxUWl4aFFVRjJRaXhGUVVGelF5eExRVUYwUXl4SFFVRTRReXhSUVVFNVF6dEJRVU5CTEdWQlFWTXNZVUZCVkN4RFFVRjFRaXhwUWtGQmRrSXNSVUZCTUVNc1MwRkJNVU1zUjBGQmEwUXNXVUZCYkVRN1FVRkRRU3hsUVVGVExHRkJRVlFzUTBGQmRVSXNZMEZCZGtJc1JVRkJkVU1zUzBGQmRrTXNSMEZCSzBNc1UwRkJMME03UVVGRFFTeGxRVUZUTEdGQlFWUXNRMEZCZFVJc1dVRkJka0lzUlVGQmNVTXNTMEZCY2tNc1IwRkJOa01zVDBGQk4wTTdRVUZEUVN4bFFVRlRMR0ZCUVZRc1EwRkJkVUlzV1VGQmRrSXNSVUZCY1VNc1MwRkJja01zUjBGQk5rTXNUMEZCTjBNN1FVRkRSRHM3TzJ0RFFVVmpPMEZCUTJJc1ZVRkJUU3hoUVVGaExGTkJRVk1zWjBKQlFWUXNRMEZCTUVJc1VVRkJNVUlzUTBGQmJrSTdRVUZEUVN4VlFVRk5MRlZCUVZVc1RVRkJUU3hKUVVGT0xFTkJRVmNzVlVGQldDeEZRVUYxUWl4SFFVRjJRaXhEUVVFeVFpeFZRVUZETEVkQlFVUXNSVUZCVXp0QlFVTnNSQ3haUVVGTkxFOUJRVThzU1VGQlNTeGhRVUZLTEVOQlFXdENMRk5CUVd4Q0xFVkJRVFpDTEV0QlFURkRPMEZCUTBFc1dVRkJUU3hOUVVGTkxFbEJRVWtzWVVGQlNpeERRVUZyUWl4UlFVRnNRaXhGUVVFMFFpeExRVUY0UXp0QlFVTkJMRmxCUVVrc1VVRkJVU3hIUVVGYUxFVkJRV2xDTzBGQlEyWXNhVUpCUVU4c1JVRkJSU3hWUVVGR0xFVkJRVkVzVVVGQlVpeEZRVUZRTzBGQlEwUTdRVUZEUml4UFFVNWxMRVZCVFdJc1RVRk9ZU3hEUVUxT08wRkJRVUVzWlVGQlRTeEZRVUZPTzBGQlFVRXNUMEZPVFN4RFFVRm9RanRCUVU5QkxGVkJRVTBzWVVGQllTeFRRVUZUTEdGQlFWUXNRMEZCZFVJc1pVRkJka0lzUlVGQmQwTXNUMEZCTTBRN1FVRkRRU3hWUVVGTkxGZEJRVmNzVTBGQlV5eGhRVUZVTEVOQlFYVkNMR0ZCUVhaQ0xFVkJRWE5ETEU5QlFYWkVPMEZCUTBFc1ZVRkJUU3hQUVVGUExFOUJRVThzVVVGQlVDeERRVUZuUWl4VFFVRlRMR0ZCUVZRc1EwRkJkVUlzVTBGQmRrSXNSVUZCYTBNc1MwRkJiRVFzUTBGQllqdEJRVU5CTEZWQlFVMHNWMEZCVnl4VFFVRlRMR0ZCUVZRc1EwRkJkVUlzWVVGQmRrSXNSVUZCYzBNc1MwRkJka1E3UVVGRFFTeFZRVUZOTEdWQlFXVXNVMEZCVXl4aFFVRlVMRU5CUVhWQ0xHbENRVUYyUWl4RlFVRXdReXhMUVVFdlJEdEJRVU5CTEZWQlFVMHNXVUZCV1N4VFFVRlRMR0ZCUVZRc1EwRkJkVUlzWTBGQmRrSXNSVUZCZFVNc1MwRkJla1E3UVVGRFFTeFZRVUZOTEZWQlFWVXNVMEZCVXl4aFFVRlVMRU5CUVhWQ0xGbEJRWFpDTEVWQlFYRkRMRXRCUVhKRU8wRkJRMEVzVlVGQlRTeFZRVUZWTEZOQlFWTXNZVUZCVkN4RFFVRjFRaXhaUVVGMlFpeEZRVUZ4UXl4TFFVRnlSRHM3UVVGRlFTeFZRVUZOTEdGQlFXRTdRVUZEYWtJc2QwSkJSR2xDTzBGQlJXcENMRGhDUVVacFFqdEJRVWRxUWl3d1FrRklhVUk3UVVGSmFrSXNhMEpCU21sQ08wRkJTMnBDTERCQ1FVeHBRanRCUVUxcVFpeHJRMEZPYVVJN1FVRlBha0lzTkVKQlVHbENPMEZCVVdwQ0xIZENRVkpwUWp0QlFWTnFRanRCUVZScFFpeFBRVUZ1UWp0QlFWZEJMSE5DUVVGTkxFOUJRVTRzUTBGQll5eGxRVUZrTEVWQlFTdENMRlZCUVM5Q08wRkJRMFE3T3pzN096dHJRa0ZIV1N4SlFVRkpMRVZCUVVvc1JTSXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpS0daMWJtTjBhVzl1SUdVb2RDeHVMSElwZTJaMWJtTjBhVzl1SUhNb2J5eDFLWHRwWmlnaGJsdHZYU2w3YVdZb0lYUmJiMTBwZTNaaGNpQmhQWFI1Y0dWdlppQnlaWEYxYVhKbFBUMWNJbVoxYm1OMGFXOXVYQ0ltSm5KbGNYVnBjbVU3YVdZb0lYVW1KbUVwY21WMGRYSnVJR0VvYnl3aE1DazdhV1lvYVNseVpYUjFjbTRnYVNodkxDRXdLVHQyWVhJZ1pqMXVaWGNnUlhKeWIzSW9YQ0pEWVc1dWIzUWdabWx1WkNCdGIyUjFiR1VnSjF3aUsyOHJYQ0luWENJcE8zUm9jbTkzSUdZdVkyOWtaVDFjSWsxUFJGVk1SVjlPVDFSZlJrOVZUa1JjSWl4bWZYWmhjaUJzUFc1YmIxMDllMlY0Y0c5eWRITTZlMzE5TzNSYmIxMWJNRjB1WTJGc2JDaHNMbVY0Y0c5eWRITXNablZ1WTNScGIyNG9aU2w3ZG1GeUlHNDlkRnR2WFZzeFhWdGxYVHR5WlhSMWNtNGdjeWh1UDI0NlpTbDlMR3dzYkM1bGVIQnZjblJ6TEdVc2RDeHVMSElwZlhKbGRIVnliaUJ1VzI5ZExtVjRjRzl5ZEhOOWRtRnlJR2s5ZEhsd1pXOW1JSEpsY1hWcGNtVTlQVndpWm5WdVkzUnBiMjVjSWlZbWNtVnhkV2x5WlR0bWIzSW9kbUZ5SUc4OU1EdHZQSEl1YkdWdVozUm9PMjhyS3lsektISmJiMTBwTzNKbGRIVnliaUJ6ZlNraUxDSnBiWEJ2Y25RZ1EyOXlaU0JtY205dElDY3VMMnhwWWk5amIzSmxKMXh1YVcxd2IzSjBJRlZKSUdaeWIyMGdKeTR2YkdsaUwzVnBKMXh1YVcxd2IzSjBJRVJ2ZDI1c2IyRmtaWElnWm5KdmJTQW5MaTlzYVdJdlpHOTNibXh2WVdSbGNpZGNibHh1WTJ4aGMzTWdTRzl0WlNCbGVIUmxibVJ6SUVSdmQyNXNiMkZrWlhJZ2UxeHVJQ0JqYjI1emRISjFZM1J2Y2lBb0tTQjdYRzRnSUNBZ1kyOXVjM1FnYzJWaGNtTm9JRDBnZTF4dUlDQWdJQ0FnWkdseU9pQW5KeXhjYmlBZ0lDQWdJR05vWVc1dVpXdzZJQ2RqYUhWdWJHVnBKeXhjYmlBZ0lDQWdJR05zYVdWdWRIUjVjR1U2SURBc1hHNGdJQ0FnSUNCM1pXSTZJREZjYmlBZ0lDQjlYRzRnSUNBZ1kyOXVjM1FnYkdsemRGQmhjbUZ0WlhSbGNpQTlJSHRjYmlBZ0lDQWdJSE5sWVhKamFDeGNiaUFnSUNBZ0lIVnliRG9nWUM5aGNHa3ZiR2x6ZEQ5Z0xGeHVJQ0FnSUNBZ2IzQjBhVzl1Y3pvZ2UxeHVJQ0FnSUNBZ0lDQmpjbVZrWlc1MGFXRnNjem9nSjJsdVkyeDFaR1VuTEZ4dUlDQWdJQ0FnSUNCdFpYUm9iMlE2SUNkSFJWUW5YRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUhOMWNHVnlLR3hwYzNSUVlYSmhiV1YwWlhJcFhHNGdJQ0FnVlVrdWFXNXBkQ2dwWEc0Z0lDQWdWVWt1WVdSa1RXVnVkU2hrYjJOMWJXVnVkQzV4ZFdWeWVWTmxiR1ZqZEc5eVFXeHNLQ2N1Wnkxa2NtOXdaRzkzYmkxaWRYUjBiMjRuS1ZzelhTd2dKMkZtZEdWeVpXNWtKeWxjYmlBZ0lDQkRiM0psTG5KbGNYVmxjM1JEYjI5cmFXVnpLRnQ3SUhWeWJEb2dKMmgwZEhCek9pOHZjR0Z1TG1KaGFXUjFMbU52YlM4bkxDQnVZVzFsT2lBblFrUlZVMU1uSUgwc0lIc2dkWEpzT2lBbmFIUjBjSE02THk5d1kzTXVZbUZwWkhVdVkyOXRMeWNzSUc1aGJXVTZJQ2RUVkU5TFJVNG5JSDFkS1Z4dUlDQWdJRU52Y21VdWMyaHZkMVJ2WVhOMEtDZmxpSjNscDR2bGpKYm1pSkRsaXA4aEp5d2dKM04xWTJObGMzTW5LVnh1SUNBZ0lIUm9hWE11Ylc5a1pTQTlJQ2RTVUVNblhHNGdJQ0FnZEdocGN5NXljR05WVWt3Z1BTQW5hSFIwY0RvdkwyeHZZMkZzYUc5emREbzJPREF3TDJwemIyNXljR01uWEc0Z0lIMWNibHh1SUNCemRHRnlkRXhwYzNSbGJpQW9LU0I3WEc0Z0lDQWdkMmx1Wkc5M0xtRmtaRVYyWlc1MFRHbHpkR1Z1WlhJb0oyMWxjM05oWjJVbkxDQW9aWFpsYm5RcElEMCtJSHRjYmlBZ0lDQWdJR2xtSUNobGRtVnVkQzV6YjNWeVkyVWdJVDA5SUhkcGJtUnZkeWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTVjYmlBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnYVdZZ0tHVjJaVzUwTG1SaGRHRXVkSGx3WlNBbUppQmxkbVZ1ZEM1a1lYUmhMblI1Y0dVZ1BUMDlJQ2R6Wld4bFkzUmxaQ2NwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV5WlhObGRDZ3BYRzRnSUNBZ0lDQWdJR052Ym5OMElITmxiR1ZqZEdWa1JtbHNaU0E5SUdWMlpXNTBMbVJoZEdFdVpHRjBZVnh1SUNBZ0lDQWdJQ0JwWmlBb2MyVnNaV04wWldSR2FXeGxMbXhsYm1kMGFDQTlQVDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJRU52Y21VdWMyaHZkMVJ2WVhOMEtDZm9yN2ZwZ0lubWk2bmt1SURrdUl2a3ZhRG9wb0hrdjUzbHJaam5tb1RtbG9ma3U3YmxrNlluTENBblptRnBiSFZ5WlNjcFhHNGdJQ0FnSUNBZ0lDQWdjbVYwZFhKdVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjMlZzWldOMFpXUkdhV3hsTG1admNrVmhZMmdvS0dsMFpXMHBJRDArSUh0Y2JpQWdJQ0FnSUNBZ0lDQnBaaUFvYVhSbGJTNXBjMlJwY2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWhaR1JHYjJ4a1pYSW9hWFJsYlM1d1lYUm9LVnh1SUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1Ga1pFWnBiR1VvYVhSbGJTbGNiaUFnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwcFhHNGdJQ0FnSUNBZ0lIUm9hWE11YzNSaGNuUW9RMjl5WlM1blpYUkRiMjVtYVdkRVlYUmhLQ2RwYm5SbGNuWmhiQ2NwTENBb1ptbHNaVVJ2ZDI1c2IyRmtTVzVtYnlrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0FnSUdsbUlDaDBhR2x6TG0xdlpHVWdQVDA5SUNkU1VFTW5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQkRiM0psTG1GeWFXRXlVbEJEVFc5a1pTaDBhR2x6TG5Kd1kxVlNUQ3dnWm1sc1pVUnZkMjVzYjJGa1NXNW1ieWxjYmlBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdhV1lnS0hSb2FYTXViVzlrWlNBOVBUMGdKMVJZVkNjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUVOdmNtVXVZWEpwWVRKVVdGUk5iMlJsS0dacGJHVkViM2R1Ykc5aFpFbHVabThwWEc0Z0lDQWdJQ0FnSUNBZ0lDQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NjamRHVjRkRTFsYm5VbktTNWpiR0Z6YzB4cGMzUXVZV1JrS0NkdmNHVnVMVzhuS1Z4dUlDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmU2xjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlLVnh1SUNBZ0lHTnZibk4wSUcxbGJuVkNkWFIwYjI0Z1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NjallYSnBZVEpNYVhOMEp5bGNiaUFnSUNCdFpXNTFRblYwZEc5dUxtRmtaRVYyWlc1MFRHbHpkR1Z1WlhJb0oyTnNhV05ySnl3Z0tHVjJaVzUwS1NBOVBpQjdYRzRnSUNBZ0lDQmpiMjV6ZENCeWNHTlZVa3dnUFNCbGRtVnVkQzUwWVhKblpYUXVaR0YwWVhObGRDNTFjbXhjYmlBZ0lDQWdJR2xtSUNoeWNHTlZVa3dwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHBjeTV5Y0dOVlVrd2dQU0J5Y0dOVlVreGNiaUFnSUNBZ0lDQWdkR2hwY3k1blpYUlRaV3hsWTNSbFpDZ3BYRzRnSUNBZ0lDQWdJSFJvYVhNdWJXOWtaU0E5SUNkU1VFTW5YRzRnSUNBZ0lDQjlYRzRnSUNBZ0lDQnBaaUFvWlhabGJuUXVkR0Z5WjJWMExtbGtJRDA5UFNBbllYSnBZVEpVWlhoMEp5a2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxtZGxkRk5sYkdWamRHVmtLQ2xjYmlBZ0lDQWdJQ0FnZEdocGN5NXRiMlJsSUQwZ0oxUllWQ2RjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlLVnh1SUNCOVhHNWNiaUFnWjJWMFUyVnNaV04wWldRZ0tDa2dlMXh1SUNBZ0lIZHBibVJ2ZHk1d2IzTjBUV1Z6YzJGblpTaDdJSFI1Y0dVNklDZG5aWFJUWld4bFkzUmxaQ2NnZlN3Z2JHOWpZWFJwYjI0dWIzSnBaMmx1S1Z4dUlDQjlYRzRnSUdkbGRGQnlaV1pwZUV4bGJtZDBhQ0FvS1NCN1hHNGdJQ0FnWTI5dWMzUWdjR0YwYUNBOUlFTnZjbVV1WjJWMFNHRnphRkJoY21GdFpYUmxjaWduYkdsemRDOXdZWFJvSnlrZ2ZId2dRMjl5WlM1blpYUklZWE5vVUdGeVlXMWxkR1Z5S0Nkd1lYUm9KeWxjYmlBZ0lDQmpiMjV6ZENCbWIyeGtJRDBnUTI5eVpTNW5aWFJEYjI1bWFXZEVZWFJoS0NkbWIyeGtKeWxjYmlBZ0lDQnBaaUFvWm05c1pDQTlQVDBnTFRFZ2ZId2djR0YwYUNBOVBUMGdKeThuS1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnTVZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQmpiMjV6ZENCa2FYSWdQU0J3WVhSb0xuTndiR2wwS0Njdkp5bGNiaUFnSUNBZ0lHeGxkQ0JqYjNWdWRDQTlJREJjYmlBZ0lDQWdJR1p2Y2lBb2JHVjBJR2tnUFNBd095QnBJRHdnWkdseUxteGxibWQwYUNBdElHWnZiR1E3SUdrckt5a2dlMXh1SUNBZ0lDQWdJQ0JqYjNWdWRDQTlJR052ZFc1MElDc2daR2x5VzJsZExteGxibWQwYUNBcklERmNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lISmxkSFZ5YmlCamIzVnVkRnh1SUNBZ0lIMWNiaUFnZlZ4dUlDQm5aWFJHYVd4bGN5QW9abWxzWlhNcElIdGNiaUFnSUNCamIyNXpkQ0J3Y21WbWFYZ2dQU0IwYUdsekxtZGxkRkJ5WldacGVFeGxibWQwYUNncFhHNGdJQ0FnWm05eUlDaHNaWFFnYTJWNUlHbHVJR1pwYkdWektTQjdYRzRnSUNBZ0lDQjBhR2x6TG1acGJHVkViM2R1Ykc5aFpFbHVabTh1Y0hWemFDaDdYRzRnSUNBZ0lDQWdJRzVoYldVNklHWnBiR1Z6VzJ0bGVWMHVjR0YwYUM1emRXSnpkSElvY0hKbFptbDRLU3hjYmlBZ0lDQWdJQ0FnYkdsdWF6b2dZQ1I3Ykc5allYUnBiMjR1Y0hKdmRHOWpiMng5THk5d1kzTXVZbUZwWkhVdVkyOXRMM0psYzNRdk1pNHdMM0JqY3k5bWFXeGxQMjFsZEdodlpEMWtiM2R1Ykc5aFpDWmhjSEJmYVdROU1qVXdOVEk0Sm5CaGRHZzlKSHRsYm1OdlpHVlZVa2xEYjIxd2IyNWxiblFvWm1sc1pYTmJhMlY1WFM1d1lYUm9LWDFnTEZ4dUlDQWdJQ0FnSUNCdFpEVTZJR1pwYkdWelcydGxlVjB1YldRMVhHNGdJQ0FnSUNCOUtWeHVJQ0FnSUgxY2JpQWdJQ0J5WlhSMWNtNGdVSEp2YldselpTNXlaWE52YkhabEtDbGNiaUFnZlZ4dWZWeHVYRzVqYjI1emRDQm9iMjFsSUQwZ2JtVjNJRWh2YldVb0tWeHVYRzVvYjIxbExuTjBZWEowVEdsemRHVnVLQ2xjYmlJc0ltTnNZWE56SUVWMlpXNTBSVzFwZEhSbGNpQjdYRzRnSUdOdmJuTjBjblZqZEc5eUlDZ3BJSHRjYmlBZ0lDQjBhR2x6TGw5c2FYTjBaVzVsY25NZ1BTQjdmVnh1SUNCOVhHNWNiaUFnTHlvcVhHNGdJQ0FxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0J1WVcxbElDMGdaWFpsYm5RZ2JtRnRaVnh1SUNBZ0tpQkFjR0Z5WVcwZ2UyWjFibU4wYVc5dUtHUmhkR0U2SUNvcE9pQjJiMmxrZlNCbWJpQXRJR3hwYzNSbGJtVnlJR1oxYm1OMGFXOXVYRzRnSUNBcUwxeHVJQ0J2YmlBb2JtRnRaU3dnWm00cElIdGNiaUFnSUNCamIyNXpkQ0JzYVhOMElEMGdkR2hwY3k1ZmJHbHpkR1Z1WlhKelcyNWhiV1ZkSUQwZ2RHaHBjeTVmYkdsemRHVnVaWEp6VzI1aGJXVmRJSHg4SUZ0ZFhHNGdJQ0FnYkdsemRDNXdkWE5vS0dadUtWeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lDQXFJRUJ3WVhKaGJTQjdjM1J5YVc1bmZTQnVZVzFsSUMwZ1pYWmxiblFnYm1GdFpWeHVJQ0FnS2lCQWNHRnlZVzBnZXlwOUlHUmhkR0VnTFNCa1lYUmhJSFJ2SUdWdGFYUWdaWFpsYm5RZ2JHbHpkR1Z1WlhKelhHNGdJQ0FxTDF4dUlDQjBjbWxuWjJWeUlDaHVZVzFsTENCa1lYUmhLU0I3WEc0Z0lDQWdZMjl1YzNRZ1ptNXpJRDBnZEdocGN5NWZiR2x6ZEdWdVpYSnpXMjVoYldWZElIeDhJRnRkWEc0Z0lDQWdabTV6TG1admNrVmhZMmdvWm00Z1BUNGdabTRvWkdGMFlTa3BYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdJQ29nUUhCaGNtRnRJSHR6ZEhKcGJtZDlJRzVoYldVZ0xTQmxkbVZ1ZENCdVlXMWxYRzRnSUNBcUwxeHVJQ0J2Wm1ZZ0tHNWhiV1VwSUh0Y2JpQWdJQ0JrWld4bGRHVWdkR2hwY3k1ZmJHbHpkR1Z1WlhKelcyNWhiV1ZkWEc0Z0lIMWNibjFjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnUlhabGJuUkZiV2wwZEdWeVhHNGlMQ0pwYlhCdmNuUWdVM1J2Y21VZ1puSnZiU0FuTGk5emRHOXlaU2RjYmx4dVkyeGhjM01nUTI5eVpTQjdYRzRnSUdOdmJuTjBjblZqZEc5eUlDZ3BJSHRjYmlBZ0lDQjBhR2x6TG1OdmIydHBaWE1nUFNCN2ZWeHVJQ0I5WEc0Z0lHaDBkSEJUWlc1a0lDaDdkWEpzTENCdmNIUnBiMjV6ZlN3Z2NtVnpiMngyWlN3Z2NtVnFaV04wS1NCN1hHNGdJQ0FnWm1WMFkyZ29kWEpzTENCdmNIUnBiMjV6S1M1MGFHVnVLQ2h5WlhOd2IyNXpaU2tnUFQ0Z2UxeHVJQ0FnSUNBZ2FXWWdLSEpsYzNCdmJuTmxMbTlyS1NCN1hHNGdJQ0FnSUNBZ0lISmxjM0J2Ym5ObExtcHpiMjRvS1M1MGFHVnVLQ2hrWVhSaEtTQTlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ2NtVnpiMngyWlNoa1lYUmhLVnh1SUNBZ0lDQWdJQ0I5S1Z4dUlDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnY21WcVpXTjBLSEpsYzNCdmJuTmxLVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMHBMbU5oZEdOb0tDaGxjbklwSUQwK0lIdGNiaUFnSUNBZ0lISmxhbVZqZENobGNuSXBYRzRnSUNBZ2ZTbGNiaUFnZlZ4dUlDQm5aWFJEYjI1bWFXZEVZWFJoSUNoclpYa2dQU0J1ZFd4c0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUZOMGIzSmxMbWRsZEVOdmJtWnBaMFJoZEdFb2EyVjVLVnh1SUNCOVhHNGdJRzlpYW1WamRGUnZVWFZsY25sVGRISnBibWNnS0c5aWFpa2dlMXh1SUNBZ0lISmxkSFZ5YmlCUFltcGxZM1F1YTJWNWN5aHZZbW9wTG0xaGNDZ29hMlY1S1NBOVBpQjdYRzRnSUNBZ0lDQnlaWFIxY200Z1lDUjdaVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLR3RsZVNsOVBTUjdaVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLRzlpYWx0clpYbGRLWDFnWEc0Z0lDQWdmU2t1YW05cGJpZ25KaWNwWEc0Z0lIMWNiaUFnYzJWdVpGUnZRbUZqYTJkeWIzVnVaQ0FvYldWMGFHOWtMQ0JrWVhSaExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lHTm9jbTl0WlM1eWRXNTBhVzFsTG5ObGJtUk5aWE56WVdkbEtIdGNiaUFnSUNBZ0lHMWxkR2h2WkN4Y2JpQWdJQ0FnSUdSaGRHRmNiaUFnSUNCOUxDQmpZV3hzWW1GamF5bGNiaUFnZlZ4dUlDQnphRzkzVkc5aGMzUWdLRzFsYzNOaFoyVXNJSFI1Y0dVcElIdGNiaUFnSUNCM2FXNWtiM2N1Y0c5emRFMWxjM05oWjJVb2V5QjBlWEJsT2lBbmMyaHZkMVJ2WVhOMEp5d2daR0YwWVRvZ2V5QnRaWE56WVdkbExDQjBlWEJsSUgwZ2ZTd2diRzlqWVhScGIyNHViM0pwWjJsdUtWeHVJQ0I5WEc0Z0lHZGxkRWhoYzJoUVlYSmhiV1YwWlhJZ0tHNWhiV1VwSUh0Y2JpQWdJQ0JqYjI1emRDQm9ZWE5vSUQwZ2QybHVaRzkzTG14dlkyRjBhVzl1TG1oaGMyaGNiaUFnSUNCamIyNXpkQ0J3WVhKaGJYTlRkSEpwYm1jZ1BTQm9ZWE5vTG5OMVluTjBjaWd4S1Z4dUlDQWdJR052Ym5OMElITmxZWEpqYUZCaGNtRnRjeUE5SUc1bGR5QlZVa3hUWldGeVkyaFFZWEpoYlhNb2NHRnlZVzF6VTNSeWFXNW5LVnh1SUNBZ0lISmxkSFZ5YmlCelpXRnlZMmhRWVhKaGJYTXVaMlYwS0c1aGJXVXBYRzRnSUgxY2JpQWdabTl5YldGMFEyOXZhMmxsY3lBb0tTQjdYRzRnSUNBZ1kyOXVjM1FnWTI5dmEybGxjeUE5SUZ0ZFhHNGdJQ0FnWm05eUlDaHNaWFFnYTJWNUlHbHVJSFJvYVhNdVkyOXZhMmxsY3lrZ2UxeHVJQ0FnSUNBZ1kyOXZhMmxsY3k1d2RYTm9LR0FrZTJ0bGVYMDlKSHQwYUdsekxtTnZiMnRwWlhOYmEyVjVYWDFnS1Z4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z1kyOXZhMmxsY3k1cWIybHVLQ2M3SUNjcFhHNGdJSDFjYmlBZ1oyVjBTR1ZoWkdWeUlDaDBlWEJsSUQwZ0oxSlFReWNwSUh0Y2JpQWdJQ0JqYjI1emRDQm9aV0ZrWlhKUGNIUnBiMjRnUFNCYlhWeHVJQ0FnSUdobFlXUmxjazl3ZEdsdmJpNXdkWE5vS0dCVmMyVnlMVUZuWlc1ME9pQWtlM1JvYVhNdVoyVjBRMjl1Wm1sblJHRjBZU2duZFhObGNrRm5aVzUwSnlsOVlDbGNiaUFnSUNCb1pXRmtaWEpQY0hScGIyNHVjSFZ6YUNoZ1VtVm1aWEpsY2pvZ0pIdDBhR2x6TG1kbGRFTnZibVpwWjBSaGRHRW9KM0psWm1WeVpYSW5LWDFnS1Z4dUlDQWdJR2xtSUNoUFltcGxZM1F1YTJWNWN5aDBhR2x6TG1OdmIydHBaWE1wTG14bGJtZDBhQ0ErSURBcElIdGNiaUFnSUNBZ0lHaGxZV1JsY2s5d2RHbHZiaTV3ZFhOb0tHQkRiMjlyYVdVNklDUjdkR2hwY3k1bWIzSnRZWFJEYjI5cmFXVnpLQ2w5WUNsY2JpQWdJQ0I5WEc0Z0lDQWdZMjl1YzNRZ2FHVmhaR1Z5Y3lBOUlIUm9hWE11WjJWMFEyOXVabWxuUkdGMFlTZ25hR1ZoWkdWeWN5Y3BYRzRnSUNBZ2FXWWdLR2hsWVdSbGNuTXBJSHRjYmlBZ0lDQWdJR2hsWVdSbGNuTXVjM0JzYVhRb0oxeGNiaWNwTG1admNrVmhZMmdvS0dsMFpXMHBJRDArSUh0Y2JpQWdJQ0FnSUNBZ2FHVmhaR1Z5VDNCMGFXOXVMbkIxYzJnb2FYUmxiU2xjYmlBZ0lDQWdJSDBwWEc0Z0lDQWdmVnh1SUNBZ0lHbG1JQ2gwZVhCbElEMDlQU0FuVWxCREp5a2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHaGxZV1JsY2s5d2RHbHZibHh1SUNBZ0lIMGdaV3h6WlNCcFppQW9kSGx3WlNBOVBUMGdKMkZ5YVdFeVEyMWtKeWtnZTF4dUlDQWdJQ0FnY21WMGRYSnVJR2hsWVdSbGNrOXdkR2x2Ymk1dFlYQW9hWFJsYlNBOVBpQmdMUzFvWldGa1pYSWdKSHRLVTA5T0xuTjBjbWx1WjJsbWVTaHBkR1Z0S1gxZ0tTNXFiMmx1S0NjZ0p5bGNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUjVjR1VnUFQwOUlDZGhjbWxoTW1NbktTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2FHVmhaR1Z5VDNCMGFXOXVMbTFoY0NocGRHVnRJRDArSUdBZ2FHVmhaR1Z5UFNSN2FYUmxiWDFnS1M1cWIybHVLQ2RjWEc0bktWeHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RIbHdaU0E5UFQwZ0oybGtiU2NwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJvWldGa1pYSlBjSFJwYjI0dWJXRndLQ2hwZEdWdEtTQTlQaUI3WEc0Z0lDQWdJQ0FnSUdOdmJuTjBJR2hsWVdSbGNuTWdQU0JwZEdWdExuTndiR2wwS0NjNklDY3BYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmdKSHRvWldGa1pYSnpXekJkTG5SdlRHOTNaWEpEWVhObEtDbDlPaUFrZTJobFlXUmxjbk5iTVYxOVlGeHVJQ0FnSUNBZ2ZTa3VhbTlwYmlnblhGeHlYRnh1SnlsY2JpQWdJQ0I5WEc0Z0lIMWNiaUFnTHk4ZzZLZWo1cDZRSUZKUVErV2NzT1dkZ0NEb3Y1VGxtNTdwcW96b3I0SG1sYkRtamE0ZzVaS001Wnl3NVoyQVhHNGdJSEJoY25ObFZWSk1JQ2gxY213cElIdGNiaUFnSUNCamIyNXpkQ0J3WVhKelpWVlNUQ0E5SUc1bGR5QlZVa3dvZFhKc0tWeHVJQ0FnSUd4bGRDQmhkWFJvVTNSeUlEMGdjR0Z5YzJWVlVrd3VkWE5sY201aGJXVWdQeUJnSkh0d1lYSnpaVlZTVEM1MWMyVnlibUZ0WlgwNkpIdGtaV052WkdWVlVra29jR0Z5YzJWVlVrd3VjR0Z6YzNkdmNtUXBmV0FnT2lCdWRXeHNYRzRnSUNBZ2FXWWdLR0YxZEdoVGRISXBJSHRjYmlBZ0lDQWdJR2xtSUNnaFlYVjBhRk4wY2k1cGJtTnNkV1JsY3lnbmRHOXJaVzQ2SnlrcElIdGNiaUFnSUNBZ0lDQWdZWFYwYUZOMGNpQTlJR0JDWVhOcFl5QWtlMkowYjJFb1lYVjBhRk4wY2lsOVlGeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0JqYjI1emRDQndZWEpoYlhOVGRISnBibWNnUFNCd1lYSnpaVlZTVEM1b1lYTm9Mbk4xWW5OMGNpZ3hLVnh1SUNBZ0lHeGxkQ0J2Y0hScGIyNXpJRDBnZTMxY2JpQWdJQ0JqYjI1emRDQnpaV0Z5WTJoUVlYSmhiWE1nUFNCdVpYY2dWVkpNVTJWaGNtTm9VR0Z5WVcxektIQmhjbUZ0YzFOMGNtbHVaeWxjYmlBZ0lDQm1iM0lnS0d4bGRDQnJaWGtnYjJZZ2MyVmhjbU5vVUdGeVlXMXpLU0I3WEc0Z0lDQWdJQ0J2Y0hScGIyNXpXMnRsZVZzd1hWMGdQU0JyWlhrdWJHVnVaM1JvSUQwOVBTQXlJRDhnYTJWNVd6RmRJRG9nSjJWdVlXSnNaV1FuWEc0Z0lDQWdmVnh1SUNBZ0lHTnZibk4wSUhCaGRHZ2dQU0J3WVhKelpWVlNUQzV2Y21sbmFXNGdLeUJ3WVhKelpWVlNUQzV3WVhSb2JtRnRaVnh1SUNBZ0lISmxkSFZ5YmlCN1lYVjBhRk4wY2l3Z2NHRjBhQ3dnYjNCMGFXOXVjMzFjYmlBZ2ZWeHVJQ0JuWlc1bGNtRjBaVkJoY21GdFpYUmxjaUFvWVhWMGFGTjBjaXdnY0dGMGFDd2daR0YwWVNrZ2UxeHVJQ0FnSUdsbUlDaGhkWFJvVTNSeUlDWW1JR0YxZEdoVGRISXVjM1JoY25SelYybDBhQ2duZEc5clpXNG5LU2tnZTF4dUlDQWdJQ0FnWkdGMFlTNXdZWEpoYlhNdWRXNXphR2xtZENoaGRYUm9VM1J5S1Z4dUlDQWdJSDFjYmlBZ0lDQmpiMjV6ZENCd1lYSmhiV1YwWlhJZ1BTQjdYRzRnSUNBZ0lDQjFjbXc2SUhCaGRHZ3NYRzRnSUNBZ0lDQnZjSFJwYjI1ek9pQjdYRzRnSUNBZ0lDQWdJRzFsZEdodlpEb2dKMUJQVTFRbkxGeHVJQ0FnSUNBZ0lDQm9aV0ZrWlhKek9pQjdYRzRnSUNBZ0lDQWdJQ0FnSjBOdmJuUmxiblF0ZEhsd1pTYzZJQ2RoY0hCc2FXTmhkR2x2Ymk5NExYZDNkeTFtYjNKdExYVnliR1Z1WTI5a1pXUTdJR05vWVhKelpYUTlWVlJHTFRnblhHNGdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJR0p2WkhrNklFcFRUMDR1YzNSeWFXNW5hV1o1S0dSaGRHRXBYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDaGhkWFJvVTNSeUlDWW1JR0YxZEdoVGRISXVjM1JoY25SelYybDBhQ2duUW1GemFXTW5LU2tnZTF4dUlDQWdJQ0FnY0dGeVlXMWxkR1Z5TG05d2RHbHZibk11YUdWaFpHVnljMXNuUVhWMGFHOXlhWHBoZEdsdmJpZGRJRDBnWVhWMGFGTjBjbHh1SUNBZ0lIMWNiaUFnSUNCeVpYUjFjbTRnY0dGeVlXMWxkR1Z5WEc0Z0lIMWNiaUFnTHk4Z1oyVjBJR0Z5YVdFeUlIWmxjbk5wYjI1Y2JpQWdaMlYwVm1WeWMybHZiaUFvY25CalVHRjBhQ3dnWld4bGJXVnVkQ2tnZTF4dUlDQWdJR3hsZENCa1lYUmhJRDBnZTF4dUlDQWdJQ0FnYW5OdmJuSndZem9nSnpJdU1DY3NYRzRnSUNBZ0lDQnRaWFJvYjJRNklDZGhjbWxoTWk1blpYUldaWEp6YVc5dUp5eGNiaUFnSUNBZ0lHbGtPaUF4TEZ4dUlDQWdJQ0FnY0dGeVlXMXpPaUJiWFZ4dUlDQWdJSDFjYmlBZ0lDQmpiMjV6ZENCN1lYVjBhRk4wY2l3Z2NHRjBhSDBnUFNCMGFHbHpMbkJoY25ObFZWSk1LSEp3WTFCaGRHZ3BYRzRnSUNBZ2RHaHBjeTV6Wlc1a1ZHOUNZV05yWjNKdmRXNWtLQ2R5Y0dOV1pYSnphVzl1Snl3Z2RHaHBjeTVuWlc1bGNtRjBaVkJoY21GdFpYUmxjaWhoZFhSb1UzUnlMQ0J3WVhSb0xDQmtZWFJoS1N3Z0tIWmxjbk5wYjI0cElEMCtJSHRjYmlBZ0lDQWdJR2xtSUNoMlpYSnphVzl1S1NCN1hHNGdJQ0FnSUNBZ0lHVnNaVzFsYm5RdWFXNXVaWEpVWlhoMElEMGdZRUZ5YVdFeTU0bUk1cHlzNUxpNk9pQWtlM1psY25OcGIyNTlZRnh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdaV3hsYldWdWRDNXBibTVsY2xSbGVIUWdQU0FuNlpTWjZLK3ZMT2l2dCthZnBlZWNpK2FZcitXUXB1VzhnT1dRcjBGeWFXRXlKMXh1SUNBZ0lDQWdmVnh1SUNBZ0lIMHBYRzRnSUgxY2JpQWdZMjl3ZVZSbGVIUWdLSFJsZUhRcElIdGNiaUFnSUNCamIyNXpkQ0JwYm5CMWRDQTlJR1J2WTNWdFpXNTBMbU55WldGMFpVVnNaVzFsYm5Rb0ozUmxlSFJoY21WaEp5bGNiaUFnSUNCa2IyTjFiV1Z1ZEM1aWIyUjVMbUZ3Y0dWdVpFTm9hV3hrS0dsdWNIVjBLVnh1SUNBZ0lHbHVjSFYwTG5aaGJIVmxJRDBnZEdWNGRGeHVJQ0FnSUdsdWNIVjBMbVp2WTNWektDbGNiaUFnSUNCcGJuQjFkQzV6Wld4bFkzUW9LVnh1SUNBZ0lHTnZibk4wSUhKbGMzVnNkQ0E5SUdSdlkzVnRaVzUwTG1WNFpXTkRiMjF0WVc1a0tDZGpiM0I1SnlsY2JpQWdJQ0JwYm5CMWRDNXlaVzF2ZG1Vb0tWeHVJQ0FnSUdsbUlDaHlaWE4xYkhRcElIdGNiaUFnSUNBZ0lIUm9hWE11YzJodmQxUnZZWE4wS0NmbWk3Zm90SjNtaUpEbGlwOStKeXdnSjNOMVkyTmxjM01uS1Z4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQjBhR2x6TG5Ob2IzZFViMkZ6ZENnbjVvdTM2TFNkNWFTeDZMU2xJRkZCVVNjc0lDZG1ZV2xzZFhKbEp5bGNiaUFnSUNCOVhHNGdJSDFjYmlBZ0x5OGdZMjl2YTJsbGN5Qm1iM0p0WVhRZ0lGdDdYQ0oxY214Y0lqb2dYQ0pvZEhSd09pOHZjR0Z1TG1KaGFXUjFMbU52YlM5Y0lpd2dYQ0p1WVcxbFhDSTZJRndpUWtSVlUxTmNJbjBzZTF3aWRYSnNYQ0k2SUZ3aWFIUjBjRG92TDNCamN5NWlZV2xrZFM1amIyMHZYQ0lzSUZ3aWJtRnRaVndpT2lCY0luQmpjMlYwZEZ3aWZWMWNiaUFnY21WeGRXVnpkRU52YjJ0cFpYTWdLR052YjJ0cFpYTXBJSHRjYmlBZ0lDQjBhR2x6TG5ObGJtUlViMEpoWTJ0bmNtOTFibVFvSjJkbGRFTnZiMnRwWlhNbkxDQmpiMjlyYVdWekxDQW9kbUZzZFdVcElEMCtJSHNnZEdocGN5NWpiMjlyYVdWeklEMGdkbUZzZFdVZ2ZTbGNiaUFnZlZ4dUlDQmhjbWxoTWxKUVEwMXZaR1VnS0hKd1kxQmhkR2dzSUdacGJHVkViM2R1Ykc5aFpFbHVabThwSUh0Y2JpQWdJQ0JqYjI1emRDQjdZWFYwYUZOMGNpd2djR0YwYUN3Z2IzQjBhVzl1YzMwZ1BTQjBhR2x6TG5CaGNuTmxWVkpNS0hKd1kxQmhkR2dwWEc0Z0lDQWdabWxzWlVSdmQyNXNiMkZrU1c1bWJ5NW1iM0pGWVdOb0tDaG1hV3hsS1NBOVBpQjdYRzRnSUNBZ0lDQmpiMjV6ZENCeWNHTkVZWFJoSUQwZ2UxeHVJQ0FnSUNBZ0lDQnFjMjl1Y25Cak9pQW5NaTR3Snl4Y2JpQWdJQ0FnSUNBZ2JXVjBhRzlrT2lBbllYSnBZVEl1WVdSa1ZYSnBKeXhjYmlBZ0lDQWdJQ0FnYVdRNklHNWxkeUJFWVhSbEtDa3VaMlYwVkdsdFpTZ3BMRnh1SUNBZ0lDQWdJQ0J3WVhKaGJYTTZJRnRjYmlBZ0lDQWdJQ0FnSUNCYlptbHNaUzVzYVc1clhTd2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2IzVjBPaUJtYVd4bExtNWhiV1VzWEc0Z0lDQWdJQ0FnSUNBZ0lDQm9aV0ZrWlhJNklIUm9hWE11WjJWMFNHVmhaR1Z5S0NsY2JpQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJRjFjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR052Ym5OMElHMWtOVU5vWldOcklEMGdkR2hwY3k1blpYUkRiMjVtYVdkRVlYUmhLQ2R0WkRWRGFHVmpheWNwWEc0Z0lDQWdJQ0JqYjI1emRDQnljR05QY0hScGIyNGdQU0J5Y0dORVlYUmhMbkJoY21GdGMxc3hYVnh1SUNBZ0lDQWdZMjl1YzNRZ1pHbHlJRDBnZEdocGN5NW5aWFJEYjI1bWFXZEVZWFJoS0Nka2IzZHViRzloWkZCaGRHZ25LVnh1SUNBZ0lDQWdhV1lnS0dScGNpa2dlMXh1SUNBZ0lDQWdJQ0J5Y0dOUGNIUnBiMjViSjJScGNpZGRJRDBnWkdseVhHNGdJQ0FnSUNCOVhHNGdJQ0FnSUNCcFppQW9iV1ExUTJobFkyc3BJSHRjYmlBZ0lDQWdJQ0FnY25CalQzQjBhVzl1V3lkamFHVmphM04xYlNkZElEMGdZRzFrTlQwa2UyWnBiR1V1YldRMWZXQmNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lHbG1JQ2h2Y0hScGIyNXpLU0I3WEc0Z0lDQWdJQ0FnSUdadmNpQW9iR1YwSUd0bGVTQnBiaUJ2Y0hScGIyNXpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ2NuQmpUM0IwYVc5dVcydGxlVjBnUFNCdmNIUnBiMjV6VzJ0bGVWMWNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdkR2hwY3k1elpXNWtWRzlDWVdOclozSnZkVzVrS0NkeWNHTkVZWFJoSnl3Z2RHaHBjeTVuWlc1bGNtRjBaVkJoY21GdFpYUmxjaWhoZFhSb1UzUnlMQ0J3WVhSb0xDQnljR05FWVhSaEtTd2dLSE4xWTJObGMzTXBJRDArSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLSE4xWTJObGMzTXBJSHRjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMbk5vYjNkVWIyRnpkQ2duNUxpTDZMMjk1b2lRNVlxZkllaTF0dWUwcCtXT3UrZWNpK2VjaStXUXAzNG5MQ0FuYzNWalkyVnpjeWNwWEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTV6YUc5M1ZHOWhjM1FvSitTNGkraTl2ZVdrc2VpMHBTSG1tSy9rdUkzbW1LL21zcUhtbklubHZJRGxrSzlCY21saE1qOG5MQ0FuWm1GcGJIVnlaU2NwWEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgwcFhHNGdJQ0FnZlNsY2JpQWdmVnh1SUNCaGNtbGhNbFJZVkUxdlpHVWdLR1pwYkdWRWIzZHViRzloWkVsdVptOHBJSHRjYmlBZ0lDQmpiMjV6ZENCaGNtbGhNa050WkZSNGRDQTlJRnRkWEc0Z0lDQWdZMjl1YzNRZ1lYSnBZVEpVZUhRZ1BTQmJYVnh1SUNBZ0lHTnZibk4wSUdsa2JWUjRkQ0E5SUZ0ZFhHNGdJQ0FnWTI5dWMzUWdaRzkzYm14dllXUk1hVzVyVkhoMElEMGdXMTFjYmlBZ0lDQmpiMjV6ZENCd2NtVm1hWGhVZUhRZ1BTQW5aR0YwWVRwMFpYaDBMM0JzWVdsdU8yTm9ZWEp6WlhROWRYUm1MVGdzSjF4dUlDQWdJR1pwYkdWRWIzZHViRzloWkVsdVptOHVabTl5UldGamFDZ29abWxzWlNrZ1BUNGdlMXh1SUNBZ0lDQWdiR1YwSUdGeWFXRXlRMjFrVEdsdVpTQTlJR0JoY21saE1tTWdMV01nTFhNeE1DQXRhekZOSUMxNE1UWWdMUzFsYm1GaWJHVXRjbkJqUFdaaGJITmxJQzF2SUNSN1NsTlBUaTV6ZEhKcGJtZHBabmtvWm1sc1pTNXVZVzFsS1gwZ0pIdDBhR2x6TG1kbGRFaGxZV1JsY2lnbllYSnBZVEpEYldRbktYMGdKSHRLVTA5T0xuTjBjbWx1WjJsbWVTaG1hV3hsTG14cGJtc3BmV0JjYmlBZ0lDQWdJR3hsZENCaGNtbGhNa3hwYm1VZ1BTQmJabWxzWlM1c2FXNXJMQ0IwYUdsekxtZGxkRWhsWVdSbGNpZ25ZWEpwWVRKakp5a3NJR0FnYjNWMFBTUjdabWxzWlM1dVlXMWxmV0JkTG1wdmFXNG9KMXhjYmljcFhHNGdJQ0FnSUNCamIyNXpkQ0J0WkRWRGFHVmpheUE5SUhSb2FYTXVaMlYwUTI5dVptbG5SR0YwWVNnbmJXUTFRMmhsWTJzbktWeHVJQ0FnSUNBZ2FXWWdLRzFrTlVOb1pXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdGeWFXRXlRMjFrVEdsdVpTQXJQU0JnSUMwdFkyaGxZMnR6ZFcwOWJXUTFQU1I3Wm1sc1pTNXRaRFY5WUZ4dUlDQWdJQ0FnSUNCaGNtbGhNa3hwYm1VZ0t6MGdZQ0JqYUdWamEzTjFiVDF0WkRVOUpIdG1hV3hsTG0xa05YMWdYRzRnSUNBZ0lDQjlYRzRnSUNBZ0lDQmhjbWxoTWtOdFpGUjRkQzV3ZFhOb0tHRnlhV0V5UTIxa1RHbHVaU2xjYmlBZ0lDQWdJR0Z5YVdFeVZIaDBMbkIxYzJnb1lYSnBZVEpNYVc1bEtWeHVJQ0FnSUNBZ1kyOXVjM1FnYVdSdFRHbHVaU0E5SUZzblBDY3NJR1pwYkdVdWJHbHVheXdnZEdocGN5NW5aWFJJWldGa1pYSW9KMmxrYlNjcExDQW5QaWRkTG1wdmFXNG9KMXhjY2x4Y2JpY3BYRzRnSUNBZ0lDQnBaRzFVZUhRdWNIVnphQ2hwWkcxTWFXNWxLVnh1SUNBZ0lDQWdaRzkzYm14dllXUk1hVzVyVkhoMExuQjFjMmdvWm1sc1pTNXNhVzVyS1Z4dUlDQWdJSDBwWEc0Z0lDQWdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbkkyRnlhV0V5UTIxa1ZIaDBKeWt1ZG1Gc2RXVWdQU0JnSkh0aGNtbGhNa050WkZSNGRDNXFiMmx1S0NkY1hHNG5LWDFnWEc0Z0lDQWdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbkkyRnlhV0V5VkhoMEp5a3VhSEpsWmlBOUlHQWtlM0J5WldacGVGUjRkSDBrZTJWdVkyOWtaVlZTU1VOdmJYQnZibVZ1ZENoaGNtbGhNbFI0ZEM1cWIybHVLQ2RjWEc0bktTbDlZRnh1SUNBZ0lHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOcFpHMVVlSFFuS1M1b2NtVm1JRDBnWUNSN2NISmxabWw0VkhoMGZTUjdaVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLR2xrYlZSNGRDNXFiMmx1S0NkY1hISmNYRzRuS1NBcklDZGNYSEpjWEc0bktYMWdYRzRnSUNBZ1pHOWpkVzFsYm5RdWNYVmxjbmxUWld4bFkzUnZjaWduSTJSdmQyNXNiMkZrVEdsdWExUjRkQ2NwTG1oeVpXWWdQU0JnSkh0d2NtVm1hWGhVZUhSOUpIdGxibU52WkdWVlVrbERiMjF3YjI1bGJuUW9aRzkzYm14dllXUk1hVzVyVkhoMExtcHZhVzRvSjF4Y2JpY3BLWDFnWEc0Z0lDQWdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbkkyTnZjSGxFYjNkdWJHOWhaRXhwYm10VWVIUW5LUzVrWVhSaGMyVjBMbXhwYm1zZ1BTQmtiM2R1Ykc5aFpFeHBibXRVZUhRdWFtOXBiaWduWEZ4dUp5bGNiaUFnZlZ4dWZWeHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQnVaWGNnUTI5eVpTZ3BYRzRpTENKcGJYQnZjblFnUTI5eVpTQm1jbTl0SUNjdUwyTnZjbVVuWEc1Y2JtTnNZWE56SUVSdmQyNXNiMkZrWlhJZ2UxeHVJQ0JqYjI1emRISjFZM1J2Y2lBb2JHbHpkRkJoY21GdFpYUmxjaWtnZTF4dUlDQWdJSFJvYVhNdWJHbHpkRkJoY21GdFpYUmxjaUE5SUd4cGMzUlFZWEpoYldWMFpYSmNiaUFnSUNCMGFHbHpMbVpwYkdWRWIzZHViRzloWkVsdVptOGdQU0JiWFZ4dUlDQWdJSFJvYVhNdVkzVnljbVZ1ZEZSaGMydEpaQ0E5SURCY2JpQWdJQ0IwYUdsekxtTnZiWEJzWlhSbFpFTnZkVzUwSUQwZ01GeHVJQ0FnSUhSb2FYTXVabTlzWkdWeWN5QTlJRnRkWEc0Z0lDQWdkR2hwY3k1bWFXeGxjeUE5SUh0OVhHNGdJSDFjYmlBZ2MzUmhjblFnS0dsdWRHVnlkbUZzSUQwZ016QXdMQ0JrYjI1bEtTQjdYRzRnSUNBZ2RHaHBjeTVwYm5SbGNuWmhiQ0E5SUdsdWRHVnlkbUZzWEc0Z0lDQWdkR2hwY3k1a2IyNWxJRDBnWkc5dVpWeHVJQ0FnSUhSb2FYTXVZM1Z5Y21WdWRGUmhjMnRKWkNBOUlHNWxkeUJFWVhSbEtDa3VaMlYwVkdsdFpTZ3BYRzRnSUNBZ2RHaHBjeTVuWlhST1pYaDBSbWxzWlNoMGFHbHpMbU4xY25KbGJuUlVZWE5yU1dRcFhHNGdJSDFjYmlBZ2NtVnpaWFFnS0NrZ2UxeHVJQ0FnSUhSb2FYTXVabWxzWlVSdmQyNXNiMkZrU1c1bWJ5QTlJRnRkWEc0Z0lDQWdkR2hwY3k1amRYSnlaVzUwVkdGemEwbGtJRDBnTUZ4dUlDQWdJSFJvYVhNdVptOXNaR1Z5Y3lBOUlGdGRYRzRnSUNBZ2RHaHBjeTVtYVd4bGN5QTlJSHQ5WEc0Z0lDQWdkR2hwY3k1amIyMXdiR1YwWldSRGIzVnVkQ0E5SURCY2JpQWdmVnh1SUNCaFpHUkdiMnhrWlhJZ0tIQmhkR2dwSUh0Y2JpQWdJQ0IwYUdsekxtWnZiR1JsY25NdWNIVnphQ2h3WVhSb0tWeHVJQ0I5WEc0Z0lHRmtaRVpwYkdVZ0tHWnBiR1VwSUh0Y2JpQWdJQ0IwYUdsekxtWnBiR1Z6VzJacGJHVXVabk5mYVdSZElEMGdabWxzWlZ4dUlDQjlYRzRnSUdkbGRFNWxlSFJHYVd4bElDaDBZWE5yU1dRcElIdGNiaUFnSUNCcFppQW9kR0Z6YTBsa0lDRTlQU0IwYUdsekxtTjFjbkpsYm5SVVlYTnJTV1FwSUh0Y2JpQWdJQ0FnSUhKbGRIVnlibHh1SUNBZ0lIMWNiaUFnSUNCcFppQW9kR2hwY3k1bWIyeGtaWEp6TG14bGJtZDBhQ0FoUFQwZ01Da2dlMXh1SUNBZ0lDQWdkR2hwY3k1amIyMXdiR1YwWldSRGIzVnVkQ3NyWEc0Z0lDQWdJQ0JEYjNKbExuTm9iM2RVYjJGemRDaGc1cTJqNVp5bzZJNjM1WStXNXBhSDVMdTI1WWlYNktHb0xpNHVJQ1I3ZEdocGN5NWpiMjF3YkdWMFpXUkRiM1Z1ZEgwdkpIdDBhR2x6TG1OdmJYQnNaWFJsWkVOdmRXNTBJQ3NnZEdocGN5NW1iMnhrWlhKekxteGxibWQwYUNBdElERjlZQ3dnSjNOMVkyTmxjM01uS1Z4dUlDQWdJQ0FnWTI5dWMzUWdaR2x5SUQwZ2RHaHBjeTVtYjJ4a1pYSnpMbkJ2Y0NncFhHNGdJQ0FnSUNCMGFHbHpMbXhwYzNSUVlYSmhiV1YwWlhJdWMyVmhjbU5vTG1ScGNpQTlJR1JwY2x4dUlDQWdJQ0FnWm1WMFkyZ29ZQ1I3ZDJsdVpHOTNMbXh2WTJGMGFXOXVMbTl5YVdkcGJuMGtlM1JvYVhNdWJHbHpkRkJoY21GdFpYUmxjaTUxY214OUpIdERiM0psTG05aWFtVmpkRlJ2VVhWbGNubFRkSEpwYm1jb2RHaHBjeTVzYVhOMFVHRnlZVzFsZEdWeUxuTmxZWEpqYUNsOVlDd2dkR2hwY3k1c2FYTjBVR0Z5WVcxbGRHVnlMbTl3ZEdsdmJuTXBMblJvWlc0b0tISmxjM0J2Ym5ObEtTQTlQaUI3WEc0Z0lDQWdJQ0FnSUdsbUlDaHlaWE53YjI1elpTNXZheWtnZTF4dUlDQWdJQ0FnSUNBZ0lISmxjM0J2Ym5ObExtcHpiMjRvS1M1MGFHVnVLQ2hrWVhSaEtTQTlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnpaWFJVYVcxbGIzVjBLQ2dwSUQwK0lIUm9hWE11WjJWMFRtVjRkRVpwYkdVb2RHRnphMGxrS1N3Z2RHaHBjeTVwYm5SbGNuWmhiQ2xjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hrWVhSaExtVnljbTV2SUNFOVBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRU52Y21VdWMyaHZkMVJ2WVhOMEtDZm1uS3JubjZYcGxKbm9yNjhuTENBblptRnBiSFZ5WlNjcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHUmhkR0VwWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJseHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdaR0YwWVM1c2FYTjBMbVp2Y2tWaFkyZ29LR2wwWlcwcElEMCtJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dsMFpXMHVhWE5rYVhJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TG1admJHUmxjbk11Y0hWemFDaHBkR1Z0TG5CaGRHZ3BYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVtYVd4bGMxdHBkR1Z0TG1aelgybGtYU0E5SUdsMFpXMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNsY2JpQWdJQ0FnSUNBZ0lDQjlLVnh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktISmxjM0J2Ym5ObEtWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQjlLUzVqWVhSamFDZ29aWEp5S1NBOVBpQjdYRzRnSUNBZ0lDQWdJRU52Y21VdWMyaHZkMVJ2WVhOMEtDZm52WkhudTV6b3I3Zm1zWUxscExIb3RLVW5MQ0FuWm1GcGJIVnlaU2NwWEc0Z0lDQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktHVnljaWxjYmlBZ0lDQWdJQ0FnYzJWMFZHbHRaVzkxZENnb0tTQTlQaUIwYUdsekxtZGxkRTVsZUhSR2FXeGxLSFJoYzJ0SlpDa3NJSFJvYVhNdWFXNTBaWEoyWVd3cFhHNGdJQ0FnSUNCOUtWeHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RHaHBjeTVtYVd4bGN5NXNaVzVuZEdnZ0lUMDlJREFwSUh0Y2JpQWdJQ0FnSUVOdmNtVXVjMmh2ZDFSdllYTjBLQ2ZtcmFQbG5Lam9qcmZsajVia3VJdm92YjNsbkxEbG5ZQXVMaTRuTENBbmMzVmpZMlZ6Y3ljcFhHNGdJQ0FnSUNCMGFHbHpMbWRsZEVacGJHVnpLSFJvYVhNdVptbHNaWE1wTG5Sb1pXNG9LQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TG1SdmJtVW9kR2hwY3k1bWFXeGxSRzkzYm14dllXUkpibVp2S1Z4dUlDQWdJQ0FnZlNsY2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdRMjl5WlM1emFHOTNWRzloYzNRb0orUzRnT1M0cXVhV2grUzd0dW1EdmVheW9lYWNpZVdUcGk0dUxpY3NJQ2RqWVhWMGFXOXVKeWxjYmlBZ0lDQWdJSFJvYVhNdWNtVnpaWFFvS1Z4dUlDQWdJSDFjYmlBZ2ZWeHVYRzRnSUdkbGRFWnBiR1Z6SUNobWFXeGxjeWtnZTF4dUlDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25jM1ZpWTJ4aGMzTWdjMmh2ZFd4a0lHbHRjR3hsYldWdWRDQjBhR2x6SUcxbGRHaHZaQ0VuS1Z4dUlDQjlYRzU5WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUVSdmQyNXNiMkZrWlhKY2JpSXNJbWx0Y0c5eWRDQkZkbVZ1ZEVWdGFYUjBaWElnWm5KdmJTQW5MaTlGZG1WdWRFVnRhWFIwWlhJblhHNWNibU5zWVhOeklGTjBiM0psSUdWNGRHVnVaSE1nUlhabGJuUkZiV2wwZEdWeUlIdGNiaUFnWTI5dWMzUnlkV04wYjNJZ0tDa2dlMXh1SUNBZ0lITjFjR1Z5S0NsY2JpQWdJQ0IwYUdsekxtUmxabUYxYkhSU1VFTWdQU0JiZTI1aGJXVTZJQ2RCVWtsQk1pQlNVRU1uTENCMWNtdzZJQ2RvZEhSd09pOHZiRzlqWVd4b2IzTjBPalk0TURBdmFuTnZibkp3WXlkOVhWeHVJQ0FnSUhSb2FYTXVaR1ZtWVhWc2RGVnpaWEpCWjJWdWRDQTlJQ2R1WlhSa2FYTnJPelV1TXk0MExqVTdVRU03VUVNdFYybHVaRzkzY3pzMUxqRXVNall3TUR0WGFXNWtiM2R6UW1GcFpIVlpkVzVIZFdGdVNtbGhKMXh1SUNBZ0lIUm9hWE11WkdWbVlYVnNkRkpsWm1WeVpYSWdQU0FuYUhSMGNITTZMeTl3WVc0dVltRnBaSFV1WTI5dEwyUnBjMnN2YUc5dFpTZGNiaUFnSUNCMGFHbHpMbVJsWm1GMWJIUkRiMjVtYVdkRVlYUmhJRDBnZTF4dUlDQWdJQ0FnY25CalRHbHpkRG9nZEdocGN5NWtaV1poZFd4MFVsQkRMRnh1SUNBZ0lDQWdZMjl1Wm1sblUzbHVZem9nWm1Gc2MyVXNYRzRnSUNBZ0lDQnRaRFZEYUdWamF6b2dabUZzYzJVc1hHNGdJQ0FnSUNCbWIyeGtPaUF3TEZ4dUlDQWdJQ0FnYVc1MFpYSjJZV3c2SURNd01DeGNiaUFnSUNBZ0lHUnZkMjVzYjJGa1VHRjBhRG9nSnljc1hHNGdJQ0FnSUNCMWMyVnlRV2RsYm5RNklIUm9hWE11WkdWbVlYVnNkRlZ6WlhKQloyVnVkQ3hjYmlBZ0lDQWdJSEpsWm1WeVpYSTZJSFJvYVhNdVpHVm1ZWFZzZEZKbFptVnlaWElzWEc0Z0lDQWdJQ0JvWldGa1pYSnpPaUFuSjF4dUlDQWdJSDFjYmlBZ0lDQjBhR2x6TG1OdmJtWnBaMFJoZEdFZ1BTQjdmVnh1SUNBZ0lIUm9hWE11YjI0b0oybHVhWFJEYjI1bWFXZEVZWFJoSnl3Z2RHaHBjeTVwYm1sMExtSnBibVFvZEdocGN5a3BYRzRnSUNBZ2RHaHBjeTV2YmlnbmMyVjBRMjl1Wm1sblJHRjBZU2NzSUhSb2FYTXVjMlYwTG1KcGJtUW9kR2hwY3lrcFhHNGdJQ0FnZEdocGN5NXZiaWduWTJ4bFlYSkRiMjVtYVdkRVlYUmhKeXdnZEdocGN5NWpiR1ZoY2k1aWFXNWtLSFJvYVhNcEtWeHVJQ0I5WEc0Z0lHbHVhWFFnS0NrZ2UxeHVJQ0FnSUdOb2NtOXRaUzV6ZEc5eVlXZGxMbk41Ym1NdVoyVjBLRzUxYkd3c0lDaHBkR1Z0Y3lrZ1BUNGdlMXh1SUNBZ0lDQWdabTl5SUNoc1pYUWdhMlY1SUdsdUlHbDBaVzF6S1NCN1hHNGdJQ0FnSUNBZ0lHTm9jbTl0WlM1emRHOXlZV2RsTG14dlkyRnNMbk5sZENoN2EyVjVPaUJwZEdWdGMxdHJaWGxkZlN3Z0tDa2dQVDRnZTF4dUlDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LQ2RqYUhKdmJXVWdabWx5YzNRZ2JHOWpZV3dnYzJWME9pQWxjeXdnSlhNbkxDQnJaWGtzSUdsMFpXMXpXMnRsZVYwcFhHNGdJQ0FnSUNBZ0lIMHBYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZTbGNiaUFnSUNCamFISnZiV1V1YzNSdmNtRm5aUzVzYjJOaGJDNW5aWFFvYm5Wc2JDd2dLR2wwWlcxektTQTlQaUI3WEc0Z0lDQWdJQ0IwYUdsekxtTnZibVpwWjBSaGRHRWdQU0JQWW1wbFkzUXVZWE56YVdkdUtIdDlMQ0IwYUdsekxtUmxabUYxYkhSRGIyNW1hV2RFWVhSaExDQnBkR1Z0Y3lsY2JpQWdJQ0FnSUhSb2FYTXVkSEpwWjJkbGNpZ25kWEJrWVhSbFZtbGxkeWNzSUhSb2FYTXVZMjl1Wm1sblJHRjBZU2xjYmlBZ0lDQjlLVnh1SUNCOVhHNGdJR2RsZEVOdmJtWnBaMFJoZEdFZ0tHdGxlU0E5SUc1MWJHd3BJSHRjYmlBZ0lDQnBaaUFvYTJWNUtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVqYjI1bWFXZEVZWFJoVzJ0bGVWMWNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnY21WMGRYSnVJSFJvYVhNdVkyOXVabWxuUkdGMFlWeHVJQ0FnSUgxY2JpQWdmVnh1SUNCelpYUWdLR052Ym1acFowUmhkR0VwSUh0Y2JpQWdJQ0IwYUdsekxtTnZibVpwWjBSaGRHRWdQU0JqYjI1bWFXZEVZWFJoWEc0Z0lDQWdkR2hwY3k1ellYWmxLR052Ym1acFowUmhkR0VwWEc0Z0lDQWdkR2hwY3k1MGNtbG5aMlZ5S0NkMWNHUmhkR1ZXYVdWM0p5d2dZMjl1Wm1sblJHRjBZU2xjYmlBZ2ZWeHVJQ0J6WVhabElDaGpiMjVtYVdkRVlYUmhLU0I3WEc0Z0lDQWdabTl5SUNoc1pYUWdhMlY1SUdsdUlHTnZibVpwWjBSaGRHRXBJSHRjYmlBZ0lDQWdJR05vY205dFpTNXpkRzl5WVdkbExteHZZMkZzTG5ObGRDaDdXMnRsZVYwNklHTnZibVpwWjBSaGRHRmJhMlY1WFgwc0lDZ3BJRDArSUh0Y2JpQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1c2IyY29KMk5vY205dFpTQnNiMk5oYkNCelpYUTZJQ1Z6TENBbGN5Y3NJR3RsZVN3Z1kyOXVabWxuUkdGMFlWdHJaWGxkS1Z4dUlDQWdJQ0FnZlNsY2JpQWdJQ0FnSUdsbUlDaGpiMjVtYVdkRVlYUmhXeWRqYjI1bWFXZFRlVzVqSjEwZ1BUMDlJSFJ5ZFdVcElIdGNiaUFnSUNBZ0lDQWdZMmh5YjIxbExuTjBiM0poWjJVdWMzbHVZeTV6WlhRb2UxdHJaWGxkT2lCamIyNW1hV2RFWVhSaFcydGxlVjE5TENBb0tTQTlQaUI3WEc0Z0lDQWdJQ0FnSUNBZ1kyOXVjMjlzWlM1c2IyY29KMk5vY205dFpTQnplVzVqSUhObGREb2dKWE1zSUNWekp5d2dhMlY1TENCamIyNW1hV2RFWVhSaFcydGxlVjBwWEc0Z0lDQWdJQ0FnSUgwcFhHNGdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQjlYRzRnSUdOc1pXRnlJQ2dwSUh0Y2JpQWdJQ0JqYUhKdmJXVXVjM1J2Y21GblpTNXplVzVqTG1Oc1pXRnlLQ2xjYmlBZ0lDQmphSEp2YldVdWMzUnZjbUZuWlM1c2IyTmhiQzVqYkdWaGNpZ3BYRzRnSUNBZ2RHaHBjeTVqYjI1bWFXZEVZWFJoSUQwZ2RHaHBjeTVrWldaaGRXeDBRMjl1Wm1sblJHRjBZVnh1SUNBZ0lIUm9hWE11ZEhKcFoyZGxjaWduZFhCa1lYUmxWbWxsZHljc0lIUm9hWE11WTI5dVptbG5SR0YwWVNsY2JpQWdmVnh1ZlZ4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCdVpYY2dVM1J2Y21Vb0tWeHVJaXdpYVcxd2IzSjBJRU52Y21VZ1puSnZiU0FuTGk5amIzSmxKMXh1YVcxd2IzSjBJRk4wYjNKbElHWnliMjBnSnk0dmMzUnZjbVVuWEc1Y2JtTnNZWE56SUZWSklIdGNiaUFnWTI5dWMzUnlkV04wYjNJZ0tDa2dlMXh1SUNBZ0lIUm9hWE11ZG1WeWMybHZiaUE5SUNjeExqQXVNaWRjYmlBZ0lDQjBhR2x6TG5Wd1pHRjBaVVJoZEdVZ1BTQW5NakF4Tnk4eE1pOHpNQ2RjYmlBZ0lDQlRkRzl5WlM1dmJpZ25kWEJrWVhSbFZtbGxkeWNzSUNoamIyNW1hV2RFWVhSaEtTQTlQaUI3WEc0Z0lDQWdJQ0IwYUdsekxuVndaR0YwWlZObGRIUnBibWNvWTI5dVptbG5SR0YwWVNsY2JpQWdJQ0FnSUhSb2FYTXVkWEJrWVhSbFRXVnVkU2hqYjI1bWFXZEVZWFJoS1Z4dUlDQWdJSDBwWEc0Z0lIMWNiaUFnYVc1cGRDQW9LU0I3WEc0Z0lDQWdkR2hwY3k1aFpHUlRaWFIwYVc1blZVa29LVnh1SUNBZ0lIUm9hWE11WVdSa1ZHVjRkRVY0Y0c5eWRDZ3BYRzRnSUNBZ1UzUnZjbVV1ZEhKcFoyZGxjaWduYVc1cGRFTnZibVpwWjBSaGRHRW5LVnh1SUNCOVhHNGdJQzh2SUhvdGFXNWtaWGdnY21WemIyeDJaU0J6YUdGeVpTQndZV2RsSUhOb2IzY2djSEp2WW14bGJWeHVJQ0JoWkdSTlpXNTFJQ2hsYkdWdFpXNTBMQ0J3YjNOcGRHbHZiaWtnZTF4dUlDQWdJR052Ym5OMElHMWxiblVnUFNCZ1hHNGdJQ0FnSUNBOFpHbDJJR2xrUFZ3aVpYaHdiM0owVFdWdWRWd2lJR05zWVhOelBWd2laeTFrY205d1pHOTNiaTFpZFhSMGIyNWNJajVjYmlBZ0lDQWdJQ0FnUEdFZ1kyeGhjM005WENKbkxXSjFkSFJ2Ymx3aVBseHVJQ0FnSUNBZ0lDQWdJRHh6Y0dGdUlHTnNZWE56UFZ3aVp5MWlkWFIwYjI0dGNtbG5hSFJjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJRHhsYlNCamJHRnpjejFjSW1samIyNGdhV052Ymkxa2IzZHViRzloWkZ3aVBqd3ZaVzArWEc0Z0lDQWdJQ0FnSUNBZ0lDQThjM0JoYmlCamJHRnpjejFjSW5SbGVIUmNJajdscjd6bGg3cmt1SXZvdmIwOEwzTndZVzQrWEc0Z0lDQWdJQ0FnSUNBZ1BDOXpjR0Z1UGx4dUlDQWdJQ0FnSUNBOEwyRStYRzRnSUNBZ0lDQWdJRHhrYVhZZ2FXUTlYQ0poY21saE1reHBjM1JjSWlCamJHRnpjejFjSW0xbGJuVmNJaUJ6ZEhsc1pUMWNJbm90YVc1a1pYZzZOVEE3WENJK1hHNGdJQ0FnSUNBZ0lDQWdQR0VnWTJ4aGMzTTlYQ0puTFdKMWRIUnZiaTF0Wlc1MVhDSWdhV1E5WENKaGNtbGhNbFJsZUhSY0lpQm9jbVZtUFZ3aWFtRjJZWE5qY21sd2REcDJiMmxrS0RBcE8xd2lQdWFXaCthY3JPV3Z2T1dIdWp3dllUNWNiaUFnSUNBZ0lDQWdJQ0E4WVNCamJHRnpjejFjSW1jdFluVjBkRzl1TFcxbGJuVmNJaUJwWkQxY0luTmxkSFJwYm1kQ2RYUjBiMjVjSWlCb2NtVm1QVndpYW1GMllYTmpjbWx3ZERwMmIybGtLREFwTzF3aVB1aXV2dWU5cmp3dllUNWNiaUFnSUNBZ0lDQWdQQzlrYVhZK1hHNGdJQ0FnSUNBOEwyUnBkajVnWEc0Z0lDQWdaV3hsYldWdWRDNXBibk5sY25SQlpHcGhZMlZ1ZEVoVVRVd29jRzl6YVhScGIyNHNJRzFsYm5VcFhHNGdJQ0FnWTI5dWMzUWdaWGh3YjNKMFRXVnVkU0E5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeU5sZUhCdmNuUk5aVzUxSnlsY2JpQWdJQ0JsZUhCdmNuUk5aVzUxTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvSjIxdmRYTmxaVzUwWlhJbkxDQW9LU0E5UGlCN1hHNGdJQ0FnSUNCbGVIQnZjblJOWlc1MUxtTnNZWE56VEdsemRDNWhaR1FvSjJKMWRIUnZiaTF2Y0dWdUp5bGNiaUFnSUNCOUtWeHVJQ0FnSUdWNGNHOXlkRTFsYm5VdVlXUmtSWFpsYm5STWFYTjBaVzVsY2lnbmJXOTFjMlZzWldGMlpTY3NJQ2dwSUQwK0lIdGNiaUFnSUNBZ0lHVjRjRzl5ZEUxbGJuVXVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTZ25ZblYwZEc5dUxXOXdaVzRuS1Z4dUlDQWdJSDBwWEc0Z0lDQWdZMjl1YzNRZ2MyVjBkR2x1WjBKMWRIUnZiaUE5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeU56WlhSMGFXNW5RblYwZEc5dUp5bGNiaUFnSUNCamIyNXpkQ0J6WlhSMGFXNW5UV1Z1ZFNBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOelpYUjBhVzVuVFdWdWRTY3BYRzRnSUNBZ2MyVjBkR2x1WjBKMWRIUnZiaTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2RqYkdsamF5Y3NJQ2dwSUQwK0lIdGNiaUFnSUNBZ0lITmxkSFJwYm1kTlpXNTFMbU5zWVhOelRHbHpkQzVoWkdRb0oyOXdaVzR0YnljcFhHNGdJQ0FnZlNsY2JpQWdmVnh1SUNCeVpYTmxkRTFsYm5VZ0tDa2dlMXh1SUNBZ0lHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0pCYkd3b0p5NXljR010WW5WMGRHOXVKeWt1Wm05eVJXRmphQ2dvY25CaktTQTlQaUI3WEc0Z0lDQWdJQ0J5Y0dNdWNtVnRiM1psS0NsY2JpQWdJQ0I5S1Z4dUlDQjlYRzRnSUhWd1pHRjBaVTFsYm5VZ0tHTnZibVpwWjBSaGRHRXBJSHRjYmlBZ0lDQjBhR2x6TG5KbGMyVjBUV1Z1ZFNncFhHNGdJQ0FnWTI5dWMzUWdleUJ5Y0dOTWFYTjBJSDBnUFNCamIyNW1hV2RFWVhSaFhHNGdJQ0FnYkdWMElISndZMFJQVFV4cGMzUWdQU0FuSjF4dUlDQWdJSEp3WTB4cGMzUXVabTl5UldGamFDZ29jbkJqS1NBOVBpQjdYRzRnSUNBZ0lDQmpiMjV6ZENCeWNHTkVUMDBnUFNCZ1BHRWdZMnhoYzNNOVhDSm5MV0oxZEhSdmJpMXRaVzUxSUhKd1l5MWlkWFIwYjI1Y0lpQm9jbVZtUFZ3aWFtRjJZWE5qY21sd2REcDJiMmxrS0RBcE8xd2lJR1JoZEdFdGRYSnNQU1I3Y25CakxuVnliSDArSkh0eWNHTXVibUZ0WlgwOEwyRStZRnh1SUNBZ0lDQWdjbkJqUkU5TlRHbHpkQ0FyUFNCeWNHTkVUMDFjYmlBZ0lDQjlLVnh1SUNBZ0lHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOaGNtbGhNa3hwYzNRbktTNXBibk5sY25SQlpHcGhZMlZ1ZEVoVVRVd29KMkZtZEdWeVltVm5hVzRuTENCeWNHTkVUMDFNYVhOMEtWeHVJQ0I5WEc0Z0lHRmtaRlJsZUhSRmVIQnZjblFnS0NrZ2UxeHVJQ0FnSUdOdmJuTjBJSFJsZUhRZ1BTQmdYRzRnSUNBZ0lDQThaR2wySUdsa1BWd2lkR1Y0ZEUxbGJuVmNJaUJqYkdGemN6MWNJbTF2WkdGc0lHVjRjRzl5ZEMxdFpXNTFYQ0krWEc0Z0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnRiMlJoYkMxcGJtNWxjbHdpUGx4dUlDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p0YjJSaGJDMW9aV0ZrWlhKY0lqNWNiaUFnSUNBZ0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnRiMlJoYkMxMGFYUnNaVndpUHVhV2grYWNyT1d2dk9XSHVqd3ZaR2wyUGx4dUlDQWdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW0xdlpHRnNMV05zYjNObFhDSSt3NWM4TDJScGRqNWNiaUFnSUNBZ0lDQWdJQ0E4TDJScGRqNWNiaUFnSUNBZ0lDQWdJQ0E4WkdsMklHTnNZWE56UFZ3aWJXOWtZV3d0WW05a2VWd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbVY0Y0c5eWRDMXRaVzUxTFhKdmQxd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThZU0JqYkdGemN6MWNJbVY0Y0c5eWRDMXRaVzUxTFdKMWRIUnZibHdpSUdoeVpXWTlYQ0pxWVhaaGMyTnlhWEIwT25admFXUW9NQ2s3WENJZ2FXUTlYQ0poY21saE1sUjRkRndpSUdSdmQyNXNiMkZrUFZ3aVlYSnBZVEpqTG1SdmQyNWNJajdsclpqa3VMcEJjbWxoTXVhV2grUzd0and2WVQ1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdFZ1kyeGhjM005WENKbGVIQnZjblF0YldWdWRTMWlkWFIwYjI1Y0lpQm9jbVZtUFZ3aWFtRjJZWE5qY21sd2REcDJiMmxrS0RBcE8xd2lJR2xrUFZ3aWFXUnRWSGgwWENJZ1pHOTNibXh2WVdROVhDSnBaRzB1WldZeVhDSSs1YTJZNUxpNlNVUk41cGFINUx1MlBDOWhQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThZU0JqYkdGemN6MWNJbVY0Y0c5eWRDMXRaVzUxTFdKMWRIUnZibHdpSUdoeVpXWTlYQ0pxWVhaaGMyTnlhWEIwT25admFXUW9NQ2s3WENJZ2FXUTlYQ0prYjNkdWJHOWhaRXhwYm10VWVIUmNJaUJrYjNkdWJHOWhaRDFjSW14cGJtc3VkSGgwWENJKzVMK2Q1YTJZNUxpTDZMMjk2Wk8rNW82bFBDOWhQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThZU0JqYkdGemN6MWNJbVY0Y0c5eWRDMXRaVzUxTFdKMWRIUnZibHdpSUdoeVpXWTlYQ0pxWVhaaGMyTnlhWEIwT25admFXUW9NQ2s3WENJZ2FXUTlYQ0pqYjNCNVJHOTNibXh2WVdSTWFXNXJWSGgwWENJKzVvdTM2TFNkNUxpTDZMMjk2Wk8rNW82bFBDOWhQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrWEc0Z0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpWlhod2IzSjBMVzFsYm5VdGNtOTNYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRHgwWlhoMFlYSmxZU0JqYkdGemN6MWNJbVY0Y0c5eWRDMXRaVzUxTFhSbGVIUmhjbVZoWENJZ2RIbHdaVDFjSW5SbGVIUmhjbVZoWENJZ2QzSmhjRDFjSW05bVpsd2lJSE53Wld4c1kyaGxZMnM5WENKbVlXeHpaVndpSUdsa1BWd2lZWEpwWVRKRGJXUlVlSFJjSWo0OEwzUmxlSFJoY21WaFBseHVJQ0FnSUNBZ0lDQWdJQ0FnUEM5a2FYWStYRzRnSUNBZ0lDQWdJQ0FnUEM5a2FYWStYRzRnSUNBZ0lDQWdJRHd2WkdsMlBseHVJQ0FnSUNBZ1BDOWthWFkrWUZ4dUlDQWdJR1J2WTNWdFpXNTBMbUp2WkhrdWFXNXpaWEowUVdScVlXTmxiblJJVkUxTUtDZGlaV1p2Y21WbGJtUW5MQ0IwWlhoMEtWeHVJQ0FnSUdOdmJuTjBJSFJsZUhSTlpXNTFJRDBnWkc5amRXMWxiblF1Y1hWbGNubFRaV3hsWTNSdmNpZ25JM1JsZUhSTlpXNTFKeWxjYmlBZ0lDQmpiMjV6ZENCamJHOXpaU0E5SUhSbGVIUk5aVzUxTG5GMVpYSjVVMlZzWldOMGIzSW9KeTV0YjJSaGJDMWpiRzl6WlNjcFhHNGdJQ0FnWTI5dWMzUWdZMjl3ZVVSdmQyNXNiMkZrVEdsdWExUjRkQ0E5SUhSbGVIUk5aVzUxTG5GMVpYSjVVMlZzWldOMGIzSW9KeU5qYjNCNVJHOTNibXh2WVdSTWFXNXJWSGgwSnlsY2JpQWdJQ0JqYjNCNVJHOTNibXh2WVdSTWFXNXJWSGgwTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvSjJOc2FXTnJKeXdnS0NrZ1BUNGdlMXh1SUNBZ0lDQWdRMjl5WlM1amIzQjVWR1Y0ZENoamIzQjVSRzkzYm14dllXUk1hVzVyVkhoMExtUmhkR0Z6WlhRdWJHbHVheWxjYmlBZ0lDQjlLVnh1SUNBZ0lHTnNiM05sTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvSjJOc2FXTnJKeXdnS0NrZ1BUNGdlMXh1SUNBZ0lDQWdkR1Y0ZEUxbGJuVXVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTZ25iM0JsYmkxdkp5bGNiaUFnSUNBZ0lIUm9hWE11Y21WelpYUlVaWGgwUlhod2IzSjBLQ2xjYmlBZ0lDQjlLVnh1SUNCOVhHNGdJSEpsYzJWMFZHVjRkRVY0Y0c5eWRDQW9LU0I3WEc0Z0lDQWdZMjl1YzNRZ2RHVjRkRTFsYm5VZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NjamRHVjRkRTFsYm5VbktWeHVJQ0FnSUhSbGVIUk5aVzUxTG5GMVpYSjVVMlZzWldOMGIzSW9KeU5oY21saE1sUjRkQ2NwTG1oeVpXWWdQU0FuSjF4dUlDQWdJSFJsZUhSTlpXNTFMbkYxWlhKNVUyVnNaV04wYjNJb0p5TnBaRzFVZUhRbktTNW9jbVZtSUQwZ0p5ZGNiaUFnSUNCMFpYaDBUV1Z1ZFM1eGRXVnllVk5sYkdWamRHOXlLQ2NqWkc5M2JteHZZV1JNYVc1clZIaDBKeWt1YUhKbFppQTlJQ2NuWEc0Z0lDQWdkR1Y0ZEUxbGJuVXVjWFZsY25sVFpXeGxZM1J2Y2lnbkkyRnlhV0V5UTIxa1ZIaDBKeWt1ZG1Gc2RXVWdQU0FuSjF4dUlDQWdJSFJsZUhSTlpXNTFMbkYxWlhKNVUyVnNaV04wYjNJb0p5TmpiM0I1Ukc5M2JteHZZV1JNYVc1clZIaDBKeWt1WkdGMFlYTmxkQzVzYVc1cklEMGdKeWRjYmlBZ2ZWeHVJQ0JoWkdSVFpYUjBhVzVuVlVrZ0tDa2dlMXh1SUNBZ0lHTnZibk4wSUhObGRIUnBibWNnUFNCZ1hHNGdJQ0FnSUNBOFpHbDJJR2xrUFZ3aWMyVjBkR2x1WjAxbGJuVmNJaUJqYkdGemN6MWNJbTF2WkdGc0lITmxkSFJwYm1jdGJXVnVkVndpUGx4dUlDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2liVzlrWVd3dGFXNXVaWEpjSWo1Y2JpQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYlc5a1lXd3RhR1ZoWkdWeVhDSStYRzRnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2liVzlrWVd3dGRHbDBiR1ZjSWo3bHI3emxoN3JvcnI3bnZhNDhMMlJwZGo1Y2JpQWdJQ0FnSUNBZ0lDQWdJRHhrYVhZZ1kyeGhjM005WENKdGIyUmhiQzFqYkc5elpWd2lQc09YUEM5a2FYWStYRzRnSUNBZ0lDQWdJQ0FnUEM5a2FYWStYRzRnSUNBZ0lDQWdJQ0FnUEdScGRpQmpiR0Z6Y3oxY0ltMXZaR0ZzTFdKdlpIbGNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJXVnpjMkZuWlZ3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBOGJHRmlaV3dnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJHRmlaV3dnYjNKaGJtZGxMVzljSWlCcFpEMWNJbTFsYzNOaFoyVmNJajQ4TDJ4aFltVnNQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrWEc0Z0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYSnZkeUJ5Y0dNdGMxd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXNWhiV1ZjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOGFXNXdkWFFnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGFXNXdkWFFnYm1GdFpTMXpYQ0lnYzNCbGJHeGphR1ZqYXoxY0ltWmhiSE5sWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYWmhiSFZsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHbHVjSFYwSUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXbHVjSFYwSUhWeWJDMXpYQ0lnYzNCbGJHeGphR1ZqYXoxY0ltWmhiSE5sWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHRWdZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0WW5WMGRHOXVYQ0lnYVdROVhDSmhaR1JTVUVOY0lpQm9jbVZtUFZ3aWFtRjJZWE5qY21sd2REcDJiMmxrS0RBcE8xd2lQdWEzdStXS29GSlFRK1djc09XZGdEd3ZZVDVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQQzlrYVhZK1hHNGdJQ0FnSUNBZ0lDQWdJQ0E4TDJScGRqNDhJUzB0SUM4dWMyVjBkR2x1WnkxdFpXNTFMWEp2ZHlBdExUNWNiaUFnSUNBZ0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0Y205M1hDSStYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJtRnRaVndpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4c1lXSmxiQ0JqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxc1lXSmxiRndpUHVtRmplZTlydVdRak9hdHBUd3ZiR0ZpWld3K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYWmhiSFZsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHbHVjSFYwSUhSNWNHVTlYQ0pqYUdWamEySnZlRndpSUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXTm9aV05yWW05NElHTnZibVpwWjFONWJtTXRjMXdpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0E4TDJScGRqNWNiaUFnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQandoTFMwZ0x5NXpaWFIwYVc1bkxXMWxiblV0Y205M0lDMHRQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxeWIzZGNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXVZVzFsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHeGhZbVZzSUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXeGhZbVZzWENJK1RVUTE1cUNoNmFxTVBDOXNZV0psYkQ1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEM5a2FYWStYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGRtRnNkV1ZjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOGFXNXdkWFFnZEhsd1pUMWNJbU5vWldOclltOTRYQ0lnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdFkyaGxZMnRpYjNnZ2JXUTFRMmhsWTJzdGMxd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FnSUNBZ0lDQWdJRHd2WkdsMlBqd2hMUzBnTHk1elpYUjBhVzVuTFcxbGJuVXRjbTkzSUMwdFBseHVJQ0FnSUNBZ0lDQWdJQ0FnUEdScGRpQmpiR0Z6Y3oxY0luTmxkSFJwYm1jdGJXVnVkUzF5YjNkY0lqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJtRnRaVndpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOGJHRmlaV3dnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJHRmlaV3hjSWo3bWxvZmt1N2JscExubHNZTG1sYkE4TDJ4aFltVnNQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQQzlrYVhZK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFhaaGJIVmxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4cGJuQjFkQ0JqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxcGJuQjFkQ0J6YldGc2JDMXZJR1p2YkdRdGMxd2lJSFI1Y0dVOVhDSnVkVzFpWlhKY0lpQnpjR1ZzYkdOb1pXTnJQVndpWm1Gc2MyVmNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEd4aFltVnNJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFd4aFltVnNYQ0krS09tN21PaXVwRERvb2FqbnBMcmt1STNrdjUzbmxaa3NMVEhvb2FqbnBMcmt2NTNubFpubHJvem1sYlRvdDYvbHZvUXBQQzlzWVdKbGJENWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lEd3ZaR2wyUGx4dUlDQWdJQ0FnSUNBZ0lDQWdQQzlrYVhZK1BDRXRMU0F2TG5ObGRIUnBibWN0YldWdWRTMXliM2NnTFMwK1hHNGdJQ0FnSUNBZ0lDQWdJQ0E4WkdsMklHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMWEp2ZDF3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFc1aGJXVmNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0E4YkdGaVpXd2dZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0YkdGaVpXeGNJajdwZ0pMbHZaTGt1SXZvdmIzcGw3VHBtcFE4TDJ4aFltVnNQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdScGRpQmpiR0Z6Y3oxY0luTmxkSFJwYm1jdGJXVnVkUzEyWVd4MVpWd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRHhwYm5CMWRDQmpiR0Z6Y3oxY0luTmxkSFJwYm1jdGJXVnVkUzFwYm5CMWRDQnpiV0ZzYkMxdklHbHVkR1Z5ZG1Gc0xYTmNJaUIwZVhCbFBWd2liblZ0WW1WeVhDSWdjM0JsYkd4amFHVmphejFjSW1aaGJITmxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEd4aFltVnNJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFd4aFltVnNYQ0krS09XTmxlUzlqVHJtcjZ2bnA1SXBQQzlzWVdKbGJENWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQThZU0JqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxaWRYUjBiMjRnZG1WeWMybHZiaTF6WENJZ2FXUTlYQ0owWlhOMFFYSnBZVEpjSWlCb2NtVm1QVndpYW1GMllYTmpjbWx3ZERwMmIybGtLREFwTzF3aVB1YTFpK2l2bGVpL251YU9wZSs4ak9hSWtPV0tuK2FZdnVla3V1ZUppT2Fjck9XUHR6d3ZZVDVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQQzlrYVhZK1hHNGdJQ0FnSUNBZ0lDQWdJQ0E4TDJScGRqNDhJUzB0SUM4dWMyVjBkR2x1WnkxdFpXNTFMWEp2ZHlBdExUNWNiaUFnSUNBZ0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0Y205M1hDSStYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJtRnRaVndpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUR4c1lXSmxiQ0JqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxc1lXSmxiRndpUHVTNGkraTl2ZWkzcitXK2hEd3ZiR0ZpWld3K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYWmhiSFZsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHbHVjSFYwSUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXbHVjSFYwSUdSdmQyNXNiMkZrVUdGMGFDMXpYQ0lnY0d4aFkyVm9iMnhrWlhJOVhDTGxqNnJvZzczb3JyN252YTdrdUxybnU1M2xyN25vdDYvbHZvUmNJaUJ6Y0dWc2JHTm9aV05yUFZ3aVptRnNjMlZjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEM5a2FYWStYRzRnSUNBZ0lDQWdJQ0FnSUNBOEwyUnBkajQ4SVMwdElDOHVjMlYwZEdsdVp5MXRaVzUxTFhKdmR5QXRMVDVjYmlBZ0lDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGNtOTNYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRHhrYVhZZ1kyeGhjM005WENKelpYUjBhVzVuTFcxbGJuVXRibUZ0WlZ3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeHNZV0psYkNCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXNZV0psYkZ3aVBsVnpaWEl0UVdkbGJuUThMMnhoWW1Wc1BseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBOEwyUnBkajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMTJZV3gxWlZ3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeHBibkIxZENCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXBibkIxZENCMWMyVnlRV2RsYm5RdGMxd2lJSE53Wld4c1kyaGxZMnM5WENKbVlXeHpaVndpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0E4TDJScGRqNWNiaUFnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQandoTFMwZ0x5NXpaWFIwYVc1bkxXMWxiblV0Y205M0lDMHRQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxeWIzZGNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXVZVzFsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BHeGhZbVZzSUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxXeGhZbVZzWENJK1VtVm1aWEpsY2p3dmJHRmlaV3crWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRHd2WkdsMlBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFhaaGJIVmxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdsdWNIVjBJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFdsdWNIVjBJSEpsWm1WeVpYSXRjMXdpSUhOd1pXeHNZMmhsWTJzOVhDSm1ZV3h6WlZ3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBOEwyUnBkajVjYmlBZ0lDQWdJQ0FnSUNBZ0lEd3ZaR2wyUGp3aExTMGdMeTV6WlhSMGFXNW5MVzFsYm5VdGNtOTNJQzB0UGx4dUlDQWdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXliM2RjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdScGRpQmpiR0Z6Y3oxY0luTmxkSFJwYm1jdGJXVnVkUzF1WVcxbFhDSStYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQR3hoWW1Wc0lHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMV3hoWW1Wc1hDSStTR1ZoWkdWeWN6d3ZiR0ZpWld3K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYWmhiSFZsWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1BIUmxlSFJoY21WaElHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMV2x1Y0hWMElIUmxlSFJoY21WaExXOGdhR1ZoWkdWeWN5MXpYQ0lnZEhsd1pUMWNJblJsZUhSaGNtVmhYQ0lnYzNCbGJHeGphR1ZqYXoxY0ltWmhiSE5sWENJK1BDOTBaWGgwWVhKbFlUNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrWEc0Z0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo0OElTMHRJQzh1YzJWMGRHbHVaeTF0Wlc1MUxYSnZkeUF0TFQ1Y2JpQWdJQ0FnSUNBZ0lDQThMMlJwZGo0OElTMHRJQzh1YzJWMGRHbHVaeTF0Wlc1MUxXSnZaSGtnTFMwK1hHNGdJQ0FnSUNBZ0lDQWdQR1JwZGlCamJHRnpjejFjSW0xdlpHRnNMV1p2YjNSbGNsd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxamIzQjVjbWxuYUhSY0lqNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxcGRHVnRYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEd4aFltVnNJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFd4aFltVnNYQ0krSm1OdmNIazdJRU52Y0hseWFXZG9kRHd2YkdGaVpXdytYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdQR0VnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJHbHVhMXdpSUdoeVpXWTlYQ0pvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2WVdObmIzUmhhM1V2UW1GcFpIVkZlSEJ2Y25SbGNsd2lJSFJoY21kbGREMWNJbDlpYkdGdWExd2lQdW1icXVhY2lPZW5pK2F3dER3dllUNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRHhrYVhZZ1kyeGhjM005WENKelpYUjBhVzVuTFcxbGJuVXRhWFJsYlZ3aVBseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lEeHNZV0psYkNCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXNZV0psYkZ3aVBsWmxjbk5wYjI0NklDUjdkR2hwY3k1MlpYSnphVzl1ZlR3dmJHRmlaV3crWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnUEd4aFltVnNJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFd4aFltVnNYQ0krVlhCa1lYUmxJR1JoZEdVNklDUjdkR2hwY3k1MWNHUmhkR1ZFWVhSbGZUd3ZiR0ZpWld3K1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BDOWthWFkrUENFdExTQXZMbk5sZEhScGJtY3RiV1Z1ZFMxamIzQjVjbWxuYUhRZ0xTMCtYRzRnSUNBZ0lDQWdJQ0FnSUNBOFpHbDJJR05zWVhOelBWd2ljMlYwZEdsdVp5MXRaVzUxTFc5d1pYSmhkR1ZjSWo1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnUEdFZ1kyeGhjM005WENKelpYUjBhVzVuTFcxbGJuVXRZblYwZEc5dUlHeGhjbWRsTFc4Z1lteDFaUzF2WENJZ2FXUTlYQ0poY0hCc2VWd2lJR2h5WldZOVhDSnFZWFpoYzJOeWFYQjBPblp2YVdRb01DazdYQ0krNWJxVTU1U29QQzloUGx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0E4WVNCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMWlkWFIwYjI0Z2JHRnlaMlV0YjF3aUlHbGtQVndpY21WelpYUmNJaUJvY21WbVBWd2lhbUYyWVhOamNtbHdkRHAyYjJsa0tEQXBPMXdpUHVtSGplZTlyand2WVQ1Y2JpQWdJQ0FnSUNBZ0lDQWdJRHd2WkdsMlBseHVJQ0FnSUNBZ0lDQWdJRHd2WkdsMlBseHVJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FnSUR3dlpHbDJQbUJjYmlBZ0lDQmtiMk4xYldWdWRDNWliMlI1TG1sdWMyVnlkRUZrYW1GalpXNTBTRlJOVENnblltVm1iM0psWlc1a0p5d2djMlYwZEdsdVp5bGNiaUFnSUNCamIyNXpkQ0J6WlhSMGFXNW5UV1Z1ZFNBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOelpYUjBhVzVuVFdWdWRTY3BYRzRnSUNBZ1kyOXVjM1FnWTJ4dmMyVWdQU0J6WlhSMGFXNW5UV1Z1ZFM1eGRXVnllVk5sYkdWamRHOXlLQ2N1Ylc5a1lXd3RZMnh2YzJVbktWeHVJQ0FnSUdOc2IzTmxMbUZrWkVWMlpXNTBUR2x6ZEdWdVpYSW9KMk5zYVdOckp5d2dLQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2MyVjBkR2x1WjAxbGJuVXVZMnhoYzNOTWFYTjBMbkpsYlc5MlpTZ25iM0JsYmkxdkp5bGNiaUFnSUNBZ0lIUm9hWE11Y21WelpYUlRaWFIwYVc1bktDbGNiaUFnSUNCOUtWeHVJQ0FnSUdOdmJuTjBJR0ZrWkZKUVF5QTlJR1J2WTNWdFpXNTBMbkYxWlhKNVUyVnNaV04wYjNJb0p5TmhaR1JTVUVNbktWeHVJQ0FnSUdGa1pGSlFReTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLQ2RqYkdsamF5Y3NJQ2dwSUQwK0lIdGNiaUFnSUNBZ0lHTnZibk4wSUhKd1kwUlBUVXhwYzNRZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5UVd4c0tDY3VjbkJqTFhNbktWeHVJQ0FnSUNBZ1kyOXVjM1FnVWxCRElEMGdZRnh1SUNBZ0lDQWdJQ0E4WkdsMklHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMWEp2ZHlCeWNHTXRjMXdpUGx4dUlDQWdJQ0FnSUNBZ0lEeGthWFlnWTJ4aGMzTTlYQ0p6WlhSMGFXNW5MVzFsYm5VdGJtRnRaVndpUGx4dUlDQWdJQ0FnSUNBZ0lDQWdQR2x1Y0hWMElHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMV2x1Y0hWMElHNWhiV1V0YzF3aUlITndaV3hzWTJobFkyczlYQ0ptWVd4elpWd2lQbHh1SUNBZ0lDQWdJQ0FnSUR3dlpHbDJQbHh1SUNBZ0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0ZG1Gc2RXVmNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lEeHBibkIxZENCamJHRnpjejFjSW5ObGRIUnBibWN0YldWdWRTMXBibkIxZENCMWNtd3RjMXdpSUhOd1pXeHNZMmhsWTJzOVhDSm1ZV3h6WlZ3aVBseHVJQ0FnSUNBZ0lDQWdJRHd2WkdsMlBseHVJQ0FnSUNBZ0lDQThMMlJwZGo0OElTMHRJQzh1YzJWMGRHbHVaeTF0Wlc1MUxYSnZkeUF0TFQ1Z1hHNGdJQ0FnSUNCQmNuSmhlUzVtY205dEtISndZMFJQVFV4cGMzUXBMbkJ2Y0NncExtbHVjMlZ5ZEVGa2FtRmpaVzUwU0ZSTlRDZ25ZV1owWlhKbGJtUW5MQ0JTVUVNcFhHNGdJQ0FnZlNsY2JpQWdJQ0JqYjI1emRDQmhjSEJzZVNBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOaGNIQnNlU2NwWEc0Z0lDQWdZMjl1YzNRZ2JXVnpjMkZuWlNBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOdFpYTnpZV2RsSnlsY2JpQWdJQ0JoY0hCc2VTNWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtDZGpiR2xqYXljc0lDZ3BJRDArSUh0Y2JpQWdJQ0FnSUhSb2FYTXVjMkYyWlZObGRIUnBibWNvS1Z4dUlDQWdJQ0FnYldWemMyRm5aUzVwYm01bGNsUmxlSFFnUFNBbjZLNis1NzJ1NWJleTVMK2Q1YTJZSjF4dUlDQWdJSDBwWEc1Y2JpQWdJQ0JqYjI1emRDQnlaWE5sZENBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnlOeVpYTmxkQ2NwWEc0Z0lDQWdjbVZ6WlhRdVlXUmtSWFpsYm5STWFYTjBaVzVsY2lnblkyeHBZMnNuTENBb0tTQTlQaUI3WEc0Z0lDQWdJQ0JUZEc5eVpTNTBjbWxuWjJWeUtDZGpiR1ZoY2tOdmJtWnBaMFJoZEdFbktWeHVJQ0FnSUNBZ2JXVnpjMkZuWlM1cGJtNWxjbFJsZUhRZ1BTQW42SzYrNTcydTViZXk2WWVONTcydUoxeHVJQ0FnSUgwcFhHNWNiaUFnSUNCamIyNXpkQ0IwWlhOMFFYSnBZVElnUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2NqZEdWemRFRnlhV0V5SnlsY2JpQWdJQ0IwWlhOMFFYSnBZVEl1WVdSa1JYWmxiblJNYVhOMFpXNWxjaWduWTJ4cFkyc25MQ0FvS1NBOVBpQjdYRzRnSUNBZ0lDQkRiM0psTG1kbGRGWmxjbk5wYjI0b1UzUnZjbVV1WjJWMFEyOXVabWxuUkdGMFlTZ25jbkJqVEdsemRDY3BXekJkTG5WeWJDd2dkR1Z6ZEVGeWFXRXlLVnh1SUNBZ0lIMHBYRzRnSUgxY2JpQWdjbVZ6WlhSVFpYUjBhVzVuSUNncElIdGNiaUFnSUNCamIyNXpkQ0J0WlhOellXZGxJRDBnWkc5amRXMWxiblF1Y1hWbGNubFRaV3hsWTNSdmNpZ25JMjFsYzNOaFoyVW5LVnh1SUNBZ0lHMWxjM05oWjJVdWFXNXVaWEpVWlhoMElEMGdKeWRjYmlBZ0lDQmpiMjV6ZENCMFpYTjBRWEpwWVRJZ1BTQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0NjamRHVnpkRUZ5YVdFeUp5bGNiaUFnSUNCMFpYTjBRWEpwWVRJdWFXNXVaWEpVWlhoMElEMGdKK2ExaStpdmxlaS9udWFPcGUrOGpPYUlrT1dLbithWXZ1ZWt1dWVKaU9hY3JPV1B0eWRjYmlBZ2ZWeHVJQ0IxY0dSaGRHVlRaWFIwYVc1bklDaGpiMjVtYVdkRVlYUmhLU0I3WEc0Z0lDQWdZMjl1YzNRZ2V5QnljR05NYVhOMExDQmpiMjVtYVdkVGVXNWpMQ0J0WkRWRGFHVmpheXdnWm05c1pDd2dhVzUwWlhKMllXd3NJR1J2ZDI1c2IyRmtVR0YwYUN3Z2RYTmxja0ZuWlc1MExDQnlaV1psY21WeUxDQm9aV0ZrWlhKeklIMGdQU0JqYjI1bWFXZEVZWFJoWEc0Z0lDQWdMeThnY21WelpYUWdaRzl0WEc0Z0lDQWdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2tGc2JDZ25Mbkp3WXkxekp5a3VabTl5UldGamFDZ29jbkJqTENCcGJtUmxlQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2FXWWdLR2x1WkdWNElDRTlQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lISndZeTV5WlcxdmRtVW9LVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMHBYRzRnSUNBZ2NuQmpUR2x6ZEM1bWIzSkZZV05vS0NoeWNHTXNJR2x1WkdWNEtTQTlQaUI3WEc0Z0lDQWdJQ0JqYjI1emRDQnljR05FVDAxTWFYTjBJRDBnWkc5amRXMWxiblF1Y1hWbGNubFRaV3hsWTNSdmNrRnNiQ2duTG5Kd1l5MXpKeWxjYmlBZ0lDQWdJR2xtSUNocGJtUmxlQ0E5UFQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0J5Y0dORVQwMU1hWE4wVzJsdVpHVjRYUzV4ZFdWeWVWTmxiR1ZqZEc5eUtDY3VibUZ0WlMxekp5a3VkbUZzZFdVZ1BTQnljR011Ym1GdFpWeHVJQ0FnSUNBZ0lDQnljR05FVDAxTWFYTjBXMmx1WkdWNFhTNXhkV1Z5ZVZObGJHVmpkRzl5S0NjdWRYSnNMWE1uS1M1MllXeDFaU0E5SUhKd1l5NTFjbXhjYmlBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJR052Ym5OMElGSlFReUE5SUdCY2JpQWdJQ0FnSUNBZ0lDQThaR2wySUdOc1lYTnpQVndpYzJWMGRHbHVaeTF0Wlc1MUxYSnZkeUJ5Y0dNdGMxd2lQbHh1SUNBZ0lDQWdJQ0FnSUNBZ1BHUnBkaUJqYkdGemN6MWNJbk5sZEhScGJtY3RiV1Z1ZFMxdVlXMWxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJRHhwYm5CMWRDQmpiR0Z6Y3oxY0luTmxkSFJwYm1jdGJXVnVkUzFwYm5CMWRDQnVZVzFsTFhOY0lpQjJZV3gxWlQxY0lpUjdjbkJqTG01aGJXVjlYQ0lnYzNCbGJHeGphR1ZqYXoxY0ltWmhiSE5sWENJK1hHNGdJQ0FnSUNBZ0lDQWdJQ0E4TDJScGRqNWNiaUFnSUNBZ0lDQWdJQ0FnSUR4a2FYWWdZMnhoYzNNOVhDSnpaWFIwYVc1bkxXMWxiblV0ZG1Gc2RXVmNJajVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdQR2x1Y0hWMElHTnNZWE56UFZ3aWMyVjBkR2x1WnkxdFpXNTFMV2x1Y0hWMElIVnliQzF6WENJZ2RtRnNkV1U5WENJa2UzSndZeTUxY214OVhDSWdjM0JsYkd4amFHVmphejFjSW1aaGJITmxYQ0krWEc0Z0lDQWdJQ0FnSUNBZ0lDQThMMlJwZGo1Y2JpQWdJQ0FnSUNBZ0lDQThMMlJwZGo0OElTMHRJQzh1YzJWMGRHbHVaeTF0Wlc1MUxYSnZkeUF0TFQ1Z1hHNGdJQ0FnSUNBZ0lFRnljbUY1TG1aeWIyMG9jbkJqUkU5TlRHbHpkQ2t1Y0c5d0tDa3VhVzV6WlhKMFFXUnFZV05sYm5SSVZFMU1LQ2RoWm5SbGNtVnVaQ2NzSUZKUVF5bGNiaUFnSUNBZ0lIMWNiaUFnSUNCOUtWeHVJQ0FnSUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTVqYjI1bWFXZFRlVzVqTFhNbktTNWphR1ZqYTJWa0lEMGdZMjl1Wm1sblUzbHVZMXh1SUNBZ0lHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnk1dFpEVkRhR1ZqYXkxekp5a3VZMmhsWTJ0bFpDQTlJRzFrTlVOb1pXTnJYRzRnSUNBZ1pHOWpkVzFsYm5RdWNYVmxjbmxUWld4bFkzUnZjaWduTG1admJHUXRjeWNwTG5aaGJIVmxJRDBnWm05c1pGeHVJQ0FnSUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTVwYm5SbGNuWmhiQzF6SnlrdWRtRnNkV1VnUFNCcGJuUmxjblpoYkZ4dUlDQWdJR1J2WTNWdFpXNTBMbkYxWlhKNVUyVnNaV04wYjNJb0p5NWtiM2R1Ykc5aFpGQmhkR2d0Y3ljcExuWmhiSFZsSUQwZ1pHOTNibXh2WVdSUVlYUm9YRzRnSUNBZ1pHOWpkVzFsYm5RdWNYVmxjbmxUWld4bFkzUnZjaWduTG5WelpYSkJaMlZ1ZEMxekp5a3VkbUZzZFdVZ1BTQjFjMlZ5UVdkbGJuUmNiaUFnSUNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2N1Y21WbVpYSmxjaTF6SnlrdWRtRnNkV1VnUFNCeVpXWmxjbVZ5WEc0Z0lDQWdaRzlqZFcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2lnbkxtaGxZV1JsY25NdGN5Y3BMblpoYkhWbElEMGdhR1ZoWkdWeWMxeHVJQ0I5WEc1Y2JpQWdjMkYyWlZObGRIUnBibWNnS0NrZ2UxeHVJQ0FnSUdOdmJuTjBJSEp3WTBSUFRVeHBjM1FnUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlRV3hzS0NjdWNuQmpMWE1uS1Z4dUlDQWdJR052Ym5OMElISndZMHhwYzNRZ1BTQkJjbkpoZVM1bWNtOXRLSEp3WTBSUFRVeHBjM1FwTG0xaGNDZ29jbkJqS1NBOVBpQjdYRzRnSUNBZ0lDQmpiMjV6ZENCdVlXMWxJRDBnY25CakxuRjFaWEo1VTJWc1pXTjBiM0lvSnk1dVlXMWxMWE1uS1M1MllXeDFaVnh1SUNBZ0lDQWdZMjl1YzNRZ2RYSnNJRDBnY25CakxuRjFaWEo1VTJWc1pXTjBiM0lvSnk1MWNtd3RjeWNwTG5aaGJIVmxYRzRnSUNBZ0lDQnBaaUFvYm1GdFpTQW1KaUIxY213cElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlIc2dibUZ0WlN3Z2RYSnNJSDFjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlLUzVtYVd4MFpYSW9aV3dnUFQ0Z1pXd3BYRzRnSUNBZ1kyOXVjM1FnWTI5dVptbG5VM2x1WXlBOUlHUnZZM1Z0Wlc1MExuRjFaWEo1VTJWc1pXTjBiM0lvSnk1amIyNW1hV2RUZVc1akxYTW5LUzVqYUdWamEyVmtYRzRnSUNBZ1kyOXVjM1FnYldRMVEyaGxZMnNnUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2N1YldRMVEyaGxZMnN0Y3ljcExtTm9aV05yWldSY2JpQWdJQ0JqYjI1emRDQm1iMnhrSUQwZ1RuVnRZbVZ5TG5CaGNuTmxTVzUwS0dSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTVtYjJ4a0xYTW5LUzUyWVd4MVpTbGNiaUFnSUNCamIyNXpkQ0JwYm5SbGNuWmhiQ0E5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTVwYm5SbGNuWmhiQzF6SnlrdWRtRnNkV1ZjYmlBZ0lDQmpiMjV6ZENCa2IzZHViRzloWkZCaGRHZ2dQU0JrYjJOMWJXVnVkQzV4ZFdWeWVWTmxiR1ZqZEc5eUtDY3VaRzkzYm14dllXUlFZWFJvTFhNbktTNTJZV3gxWlZ4dUlDQWdJR052Ym5OMElIVnpaWEpCWjJWdWRDQTlJR1J2WTNWdFpXNTBMbkYxWlhKNVUyVnNaV04wYjNJb0p5NTFjMlZ5UVdkbGJuUXRjeWNwTG5aaGJIVmxYRzRnSUNBZ1kyOXVjM1FnY21WbVpYSmxjaUE5SUdSdlkzVnRaVzUwTG5GMVpYSjVVMlZzWldOMGIzSW9KeTV5WldabGNtVnlMWE1uS1M1MllXeDFaVnh1SUNBZ0lHTnZibk4wSUdobFlXUmxjbk1nUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2N1YUdWaFpHVnljeTF6SnlrdWRtRnNkV1ZjYmx4dUlDQWdJR052Ym5OMElHTnZibVpwWjBSaGRHRWdQU0I3WEc0Z0lDQWdJQ0J5Y0dOTWFYTjBMRnh1SUNBZ0lDQWdZMjl1Wm1sblUzbHVZeXhjYmlBZ0lDQWdJRzFrTlVOb1pXTnJMRnh1SUNBZ0lDQWdabTlzWkN4Y2JpQWdJQ0FnSUdsdWRHVnlkbUZzTEZ4dUlDQWdJQ0FnWkc5M2JteHZZV1JRWVhSb0xGeHVJQ0FnSUNBZ2RYTmxja0ZuWlc1MExGeHVJQ0FnSUNBZ2NtVm1aWEpsY2l4Y2JpQWdJQ0FnSUdobFlXUmxjbk5jYmlBZ0lDQjlYRzRnSUNBZ1UzUnZjbVV1ZEhKcFoyZGxjaWduYzJWMFEyOXVabWxuUkdGMFlTY3NJR052Ym1acFowUmhkR0VwWEc0Z0lIMWNibjFjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnYm1WM0lGVkpLQ2xjYmlKZGZRPT0ifQ==
