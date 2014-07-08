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
        var auth=null;
        var rpc_url = localStorage.getItem("rpc_url");
        var url = "http://localhost:6800/jsonrpc" + "?tm=" + (new Date().getTime().toString());
        if (rpc_url) {
            url = rpc_url + "?tm=" + (new Date().getTime().toString());
        }
        return {
            init: function() {
                var self = this;
                var aria2_btn = $("<span>").addClass("icon-btn-device").append($("<span>").text("导出下载").addClass("text").before($("<span>").addClass("ico")).after($("<span>").addClass("ico-more")));
                var list = $("<div>").addClass("menu").attr("id", "aria2_list").appendTo(aria2_btn);
                var aria2_export = $("<a>").text("RPC导出").appendTo(list);
                var config = $("<a>").text("设置").appendTo(list);
                $(".icon-btn-device").after(aria2_btn);
                aria2_btn.mouseover(function() {
                    list.show();
                })
                        .mouseout(function() {
                            list.hide();
                        });
                aria2_export.click(function() {
                    self.get_dlink();
                });
                self.set_config_ui();
                config.click(function() {
                    $("#setting_div").show();
                });
                SetMessage("初始化成功!", "MODE_SUCCESS");
            },
            get_info: function() {
                var File = require("common:widget/data-center/data-center.js");
                return File.get("selectedList");
            },
            set_config_ui: function() {
                var self = this;
                var setting_div = document.createElement("div");
                setting_div.className = "b-panel b-dialog download-mgr-dialog";
                setting_div.id = "setting_div";
                var html_ = [];
                html_.push('<div class="dlg-hd b-rlv"><div title="\u5173\u95ed" id="setting_div_close" class="dlg-cnr dlg-cnr-r"></div><h3>\u5bfc\u51fa\u8bbe\u7f6e</h3></div></div>');
                html_.push('<div style="height:420px;">');
                html_.push('<div id="setting_div_more_settings_but" style="width:60px; border:1px solid #F0F0F0; background-color: #FAFAFA; margin-top: -19px; margin-right: 15px; float:right; text-align:center;"><a href="javascript:;">更多设置</a></div>');
                html_.push('<div style="margin-left: 15px; margin-right: 15px; margin-top: 25px; margin-bottom: 5px;">');
                html_.push('<div id="setting_divtopmsg" style="position:absolute; margin-top: -20px; margin-left: 10px; color: #E15F00;"></div>');
                html_.push('<div style="border:1px solid rgb(240, 240, 240); background-color: rgb(250, 250, 250);">');
                html_.push('<div id="setting_div_table">');
                html_.push('<table id="setting_div_table_1" width="100%" border="0"  style="border-collapse:separate; border-spacing:10px; display:table;">');
                html_.push('<tr>');
                html_.push('<td width="150"><label for="textfield">ARIA2 RPC\uff1a\u0020</label></td>');
                html_.push('<td width="320"><input id="rpc_input" type="text" style="width:90%; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">RPC\u8bbf\u95ee\u8bbe\u7f6e</label></td>');
                html_.push('<td><input id="rpc_distinguish" type="checkbox"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">RPC \u7528\u6237\u540d\uff1a\u0020</label></td>');
                html_.push('<td><input type="text" id="rpc_user" disabled="disabled" style="width:150px; background-color:#eee; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">RPC \u5bc6\u7801\uff1a\u0020</label></td>');
                html_.push('<td><input type="text" id="rpc_pass" disabled="disabled" style="width:150px; background-color:#eee; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/>');
                html_.push('<div style="position:absolute; margin-top: -20px; right: 20px;"><a id="send_test" type=0 href="javascript:;" style="display:inline-block; border:1px solid #D1D1D1; background-color: #F7F7F7; text-align: center; text-decoration: none; color:#1B83EB;">\u6d4b\u8bd5\u8fde\u63a5\uff0c\u6210\u529f\u663e\u793a\u7248\u672c\u53f7\u3002</a></div></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2"><div style="color: #656565;">\u76f8\u5173\u8bbe\u7f6e</div><li class="b-list-item separator-1"></li></td>');
                html_.push('</tr><tr>');
                html_.push('<td>\u4e0b\u8f7d\u76ee\u5f55\uff1a\u0020</td><td><input id="down_dir" type="text" style="width:280px; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td>\u6839\u636e\u7f51\u76d8\u8def\u5f84\u5b58\u653e\u6587\u4ef6</td><td><input id="web_path_save" type="checkbox"/></td>');
                html_.push('</tr><tr>');
                html_.push('<!-- <td>增加115网盘支持</td><td><input id="add_115" type="checkbox" style="vertical-align:text-bottom;"/>(现在只有一个导出按钮，还没有设置面板，设置项通用。)</td> -->');
                html_.push('<td>\u5bf9\u6587\u4ef6\u5939\u4f7f\u7528\u007a\u0069\u0070\u4e0b\u8f7d</td><td><input id="dirzip" type="checkbox" style="vertical-align:text-bottom;"/>\u0028\u53ea\u5bf9\u5206\u4eab\u94fe\u63a5\u6709\u6548\u3002\u0029</td>');
                html_.push('</tr><tr>');
                html_.push('<td>\u4f7f\u7528\u8fdc\u7a0b\u7684\u004a\u0053\u811a\u672c</td><td><input id="iswebjs" type="checkbox" style="vertical-align:text-bottom;"/>\u0028\u597d\u5904\u662f\u80fd\u591f\u4fdd\u6301\u6700\u65b0\u7684\u72b6\u6001\u3002\u0029</td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2"><div style="color: #656565;">\u5bfc\u51fa\u7c7b\u578b\u8bbe\u7f6e</div><li class="b-list-item separator-1"></li></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2" id="typeout">');
                html_.push('<div style="width:80px; float:left; margin-left:30px;"><input id="aria2rpc_checkbox" type="checkbox" disabled="disabled" checked="checked" style="vertical-align:text-bottom;"/><label for="textfield">ARIA2 RPC</label></div>');
                html_.push('<div style="width:70px; float:left; margin-left:50px;"><input id="aria2_checkbox" type="checkbox" style="vertical-align:text-bottom;"/><label for="textfield">ARIA2</label></div>');
                html_.push('<div style="width:70px; float:left; margin-left:50px;"><input id="wget_checkbox" type="checkbox" style="vertical-align:text-bottom;"/><label for="textfield">WGET</label></div>');
                html_.push('<div style="width:70px; float:left; margin-left:50px;"><input id="idm_checkbox" type="checkbox" style="vertical-align:text-bottom;"/><label for="textfield">IDM</label></div>');
                html_.push('</td></tr><tr>');
                html_.push('</table>');
                html_.push('<table id="setting_div_table_2" width="100%" border="0" style="border-collapse:separate; border-spacing:10px; display:none;">');
                html_.push('<tr>');
                html_.push('<td width="50"><label for="textfield"></label></td>');
                html_.push('<td width="320"><label for="textfield"></label></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2"><div style="color: #656565;">User-Agent</div><li class="b-list-item separator-1"></li></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2" id="setting_aria2_useragent">');
                html_.push('<a href="javascript:;" onclick=\'javascript:headers_.set_UA("chrome");\'><b>Chrome</b></a>');
                html_.push('<a href="javascript:;" onclick=\'javascript:headers_.set_UA("firefox");\'><b>Firefox</b></a>');
                html_.push('<a href="javascript:;" onclick=\'javascript:headers_.set_UA("exe");\'>云管家</a>');
                html_.push('<a href="javascript:;" onclick=\'javascript:document.getElementById("setting_aria2_useragent_input").removeAttribute("disabled");\'>自定义</a>');
                html_.push('</td>')
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">User-Agent :</label></td>');
                html_.push('<td><input type="text" id="setting_aria2_useragent_input" disabled="disabled" style="width:90%; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2"><div style="color: #656565;">Referer</div><li class="b-list-item separator-1"></li></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">Referer\u0020\uff1a\u0020</label></td>');
                html_.push('<td><input type="text" id="setting_aria2_referer_input" style="width:90%; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">自动设置</label></td>');
                html_.push('<td><input id=referer_auto type="checkbox"/></td>');
                html_.push('</tr><tr>');
                html_.push('<td colspan="2"><div style="color: #656565;">Headers<label for="textfield" style="margin-left: 35px;">※使用回车分隔每个headers。</label></div><li class="b-list-item separator-1"></li></td>');
                html_.push('</tr><tr>');
                html_.push('<td><label for="textfield">headers\u0020\uff1a\u0020</label></td>');
                html_.push('<td><textarea id="setting_aria2_headers" style="overflow:auto; resize:none; width:90%; height:80px; border: 1px solid #C6C6C6; box-shadow: 0 0 3px #C6C6C6; -webkit-box-shadow: 0 0 3px #C6C6C6;"></textarea></td>');
                html_.push('</tr>');
                html_.push('</table>');
                html_.push('</div>');
                html_.push('</div>');
                html_.push('<div style="margin-top:10px;">');
                html_.push('<div style="margin-left:77.5%;"><a href="javascript:;" id="apply" style="display:inline-block; width:120px; height:30px; border:1px solid #D1D1D1; background-color: #F7F7F7; text-align: center; text-decoration: none; padding-top:7px; color:#1B83EB;"><b>\u5e94\u7528</b></a></div>');
                html_.push('</div></div></div>');
                setting_div.innerHTML = html_.join("");
                document.body.appendChild(setting_div);
                $("#setting_div_close").click(function() {
                    $("#setting_div").hide();
                });
                $("#apply").click(function() {
                    self.get_config();
                    $("#setting_divtopmsg").html("设置已保存,目前只能设置RPC路径和用户名密码.");
                });
                $("#send_test").click(function() {
                    self.get_version();
                });
                $("#setting_div_more_settings_but").click(function() {
                    if ($("#setting_div_table_2").css("display") != "none") {
                        $("#setting_div_table_1").css("display", "table");
                        $("#setting_div_table_2").css("display", "none");
                        $("#setting_div_more_settings_but a").html("更多设置");
                    }
                    else {
                        $("#setting_div_table_1").css("display", "none");
                        $("#setting_div_table_2").css("display", "table");
                        $("#setting_div_more_settings_but a").html("返回");
                    }
                });
                $("#rpc_distinguish").click(function() {
                    if ($(this).attr("checked")) {
                        $("#rpc_user").removeAttr("disabled").css("background-color","#FFF");
                        $("#rpc_pass").removeAttr("disabled").css("background-color","#FFF");
                    } else {
                        $("#rpc_user").attr({"disabled": "disabled"}).css("background-color","#eee");
                        $("#rpc_pass").attr({"disabled": "disabled"}).css("background-color","#eee");
                    }
                })
                var rpc_url = localStorage.getItem("rpc_url");
                if (rpc_url) {
                    $("#rpc_input").val(rpc_url);
                } else {
                    $("#rpc_input").val("http://localhost:6800/jsonrpc");
                }
                if(localStorage.getItem("auth")=="true"){
                    var rpc_user=localStorage.getItem("rpc_user");
                    var rpc_pass=localStorage.getItem("rpc_pass");
                    $("#rpc_user").val(rpc_user);
                    $("#rpc_pass").val(rpc_pass);
                    $("#rpc_distinguish").attr("checked","checked");
                    $("#rpc_user").removeAttr("disabled").css("background-color","#FFF");
                    $("#rpc_pass").removeAttr("disabled").css("background-color","#FFF");
                    auth="Basic "+ btoa(rpc_user+":"+rpc_pass);
                }

            },
            get_config: function() {
                var rpc_url = $("#rpc_input").val();
                if (rpc_url) {
                    localStorage.setItem("rpc_url", rpc_url);
                    url = rpc_url + "?tm=" + (new Date().getTime().toString());
                }
                if($("#rpc_distinguish").attr("checked")){
                    localStorage.setItem("rpc_user",$("#rpc_user").attr("value"));
                    localStorage.setItem("rpc_pass",$("#rpc_pass").attr("value"));
                    localStorage.setItem("auth", true);
                    auth= "Basic "+ btoa($("#rpc_user").attr("value") + ":" + $("#rpc_pass").attr("value"));
              }else{
                localStorage.setItem("auth", false);
                localStorage.setItem("rpc_user",null);
                localStorage.setItem("rpc_pass",null);
              }
            },
            get_dlink: function() {
                var self = this;
                var Service = require("common:widget/commonService/commonService.js");
                Service.getDlink(JSON.stringify(self.get_info()), "dlink", self.aria2_rpc.bind(self));
            },
            get_version: function() {
                var parameter = [{
                        "jsonrpc": "2.0",
                        "method": "aria2.getVersion",
                        "id": 1
                    }];
                $.ajax({'url': url, 'dataType': 'json', type: 'POST', data: JSON.stringify(parameter),'headers': { 'Authorization': auth }})
                        .done(function(xml, textStatus, jqXHR) {
                            console.log(xml);
                            $("#send_test").html("ARIA2\u7248\u672c\u4e3a\uff1a\u0020" + xml[0].result.version);
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            $("#send_test").html(textStatus + "\u9519\u8BEF\uFF0C\u70B9\u51FB\u91CD\u65B0\u6D4B\u8BD5");
                        });

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
                $.ajax({'url': url, 'dataType': 'json', type: 'POST', data: JSON.stringify(data),'headers': { 'Authorization': auth }})
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
    if (response) {
        var cookies = response.cookie;
    } else {
        // location.reload(true);
    }
    onload(function() {
        var script = document.createElement('script');
        script.id = "baidu_script";
        script.appendChild(document.createTextNode('(' + baidu + ')("' + cookies + '");'));
        (document.body || document.head || document.documentElement).appendChild(script);
    });
});


