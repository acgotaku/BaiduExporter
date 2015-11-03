var CONVERT =(function(){
    //网盘分享页面转存
    /*

    */
    var setMessage =CORE.setMessage;
    var HttpSend= CONNECT.HttpSend;
    const prefix="/我的资源";
    var fold_list=[];
    return {
        //绑定事件
        init:function(){
            var self=this;
            var menu=self.addMenu();
            menu.on("click",function(){
                self.getConvertFile();

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
                    for (var i = 0; i < Filename.length; i++) {
                            if (Filename[i].attr("data-extname") != "dir") {
                                var fid_list = 'fid_list=' + JSON.stringify([Filename[i].attr("data-id")]);
                                var name =Filename[i].children().eq(0).children().eq(2).attr("title")||Filename[i].children().eq(1).children().eq(0).attr("title");
                                self.checkFold(self.getCurrentPath(),self.getCurrentPath()+name);
                            }else{
                                self.getShareFold(Filename[i].attr("data-id"));
                                
                            }
                    }
                }
        },
        //检测这个文件夹是否存在
        checkFold:function(path,file){
            var self=this;
            path=prefix+path;
            for(var i=0;i<fold_list.length;i++){
                if(path == fold_list[i]){
                    self.saveConvertFile(file);
                    return;
                }
            }
            if(path.length<=1){
                return;
            }
            fold_list.push(path);
            console.log(fold_list);
            var parameter = {'url': "//"+window.location.host+"/api/list?dir="+encodeURIComponent(path), 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                .done(function(json, textStatus, jqXHR){
                               if(json.errno == "-9"){
                                self.createFold(path).done(function(json, textStatus, jqXHR){
                                    setMessage("创建文件夹成功!", "MODE_SUCCESS");
                                    self.saveConvertFile(file);
                                });
                               }else if(json.errno == "0"){
                                    self.saveConvertFile(file);
                               }
                            })
        },
        saveConvertFile:function(path){
            var self = this; 
            var time=0;
            var delay=parseInt(localStorage.getItem("rpc_delay"))||300;
            var data = 'filelist='+encodeURIComponent("[\""+path+"\"]")+'&path='+encodeURIComponent(prefix+path.substring(0,path.lastIndexOf("/")));
            var convert = "//" + window.location.host + "/share/transfer?async=1&channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN + "&shareid="+ yunData.SHARE_ID + "&from="+yunData.SHARE_UK ;
            var parameter = {'url': convert, 'dataType': 'json', type: 'POST', 'data': data};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        if(json.errno == 2){
                            console.log("folder miss");
                            console.log(path);
                            time=time+delay;
                            setTimeout(function(){
                                self.checkFold(path.substring(0,path.lastIndexOf("/")),path);
                            },time);
                            //self.saveConvertFile(obj);
                        } else if(json.errno ==0){
                            setMessage("转存成功!", "MODE_SUCCESS");
                        }else if(json.errno ==12){
                            setMessage("已经保存了不用再操作了!", "MODE_FAILURE");   
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
        createFold:function(path) {
            var self = this; 
            var data = 'path='+encodeURIComponent(path)+'&isdir=1&size=&block_list=%5B%5D&method=post';
            var convert = "//" + window.location.host + "/api/create?a=commit&channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&bdstoken=" + yunData.MYBDSTOKEN;
            var parameter = {'url': convert, 'dataType': 'json', type: 'POST', 'data': data};
            return HttpSend(parameter);              
        },
        //设置要请求文件的POST数据
        setFileData:function(fid_list){
            var data = "encrypt=0&product=share&uk="+yunData.SHARE_UK+"&primaryid="+yunData.SHARE_ID+"&"+fid_list;
            if(yunData.SHARE_PUBLIC == 0){
                var Service = require("common:widget/commonService/commonService.js");
                data = data+"&extra="+encodeURIComponent(JSON.stringify({sekey:Service.getCookie("BDCLND")}));
            }
            this.getFilemetas(data);
        },
        //获取要下载的文件夹
        getShareFold:function(fs_id){
            var self=this;
            var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
            var path_head=yunData.PATH.slice(0,yunData.PATH.lastIndexOf("/"));
            var path=API.get("path");
            if(path == "/"|| path == null){
                path=yunData.PATH;
            }else{
                path=path_head+path;
            }
            var parameter = {'url': "//"+window.location.host+"/share/list?dir="+encodeURIComponent(path)+"&bdstoken="+yunData.MYBDSTOKEN+"&uk="+yunData.SHARE_UK+"&shareid="+yunData.SHARE_ID+"&channel=chunlei&clienttype=0&web=1", 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        setMessage("获取共享列表成功!", "MODE_SUCCESS");
                        var array=json.list;
                        console.log(json);
                        for(var i=0;i<array.length;i++){
                            if(array[i].fs_id == fs_id ||API.get("path")=="/" || API.get("path") == null){
                                console.log(array[i]);
                                if(array[i].isdir == 1){
                                    self.getRecursiveFold(array[i].path);
                                }else{
                                    self.checkFold(array[i].path.substring(0,array[i].path.lastIndexOf("/")),array[i].path);
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
            var delay=parseInt(localStorage.getItem("rpc_delay"))||300;
            var parameter = {'url': "//"+window.location.host+"/share/list?dir="+encodeURIComponent(path)+"&bdstoken="+yunData.MYBDSTOKEN+"&uk="+yunData.SHARE_UK+"&shareid="+yunData.SHARE_ID+"&channel=chunlei&clienttype=0&web=1", 'dataType': 'json', type: 'GET'};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        var array=json.list;
                        for(var i=0;i<array.length;i++){
                            time=time+delay;
                            if(array[i].isdir == 1){
                                delayLoopList(array[i].path,time);
                            }else{
                                delayLoopFile(array[i].fs_id,time);     
                            }
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取List失败!", "MODE_FAILURE");
                        console.log(textStatus);
                    });  
            function delayLoopList(path,time){
                setTimeout(function(){
                    self.getRecursiveFold(path);
                },time);
            } 
            function delayLoopFile(fs_id,time){
                setTimeout(function(){
                    var fid_list = 'fid_list=' + JSON.stringify([fs_id]);
                    self.setFileData(fid_list);
                    
                },time);
            } 
        },
        alertDialog:function(json, params){
            var self = this;
            var id = json.request_id;
            var div = $("<div>").attr("id", "alert_div" + id).addClass("b-panel b-dialog alert-dialog");
            var html = [
                '<div class="dlg-hd b-rlv">',
                '<div title="关闭" id="alert_dialog_close" class="dlg-cnr dlg-cnr-r"></div>',
                '<h3>提示</h3>',
                '</div>',
                '<div class="dlg-bd">',
                '<div class="alert-dialog-msg center">',
                '<div class="download-verify">',
                '<div class="verify-body">请输入验证码：<input id="verification" type="text" class="input-code" maxlength="4">',
                '<img id="vcode" class="img-code" alt="验证码获取中"  width="100" height="30">',
                '<a href="javascript:;" class="underline" id="change">换一张</a>',
                '</div>',
                '<div class="verify-error">',
                (json.auth ? "\u9a8c\u8bc1\u7801\u8f93\u5165\u9519\u8bef\uff0c\u8bf7\u91cd\u65b0\u8f93\u5165" : ""),
                '</div>',
                '</div>',
                '</div>',
                '</div>',
                '<div class="dlg-ft b-rlv">',
                '<div class="alert-dialog-commands clearfix center">',
                '<a href="javascript:;" id="okay" class="sbtn okay"><b>确定</b></a>',
                '<a href="javascript:;" id="ignore" class="dbtn cancel"><b>取消</b></a>',
                '</div>',
                '</div>'
            ];
            div.html(html.join(""));
            div.appendTo($("body"));
            div.find("*[id]").each(function(index, element) {
                $(element).attr("id", $(element).attr("id") + id);
            });
            div.show();
            var offset = new Date().getTime().toString().slice(-2);
            var screenWidth = $(window).width(), screenHeight = $(window).height();
            var scrolltop = $(document).scrollTop();
            var divLeft = (screenWidth - div.width()) / 2 + parseInt(offset);
            var divTop = (screenHeight - div.height()) / 2 + scrolltop - parseInt(offset);
            div.css({left: divLeft + "px", top: divTop + "px", "z-index": 2000});
            $("#vcode" + id).attr("src", json.vcode_img);
            $("#change" + id).unbind().click(function() {
                var url = "//vcode.baidu.com/genimage";
                $("#vcode" + id).attr("src", url + "?" + json.vcode_str + "&" + new Date().getTime());
            });
            $("#okay" + id).unbind().click(function() {
                var input_code = $("#verification" + id).attr("value");
                var data = params + "&vcode_input=" + input_code + "&vcode_str=" + json.vcode_str;
                self.getFilemetas(data);
                div.remove();
            });
            $("#ignore" + id).unbind().click(function() {
                div.remove();
                setMessage("\u5509\u002e\u002e\u002e\u002e\u002e", "MODE_CAUTION");
            });
            $("#alert_dialog_close" + id).unbind().click(function() {
                div.remove();
            });
        },
        //根据文件路径获取文件的信息
        getFilemetas:function(data){
            var self = this;  
            var download = "//" + window.location.host + "/api/sharedownload?channel=chunlei&clienttype=0&web=1&app_id="+yunData.FILEINFO[0].app_id + "&timestamp=" + yunData.TIMESTAMP + "&sign=" + yunData.SIGN + "&bdstoken=" + yunData.MYBDSTOKEN;
            var pic="//" + window.location.host + "/api/getcaptcha?prod=share&channel=chunlei&clienttype=0&web=1&bdstoken="+yunData.MYBDSTOKEN+"&app_id="+yunData.FILEINFO[0].app_id;
            var parameter = {'url': download, 'dataType': 'json', type: 'POST', 'data': data};
            HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        if (json.errno == -20) {
                            HttpSend({'url':pic,'dataType': 'json',type: 'GET'})
                            .done(function(json, textStatus, jqXHR){
                                if (data.indexOf("input") != -1) {
                                    json.auth = true;
                                }
                                self.alertDialog(json, data);
                                setMessage("请输入验证码,以便继续下载", "MODE_CAUTION");
                            })
                            .fail(function(json, textStatus, jqXHR){
                                setMessage("获取验证码失败?", "MODE_FAILURE");
                            });
                           
                        } else if (json.errno == 0) {
                            var file=json.list;
                            for(var i=0;i<file.length;i++){
                                //self.saveConvertFile(file[i].path);
                                self.checkFold(file[i].path.substring(0,file[i].path.lastIndexOf("/")),file[i].path);
                            }
                        } else {
                            console.log(json);
                            setMessage("出现异常!", "MODE_FAILURE");
                        }

                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取地址失败?", "MODE_FAILURE");
                        console.log(jqXHR);
                    });
        },
        //生成请求参数 发送给后台 进行 http请求
        generateParameter:function(rpc_list){
            var paths=CORE.parseAuth(RPC_PATH);
            for(var i=0;i<rpc_list.length;i++){
                var parameter = {'url': paths[1], 'dataType': 'json', type: 'POST', data: JSON.stringify(rpc_list[i]), 'headers': {'Authorization': paths[0]}};
                CONNECT.sendToBackground("rpc_data",parameter);
            }

        },
        //得到当前文件夹的路径
        getCurrentPath:function(){
            var API = (require("common:widget/restApi/restApi.js"),require("common:widget/hash/hash.js"));
            var path=API.get("path");
            if(path == null){
                path="/";
            }else{
                path+="/";
            }
            return path;
        }

    }
})();
setTimeout(function(){
    CONVERT.init();
},800);