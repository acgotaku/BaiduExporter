var CONNECT = (function () {
    //此段代码用来和后台通讯和  发送http请求
    return {
        sendToBackground: function (method, data) {
            window.postMessage({
                type: "send_to_background",
                data: {
                    method: method,
                    data: data
                }
            }, "*");
        },
        sendToHttp: function (method, data) {
            var self = this;
            switch (method) {
                case "rpc_data":
                    self.HttpSend(data)
                        .done(function (json, textStatus, jqXHR) {
                            CORE.setMessage("下载成功!赶紧去看看吧~", "MODE_SUCCESS");

                        })
                        .fail(function (jqXHR, textStatus, errorThrown) {
                            CORE.setMessage("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
                        });
                    break;
            }
        },
        init: function (port) {
            window.addEventListener("message", function (event) {
                if (event.source != window)
                    return;

                if (event.data.type && (event.data.type == "response_from_background")) {
                    var response = event.data.data;

                    console.log(response);
                    switch (response.method) {
                        case "rpc_result":
                            if (response.status) {
                                CORE.setMessage("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                            } else {
                                CORE.setMessage("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
                            }
                            break;
                        case "send_cookies":
                            if (response.data) {
                                CORE.setCookies(response.data);

                            } else {
                                console.log(response.data);
                            }
                            break;
                        case "rpc_version":
                            if (response.status == false) {
                                $("#send_test").html("错误,请查看是否开启Aria2");
                            } else {
                                $("#send_test").html("ARIA2\u7248\u672c\u4e3a\uff1a\u0020" + response.data.result.version);
                            }
                            break;
                    }
                }
            });
        },
        HttpSend: function (info) {
            Promise.prototype.done = Promise.prototype.then;
            Promise.prototype.fail = Promise.prototype.catch;
            return new Promise(function (resolve, reject) {
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
                http.onreadystatechange = function () {
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
                };
                http.open(info.type, info.url, true);
                http.setRequestHeader("Content-type", contentType);
                var h;
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
        },
        copyText: function (text) {
            var input = document.createElement("textarea");
            document.body.appendChild(input);
            input.style.position = "fixed";
            input.style.left = "0";
            input.style.top = "0";
            input.value = text;
            input.focus();
            input.select();
            var result = document.execCommand("copy");
            input.remove();
            console.log(result);
            if (result)
                CORE.setMessage("拷贝成功~", "MODE_SUCCESS");
            else
                CORE.setMessage("拷贝失败 QAQ", "MODE_FAILURE");
        }
    };
})();
CONNECT.init();
