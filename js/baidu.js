// ==UserScript==
// @name            百度网盘aria2导出工具
// @author          acgotaku311
// @description 一个方便吧百度网盘的Aria2rpc导出的脚本。
// @encoding           utf-8
// @include     http://*n.baidu.com/s/*
// @include     http://*n.baidu.com/disk/home*
// @include     http://*n.baidu.com/share/link*
// @include     https://*n.baidu.com/s/*
// @include     https://*n.baidu.com/disk/home*
// @include     https://*n.baidu.com/share/link*
// @run-at       document-end
// @version 0.0.1
// ==/UserScript==
var baidu = function(cookies) {
    var version = "0.0.1";
    var thedate_update = "2014/07/01";
    var baidupan = (function() {
        var SetMessage = function(msg, type) {
            var Toast = require("common:widget/toast/toast.js");
            Toast.obtain.useToast({
                toastMode: Toast.obtain[type],
                msg: msg,
                sticky: false
            });
        };
        var combination = {
            header: function(cookies) {
                var addheader = [];
                var UA = "netdisk;4.4.0.6;PC;PC-Windows;6.2.9200;WindowsBaiduYunGuanJia";
                addheader.push("User-Agent: " + UA);
                addheader.push("Cookie: " + cookies);
                return addheader;
            }
        };
        var url = "http://localhost:6800/jsonrpc" + "?tm=" + (new Date().getTime().toString());
        return {
            init: function() {
                var self = this;
                var $ = require("common:widget/libs/jquery-1.7.2.js");
                var aria2_btn = $("<a>").addClass("icon-btn-download").text("RPC下载");
                $(".icon-btn-device").after(aria2_btn);
                aria2_btn.click(function() {
                    self.get_dlink();
                });
                SetMessage("初始化成功!", "MODE_SUCCESS");
            },
            get_info: function() {
                var File = require("common:widget/data-center/data-center.js");
                return File.get("selectedList");

            },
            get_config: function() {

            },
            get_dlink: function() {
                var self = this;
                var Service = require("common:widget/commonService/commonService.js");
                Service.getDlink(JSON.stringify(self.get_info()), "dlink", self.aria2_rpc.bind(self));
            },
            aria2_rpc: function(data) {
                var self = this;
                var File = require("common:widget/data-center/data-center.js");
                var Filename = File.get("selectedItemList");
                var obj = $.parseJSON(data);
                var name = null;
                var length = obj.dlink.length;
                for (var i = 0; i < length; i++) {
                    for (var j = 0; j < length; j++) {
                        if (obj.dlink[i].fs_id == Filename[j].attr("data-id")) {
                            name = Filename[j].children().eq(0).children().eq(2).attr("title");
                            break;
                        }
                    }
                    var rpc_data = [{
                            "jsonrpc": "2.0",
                            "method": "aria2.addUri",
                            "id": new Date().getTime(),
                            "params": [[obj.dlink[i].dlink], {
                                    "out": name,
                                    "header": combination.header(cookies)
                                }
                            ]
                        }];
                    self.aria2send_data(rpc_data);
                }
            },
            aria2send_data: function(data) {
                $.ajax({'url': url, 'dataType': 'json', type: 'POST', data: JSON.stringify(data)})
                        .done(function(xml, textStatus, jqXHR) {
                            SetMessage("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            SetMessage("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
                        });

            }
        }
    })();
    baidupan.init();
};
function onload(func) {
    if (document.readyState === "complete") {
        func();
    } else {
        window.addEventListener('load', func);
    }
}
chrome.runtime.sendMessage({do: "get_cookie"}, function(response) {
    var cookies = response.cookie;
    onload(function() {
        var script = document.createElement('script');
        script.id = "baidu_script";
        script.appendChild(document.createTextNode('(' + baidu + ')("' + cookies + '");'));
        (document.body || document.head || document.documentElement).appendChild(script);
    });
});


