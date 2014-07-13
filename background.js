chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(tab);
    if (changeInfo.status === 'loading' && tab.url.indexOf("n.baidu.com") != -1) {
        var domain = "http://pan.baidu.com/";
        var name = "BDUSS";
        chrome.cookies.get({"url": domain, "name": name}, function(cookies) {
            if (cookies) {
                var data = cookies.name + "=" + cookies.value;
                console.log(data);
                chrome.runtime.onMessage.addListener(
                        function(request, sender, sendResponse) {
                            if (request.do == "get_cookie") {
                                sendResponse({cookie: data});
                            }
                        });
            }
        });

    }

});


