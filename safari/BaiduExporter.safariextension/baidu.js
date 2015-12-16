function onload(func) {
    if (document.readyState === "complete") {
        func();
    } else {
        window.addEventListener('load', func);
    }
}
function addJS(name){
    var s = document.createElement('script');
    s.src = safari.extension.baseURI + name + '.js';
    (document.body || document.head || document.documentElement).appendChild(s);
    // return this;
}
onload(function() {
    //把函数注入到页面中
    var home = window.location.href.indexOf("/disk/home") != -1 ? true : false;
    var album = window.location.href.indexOf("/pcloud/album/info") != -1 ? true : false;
    var newversion =  document.querySelector('link[rel="shortcut icon"]').href != "http://pan.baidu.com/res/static/images/favicon.ico" ? true : false;
    addJS("core");
    addJS("connect");
    if(home){
        if(newversion){
            addJS("home")
        }else{
            addJS("oldhome");
        }
    }else{
        if(album){
            addJS("album");
        }else{
            addJS("share")
            addJS("convert");
        }    
    }
});

function saveSyncData(data ,value){
    var obj= new Object();
    obj[data] =value;
}
window.addEventListener("message", function(event) {
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type == "config_data")) {
        for(var key in event.data.data){
            localStorage.setItem(key,event.data.data[key]);
            saveSyncData(key,event.data.data[key]);
        }
    }
}, false);