var HOME =function(){
    //网盘主页导出
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
    var encode = new Function("return " + yunData.sign2)();
    var sign = btoa(encode(yunData.sign3, yunData.sign1)) ;
    var list = require("system-core:context/context.js").instanceForSystem.list;
    return {
        //绑定事件
        init:function(){
            var menu=CORE.addMenu.init("home");
            var self=this;
            CORE.requestCookies([{"site": "http://pan.baidu.com/", "name": "BDUSS"},{"site": "http://pcs.baidu.com/", "name": "pcsett"}]);
            var rpcList = $(".rpc_export_list");
            for (var i = rpcList.length - 1; i >= 0; i--) {
                rpcList[i].addEventListener("click",function() {
                    MODE="RPC";
                    RPC_PATH=$(this).attr("data-id");
                    console.log(RPC_PATH);
                    self.getSelectFile();
                });
            }
            $("#aria2_download")[0].addEventListener("click",function() {
                MODE="TXT";
                CORE.dataBox.init("home").show();
                self.getSelectFile();
            });
            setMessage("初始化成功!", "success");
        },
        //获得选中的文件
        getSelectFile:function(){
            var self=this;
            var selectedFile = list.getSelected();
            var length = selectedFile.length;
            if (length == 0) {
                setMessage("先选择一下你要下载的文件哦", "failure");
                return;
            }
            for (var i = 0; i < length; i++) {
                if (selectedFile[i].isdir == 1) {
                    self.getSelectFold(selectedFile[i].fs_id);
                }else{
                    self.getFileById(selectedFile[i].fs_id,selectedFile[i].server_filename);
                }
            }
        },
        //获取选择的文件夹
        getSelectFold:function(fs_id){
            var self=this;
            var params= new URLSearchParams();
            params.append("order","time");
            params.append("desc","1");
            params.append("showempty","0");
            params.append("web","1");
            params.append("page","1");
            params.append("num","1000");
            params.append("dir",self.getCurrentPath());
            params.append("bdstoken",yunData.MYBDSTOKEN);
            params.append("type","dlink");
            params.append("channel","chunlei");
            params.append("app_id","250528");
            params.append("clienttype","0");
            var parameter = {url: "//"+window.location.host+"/api/list?"+params.toString(), dataType: "json", type: "GET"};
            CONNECT.HttpSend(parameter)
            .done(function(json, textStatus, jqXHR) {
                setMessage("获取列表成功!", "success");
                var array=json.list;
                for(var i=0;i<array.length;i++){
                    if(array[i].fs_id == fs_id){
                        if(array[i].isdir == 1){
                            self.getRecursiveFold(array[i].path);
                        }else{
                            self.getFileById(array[i].fs_id,array[i].server_filename,array[i].path);
                        }
                    }
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                setMessage("获取List失败!", "failure");
                console.log(jqXHR);
            });
        },
        //递归获取选中文件夹的内容
        getRecursiveFold:function(path){
            var time=0;
            var self=this;
            var delay=parseInt(localStorage.getItem("rpc_delay"))||0;
            var params= new URLSearchParams();
            params.append("order","time");
            params.append("desc","1");
            params.append("showempty","0");
            params.append("web","1");
            params.append("page","1");
            params.append("num","1000");
            params.append("dir",path);
            params.append("bdstoken",yunData.MYBDSTOKEN);
            params.append("type","dlink");
            params.append("channel","chunlei");
            params.append("app_id","250528");
            params.append("clienttype","0");

            var parameter = {url: "//"+window.location.host+"/api/list?"+params.toString(), dataType: "json", type: "GET"};
            CONNECT.HttpSend(parameter)
            .done(function(json, textStatus, jqXHR) {
                var array=json.list;
                console.log(json);
                for(var i=0;i<array.length;i++){
                    var path=array[i].path;
                    time=time+delay;
                    if(array[i].isdir == 1){
                        delayLoopList(path,time);
                    }else{
                        delayLoopFile(array[i].fs_id, array[i].server_filename,array[i].path ,time);
                    }
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                setMessage("获取List失败! code:92", "failure");
                console.log(jqXHR);
            });
            function delayLoopList(path,time){
                setTimeout(function(){
                    self.getRecursiveFold(path);
                },time);

            }
            function delayLoopFile(fs_id,server_filename,path,time){
                setTimeout(function(){
                    self.getFileById(fs_id,server_filename,path);
                },time);
            }
        },
        //根据文件路径获取文件的信息
        getFileById:function(fs_id,file_name,file_path){
            var self=this;
            var params= new URLSearchParams();
            params.append("sign",sign);
            params.append("timestamp",yunData.timestamp);
            params.append("fidlist",("["+fs_id +"]"));
            params.append("bdstoken",yunData.MYBDSTOKEN);
            params.append("type","dlink");
            params.append("channel","chunlei");
            params.append("web","1");
            params.append("app_id","250528");
            params.append("clienttype","0");
            var curr_path=self.getCurrentPath();
            if(curr_path == null || curr_path =="/"){
                curr_path="";
            }
            var parameter = {url: "//"+window.location.host+"/api/download?" + params.toString() , dataType: "json", type: "GET"};
            console.log(parameter);
            CONNECT.HttpSend(parameter)
            .done(function(json, textStatus, jqXHR) {
                setMessage("获取文件信息成功!", "success");
                var file=json.dlink;
                var file_list = [];
                //备用下载地址
              //  var dlink ="http://"+"d.pcs.baidu.com"+"/rest/2.0/pcs/file?app_id=250528&method=download&check_blue=1&ec=1&path="+encodeURIComponent(target)+"&psl=216&taskcount=1&urlcount=3&p2sspd=86016";

                    //这里文件名的操作是为了下载到相应的路径中去
                var name = file_path == undefined ? file_name :file_path.slice(curr_path.length+1,file_path.length);
                file_list.push({"name":self.getPath() + name, "link":file[0].dlink});
                if(MODE =="TXT"){
                    CORE.dataBox.fillData(file_list);
                }else{
                    var paths=CORE.parseAuth(RPC_PATH);
                    var rpc_list =CORE.aria2Data(file_list,paths[0], paths[2]);
                    self.generateParameter(rpc_list);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                setMessage("获取File失败!", "failure");
                console.log(jqXHR);
            });
        },
        getFilemetas:function(target){
            var self=this;
            var path=self.getCurrentPath();
            if(path == null || path =="/"){
                path="";
            }
            var parameter = {url: "//"+window.location.host+"/api/filemetas?target="+encodeURIComponent("["+JSON.stringify(target)+"]")+"&dlink=1&bdstoken="+yunData.MYBDSTOKEN+"&channel=chunlei&clienttype=0&web=1", dataType: "json", type: "GET"};
            console.log(parameter);
            CONNECT.HttpSend(parameter)
            .done(function(json, textStatus, jqXHR) {
                setMessage("获取文件信息成功!", "success");
                var file=json.info;
                var file_list = [];
                //备用下载地址
                var dlink ="http://"+"d.pcs.baidu.com"+"/rest/2.0/pcs/file?app_id=250528&method=download&check_blue=1&ec=1&path="+encodeURIComponent(target)+"&psl=216&taskcount=1&urlcount=3&p2sspd=86016";

                for(var i=0;i<file.length;i++){
                    //这里文件名的操作是为了下载到相应的路径中去
                    file_list.push({"name":self.getPath() + file[i].path.slice(path.length+1,file[i].path.length), "link":file[i].dlink});
                }
                if(MODE =="TXT"){
                    CORE.dataBox.fillData(file_list);
                }else{
                    var paths=CORE.parseAuth(RPC_PATH);
                    var rpc_list =CORE.aria2Data(file_list,paths[0], paths[2]);
                    self.generateParameter(rpc_list);
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                setMessage("获取File失败!", "failure");
                console.log(jqXHR);
            });
        },
        //生成请求参数 发送给后台 进行 http请求
        generateParameter:function(rpc_list){
            var paths=CORE.parseAuth(RPC_PATH);
            for(var i=0;i<rpc_list.length;i++){
                var parameter = {url: paths[1], dataType: "json", type: "POST", data: JSON.stringify(rpc_list[i]), headers: {Authorization: paths[0]}};
                CONNECT.sendToBackground("rpc_data",parameter);
            }
        },
        //根据设置 获取文件名前面需要的文件夹路径
        getPath:function(){
            var self =this;
            var level=parseInt(localStorage.getItem("rpc_fold"))||0;
            var path=self.getCurrentPath();
            var maxlevel=0;
            if(path == "/"|| path == null){
                path="";
            }else{
                maxlevel=path.split("/").length-1;
            }
            if(level>maxlevel){
                setMessage("文件夹层数超过完整路径", "MODE_CAUTION");
                level=maxlevel;
            }
            if(level == -1){
                path=path+"/";
            }else if(level>0){
                var num=[];
                for(var i=0;i<level;i++){
                    num.push(".*");
                }
                var re = new RegExp(".*\/("+num.join("\/")+")$");
                path=path.match(re)[1]+"/";
            }else if(level==0){
                path="";
            }
            return path;
        },
        //得到当前文件夹的路径
        getCurrentPath:function(){

            return list.getCurrentPath();
        }

    };
}();
setTimeout(function(){
    HOME.init();
},600);

