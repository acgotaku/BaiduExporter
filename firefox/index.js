var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var {Cc, Ci} = require("chrome");
var cookieManager = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2);
var button = buttons.ActionButton({
  id: "baidu-link",
  label: "Visit BaiduYun",
  icon: {
    "16": "./images/logo16.png",
    "32": "./images/logo32.png",
    "64": "./images/logo64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  tabs.open("http://pan.baidu.com/");
}
var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
  include: ["http://pan.baidu.com/*","http://yun.baidu.com/*"],
  contentScriptWhen:"start",
  contentScriptFile: [data.url("js/baidu.js")],
  contentStyleFile: [data.url("css/setting.css")],
  onAttach: startListening,
  contentScriptOptions: {
    url: data.url()
  }
});
function startListening(worker) {
  worker.port.on('get_cookies', function(cookies) {
    var results=[];
    for(var i=0;i<cookies.length;i++){
      var cookie=cookies[i];
      results.push(getCookie(cookie.site,cookie.name));
    }
    worker.port.emit('cookies', results);
  });
}

function getCookie(site, name){
  for (var e = cookieManager.getCookiesFromHost(site); e.hasMoreElements();) {
    var cookie = e.getNext().QueryInterface(Ci.nsICookie2);
    if(cookie.name == name){
       var obj = {};
       obj[cookie.name] = cookie.value;
       return obj;
    }
  }    
}