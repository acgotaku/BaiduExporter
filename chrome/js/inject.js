if (typeof browser != "undefined")
    chrome = browser;

function onload(callback) {
    if (document.readyState === "complete") {
        callback();
    } else {
        window.addEventListener("load", callback);
    }
}

function requestAddScript(name) {
    chrome.runtime.sendMessage({
        method: "add_script",
        data: "js/" + name + ".js"
    });
}

onload(function () {
    window.addEventListener("message", function (event) {
        if (event.source != window)
            return;

        if (event.data.type == "yunData") {
            console.log(event.data.data);
            window.yunData = JSON.parse(event.data.data);
        }
    });

    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("js/baidu.js");
    document.body.appendChild(s);

    if (window.location.href.includes("/disk/home"))
        requestAddScript("home");
    else if (window.location.href.includes("/pcloud/album/"))
        requestAddScript("album");
    else
        requestAddScript("share");
});