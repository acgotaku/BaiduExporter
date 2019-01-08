(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

if (typeof browser !== 'undefined') {
  chrome = browser;
}

function requestAddScript(name) {
  chrome.runtime.sendMessage({
    method: 'addScript',
    data: "js/".concat(name, ".js")
  });
}

window.addEventListener('message', function (event) {
  if (event.data.type === 'yunData') {
    window.yunData = event.data.data;

    if (window.location.href.includes('/disk/home')) {
      requestAddScript('home');
    } else {
      requestAddScript('share');
    }
  }
});

function addBaiduJS() {
  var script = document.createElement('script');
  script.src = chrome.runtime.getURL('js/baidu.js');
  document.body.appendChild(script);
}

if (document.readyState === 'complete') {
  // run on firefox
  addBaiduJS();
} else {
  // run on chrome
  window.addEventListener('load', addBaiduJS);
}

},{}]},{},[1]);
