(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Baidu =
/*#__PURE__*/
function () {
  function Baidu() {
    _classCallCheck(this, Baidu);

    this.context = window.require('system-core:context/context.js').instanceForSystem;

    this.context.log.send = function () {};
  } // 封装的百度的Toast提示消息
  // Type类型有
  // caution       警告  failure       失败  loading      加载 success      成功


  _createClass(Baidu, [{
    key: "showToast",
    value: function showToast(_ref) {
      var message = _ref.message,
          type = _ref.type;
      this.context.ui.tip({
        mode: type,
        msg: message
      });
    }
  }, {
    key: "startListen",
    value: function startListen() {
      var _this = this;

      window.addEventListener('message', function (event) {
        if (event.data.type && event.data.type === 'getSelected') {
          window.postMessage({
            type: 'selected',
            data: _this.context.list.getSelected()
          }, location.origin);
        }

        if (event.data.type && event.data.type === 'showToast') {
          _this.showToast(event.data.data);
        }
      });

      if (window.yunData) {
        // TODO 分析效果
        if (window.yunData.sign2) {
          var yunData = window.require('disk-system:widget/data/yunData.js').get();

          window.postMessage({
            type: 'yunData',
            data: yunData
          }, location.origin);
        } else {
          window.postMessage({
            type: 'yunData',
            data: JSON.parse(JSON.stringify(window.yunData))
          }, location.origin);
        }
      }
    }
  }]);

  return Baidu;
}();

var baidu = new Baidu();
baidu.startListen();

},{}]},{},[1]);
