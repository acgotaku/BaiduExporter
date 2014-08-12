var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var {Cc, Ci} = require("chrome");
var ckName="BDUSS";
var button = buttons.ActionButton({
  id: "baidu-link",
  label: "Visit BaiduYun",
  icon: {
    "16": "./img/logo16.png",
    "32": "./img/logo32.png",
    "64": "./img/logo64.png"
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
  contentScriptWhen:"end",
  contentScriptFile: [data.url("js/baidu.js")],
  onAttach: startListening
});
function startListening(worker) {
  worker.port.on('click', function(html) {
var cookieManager = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2);
         for (var e = cookieManager.getCookiesFromHost("pan.baidu.com"); e.hasMoreElements();) {
            var cookie = e.getNext().QueryInterface(Ci.nsICookie2);
            if(cookie.name == ckName){
               var data = cookie.name + "=" + cookie.value;
               console.log(data);
               worker.port.emit('cookies', data);
               break;
            }
         }
    
  });
}
