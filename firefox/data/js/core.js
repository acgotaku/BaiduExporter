var CORE=(function(){
    const defaultUA ="netdisk;5.3.4.5;PC;PC-Windows;5.1.2600;WindowsBaiduYunGuanJia";
    const defaultreferer="http://pan.baidu.com/disk/home";
    const version = "0.6.0";
    const update_date = "2015/12/24";
    var cookies=null;
    var newVersion = typeof manifest == "object" ? true : false;
    return {
        init:function(){

        },
        //封装的百度的Toast提示消息
        //Type类型有
        //caution  警告  failure  失败  loading 加载 success 成功
        //MODE_CAUTION  警告  MODE_FAILURE  失败  MODE_LOADING 加载 MODE_SUCCESS 成功
        setMessage:function(msg, type) {
        if(typeof require=="undefined"){
           Utilities.useToast({
                toastMode: disk.ui.Toast[type],
                msg: msg,
                sticky: false
            });
        }else{
            if(newVersion){
                var Toast = require("disk-system:widget/context/context.js").instanceForSystem;
                if(type.startsWith("MODE")){
                    type=type.split("_")[1].toLowerCase();
                }
                Toast.ui.tip({
                    mode: type,
                    msg: msg
                }); 
            }else{
                var Toast = require("common:widget/toast/toast.js");
                Toast.obtain.useToast({
                    toastMode: Toast.obtain[type],
                    msg: msg,
                    sticky: false
                });            
            }           
        }

        },
        // 将文件名用单引号包裹，并且反转义文件名中所有单引号，确保按照文件名保存
        escapeString:function(str){
            if(navigator.platform.indexOf("Win") != -1){
                return str;
            }

            var result = "'" + str.replace("'", "'\\''") + "'";
            return result;
        },
        //解析 RPC地址 返回验证数据 和地址
        parseAuth:function(url){
            var auth_str = request_auth(url);
            if (auth_str) {
                if(auth_str.indexOf('token:') != 0){
                    auth_str = "Basic " + btoa(auth_str);
                }  
            }
            url=remove_auth(url);
            function request_auth(url) {
                return url.match(/^(?:(?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(?:\/\/)?(?:([^:@]*(?::[^:@]*)?)?@)?/)[1];
            }
            function remove_auth(url) {
                return url.replace(/^((?![^:@]+:[^:@\/]*@)[^:\/?#.]+:)?(\/\/)?(?:(?:[^:@]*(?::[^:@]*)?)?@)?(.*)/, '$1$2$3');
            }
            return [auth_str,url];
        },
        //names format  [{"site": "http://pan.baidu.com/", "name": "BDUSS"},{"site": "http://pcs.baidu.com/", "name": "pcsett"}]
        requestCookies:function(names){
            CONNECT.sendToBackground("get_cookies",names);
        },
        setCookies:function(value){
            cookies=value;
        },
        //获取 http header信息
        getHeader:function(type){
            var addheader = [];
            var UA =localStorage.getItem("UA") || defaultUA;
            var headers = localStorage.getItem("headers");
            var referer = localStorage.getItem("referer") || defaultreferer;
            addheader.push("User-Agent: " + UA);
            addheader.push("Referer: " + referer);
            if (headers) {
                var text = headers.split("\n");
                for (var i = 0; i < text.length; i++) {
                    addheader.push(text[i]);
                }
            }
            if(cookies){
                var baidu_cookies=cookies;
                var format_cookies=[];
                for(var i=0;i<baidu_cookies.length;i++){
                    for(var key in baidu_cookies[i]){
                        format_cookies.push(key +"=" +baidu_cookies[i][key]);
                    }
                }
                addheader.push("Cookie: " + format_cookies.join(";"));
            }

            var header = "";
            if (type == "aria2c_line") {
                for (var i = 0; i < addheader.length; i++) {
                    header += " --header " + JSON.stringify(addheader[i]) + " ";
                }
                return header;
            } else if (type == "aria2c_txt") {
                for (var i = 0; i < addheader.length; i++) {
                    header += " header=" + (addheader[i]) + " \n";
                }
                return header;
            } else if (type == "idm_txt") {
                for (var i = 0; i < addheader.length; i++) {
                    header += " header=" + (addheader[i]) + " \n";
                }
                return header;
            } else {
                return addheader;
            }

        },
        //调整元素的位置使元素居中
        setCenter:function(obj){
                var screenWidth = $(window).width(), screenHeight = $(window).height();
                var scrolltop = $(document).scrollTop();
                var objLeft = (screenWidth - obj.width())/2 ;
                var objTop = (screenHeight - obj.height())/2 + scrolltop;
                obj.css({left: objLeft + 'px', top: objTop + 'px'});
        },
        //导出菜单
        addMenu:{
            init:function(type){
                if($("#export_menu").length != 0){
                    return $("#export_menu");
                }
                var aria2_btn = $("<span>").attr("id","export_menu");
                var list = $("<div>").addClass("menu").attr("id", "aria2_list").css("display", "none").appendTo(aria2_btn);
                var aria2_download = $("<a>").text("导出下载").addClass("g-button-menu").attr("id", "aria2_download").appendTo(list);
                var config = $("<a>").text("设置").addClass("g-button-menu").appendTo(list);
                if(type == "home"){           
                    if(newVersion){
                        aria2_btn.addClass("g-dropdown-button button-open").prepend($("<a>").addClass("g-button").attr("href","javascript:void(0);").append($("<span>").addClass("g-button-right").append($("<em>").addClass("icon icon-device-tool").after($("<span>").addClass("text").text("导出下载")))));
                        $(".g-dropdown-button").eq(3).after(aria2_btn);
                    }else{
                        aria2_btn.addClass("icon-btn-device").append($("<span>").text("导出下载").addClass("text").before($("<span>").addClass("ico")).after($("<span>").addClass("ico-more")));
                        $(".icon-btn-device").after(aria2_btn);
                    }              
                }else if (type == "share"){
                    aria2_btn.addClass("save-button").append('<em class="global-icon-download"></em><b>导出下载</b>');
                    $('span a[class="new-dbtn"]').parent().prepend(aria2_btn);
                }else if(type == "album"){
                    aria2_btn.addClass("save-button").append('<em class="global-icon-download"></em><b>导出下载</b>');
                    $("#albumFileSaveKey").parent().prepend(aria2_btn);
                }
                aria2_btn.on("mouseover",function(){
                    list.show();
                });
                aria2_btn.on("mouseout",function(){
                    list.hide();
                });
                config.on("click",function(){
                    if($("#setting_div").length == 0){
                        CORE.setting.init();
                    }
                     $("#setting_div").show();
                });
                this.update();
                return aria2_btn;
            },
            //根据设置更新按钮
            update:function(){
                var self=this;
                $(".rpc_export_list").remove();
                var rpc_list=JSON.parse(localStorage.getItem("rpc_list")||'[{"name":"ARIA2 RPC","url":"http://localhost:6800/jsonrpc"}]');
                while(rpc_list.length > 0){
                    var rpcObj = rpc_list.pop();
                    $("<a class='rpc_export_list'>").addClass("g-button-menu").attr('data-id',rpcObj.url).text(rpcObj.name).prependTo($("#aria2_list"));
                }
            },
        },
        //设置界面
        setting:{
            init:function(){
                var self = this;
                var setting_div = document.createElement("div");
                setting_div.id = "setting_div";
                if($("#setting_div").length != 0){
                    return setting_div.id;
                }
                var html_ = [
                    '<div class="top"><div title="关闭" id="setting_div_close" class="close"></div><h3>导出设置</h3></div>',
                    '<div style=" margin: 20px 10px 10px 10px; ">',
                    '<div id="setting_divtopmsg" style="position:absolute; margin-top: -18px; margin-left: 10px; color: #E15F00;"></div>',
                    '<table id="setting_div_table" >',
                    '<tbody>',
                    '<tr><td><label>文件夹结构层数：</label></td><td><input type="text" id="rpc_fold" class="input-small">(默认0表示不保留,-1表示保留完整路径)</td></tr>',
                    '<tr><td><label>递归下载延迟：</label></td><td><input type="text" id="rpc_delay" class="input-small">(单位:毫秒)<div style="position:absolute; margin-top: -20px; right: 20px;"><a id="send_test" type="0" href="javascript:;" >测试连接，成功显示版本号。</a></div></td></tr>',
                    '<tr><td><label>下载路径:</label></td><td><input type="text" placeholder="只能设置为绝对路径" id="setting_aria2_dir" class="input-large"></td></tr>',
                    '<tr><td><label>User-Agent :</label></td><td><input type="text" id="setting_aria2_useragent_input" class="input-large"></td></tr>',
                    '<tr><td><label>Referer ：</label></td><td><input type="text" id="setting_aria2_referer_input" class="input-large"></td></tr>',
                    '<tr><td colspan="2"><div style="color: #656565;">Headers<label style="margin-left: 65px;">※使用回车分隔每个headers。</label></div><li class="b-list-item separator-1"></li></td></tr>',
                    '<tr><td><label>headers ：</label></td><td><textarea id="setting_aria2_headers" ></textarea></td></tr>',
                    '</tbody>',
                    '</table>',
                    '<div style="margin-top:10px;">',
                    '<div id="copyright">© Copyright <a href="https://github.com/acgotaku/BaiduExporter">雪月秋水 </a><br/> Version:' + version + ' 更新日期: ' + update_date + ' </div>',
                    '<div style="margin-left:50px; display:inline-block"><a href="javascript:;" id="apply" class="button">应用</a><a href="javascript:;" id="reset" class="button">重置</a></div>',
                    '</div>',
                    '</div>'
                ];
                setting_div.innerHTML = html_.join("");
                document.body.appendChild(setting_div);
                $("#setting_divtopmsg").html("");
                self.update();
                $("#setting_div").on("click",function(event){
                    switch(event.target.id){
                        case "setting_div_close":
                            $("#setting_div").hide();
                            break;
                        case "apply":
                            self.save();
                            CORE.addMenu.update();
                            $("#setting_divtopmsg").html("设置已保存.");
                            break;
                        case "reset":
                            localStorage.clear();
                            window.postMessage({ type: "clear_data"}, "*");
                            $("#setting_divtopmsg").html("设置已重置.");
                            self.update();
                            break;
                        case "send_test":
                            CORE.getVersion();
                            break;
                        case "add_rpc":
                        var num=$(".rpc_list").length+1;
                        var row='<tr class="rpc_list"><td width="100"><input id="rpc_name_'+num+'" type="text" value="ARIA2 RPC '+num+'" class="input-medium">：</td><td><input id="rpc_url_'+num+'" type="text" class="input-large"></td></tr>';
                        $(row).insertAfter($(".rpc_list").eq(num-2));
                            break;
                        default:
                            //console.log(event);

                    }
                });
                CORE.setCenter($("#setting_div"));
                return setting_div.id;
            },
            //保存配置数据
            save:function(){
                var config_data={};
                config_data["UA"] = document.getElementById("setting_aria2_useragent_input").value;
                config_data["rpc_delay"] = $("#rpc_delay").val();
                config_data["referer"] = $("#setting_aria2_referer_input").val();
                config_data["rpc_dir"] = $("#setting_aria2_dir").val();
                config_data["rpc_fold"] =  $("#rpc_fold").val();
                config_data["rpc_headers"] = $("#setting_aria2_headers").val();
                var rpc_list=[];
                for(var i=0;i<$(".rpc_list").length;i++){
                    var num=i+1;
                    if($("#rpc_url_"+num).val()!= ""&&$("#rpc_name_"+num).val()!= ""){
                        rpc_list.push({"name":$("#rpc_name_"+num).val(),"url":$("#rpc_url_"+num).val()});
                    }
                }
                config_data["rpc_list"] = JSON.stringify(rpc_list);
                window.postMessage({ type: "config_data", data: config_data}, "*");
            },
            //根据配置数据 更新 设置菜单
            update:function(){
                $("#rpc_delay").val((localStorage.getItem("rpc_delay") || "300"));
                $("#rpc_fold").val((localStorage.getItem("rpc_fold") || "0"));
                $("#setting_aria2_dir").val(localStorage.getItem("rpc_dir"));
                $("#setting_aria2_useragent_input").val(localStorage.getItem("UA") || defaultUA);
                $("#setting_aria2_referer_input").val(localStorage.getItem("referer") || defaultreferer);
                $("#setting_aria2_headers").val(localStorage.getItem("rpc_headers"));
                var rpc_list=JSON.parse(localStorage.getItem("rpc_list")||'[{"name":"ARIA2 RPC","url":"http://localhost:6800/jsonrpc"}]');
                $(".rpc_list").remove();
                for(var i in rpc_list){
                    var num=(+i)+1;
                    var addBtn=1==num?'<a id="add_rpc" href="javascript:;" >ADD RPC</a>':'';
                    var row='<tr class="rpc_list"><td width="100"><input id="rpc_name_'+num+'" type="text" value="'+rpc_list[i]['name']+'" class="input-medium">：</td><td><input id="rpc_url_'+num+'" type="text" class="input-large" value="'+rpc_list[i]['url']+'">'+addBtn+'</td></tr>';
                    if($(".rpc_list").length>0){
                        $(row).insertAfter($(".rpc_list").eq(num-2));
                    }else{
                        $(row).prependTo($("#setting_div_table>tbody"));
                    }
                }
            }
        },
        //获取aria2c的版本号用来测试通信
        getVersion: function() {
            var data = {
                "jsonrpc": "2.0",
                "method": "aria2.getVersion",
                "id": 1,
                "params": []
            };
            var rpc_path = $("#rpc_url_1").val();
            var paths=CORE.parseAuth(rpc_path);
            if (paths[0]) {
                data.params.unshift(paths[0]);
            }
            var parameter = {'url': paths[1], 'dataType': 'json', type: 'POST', data: JSON.stringify(data), 'headers': {'Authorization': paths[0]}};
            CONNECT.sendToBackground("rpc_version",parameter);
        },
        //把要下载的link和name作为数组对象传过来
        aria2Data:function(file_list,token){
            var rpc_list=[];
            var self=this;
            if (file_list.length > 0) {
                var length = file_list.length;
                for (var i = 0; i < length; i++) {
                    var rpc_data = {
                        "jsonrpc": "2.0",
                        "method": "aria2.addUri",
                        "id": new Date().getTime(),
                        "params": [[file_list[i].link], {
                                "out": file_list[i].name,
                                "dir":localStorage.getItem("rpc_dir")||null,
                                "header": self.getHeader()
                            }
                        ]
                    };
                    if (token && token.indexOf('token:') == 0) {
                        rpc_data.params.unshift(token);
                    }
                    rpc_list.push(rpc_data);
                }
            }
            return rpc_list;
        },
        //文本模式的导出数据框
        dataBox:{
            init:function(type){
                if ($("#download_ui").length == 0) {
                    var download_ui = $("<div>").attr("id", "download_ui").append('<div class="top"><a href="javascript:;" title="关闭" id="aria2_download_close" class="close"></a><h3><em></em>ARIA2导出</h3></div>');
                    var content_ui = $("<div>").addClass("content").attr("id", "content_ui").appendTo(download_ui);
                    download_ui.appendTo($("body"));
                    content_ui.empty();
                    var download_menu = $("<div>").css({"margin-bottom": "10px"}).appendTo(content_ui);
                    var aria2c_btn = $("<a>").attr("id", "aria2c_btn").attr({"href": "data:text/plain;charset=utf-8,", "download": "aria2c.down", "target": "_blank"}).addClass("save-button ").html('<em class="global-icon-download"></em><b>存为aria2文件</b>').appendTo(download_menu);
                    var idm_btn = $("<a>").attr("id", "idm_btn").attr({"href": "data:text/plain;charset=utf-8,", "download": "idm.txt", "target": "_blank"}).addClass("save-button ").html('<em class="global-icon-download"></em><b>存为IDM文件</b>').appendTo(download_menu);
                    var download_txt_btn = $("<a>").attr("id", "download_txt_btn").attr({"href": "data:text/plain;charset=utf-8,", "download": "download_link.txt", "target": "_blank"}).addClass("save-button ").html('<em class="global-icon-download"></em><b>保存下载链接</b>').appendTo(download_menu);
                    var download_link = $("<textarea>").attr("wrap", "off").attr("id", "download_link").css({ "width": "100%", "overflow": "scroll", "height": "180px"}).appendTo(content_ui);
                    CORE.setCenter($("#download_ui"));
                    $("#download_ui").on("click","#aria2_download_close",function(){
                        download_ui.hide();
                    });
                }else{
                    $("#aria2c_btn, #idm_btn, #download_txt_btn").attr("href", "data:text/plain;charset=utf-8,");
                    $("#download_link").val("");
                }
                return this;
            },
            show:function(){
                $("#download_ui").show();
            },
            //在数据框里面填充数据
            fillData:function(file_list){
                var files = [];
                var aria2c_txt = [];
                var idm_txt = [];
                var down_txt = [];
                if (file_list.length > 0) {
                    var length = file_list.length;
                    for (var i = 0; i < length; i++) {
                        filename = (navigator.platform.indexOf("Win") != -1) ? JSON.stringify(file_list[i].name) : CORE.escapeString(file_list[i].name);
                        files.push("aria2c -c -s10 -k1M -x10 -o " + filename + CORE.getHeader('aria2c_line') + " " + JSON.stringify(file_list[i].link) + "\n");
                        aria2c_txt.push([
                            file_list[i].link,
                            CORE.getHeader("aria2c_txt"),
                            ' out=' + file_list[i].name,
                            ' continue=true',
                            ' max-connection-per-server=10',
                            '  split=10',
                            '\n'
                        ].join('\n'));
                        idm_txt.push([
                            '<',
                            file_list[i].link,
                            ' out=' + file_list[i].name,
                            ' >'
                        ].join('\r\n'));
                        down_txt.push([file_list[i].link, ' '].join('\n'));
                    }
                    $("#aria2c_btn").attr("href", $("#aria2c_btn").attr("href") + encodeURIComponent(aria2c_txt.join("")));
                    $("#idm_btn").attr("href", $("#idm_btn").attr("href") + encodeURIComponent(idm_txt.join("")));
                    $("#download_txt_btn").attr("href", $("#download_txt_btn").attr("href") + encodeURIComponent(down_txt.join("")));
                    $("#download_link").val($("#download_link").val() + files.join(""));
                }
            }
        },


    }
})();
