function onload(func) {
    if (document.readyState === "complete") {
        func();
    } else {
        window.addEventListener('load', func);
    }
}
function addJS(name){
    var s = document.createElement('script');
    s.src = chrome.extension.getURL('js/'+name+'.js');
    (document.body || document.head || document.documentElement).appendChild(s);
}
onload(function() {
	//把函数注入到页面中
    var home = window.location.href.indexOf("/disk/home") != -1 ? true : false;
    var album = window.location.href.indexOf("/pcloud/album/info") != -1 ? true : false;
    addJS("core");
    addJS("connect");
    if(home){
        addJS("home");
        return ;
    }
    if(album){
        addJS("album");
    }else{
        addJS("share");
        addJS("convert");
    }
    window.setTimeout(function(){
    	window.postMessage(chrome.runtime.id,'*');
    },300);
});