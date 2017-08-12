var showToast;

(function () {
    // 封装的百度的Toast提示消息
    // Type类型有
    // caution       警告  failure       失败  loading      加载 success      成功
    // MODE_CAUTION  警告  MODE_FAILURE  失败  MODE_LOADING 加载 MODE_SUCCESS 成功

    if (typeof window.require == "undefined") {
        showToast = function (message, type) {
            Utilities.useToast({
                toastMode: disk.ui.Toast[type],
                msg: message,
                sticky: false
            })
        };
    } else if (typeof manifest == "object") {
        // New version
        var Context = window.require("system-core:context/context.js").instanceForSystem;
        Context.log.send=function(e){};
        showToast = function (message, type) {
            if (type.startsWith("MODE")) {
                type = type.split("_")[1].toLowerCase();
            }
            Context.ui.tip({
                mode: type,
                msg: message
            });
        };

        window.addEventListener("message", function (event) {
            if (event.source != window)
                return;

            if (event.data.type == "get_selected") {
                window.postMessage({ type: "selected", data: Context.list.getSelected() }, "*");
            }
        });
    } else {
        var Toast = window.require("common:widget/toast/toast.js");
        showToast = function (message, type) {
            Toast.obtain.useToast({
                toastMode: Toast.obtain[type],
                msg: message,
                sticky: false
            });
        };
    }

    window.addEventListener("message", function (event) {
        if (event.source != window)
            return;

        if (event.data.type == "show_toast") {
            var request = event.data.data;
            showToast(request.message, request.type);

            var button = $("#export_menu");
            var removeChild = Node.prototype.removeChild;
            var after = jQuery.fn.after;
            if (button.length != 0) {
                try {
                    jQuery.fn.after = function() {
                        node = [].concat.apply( [], arguments )[0];
                        if ( node && node[0].id === "export_menu") {
                            console.log("Fuck Baidu!");
                        } else {
                            return after.apply(this, arguments);
                        }
                    };
                    button.parent()[0].removeChild = function (node) {
                        if ( node.id === "export_menu") {
                            console.log("Remove me? Naive!");
                        } else {
                            removeChild.apply(this, arguments);
                        }
                    };
                    Object.defineProperty(button.parent()[0], "removeChild", { writable: false} );
                    Object.defineProperty(jQuery.fn, "after", { writable: false} );
                } catch (e) {
                    console.log("Unable to hook removeChild");
                }
            }
        }
    });
    if (window.yunData) {
        if (window.yunData.sign2) {
            var yunData = window.require('disk-system:widget/data/yunData.js').get();
            window.postMessage({ type: "yunData", data: JSON.stringify(yunData) }, "*");
        }
        else {
            window.postMessage({ type: "yunData", data: JSON.stringify(window.yunData) }, "*");
        }
    }
    else if (window.disk.ui.album) {
        var real = window.disk.ui.album.prototype.buildListView;
        window.disk.ui.album.prototype.buildListView = function (list) {
            window.postMessage({ type: "yunData", data: JSON.stringify(list) }, "*");
            real.call(this, list);
        }
    }
    else if (disk.util.ViewShareUtils) {
        window.postMessage({ type: "yunData", data: disk.util.ViewShareUtils.viewShareData }, "*");
    }
})();