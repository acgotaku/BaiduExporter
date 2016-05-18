var SHARE = (function () {
    //网盘分享页面导出
    /*
    基本步骤是首先设定导出模式,文本模式的话
    只需要初始化文本框即可,RPC模式要设置好 RPC地址
    然后开始分析选中的文件 获取当前文件夹的所以文件id
    然后进行比较,如果是文件 直接进行下载 如果是文件夹则递归查找
    遇到文件就下载 遇到文件夹继续获取文件夹里面的内容

    */
    //两种导出模式 RPC模式 和 TXT模式
    var MODE = "RPC";
    var RPC_PATH = "http://localhost:6800/jsonrpc";
    var cookies;
    var folders = [], files = [];
    var completedCount = 0;
    var currentTaskId;
    function getNextFile(taskId, setFileData) {
        if (taskId != currentTaskId)
            return;

        completedCount++;
        showToast("正在获取下载地址... " + completedCount + "/" + (completedCount + folders.length + files.length - 1), "MODE_SUCCESS");

        if (folders.length != 0) {
            var path = folders.pop();
            $.get("/share/list", {
                "dir": path,
                "bdstoken": yunData.MYBDSTOKEN,
                "uk": yunData.SHARE_UK,
                "shareid": yunData.SHARE_ID,
                "channel": "chunlei",
                "clienttype": 0,
                "web": 1
            }, null, "json").done(json => {
                var delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
                setTimeout(() => getNextFile(taskId, setFileData), delay);

                if (json.errno != 0) {
                    showToast("获取共享列表失败!", "MODE_FAILURE");
                    console.log(json);
                    return;
                }

                for (var item of json.list) {
                    if (item.isdir)
                        folders.push(item.path);
                    else
                        files.push(item.fs_id);
                }
            }).fail(function (xhr) {
                showToast("获取共享列表失败!", "MODE_FAILURE");
                console.log(xhr);

                var delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
                setTimeout(() => getNextFile(taskId, setFileData), delay);
            });
        }
        else if (files.length != 0) {
            var id = files.shift();
            setFileData(id, function () {
                var delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
                setTimeout(() => getNextFile(taskId, setFileData), delay);
            });
        }
        else {
            showToast("批量导出完成！", "MODE_SUCCESS");
            currentTaskId = 0;
        }
    }
    return {
        //绑定事件
        init: function () {
            var self = this;
            CORE.requestCookies([{ url: "http://pan.baidu.com/", name: "BDUSS" }, { url: "http://pcs.baidu.com/", name: "pcsett" }]);
            // Get `BDCLND` cookie for private share.
            sendToBackground("get_cookies", [{ url: "http://pan.baidu.com/", name: "BDCLND" }], value => {
                cookies = decodeURIComponent(value["BDCLND"]);

                var menu = CORE.addMenu.init("share");
                menu.on("click", ".rpc_export_list", function () {
                    MODE = "RPC";
                    RPC_PATH = $(this).data("id");
                    self.getShareFile();
                });
                menu.on("click", "#aria2_download", function () {
                    MODE = "TXT";
                    CORE.dataBox.init("share");
                    // When closing download dialog, cancel all delay feteching.
                    CORE.dataBox.onClose(_ => currentTaskId = 0);
                    self.getShareFile();
                });
                showToast("初始化成功!", "MODE_SUCCESS");
            });
        },
        //获得选中的文件
        getShareFile: function () {
            currentTaskId = new Date().getTime();

            if (yunData.SHAREPAGETYPE == "single_file_page") {
                this.setFileData(yunData.FS_ID);
            } else {
                // TODO(Simon): Download all files by default? Maybe we can switch the button content between "导出全部" and "导出所选".
                var selected = $(".chked").closest(".item");
                if (selected.length == 0) {
                    showToast("先选择一下你要下载的文件哦", "MODE_CAUTION");
                    return;
                }

                completedCount = 0;
                folders = [];
                files = [];

                function getHashParameter(name) {
                    var hash = window.location.hash;
                    hash = hash.substr(1).split("&");
                    for (var pair of hash) {
                        var arr = pair.split("=");
                        if (arr[0] == name)
                            return decodeURIComponent(decodeURIComponent(arr[1]));
                    }
                }

                var path = getHashParameter("path");
                var isRoot = false;
                if (path == "/" || path == undefined) {
                    isRoot = true;
                    path = yunData.PATH;
                }

                // Short path, we are at root folder, so the only thing we can do is downloading all files.
                if (isRoot) {
                    folders.push(path);
                }
                else {
                    for (var item of selected) {
                        var $item = $(item);
                        if ($item.data("extname") == "dir")
                            folders.push(path + "/" + $item.find(".name-text").data("name"));
                        else
                            files.push($item.data("id"));
                    }
                }

                getNextFile(currentTaskId, this.setFileData.bind(this));
            }
        },
        //设置要请求文件的POST数据
        setFileData: function (fid, callback) {
            var data = {
                "encrypt": "0",
                "product": "share",
                "uk": yunData.SHARE_UK,
                "primaryid": yunData.SHARE_ID,
                "fid_list": JSON.stringify([fid])
            };

            if (!yunData.SHARE_PUBLIC)
                data["extra"] = JSON.stringify({ sekey: cookies });

            this.getFilemetas(data, callback);
        },
        alertDialog: function (json, data, callback) {
            var self = this;
            var id = json.request_id;
            var div = $("<div>").attr("id", "alert_div" + id).addClass("b-panel b-dialog alert-dialog");
            var html = [
                '<div class="dlg-hd b-rlv">',
                '<div title="关闭" id="alert_dialog_close" class="dlg-cnr dlg-cnr-r"></div>',
                "<h3>提示</h3>",
                "</div>",
                '<div class="dlg-bd">',
                '<div class="alert-dialog-msg center">',
                '<div class="download-verify">',
                '<div class="verify-body">请输入验证码：<input id="verification" type="text" class="input-code" maxlength="4">',
                '<img id="vcode" class="img-code" alt="验证码获取中"  width="100" height="30">',
                '<a href="javascript:;" class="underline" id="change">换一张</a>',
                "</div>",
                '<div class="verify-error">',
                (json.auth ? "\u9a8c\u8bc1\u7801\u8f93\u5165\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165" : ""),
                "</div>",
                "</div>",
                "</div>",
                "</div>",
                '<div class="dlg-ft b-rlv">',
                '<div class="alert-dialog-commands clearfix center">',
                '<a href="javascript:;" id="okay" class="sbtn okay"><b>确定</b></a>',
                '<a href="javascript:;" id="ignore" class="dbtn cancel"><b>取消</b></a>',
                "</div>",
                "</div>"
            ];
            div.html(html.join(""));
            div.appendTo($("body"));
            div.find("*[id]").each(function (index, element) {
                $(element).attr("id", $(element).attr("id") + id);
            });
            div.show();
            var offset = new Date().getTime().toString().slice(-2);
            var screenWidth = $(window).width(), screenHeight = $(window).height();
            var scrolltop = $(document).scrollTop();
            var divLeft = (screenWidth - div.width()) / 2 + parseInt(offset);
            var divTop = (screenHeight - div.height()) / 2 + scrolltop - parseInt(offset);
            div.css({ left: divLeft + "px", top: divTop + "px", "z-index": 2000 });
            $("#vcode" + id).attr("src", json.vcode_img);
            $("#change" + id).unbind().click(function () {
                var url = "//pan.baidu.com/genimage";
                $("#vcode" + id).attr("src", url + "?" + json.vcode_str + "&" + new Date().getTime());
            });
            $("#okay" + id).unbind().click(function () {
                data["vcode_input"] = $("#verification" + id).val();
                data["vcode_str"] = json.vcode_str;
                self.getFilemetas(data, callback);
                div.remove();
            });
            $("#ignore" + id).unbind().click(function () {
                div.remove();
                showToast("\u5509\u002e\u002e\u002e\u002e\u002e", "MODE_CAUTION");
            });
            $("#alert_dialog_close" + id).unbind().click(function () {
                div.remove();
            });
        },
        //根据文件路径获取文件的信息
        getFilemetas: function (data, callback) {
            $.post("/api/sharedownload?" + $.param({
                "timestamp": yunData.TIMESTAMP,
                "sign": yunData.SIGN,
                "bdstoken": yunData.MYBDSTOKEN,
                "app_id": yunData.FILEINFO[0].app_id,
                "channel": "chunlei",
                "clienttype": 0,
                "web": 1
            }), data, null, "json").done(json => {
                if (json.errno == -20) {
                    $.get("/api/getcaptcha", {
                        "bdstoken": yunData.MYBDSTOKEN,
                        "app_id": yunData.FILEINFO[0].app_id,
                        "prod": "share",
                        "channel": "chunlei",
                        "clienttype": 0,
                        "web": 1
                    }, null, "json").done(json => {
                        if (data["vcode_input"]) {
                            json.auth = true;
                        }
                        this.alertDialog(json, data, callback);
                        showToast("请输入验证码以继续下载", "MODE_CAUTION");
                    }).fail(function (json, textStatus, jqXHR) {
                        showToast("获取验证码失败?", "MODE_FAILURE");
                    });
                } else if (json.errno == 0) {
                    var file_list = [];

                    if (yunData.SHAREPAGETYPE == "single_file_page") {
                        var item = json.list[0];
                        // For single file, save to filename.
                        file_list.push({ "name": yunData.FILENAME, "link": item.dlink });
                    }
                    else {
                        // For multiple files, save relates to share base folder.
                        for (var item of json.list) {
                            var path = item.path.substr(item.path.indexOf(yunData.FILENAME));
                            file_list.push({ "name": path, "link": item.dlink });
                        }
                    }

                    if (MODE == "TXT") {
                        // Show download dialog when we got the first download link.
                        // For delay fetching, dont't show it after task is canceled.
                        if (currentTaskId != 0) {
                            CORE.dataBox.show();
                            CORE.dataBox.fillData(file_list);
                        }
                    } else {
                        var paths = CORE.parseAuth(RPC_PATH);
                        var rpc_list = CORE.aria2Data(file_list, paths[0], paths[2]);
                        this.generateParameter(rpc_list);
                    }

                    if (callback)
                        callback();
                } else {
                    console.log(json);
                    showToast("出现异常!", "MODE_FAILURE");

                    if (callback)
                        callback();
                }

            }).fail(function (jqXHR, textStatus, errorThrown) {
                showToast("获取地址失败?", "MODE_FAILURE");
                console.log(jqXHR);

                if (callback)
                    callback();
            });
        },
        //生成请求参数 发送给后台 进行 http请求
        generateParameter: function (rpc_list) {
            var paths = CORE.parseAuth(RPC_PATH);
            for (var i = 0; i < rpc_list.length; i++) {
                var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
                sendToBackground("rpc_data", parameter, success => {
                    if (success)
                        showToast("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                    else
                        showToast("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
                });
            }
        }
    };
})();

SHARE.init();