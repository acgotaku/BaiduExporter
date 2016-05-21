(function () {
    //网盘主页导出
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
    var Downloader = (function () {
        var delay;

        var currentTaskId = 0;
        var folders = [];
        var files = [];
        var completedCount = 0;
        function getNextFile(taskId) {
            if (taskId != currentTaskId)
                return;

            completedCount++;
            showToast("正在获取下载地址... " + completedCount + "/" + (completedCount + folders.length - 1), "MODE_SUCCESS");

            if (folders.length != 0) {
                var path = folders.pop();
                $.get("/api/list", {
                    "dir": path,
                    "bdstoken": yunData.MYBDSTOKEN,
                    "channel": "chunlei",
                    "clienttype": 0,
                    "web": 1
                }, null, "json").done(function (json) {
                    setTimeout(function () { getNextFile(taskId), delay });

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

                    setTimeout(function () { getNextFile(taskId), delay });
                });
            }
            else if (files.length != 0) {
                setFileData(files);
                downloader.reset();
            }
            else {
                showToast("一个文件都没有哦", "MODE_CAUTION");
                downloader.reset();
            }
        }

        var downloader = {};

        downloader.addFolder = function (path) {
            folders.push(path);
        };

        downloader.addFile = function (fileId) {
            files.push(fileId);
        };

        downloader.start = function () {
            delay = parseInt(localStorage.getItem("rpc_delay")) || 300;
            currentTaskId = new Date().getTime();
            getNextFile(currentTaskId);
        }

        downloader.reset = function () {
            currentTaskId = 0;
            folders = [];
            files = [];
            completedCount = 0;
        };

        return downloader;
    })();

    function setFileData(files) {
        // var type = files.length == 1 ? "dlink" : "batch";
        var type = "dlink";
        $.get("/api/download", {
            "type": type,
            "fidlist": JSON.stringify(files),
            "bdstoken": yunData.MYBDSTOKEN,
            "channel": "chunlei",
            "clienttype": 0,
            "web": 1
        }, null, "json").done(function (json) {
            if (json.errno != 0) {
                showToast("出现异常!", "MODE_FAILURE");
                console.log(json);
                return;
            }

        });
    }

    window.addEventListener("message", function (event) {
        if (event.source != window)
            return;

        if (event.data.type == "selected") {
            Downloader.reset();

            var selectedFile = event.data.data;
            if (selectedFile.length == 0) {
                showToast("先选择一下你要下载的文件哦", "failure");
                return;
            }

            for (var item of selectedFile) {
                if (item.isdir)
                    Downloader.addFolder(item.path);
                else
                    Downloader.addFile(item.fs_id);
            }

            Downloader.start();
        }
    });

    function getSelected() {
        window.postMessage({ "type": "get_selected" }, "*");
    }

    //生成请求参数 发送给后台 进行 http请求
    function generateParameter(rpc_list) {
        var paths = CORE.parseAuth(RPC_PATH);
        for (var i = 0; i < rpc_list.length; i++) {
            var parameter = { url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: { Authorization: paths[0] } };
            sendToBackground("rpc_data", parameter, function (success) {
                if (success)
                    showToast("下载成功!赶紧去看看吧~", "MODE_SUCCESS");
                else
                    showToast("下载失败!是不是没有开启aria2?", "MODE_FAILURE");
            });
        }
    }

    // Init
    CORE.requestCookies([{ url: "http://pan.baidu.com/", name: "BDUSS" }, { url: "http://pcs.baidu.com/", name: "BAIDUID" }]);

    setTimeout(function () {
        var menu = CORE.addMenu.init("home");
        menu.on("click", ".rpc_export_list", function () {
            MODE = "RPC";
            RPC_PATH = $(this).data("id");
            getSelected();
        });
        menu.on("click", "#aria2_download", function () {
            MODE = "TXT";
            CORE.dataBox.init("home");
            // When closing download dialog, cancel all delay feteching.
            CORE.dataBox.onClose(Downloader.reset);
            getSelected();
        });
        showToast("初始化成功!", "success");
    }, 600);
})();