var fuck_baidu=function(){
	window["MutationObserver"] = null;
	window["WebKitMutationObserver"] =null;
	window["MozMutationObserver"] =null;
};
var script = document.createElement('script');
script.id = "fuck_baidu";
script.appendChild(document.createTextNode('(' + fuck_baidu + ')();'));
(document.body || document.head || document.documentElement).appendChild(script);