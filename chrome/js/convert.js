var CONVERT =(function(){
    //网盘分享页面转存
    /*
    */
    var setMessage =CORE.setMessage;
    const prefix="/我的资源";
    var BUFFER_SIZE = 8;
    var POLLING_INTERVAL = 100;
    var pendingSend = 0;
    var list={};
    var HttpSend = function(info) {
        Promise.prototype.done=Promise.prototype.then;
        Promise.prototype.fail=Promise.prototype.catch;
        
        if (pendingSend > BUFFER_SIZE) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(HttpSend(info))
                }, POLLING_INTERVAL)
            });
        }

        return new Promise(function(resolve, reject) {
            pendingSend += 1;
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
                pendingSend -= 1;
                reject(http);
            }
            http.onreadystatechange = function() {
                if (http.readyState == 4) {
                    pendingSend -= 1;
                    if ((http.status == 200 && http.status < 300) || http.status == 304) {
                        clearTimeout(timeId);
                        if (info.dataType == "json") {
                            resolve(JSON.parse(http.responseText), http.status, http);
                        }
                        else if (info.dataType == "SCRIPT") {
                            // eval(http.responseText);
                            resolve(http.responseText, http.status, http);
                        }
                        resolve(http, http.status);
                    }
                    else {
                        clearTimeout(timeId);
                        reject(http, http.statusText, http.status);
                    }
                }
            }
            http.open(info.type, info.url, true);
            http.setRequestHeader("Content-type", contentType);
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
    };
    return {
        //绑定事件
        init:function(){
            var self=this;
            var menu=self.addMenu();
            menu.on("click",function(event){
                event.preventDefault();
                self.getConvertFile();
                return false;

            });
            var file_lists =yunData.getContext().file_list.list;
            for (var i = 0; i < file_lists.length; i++){
                var file_list = file_lists[i];
                list[file_list.fs_id] = file_list.path;
            }
            setMessage("初始化成功!", "MODE_SUCCESS");
        },
        addMenu:function(){
            //添加批量转存按钮
            var convert_btn = $("<span>").addClass("icon-btn-device").css("float", "none");
            convert_btn.addClass("new-dbtn").append('<em class="global-icon-download"></em><b>批量转存</b>');
            $('span a[class="new-dbtn"]').parent().prepend(convert_btn);
            return convert_btn;
        },
        //获得选中的文件
        getConvertFile:function(){
                var self = this;
                if (yunData.SHAREPAGETYPE=="single_file_page") {
                    setMessage("单个文件你转存个毛!", "MODE_CAUTION");
                } else {
                    var File = require("common:widget/data-center/data-center.js");
                    var Filename = File.get("selectedItemList");
                    var file_info = File.get("selectedList");
                    if (file_info.length == 0) {
                        setMessage("先选择一下你要转存的文件夹哦", "MODE_CAUTION");
                        return;
                    }
                    for (var i = 0; i < Filename.length; i++) {
                        var fs_id = parseInt(Filename[i].attr("data-id"));
                        self.saveConvertFile({"fs_id":fs_id,"path":list[fs_id]});   
                    }
                }
        },
        //检测这个文件夹是否存在
        removeFold:function(path){
            var self = this;
            var data ='filelist='+encodeURIComponent("[\""+path+"\"]");
            var parameter = {'url': "//"+window.location.host+"/api/filemanager?"+"opera=delete&async=2&channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN, 'dataType': 'json', type: 'POST', 'data': data};
            HttpSend(parameter)
                .done(function(json, textStatus, jqXHR) {
                    if(json.errno ==12){
                        console.log("删除失败!");
                    }else if(json.erron == 0){
                        console.log("删除成功");
                    }else{
                        console.log("未知错误"+json);
                    }
                });
        },
        checkFold:function(path){
            var self=this;
            if(path.length<=1){
                return null;
            };
            var parameter = {'url': "//"+window.location.host+"/api/list?dir="+encodeURIComponent(path), 'dataType': 'json', type: 'GET'};
            return HttpSend(parameter);
        },
        saveConvertFile:function(item){
            var self = this; 
            var data = 'filelist='+encodeURIComponent("[\""+item.path+"\"]")+'&path='+encodeURIComponent(prefix+item.path.substring(0,item.path.lastIndexOf("/")));
            var convert = "//" + window.location.host + "/share/transfer?async=1&channel=chunlei&clienttype=0&web=1&ondup=overwrite&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN + "&shareid="+ yunData.SHARE_ID + "&from="+yunData.SHARE_UK ;
            var parameter = {'url': convert, 'dataType': 'json', type: 'POST', 'data': data};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        if(json.errno == 2){
                            console.log("folder miss"+ item.path);
                        } else if(json.errno ==0){
                            setMessage("转存成功!", "MODE_SUCCESS");
                            console.log("转存成功:" + item.path);
                        }else if(json.errno ==12){
                            if(json.limit){
                                setMessage("文件超过5000,分解转存!", "MODE_SUCCESS");
                                console.log("文件超过5000,分解转存!" + item.path);
                                self.createFold(item.path,function(){
                                    self.getRecursiveFold(item);
                                });
                            }
                        }else if(json.errno ==111){ //当前还有未完成的任务，需完成后才能操作
                            setMessage("保存的有点太快了!", "MODE_FAILURE");   
                            console.log("111", item.path);
                        }else{
                            console.log("some error"+json);
                            setMessage("转存出现异常!", "MODE_FAILURE");   
                        }

                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("转存失败?", "MODE_FAILURE");
                        console.log(jqXHR);
                    });   

        },
        //创建转存文件需要的文件夹
        createFold:function(path,callback) {
            var self = this; 
            var file_path=path;
            path=prefix+path;
            var data = 'path='+encodeURIComponent(path)+'&isdir=1&size=&block_list=%5B%5D&method=post';
            var convert = "//" + window.location.host + "/api/create?a=commit&channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN;
            var parameter = {'url': convert, 'dataType': 'json', type: 'POST', 'data': data};
            self.checkFold(path)
                .done(function(json, textStatus, jqXHR){
                    if(json.errno === -9){
                        HttpSend(parameter).done(function(json, textStatus, jqXHR) {
                            setMessage("创建文件夹成功!", "MODE_SUCCESS");
                            console.log("创建文件夹"+ json.path);
                            callback(file_path);
                            if (json.path !== path && /\(\d+\)/.exec(json.path.substr(path.length))){
                                setTimeout(function(){
                                    self.removeFold(json.path);
                                },POLLING_INTERVAL * 50);
                            }
                        })
                    }else{
                        callback(file_path);
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    setMessage("创建文件夹失败!", "MODE_FAILURE");
                    console.log(jqXHR);
                });
        },
        //递归下载
        getRecursiveFold:function(item){
            var self=this;
            var parameter = {'url': "//"+window.location.host+"/share/list?dir="+encodeURIComponent(item.path)+"&bdstoken="+yunData.MYBDSTOKEN+"&uk="+yunData.SHARE_UK+"&shareid="+yunData.SHARE_ID+"&channel=chunlei&clienttype=0&web=1", 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        var array=json.list;
                        for(var i=0;i<array.length;i++){
                            delayLoop({"fs_id": array[i].fs_id, "path": array[i].path} ,i);
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取List失败!", "MODE_FAILURE");
                        console.log(jqXHR);
                    });
            function delayLoop(item , i){
                setTimeout(function() {
                    self.saveConvertFile(item);
                }, POLLING_INTERVAL * i);  
            }
        },
        //得到当前文件夹的路径
        getCurrentPath:function(){
            var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
            var path_head=yunData.PATH.slice(0,yunData.PATH.lastIndexOf("/"));
            var path=API.get("path");
            if(path == "/"|| path == null){
                path=yunData.PATH;
            }else{
                path=path_head+path;
            }
            return path;
        }
    }
})();
setTimeout(function(){
    CONVERT.init();
},800);