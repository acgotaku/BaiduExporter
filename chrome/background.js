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
var rpc_list=JSON.parse(localStorage.getItem("rpc_list")||'[{"name":"ARIA2 RPC","url":"http://localhost:6800/jsonrpc"}]');
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading' && tab.url.indexOf("n.baidu.com") != -1) {
        if (!chrome.runtime.onConnect.hasListeners()) {
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "BaiduExporter");
                port.onMessage.addListener(function(request) {
                    console.log(request.method);
                    switch(request.method){
                        case "get_cookie":
                            Promise.all(function(){
                                var array=[];
                                var data=request.data;
                                for(var i=0;i<data.length;i++){
                                    array.push(get_cookie(data[i].site,data[i].name));
                                }
                                return array;
                            }()).then(function(value){
                
                                port.postMessage(value);        
                                
                            },function(){
                                console.log("error");
                            });
                            break;                
                    }
                });
            });
        }
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
                                        port.postMessage({'method':'rpc_data','status':true});

                                    })
                                    .fail(function(jqXHR, textStatus, errorThrown) {
                                        port.postMessage({'method':'rpc_data','status':false});
                                    }); 
                            break;
                        case "rpc_version":
                            HttpSendRead(request.data)
                                    .done(function(json, textStatus, jqXHR) {
                                        port.postMessage({'method':'rpc_version','status':true,'data':json});

                                    })
                                    .fail(function(jqXHR, textStatus, errorThrown) {
                                        port.postMessage({'method':'rpc_data','status':false});
                                    });
                            break;
                        case "config_data":
                            localStorage.setItem("rpc_list", JSON.stringify(request.data));
                            rpc_list = request.data;
                            break;
                        case "context_menu":
                            localStorage.setItem("context_menu", request.data);
                            if(request.data){
                                chrome.contextMenus.removeAll();
                                for(var i in rpc_list){
                                    addContextMenu(i,rpc_list[i]['name']);
                                }                                
                            }else{
                                chrome.contextMenus.removeAll();
                            }
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
function showNotification(opt){
    var notification = chrome.notifications.create(status.toString(),opt,function(notifyId){return notifyId});
    setTimeout(function(){
        chrome.notifications.clear(status.toString(),function(){});
    },5000);
}
function parse_url(url){
    var auth_str = request_auth(url);
    var auth = null;
    if (auth_str) {
        if(auth_str.indexOf('token:') == 0){
            auth= auth_str;
        }else{
        auth = "Basic " + btoa(auth_str);
        }    
    }
    url_path=remove_auth(url);
    function request_auth(url) {
        return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
    }
    function remove_auth(url) {
        return url.replace(/^((?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(\/\/)?(?:(?:[^:@]*(?::[^:@]*)?)?@)?(.*)/, '$1$2$3');
    }
    return [url_path,auth];
}
//生成右键菜单
function addContextMenu(id,title){
    chrome.contextMenus.create({
    id:id,
    title: title,
    contexts: ['link']
    });
}
//设置右键菜单
var context_menu = localStorage.getItem("context_menu");
if(context_menu == true){
    chrome.contextMenus.removeAll();
    for(var i in rpc_list){
        addContextMenu(i,rpc_list[i]['name']);
    }   
}
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    var rpc_data = {
        "jsonrpc": "2.0",
        "method": "aria2.addUri",
        "id": new Date().getTime(),
        "params": [[info.linkUrl],{}
        ]
    };
    var result=parse_url(rpc_list[info.menuItemId]['url']);
    console.log(result);
    var auth=result[1];
    if (auth && auth.indexOf('token:') == 0) {
        rpc_data.params.unshift(auth);
    }
    var parameter = {'url': result[0], 'dataType': 'json', type: 'POST', data: JSON.stringify(rpc_data), 'headers': {'Authorization': auth}};
    console.log(rpc_data);
    HttpSendRead(parameter)
            .done(function(json, textStatus, jqXHR) {
                var opt={
                    type: "basic",
                    title: "下载成功",
                    message: "导出下载成功~",
                    iconUrl: "images/icon.jpg"
                }                    
                showNotification(opt);
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                var opt={
                    type: "basic",
                    title: "下载失败",
                    message: "导出下载失败! QAQ",
                    iconUrl: "images/icon.jpg"
                }                    
                showNotification(opt);
            }); 
});
//软件版本更新提示
var manifest = chrome.runtime.getManifest();
var previousVersion=localStorage.getItem("version");
if(previousVersion == "" || previousVersion != manifest.version){
    var opt={
        type: "basic",
        title: "更新",
        message: "百度网盘助手更新到" +manifest.version + "版本啦～\n此次更新支持手动开启右键导出~\n 默认不开启",
        iconUrl: "images/icon.jpg"
    }
    showNotification(opt);
    localStorage.setItem("version",manifest.version);
}