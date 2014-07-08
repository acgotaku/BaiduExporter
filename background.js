chrome.tabs.getSelected(null, function(tab) {
    var domain = ".baidu.com"
    chrome.cookies.getAll({}, function(cookies) {
        data = cookies;
        for (var i in cookies) {
            cookie = cookies[i];
            if (cookie.domain.indexOf(domain) != -1 && cookie.name == "BDUSS") {
                var data = cookie.name + "=" + cookie.value;
                // console.log(data);
                chrome.runtime.onMessage.addListener(
                        function(request, sender, sendResponse) {
                            if (request.do == "get_cookie") {
                                sendResponse({cookie: data});
                            }
                        });
            }
        }
    });
});


