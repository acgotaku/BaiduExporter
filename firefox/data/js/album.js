var ALBUM =(function(){
    //网盘分享页面导出
    /*
    基本步骤是首先设定导出模式,文本模式的话
    只需要初始化文本框即可,RPC模式要设置好 RPC地址
    然后开始分析选中的文件 获取当前文件夹的所以文件id
    然后进行比较,如果是文件 直接进行下载 如果是文件夹则递归查找
    遇到文件就下载 遇到文件夹继续获取文件夹里面的内容

    */
    var setMessage =CORE.setMessage;
    //两种导出模式 RPC模式 和 TXT模式
    var MODE="RPC";
    var RPC_PATH="http://localhost:6800/jsonrpc";
    var FileList=null;
    return {
        //绑定事件
        init:function(){
            var menu=CORE.addMenu.init("album");
            var self=this;
            self.getALLFileList();
            CORE.requestCookies([{"site": "http://pan.baidu.com", "name": "BDUSS"},{"site": "http://pcs.baidu.com", "name": "pcsett"}]);
            menu.on("click",".rpc_export_list",function(){
                MODE="RPC";
                RPC_PATH=$(this).attr('data-id');
                self.getShareFile();

            });
            menu.on("click","#aria2_download",function(){
                MODE="TXT";
                CORE.dataBox.init("share").show();
                self.getShareFile();
            });
        },
        //获得全部文件的信息
        getALLFileList:function(){
            var album_id=(disk.ui.album.albuminfo && disk.ui.album.albuminfo.album_id) || disk.getParam("album_id") ;
            var query_uk= (disk.ui.album.uinfo && disk.ui.album.uinfo.uk) || disk.getParam("uk") || disk.getParam("query_uk") ;
            var url = "//"+window.location.host+disk.ui.album.RestAPI.listFile + "?album_id=" + album_id+ "&query_uk=" + query_uk + "&start=" + ($(".page-input").eq(0).val() - 1) * 60 + "&limit=" + 60;
            var parameter = {'url': url, 'dataType': 'json', type: 'GET'};
            CONNECT.HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        setMessage("初始化成功!", "MODE_SUCCESS");
                        FileList=json.list;
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取全部列表失败!", "MODE_FAILURE");
                        console.log(jqXHR);
                    });  
        },
        //获得选中的文件
        getShareFile:function(){
            var self = this;
            var file_info = $("#fileItems .on");
            if (file_info.length == 0) {
                setMessage("先选择一下你要下载的文件哦", "MODE_CAUTION");
                return;
            }
            var file_list=[];
            for(var i = 0; i < file_info.length; i++){
                var num = file_info.eq(0).attr("_position");
                file_list.push({"name":FileList[num].server_filename,"link":FileList[num].dlink});
            }
            if(MODE =="TXT"){
                CORE.dataBox.fillData(file_list);
            }else{
                var token=CORE.parseAuth(RPC_PATH)[0];
                var rpc_list =CORE.aria2Data(file_list,token);
                self.generateParameter(rpc_list);
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

        //生成请求参数 发送给后台 进行 http请求
        generateParameter:function(rpc_list){
            var paths=CORE.parseAuth(RPC_PATH);
            for(var i=0;i<rpc_list.length;i++){
                var parameter = {'url': paths[1], 'dataType': 'json', type: 'POST', data: JSON.stringify(rpc_list[i]), 'headers': {'Authorization': paths[0]}};
                CONNECT.sendToBackground("rpc_data",parameter);
            }

        }

    }
})();
setTimeout(function(){
    ALBUM.init();
},600);