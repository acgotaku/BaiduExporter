var HttpSendRead = function(info) {
    Promise.prototype.done=Promise.prototype.then;
    Promise.prototype.fail=Promise.prototype.catch;
    return new Promise(function(resolve, reject) {
        var http = new XMLHttpRequest();
        var contentType = "\u0061\u0070\u0070\u006c\u0069\u0063\u0061\u0074\u0069\u006f\u006e\u002f\u0078\u002d\u0077\u0077\u0077\u002d\u0066\u006f\u0072\u006d\u002d\u0075\u0072\u006c\u0065\u006e\u0063\u006f\u0064\u0065\u0064\u003b\u0020\u0063\u0068\u0061\u0072\u0073\u0065\u0074\u003d\u0055\u0054\u0046\u002d\u0038";
        var timeout = 3000;
        if (info.contentType != null) {
            contentType = info.contentType;
        }
        if (info.timeout != null) {
            timeout = info.timeout;
        }
        var timeId = setTimeout(httpclose, timeout);
        function httpclose() {
            http.abort();
        }
        http.onreadystatechange = function() {
            if (http.readyState == 4) {
                if ((http.status == 200 && http.status < 300) || http.status == 304) {
                    clearTimeout(timeId);
                    if (info.dataType == "json") {
                        resolve(JSON.parse(http.responseText), http.status, http);
                    }
                    else if (info.dataType == "SCRIPT") {
                        // eval(http.responseText);
                        resolve(http.responseText, http.status, http);
                    }
                }
                else {
                    clearTimeout(timeId);
                    reject(http, http.statusText, http.status);
                }
            }
        }
        http.open(info.type, info.url, true);
        http.setRequestHeader("Content-type", contentType);
        for (h in info.headers) {
            if (info.headers[h]) {
                http.setRequestHeader(h, info.headers[h]);
            }
        }
        if (info.type == "POST") {
            http.send(info.data);
        }
        else {
            http.send();
        }                          
    });
};
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading' && tab.url.indexOf("n.baidu.com") != -1) {
        if (!chrome.runtime.onConnectExternal.hasListeners()) {
            chrome.runtime.onConnectExternal.addListener(function(port) {
                console.assert(port.name == "BaiduExporter");
                port.onMessage.addListener(function(request) {
                    console.log(request.method);
                    console.log(request.data);
                    switch(request.method){
                        case "rpc_data":
                            HttpSendRead(request.data)
                                    .done(function(json, textStatus, jqXHR) {
                                        port.postMessage({'method':'rpc_result','status':true});

                                    })
                                    .fail(function(jqXHR, textStatus, errorThrown) {
                                        port.postMessage({'method':'rpc_result','status':false});
                                    }); 
                            break;
                        case "config_data":
                            for(var key in request.data){
                                localStorage.setItem(key,request.data[key]);
                            }
                            break;
                        case "copy_text":
                            var input = document.createElement('textarea');
                            document.body.appendChild(input);
                            input.value = request.data;
                            input.focus();
                            input.select();
                            var result =document.execCommand('Copy');
                            input.remove();
                            console.log(result);
                            if(result){
                                port.postMessage({'method':'copy_text','status':true});
                            }else{
                                port.postMessage({'method':'copy_text','status':false});
                            }
                            break;
                        case "rpc_version":
                            HttpSendRead(request.data)
                                    .done(function(json, textStatus, jqXHR) {
                                        port.postMessage({'method':'rpc_version','status':true,'data':json});

                                    })
                                    .fail(function(jqXHR, textStatus, errorThrown) {
                                        port.postMessage({'method':'rpc_version','status':false});
                                    });
                            break;
                        case "get_cookies":
                            Promise.all(function(){
                                var array=[];
                                var data=request.data;
                                for(var i=0;i<data.length;i++){
                                    array.push(get_cookie(data[i].site,data[i].name));
                                }
                                return array;
                            }()).then(function(value){
                
                                port.postMessage({'method':'send_cookies','data':value});        
                                
                            },function(){
                                console.log("error");
                            });
                            break; 
                    }
                });
            });
        }

    }
});
//获取系统的cookies 使用Promise异步处理
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
//弹出chrome通知
function showNotification(id,opt){
    var notification = chrome.notifications.create(id,opt,function(notifyId){return notifyId});
    setTimeout(function(){
        chrome.notifications.clear(id,function(){});
    },5000);
}
//软件版本更新提示
var manifest = chrome.runtime.getManifest();
var previousVersion=localStorage.getItem("version");
if(previousVersion == "" || previousVersion != manifest.version){
    var opt={
        type: "basic",
        title: "更新",
        message: "百度网盘助手更新到" +manifest.version + "版本啦～\n此次更新解决专辑下载的BUG~",
        iconUrl: "images/icon.jpg"
    }
    var id= new Date().getTime().toString();              
    showNotification(id,opt);
    localStorage.setItem("version",manifest.version);
}