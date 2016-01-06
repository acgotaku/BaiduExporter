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
    var info = null;
    return {
        //绑定事件
        init:function(){
            var menu=CORE.addMenu.init("album");
            var self=this;
            info = disk.ui.album != undefined ? true : false;
            self.getALLFileList();
            CORE.requestCookies([{"site": "http://pan.baidu.com/", "name": "BDUSS"},{"site": "http://pcs.baidu.com/", "name": "pcsett"}]);
            menu.on("click",".rpc_export_list",function(){
                MODE="RPC";
                RPC_PATH=$(this).attr('data-id');
                if(info){
                    self.getShareFile();
                }else{
                    self.getFilemetas();
                }
                

            });
            menu.on("click","#aria2_download",function(){
                MODE="TXT";
                CORE.dataBox.init("share").show();
                if(info){
                    self.getShareFile();
                }else{
                    self.getFilemetas();
                }
            });
        },
        
        getFilemetas:function(){
            var self = this;
            var file_list=[];
            file_list.push({"name":FileList.server_filename,"link":FileList.dlink}); 
            self.selectMode(file_list);

        },
        //获得全部文件的信息
        getALLFileList:function(){
            var album_id=disk.getParam("album_id") ;
            var query_uk= disk.getParam("uk") ;
            var url = null;
            if(info){
                url = "//"+window.location.host+disk.ui.album.RestAPI.listFile + "?album_id=" + album_id+ "&query_uk=" + query_uk + "&start=" + ($(".page-input").eq(0).val() - 1) * 60 + "&limit=" + 60;
            }else{
               FileList = JSON.parse(disk.util.ViewShareUtils.viewShareData);
               return;
            }
            
            var parameter = {'url': url, 'dataType': 'json', type: 'GET'};
            CONNECT.HttpSend(parameter)
                    .done(function(json, textStatus, jqXHR) {
                        setMessage("初始化成功!", "MODE_SUCCESS");
                        FileList=json.list;
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        setMessage("获取全部列表失败!", "MODE_FAILURE");
                        console.log(textStatus);
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
                var num = file_info.eq(i).attr("_position");
                file_list.push({"name":FileList[num].server_filename,"link":FileList[num].dlink});
            }
            self.selectMode(file_list);
        },
        selectMode:function(file_list){
            if(MODE =="TXT"){
                CORE.dataBox.fillData(file_list);
            }else{
                var token=CORE.parseAuth(RPC_PATH)[0];
                var rpc_list =CORE.aria2Data(file_list,token);
                self.generateParameter(rpc_list);
            }
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