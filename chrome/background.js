chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(tab);
    if (changeInfo.status === 'loading' && tab.url.indexOf("n.baidu.com") != -1) {
        if (!chrome.runtime.onConnect.hasListeners()) {
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "get_cookie");
                port.onMessage.addListener(function(request) {
						Promise.all(function(){
							var array=[];
							for(var i=0;i<request.length;i++){
								array.push(get_cookie(request[i].site,request[i].name));
							}
							return array;
						}()).then(function(value){
							console.log(value);
							port.postMessage(value);        
							
						},function(){
							console.log("error");
						});

                });
            });
        }

    }
});
function get_cookie(site,name){
    return new Promise(function(resolve, reject) {
        chrome.cookies.get({"url": site, "name": name}, function(cookies) {
			var obj = {};
            if (cookies) {
                obj[cookies.name] = cookies.value;
                resolve(obj);
            }else{
                resolve(obj);
            }
        });
    });
}
var manifest = chrome.runtime.getManifest();
var previousVersion=localStorage.getItem("version");
if(previousVersion == "" || previousVersion != manifest.version){
    var opt={
        type: "basic",
        title: "更新",
        message: "百度网盘助手更新到" +manifest.version + "版本啦～\n",
        iconUrl: "images/icon.jpg"
    }
    var notification = chrome.notifications.create(status.toString(),opt,function(notifyId){return notifyId});
    setTimeout(function(){
        chrome.notifications.clear(status.toString(),function(){});
    },5000);
    localStorage.setItem("version",manifest.version);
}