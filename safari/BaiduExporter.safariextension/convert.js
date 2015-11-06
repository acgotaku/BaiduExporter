var CONVERT =(function(){
    //网盘分享页面转存
    /*
    */
    var setMessage =CORE.setMessage;
    var HttpSend= CONNECT.HttpSend;
    const prefix="/我的资源";
    var fold_list=[];
    var delay=parseInt(localStorage.getItem("rpc_delay"))||3000;
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
                    self.createFold(self.getCurrentPath(),function(){
                        for (var i = 0; i < Filename.length; i++) {
                                if (Filename[i].attr("data-extname") != "dir") {
                                    var name =Filename[i].children().eq(0).children().eq(2).attr("title")||Filename[i].children().eq(1).children().eq(0).attr("title");
                                    self.saveConvertFile(self.getCurrentPath()+name);   

                                }else{
                                    self.getShareFold(Filename[i].attr("data-id"));
                                    
                                }
                        }
                    });
                }
        },
        //检测这个文件夹是否存在
        checkFold:function(path){
            var self=this;
            for(var i=0;i<fold_list.length;i++){
                if(path == fold_list[i]){
                    return null;
                }
            }
            if(path.length<=1){
                return null;
            }
            fold_list.push(path);
            var parameter = {'url': "//"+window.location.host+"/api/list?dir="+encodeURIComponent(path), 'dataType': 'json', type: 'GET'};
            return HttpSend(parameter);
        },
        saveConvertFile:function(path){
            console.log(path);
            var self = this; 
            var data = 'filelist='+encodeURIComponent("[\""+path+"\"]")+'&path='+encodeURIComponent(prefix+path.substring(0,path.lastIndexOf("/")));
            var convert = "//" + window.location.host + "/share/transfer?async=1&channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN + "&shareid="+ yunData.SHARE_ID + "&from="+yunData.SHARE_UK ;
            var parameter = {'url': convert, 'dataType': 'json', type: 'POST', 'data': data};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        if(json.errno == 2){
                            console.log("folder miss");
                        } else if(json.errno ==0){
                            setMessage("转存成功!", "MODE_SUCCESS");
                        }else if(json.errno ==12){
                            setMessage("已经保存了不用再操作了!", "MODE_FAILURE");   
                        }else if(json.errno ==111){
                            setTimeout(function(){
                                self.saveConvertFile(path);
                            },delay);
                            console.log("111");
                            setMessage("保存的有点太快了!", "MODE_FAILURE");   
                        }else{
                            console.log(json);
                            setMessage("转存出现异常!", "MODE_FAILURE");   
                        }

                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("转存失败?", "MODE_FAILURE");
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
            var result=self.checkFold(path);
            if(result){
                result.done(function(json, textStatus, jqXHR){
                    if(json.errno == "-9"){
                        HttpSend(parameter).done(function(json, textStatus, jqXHR) {
                            setMessage("创建文件夹成功!", "MODE_SUCCESS");
                            callback(file_path);
                        })
                    }else if(json.errno == "0"){
                            callback(file_path);
                    }
                })                   
            }else{
                callback(file_path);
            }
        },
        //获取要下载的文件夹
        getShareFold:function(fs_id){
            var self=this;
            var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
            var path=self.getCurrentPath();
            var parameter = {'url': "//"+window.location.host+"/share/list?dir="+encodeURIComponent(path)+"&bdstoken="+yunData.MYBDSTOKEN+"&uk="+yunData.SHARE_UK+"&shareid="+yunData.SHARE_ID+"&channel=chunlei&clienttype=0&web=1", 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        setMessage("获取共享列表成功!", "MODE_SUCCESS");
                        var array=json.list;
                        console.log(json);
                        for(var i=0;i<array.length;i++){
                            if(array[i].fs_id == fs_id ||API.get("path")=="/" || API.get("path") == null){
                                var file_path=array[i].path;
                                if(array[i].isdir == 1){
                                    self.createFold(file_path,function(path){
                                        self.getRecursiveFold(path);
                                    });
                                }else{
                                    self.saveConvertFile(file_path);
                                } 
                            }
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取共享列表失败!", "MODE_FAILURE");
                        console.log(jqXHR);
                    });  
        },
        //递归下载
        getRecursiveFold:function(path){
            var self=this;
            var time=0;
            var parameter = {'url': "//"+window.location.host+"/share/list?dir="+encodeURIComponent(path)+"&bdstoken="+yunData.MYBDSTOKEN+"&uk="+yunData.SHARE_UK+"&shareid="+yunData.SHARE_ID+"&channel=chunlei&clienttype=0&web=1", 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        var array=json.list;
                        for(var i=0;i<array.length;i++){
                            time=time+self.getRandomDelay(delay);
                            var file_path=array[i].path;
                            if(array[i].isdir == 1){
                                delayLoopList(file_path,time);
                            }else{
                                delayLoopFile(file_path,time);
                            }
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取List失败!", "MODE_FAILURE");
                        console.log(jqXHR);
                    });
            function delayLoopList(path,time){
                setTimeout(function(){
                    self.createFold(path,function(path){
                        self.getRecursiveFold(path);
                    })
                },time);
            } 
            function delayLoopFile(path,time){
                setTimeout(function(){
                    self.saveConvertFile(path);
                },time);
            } 
        },
        //生成请求参数 发送给后台 进行 http请求
        generateParameter:function(rpc_list){
            var paths=CORE.parseAuth(RPC_PATH);
            for(var i=0;i<rpc_list.length;i++){
                var parameter = {'url': paths[1], 'dataType': 'json', type: 'POST', data: JSON.stringify(rpc_list[i]), 'headers': {'Authorization': paths[0]}};
                CONNECT.sendToHttp("rpc_data",parameter);
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
        },
        getRandomDelay:function(delay){
            var max=delay+3000;
            var min=delay-3000;
            return Math.random() * (max - min) + min;
        }

    }
})();
setTimeout(function(){
    CONVERT.init();
},800);